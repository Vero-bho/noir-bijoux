import type { NextFunction, Request, Response } from "express";

import type { AuthRequest } from "../../middleware/auth";
import * as buildsService from "./builds.service";

/**
 * @openapi
 * /api/builds:
 *   post:
 *     summary: Сохранить сборку из конструктора
 *     tags: [Constructor]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [jewelryType, componentIds]
 *             properties:
 *               jewelryType: { type: string, enum: [necklace, bracelet, earrings, ring] }
 *               componentIds:
 *                 type: array
 *                 items: { type: integer }
 *                 example: [1, 3, 6]
 *     responses:
 *       201:
 *         description: Сборка создана (артикул вида NB-NK-1-3-6, итоговая цена посчитана на сервере)
 *       400:
 *         description: Ошибка валидации или неподходящие компоненты
 *       401:
 *         description: Требуется авторизация
 */
export async function create(req: Request, res: Response, next: NextFunction) {
  try {
    const user = (req as AuthRequest).user;
    const build = await buildsService.createBuild(
      { jewelryType: req.body.jewelryType, componentIds: req.body.componentIds },
      user?.id,
    );
    res.status(201).json(build);
  } catch (error) {
    next(error);
  }
}

/**
 * @openapi
 * /api/builds/my:
 *   get:
 *     summary: Мои сборки
 *     tags: [Constructor]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Список сборок пользователя
 *       401:
 *         description: Требуется авторизация
 */
export async function listMine(req: Request, res: Response, next: NextFunction) {
  try {
    const user = (req as AuthRequest).user!;
    res.json(await buildsService.listMyBuilds(user.id));
  } catch (error) {
    next(error);
  }
}

/**
 * @openapi
 * /api/builds/{id}:
 *   get:
 *     summary: Сборка по идентификатору
 *     tags: [Constructor]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - { in: path, name: id, required: true, schema: { type: integer }, example: 1 }
 *     responses:
 *       200:
 *         description: Сборка с составом компонентов
 *       403:
 *         description: Сборка принадлежит другому пользователю
 *       404:
 *         description: Сборка не найдена
 *   delete:
 *     summary: Удалить сборку
 *     tags: [Constructor]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - { in: path, name: id, required: true, schema: { type: integer }, example: 1 }
 *     responses:
 *       200:
 *         description: Сборка удалена
 *       403:
 *         description: Можно удалять только свои сборки
 *       404:
 *         description: Сборка не найдена
 */
export async function getById(req: Request, res: Response, next: NextFunction) {
  try {
    const user = (req as AuthRequest).user;
    res.json(await buildsService.getBuild(Number(req.params.id), user?.id));
  } catch (error) {
    next(error);
  }
}

export async function remove(req: Request, res: Response, next: NextFunction) {
  try {
    const user = (req as AuthRequest).user!;
    res.json(await buildsService.deleteBuild(Number(req.params.id), user.id));
  } catch (error) {
    next(error);
  }
}
