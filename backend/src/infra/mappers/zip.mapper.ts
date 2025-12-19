import { CloudStorageService } from "@/services/cloud/CloudStorage.service";

import type { ZipEntryType } from "../download/zip-stream.types";
import type { DescendantRow } from "../prisma/types";

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
