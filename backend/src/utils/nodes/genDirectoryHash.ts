import crypto from "node:crypto";

/**
 *
 * @param nodeName Nombre del nodo completo
 * @returns string Hash SHA256 del nombre del nodo
 */
export default async function genDirectoryHash(nodeName: string) {
  // Crear hash SHA256 del nodo
  const hash = crypto.createHash("sha256");

  // Agregar el nombre del nodo al hash
  hash.update(nodeName);

  // Retornar el hash en formato hexadecimal y agregar o no la extension original
  return hash.digest("hex");
}
