import { FileController } from "@/controllers/File.controller";
import { FileUtils } from "@/utils";
import { fileProcess, fileUpload } from "@/middlewares/files.middleware";
import { Router } from "express";

// Files Router
const router = Router();

// Upload files
router.post("/upload", fileUpload, fileProcess, FileController.uploadFiles);

// Get all files from root ('/cloud')
router.get("/", async (_req, res) => {
  const files = await FileUtils.getAllFiles(null);
  res.success(files);
});

export default router;
