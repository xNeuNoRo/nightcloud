import archiver from "archiver";
import type { Response } from "express";
import fs from "node:fs";

import { CloudStorageService } from "@/services/cloud/CloudStorage.service";
import { AppError, NodeUtils, pathExists } from "@/utils";
import { Node } from "@/domain/nodes/node";
import { NodeRepository } from "@/repositories/NodeRepository";
import { DescendantRow } from "@/infra/prisma/types";

export class DownloadService {
  private static readonly repo = NodeRepository;

  static readonly downloadFileNode = async (node: Node, res: Response) => {
    // Asegurarse de que no sea un directorio
    if (node.isDir) {
      throw new AppError(
        "BAD_REQUEST",
        "No se puede descargar una carpeta como archivo",
      );
    }

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
    rootNode: Node,
    res: Response,
  ) => {
    try {
      console.log("Iniciando descarga de directorio:", rootNode.name);
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

      // Manejo de errores del stream (con promesa para que llegue al flujo de Express)
      await new Promise<void>((resolve, reject) => {
        archive.on("error", (err) => {
          console.error("Error al generar ZIP:", err);

          // Si ya se enviaron headers, no podemos enviar un error JSON
          if (res.headersSent) {
            res.end(); // Cortar la conexión si ya empezó
            return resolve();
          }

          // Rechazar la promesa con un AppError
          reject(new AppError("INTERNAL", "Error al descargar el directorio"));
        });
      });

      // Conectamos el ZIP a la respuesta HTTP
      archive.pipe(res);
      console.log("Archiver conectado a la respuesta HTTP");

      // Obtener todos los archivos y subcarpetas.
      const descendants = await this.repo.getAllNodeDescendants(rootNode.id);

      // Hacemos un map que nos ayudará en la construcción de rutas
      const descendantMap = new Map<string, DescendantRow>(
        descendants.map((n) => [n.id, n]),
      );

      console.log(
        `mapa de descendientes construido con ${descendantMap.size} nodos`,
      );
      console.log(descendantMap);

      for (const node of descendants) {
        const relativePath = NodeUtils.buildRelativeNodePath(
          descendantMap,
          rootNode.id,
          node.id,
        );
        console.log(`Agregando al ZIP: ${relativePath}`);

        if (node.isDir) {
          // Agregamos la carpeta vacía para asegurar que exista en el ZIP
          archive.append(Buffer.from(""), { name: relativePath + "/" });
        } else {
          // Es un archivo: Obtenemos su ubicación física
          const physicalPath = CloudStorageService.getFilePath(node);

          // Verificamos si existe físicamente antes de intentar leerlo
          if (await pathExists(physicalPath)) {
            const fileStream = fs
              .createReadStream(physicalPath)
              .on("error", (err) => {
                console.error(`Error al leer el archivo ${physicalPath}:`, err);

                if (!archive.destroyed) {
                  archive.emit(
                    "error",
                    new AppError(
                      "INTERNAL",
                      `Error al leer el archivo ${node.name}`,
                    ),
                  );
                }
              });
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
