import type { Request, Response, NextFunction } from "express";
import { MulterError } from "multer";

import type { Node } from "@/domain/nodes/node";
import { fromMulterFile } from "@/infra/upload/multer-file";
import { multerUpload } from "@/infra/upload/multer.upload";
import { NodeService } from "@/services/nodes/Node.service";
import { AppError, toAppError } from "@/utils";

/**
 * @description Middleware para manejar la subida de archivos
 * @param req Request
 * @param res Response
 * @param next NextFunction
 */
export const nodeUpload = (req: Request, res: Response, next: NextFunction) => {
  // Configurar multer para manejar multiples archivos
  const node = multerUpload.array(
    process.env.FRONTEND_FORM_FIELD_NAME ?? "file", // Default form field name "file"
    Number(process.env.CLOUD_MAX_UPLOAD_FILES) || 10, // Max 10 files
  );

  // Ejecutar el middleware de multer
  node(req, res, (err: unknown) => {
    if (err instanceof MulterError) {
      return next(toAppError(err));
    } else if (err instanceof AppError) {
      return next(err);
    } else if (err) {
      console.error(err);
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
    // Flag para detectar si la subida fue abortada
    let aborted = false;

    // Función para manejar la cancelación
    const onAbort = () => {
      aborted = true;
    };

    // Escuchar eventos de abort y close
    req.on("aborted", onAbort);
    req.on("close", onAbort);

    // Verificar que existan archivos subidos
    if (!req.files || (req.files as Express.Multer.File[]).length === 0)
      throw new AppError("NO_FILES_UPLOADED");

    // Convertir los archivos de Multer a UploadedFile
    const uploadedFiles = (req.files as Express.Multer.File[]).map((f) =>
      fromMulterFile(f),
    );

    const { parentId } = req.body;
    const results: Node[] = [];

    // Procesar cada archivo subido
    for (const file of uploadedFiles) {
      // Si la subida fue abortada, salir del ciclo
      if (aborted) break;

      console.log(
        `Node uploaded: ${file.filename} (${file.size.toString()} bytes)`,
      );

      // Procesar el nodo subido
      const node = await NodeService.process(file, parentId ?? null);

      // Si la subida fue abortada, eliminar el nodo creado
      if (aborted) {
        await NodeService.rollback([node], [file]); // Revertir el nodo creado
        break;
      }

      // Almacenamos el resultado
      results.push(node);
    }

    // Si la subida fue abortada, revertir los nodos creados, tanto en DB como en almacenamiento
    if (aborted) {
      await NodeService.rollback(results, uploadedFiles);
    }

    // Adjuntar los nodos creados a la request para uso posterior
    req.nodes = results;
    next();
  } catch (err) {
    next(toAppError(err));
  }
};

/**
 * @description Middleware para verificar si un nodo existe en la base de datos
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
    // Obtener el nodeId de los parametros
    const { nodeId } = req.params;

    // Buscar el nodo en la base de datos
    const node = await NodeService.getNodeById(nodeId);

    // Si no existe, lanzar un error
    if (!node) throw new AppError("NODE_NOT_FOUND");

    // Adjuntar el nodo a la request para uso posterior
    req.node = node;

    next();
  } catch (err) {
    next(toAppError(err));
  }
};
