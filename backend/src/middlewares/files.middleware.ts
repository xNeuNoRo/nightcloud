import { Request, Response, NextFunction } from "express";
import multer, { MulterError } from "multer";

import { AppError, toAppError } from "@/utils";

const storage = multer.diskStorage({
  destination: (req: Request, file: Express.Multer.File, cb: Function) => {
    cb(null, "./cloud/");
  },
  filename: (req: Request, file: Express.Multer.File, cb: Function) => {
    cb(null, file.originalname);
  },
});

const upload = multer({
  storage,
});

export const fileUpload = (req: Request, res: Response, next: NextFunction) => {
  const file = upload.array("file", 10); // Max 10 files
  file(req, res, (err: unknown) => {
    if (err instanceof MulterError) {
      return toAppError(err);
    } else if (err) {
      console.log(err);
      throw new AppError("INTERNAL");
    }

    next();
  });
};
