import fs from "fs/promises";
import { AppError } from "../errors/handler";

/**
 *
 * @param nodePaths Array de rutas completas de los nodos a eliminar
 * @throws AppError si ocurre un error al eliminar alguno de los archivos
 */

export default async function deleteNodes(nodePaths: string[]) {
  // Declare an array of promises for deleting nodes
  const deletePromises = nodePaths.map(async (nodePath) => {
    return fs.unlink(nodePath);
  });

  // Execute all delete operations in parallel and collect results
  const results = await Promise.allSettled(deletePromises);

  const failedDeletions = results.flatMap((res, idx) =>
    res.status === "rejected"
      ? [{ nodePath: nodePaths[idx], reason: res.reason }]
      : [],
  );

  if (failedDeletions.length > 0) {
    const errorMessages = failedDeletions
      .map((n) => `Node: ${n?.nodePath}, Error: ${n?.reason}`)
      .join(";\n");
    throw new AppError(
      "INTERNAL",
      `Error al eliminar los siguientes archivos:\n${errorMessages}`,
    );
  }
}
