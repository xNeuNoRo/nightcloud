import fs from "fs";
import path from "path";
import crypto from "crypto";
import { pipeline } from "stream/promises";
import { AppError } from "@/utils/errors/handler";
import { DB } from "@/config/db";

export default async function processFile(
  file: Express.Multer.File,
  parentId: string | null,
) {
  try {
    // Crear hash SHA256 del archivo
    const hash = crypto.createHash("sha256");
    // Leer el archivo en chunks para no saturar la memoria
    const input = fs.createReadStream(file.path);
    // Pipe del stream para evitar cargar todo en memoria
    await pipeline(input, hash);
    // Obtener el hash en formato hexadecimal y agregarle la extension original
    const fileHash = hash.digest("hex") + path.extname(file.originalname);
    const finalPath = path.resolve(
      process.cwd(),
      `${process.env.CLOUD_ROOT}`,
      fileHash,
    );

    if (fs.existsSync(finalPath)) {
      // Si el archivo ya existe, eliminamos el temporal
      fs.unlinkSync(file.path);
    } else {
      // Si no existe, movemos el archivo desde la carpeta temporal a la carpeta final
      fs.renameSync(file.path, finalPath);
    }

    // Guardar la información del archivo en la base de datos
    const prisma = DB.getClient();

    await prisma.node.create({
      data: {
        parentId,
        name: file.originalname,
        hash: fileHash,
        size: file.size,
        mime: file.mimetype,
        IsDir: false,
      },
    });

    console.log(`File processed: ${file.originalname} as ${fileHash}`);
  } catch (err) {
    console.log(err);

    // En caso de error, eliminamos el archivo temporal si existe
    if (fs.existsSync(file.path)) fs.unlinkSync(file.path);

    // Lanzamos un error de procesamiento
    throw new AppError("INTERNAL", "Error al procesar el archivo");
  }
}
