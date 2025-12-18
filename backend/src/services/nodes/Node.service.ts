import { DB } from "@/config/db";
import { AppError } from "@/utils";
import { NodeIdentityService } from "./NodeIdentity.service";
import { NodePersistenceService } from "./NodePersistence.service";
import { NodeRepository } from "@/repositories/NodeRepository";
import { CloudStorageService } from "../cloud/CloudStorage.service";
import { Node, Prisma } from "@/infra/prisma/generated/client";

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
  static async process(file: Express.Multer.File, parentId: string | null) {
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
      if (parentId) {
        const parentNode = await this.repo.findById(parentId);
        if (parentNode)
          await this.incrementNodeSizeById(
            parentId,
            file.size,
            parentNode?.isDir,
          );
      }

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
   * @description Obtiene todos los nodos bajo un nodo padre especifico.
   * @param parentId ID del nodo padre (null para la raiz)
   * @returns Array de nodos hijos
   */
  static async getAllNodes(parentId: string | null = null) {
    return await this.repo.findByParentId(parentId);
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
   * @param node Nodo a resolver
   * @param newName Nuevo nombre propuesto (opcional)
   * @returns string Nombre único resuelto
   */
  static async resolveName(node: Node, newName?: string): Promise<string> {
    return await this.identity.resolveName(node, newName);
  }

  /**
   * @description Elimina un nodo por su ID.
   * @param nodeId ID del nodo a eliminar
   */
  static async deleteNode(node: Node) {
    try {
      // Obtener la ruta del nodo
      const nodePath = await this.cloud.getFilePath(node);

      // Usar transacción para eliminar el nodo y actualizar tamaños
      await this.prisma.$transaction(async (tx) => {
        // Si tiene padre, actualizar el tamaño de todos los ancestros que haya
        if (node.parentId) {
          const parent = await this.repo.findByIdTx(tx, node.parentId);

          if (parent) {
            // Actualizar el tamaño de todos los ancestros
            await this.decrementNodeSizeById(
              node.parentId,
              node.size,
              parent.isDir,
            );
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
  static async incrementNodeSizeById(
    nodeId: Node["id"],
    newSize: number,
    isDirectory: boolean = false,
  ): Promise<Node> {
    // Si no es un directorio, actualizar solo el nodo
    if (!isDirectory) return await this.repo.incrementSizeById(nodeId, newSize);

    // Si es un directorio, usar transacción para actualizar el nodo y propagar a ancestros
    return await this.prisma.$transaction(async (tx) => {
      // Propagar el cambio de tamaño a los ancestros
      await this.repo.propagateSizeToAncestorsTx(
        tx,
        nodeId,
        newSize,
        "increment",
      );

      // Retornamos el nodo actualizado, ya que sabemos que existe previamente le decimos a ts que no sera null
      return (await this.repo.findByIdTx(tx, nodeId))!;
    });
  }

  static async decrementNodeSizeById(
    nodeId: Node["id"],
    sizeToDecrement: number,
    isDirectory: boolean = false,
  ): Promise<Node> {
    // Si no es un directorio, actualizar solo el nodo
    if (!isDirectory)
      return await this.repo.decrementSizeById(nodeId, sizeToDecrement);

    // Si es un directorio, usar transacción para actualizar el nodo y propagar a ancestros
    return await this.prisma.$transaction(async (tx) => {
      // Propagar el cambio de tamaño a los ancestros
      await this.repo.propagateSizeToAncestorsTx(
        tx,
        nodeId,
        sizeToDecrement,
        "decrement",
      );

      // Retornamos el nodo actualizado, ya que sabemos que existe previamente le decimos a ts que no sera null
      return (await this.repo.findByIdTx(tx, nodeId))!;
    });
  }
}
