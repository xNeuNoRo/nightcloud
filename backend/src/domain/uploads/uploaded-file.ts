// Interface que representa un archivo subido (por ahora solo esos se usan)
export interface UploadedFile {
  path: string;
  filename: string;
  originalname: string;
  mimetype: string;
  size: bigint;
}
