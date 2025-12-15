type ErrorDef = {
  [key: string]: { http: number; msg: string };
};

/**
 * Constantes de errores utilizados en la aplicación
 */
export const ERRORS: ErrorDef = {
  NOT_FOUND: { http: 404, msg: "Ruta no encontrada" },
  INTERNAL: { http: 500, msg: "Error interno del servidor" },
  FILE_UPLOAD: { http: 400, msg: "Error al subir el archivo" },
  NO_FILES_UPLOADED: { http: 400, msg: "No se han subido archivos" },
  FILE_NOT_FOUND: { http: 404, msg: "Archivo no encontrado" },
} as const;
