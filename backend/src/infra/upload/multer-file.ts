import { UploadedFile } from "@/domain/uploads/uploaded-file";

export function fromMulterFile(file: Express.Multer.File): UploadedFile {
  return {
    path: file.path,
    filename: file.filename,
    originalname: file.originalname,
    mimetype: file.mimetype,
    size: BigInt(file.size),
  };
}
