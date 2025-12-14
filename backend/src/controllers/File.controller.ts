import { AppError } from "@/utils";
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
}
