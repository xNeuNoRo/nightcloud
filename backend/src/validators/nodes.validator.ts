import { body, param } from "express-validator";

/**
 * Validadores para las rutas relacionadas con nodos (archivos y carpetas)
 */
export class NodeValidators {
  static readonly nodeIdValidator = [
    param("nodeId").isUUID(4).withMessage("Identificador de nodo inválido"),
  ];
  static readonly nodeNewNameValidator = [
    ...this.nodeIdValidator,
    body("newName")
      .notEmpty()
      .withMessage("El nuevo nombre no puede estar vacío"),
  ];
  static readonly nodeUploadValidator = [
    body("parentId")
      .optional({ nullable: true })
      .isUUID(4)
      .withMessage("Identificador de nodo padre inválido"),
  ];
  static readonly nodeCreateValidator = [
    ...this.nodeUploadValidator,
    body("name")
      .optional({ nullable: true })
      .isLength({ min: 1})
      .withMessage("El nombre no puede ir vacio")
      .isLength({ max: 250 })
      .withMessage("El nombre no puede exceder los 250 carácteres"),
    body("isDir")
      .notEmpty()
      .withMessage("Se debe especificar si es un archivo o una carpeta")
      .isBoolean()
      .withMessage("El valor tiene que ser true o false")
  ]
}
