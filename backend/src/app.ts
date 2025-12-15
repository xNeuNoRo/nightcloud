import cookieParser from "cookie-parser";
import cors from "cors";
import express, { type Express } from "express";

import { error, success } from "@/middlewares";
import { registerV1Routes } from "@/routes";
import { AppError } from "@/utils";

import { corsConfig } from "@/config/cors";

/**
 * 
 * @returns Express aplicación de express configurada
 */
export function createApp(): Express {
  const app: Express = express();

  app.use(cors(corsConfig));

  // Global middlewares
  app.use(express.json());
  app.use(cookieParser());
  app.use(success);

  // Register routes
  registerV1Routes(app);

  // 404 Error => Catches in the below handler
  app.use((_req, _res, next) => {
    next(new AppError("NOT_FOUND"));
  });

  // 500 Error => Handler (throws 500 if not specified)
  app.use(error);

  return app;
}
