import type { UploadedFile } from "@/domain/uploads/uploaded-file";

/**
 * @description TypeGuard que verifica si un objeto es un UploadedFile.
 * @param obj Objeto a verificar
 * @returns true si el objeto es un UploadedFile, false en caso contrario
 */
export function isUploadedFile(obj: unknown): obj is UploadedFile {
  // Si no es un objeto o es null, no es UploadedFile
  if (typeof obj !== "object" || obj === null) return false;

  // Verificamos que tenga las propiedades necesarias
  const record = obj as Record<string, unknown>;
  return (
    typeof record.path === "string" &&
    typeof record.filename === "string" &&
    typeof record.originalname === "string" &&
    typeof record.mimetype === "string" &&
    typeof record.size === "bigint"
  );
}
