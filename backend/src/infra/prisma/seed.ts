import { DB } from "@/config/db";
import { categories } from "./data/categories";

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

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
