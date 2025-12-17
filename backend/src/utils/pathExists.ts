import fs from "node:fs/promises";

/**
 * Verifica si una ruta existe en el sistema de archivos.
 * @param path ruta a verificar
 * @returns boolean indica si la ruta existe o no
 */
export async function pathExists(path: string) {
  return await fs
    .access(path)
    .then(() => true)
    .catch(() => false);
}
