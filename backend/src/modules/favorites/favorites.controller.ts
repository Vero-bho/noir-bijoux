import type { NextFunction, Request, Response } from "express";

import type { AuthRequest } from "../../middleware/auth";
import * as favoritesService from "./favorites.service";

/**
 * @openapi
 * /api/favorites:
 *   get:
 *     summary: Избранные сборки пользователя
 *     tags: [Favorites]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Список избранных сборок
 *   post:
 *     summary: Добавить сборку в избранное
 *     tags: [Favorites]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [buildId]
 *             properties:
 *               buildId: { type: integer, example: 1 }
 *     responses:
 *       201:
 *         description: Сборка добавлена в избранное
 *       409:
 *         description: Сборка уже в избранном
 */
export async function list(req: Request, res: Response, next: NextFunction) {
  try {
    const user = (req as AuthRequest).user!;
    res.json(await favoritesService.listFavorites(user.id));
  } catch (error) {
    next(error);
  }
}

export async function add(req: Request, res: Response, next: NextFunction) {
  try {
    const user = (req as AuthRequest).user!;
    res.status(201).json(await favoritesService.addFavorite(user.id, Number(req.body.buildId)));
  } catch (error) {
    next(error);
  }
}

/**
 * @openapi
 * /api/favorites/{id}:
 *   delete:
 *     summary: Удалить сборку из избранного
 *     tags: [Favorites]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - { in: path, name: id, required: true, schema: { type: integer }, example: 1 }
 *     responses:
 *       200:
 *         description: Запись удалена
 *       403:
 *         description: Запись принадлежит другому пользователю
 *       404:
 *         description: Запись не найдена
 */
export async function remove(req: Request, res: Response, next: NextFunction) {
  try {
    const user = (req as AuthRequest).user!;
    res.json(await favoritesService.removeFavorite(Number(req.params.id), user.id));
  } catch (error) {
    next(error);
  }
}
