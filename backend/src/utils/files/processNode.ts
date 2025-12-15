import fs from "fs/promises";
import path from "path";
import { AppError } from "@/utils/errors/handler";
import { DB } from "@/config/db";
import { genNodeHash } from "./genNodeHash";

/**
 *
 * @param path ruta a verificar
 * @returns boolean indica si la ruta existe o no
 */
const pathExists = async (path: string) =>
  await fs
    .access(path)
    .then(() => true)
    .catch(() => false);

/**
 *
 * @param file Archivo subido via Multer
 * @param parentId ID del nodo padre donde se almacenara el archivo
 * @returns Node creado en la base de datos
 */

export default async function processFile(
  file: Express.Multer.File,
  parentId: string | null,
) {
  try {
    // Generar el hash del archivo
    const fileHash = await genNodeHash(file.path, file.originalname);

    // Definir la ruta final del archivo en la nube
    const cloudPath = path.resolve(process.cwd(), `${process.env.CLOUD_ROOT}`);

    // Asegurarse de que la carpeta de la nube existe
    const rootExists = await pathExists(cloudPath);
    if (!rootExists) fs.mkdir(cloudPath, { recursive: true });

    // Ruta completa del archivo final
    const finalPath = path.resolve(cloudPath, fileHash);
    const nodeExists = await pathExists(finalPath);

    if (nodeExists) {
      // Si el archivo ya existe, eliminamos el temporal
      fs.unlink(file.path);
    } else {
      // Si no existe, movemos el archivo desde la carpeta temporal a la carpeta final
      fs.rename(file.path, finalPath);
    }

    // Guardar la información del archivo en la base de datos
    const prisma = DB.getClient();

    const createdNode = await prisma.node.create({
      data: {
        parentId,
        name: file.originalname,
        hash: fileHash,
        size: file.size,
        mime: file.mimetype,
        isDir: false,
      },
    });

    console.log(`File processed: ${file.originalname} as ${fileHash}`);

    return createdNode;
  } catch (err) {
    console.log(err);

    // En caso de error, eliminamos el archivo temporal si existe
    const tmpExists = await pathExists(file.path);
    if (tmpExists) {
      await fs.unlink(file.path);
    }

    // Lanzamos un error de procesamiento
    throw new AppError("INTERNAL", "Error al procesar el archivo");
  }
}
