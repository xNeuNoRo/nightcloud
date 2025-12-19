import type { Node } from "@/domain/nodes/node";
import {
  createDirectoryNode,
  createFileNode,
} from "@/domain/nodes/node.factory";
import type { Node as PrismaNode } from "@/infra/prisma/generated/client";

export function fromPrismaNode(n: PrismaNode): Node {
  return n.isDir
    ? createDirectoryNode(n.id, n.parentId, n.name, n.hash, n.size)
    : createFileNode(n.id, n.parentId, n.name, n.hash, n.size, n.mime);
}
