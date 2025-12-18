import { buildConflictRegex } from "@/domain/nodes/conflicts/buildConflictRegex";
import { getNextName } from "@/domain/nodes/conflicts/getNextName";
import { computeNodeIdentity } from "@/domain/nodes/identity/computeNodeIdentity";
import { Node } from "@/domain/nodes/node";
import { UploadedFile } from "@/domain/uploads/uploaded-file";
import { NodeRepository } from "@/repositories/NodeRepository";
import { NodeUtils } from "@/utils";

/**
 * @description Servicio para resolver identidades únicas de nodos.
 */
export class NodeIdentityService {
  private static readonly repo = NodeRepository;

  /**
   * @description Resuelve el nombre y hash únicos para un archivo subido.
   * @param file Archivo subido via Multer
   * @param parentId ID del nodo padre
   * @returns Objeto con nodeName y nodeHash únicos
   */
  static async resolve(file: UploadedFile, parentId: string | null) {
    let nodeName = file.originalname;

    let nodeHash = await NodeUtils.genFileHash(
      file.path,
      computeNodeIdentity(file.originalname, parentId).identityName,
    );

    const conflict = await this.repo.findByHashAndParentId(nodeHash, parentId);

    if (!conflict) {
      return { nodeName, nodeHash };
    }

    if (conflict.parentId === parentId) {
      const conflictingNames = await this.repo.findConflictingNames(
        parentId,
        buildConflictRegex(nodeName),
      );

      nodeName = getNextName(nodeName, conflictingNames);
      file.originalname = nodeName;
    }

    nodeHash = await NodeUtils.genFileHash(
      file.path,
      computeNodeIdentity(file.originalname, parentId).identityName,
    );

    return { nodeName, nodeHash };
  }

  /**
   * @description Resuelve un nombre único para un nodo dentro de su carpeta padre.
   * @param parentId ParentId del nodo a resolver
   * @param name Nombre original del nodo a resolver
   * @param newName Nuevo nombre propuesto (opcional)
   * @returns string Nombre único resuelto
   */
  static async resolveName(
    parentId: Node["parentId"],
    name: Node["name"],
    newName?: string,
  ): Promise<string> {
    const targetName = newName ?? name;
    const regexPattern = buildConflictRegex(targetName);

    const existingNames = await this.repo.findConflictingNames(
      parentId,
      regexPattern,
    );

    return getNextName(targetName, existingNames);
  }
}
