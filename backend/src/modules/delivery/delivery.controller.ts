import type { NextFunction, Request, Response } from "express";

import * as deliveryService from "./delivery.service";

/**
 * @openapi
 * /api/delivery/points:
 *   get:
 *     summary: Точки самовывоза и пункты выдачи
 *     tags: [Delivery]
 *     parameters:
 *       - { in: query, name: kind, schema: { type: string, enum: [pickup, pvz] }, description: "pickup — самовывоз из мастерской, pvz — пункт выдачи" }
 *     responses:
 *       200:
 *         description: Список точек
 */
export async function list(req: Request, res: Response, next: NextFunction) {
  try {
    res.json(await deliveryService.listPoints(req.query.kind ? String(req.query.kind) : undefined));
  } catch (error) {
    next(error);
  }
}

/**
 * @openapi
 * /api/delivery/points/{id}:
 *   get:
 *     summary: Точка получения по идентификатору
 *     tags: [Delivery]
 *     parameters:
 *       - { in: path, name: id, required: true, schema: { type: integer }, example: 1 }
 *     responses:
 *       200:
 *         description: Точка получения
 *       404:
 *         description: Не найдена
 */
export async function getById(req: Request, res: Response, next: NextFunction) {
  try {
    res.json(await deliveryService.getPoint(Number(req.params.id)));
  } catch (error) {
    next(error);
  }
}
