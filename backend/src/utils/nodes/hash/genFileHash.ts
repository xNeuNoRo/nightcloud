import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { pipeline } from "node:stream/promises";

/**
 *
 * @param nodeFullPath Ruta completa hacia el nodo
 * @param nodeName Nombre del nodo completo con su extension (opcional)
 * @returns string Hash SHA256 del nodo + nombre con su extension
 */
export default async function genFileHash(nodeFullPath: string, nodeName: string) {
  // Obtener la extension del nodo
  const nodeExt = path.extname(nodeFullPath);

  // Crear hash SHA256 del nodo
  const hash = crypto.createHash("sha256");

  // Agregar el nombre del nodo al hash para mayor unicidad (aceptando duplicados de contenido con diferente nombre)
  hash.update(nodeName);

  // Leer el nodo en chunks para no saturar la memoria
  const input = fs.createReadStream(nodeFullPath);
  // Pipe del stream para evitar cargar todo en memoria
  await pipeline(input, hash);

  // Retornar el hash en formato hexadecimal y agregarle la extension original
  return hash.digest("hex") + nodeExt;
}