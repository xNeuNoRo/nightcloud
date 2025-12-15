import { body, param } from "express-validator";

/**
 * Validadores para las rutas relacionadas con nodos (archivos y carpetas)
 */
export class NodeValidators {
  static nodeIdValidator = [
    param("nodeId").isUUID(4).withMessage("Identificador de nodo inválido"),
  ];
  static nodeRenameValidator = [
    ...this.nodeIdValidator,
    body("newName")
      .notEmpty()
      .withMessage("El nuevo nombre no puede estar vacío"),
  ];
}
