import { FileController } from "@/controllers/File.controller";
import { fileProcess, fileUpload } from "@/middlewares/files.middleware";
import { Router } from "express";

// Files Router
const router = Router();

// Upload files
router.post("/upload", fileUpload, fileProcess, FileController.uploadFiles);

export default router;
