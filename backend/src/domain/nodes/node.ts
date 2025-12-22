// Base de un nodo, lo que siempre sera igual entre archivos y directorios

/**
 * @property id ID del nodo
 * @property parentId ID del nodo padre, null si es raiz
 * @property name Nombre del nodo
 * @property hash Hash del nodo
 * @property isDir Indica si el nodo es un directorio
 * @property size Tamaño del nodo en bytes
 */
export interface NodeBase {
  id: string;
  parentId: string | null;
  name: string;
  hash: string;
  isDir: boolean;
  size: bigint;
  createdAt: Date;
  updatedAt: Date;
}

// Nodo que representa un archivo
/**
 * @property isDir Siempre false para archivos
 * @property mime Tipo MIME del archivo
 */
export interface FileNode extends NodeBase {
  isDir: false;
  mime: string;
}

/**
 * @description Versión ligera de FileNode para evitar importar Date
 */
export interface FileNodeLite extends Pick<
  FileNode,
  "id" | "parentId" | "name" | "hash" | "size" | "mime" | "isDir"
> {}

// Nodo que representa un directorio
/**
 * @property isDir Siempre true para directorios
 * @property mime Siempre "inode/directory" para directorios
 */
export interface DirectoryNode extends NodeBase {
  isDir: true;
  mime: "inode/directory";
}

/**
 * @description Versión ligera de DirectoryNode para evitar importar Date
 */
export interface DirectoryNodeLite extends Pick<
  DirectoryNode,
  "id" | "parentId" | "name" | "hash" | "size" | "mime" | "isDir"
> {}

// Tipo union de nodo, puede ser archivo o directorio
export type Node = FileNode | DirectoryNode;
export type NodeLite = FileNodeLite | DirectoryNodeLite;
