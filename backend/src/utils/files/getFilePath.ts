import fs from "fs/promises";
import path from "path";
import { Node } from "@/prisma/generated/client";
import { AppError } from "../errors/handler";

export default async function getFilePath(node: Node) {
  console.log(`Getting file path for node: ${node.id}, isDir: ${node.isDir}`);

  // Agregar mas logica en un futuro al manejar las carpetas
  if (node.isDir) throw new Error("No soportado");

  return path.resolve(process.cwd(), `${process.env.CLOUD_ROOT}`, node.hash);
}
