import { createPrismaClient } from "@/infra/prisma/client";

// PrismaClient con las extensiones aplicadas
type PrismaClientExtended = ReturnType<typeof createPrismaClient>;

export class DB {
  // Singleton PrismaClient instance
  private static client: PrismaClientExtended | null = null;

  // Method to get the PrismaClient instance
  public static getClient(): PrismaClientExtended {
    this.client ??= createPrismaClient();
    return this.client;
  }
}
