import { param } from "express-validator";

export class FileValidators {
  static fileIdValidator = [
    param("fileId").isUUID(4).withMessage("Identificador de archivo inválido"),
  ];
}
