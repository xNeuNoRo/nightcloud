import { DB } from "@/config/db";
import type { Node } from "@/prisma/generated/client";
import { AppError, NodeUtils } from "@/utils";
import { Request, Response } from "express";
import path from "node:path";
import fs from "node:fs/promises";
import { genNodeHash } from "@/utils/nodes/genNodeHash";

const prisma = DB.getClient();

export class NodeController {
  static uploadNodes = async (req: Request, res: Response) => {
    const nodes = req.nodes;
    res.success(
      nodes?.map((n) => {
        return {
          id: n.id,
          parentId: n.parentId,
          name: n.name,
          size: n.size,
          mime: n.mime,
          isDir: n.isDir,
        };
      }),
      201,
    );
  };

  static getNodesFromRoot = async (req: Request, res: Response) => {
    try {
      const nodes = await NodeUtils.getAllNodes(null);
      res.success(
        nodes.map((n) => {
          return {
            id: n.id,
            parentId: n.parentId,
            name: n.name,
            size: n.size,
            mime: n.mime,
            isDir: n.isDir,
          };
        }),
      );
    } catch (err) {
      throw new AppError("INTERNAL", "Error al obtener los archivos");
    }
  };

  static deleteNode = async (req: Request, res: Response) => {
    const node = req.node!;

    try {
      // Obtener la ruta del archivo
      const nodePath = await NodeUtils.getNodePath(node);

      // Eliminar el archivo del sistema de archivos
      await NodeUtils.deleteNodes([nodePath]);

      // Eliminar el registro del archivo en la base de datos
      await prisma.node.delete({
        where: { id: node.id },
      });

      res.success(undefined, 204);
    } catch (err) {
      if (err instanceof AppError) throw err;
      else throw new AppError("INTERNAL", "Error al eliminar el archivo");
    }
  };

  static downloadNode = async (req: Request, res: Response) => {
    const node = req.node!;

    try {
      // Get the node path
      const nodePath = await NodeUtils.getNodePath(node);

      // Send the node as a download
      console.log(`Downloading node: ${node.name} from path: ${nodePath}`);

      // Use a promise to handle the download completion
      await new Promise<void>((resolve, reject) => {
        res.download(nodePath, node.name, (err: Error & { code?: string }) => {
          if (err) {
            // If headers are already sent, sadly we cannot send an error response
            if (res.headersSent) resolve();

            // Handle node not found error
            if (err.code === "ENOENT") {
              return reject(new AppError("FILE_NOT_FOUND"));
            }

            // Other errors
            return reject(
              new AppError("INTERNAL", "Error interno al descargar el archivo"),
            );
          }

          // Download completed successfully
          resolve();
        });
      });
    } catch (err) {
      if (err instanceof AppError) throw err;
      else throw new AppError("INTERNAL", "Error al descargar el archivo");
    }
  };

  static renameNode = async (
    req: Request<{}, {}, { newName: string }>,
    res: Response,
  ) => {
    let { newName } = req.body;
    const node = req.node!;

    // Asegurarse de que la extension del archivo se mantenga igual
    const nodeExt = path.extname(newName);
    if (
      !nodeExt ||
      nodeExt.length === 0 ||
      nodeExt !== path.extname(node.name)
    ) {
      newName += path.extname(node.name);
    }

    // Verificar si el nuevo nombre ya existe en el mismo directorio
    const conflict = await NodeUtils.nameConflicts.detectConflict(
      node,
      newName,
    );

    // Si hay conflicto, obtener un nombre unico
    if (conflict) {
      const uniqueName = await NodeUtils.nameConflicts.getNextName(
        node,
        newName,
      );
      console.log("Resolved name conflict, new unique name:", uniqueName);
      newName = uniqueName;
    }

    try {
      const { hash, ...updatedNode } = await prisma.node.update({
        where: { id: node.id },
        data: { name: newName },
      });

      res.success(updatedNode);
    } catch (err) {
      throw new AppError("INTERNAL", "Error al renombrar el archivo");
    }
  };

  static copyNode = async (req: Request, res: Response) => {
    const node = req.node!;
    let newName = req.body.newName;

    // Asegurarse de que la extension del archivo se mantenga igual
    const nodeExt = path.extname(newName);
    if (
      !nodeExt ||
      nodeExt.length === 0 ||
      nodeExt !== path.extname(node.name)
    ) {
      newName += path.extname(node.name);
    }

    const conflict = await NodeUtils.nameConflicts.detectConflict(node, newName);

    // Detectamos si existe un conflicto
    if (conflict) {
      newName = await NodeUtils.nameConflicts.getNextName(node);
    }

    const srcPath = await NodeUtils.getNodePath(node);

    // Obtener hash del nuevo archivo
    const hash = await genNodeHash(srcPath, newName);

    // Hacemos una copia del nodo anterior, modificando el nombre
    const newNode: Node = {
      ...node,
      name: newName
    }

    // Obtenemos la carpeta root (todavía no hay soporte para carpetas)
    const cloudRoot = path.resolve(process.cwd(), `${process.env.CLOUD_ROOT}`);
    const dest = path.resolve(cloudRoot, hash);

    try {
      // Copiar el nuevo archivo de forma física y añadir un nueva fila a la base de datos
      fs.copyFile(srcPath, dest);
      
      // Preparamos un resultado para devolver al frontend, ignorando el hash
      const { hash: _h, ...result } = await prisma.node.create({
        data: {
          name: newNode.name,
          parentId: newNode.parentId,
          hash,
          size: newNode.size,
          mime: newNode.mime,
          isDir: newNode.isDir
        }
      });

      return res.success(result);
    } catch (err) {
      if (err instanceof AppError) throw err;
      else throw new AppError("INTERNAL", "Error al copiar el archivo");
    }
  }
}
