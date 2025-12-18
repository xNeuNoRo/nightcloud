import path from "node:path";

import type { Node } from "@/infra/prisma/generated/client";

/**
 * @description Asegura que el nuevo nombre de un nodo mantenga su extensión original.
 * @param newName Nuevo nombre propuesto para el nodo
 * @param node Nodo original
 * @returns string Nombre con la extensión asegurada
 */
// El proposito de esta funcion es evitar que se borre la extension de un nodo al renombrarlo
export default function ensureNodeExt(newName: string, node: Node) {
  let name = newName;

  // Asegurarse de que la extension del nodo se mantenga igual
  const nodeExt = path.extname(newName);
  if (!nodeExt || nodeExt.length === 0 || nodeExt !== path.extname(node.name)) {
    name += path.extname(node.name);
  }

  return name;
}
