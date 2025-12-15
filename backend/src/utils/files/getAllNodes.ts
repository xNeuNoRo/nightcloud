import { DB } from "@/config/db";
import { AppError } from "../errors/handler";

/**
 * Obtiene todos los archivos de un directorio
 * @param dir hash del directorio
 * @param recursive (implementar luego)
 */

export default async function getAllFiles(
  dir: string | null,
  recursive: boolean = false,
) {
  const prisma = DB.getClient();

  // Obtenemos todos los archivos de la ruta final
  try {
    return await prisma.node.findMany({
      where: {
        parentId: dir,
      },
    });
  } catch (err) {
    console.log(err);
    throw new AppError("INTERNAL", "Error al obtener los archivos");
  }
}
