import { FileNode, DirectoryNode } from "./node";

// Factory para crear nodos de archivo y directorio

/**
 * @description Crea un nodo de archivo
 * @param id ID del nodo
 * @param parentId ID del nodo padre
 * @param name Nombre del nodo
 * @param hash Hash del nodo
 * @param size Tamaño del nodo
 * @param mime Tipo MIME del archivo
 * @returns Nodo de archivo
 */
export function createFileNode(
  id: string,
  parentId: string | null,
  name: string,
  hash: string,
  size: bigint,
  mime: string,
): FileNode {
  return {
    id,
    parentId,
    name,
    hash,
    isDir: false,
    size,
    mime,
  };
}

/**
 * @description Crea un nodo de directorio
 * @param id ID del nodo
 * @param parentId ID del nodo padre
 * @param name Nombre del nodo
 * @param hash Hash del nodo
 * @param size Tamaño del nodo
 * @returns Nodo de directorio
 */
export function createDirectoryNode(
  id: string,
  parentId: string | null,
  name: string,
  hash: string,
  size: bigint,
): DirectoryNode {
  return {
    id,
    parentId,
    name,
    hash,
    isDir: true,
    size,
    mime: "inode/directory",
  };
}
