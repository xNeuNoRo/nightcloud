import { DB } from "@/config/db";
import { AppError, FileUtils } from "@/utils";
import { Request, Response } from "express";

export class FileController {
  static uploadFiles = async (req: Request, res: Response) => {
    try {
      const nodes = req.nodes;
      res.success(
        nodes?.map((n) => {
          return {
            id: n.id,
            parentId: n.parentId,
            name: n.name,
            size: n.size,
            mime: n.mime,
            isDir: n.isDir,
          };
        }),
        201,
      );
    } catch (err) {
      throw new AppError("FILE_UPLOAD");
    }
  };

  static getFilesFromRoot = async (req: Request, res: Response) => {
    try {
      const files = await FileUtils.getAllFiles(null);
      res.success(files);
    } catch (err) {
      throw new AppError("INTERNAL", "Error al obtener los archivos");
    }
  };

  static deleteFile = async (req: Request, res: Response) => {
    const file = req.node!;
    const prisma = DB.getClient();

    try {
      // Obtener la ruta del archivo
      const filePath = await FileUtils.getFilePath(file);

      // Eliminar el archivo del sistema de archivos
      await FileUtils.deleteFiles([filePath]);

      // Eliminar el registro del archivo en la base de datos
      await prisma.node.delete({
        where: { id: file.id },
      });

      res.success(undefined, 204);
    } catch (err) {
      if (err instanceof AppError) throw err;
      else throw new AppError("INTERNAL", "Error al eliminar el archivo");
    }
  };

  static downloadFile = async (req: Request, res: Response) => {
    const file = req.node!;

    try {
      // Get the file path
      const filePath = await FileUtils.getFilePath(file);

      // Send the file as a download
      console.log(`Downloading file: ${file.name} from path: ${filePath}`);

      // Use a promise to handle the download completion
      await new Promise<void>((resolve, reject) => {
        res.download(filePath, file.name, (err: Error & { code?: string }) => {
          if (err) {
            // If headers are already sent, sadly we cannot send an error response
            if (res.headersSent) resolve();

            // Handle file not found error
            if (err.code === "ENOENT") {
              return reject(new AppError("FILE_NOT_FOUND"));
            }

            // Other errors
            return reject(
              new AppError("INTERNAL", "Error interno al descargar el archivo"),
            );
          }

          // Download completed successfully
          resolve();
        });
      });
    } catch (err) {
      if (err instanceof AppError) throw err;
      else throw new AppError("INTERNAL", "Error al descargar el archivo");
    }
  };
}
