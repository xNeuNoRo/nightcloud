import type { Node } from "@/domain/nodes/node";
import {
  createDirectoryNode,
  createFileNode,
} from "@/domain/nodes/node.factory";
import type { Node as PrismaNode } from "@/infra/prisma/generated/client";

import type { AncestorRow, DescendantRow } from "../prisma/types";

/**
 * @description Mapea un nodo Prisma a un nodo de dominio.
 * @param n Nodo Prisma a mapear
 * @returns Nodo de dominio mapeado
 */
export function fromPrismaNode(n: PrismaNode): Node {
  return n.isDir
    ? createDirectoryNode(n.id, n.parentId, n.name, n.hash, n.size)
    : createFileNode(n.id, n.parentId, n.name, n.hash, n.size, n.mime);
}

/**
 * @description Mapea una fila de ancestro a un nodo de dominio.
 * @param r Fila de ancestro a mapear
 * @returns Nodo de dominio mapeado
 */
export function fromAncestorRow(r: AncestorRow): Node {
  return fromPrismaNode(r);
}

/**
 * @description Mapea una fila de descendiente a un nodo de dominio.
 * @param r Fila de descendiente a mapear
 * @returns Nodo de dominio mapeado
 */
export function fromDescendantRow(r: DescendantRow): Node {
  return fromPrismaNode(r);
}
