import { computeNodeIdentity } from "@/domain/nodes/identity/computeNodeIdentity";
import crypto from "node:crypto";


export default function genDirectoryHash(nodeName: string, parentId: string | null) {
  // Crear hash SHA256 del nodo
  const hash = crypto.createHash("sha256");

  // Agregar el nombre y parentId, si aplica, del nodo al hash
  const { identityName } = computeNodeIdentity(nodeName, parentId);
  hash.update(identityName);

  // Retornar el hash en formato hexadecimal y agregar o no la extension original
  return hash.digest("hex");
}
