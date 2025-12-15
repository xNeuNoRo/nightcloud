import { DB } from "@/config/db";
import { AppError, FileUtils } from "@/utils";
import { Request, Response } from "express";
import path from "path";

const prisma = DB.getClient();

export class FileController {
  static uploadFiles = async (req: Request, res: Response) => {
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
  };

  static getFilesFromRoot = async (req: Request, res: Response) => {
    try {
      const files = await FileUtils.getAllFiles(null);
      res.success(
        files.map((f) => {
          return {
            id: f.id,
            parentId: f.parentId,
            name: f.name,
            size: f.size,
            mime: f.mime,
            isDir: f.isDir,
          };
        }),
      );
    } catch (err) {
      throw new AppError("INTERNAL", "Error al obtener los archivos");
    }
  };

  static deleteFile = async (req: Request, res: Response) => {
    const file = req.node!;

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

  static renameFile = async (
    req: Request<{}, {}, { newName: string }>,
    res: Response,
  ) => {
    let { newName } = req.body;
    const file = req.node!;

    // Asegurarse de que la extension del archivo se mantenga igual
    const fileExt = path.extname(newName);
    if (
      !fileExt ||
      fileExt.length === 0 ||
      fileExt !== path.extname(file.name)
    ) {
      newName += path.extname(file.name);
    }

    // Verificar si el nuevo nombre ya existe en el mismo directorio
    const conflict = await FileUtils.nameConflicts.detectConflict(
      file,
      newName,
    );

    // Si hay conflicto, obtener un nombre unico
    if (conflict) {
      const uniqueName = await FileUtils.nameConflicts.getNextName(file, newName);
      console.log("Resolved name conflict, new unique name:", uniqueName);
      newName = uniqueName;
    }

    try {
      const { hash, ...updatedFile } = await prisma.node.update({
        where: { id: file.id },
        data: { name: newName },
      });

      res.success(updatedFile);
    } catch (errr) {
      throw new AppError("INTERNAL", "Error al renombrar el archivo");
    }
  };
}
