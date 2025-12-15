import path from "node:path";
import { readdir } from "node:fs/promises";
import { DB } from "@/config/db";

/**
 * Obtiene todos los archivos de un directorio
 * @param dir hash del directorio
 * @param recursive 
 */
export default async function getAllFiles(dir: string|null, recursive: boolean = false) {
    const prisma = DB.getClient();

  // Obtenemos todos los archivos de la ruta final
  try {
    return await prisma.node.findMany({where: {
      parentId: dir
    }});
  } catch (err) {
    console.error(err);
  }
}