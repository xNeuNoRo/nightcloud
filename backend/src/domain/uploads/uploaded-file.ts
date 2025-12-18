// Interfaz que representa un archivo subido. Contiene los campos necesarios para el procesamiento de archivos

/**
 * @property path Ruta temporal del archivo subido
 * @property filename Nombre del archivo en el sistema temporal
 * @property originalname Nombre original del archivo subido
 * @property mimetype Tipo MIME del archivo
 * @property size Tamaño del archivo en bytes
 */
export interface UploadedFile {
  path: string;
  filename: string;
  originalname: string;
  mimetype: string;
  size: bigint;
}
