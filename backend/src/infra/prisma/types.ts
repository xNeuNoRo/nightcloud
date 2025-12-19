// Type que representa una fila en la tabla de ancestros de nodos (funcion get_ancestors SQL)
export type AncestorRow = {
  id: string;
  parentId: string | null;
  name: string;
  hash: string;
  isDir: boolean;
  depth: number;
};

export type DescendantRow = {
  id: string;
  parentId: string | null;
  name: string;
  hash: string;
  isDir: boolean;
  depth: number;
};
