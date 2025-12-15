import { param } from "express-validator";

/**
 * Validadores para las rutas relacionadas con nodos (archivos y carpetas)
 */
export class NodeValidators {
  static nodeIdValidator = [
    param("nodeId").isUUID(4).withMessage("Identificador de archivo inválido"),
  ];
  static nodeRenameValidator = [
    ...this.nodeIdValidator,
    param("newName")
      .isEmpty()
      .withMessage("El nuevo nombre no puede estar vacío"),
  ];
}
