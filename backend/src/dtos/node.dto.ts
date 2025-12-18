// Data Transfer Object de un nodo
export interface NodeDTO {
  id: string;
  parentId: string | null;
  name: string;
  size: number;
  mime: string;
  isDir: boolean;
}
