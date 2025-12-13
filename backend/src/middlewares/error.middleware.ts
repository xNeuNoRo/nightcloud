import type { Request, Response, NextFunction } from "express";

import { toAppError } from "@/utils";

export const error = (
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
) => {
  const e = toAppError(err);

  return res.status(e.http).json({
    ok: false,
    error: { code: e.code, message: e.message },
  });
};
