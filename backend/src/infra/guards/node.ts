import type { DirectoryNode, FileNode } from "@/domain/nodes/node";

/**
 * @description TypeGuard que verifica si un nodo es un FileNode.
 * @param node Nodo a verificar
 * @returns true si el nodo es un FileNode, false en caso contrario
 */
export function isFileNode(node: unknown): node is FileNode {
  if (typeof node !== "object" || node === null) return false;
  const nodeRecord = node as Record<string, unknown>;
  return (
    typeof nodeRecord.id === "string" &&
    (typeof nodeRecord.parentId === "string" || nodeRecord.parentId === null) &&
    typeof nodeRecord.name === "string" &&
    typeof nodeRecord.hash === "string" &&
    typeof nodeRecord.size === "number" &&
    typeof nodeRecord.mime === "string" &&
    nodeRecord.mime !== "inode/directory" &&
    nodeRecord.isDir === false
  );
}

/**
 * @description TypeGuard que verifica si un nodo es un DirectoryNode.
 * @param node Nodo a verificar
 * @returns true si el nodo es un DirectoryNode, false en caso contrario
 */
export function isDirectoryNode(node: unknown): node is DirectoryNode {
  if (typeof node !== "object" || node === null) return false;
  const nodeRecord = node as Record<string, unknown>;
  return (
    typeof nodeRecord.id === "string" &&
    (typeof nodeRecord.parentId === "string" || nodeRecord.parentId === null) &&
    typeof nodeRecord.name === "string" &&
    typeof nodeRecord.hash === "string" &&
    typeof nodeRecord.size === "number" &&
    nodeRecord.mime === "inode/directory" &&
    nodeRecord.isDir === true
  );
}
