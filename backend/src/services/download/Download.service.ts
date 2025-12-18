import archiver from "archiver";
import type { Response } from "express";
import fs from "node:fs";

import { DB } from "@/config/db";
import { CloudStorageService } from "@/services/cloud/CloudStorage.service";
import { AppError } from "@/utils";
import type { Node } from "@/infra/prisma/generated/client";

type NodeMapItem = {
  id: string;
  parentId: string | null;
  name: string;
  isDir: boolean;
};

export class DownloadService {
  static readonly downloadNode = async (node: Node, res: Response) => {
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

  static readonly downloadDirectory = async (rootNode: Node, res: Response) => {
    try {
      // Establecemos los headers
      const zipName = `${rootNode.name}.zip`;
      res.attachment(zipName);
      res.setHeader("Content-Type", "application/zip");

      // Inicializamos archiver
      const archive = archiver("zip", {
        zlib: {
          level: 9,
        },
      });

      // Manejo de errores del stream
      archive.on("error", (err) => {
        console.error("Error al generar ZIP:", err);

        if (res.headersSent) {
          res.end(); // Cortar la conexión si ya empezó
        } else {
          throw new AppError("INTERNAL", "Error generando el archivo ZIP");
        }
      });

      // Conectamos el ZIP a la respuesta HTTP
      archive.pipe(res);

      // Obtener todos los archivos y subcarpetas.
      const prisma = DB.getClient();
      const descendants = await prisma.getDescendants(rootNode.id);

      // Hacemos un map que nos ayudará en la construcción de rutas
      const nodeMap = new Map<string, NodeMapItem>();

      for (const node of descendants) {
        nodeMap.set(node.id, {
          id: node.id,
          parentId: node.parentId,
          name: node.name,
          isDir: node.isDir,
        });
      }

      // Función auxiliar para construir la ruta relativa de un nodo
      const buildRelativePath = (nodeId: string): string => {
        let current = nodeMap.get(nodeId);
        const parts: string[] = [];

        while (current) {
          // Agregamos el nombre actual al inicio de la lista
          parts.unshift(current.name);

          // Si llegamos al nodo raíz que estamos descargando, terminamos
          if (current.id === rootNode.id) {
            break;
          }

          // Subimos al padre
          if (current.parentId) {
            current = nodeMap.get(current.parentId);
          } else {
            // Si no tiene padre y no es el root (caso raro de data corrupta), salimos
            current = undefined;
          }
        }

        return parts.join("/");
      };

      for (const node of descendants) {
        const relativePath = buildRelativePath(node.id);
        console.log(relativePath);

        if (node.isDir) {
          // Agregamos la carpeta vacía para asegurar que exista en el ZIP
          archive.append(Buffer.from(""), { name: relativePath + "/" });
        } else {
          // Es un archivo: Obtenemos su ubicación física
          const physicalPath = CloudStorageService.getFilePath(
            node as unknown as Node,
          );

          // Verificamos si existe físicamente antes de intentar leerlo
          if (fs.existsSync(physicalPath)) {
            const fileStream = fs.createReadStream(physicalPath);
            archive.append(fileStream, { name: relativePath });
          } else {
            console.warn(`Archivo físico no encontrado: ${physicalPath}`);
          }
        }
      }

      // Finalizar el ZIP (envía los últimos bytes al cliente)
      await archive.finalize();
    } catch (err) {
      console.error("Error en downloadDirectory:", err);
      // Si falló antes de enviar headers, enviamos error JSON
      if (!res.headersSent) {
        throw new AppError(
          "INTERNAL",
          "Error al procesar la descarga del directorio",
        );
      }
    }
  };
}
