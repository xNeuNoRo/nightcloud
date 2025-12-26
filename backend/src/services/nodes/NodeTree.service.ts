import path from "node:path";
import type { LimitFunction } from "p-limit";
import pLimit from "p-limit";

import { DB } from "@/config/db";
import type { FileNode, Node, NodeLite } from "@/domain/nodes/node";
import { fromDescendantRow } from "@/infra/mappers/node.mapper";
import type { DescendantRow } from "@/infra/prisma/types";
import { NodeRepository } from "@/repositories/NodeRepository";
import type { PrismaTxClient } from "@/types/prisma";
import { AppError, NodeUtils } from "@/utils";

import { NodeIdentityService } from "./NodeIdentity.service";
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
    options?: {
      newName?: string;
      concurrency?: number;
      mode?: "copy" | "move";
    },
    cb?: (tx: PrismaTxClient, descendants: DescendantRow[]) => Promise<void>,
  ) {
    const limit = pLimit(options?.concurrency ?? 5); // Limitar concurrencia

    // Transacción para "copiar" el nodo en la base de datos

    return await this.prisma.$transaction(async (tx) => {
      // Resolver el nuevo nombre y hash para el nodo de directorio
      const { nodeName, nodeHash } = await this.identity.resolveTx(
        tx,
        node,
        parentId,
        options?.newName
          ? {
              newName: options.newName,
            }
          : undefined,
      );

      // Almacenar el nodo copiado
      const nodesToCopy = await this.repo.getAllNodeDescendantsTx(tx, node.id);

      // Asegurarse de que no se está copiando dentro de sí mismo
      if (nodesToCopy.some((n) => n.id === parentId)) {
        throw new AppError(
          "BAD_REQUEST",
          `No se puede ${options?.mode === "move" ? "mover" : "copiar"} un directorio dentro de sí mismo`,
        );
      }

      // Crear el nodo de la carpeta copiada
      const copiedDir = await this.repo.createTx(tx, {
        name: nodeName,
        parent: parentId ? { connect: { id: parentId } } : undefined,
        hash: nodeHash,
        size: node.size,
        mime: node.mime,
        isDir: node.isDir,
      });

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
      const copiedNodes = await this.copyNodeFileTree(
        tx,
        files,
        limit,
        dirMap,
        options?.mode,
      );

      // Si tiene padre, propagar el tamaño de todos los ancestros que haya
      if (copiedDir.parentId)
        await this.repo.propagateSizeToAncestorsTx(
          tx,
          copiedDir.parentId,
          copiedDir.size,
          "increment",
        );

      // Callback opcional después de copiar los nodos
      if (cb) await cb(tx, nodesToCopy);

      return copiedNodes;
    });
  }

  static async moveNodeDir(
    node: Node,
    parentId: string | null,
    options?: { newName?: string; concurrency?: number },
  ) {
    return await this.copyNodeDir(
      node,
      parentId,
      { ...options, mode: "move" },
      async (tx, descendants) => {
        // Eliminar el árbol original después de copiarlo
        const nodeDirIds = descendants
          .filter((n) => n.isDir) // Los archivos no se eliminan porque fueron actualizados en su lugar
          .map((n) => n.id); // Obtener solo los IDs

        await this.repo.deleteManyByIdsTx(tx, nodeDirIds);

        // Si el nodo original tenía padre, decrementar el tamaño de sus ancestros
        if (node.parentId) {
          // Decrementar el tamaño de los ancestros del padre antiguo
          await this.repo.propagateSizeToAncestorsTx(
            tx,
            node.parentId,
            node.size,
            "decrement",
          );
        }
      },
    );
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
      const nodesToCreate: NodeLite[] = [];
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
    mode?: "copy" | "move", // default será "copy"
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
        const { nodeName, nodeHash } = await this.identity.resolveTx(
          tx,
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

        // Transacción para crear o actualizar (mover) el nodo en la base de datos según el modo
        if (mode === "move") {
          console.log(`Moving file node: ${nodeName}`);
          const movedFileNode = await this.repo.updateIdentityAndParentIdByIdTx(
            tx,
            childNode.id,
            { newName: nodeName, newHash: nodeHash },
            parent.id,
          );
          await this.cloud.move(src, dest); // Mover el archivo en la nube
          console.log(`Moved file node: ${movedFileNode.name}`);

          // Almacenar el nodo movido (en realidad copiado)
          copiedNodes.push(movedFileNode);
        } else {
          console.log(`Creating copied file node: ${nodeName}`);
          const newFileNode = await this.repo.createTx(tx, {
            name: nodeName,
            parent: { connect: { id: parent.id } },
            hash: nodeHash,
            size: childNode.size,
            mime: childNode.mime,
            isDir: childNode.isDir,
          });
          await this.cloud.copy(src, dest); // Copiar el archivo en la nube
          console.log(`Created copied file node: ${newFileNode.name}`);

          // Almacenar el nodo copiado
          copiedNodes.push(newFileNode);
        }
      });
    });

    // Esperar a que todas las copias terminen
    await Promise.all(copyPromises);

    return copiedNodes;
  }

  /**
   * @description Mueve un archivo a una nueva ubicación en el almacenamiento en la nube
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

    // Transacción para "mover" el nodo en la base de datos
    return await this.prisma.$transaction(async (tx) => {
      // Asegurarse de que la extension se mantenga igual si es
      const { nodeName, nodeHash } = await this.identity.resolveTx(
        tx,
        node,
        parentId,
        {
          newName,
        },
      );

      // Obtener la ruta raiz de la nube
      const cloudRoot = await this.cloud.getCloudRootPath();

      // Obtenemos la carpeta root
      const src = path.resolve(cloudRoot, node.hash); // Ruta actual del nodo
      const dest = path.resolve(cloudRoot, nodeHash); // Nueva ruta del nodo a mover

      // Preparamos un resultado para devolver al frontend, ignorando el hash
      const res = await this.repo.updateIdentityAndParentIdByIdTx(
        tx,
        node.id,
        { newName: nodeName, newHash: nodeHash },
        parentId,
      );

      // Si el nuevo padre no es null (root) y es diferente al actual, actualizar los tamaños de los ancestros
      if (parentId !== node.parentId) {
        // Decrementar el tamaño de los ancestros del padre antiguo si no es null (root)
        if (node.parentId) {
          await this.repo.propagateSizeToAncestorsTx(
            tx,
            node.parentId,
            node.size,
            "decrement",
          );
        }

        // Incrementar el tamaño de los ancestros del nuevo padre si no es null (root)
        if (parentId) {
          await this.repo.propagateSizeToAncestorsTx(
            tx,
            parentId,
            node.size,
            "increment",
          );
        }
      }

      // Despues de actualizar la base de datos, para mantener la consistencia,
      // Mover el archivo en el almacenamiento en la nube
      await this.cloud.move(src, dest);

      // Retornamos el nodo movido
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

    // Transaccion para "copiar" el nodo en la base de datos
    return await this.prisma.$transaction(async (tx) => {
      // Asegurarse de que la extension se mantenga igual si es
      const { nodeName, nodeHash } = await this.identity.resolveTx(
        tx,
        node,
        parentId,
        {
          newName,
        },
      );

      // Obtener la ruta raiz de la nube
      const cloudRoot = await CloudStorageService.getCloudRootPath();

      // Construimos las rutas absoluta de origen y destino del archivo en la nube
      const src = path.resolve(cloudRoot, node.hash); // Ruta actual del nodo
      const dest = path.resolve(cloudRoot, nodeHash); // Nueva ruta del nodo copiado

      // Copiar el archivo en el almacenamiento en la nube
      await CloudStorageService.copy(src, dest);

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
