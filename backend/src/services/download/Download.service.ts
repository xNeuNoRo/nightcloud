import type { Response } from "express";

import type { DirectoryNode, FileNode } from "@/domain/nodes/node";
import { zipStreamDirectory } from "@/infra/download/zip-stream";
import { toZipEntry } from "@/infra/mappers/zip.mapper";
import type { DescendantRow } from "@/infra/prisma/types";
import { NodeRepository } from "@/repositories/NodeRepository";
import { CloudStorageService } from "@/services/cloud/CloudStorage.service";
import { AppError } from "@/utils";
import buildRelativeNodePath from "@/utils/nodes/buildRelativePath";

export class DownloadService {
  private static readonly repo = NodeRepository;

  static readonly downloadNode = async (
    node: FileNode | DirectoryNode,
    res: Response,
  ) => {
    if (node.isDir) {
      await this.downloadDirectoryNode(node, res);
    } else {
      await this.downloadFileNode(node, res);
    }
  };

  static readonly downloadFileNode = async (node: FileNode, res: Response) => {
    // Get the node path
    const nodePath = CloudStorageService.getFilePath(node);

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
  };

  static readonly downloadDirectoryNode = async (
    rootNode: DirectoryNode,
    res: Response,
  ) => {
    try {
      console.log("Iniciando descarga de directorio:", rootNode.name);
      const zipName = `${rootNode.name}.zip`;
      // Obtener todos los archivos y subcarpetas.
      const descendants = await this.repo.getAllNodeDescendants(rootNode.id);

      // Hacemos un map que nos ayudará en la construcción de rutas
      const descendantMap = new Map<string, DescendantRow>(
        descendants.map((n) => [n.id, n]),
      );

      // Construir todas las entradas que se agregarán al ZIP
      // Función generadora para las entradas del ZIP
      const entries = (function* () {
        // Se itera sobre todos los nodos descendientes
        for (const n of descendants) {
          // Se genera una entrada de ZIP cada vez que se solicita
          yield toZipEntry(
            n,
            buildRelativeNodePath(descendantMap, rootNode.id, n.id),
          );
        }
      })();

      // Crear el stream del ZIP
      await zipStreamDirectory({
        res,
        zipName,
        entries,
        options: { level: 3 },
      });
    } catch (err) {
      console.error("Error en downloadDirectory:", err);
      throw err;
    }
  };
}
