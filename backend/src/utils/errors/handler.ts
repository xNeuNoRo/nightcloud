import { ERRORS } from ".";

export type ErrorCode = keyof typeof ERRORS;

export class AppError extends Error {
  code: ErrorCode;
  http: number;
  constructor(code: ErrorCode, message?: string) {
    super(message ?? ERRORS[code].msg); // Replace the default Error class message (if it doesn't exist)
    this.code = code;
    this.http = ERRORS[code].http;
  }
}

// Convert any unknown error (or internal API error) to AppError(INTERNAL)
export const toAppError = (err: unknown) => {
  return err instanceof AppError ? err : new AppError("INTERNAL");
};
