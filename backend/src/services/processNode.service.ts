import { NodeUtils, CloudUtils, AppError } from "@/utils";

/**
 *
 * @param file nodo subido via Multer
 * @param parentId ID del nodo padre donde se almacenara el nodo
 * @returns Node creado en la base de datos
 */

export async function processNode(
  file: Express.Multer.File,
  parentId: string | null,
) {
  try {
    const { nodeName, nodeHash } =
      await NodeUtils.ProcessUtils.resolveNodeIdentity(file, parentId);
    const cloudPath = await CloudUtils.ensureCloudRoot();

    console.log(`Processing node: ${nodeName}`);
    const node = await NodeUtils.ProcessUtils.persistNode(
      file,
      parentId,
      nodeName,
      nodeHash,
      cloudPath,
    );

    console.log(`Node processed: ${nodeName} as ${nodeHash}`);
    return node;
  } catch (err) {
    console.error(err);
    await NodeUtils.deleteNodes([file.path]); // Limpiar archivo temporal en caso de error
    throw new AppError("INTERNAL", "Error al procesar el nodo");
  }
}
