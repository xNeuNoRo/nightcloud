import { NodeController } from "@/controllers/Node.controller";
import {
  nodeProcess,
  nodeUpload,
  nodeExists,
  validateRequest,
} from "@/middlewares";
import { Router } from "express";
import { NodeValidators } from "@/validators";

// Files Router
const router = Router();

// Upload files
router.post("/upload", nodeUpload, nodeProcess, NodeController.uploadNodes);

// Get all files from root ('/cloud')
router.get("/", NodeController.getNodesFromRoot);

// Download file by ID
router.get(
  "/download/:nodeId",
  NodeValidators.nodeIdValidator, // Validation chain
  validateRequest, // Validate any errors from express-validator
  nodeExists,
  NodeController.downloadNode,
);

// Delete file by ID
router.delete(
  "/:nodeId",
  NodeValidators.nodeIdValidator, // Validation chain
  validateRequest, // Validate any errors from express-validator
  nodeExists,
  NodeController.deleteNode,
);

// Rename file by ID
router.patch(
  "/:nodeId/rename",
  NodeValidators.nodeIdValidator,
  NodeValidators.nodeRenameValidator,
  validateRequest,
  nodeExists,
  NodeController.renameNode,
);

export default router;
