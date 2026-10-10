// ─────────────────────────────────────────────────────────────────────────────
// Глобальный обработчик ошибок. Подключается последним в app.ts.
// ─────────────────────────────────────────────────────────────────────────────
import type { NextFunction, Request, Response } from "express";
import { AppError } from "../utils/AppError";
import { env } from "../config/env";

export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
) {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({ message: err.message });
  }

  console.error("[Необработанная ошибка]", err);
  return res.status(500).json({
    message: "Внутренняя ошибка сервера",
    ...(env.nodeEnv === "development" && err instanceof Error ? { details: err.message } : {}),
  });
}
