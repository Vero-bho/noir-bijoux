import type { NextFunction, Request, Response } from "express";

import * as componentsService from "./components.service";

/**
 * @openapi
 * /api/components:
 *   get:
 *     summary: Компоненты конструктора
 *     description: Возвращает компоненты выбранного типа изделия (и, при необходимости, конкретной вкладки).
 *     tags: [Constructor]
 *     parameters:
 *       - { in: query, name: type, schema: { type: string, enum: [necklace, bracelet, earrings, ring] } }
 *       - { in: query, name: slot, schema: { type: string, enum: [chain, pendant, clasp, length, beads, charm, stone, material, size, profile] } }
 *     responses:
 *       200:
 *         description: Список компонентов (поле image — PNG-слой для наложения, layerZ — порядок слоя)
 */
export async function list(req: Request, res: Response, next: NextFunction) {
  try {
    res.json(
      await componentsService.listComponents({
        type: req.query.type ? String(req.query.type) : undefined,
        slot: req.query.slot ? String(req.query.slot) : undefined,
      }),
    );
  } catch (error) {
    next(error);
  }
}

/**
 * @openapi
 * /api/components/{id}:
 *   get:
 *     summary: Компонент по идентификатору
 *     tags: [Constructor]
 *     parameters:
 *       - { in: path, name: id, required: true, schema: { type: integer }, example: 1 }
 *     responses:
 *       200:
 *         description: Компонент
 *       404:
 *         description: Компонент не найден
 */
export async function getById(req: Request, res: Response, next: NextFunction) {
  try {
    res.json(await componentsService.getComponentById(Number(req.params.id)));
  } catch (error) {
    next(error);
  }
}
