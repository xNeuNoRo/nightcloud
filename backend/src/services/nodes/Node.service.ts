import { DB } from "@/config/db";
import type { Node } from "@/domain/nodes/node";
import type { UploadedFile } from "@/domain/uploads/uploaded-file";
import type { Prisma } from "@/infra/prisma/generated/client";
import { NodeRepository } from "@/repositories/NodeRepository";
import type { PrismaTxClient } from "@/types/prisma";
import { AppError, NodeUtils } from "@/utils";

import { NodeIdentityService } from "./NodeIdentity.service";
import { NodePersistenceService } from "./NodePersistence.service";
import { CloudStorageService } from "../cloud/CloudStorage.service";
import { isDirectoryNode } from "@/infra/guards/node";
import { NodeTreeService } from "./NodeTree.service";

/**
 * @description Servicio para gestionar nodos (archivos y directorios).
 */
export class NodeService {
  private static readonly persistence: NodePersistenceService =
    new NodePersistenceService();
  private static readonly cloud = CloudStorageService;
  private static readonly identity = NodeIdentityService;
  private static readonly repo = NodeRepository;
  private static readonly prisma = DB.getClient();

  /**
   * @description Procesa un nodo subido y lo almacena en la nube y la base de datos.
   * @param file nodo subido via Multer
   * @param parentId ID del nodo padre donde se almacenara el nodo
   * @returns Node creado en la base de datos
   */
  static async process(file: UploadedFile, parentId: string | null) {
    try {
      // Resolver nombre y hash unicos
      const { nodeName, nodeHash } = await this.identity.resolve(
        file,
        parentId,
      );

      console.log(`Processing node: ${nodeName}`);

      // Persistir el nodo en la base de datos
      const node = await this.persistence.persist(
        file,
        parentId,
        nodeName,
        nodeHash,
      );

      // Actualizar el tamaño del nodo padre si es una carpeta
      await this.prisma.$transaction(async (tx) => {
        if (parentId) {
          const parentNode = await this.repo.findByIdTx(tx, parentId);
          if (parentNode) {
            await this.incrementNodeSizeByIdTx(tx, parentId, file.size);
          }
        }
      });

      console.log(`Node processed: ${nodeName} as ${nodeHash}`);
      return node;
    } catch (err) {
      console.error(err);
      await this.cloud.delete(file.path); // Limpiar archivo temporal en caso de error
      throw new AppError("INTERNAL", "Error al procesar el nodo");
    }
  }

  /**
   * @description Crea un nuevo nodo en la base de datos.
   * @param nodeData Datos del nodo a crear
   * @returns Nodo creado
   */
  static async createNode(nodeData: Prisma.NodeCreateInput): Promise<Node> {
    return await this.repo.create(nodeData);
  }

  /**
   * @description Obtiene un nodo por su ID.
   * @param nodeId ID del nodo a obtener
   * @returns Nodo obtenido o null si no existe
   */
  static async getNodeById(nodeId: Node["id"]): Promise<Node | null> {
    return await this.repo.findById(nodeId);
  }

  /**
   * @description Crea un nuevo directorio (nodo) en la base de datos
   * @param parentId ID del nodo padre donde se creara la carpeta
   * @param name Nombre de la carpeta (opcional)
   */
  static async createDirectory(
    parentId: string | null,
    name: string | null,
  ): Promise<Omit<Node, "hash">> {
    try {
      // Si no hay nombre, colocamos uno por defecto
      let finalName = name ?? "Untitled Folder";

      // Verificamos que no exista un directorio con el mismo nombre
      const existentNode = await this.repo.findDirByName(parentId, finalName);

      // En caso de que exista un directorio, resolvemos el nombre
      if (existentNode) {
        finalName = await this.resolveName(parentId, finalName);
      }

      // Preparamos los datos para crear el directorio
      const hash = NodeUtils.genDirectoryHash(finalName, parentId);
      const mime = "inode/directory";

      // Tratamos de crear el directorio (nodo al fin)
      const { hash: _h, ...node } = await this.createNode({
        name: finalName,
        hash,
        parent: parentId ? { connect: { id: parentId } } : undefined,
        size: 0,
        mime,
        isDir: true,
      });

      // Si sale bien, devolvemos el directorio creado en el parentId correspondiente
      return node;
    } catch (err) {
      console.error(err);
      throw new AppError("INTERNAL", "Error al crear el directorio (nodo)");
    }
  }

  /**
   * @description Obtiene todos los nodos bajo un nodo padre especifico.
   * @param id ID del nodo padre (null para la raiz)
   * @returns Array de nodos hijos
   */
  static async getAllNodes(id: string | null = null) {
    return await this.repo.findByParentId(id);
  }

  /**
   * @description Detecta conflictos de nombres para un nodo dado.
   * @param node Nodo a verificar
   * @param newName Nuevo nombre propuesto (opcional)
   * @param excludeSelf Indica si se debe excluir el nodo mismo en la verificación
   * @returns boolean Indicador de conflicto
   */
  static async detectConflict(
    node: Node,
    newName?: string,
    excludeSelf: boolean = false,
  ) {
    return await this.repo.findNameConflict(node, newName, excludeSelf);
  }

  /**
   * @description Resuelve un nombre único para un nodo dentro de su carpeta padre.
   * @param parentId ParentId del nodo a resolver
   * @param name Nombre original del nodo a resolver
   * @param newName Nuevo nombre propuesto (opcional)
   * @returns string Nombre único resuelto
   */
  static async resolveName(
    parentId: Node["parentId"],
    name: Node["name"],
    newName?: string,
  ): Promise<string> {
    return await this.identity.resolveName(parentId, name, newName);
  }

  /**
   * @description Copia un nodo (archivo o directorio) a una nueva ubicación.
   * @param node Nodo a copiar
   * @param parentId ID del nodo padre donde se ubicará la copia
   * @param newName Nuevo nombre propuesto para la copia (opcional)
   * @returns Nodo copiado o array de nodos copiados
   */
  static async copyNode(
    node: Node,
    parentId: string | null,
    newName?: string,
  ): Promise<Node | Node[]> {
    try {
      // Copiar el nuevo nodo de forma física y añadir un nueva fila a la base de datos
      if (isDirectoryNode(node)) {
        return await NodeTreeService.copyNodeDir(node, parentId, {
          newName,
          concurrency: 5,
        });
      } else {
        return await NodeTreeService.attachNodeFile(node, parentId, newName);
      }
    } catch (err) {
      console.log(err);
      if (err instanceof AppError) {
        throw err;
      } else {
        throw new AppError("INTERNAL", "Error al copiar el nodo");
      }
    }
  }

  /**
   * @description Mueve un nodo (archivo o directorio) a una nueva ubicación.
   * @param node Nodo a mover
   * @param parentId ID del nodo padre donde se ubicará el nodo movido
   * @param newName Nuevo nombre propuesto para el nodo movido (opcional)
   * @returns Nodo movido
   */
  static async moveNode(node: Node, parentId: string | null, newName?: string) {
    if (
      (parentId === node.parentId && (!newName || newName === node.name)) ||
      parentId === node.id
    ) {
      throw new AppError(
        "BAD_REQUEST",
        `El ${node.isDir ? "directorio" : "archivo"} ya se encuentra en la ubicación destino`,
      );
    }

    try {
      if (isDirectoryNode(node)) {
        return await NodeTreeService.moveNodeDir(node, parentId, {
          newName,
          concurrency: 5,
        });
      } else {
        return await NodeTreeService.moveNodeFile(node, parentId, newName);
      }
    } catch (err) {
      console.log(err);
      if (err instanceof AppError) {
        throw err;
      } else {
        throw new AppError("INTERNAL", "Error al mover el nodo");
      }
    }
  }

  /**
   * @description Elimina un nodo.
   * @param node Nodo a eliminar
   */
  static async deleteNode(node: Node) {
    try {
      // Obtener la ruta del nodo
      const nodePath = this.cloud.getFilePath(node);

      // Usar transacción para eliminar el nodo y actualizar tamaños
      await this.prisma.$transaction(async (tx) => {
        // Si tiene padre, actualizar el tamaño de todos los ancestros que haya
        if (node.parentId) {
          const parent = await this.repo.findByIdTx(tx, node.parentId);

          if (parent) {
            // Actualizar el tamaño de todos los ancestros
            await this.decrementNodeSizeByIdTx(tx, node.parentId, node.size);
          }
        }

        // Eliminar el registro del nodo en la base de datos
        await this.repo.deleteByIdTx(tx, node.id);
      });

      // Eliminar el nodo del sistema de nodos
      await this.cloud.delete(nodePath);
    } catch (err) {
      if (err instanceof AppError) throw err;
      else throw new AppError("INTERNAL", "Error al eliminar el nodo");
    }
  }

  /**
   * @description Elimina un nodo de tipo directorio y todos sus nodos descendientes.
   * @param node Nodo de tipo directorio a eliminar junto con todos sus descendientes.
   */
  static async deleteDirectory(node: Node) {
    try {
      if (!node.isDir) {
        throw new AppError("NODE_IS_NOT_DIRECTORY");
      }

      // Si la carpeta está vacía (no contiene archivos ni subdirectorios).
      if (!node.size) {
        await this.prisma.$transaction(async (tx) => {
          // Eliminar el registro del nodo en la base de datos
          await this.repo.deleteByIdTx(tx, node.id);
        });
        return;
      }

      // Obtenemos los descendientes de la carpeta (incluyéndola)
      const descendants = await this.repo.getAllNodeDescendants(node.id);

      // Usar transacción para actualizar los tamaños
      await this.prisma.$transaction(async (tx) => {
        // Si tiene padre, actualizar el tamaño del padre (propaga a ancestros)
        if (node.parentId) {
          const parent = await this.repo.findByIdTx(tx, node.parentId);

          if (parent) {
            // Actualizar el tamaño del padre (propaga a ancestros)
            await this.decrementNodeSizeByIdTx(tx, node.parentId, node.size);
          }
        }

        // Eliminamos los archivos y carpetas de la base de datos
        await this.repo.deleteManyByIdsTx(
          tx,
          descendants.map((descendant) => descendant.id),
        );
      });

      // Obtenemos las rutas de los archivos descendientes
      const nodePaths = descendants
        .filter((descendant) => !descendant.isDir)
        .map((descendant) => this.cloud.getFilePath(descendant));

      // Eliminamos los archivos
      await this.cloud.deleteFiles(nodePaths);
    } catch (err) {
      if (err instanceof AppError) throw err;
      else throw new AppError("INTERNAL", "Error al eliminar el nodo");
    }
  }

  /**
   * @description Actualiza el nombre de un nodo.
   * @param node Nodo a actualizar
   * @param newName Nuevo nombre para el nodo
   * @returns Nodo actualizado
   */
  static async updateNodeName(
    nodeId: Node["id"],
    newName: string,
  ): Promise<Node> {
    return await this.repo.updateNameById(nodeId, newName);
  }

  /**
   * @description Actualiza el tamaño de un nodo.
   * @param nodeId ID del nodo a actualizar
   * @param newSize Nuevo tamaño del nodo
   * @returns Nodo actualizado
   */
  static async incrementNodeSizeByIdTx(
    tx: PrismaTxClient,
    nodeId: Node["id"],
    newSize: bigint,
  ): Promise<Node> {
    // Propagar el cambio de tamaño a los ancestros
    await this.repo.propagateSizeToAncestorsTx(
      tx,
      nodeId,
      newSize,
      "increment",
    );

    // Retornamos el nodo actualizado, ya que sabemos que existe previamente le decimos a ts que no sera null
    return (await this.repo.findByIdTx(tx, nodeId))!;
  }

  /**
   * @description Decrementa el tamaño de un nodo.
   * @param tx Transacción de Prisma
   * @param nodeId ID del nodo a actualizar
   * @param sizeToDecrement Tamaño a decrementar
   * @returns Nodo actualizado
   */
  static async decrementNodeSizeByIdTx(
    tx: PrismaTxClient,
    nodeId: Node["id"],
    sizeToDecrement: bigint,
  ): Promise<Node> {
    // Propagar el cambio de tamaño a los ancestros
    await this.repo.propagateSizeToAncestorsTx(
      tx,
      nodeId,
      sizeToDecrement,
      "decrement",
    );

    // Retornamos el nodo actualizado, ya que sabemos que existe previamente le decimos a ts que no sera null
    return (await this.repo.findByIdTx(tx, nodeId))!;
  }
}
