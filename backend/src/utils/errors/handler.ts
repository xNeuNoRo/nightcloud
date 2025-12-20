import { MulterError } from "multer";

import { ERRORS } from ".";

export type ErrorCode = keyof typeof ERRORS;

/**
 * Clase de error personalizada para la aplicación
 */
export class AppError extends Error {
  code: ErrorCode;
  http: number;
  constructor(code: ErrorCode, message?: string) {
    super(message ?? ERRORS[code].msg); // Replace the default Error class message (if it doesn't exist)
    this.code = code;
    this.http = ERRORS[code].http;
  }
}

/**
 * Convierte un error desconocido en un AppError
 * @param err Error desconocido
 * @returns AppError correspondiente
 */
export const toAppError = (err: unknown) => {
  if (err instanceof AppError) return err;

  if (err instanceof MulterError)
    return new AppError("FILE_UPLOAD", err.message);

  return new AppError("INTERNAL");
};
