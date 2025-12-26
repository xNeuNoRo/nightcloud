// Data Transfer Object de un nodo
export interface NodeDTO {
  id: string;
  parentId: string | null;
  name: string;
  size: string;
  mime: string;
  isDir: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Data Transfer Object de un ancestro de nodo
export interface AncestorDTO {
  id: string;
  parentId: string | null;
  name: string;
  size: string;
  mime: string;
  isDir: boolean;
  depth: number;
}

// Data Transfer Object de un descendiente de nodo
export interface DescendantDTO {
  id: string;
  parentId: string | null;
  name: string;
  size: string;
  mime: string;
  isDir: boolean;
  depth: number;
}

// Data Transfer Object del resultado de una búsqueda de nodos por nombre
export interface NodeSearchDTO {
  id: string;
  parentId: string | null;
  name: string;
  size: string;
  mime: string;
  isDir: boolean;
  updatedAt: Date;
}
