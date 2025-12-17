import { PrismaClient } from "@/infra/prisma/generated/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

// Initialize PostgreSQL connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Create Prisma PostgreSQL adapter
const adapter = new PrismaPg(pool);

/**
 * @description Clase de configuración de la base de datos que maneja la instancia del cliente Prisma.
 */
export class DB {
  // Singleton PrismaClient instance
  private static client: PrismaClient | null = null;

  // Method to get the PrismaClient instance
  public static getClient(): PrismaClient {
    this.client ??= new PrismaClient({
      adapter,
    });

    return this.client;
  }
}
