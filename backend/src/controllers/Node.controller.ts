import { DB } from "@/config/db";
import { AppError, NodeUtils } from "@/utils";
import { Request, Response } from "express";
import path from "node:path";
import fs from "node:fs/promises";
import { genNodeHash } from "@/utils/nodes/genNodeHash";

const prisma = DB.getClient();

export class NodeController {
  static readonly uploadNodes = async (req: Request, res: Response) => {
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

  static readonly getNodesFromRoot = async (req: Request, res: Response) => {
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
      console.log(err);
      throw new AppError("INTERNAL", "Error al obtener los nodos");
    }
  };

  static readonly deleteNode = async (req: Request, res: Response) => {
    const node = req.node!;

    try {
      // Obtener la ruta del nodo
      const nodePath = await NodeUtils.getNodePath(node);

      // Eliminar el nodo del sistema de nodos
      await NodeUtils.deleteNodes([nodePath]);

      // Eliminar el registro del nodo en la base de datos
      await prisma.node.delete({
        where: { id: node.id },
      });

      res.success(undefined, 204);
    } catch (err) {
      if (err instanceof AppError) throw err;
      else throw new AppError("INTERNAL", "Error al eliminar el nodo");
    }
  };

  static readonly downloadNode = async (req: Request, res: Response) => {
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
              new AppError("INTERNAL", "Error interno al descargar el nodo"),
            );
          }

          // Download completed successfully
          resolve();
        });
      });
    } catch (err) {
      if (err instanceof AppError) throw err;
      else throw new AppError("INTERNAL", "Error al descargar el nodo");
    }
  };

  static readonly renameNode = async (
    req: Request<{}, {}, { newName: string }>,
    res: Response,
  ) => {
    let { newName } = req.body;
    const node = req.node!;

    // Asegurarse de que la extension del nodo se mantenga igual
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
      true
    );

    // Si hay conflicto, obtener un nombre unico
    if (conflict) {
      const uniqueName = await NodeUtils.nameConflicts.getNextName(
        node,
        newName
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
      console.log(err);
      throw new AppError("INTERNAL", "Error al renombrar el nodo");
    }
  };

  static readonly copyNode = async (req: Request, res: Response) => {
    const node = req.node!;
    let newName = req.body.newName;

    // Asegurarse de que la extension del nodo se mantenga igual
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
      newName = await NodeUtils.nameConflicts.getNextName(node, newName);
    }

    const srcPath = await NodeUtils.getNodePath(node);

    // Obtener hash del nuevo nodo
    const newHash = await genNodeHash(srcPath, newName);

    // Obtenemos la carpeta root (todavía no hay soporte para carpetas)
    const cloudRoot = path.resolve(process.cwd(), `${process.env.CLOUD_ROOT}`);
    const dest = path.resolve(cloudRoot, newHash);

    try {
      // Copiar el nuevo nodo de forma física y añadir un nueva fila a la base de datos
      await fs.copyFile(srcPath, dest);
      
      // Preparamos un resultado para devolver al frontend, ignorando el hash
      const { hash: _h, ...result } = await prisma.node.create({
        data: {
          name: newName,
          parentId: node.parentId,
          hash: newHash,
          size: node.size,
          mime: node.mime,
          isDir: node.isDir,
        }
      });

      return res.success(result);
    } catch (err) {
      if (err instanceof AppError) throw err;
      else throw new AppError("INTERNAL", "Error al copiar el nodo");
    }
  };
}
