import type { Request } from "express";
import multer from "multer";
import crypto from "node:crypto";
import path from "node:path";

import { AppError } from "@/utils";
import { LocalCloudStorage } from "../cloud/LocalCloudStorage";

// Instancia de LocalCloudStorage
const storage = new LocalCloudStorage();

// Multer storage configuration
export const multerStorage = multer.diskStorage({
  destination: (
    _req: Request,
    _file: Express.Multer.File,
    cb: (error: Error | null, destination: string) => void,
  ) => {
    storage
      .ensureTmp()
      .then((tmpDir) => cb(null, tmpDir))
      .catch((err) => {
        console.log(err);
        cb(
          new AppError(
            "INTERNAL",
            "Ha ocurrido un error interno al subir el archivo",
          ),
          "",
        );
      });
  },
  filename: (
    _req: Request,
    file: Express.Multer.File,
    cb: (error: Error | null, filename: string) => void,
  ) => {
    // Generate random filename with original extension
    cb(null, crypto.randomUUID() + path.extname(file.originalname));
  },
});
