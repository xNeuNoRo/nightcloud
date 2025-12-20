import path from "node:path";

import { escapeRegex } from "@/utils";

/**
 * @description Construye una expresión regular para encontrar nombres de archivos en conflicto.
 * @param fileName Nombre del archivo a verificar conflictos
 * @returns Expresión regular como string
 */
export function buildConflictRegex(fileName: string) {
  const fileExt = path.extname(fileName);
  const fileBase = path.basename(fileName, fileExt);

  const safeBase = escapeRegex(fileBase);
  const safeExt = escapeRegex(fileExt);

  return `^${safeBase}( \\([0-9]+\\))?${safeExt}$`; // NOSONAR
}
