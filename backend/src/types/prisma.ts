import { DB } from "@/config/db";

// Tipo del cliente de Prisma
export type PrismaDbClient = ReturnType<typeof DB.getClient>;

// Tipo del cliente de transacciones de Prisma (compatible con extensiones)
export type PrismaTxClient = Parameters<
  Parameters<PrismaDbClient["$transaction"]>[0]
>[0];
