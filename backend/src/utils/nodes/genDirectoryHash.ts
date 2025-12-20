import crypto from "node:crypto";

import { computeNodeIdentity } from "@/domain/nodes/identity/computeNodeIdentity";

/**
 * @description
 * @param nodeName Nombre del nodo completo
 * @param parentId Id del padre del nodo
 * @returns string Hash SHA256 del nodo + nombre con su extension
 */
export default function genDirectoryHash(
  nodeName: string,
  parentId: string | null,
) {
  // Crear hash SHA256 del nodo
  const hash = crypto.createHash("sha256");

  // Agregar el nombre y parentId, si aplica, del nodo al hash
  const { identityName } = computeNodeIdentity(nodeName, parentId);
  hash.update(identityName);

  // Retornar el hash en formato hexadecimal y agregar o no la extension original
  return hash.digest("hex");
}
