import type { Request, Response, NextFunction } from "express";
import { MulterError } from "multer";

import type { Node } from "@/domain/nodes/node";
import { fromMulterFile } from "@/infra/upload/multer-file";
import { multerUpload } from "@/infra/upload/multer.upload";
import { CloudStorageService } from "@/services/cloud/CloudStorage.service";
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

  // Flag para detectar si la subida fue cancelada
  let clientAborted = false;

  // Función para manejar la cancelación
  const onAbort = () => {
    clientAborted = true;
  };

  // Escuchar el evento de abort
  req.on("aborted", onAbort);

  // Ejecutar el middleware de multer
  node(req, res, async (err: unknown) => {
    // Remover el listener de abort ya que multer habra terminado a este punto
    req.off("aborted", onAbort);

    // Si la subida fue cancelada por el cliente, eliminar los archivos subidos
    // writableEnded se usa para verificar si la respuesta ya fue enviada
    if (clientAborted && req.files && !res.writableEnded) {
      const files = req.files as Express.Multer.File[];

      try {
        await CloudStorageService.deleteFiles(files.map((f) => f.path));
      } catch (err) {
        console.error("Error deleting files after client abort:", err);
      }

      return;
    }

    // Manejar errores de multer y otros errores
    if (err instanceof MulterError) {
      return next(toAppError(err));
    }

    if (err instanceof AppError) {
      return next(err);
    }

    if (err) {
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
    // Verificar que existan archivos subidos
    if (!req.files || (req.files as Express.Multer.File[]).length === 0)
      throw new AppError("NO_FILES_UPLOADED");

    // Flag para detectar si la subida fue abortada
    let aborted = false;

    // Función para manejar la cancelación
    const onAbort = () => {
      aborted = true;
    };

    // Escuchar eventos de abort y close
    req.on("aborted", onAbort);
    req.on("close", onAbort);

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
    const node = await NodeService.getNodeDetails(nodeId); // Si no existe, getNodeDetails lanzará un error que será capturado abajo

    // Adjuntar el nodo a la request para uso posterior
    req.node = node!;

    next();
  } catch (err) {
    next(toAppError(err));
  }
};

/**
 * @remarks Utilizado mas que nada en operaciones bulk (mover, copiar, borrar multiples nodos)
 * @description Middleware para verificar si varios nodos existen en la base de datos
 * @param req Request
 * @param _res Response
 * @param next NextFunction
 */
export const nodesExistBulk = async (
  req: Request<{}, unknown, { nodeIds: string[] }>, // Se espera un body con nodeIds
  _res: Response,
  next: NextFunction,
) => {
  try {
    // Obtener los nodeIds del body
    const { nodeIds } = req.body;

    // Buscar los nodos en la base de datos
    const nodes = await NodeService.getNodesDetailsBulk(nodeIds);

    // Verificar que todos los nodos hayan sido encontrados
    const foundNodeIds = new Set(nodes.map((n) => n.id));
    const notFoundNodeIds = nodeIds.filter((id) => !foundNodeIds.has(id));

    if (notFoundNodeIds.length > 0) {
      throw new AppError("NODES_NOT_FOUND");
    }

    // Adjuntar los nodos a la request para uso posterior
    req.nodes = nodes;

    next();
  } catch (err) {
    next(toAppError(err));
  }
};
