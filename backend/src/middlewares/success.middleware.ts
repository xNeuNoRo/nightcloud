import type { Request, Response, NextFunction } from "express";

// Declarations to add new properties to the interface Response of Express
declare global {
  namespace Express {
    interface Response {
      success: (data?: unknown, http?: number) => void;
    }
  }
}

export const success = (_req: Request, res: Response, next: NextFunction) => {
  res.success = (data?: unknown, http: number = 200) => {
    res.status(http).json({
      ok: true,
      // Optional chaining to avoid sending undefined or null data
      ...(data !== undefined && data !== null ? { data } : {}),
    });
  };
  next();
};
