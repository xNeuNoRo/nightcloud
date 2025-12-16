import fs from "node:fs/promises";
import path from "node:path";
import { DB } from "@/config/db";
import { Node } from "@/prisma/generated/client";
import { pathExists } from "@/utils/pathExists";

// Prisma client
const prisma = DB.getClient();

export default async function persistNode(
  file: Express.Multer.File,
  parentId: string | null,
  nodeName: string,
  nodeHash: string,
  cloudPath: string,
): Promise<Node> {
  // Definir la ruta final del nodo en la nube
  const finalPath = path.resolve(cloudPath, nodeHash);

  // SI resulta que el archivo ya existe en la nube
  if (await pathExists(finalPath)) {
    // Eliminar el archivo temporal
    await fs.unlink(file.path);

    // Retornar el nodo existente o crear uno nuevo en la base de datos
    return (
      (await prisma.node.findFirst({ where: { hash: nodeHash } })) ??
      prisma.node.create({
        data: {
          parentId,
          name: nodeName,
          hash: nodeHash,
          size: file.size,
          mime: file.mimetype,
          isDir: false,
        },
      })
    );
  }

  // Mover el archivo desde la carpeta temporal a la carpeta final
  await fs.rename(file.path, finalPath);

  // Guardar la información del nodo en la base de datos
  return prisma.node.create({
    data: {
      parentId,
      name: nodeName,
      hash: nodeHash,
      size: file.size,
      mime: file.mimetype,
      isDir: false,
    },
  });
}
