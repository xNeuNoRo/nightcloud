import { Prisma, type PrismaClient } from "@/infra/prisma/generated/client";

import type { NodeSearchResult } from "../types";

export const nodeSearchExtension = {
  name: "nodeSearch",
  client: {
    async search({
      parentId,
      nameQuery,
      limit,
    }: {
      parentId: NodeSearchResult["parentId"] | null;
      nameQuery: string;
      limit?: number;
    }): Promise<NodeSearchResult[]> {
      // Obtener el contexto del cliente Prisma
      const ctx = Prisma.getExtensionContext(this) as unknown as PrismaClient;

      // Si no se especifica un límite, no lo aplicamos
      if (limit == null || limit <= 0) {
        return ctx.$queryRaw<NodeSearchResult[]>`
          SELECT *
          FROM search_nodes(${parentId ?? null}, ${nameQuery})
        `;
      }

      // Ejecutar la consulta SQL para buscar nodos por nombre con límite (max 50 en la función SQL)
      return ctx.$queryRaw<NodeSearchResult[]>`
        SELECT *
        FROM search_nodes(${parentId ?? null}, ${nameQuery}, ${limit})
      `;
    },
  },
} as const;
