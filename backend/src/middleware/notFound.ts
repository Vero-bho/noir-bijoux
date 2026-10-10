// ─────────────────────────────────────────────────────────────────────────────
// Обработчик запросов по несуществующим адресам (404)
// ─────────────────────────────────────────────────────────────────────────────
import type { Request, Response } from "express";

export function notFound(req: Request, res: Response) {
  res.status(404).json({ message: `Маршрут ${req.method} ${req.originalUrl} не найден` });
}
