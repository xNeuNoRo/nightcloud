import fs from "node:fs/promises";
import path from "node:path";

import type { CloudStorage } from "@/services/cloud/CloudStorage";
import { AppError, pathExists } from "@/utils";

import type { Node } from "../prisma/generated/client";

/**
 * @description Implementación de almacenamiento en la nube local.
 */
export class LocalCloudStorage implements CloudStorage {
  /**
   * @description Ruta absoluta del directorio raiz de almacenamiento en la nube local
   */
  private static cloudPath: string | null = null;

  /**
   * @description Asegura que el directorio raiz de almacenamiento en la nube local exista.
   * @returns Ruta absoluta del directorio raiz de almacenamiento en la nube local
   */
  async ensureRoot(): Promise<string> {
    if (!LocalCloudStorage.cloudPath) {
      LocalCloudStorage.cloudPath = path.resolve(
        process.cwd(),
        process.env.CLOUD_ROOT || "cloud",
      );
    }

    if (!(await pathExists(LocalCloudStorage.cloudPath))) {
      await fs.mkdir(LocalCloudStorage.cloudPath, { recursive: true });
    }

    return LocalCloudStorage.cloudPath;
  }

  /**
   * @description Verifica si una ruta existe en el sistema de archivos.
   * @param path ruta a verificar
   * @returns boolean indica si la ruta existe o no
   */
  async exists(path: string): Promise<boolean> {
    return pathExists(path);
  }

  /**
   * @description Mueve un archivo de una ruta temporal a una ruta final.
   * @param tmpPath Ruta temporal del archivo
   * @param finalPath Ruta final del archivo
   */
  async move(tmpPath: string, finalPath: string): Promise<void> {
    await fs.rename(tmpPath, finalPath);
  }

  /**
   * @description Copia un archivo de una ruta a otra.
   * @param srcPath Ruta fuente del archivo
   * @param destPath Ruta destino del archivo
   */
  async copy(srcPath: string, destPath: string): Promise<void> {
    await fs.copyFile(srcPath, destPath);
  }

  /**
   * @description Elimina un archivo local.
   * @param path Ruta completa del archivo a eliminar
   */
  async delete(path: string): Promise<void> {
    await fs.unlink(path);
  }

  /**
   * @description Elimina archivos locales dados sus paths.
   * @param filePaths Array de rutas completas de los archivos a eliminar
   * @throws AppError si ocurre un error al eliminar alguno de los nodos
   */
  async deleteFiles(filePaths: string[]) {
    // Declare an array of promises for deleting nodes
    const deletePromises = filePaths.map(async (nodePath) => {
      return fs.unlink(nodePath);
    });

    // Execute all delete operations in parallel and collect results
    const results = await Promise.allSettled(deletePromises);

    const failedDeletions = results.flatMap((res, idx) =>
      res.status === "rejected"
        ? [
            {
              nodePath: filePaths[idx],
              reason: res.reason as NodeJS.ErrnoException,
            },
          ]
        : [],
    );

    if (failedDeletions.length > 0) {
      const errorMessages = failedDeletions
        .map((n) => `Node: ${n?.nodePath}, Error: ${n?.reason}`)
        .join(";\n");
      throw new AppError(
        "INTERNAL",
        `Error al eliminar los siguientes nodos:\n${errorMessages}`,
      );
    }
  }

  /**
   * @description Obtiene la ruta completa del archivo asociado a un nodo.
   * @param node Nodo del cual se desea obtener la ruta completa del archivo
   * @returns string ruta completa del archivo en el sistema de archivos
   */
  getFilePath(file: Node) {
    console.log(`Getting node path for node: ${file.id}, isDir: ${file.isDir}`);

    // Agregar mas logica en un futuro al manejar las carpetas
    if (file.isDir)
      throw new AppError("INTERNAL", "No soportado para carpetas");

    // Construir la ruta completa del archivo
    const cloudRoot = path.resolve(process.cwd(), `${process.env.CLOUD_ROOT}`);
    const filePath = path.resolve(cloudRoot, file.hash);

    // Asegurarse de que el archivo este dentro del directorio CLOUD_ROOT (vulnerabilidad de path traversal)
    if (!filePath.startsWith(cloudRoot + path.sep)) {
      throw new AppError("FILE_NOT_FOUND");
    }

    return filePath;
  }
}
