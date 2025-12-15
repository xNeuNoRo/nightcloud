import { FileController } from "@/controllers/File.controller";
import { fileProcess, fileUpload } from "@/middlewares";
import { Router } from "express";
import { fileExists } from "@/middlewares/files.middleware";

// Files Router
const router = Router();

// Upload files
router.post("/upload", fileUpload, fileProcess, FileController.uploadFiles);

// Get all files from root ('/cloud')
router.get("/", FileController.getFilesFromRoot);

// Download file by ID
router.get("/download/:fileId", fileExists, FileController.downloadFile);

export default router;
