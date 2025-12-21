import type { Node } from "@/domain/nodes/node";
import type { AncestorDTO, NodeDTO } from "@/dtos/node.dto";

import type { AncestorRow } from "../prisma/types";

type NodePicked = Pick<
  Node,
  "id" | "parentId" | "name" | "size" | "mime" | "isDir"
>;

type AncestorPicked = Pick<
  AncestorRow,
  "id" | "parentId" | "name" | "size" | "mime" | "isDir" | "depth"
>;

/**
 * @description Mapea un nodo de dominio a un NodeDTO.
 * @param n Nodo de dominio a mapear
 * @returns NodeDTO mapeado
 */
export const toNodeDTO = (n: NodePicked): NodeDTO => ({
  id: n.id,
  parentId: n.parentId,
  name: n.name,
  size: n.size.toString(), // Convertir bigint a string por temas de incompatibilidad con JSON
  mime: n.mime,
  isDir: n.isDir,
});

export const toAncestorDTO = (n: AncestorPicked): AncestorDTO => ({
  id: n.id,
  parentId: n.parentId,
  name: n.name,
  size: n.size.toString(), // Convertir bigint a string por temas de incompatibilidad con JSON
  mime: n.mime,
  isDir: n.isDir,
  depth: n.depth,
});
