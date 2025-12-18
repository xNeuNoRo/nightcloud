import type { Node } from "@/infra/prisma/generated/client";
import "express";

declare module "express" {
  interface Request {
    node?: Node;
    nodes?: Node[];
  }
  interface Response {
    success: (data?: unknown, http?: number) => void;
  }
}
