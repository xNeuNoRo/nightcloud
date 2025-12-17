import { LocalCloudStorage } from "@/infra/cloud/LocalCloudStorage";
import { Node } from "@/infra/prisma/generated/client";

export class CloudStorageService {
  private static readonly storage: LocalCloudStorage = new LocalCloudStorage();

  /**
   * @description Obtiene la ruta raiz en el almacenamiento en la nube
   * @returns Ruta absoluta del directorio raiz de almacenamiento en la nube
   */
  static async getCloudRootPath() {
    return await this.storage.ensureRoot();
  }

  /**
   * @description Obtiene la ruta completa de un archivo en el almacenamiento en la nube
   * @param file Nodo del cual obtener la ruta
   * @returns Ruta completa del archivo en el almacenamiento en la nube
   */
  static async getFilePath(file: Node) {
    return await this.storage.getFilePath(file);
  }

  /**
   * @description Verifica si un archivo existe en el almacenamiento en la nube
   * @param filePath Ruta completa del archivo a verificar
   * @returns boolean indica si el archivo existe o no
   */
  static async fileExists(filePath: string) {
    return await this.storage.exists(filePath);
  }

  /**
   * @description Elimina un archivo del almacenamiento en la nube
   * @param filePath Ruta completa del archivo a eliminar
   * @returns void
   */
  static async delete(filePath: string) {
    return await this.storage.delete(filePath);
  }

  /**
   * @description Mueve un archivo dentro del almacenamiento en la nube
   * @param srcPath Ruta actual del archivo
   * @param destPath Nueva ruta del archivo
   * @returns void
   */
  static async move(srcPath: string, destPath: string) {
    return await this.storage.move(srcPath, destPath);
  }

  /**
   * @description Copia un archivo dentro del almacenamiento en la nube
   * @param srcPath Ruta actual del archivo
   * @param destPath Nueva ruta del archivo
   * @returns void
   */
  static async copy(srcPath: string, destPath: string) {
    return await this.storage.copy(srcPath, destPath);
  }

  /**
   * @description Elimina multiples archivos del almacenamiento en la nube
   * @param filePaths Array de rutas completas de los archivos a eliminar
   * @returns void
   */
  static async deleteFiles(filePaths: string[]) {
    return await this.storage.deleteFiles(filePaths);
  }
}
