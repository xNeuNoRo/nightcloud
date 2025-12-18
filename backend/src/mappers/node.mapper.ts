import { Node } from "@/infra/prisma/generated/client";
import { NodeDTO } from "@/dtos/node.dto";

type NodePicked = Pick<
  Node,
  "id" | "parentId" | "name" | "size" | "mime" | "isDir"
>;

export const toNodeDTO = (n: NodePicked): NodeDTO => ({
  id: n.id,
  parentId: n.parentId,
  name: n.name,
  size: n.size,
  mime: n.mime,
  isDir: n.isDir,
});
