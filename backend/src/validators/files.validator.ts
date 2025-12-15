import { param } from "express-validator";

export class FileValidators {
  static fileIdValidator = [
    param("fileId").isUUID(4).withMessage("Identificador de archivo inválido"),
  ];
  static fileRenameValidator = [
    ...this.fileIdValidator,
    param("newName")
      .isEmpty()
      .withMessage("El nuevo nombre no puede estar vacío"),
  ];
}
