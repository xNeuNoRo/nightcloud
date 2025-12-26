import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

import { PrismaClient } from "@/infra/prisma/generated/client";

import {
  nodeAncestorsExtension,
  nodeDescendantsExtension,
  nodeSearchExtension,
} from "./extensions";

// Initialize PostgreSQL connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Create Prisma PostgreSQL adapter
const adapter = new PrismaPg(pool);

/**
 * @description Crea una instancia de PrismaClient con la extensión de ancestros de nodos.
 */
export function createPrismaClient() {
  return new PrismaClient({ adapter })
    .$extends(nodeAncestorsExtension) // Agregar la extensión de ancestros
    .$extends(nodeDescendantsExtension) // Agregar la extensión de descendientes
    .$extends(nodeSearchExtension); // Agregar la extensión de búsqueda
}
