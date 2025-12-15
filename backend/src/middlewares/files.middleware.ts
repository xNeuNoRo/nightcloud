import { Request, Response, NextFunction } from "express";
import multer, { MulterError } from "multer";
import crypto from "crypto";
import path from "path";
import fs from "fs";

import { AppError, toAppError, FileUtils } from "@/utils";
import { DB } from "@/config/db";
import { Node } from "@/prisma/generated/client";

// Prisma client
const prisma = DB.getClient();

// Multer storage configuration
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

// Multer upload instance
const upload = multer({
  storage,
});

// Middleware to handle file upload
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

// Extend Express Request to include node property
declare global {
  namespace Express {
    interface Request {
      node?: Node;
      nodes?: Node[];
    }
  }
}

// Middleware to process uploaded files
export const fileProcess = async (
  req: Request,
  _res: Response,
  next: NextFunction,
) => {
  try {
    if (!req.files || (req.files as Express.Multer.File[]).length === 0)
      throw new AppError("NO_FILES_UPLOADED");

    const results: Node[] = [];
    for (const file of req.files as Express.Multer.File[]) {
      console.log(`File uploaded: ${file.filename} (${file.size} bytes)`);
      // null mientras tanto implementemos lo de las carpetas
      const node = await FileUtils.processFile(file, null);
      results.push(node);
    }

    req.nodes = results;
    next();
  } catch (err) {
    next(toAppError(err));
  }
};

// Middleware to check if a file exists by ID
export const fileExists = async (
  req: Request<{ fileId: string }>, // Se espera un parametro fileId (validar despues con express-validator)
  _res: Response,
  next: NextFunction,
) => {
  try {
    // Obtener el fileId de los parametros
    const { fileId } = req.params;

    // Buscar el nodo en la base de datos
    const node = await prisma.node.findUnique({
      where: { id: fileId },
    });

    if (!node || node.isDir) throw new AppError("FILE_NOT_FOUND");

    req.node = node;

    next();
  } catch (err) {
    next(toAppError(err));
  }
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
};
