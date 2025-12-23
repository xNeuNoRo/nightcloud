import type { Request, Response } from "express";

import { CloudStorageService } from "@/services/cloud/CloudStorage.service";
import { AppError } from "@/utils";

export class CloudController {
  static readonly getCloudStorageStats = async (
    _req: Request,
    res: Response,
  ) => {
    try {
      const stats = await CloudStorageService.getCloudStorageStats();
      res.success(stats);
    } catch (err) {
      if (err instanceof AppError) throw err;
      else {
        console.log(err);
        throw new AppError(
          "INTERNAL",
          `Error al obtener las estadísticas del almacenamiento en la nube`,
        );
      }
    }
  };
}
