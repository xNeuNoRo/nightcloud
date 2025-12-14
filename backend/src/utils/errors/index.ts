export const ERRORS = {
  NOT_FOUND: { http: 404, msg: "Ruta no encontrada" },
  INTERNAL: { http: 500, msg: "Error interno del servidor" },
  FILE_UPLOAD: { http: 400, msg: "Error al subir el archivo" },
} as const;
