// Data Transfer Object de un nodo
export interface NodeDTO {
  id: string;
  parentId: string | null;
  name: string;
  size: string;
  mime: string;
  isDir: boolean;
}
