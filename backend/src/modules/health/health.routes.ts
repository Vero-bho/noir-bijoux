import { Router } from "express";
import { prisma } from "../../prisma/client";

const router = Router();

/**
 * @openapi
 * /api/health:
 *   get:
 *     summary: Проверка работоспособности API
 *     description: Возвращает состояние сервера и результат проверки подключения к PostgreSQL в Supabase.
 *     tags: [Service]
 *     responses:
 *       200:
 *         description: Сервер работает
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status: { type: string, example: ok }
 *                 database: { type: string, example: connected }
 *                 time: { type: string, example: "2026-01-01T00:00:00.000Z" }
 */
router.get("/health", async (_req, res) => {
  let database = "not checked";

  try {
    await prisma.$queryRaw`SELECT 1 AS ok`;
    database = "connected";
  } catch {
    database = "unavailable";
  }

  res.json({ status: "ok", database, time: new Date().toISOString() });
});

export default router;
