import type {
  FileNode,
  DirectoryNode,
  FileNodeLite,
  DirectoryNodeLite,
} from "./node";

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
  metadata: { createdAt: Date; updatedAt: Date },
): FileNode {
  return {
    id,
    parentId,
    name,
    hash,
    isDir: false,
    size,
    mime,
    ...metadata,
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
  metadata: { createdAt: Date; updatedAt: Date },
): DirectoryNode {
  return {
    id,
    parentId,
    name,
    hash,
    isDir: true,
    size,
    mime: "inode/directory",
    ...metadata,
  };
}

/**
 * @description Crea un nodo de archivo ligero
 * @param id ID del nodo
 * @param parentId ID del nodo padre
 * @param name Nombre del nodo
 * @param hash Hash del nodo
 * @param size Tamaño del nodo
 * @param mime Tipo MIME del archivo
 * @returns Nodo de archivo ligero
 */
export function createFileNodeLite(
  id: string,
  parentId: string | null,
  name: string,
  hash: string,
  size: bigint,
  mime: string,
): FileNodeLite {
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
 * @description Crea un nodo de directorio ligero
 * @param id ID del nodo
 * @param parentId ID del nodo padre
 * @param name Nombre del nodo
 * @param hash Hash del nodo
 * @param size Tamaño del nodo
 * @returns Nodo de directorio ligero
 */
export function createDirectoryNodeLite(
  id: string,
  parentId: string | null,
  name: string,
  hash: string,
  size: bigint,
): DirectoryNodeLite {
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
