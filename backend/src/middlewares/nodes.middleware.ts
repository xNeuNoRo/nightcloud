import type { Request, Response, NextFunction } from "express";
import multer, { MulterError } from "multer";
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";

import { DB } from "@/config/db";
import type { Node } from "@/infra/prisma/generated/client";
import { NodeService } from "@/services/nodes/Node.service";
import { AppError, toAppError } from "@/utils";

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
          if (mkdirErr) {
            console.log(`Error creating tmp directory: ${mkdirErr}`);
            return cb(new AppError("INTERNAL"), tmpDir);
          }
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

/**
 * @description Middleware para manejar la subida de archivos
 * @param req Request
 * @param res Response
 * @param next NextFunction
 */
export const nodeUpload = (req: Request, res: Response, next: NextFunction) => {
  const node = upload.array(
    process.env.FRONTEND_FORM_FIELD_NAME ?? "file", // Default form field name "file"
    Number(process.env.CLOUD_MAX_UPLOAD_FILES) || 10, // Max 10 files
  );
  node(req, res, (err: unknown) => {
    if (err instanceof MulterError) {
      return next(toAppError(err));
    } else if (err) {
      console.log(err);
      return next(new AppError("INTERNAL"));
    }

    next();
  });
};

/**
 * @description Middleware para procesar los archivos subidos y crear nodos en la base de datos
 * @param req Request
 * @param _res Response
 * @param next NextFunction
 */
export const nodeProcess = async (
  req: Request<unknown, unknown, { parentId?: string | null }>,
  _res: Response,
  next: NextFunction,
) => {
  try {
    if (!req.files || (req.files as Express.Multer.File[]).length === 0)
      throw new AppError("NO_FILES_UPLOADED");

    const { parentId } = req.body;
    const results: Node[] = [];
    for (const file of req.files as Express.Multer.File[]) {
      console.log(`Node uploaded: ${file.filename} (${file.size} bytes)`);
      // null mientras tanto implementemos lo de las carpetas
      const node = await NodeService.process(file, parentId ?? null);
      results.push(node);
    }

    req.nodes = results;
    next();
  } catch (err) {
    next(toAppError(err));
  }
};

/**
 * Middleware para verificar si un nodo existe en la base de datos
 * @param req Request
 * @param _res Response
 * @param next NextFunction
 */
export const nodeExists = async (
  req: Request<{ nodeId: string }>, // Se espera un parametro nodeId (validar despues con express-validator)
  _res: Response,
  next: NextFunction,
) => {
  try {
    // Implementar logica para los nodos que sean carpetas

    // Obtener el nodeId de los parametros
    const { nodeId } = req.params;

    // Buscar el nodo en la base de datos
    const node = await prisma.node.findUnique({
      where: { id: nodeId },
    });

    if (!node || node.isDir) throw new AppError("FILE_NOT_FOUND");

    req.node = node;

    next();
  } catch (err) {
    next(toAppError(err));
  }
};
