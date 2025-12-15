import fs from "fs";
import path from "path";
import crypto from "crypto";
import { pipeline } from "stream/promises";

/**
 *
 * @param nodeFullPath Ruta completa hacia el archivo
 * @param nodeName Nombre del nodo completo con su extension (opcional)
 * @returns string Hash SHA256 del archivo + nombre con su extension
 */

export async function genNodeHash(nodeFullPath: string, nodeName?: string) {
  const fullName = nodeFullPath ?? path.basename(nodeFullPath);
  const nodeExt = path.extname(fullName);

  // Crear hash SHA256 del archivo
  const hash = crypto.createHash("sha256");

  // Agregar el nombre del archivo al hash para mayor unicidad (aceptando duplicados de contenido con diferente nombre)
  hash.update(path.basename(nodeFullPath, nodeExt));

  // Leer el archivo en chunks para no saturar la memoria
  const input = fs.createReadStream(nodeFullPath);
  // Pipe del stream para evitar cargar todo en memoria
  await pipeline(input, hash);

  // Retornar el hash en formato hexadecimal y agregarle la extension original
  return hash.digest("hex") + nodeExt;
}
