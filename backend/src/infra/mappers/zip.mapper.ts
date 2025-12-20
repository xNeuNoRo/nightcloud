import { CloudStorageService } from "@/services/cloud/CloudStorage.service";

import type { ZipEntryType } from "../download/zip-stream.types";
import type { DescendantRow } from "../prisma/types";

/**
 * @description Mapea un nodo de descendiente a una entrada de zip.
 * @param node Nodo de descendiente a mapear
 * @param relativePath Ruta relativa dentro del zip
 * @returns Entrada de zip mapeada
 */
export function toZipEntry(
  node: DescendantRow,
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
