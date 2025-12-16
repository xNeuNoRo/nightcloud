import fs from "fs/promises";
import path from "path";
import { AppError } from "@/utils/errors/handler";
import { DB } from "@/config/db";
import { genNodeHash } from "./genNodeHash";
import { getNextName } from "./nameConflicts";

// Prisma client
const prisma = DB.getClient();

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

export default async function processNode(
  file: Express.Multer.File,
  parentId: string | null,
) {
  try {
    // Generar el hash del archivo
    let fileName = file.originalname;
    let nodeHash = await genNodeHash(file.path, fileName);

    // Verificar si el hash ya existe en la base de datos
    const fileExists = await prisma.node.findFirst({
      where: { hash: nodeHash },
    });

    // Si ya existe un archivo con el mismo nombre en la misma carpeta, renombrarlo
    if (fileExists) {
      console.log(`Name conflict detected. New name assigned: ${fileName}`);
      fileName = await getNextName(fileExists);
      nodeHash = await genNodeHash(file.path, fileName);
    }

    // Definir la ruta final del archivo en la nube
    const cloudPath = path.resolve(process.cwd(), `${process.env.CLOUD_ROOT}`);

    // Asegurarse de que la carpeta de la nube existe
    const rootExists = await pathExists(cloudPath);
    if (!rootExists) fs.mkdir(cloudPath, { recursive: true });

    // Ruta completa del archivo final
    const finalPath = path.resolve(cloudPath, nodeHash);
    const nodeExists = await pathExists(finalPath);

    if (nodeExists) {
      // Si el archivo ya existe, eliminamos el temporal
      fs.unlink(file.path);
    } else {
      // Si no existe, movemos el archivo desde la carpeta temporal a la carpeta final
      fs.rename(file.path, finalPath);
    }

    // Guardar la información del archivo en la base de datos
    const createdNode = await prisma.node.create({
      data: {
        parentId,
        name: fileName,
        hash: nodeHash,
        size: file.size,
        mime: file.mimetype,
        isDir: false,
      },
    });

    console.log(`Node processed: ${fileName} as ${nodeHash}`);

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
