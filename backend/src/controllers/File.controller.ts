import { AppError, FileUtils } from "@/utils";
import { Request, Response } from "express";

export class FileController {
  static uploadFiles = async (req: Request, res: Response) => {
    try {
      const files = req.files;
      res.success({ files }, 201);
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
}
