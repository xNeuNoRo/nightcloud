import path from "node:path";
import { DB } from "@/config/db";
import { AppError, NodeUtils } from "@/utils";
import { Request, Response } from "express";
import { NodeService } from "@/services/nodes/Node.service";
import { CloudStorageService } from "@/services/cloud/CloudStorage.service";

const prisma = DB.getClient();

export class NodeController {
  static readonly createNode = async (req: Request, res: Response) => {
    // Se necesita:
    //  id del parent, null si es root : string?
    //  nombre del archivo : string?
    //  si es dir : boolean

    // Por hacer:
    //  - Implementar manejo de conflictos de carpetas
    //  - Implementar hash de carpetas en base al parent dir

    const { parentId, name, isDir } = req.body;

    if (!isDir) {
      throw new AppError("La creación de archivos no está implementada");
    }

    const prisma = DB.getClient();
    let finalName = name;

    if (!name) {
      finalName = "Untitled Folder";
    }

    const hash = await NodeUtils.genDirectoryHash(finalName);
    const mime = "inode/directory";

    try {
      const { hash: _h, ...node } = await prisma.node.create({
        data: {
          name: finalName,
          hash,
          parentId,
          size: 0,
          mime,
          isDir,
        },
      });

      res.success(node);
    } catch (err) {
      console.log(err);
      throw new AppError("INTERNAL", "Error al crear el nodo");
    }
  };

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

  // Obtener todos los nodos desde la raiz
  static readonly getNodesFromRoot = async (req: Request, res: Response) => {
    try {
      const nodes = await NodeService.getAllNodes(null);
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

  // Eliminar un nodo
  static readonly deleteNode = async (req: Request, res: Response) => {
    try {
      await NodeService.deleteNode(req.node!);
      res.success(undefined, 204);
    } catch (err) {
      if (err instanceof AppError) throw err;
      else throw new AppError("INTERNAL", "Error al eliminar el nodo");
    }
  };

  // Descargar un nodo
  static readonly downloadNode = async (req: Request, res: Response) => {
    const node = req.node!;

    try {
      // Get the node path
      const nodePath = await CloudStorageService.getFilePath(node);

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

  // Renombrar un nodo
  static readonly renameNode = async (
    req: Request<{}, {}, { newName: string }>,
    res: Response,
  ) => {
    const node = req.node!;

    // Asegurarse de que la extension del nodo se mantenga igual
    let newName = NodeUtils.ensureNodeExt(req.body.newName, node);

    // Verificar si el nuevo nombre ya existe en el mismo directorio
    const conflict = await NodeService.detectConflict(node, newName, true);

    // Si hay conflicto, obtener un nombre unico
    if (conflict) {
      const uniqueName = await NodeService.resolveName(node, newName);
      console.log("Resolved name conflict, new unique name:", uniqueName);
      newName = uniqueName;
    }

    try {
      // Actualizar el nombre del nodo
      const { hash, ...updatedNode } = await NodeService.updateNodeName(
        node.id,
        newName,
      );

      res.success(updatedNode);
    } catch (err) {
      console.log(err);
      throw new AppError("INTERNAL", "Error al renombrar el nodo");
    }
  };

  // Copiar un nodo
  static readonly copyNode = async (req: Request, res: Response) => {
    const node = req.node!;

    // Asegurarse de que la extension del nodo se mantenga igual
    let newName = NodeUtils.ensureNodeExt(req.body.newName, node);

    // Verificar si el nuevo nombre ya existe en el mismo directorio
    const conflict = await NodeService.detectConflict(node, newName);

    // Detectamos si existe un conflicto
    if (conflict) {
      newName = await NodeService.resolveName(node, newName);
    }

    // Obtener la ruta del archivo original
    const srcPath = await CloudStorageService.getFilePath(node);

    // Obtener hash del nuevo nodo
    const newHash = await NodeUtils.genFileHash(srcPath, newName);

    // Obtenemos la carpeta root (todavía no hay soporte para carpetas)
    const cloudRoot = await CloudStorageService.getCloudRootPath();
    const dest = path.resolve(cloudRoot, newHash);

    try {
      // Copiar el nuevo nodo de forma física y añadir un nueva fila a la base de datos
      await CloudStorageService.copy(srcPath, dest);

      // Preparamos un resultado para devolver al frontend, ignorando el hash
      const { hash: _h, ...result } = await NodeService.createNode({
        name: newName,
        parent: node.parentId ? { connect: { id: node.parentId } } : undefined,
        hash: newHash,
        size: node.size,
        mime: node.mime,
        isDir: node.isDir,
      });

      return res.success(result);
    } catch (err) {
      if (err instanceof AppError) throw err;
      else throw new AppError("INTERNAL", "Error al copiar el nodo");
    }
  };
}
