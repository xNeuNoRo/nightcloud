import type { Node } from "@/infra/prisma/generated/client";

/**
 * @description Interfaz para el almacenamiento en la nube.
 */
export interface CloudStorage {
  /**
   * @description Asegura que el directorio raiz de almacenamiento en la nube exista.
   */
  ensureRoot(): Promise<string>;

  /**
   * @description Verifica si una ruta existe en el sistema de archivos.
   * @param filePaths Array de rutas completas de los archivos a eliminar
   */
  deleteFiles(filePaths: string[]): Promise<void>;

  /**
   * @description Verifica si una ruta existe en el sistema de archivos.
   * @param file ruta a verificar
   */
  getFilePath(file: Node): string;
}
