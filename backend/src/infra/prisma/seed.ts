import { DB } from "@/config/db";

import { rootFolders } from "./data/nodes";

// Obtener el cliente de Prisma
const prisma = DB.getClient();

async function main() {
  try {
    await prisma.node.createMany({
      data: rootFolders,
      skipDuplicates: true,
    });
  } catch (err) {
    console.error(err);
  }
}

try {
  await main();
} catch (err) {
  console.error(err);
  process.exitCode = 1;
} finally {
  await prisma.$disconnect();
}
