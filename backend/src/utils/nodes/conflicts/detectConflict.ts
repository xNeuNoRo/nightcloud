import { Node } from "@/prisma/generated/client";
import { DB } from "@/config/db";

// Prisma client
const prisma = DB.getClient();

/**
 * @description Detectar si hay conflictos de nombres en el mismo directorio.
 * @param node Nodo de la BD que se le pasara
 * @param newName Nuevo nombre que se detectara si hay conflictos
 * @param ignoreNode Si se desea ignorar el nodo actual en la busqueda de conflictos
 * @returns boolean indicando si hay conflicto de nombres
 */

// Detectar si hay conflictos de nombres en el mismo directorio
export async function detectConflict(
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