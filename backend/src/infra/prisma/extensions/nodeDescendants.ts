import { Prisma, PrismaClient } from "@/infra/prisma/generated/client";
import type { DescendantRow } from "../types";

export const nodeDescendantsExtension = {
  name: "nodeDescendants",
  client: {
    async getDescendants(startNodeId: string): Promise<DescendantRow[]> {
      // Obtener el contexto del cliente Prisma
      const ctx = Prisma.getExtensionContext(this) as unknown as PrismaClient;

      // Ejecutar la consulta raw para obtener los descendientes
      return ctx.$queryRaw<DescendantRow[]>`
        SELECT *
        FROM get_descendants(${startNodeId});
      `;
    },
  },
} as const;
