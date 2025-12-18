import type { Node } from "@/infra/prisma/generated/client";
import "express-serve-static-core";

// Agregar tipos personalizados al Response de Express
declare module "express-serve-static-core" {
  interface Response {
    success: (data?: unknown, http?: number) => void;
  }

  interface Request {
    node?: Node;
    nodes?: Node[];
  }
}
