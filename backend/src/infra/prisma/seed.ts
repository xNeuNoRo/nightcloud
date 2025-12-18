import { DB } from "@/config/db";

// Obtener el cliente de Prisma
const prisma = DB.getClient();

async function main() {
  try {
    // Ejemplo de seed para cualquier modelo
    // await prisma.category.createMany({
    //   data: categories
    // });
  } catch (err) {
    console.log(err);
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
