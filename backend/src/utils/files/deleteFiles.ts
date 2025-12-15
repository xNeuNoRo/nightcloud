import fs from "fs/promises";
import { AppError } from "../errors/handler";

export default async function deleteFiles(filePaths: string[]) {
  // Declare an array of promises for deleting files
  const deletePromises = filePaths.map(async (filePath) => {
    return fs.unlink(filePath);
  });

  // Execute all delete operations in parallel and collect results
  const results = await Promise.allSettled(deletePromises);

  const failedDeletions = results
    .map((res, idx) => {
      if (res.status === "rejected") {
        return { filePath: filePaths[idx], reason: res.reason };
      }
      return null;
    })
    .filter(Boolean);

  if (failedDeletions.length > 0) {
    const errorMessages = failedDeletions
      .map((f) => `File: ${f?.filePath}, Error: ${f?.reason}`)
      .join(";\n");
    throw new AppError(
      "INTERNAL",
      `Error al eliminar los siguientes archivos:\n${errorMessages}`,
    );
  }
}
