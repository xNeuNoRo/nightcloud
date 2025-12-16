import { DB } from "@/config/db";
import { genNodeHash } from "../genNodeHash";
import { ConflictsUtils } from "../conflicts";

// Prisma client
const prisma = DB.getClient();

export default async function resolveNodeIdentity(
  node: Express.Multer.File, // Node seria en realidad un Multer.File
  parentId: string | null,
) {
  // Si hay parentId, incluirlo en el nombre del archivo para el hash
  // De esa forma se genera un hash unico de cada archivo en su respectiva carpeta
  let nodeName = parentId
    ? `${parentId}/${node.originalname}`
    : node.originalname;

  let nodeHash = await genNodeHash(node.path, nodeName);

  // Verificar si el hash ya existe en la base de datos a nivel de la carpeta padre
  const nodeConflict = await prisma.node.findFirst({
    where: { hash: nodeHash, parentId },
  });

  // Si no hay conflicto, retornar el nombre y hash ya generados
  if (!nodeConflict) {
    return { nodeName: node.originalname, nodeHash };
  }

  // Si hay conflicto, verificar si es en la misma carpeta
  if (nodeConflict.parentId === parentId) {
    // Si resulta que hay conflicto en la misma carpeta,
    // obtener un nuevo nombre para el nodo
    nodeName = await ConflictsUtils.getNextName(nodeConflict);
    node.originalname = nodeName;
  }

  // Regenerar el hash con el nuevo nombre
  nodeHash = await genNodeHash(
    node.path,
    parentId ? `${parentId}/${nodeName}` : nodeName,
  );

  // Retornar el nuevo nombre y hash
  return { nodeName: node.originalname, nodeHash };
}
