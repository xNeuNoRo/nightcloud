import path from "path";
import { Node } from "@/prisma/generated/client";
import { DB } from "@/config/db";

// Prisma client
const prisma = DB.getClient();

// Detectar si hay conflictos de nombres en el mismo directorio
export async function detectConflict(node: Node) {
  const conflict = await prisma.node.findFirst({
    where: {
      parentId: node.parentId,
      name: {
        equals: node.name,
        mode: "insensitive",
      },
      NOT: {
        id: node.id,
      },
    },
  });

  return conflict !== null;
}

// Obtener un nombre unico para el archivo en caso de conflictos
export async function getNextName(node: Node) {
  // Obtener la extension y el nombre base del archivo
  const fileExt = path.extname(node.name);
  const fileBase = path.basename(node.name, fileExt);

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

  // Si no hay conflictos, quiere decir que el nombre esta libre
  if (conflicts.length === 0) return node.name;

  // Crear patron para buscar nombres con sufijos numericos con el formato "nombre (n)"
  const pattern = new RegExp(`^${safeBase}(?: \\((\\d+)\\))?${safeExt}$`, "i");

  // Variables para rastrear el sufijo maximo y si la base existe
  let maxSuffix = 0;
  let exactMatchExists = false;

  for (const conflict of conflicts) {
    // Verificar si el nombre coincide con el patron
    const match = conflict.name.match(pattern);

    if (match) {
      // Si hay match pero resulta que el nombre es el mismo,
      // marcar que el nombre a renombrar existe
      if (conflict.name.toLowerCase() === node.name.toLowerCase()) {
        exactMatchExists = true;
      } else if (match[1]) {
        // Si hay un sufijo numerico, actualizar maxSuffix si es mayor
        const suffixNum = parseInt(match[1], 10);
        if (suffixNum > maxSuffix) maxSuffix = suffixNum;
      }
    }
  }

  // Si no existe el nombre exacto,
  // retornar el nombre original
  if (!exactMatchExists) {
    return node.name;
  }

  // Si llegamos aqui, significa que hay conflictos
  // Retornamos el nuevo nombre con el sufijo incrementado en 1
  return `${fileBase} (${maxSuffix + 1})${fileExt}`;
}
