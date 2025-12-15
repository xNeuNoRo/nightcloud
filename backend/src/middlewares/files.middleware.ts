import { Request, Response, NextFunction } from "express";
import multer, { MulterError } from "multer";
import path from "path";
import fs from "fs";

import { AppError, toAppError } from "@/utils";
import processFile from "@/utils/files/processFile";

const storage = multer.diskStorage({
  destination: (
    _req: Request,
    _file: Express.Multer.File,
    cb: (error: Error | null, destination: string) => void,
  ) => {
    // Destination to tmp folder when uploading
    const tmpDir = process.env.CLOUD_TMP
      ? path.resolve(process.cwd(), process.env.CLOUD_TMP)
      : path.join(process.cwd(), ".tmp");
    // Ensure tmp directory exists
    fs.access(tmpDir, fs.constants.F_OK, (err) => {
      if (err) {
        fs.mkdir(tmpDir, { recursive: true }, (mkdirErr) => {
          if (mkdirErr)
            return cb(
              new AppError(
                "INTERNAL",
                "No se pudo crear el directorio temporal",
              ),
              tmpDir,
            );
          return cb(null, tmpDir);
        });
      } else {
        return cb(null, tmpDir);
      }
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

const upload = multer({
  storage,
});

export const fileUpload = (req: Request, res: Response, next: NextFunction) => {
  const file = upload.array("file", 10); // Max 10 files
  file(req, res, (err: unknown) => {
    if (err instanceof MulterError) {
      return next(toAppError(err));
    } else if (err) {
      console.log(err);
      return next(
        new AppError("INTERNAL", "Error desconocido al subir el archivo"),
      );
    }

    next();
  });
};

export const fileProcess = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  if (!req.files || (req.files as Express.Multer.File[]).length === 0)
    throw new AppError("NO_FILES_UPLOADED");

  for (const file of req.files as Express.Multer.File[]) {
    console.log(`File uploaded: ${file.filename} (${file.size} bytes)`);
    // null mientras tanto implementemos lo de las carpetas
    processFile(file, null);
  }

  next();
};

export const folderExists = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  // Revisar que exista una ruta en bd, si no, retornar 404
  // Si existe en la bd, confirmar que exista local
  // Si no existe local, borrar de la bd
  // To do...
}