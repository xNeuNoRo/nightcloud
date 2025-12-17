/**
 * @description Computa la identidad unica de un nodo basado en su nombre y el ID del padre.
 * @param fileName Nombre del archivo
 * @param parentId ID del nodo padre
 * @returns Objeto con la identidad unica del nodo
 */
export function computeNodeIdentity(fileName: string, parentId: string | null) {
  const identityName = parentId ? `${parentId}/${fileName}` : fileName;

  return { identityName };
}
