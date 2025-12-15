import { FileController } from "@/controllers/File.controller";
import {
  fileProcess,
  fileUpload,
  fileExists,
  validateRequest,
} from "@/middlewares";
import { Router } from "express";
import { FileValidators } from "@/validators";

// Files Router
const router = Router();

// Upload files
router.post("/upload", fileUpload, fileProcess, FileController.uploadFiles);

// Get all files from root ('/cloud')
router.get("/", FileController.getFilesFromRoot);

// Download file by ID
router.get(
  "/download/:fileId",
  FileValidators.fileIdValidator, // Validation chain
  validateRequest, // Validate any errors from express-validator
  fileExists,
  FileController.downloadFile,
);

// Delete file by ID
router.delete(
  "/:fileId",
  FileValidators.fileIdValidator, // Validation chain
  validateRequest, // Validate any errors from express-validator
  fileExists,
  FileController.deleteFile,
);

// Rename file by ID
router.patch(
  "/:fileId/rename",
  FileValidators.fileIdValidator,
  validateRequest,
  fileExists,
  FileController.renameFile,
);

export default router;
