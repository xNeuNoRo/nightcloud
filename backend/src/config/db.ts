import { PrismaClient } from "@/prisma/generated/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

// Initialize PostgreSQL connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Create Prisma PostgreSQL adapter
const adapter = new PrismaPg(pool);

export class DB {
  // Singleton PrismaClient instance
  private static client: PrismaClient | null = null;

  // Method to get the PrismaClient instance
  public static getClient(): PrismaClient {
    if (!this.client)
      this.client = new PrismaClient({
        adapter,
      });

    return this.client;
  }
}
