// Type que representa una fila en la tabla de ancestros de nodos (funcion get_ancestors SQL)
export type AncestorRow = {
  id: string;
  parentId: string | null;
  name: string;
  hash: string;
  size: bigint;
  mime: string;
  isDir: boolean;
  depth: number;
};

// Type que representa una fila en la tabla de descendientes de nodos (funcion get_descendants SQL)
export type DescendantRow = {
  id: string;
  parentId: string | null;
  name: string;
  hash: string;
  size: bigint;
  mime: string;
  isDir: boolean;
  depth: number;
};

// Type que representa el resultado de una búsqueda de nodos por nombre
export type NodeSearchResult = {
  id: string;
  parentId: string | null;
  name: string;
  size: bigint;
  mime: string;
  isDir: boolean;
  updatedAt: Date;
};
