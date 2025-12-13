import { DB } from "@/config/db";
import { categories } from "./data/categories";

// Get Prisma client instance
const prisma = DB.getClient();

async function main() {
  try {
    // Seed Test Categories - Example Seeder
    // ONLY FOR DEMONSTRATION PURPOSES
    // DELETE SOON AFTERWARDS
    await prisma.category.createMany({
      data: categories
    });
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
