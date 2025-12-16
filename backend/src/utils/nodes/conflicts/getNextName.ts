import path from "node:path";
import { DB } from "@/config/db";
import { Node } from "@/prisma/generated/client";
import { AppError } from "@/utils/errors/handler";

// Prisma client
const prisma = DB.getClient();

/**
 * @description Generar un nuevo nombre libre de conflictos para un nodo dado.
 * @param node Nodo que se desea resolver conflicto de nombre
 * @param newName Nuevo nombre que tiene el conflicto, en caso de no pasarse se usara el nombre actual del nodo.
 * @returns string nuevo nombre sin conflictos y safety para renombrar el nodo.
 */

// Obtener un nombre unico para el nodo en caso de conflictos
export async function getNextName(node: Node, newName?: string) {
  const targetName = newName ?? node.name;
  try {
    // Obtener la extension y el nombre base del nodo
    const fileExt = path.extname(targetName);
    const fileBase = path.basename(targetName, fileExt);

    // Funcion para eliminar caracteres especiales en expresiones regulares
    const escapeRegex = (str: string) =>
      str.replaceAll(/[.*+?^${}()|[\]\\]/g, String.raw`\$&`);
    const safeBase = escapeRegex(fileBase);
    const safeExt = escapeRegex(fileExt);

    // ^               : Inicio de linea
    // safeBase        : Nombre exacto
    // ( \\([0-9]+\\))?: Grupo opcional que busca " (numero)", ej: " (2)"
    // safeExt         : Extension del nodo exacta
    // $               : Fin de linea
    const regexPattern = String.raw`^${safeBase}( \([0-9]+\))?${safeExt}$`;

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
      String.raw`^${safeBase}(?: \((\d+)\))?${safeExt}$`,
      "i",
    );

    // Variables para rastrear el sufijo maximo y si la base existe
    let maxSuffix = 0;
    let exactMatchExists = false;

    for (const conflict of conflicts) {
      // Verificar si el nombre coincide con el patron
      const match = new RegExp(pattern).exec(conflict.name);
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
          const suffixNum = Number.parseInt(match[1], 10);
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
    console.log(err);
    throw new AppError("INTERNAL", "Error al resolver conflictos de nombres");
  }
}