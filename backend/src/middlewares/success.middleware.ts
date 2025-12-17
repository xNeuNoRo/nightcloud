import type { Request, Response, NextFunction } from "express";

// Declaracion global para extender la interfaz Response de Express
declare global {
  namespace Express {
    interface Response {
      success: (data?: unknown, http?: number) => void;
    }
  }
}

/**
 * @description Middleware para agregar el método success a la respuesta
 * @param _req Request
 * @param res Response
 * @param next NextFunction
 */
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
