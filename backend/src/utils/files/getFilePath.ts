import path from "path";
import { Node } from "@/prisma/generated/client";
import { AppError } from "../errors/handler";

export default async function getFilePath(node: Node) {
  console.log(`Getting file path for node: ${node.id}, isDir: ${node.isDir}`);

  // Agregar mas logica en un futuro al manejar las carpetas
  if (node.isDir) throw new AppError("INTERNAL", "No soportado para carpetas");

  // Construir la ruta completa del archivo
  const cloudRoot = path.resolve(process.cwd(), `${process.env.CLOUD_ROOT}`);
  const filePath = path.resolve(cloudRoot, node.hash);

  // Asegurarse de que el archivo este dentro del directorio CLOUD_ROOT (vulnerabilidad de path traversal)
  if (!filePath.startsWith(cloudRoot + path.sep)) {
    throw new AppError("FILE_NOT_FOUND");
  }

  return path.resolve(process.cwd(), `${process.env.CLOUD_ROOT}`, node.hash);
}
