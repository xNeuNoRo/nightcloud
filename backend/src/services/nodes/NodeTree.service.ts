import pLimit, { LimitFunction } from "p-limit";
import path from "node:path";
import { DB } from "@/config/db";
import { NodeUtils } from "@/utils";
import { DirectoryNode, FileNode, Node } from "@/domain/nodes/node";
import { DescendantRow } from "@/infra/prisma/types";
import { NodeRepository } from "@/repositories/NodeRepository";
import { NodeIdentityService } from "./NodeIdentity.service";
import { PrismaTxClient } from "@/types/prisma";
import { fromDescendantRow } from "@/infra/mappers/node.mapper";
import { CloudStorageService } from "../cloud/CloudStorage.service";

export class NodeTreeService {
  private static readonly repo = NodeRepository;
  private static readonly identity = NodeIdentityService;
  private static readonly prisma = DB.getClient();
  private static readonly cloud = CloudStorageService;

  /**
   * @description Copia un directorio y su contenido (archivos y subdirectorios) dentro de la base de datos y el almacenamiento en la nube
   * @param node Nodo de directorio a copiar
   * @param parentId ID del nodo padre donde se ubicará el directorio copiado
   * @param options Opciones adicionales (nuevo nombre propuesto, concurrencia)
   * @returns Nodos copiados
   */
  static async copyNodeDir(
    node: Node,
    parentId: string | null,
    options?: { newName?: string; concurrency?: number },
  ) {
    const limit = pLimit(options?.concurrency ?? 5); // Limitar concurrencia

    const { nodeName, nodeHash } = await this.identity.resolve(
      node,
      parentId,
      options?.newName
        ? {
            newName: options.newName,
          }
        : undefined,
    );

    // Transaccion para "copiar" el nodo en la base de datos

    return await this.prisma.$transaction(async (tx) => {
      // Crear el nodo de la carpeta copiada
      const copiedDir = await this.repo.createTx(tx, {
        name: nodeName,
        parent: parentId ? { connect: { id: parentId } } : undefined,
        hash: nodeHash,
        size: node.size,
        mime: node.mime,
        isDir: node.isDir,
      });

      // Almacenar el nodo copiado
      const nodesToCopy = await this.repo.getAllNodeDescendantsTx(tx, node.id);

      // Preparar las carpetas a crear
      const directories = nodesToCopy.filter((n) => n.isDir && n.depth > 0); // Excluir la raiz

      // Copiar la estructura de directorios primero
      const dirMap = await this.copyNodeDirTree(tx, directories, {
        oldId: node.id,
        newId: copiedDir.id,
      });

      // Filtrar solo los archivos para copiarlos
      const files = nodesToCopy.filter((n) => !n.isDir);

      // Copiar los archivos dentro de la estructura creada
      const copiedNodes = await this.copyNodeFileTree(tx, files, limit, dirMap);

      // Si tiene padre, propagar el tamaño de todos los ancestros que haya
      if (copiedDir.parentId)
        await this.repo.propagateSizeToAncestorsTx(
          tx,
          copiedDir.parentId,
          copiedDir.size,
          "increment",
        );

      return copiedNodes;
    });
  }

  /**
   * @description Copia la estructura de directorios de un árbol de nodos en la base de datos
   * @param tx Transacción de Prisma
   * @param directories Directorios a copiar
   * @param parentData Datos del nodo padre original y nuevo
   * @returns Mapa de directorios antiguos a nuevos
   */
  static async copyNodeDirTree(
    tx: PrismaTxClient,
    directories: DescendantRow[],
    parentData: { oldId: Node["id"]; newId: Node["id"] },
  ) {
    // Mapa para rastrear los IDs nuevos de las carpetas copiadas
    const dirMap = new Map<DescendantRow["id"], Pick<DescendantRow, "id">>([
      [parentData.oldId, { id: parentData.newId }],
    ]);

    await NodeUtils.forEachDepthLevel(directories, async (depthNodes) => {
      const nodesToCreate: DirectoryNode[] = [];
      // Procesar todos los nodos en este nivel de profundidad
      for (const dirNode of depthNodes) {
        const id = crypto.randomUUID() as string;

        const parent = dirMap.get(dirNode.parentId!);
        dirMap.set(dirNode.id, {
          id,
        });

        nodesToCreate.push({
          id,
          parentId: parent ? parent.id : null,
          name: dirNode.name,
          hash: NodeUtils.genDirectoryHash(
            dirNode.name,
            parent ? parent.id : null,
          ),
          size: dirNode.size,
          mime: "inode/directory",
          isDir: true,
        });
      }

      await this.repo.createManyTx(tx, nodesToCreate);
    });

    return dirMap;
  }

  /**
   * @description Copia los archivos de un árbol de nodos en la base de datos y en el almacenamiento en la nube
   * @param tx Transacción de Prisma
   * @param files Archivos a copiar
   * @param limit Función de limitación de concurrencia
   * @param dirMap Mapa de directorios antiguos a nuevos
   * @returns Nodos copiados
   */
  static async copyNodeFileTree(
    tx: PrismaTxClient,
    files: DescendantRow[],
    limit: LimitFunction,
    dirMap: Map<Node["id"], { id: Node["id"] }>,
  ) {
    const cloudRoot = await this.cloud.getCloudRootPath();
    const copiedNodes: Node[] = []; // Almacenar los nodos copiados

    // Ahora copiar todos los nodos (archivos) concurrentemente
    const copyPromises = files.map((n) => {
      return limit(async () => {
        // Mapear el nodo hijo
        const childNode = fromDescendantRow(n);
        const parent = dirMap.get(childNode.parentId!)!;
        console.log(
          `Copying child node: ${childNode.name} under parent: ${parent.id}`,
        );

        // Resolver el nuevo nombre y hash para el nodo hijo
        const { nodeName, nodeHash } = await this.identity.resolve(
          childNode,
          parent.id,
        );
        console.log(
          `Child node resolved name: ${nodeName} and hash: ${nodeHash}`,
        );

        console.log(`Copying child node: ${childNode.name} to ${nodeName}`);
        console.log(`Child node hash: ${childNode.hash} to ${nodeHash}`);

        const src = path.resolve(cloudRoot, childNode.hash); // Ruta actual del nodo
        const dest = path.resolve(cloudRoot, nodeHash); // Nueva ruta del nodo copiado

        // Si es un archivo, copiar el archivo en el almacenamiento en la nube
        await CloudStorageService.copy(src, dest);

        console.log(`Copied file in cloud from ${src} to ${dest}`);
        // Crear el nodo hijo copiado en la base de datos
        const newFileNode = await this.repo.createTx(tx, {
          name: nodeName,
          parent: { connect: { id: parent.id } },
          hash: nodeHash,
          size: childNode.size,
          mime: childNode.mime,
          isDir: childNode.isDir,
        });
        console.log(`Created new file node: ${newFileNode.name}`);

        // Almacenar el nodo copiado
        copiedNodes.push(newFileNode);
      });
    });

    // Esperar a que todas las copias terminen
    await Promise.all(copyPromises);

    return copiedNodes;
  }

  /**
   * @description Mueve el archivo de un nodo a una nueva ubicación en el almacenamiento en la nube
   * @param node Nodo a mover
   * @param parentId ID del nodo padre donde se ubicará el archivo movido
   * @param newName Nuevo nombre propuesto para el archivo movido (opcional)
   * @returns Nodo movido
   */
  static async moveNodeFile(
    node: FileNode,
    parentId: string | null,
    newName?: string,
  ) {
    // Si es un archivo y hay un nuevo nombre, asegurarse de que la extension del archivo se mantiene
    if (newName) newName = NodeUtils.ensureNodeExt(newName, node);

    // Asegurarse de que la extension se mantenga igual si es
    const { nodeName, nodeHash } = await this.identity.resolve(node, parentId, {
      newName,
    });

    // Obtener la ruta raiz de la nube
    const cloudRoot = await CloudStorageService.getCloudRootPath();

    // Obtenemos la carpeta root (todavía no hay soporte para carpetas)
    const src = path.resolve(cloudRoot, node.hash); // Ruta actual del nodo
    const dest = path.resolve(cloudRoot, nodeHash); // Nueva ruta del nodo copiado

    // Copiar el archivo en el almacenamiento en la nube
    await CloudStorageService.move(src, dest);

    // Transaccion para "copiar" el nodo en la base de datos
    return await this.prisma.$transaction(async (tx) => {
      // Preparamos un resultado para devolver al frontend, ignorando el hash
      const res = await this.repo.updateIdentityAndParentIdByIdTx(
        tx,
        node.id,
        { newName: nodeName, newHash: nodeHash },
        parentId,
      );

      // Si el nuevo padre no es null (root) y es diferente al actual, actualizar los tamaños de los ancestros
      if (parentId && parentId !== node.parentId) {
        await this.repo.propagateSizeToAncestorsTx(
          tx,
          parentId,
          node.size,
          "increment",
        );

        // Decrementar el tamaño de los ancestros del padre antiguo si no es null (root)
        if (node.parentId) {
          await this.repo.propagateSizeToAncestorsTx(
            tx,
            node.parentId,
            node.size,
            "decrement",
          );
        }
      }

      // Retornamos el nodo copiado
      return res;
    });
  }

  /**
   * @description Adjunta un nodo de archivo existente a una nueva ubicación en la base de datos y en el almacenamiento en la nube
   * @param node Nodo de archivo a adjuntar
   * @param parentId ID del nodo padre donde se ubicará el archivo adjuntado
   * @param newName Nuevo nombre propuesto para el archivo adjuntado (opcional)
   * @returns Nodo adjuntado
   */
  static async attachNodeFile(
    node: FileNode,
    parentId: string | null,
    newName?: string,
  ) {
    // Si es un archivo y hay un nuevo nombre, asegurarse de que la extension del archivo se mantiene
    if (newName) newName = NodeUtils.ensureNodeExt(newName, node);

    // Asegurarse de que la extension se mantenga igual si es
    const { nodeName, nodeHash } = await this.identity.resolve(node, parentId, {
      newName,
    });

    // Obtener la ruta raiz de la nube
    const cloudRoot = await CloudStorageService.getCloudRootPath();

    // Obtenemos la carpeta root (todavía no hay soporte para carpetas)
    const src = path.resolve(cloudRoot, node.hash); // Ruta actual del nodo
    const dest = path.resolve(cloudRoot, nodeHash); // Nueva ruta del nodo copiado

    // Copiar el archivo en el almacenamiento en la nube
    await CloudStorageService.copy(src, dest);

    // Transaccion para "copiar" el nodo en la base de datos
    return await this.prisma.$transaction(async (tx) => {
      // Preparamos un resultado para devolver al frontend, ignorando el hash
      const res = await this.repo.createTx(tx, {
        name: nodeName,
        parent: parentId ? { connect: { id: parentId } } : undefined,
        hash: nodeHash,
        size: node.size,
        mime: node.mime,
        isDir: node.isDir,
      });

      // Si tiene padre, actualizar el tamaño de todos los ancestros que haya
      if (parentId) {
        await this.repo.propagateSizeToAncestorsTx(
          tx,
          parentId,
          node.size,
          "increment",
        );
      }

      // Retornamos el nodo copiado
      return res;
    });
  }
}
