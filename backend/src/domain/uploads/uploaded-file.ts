// Interfaz que representa un archivo subido. Contiene los campos necesarios para el procesamiento de archivos
export interface UploadedFile {
  path: string;
  filename: string;
  originalname: string;
  mimetype: string;
  size: bigint;
}
