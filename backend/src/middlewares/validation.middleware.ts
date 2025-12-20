import type { Request, Response, NextFunction } from "express";
import { validationResult } from "express-validator";

/**
 * @description Middleware para validar las solicitudes entrantes
 * @param req Request
 * @param res Response
 * @param next NextFunction
 * @returns Respuesta de error si la validación falla, de lo contrario continúa al siguiente middleware
 */
export const validateRequest = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const errors = validationResult(req);

  if (!errors.isEmpty())
    return res
      .status(400)
      .json({ ok: false, code: "VALIDATION_ERRORS", errors: errors.array() });

  next();
};
