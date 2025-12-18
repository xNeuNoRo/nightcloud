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
   * @description Encuentra un nodo por su ID
   * @param id ID del nodo a buscar
   * @returns Nodo encontrado o null
   */
  static async findById(id: Node["id"]) {
    return await prisma.node.findUnique({
      where: { id },
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

  /**
   * @description Incrementa el tamaño de un nodo por su ID
   * @param id ID del nodo a incrementar
   * @param size Tamaño a incrementar del nodo
   * @returns Nodo con el tamaño actualizado
   */
  static async incrementSizeById(
    id: Node["id"],
    delta: number,
    isDir: boolean = false,
  ) {
    // Por seguridad, evitar que el tamaño sea negativo
    if (delta < 0) delta = 0;

    // Si es un directorio, propagar el cambio de tamaño a los padres
    // Coste: 1+1 consultas -- todavia pensando si quitar la busqueda final xd
    if (isDir) {
      // Propagar el incremento de tamaño a los ancestros
      await this.propagateSizeIncrementToAncestors(id, delta);
      // Devolver el nodo actualizado
      return (await this.findById(id))!; // El nodo debe existir
    }

    return await prisma.node.update({
      data: {
        size: {
          increment: delta,
        },
      },
      where: { id },
    });
  }

  /**
   * @description Propaga un incremento de tamaño a todos los ancestros de un nodo
   * @param id ID del nodo desde el cual propagar el incremento
   * @param delta Incremento de tamaño a propagar
   */
  static async propagateSizeIncrementToAncestors(
    id: Node["id"],
    delta: number,
  ) {
    // Usamos una transaccion de Prisma para asegurar la atomicidad
    await prisma.$transaction(async (tx) => {
      // Obtener los ancestros del nodo
      const ancestors = await tx.getAncestors(id);

      // Actualizar el tamaño de cada ancestro
      await prisma.node.updateMany({
        where: {
          id: { in: ancestors.map((a) => a.id) },
        },
        data: {
          size: {
            increment: delta,
          },
        },
      });
    });
  }

  /**
   * @remarks La funcion getAncestors es una queryRaw de una funcion almacenada optimizada
   * Es la forma mas eficiente de obtener todos los ancestros en una sola consulta.
   * @description Obtiene todos los ancestros de un nodo dado.
   * @param tx Transaccion de Prisma
   * @param startNodeId ID del nodo desde el cual comenzar a buscar ancestros
   * @returns Lista de ancestros con sus IDs y parentIds
   */
  static async getAllNodeAncestors(startNodeId: Node["id"]) {
    return await prisma.getAncestors(startNodeId);
  }

  /**
   * !
   * @warning ESTA FUNCION TIENE UN COSTE DE 2N CONSULTAS A LA BD, USAR CON MUCHO MAS CUIDADO.
   * @description Ejecuta un callback para cada ancestro de un nodo dado.
   * @param tx Transaccion de Prisma
   * @param startNodeId ID del nodo desde el cual comenzar a buscar ancestros
   * @param callback Funcion a ejecutar para cada ancestro encontrado
   */
  static async forEachAncestor(
    tx: Prisma.TransactionClient,
    startNodeId: Node["id"],
    callback: (ancestor: Pick<Node, "id" | "parentId">) => Promise<void>,
  ) {
    // Recorrer hacia arriba en la jerarquia hasta la raiz
    let currentNodeId: string | null = startNodeId;

    // Mientras haya un nodo actual
    while (currentNodeId) {
      // Obtener el nodo padre actual
      const parent: Pick<Node, "id" | "parentId"> | null =
        await tx.node.findUnique({
          where: { id: currentNodeId },
          select: {
            id: true,
            parentId: true,
          },
        });

      // Si no hay padre, quiere decir que llegamos a la raiz
      if (!parent) break;

      // Ejecutar el callback con el padre actual
      await callback(parent);

      // Actualizar el ID del nodo actual al ID del padre para la siguiente iteracion
      currentNodeId = parent.parentId;
    }
  }
}
