import type { NodeLite } from "@/domain/nodes/node";
import { CloudStorageService } from "@/services/cloud/CloudStorage.service";

import type { ZipEntryType } from "../download/zip-stream.types";
import type { DescendantRow } from "../prisma/types";

/**
 * @description Mapea un nodo a una entrada de zip.
 * @param node Nodo archivo, directorio o descendiente a mapear
 * @param relativePath Ruta relativa dentro del zip
 * @returns Entrada de zip mapeada
 */
export function toZipEntry(
  node: NodeLite | DescendantRow,
  relativePath: string,
): ZipEntryType {
  return node.isDir
    ? {
        isDir: true,
        relativePath,
      }
    : {
        isDir: false,
        relativePath,
        physicalPath: CloudStorageService.getFilePath(node),
      };
}
