import { AppError, NodeUtils } from "@/utils";
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

  /**
   * @description Procesa un nodo subido y lo almacena en la nube y la base de datos.
   * @param file nodo subido via Multer
   * @param parentId ID del nodo padre donde se almacenara el nodo
   * @returns Node creado en la base de datos
   */
  static async process(file: Express.Multer.File, parentId: string | null) {
    try {
      const { nodeName, nodeHash } = await this.identity.resolve(
        file,
        parentId,
      );

      console.log(`Processing node: ${nodeName}`);
      const node = await this.persistence.persist(
        file,
        parentId,
        nodeName,
        nodeHash,
      );

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
   * @description Crea un nuevo directorio (nodo) en la base de datos
   * @param parentId ID del nodo padre donde se creara la carpeta
   * @param name Nombre de la carpeta (opcional)
   */
  static async createDirectory(parentId: string | null, name: string | null): Promise<Omit<Node, 'hash'>> {
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
   * @param parentId ParentId del nodo a resolver
   * @param name Nombre original del nodo a resolver
   * @param newName Nuevo nombre propuesto (opcional)
   * @returns string Nombre único resuelto
   */
  static async resolveName(parentId: Node["parentId"], name: Node["name"], newName?: string): Promise<string> {
    return await this.identity.resolveName(parentId, name, newName);
  }

  /**
   * @description Elimina un nodo por su ID.
   * @param nodeId ID del nodo a eliminar
   */
  static async deleteNodeById(nodeId: Node["id"]) {
    await this.repo.deleteById(nodeId);
  }

  /**
   * @description Actualiza el nombre de un nodo.
   * @param node Nodo a actualizar
   * @param newName Nuevo nombre para el nodo
   * @returns Nodo actualizado
   */
  static async updateNodeName(node: Node, newName: string): Promise<Node> {
    return await this.repo.updateNameById(node.id, newName);
  }
}
