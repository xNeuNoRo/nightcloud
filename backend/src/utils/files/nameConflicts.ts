import path from "path";
import { Node } from "@/prisma/generated/client";
import { DB } from "@/config/db";
import { AppError } from "../errors/handler";

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

/**
 * @description Generar un nuevo nombre libre de conflictos para un nodo dado.
 * @param node Nodo que se desea resolver conflicto de nombre
 * @param newName Nuevo nombre que tiene el conflicto, en caso de no pasarse se usara el nombre actual del nodo.
 * @returns string nuevo nombre sin conflictos y safety para renombrar el archivo.
 */

// Obtener un nombre unico para el archivo en caso de conflictos
export async function getNextName(node: Node, newName?: string) {
  const targetName = newName ?? node.name;
  try {
    // Obtener la extension y el nombre base del archivo
    const fileExt = path.extname(targetName);
    const fileBase = path.basename(targetName, fileExt);

    // Funcion para eliminar caracteres especiales en expresiones regulares
    const escapeRegex = (str: string) =>
      str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const safeBase = escapeRegex(fileBase);
    const safeExt = escapeRegex(fileExt);

    // ^               : Inicio de linea
    // safeBase        : Nombre exacto
    // ( \\([0-9]+\\))?: Grupo opcional que busca " (numero)", ej: " (2)"
    // safeExt         : Extension del archivo exacta
    // $               : Fin de linea
    const regexPattern = `^${safeBase}( \\([0-9]+\\))?${safeExt}$`;

    // Buscar en la base de datos todos los nombres que coincidan con el patron
    // ~* : Case insensitive y patron de expresion regular en PostgreSQL
    const conflicts = await prisma.$queryRaw<Pick<Node, "name">[]>`
    SELECT name 
    FROM node
    WHERE "parentId" IS NOT DISTINCT FROM ${node.parentId}
      AND name ~* ${regexPattern}
    `;

    console.log("Conflicts found:", conflicts);
    // Si no hay conflictos, quiere decir que el nombre esta libre
    if (conflicts.length === 0) return targetName;

    // Crear patron para buscar nombres con sufijos numericos con el formato "nombre (n)"
    const pattern = new RegExp(
      `^${safeBase}(?: \\((\\d+)\\))?${safeExt}$`,
      "i",
    );

    // Variables para rastrear el sufijo maximo y si la base existe
    let maxSuffix = 0;
    let exactMatchExists = false;

    for (const conflict of conflicts) {
      // Verificar si el nombre coincide con el patron
      const match = conflict.name.match(pattern);
      console.log("Matching conflict name:", conflict.name, "->", match);

      if (match) {
        console.log("Matched conflict:", conflict.name);
        // Si hay match pero resulta que el nombre es el mismo,
        // marcar que el nombre a renombrar existe

        console.log(
          "Comparing names:",
          conflict.name.toLowerCase(),
          "vs",
          targetName.toLowerCase(),
        );
        if (conflict.name.toLowerCase() === targetName.toLowerCase()) {
          console.log("Exact match found for name:", conflict.name);
          exactMatchExists = true;
        } else if (match[1]) {
          console.log("Suffix found:", match[1]);
          // Si hay un sufijo numerico, actualizar maxSuffix si es mayor
          const suffixNum = parseInt(match[1], 10);
          if (suffixNum > maxSuffix) maxSuffix = suffixNum;
        }
      }
    }

    // Si no existe el nombre exacto,
    // retornar el nombre original
    if (!exactMatchExists) {
      return targetName;
    }

    // Si llegamos aqui, significa que hay conflictos
    // Retornamos el nuevo nombre con el sufijo incrementado en 1
    return `${fileBase} (${maxSuffix + 1})${fileExt}`;
  } catch (err) {
    throw new AppError("INTERNAL", "Error al resolver conflictos de nombres");
  }
}
