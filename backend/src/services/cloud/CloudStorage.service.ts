import type { FileNode, FileNodeLite } from "@/domain/nodes/node";
import { LocalCloudStorage } from "@/infra/cloud/LocalCloudStorage";
import type { AncestorRow, DescendantRow } from "@/infra/prisma/types";
import { NodeRepository } from "@/repositories/NodeRepository";

export class CloudStorageService {
  private static readonly storage: LocalCloudStorage = new LocalCloudStorage();
  private static readonly nodeRepo = NodeRepository;

  /**
   * @description Obtiene la ruta raiz en el almacenamiento en la nube
   * @returns Ruta absoluta del directorio raiz de almacenamiento en la nube
   */
  static async getCloudRootPath() {
    return await this.storage.ensureRoot();
  }

  /**
   * @description Obtiene estadísticas del almacenamiento en la nube
   * @returns Estadísticas del almacenamiento en la nube
   */
  static async getCloudStorageStats() {
    // Obtener estadísticas del disco y uso en la nube
    const { totalDisk, usedDisk, freeDisk } = await this.storage.getDiskStats();
    const usedCloud = await this.nodeRepo.sumNodesSize();

    // Convertir a BigInt para evitar problemas de precisión con números grandes
    const totalDiskBig = BigInt(totalDisk);
    const usedDiskBig = BigInt(usedDisk);
    const freeDiskBig = BigInt(freeDisk);

    // Cuota libre en la nube - osea, el espacio libre basado solamente en lo usado en la nube
    const quotaFree = totalDiskBig - usedCloud;

    // Uso fuera de la nube
    const usedOther = usedDiskBig > usedCloud ? usedDiskBig - usedCloud : 0n;

    // El espacio disponible es el mínimo entre la cuota libre y el espacio libre en disco
    const availableCloud = quotaFree < freeDiskBig ? quotaFree : freeDiskBig; // NOSONAR - Evitar alerta ya que no es posible usar Math con BigInt

    return {
      // Uso del disco completo
      disk: {
        total: totalDiskBig.toString(),
        used: usedDiskBig.toString(),
        free: freeDiskBig.toString(),
      },

      // Uso específico del disco especificamente para la nube
      cloud: {
        used: usedCloud.toString(),
        available: availableCloud.toString(),
      },

      // Uso fuera de la nube
      other: {
        used: usedOther.toString(),
      },
    };
  }

  /**
   * @description Obtiene la ruta completa de un archivo en el almacenamiento en la nube
   * @param file Nodo del cual obtener la ruta
   * @returns Ruta completa del archivo en el almacenamiento en la nube
   */
  static getFilePath(
    file: FileNodeLite | FileNode | AncestorRow | DescendantRow,
  ) {
    return this.storage.getFilePath(file);
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
