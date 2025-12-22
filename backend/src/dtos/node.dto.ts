// Data Transfer Object de un nodo
export interface NodeDTO {
  id: string;
  parentId: string | null;
  name: string;
  size: string;
  mime: string;
  isDir: boolean;
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
