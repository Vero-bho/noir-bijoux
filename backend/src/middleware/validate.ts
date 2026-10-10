// ─────────────────────────────────────────────────────────────────────────────
// Проверка данных запроса через express-validator (занятие 5, 6).
// Валидаторы описываются в файлах modules/<модуль>/<модуль>.validation.ts,
// а этот middleware собирает ошибки в единый ответ 400.
// ─────────────────────────────────────────────────────────────────────────────
import type { RequestHandler } from "express";
import { validationResult } from "express-validator";

export const runValidation: RequestHandler = (req, res, next) => {
  const result = validationResult(req);

  if (!result.isEmpty()) {
    return res.status(400).json({
      message: "Ошибка валидации данных",
      errors: result.array().map((error) => ({
        field: error.type === "field" ? error.path : undefined,
        message: error.msg,
      })),
    });
  }

  next();
};
