import multer from "multer";
import { multerStorage } from "./multer.storage";

// Multer upload instance
export const multerUpload = multer({
  storage: multerStorage,
});
