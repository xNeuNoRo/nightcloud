import type { NodeType } from "@/types";

export default function sortNodes(nodes: NodeType[]) {
  return Array.from(nodes).sort((a, b) => {
    if (a.isDir === b.isDir) {
      return a.name.localeCompare(b.name);
    }
    return a.isDir ? -1 : 1;
  });
}
