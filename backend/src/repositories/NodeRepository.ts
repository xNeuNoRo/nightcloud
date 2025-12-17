import { DB } from "@/config/db";
import { Node, Prisma } from "@/infra/prisma/generated/client";

const prisma = DB.getClient();

export class NodeRepository {
  /**
   * Crea un nuevo nodo en la base de datos
   * @param data Datos del nodo a crear
   * @returns Nodo creado
   */
  static async create(data: Prisma.NodeCreateInput): Promise<Node> {
    return await prisma.node.create({ data });
  }

  /**
   * @description Elimina un nodo por su ID
   * @param id ID del nodo a eliminar
   */
  static async deleteById(id: Node["id"]) {
    await prisma.node.delete({
      where: { id },
    });
  }

  /**
   * @description Actualiza el nombre de un nodo por su ID
   * @param id ID del nodo a actualizar
   * @param newName Nuevo nombre para el nodo
   * @returns Nodo actualizado
   */
  static async updateNameById(id: Node["id"], newName: string) {
    return await prisma.node.update({
      where: { id },
      data: { name: newName },
    });
  }

  /**
   * @description Encuentra nodos por su parentId
   * @param parentId ID del nodo padre
   * @returns Lista de nodos hijos
   */
  static async findByParentId(parentId: string | null): Promise<Node[]> {
    return await prisma.node.findMany({
      where: {
        parentId,
      },
    });
  }

  /**
   * @description Encuentra nodos de tipo dir por su nombre
   * @param parentId ID del nodo padre
   * @param name Nombre del nodo a buscar
   * @returns Nodo encontrado o null
   */
  static async findDirByName(parentId: string | null, name: string): Promise<Node|null> {
    return await prisma.node.findFirst({
      where: {
        parentId,
        name,
      },
    });
  }

  /**
   * @description Busca un nodo por su hash
   * @param hash Hash del nodo
   * @returns Nodo encontrado o null
   */
  static async findByHash(hash: string): Promise<Node | null> {
    return await prisma.node.findFirst({
      where: { hash },
    });
  }

  /**
   * @description Busca un nodo por su hash y parentId
   * @param hash Hash del nodo
   * @param parentId ID del nodo padre
   * @returns Nodo encontrado o null
   */
  static async findByHashAndParentId(
    hash: string,
    parentId: string | null,
  ): Promise<Node | null> {
    return await prisma.node.findFirst({
      where: {
        hash,
        parentId,
      },
    });
  }

  /**
   * @description Busca nombres de nodos que entren en conflicto con una expresion regular dada.
   * @param parentId ID del nodo padre
   * @param regexPattern Expresion regular para buscar nombres en conflicto
   * @returns Lista de nombres en conflicto
   */
  static async findConflictingNames(
    parentId: string | null,
    regexPattern: string,
  ): Promise<string[]> {
    const rows = await prisma.$queryRaw<{ name: string }[]>`
      SELECT name
      FROM node
      WHERE "parentId" IS NOT DISTINCT FROM ${parentId}
        AND name ~* ${regexPattern} 
    `; // ~* : Case insensitive y patron de expresion regular en PostgreSQL

    return rows.map((r) => r.name);
  }

  /**
   * @description Detectar si hay conflicto de nombre en el mismo nivel de padre.
   * @param node Nodo de la BD que se le pasara
   * @param newName Nuevo nombre que se detectara si hay conflictos
   * @param ignoreNode Si se desea ignorar el nodo actual en la busqueda de conflictos
   * @returns boolean indicando si hay conflicto de nombres
   */
  static async findNameConflict(
    node: Node,
    newName?: string,
    ignoreNode: boolean = false,
  ) {
    const conflict = await prisma.node.findFirst({
      where: {
        parentId: node.parentId,
        name: {
          equals: newName ?? node.name,
          mode: "insensitive",
        },
        ...(ignoreNode
          ? {
              NOT: {
                id: node.id,
              },
            }
          : {}),
      },
    });

    return conflict !== null;
  }
}
