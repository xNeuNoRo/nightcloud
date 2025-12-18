import { Node } from "@/domain/nodes/node";
import { NodeDTO } from "@/dtos/node.dto";

type NodePicked = Pick<
  Node,
  "id" | "parentId" | "name" | "size" | "mime" | "isDir"
>;

export const toNodeDTO = (n: NodePicked): NodeDTO => ({
  id: n.id,
  parentId: n.parentId,
  name: n.name,
  size: n.size.toString(), // Convertir bigint a string por temas de incompatibilidad con JSON
  mime: n.mime,
  isDir: n.isDir,
});
