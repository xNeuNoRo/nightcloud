// Base de un nodo, lo que siempre sera igual entre archivos y directorios
export interface NodeBase {
  id: string;
  parentId: string | null;
  name: string;
  hash: string;
  isDir: boolean;
  size: bigint;
}

// Nodo que representa un archivo
export interface FileNode extends NodeBase {
  isDir: false;
  mime: string;
}

// Nodo que representa un directorio
export interface DirectoryNode extends NodeBase {
  isDir: true;
  mime: "inode/directory";
}

// Tipo union de nodo, puede ser archivo o directorio
export type Node = FileNode | DirectoryNode;
