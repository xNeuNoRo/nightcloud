import { DB } from "@/config/db";
import { Node, Prisma } from "@/infra/prisma/generated/client";
import { PrismaTxClient } from "@/types/prisma";

const prisma = DB.getClient();

export class NodeRepository {
  /**
   * @description Crea un nuevo nodo en la base de datos
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
   * @description Elimina un nodo por su ID dentro de una transaccion
   * @param tx Transaccion de Prisma
   * @param id ID del nodo a eliminar
   */
  static async deleteByIdTx(tx: PrismaTxClient, id: Node["id"]) {
    await tx.node.delete({
      where: { id },
    });
  }

  /**
   * @description Obtiene los metadatos de un nodo por su ID dentro de una transaccion
   * @param tx Transaccion de Prisma
   * @param id ID del nodo
   * @returns Metadatos del nodo
   */
  static async getNodeMetaByIdTx(tx: PrismaTxClient, id: Node["id"]) {
    return await tx.node.findUnique({
      where: { id },
      select: {
        parentId: true,
        size: true,
        mime: true,
        isDir: true,
      },
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
   * @description Encuentra un nodo por su ID dentro de una transaccion
   * @param tx Transaccion de Prisma
   * @param id ID del nodo a buscar
   * @returns Nodo encontrado o null
   */
  static async findByIdTx(tx: PrismaTxClient, id: Node["id"]) {
    return await tx.node.findUnique({
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
  static async incrementSizeById(id: Node["id"], delta: number) {
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
   * @description Incrementa el tamaño de un nodo por su ID dentro de una transaccion
   * @param tx Transaccion de Prisma
   * @param id ID del nodo a incrementar
   * @param delta Cantidad a incrementar
   * @returns Nodo actualizado
   */
  static async incrementSizeByIdTx(
    tx: PrismaTxClient,
    id: Node["id"],
    delta: number,
  ) {
    return await tx.node.update({
      data: {
        size: {
          increment: delta,
        },
      },
      where: { id },
    });
  }

  /**
   * @description Decrementa el tamaño de un nodo por su ID
   * @param id ID del nodo a decrementar
   * @param delta Cantidad a decrementar
   * @param isDir Indica si el nodo es un directorio
   * @returns
   */
  static async decrementSizeById(id: Node["id"], delta: number) {
    return await prisma.node.update({
      data: {
        size: {
          decrement: delta,
        },
      },
      where: { id },
    });
  }

  /**
   * @description Decrementa el tamaño de un nodo por su ID dentro de una transaccion
   * @param tx Transaccion de Prisma
   * @param id ID del nodo a decrementar
   * @param delta Cantidad a decrementar
   * @returns Nodo actualizado
   */
  static async decrementSizeByIdTx(
    tx: PrismaTxClient,
    id: Node["id"],
    delta: number,
  ) {
    return await tx.node.update({
      data: {
        size: {
          decrement: delta,
        },
      },
      where: { id },
    });
  }

  /**
   * @description Propaga el incremento o decremento de tamaño a los ancestros de un nodo
   * @param id ID del nodo desde el cual propagar el incremento/decremento
   * @param delta Incremento/Decremento de tamaño a propagar
   */
  static async propagateSizeToAncestorsTx(
    tx: PrismaTxClient,
    id: Node["id"],
    delta: number,
    mode: "increment" | "decrement",
  ) {
    // Obtener los ancestros del nodo
    const ancestors = await tx.getAncestors(id);
    console.log("Propagating size to ancestors:", ancestors);

    // Actualizar el tamaño de cada ancestro
    await tx.node.updateMany({
      where: {
        id: { in: ancestors.map((a) => a.id) },
      },
      data: {
        size: {
          [mode]: delta, // Usar incremento o decremento segun el modo
        },
      },
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
    tx: PrismaTxClient,
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
