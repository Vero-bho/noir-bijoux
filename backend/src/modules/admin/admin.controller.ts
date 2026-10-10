import type { NextFunction, Request, Response } from "express";

import * as adminService from "./admin.service";
import * as ordersService from "../orders/orders.service";

/**
 * @openapi
 * /api/admin/products:
 *   post:
 *     summary: Добавить изделие в каталог (только администратор)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, slug, categoryId, materialId, price, imageUrl]
 *             properties:
 *               name: { type: string, example: Колье «Полночь» }
 *               slug: { type: string, example: necklace-midnight }
 *               categoryId: { type: integer, example: 1 }
 *               materialId: { type: integer, example: 1 }
 *               price: { type: number, example: 4900 }
 *               imageUrl: { type: string, example: /uploads/products/midnight.png }
 *               description: { type: string }
 *     responses:
 *       201:
 *         description: Изделие создано
 *       403:
 *         description: Доступно только администратору
 *       409:
 *         description: Изделие с таким адресом уже есть
 */
export async function createProduct(req: Request, res: Response, next: NextFunction) {
  try {
    res.status(201).json(await adminService.createProduct(req.body));
  } catch (error) {
    next(error);
  }
}

/**
 * @openapi
 * /api/admin/products/{id}:
 *   patch:
 *     summary: Изменить изделие (только администратор)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - { in: path, name: id, required: true, schema: { type: integer }, example: 1 }
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name: { type: string }
 *               price: { type: number }
 *               imageUrl: { type: string }
 *               description: { type: string }
 *               isActive: { type: boolean }
 *     responses:
 *       200:
 *         description: Изделие обновлено
 *       404:
 *         description: Изделие не найдено
 *   delete:
 *     summary: Скрыть изделие из каталога (только администратор)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - { in: path, name: id, required: true, schema: { type: integer }, example: 1 }
 *     responses:
 *       200:
 *         description: Изделие скрыто (isActive = false)
 */
export async function updateProduct(req: Request, res: Response, next: NextFunction) {
  try {
    res.json(await adminService.updateProduct(Number(req.params.id), req.body));
  } catch (error) {
    next(error);
  }
}

export async function deactivateProduct(req: Request, res: Response, next: NextFunction) {
  try {
    res.json(await adminService.deactivateProduct(Number(req.params.id)));
  } catch (error) {
    next(error);
  }
}

/**
 * @openapi
 * /api/admin/orders:
 *   get:
 *     summary: Все заказы (только администратор)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - { in: query, name: status, schema: { type: string, enum: [new, confirmed, making, ready, done, canceled] } }
 *     responses:
 *       200:
 *         description: Список заказов всех пользователей
 */
export async function listOrders(req: Request, res: Response, next: NextFunction) {
  try {
    res.json(await ordersService.listAllOrders(req.query.status ? String(req.query.status) : undefined));
  } catch (error) {
    next(error);
  }
}
