import type { NodeType } from "@/types";

/**
 * @description Construye una lista de breadcrumbs desde un nodo dado hasta la raíz.
 * @param startNodeId ID del nodo desde el cual comenzar a construir los breadcrumbs.
 * @param nodes Lista de nodos disponibles para construir la ruta.
 * @returns Lista de nodos representando la ruta de breadcrumbs.
 */
export default function buildBreadcrumbs(
  startNodeId: NodeType["id"],
  nodes: NodeType[]
): Readonly<NodeType[]> {
  console.log("Building breadcrumbs for node ID:", startNodeId);
  console.log("Available nodes:", nodes);

  // Crear un mapa de nodos para acceso rápido
  const map = Object.fromEntries(nodes.map((n) => [n.id, n]));

  console.log("Map of nodes:", map);

  // Construir la ruta de los breadcrumbs
  const path = [];

  // Recorrer desde el nodo inicial hasta la raíz
  let node = map[startNodeId];
  while (node) {
    path.unshift(node);
    node = map[node.parentId ?? ""];
  }

  console.log(path);

  // Retornar la ruta construida
  return path;
}
