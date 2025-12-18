import { Prisma, PrismaClient } from "@/infra/prisma/generated/client";
import type { AncestorRow } from "../types";

export const nodeAncestorsExtension = {
  name: "nodeAncestors",
  client: {
    async getAncestors(startNodeId: string): Promise<AncestorRow[]> {
      // Obtener el contexto del cliente Prisma
      const ctx = Prisma.getExtensionContext(this) as unknown as PrismaClient;

      // Ejecutar la consulta raw para obtener los ancestros
      return ctx.$queryRaw<AncestorRow[]>`
        SELECT *
        FROM get_ancestors(${startNodeId});
      `;
    },
  },
} as const;
