import { NodeController } from "@/controllers/Node.controller";
import {
  nodeProcess,
  nodeUpload,
  nodeExists,
  validateRequest,
} from "@/middlewares";
import { Router } from "express";
import { NodeValidators } from "@/validators";

/**
 * Rutas para la gestión de nodos (archivos/carpetas)
 */
const router = Router();

// Endpoint para subir nodos (archivos/carpetas)
router.post(
  "/upload",
  NodeValidators.nodeUploadValidator,
  validateRequest,
  nodeUpload,
  nodeProcess,
  NodeController.uploadNodes,
);

// Obtener nodos desde la raíz de la nube (/cloud)
router.get("/", NodeController.getNodesFromRoot);

// Descargar nodo por ID
router.get(
  "/download/:nodeId",
  NodeValidators.nodeIdValidator, // Validation chain
  validateRequest, // Validate any errors from express-validator
  nodeExists,
  NodeController.downloadNode,
);

// Borrar nodo por ID
router.delete(
  "/:nodeId",
  NodeValidators.nodeIdValidator, // Validation chain
  validateRequest, // Validate any errors from express-validator
  nodeExists,
  NodeController.deleteNode,
);

// Renombrar nodo por ID
router.patch(
  "/:nodeId/rename",
  NodeValidators.nodeIdValidator,
  NodeValidators.nodeNewNameValidator,
  validateRequest,
  nodeExists,
  NodeController.renameNode,
);

// Copiar nodo por ID
router.post(
  "/:nodeId/copy",
  NodeValidators.nodeIdValidator,
  NodeValidators.nodeNewNameValidator,
  validateRequest,
  nodeExists,
  NodeController.copyNode,
);

export default router;
