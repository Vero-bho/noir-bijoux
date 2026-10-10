import type { NextFunction, Request, Response } from "express";

import type { AuthRequest } from "../../middleware/auth";
import * as ordersService from "./orders.service";

/**
 * @openapi
 * /api/orders:
 *   post:
 *     summary: Оформить заказ
 *     description: Стоимость считает сервер по данным базы. Для позиций указывается либо productId, либо buildId, либо title и price.
 *     tags: [Orders]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [customerName, phone, deliveryType, items]
 *             properties:
 *               customerName: { type: string, example: Ольга }
 *               phone: { type: string, example: "+7 (999) 000-00-00" }
 *               email: { type: string, example: olga@mail.ru }
 *               deliveryType: { type: string, enum: [Самовывоз, Курьер, Пункт выдачи] }
 *               deliveryPointId: { type: integer, example: 3, description: "нужен для самовывоза и ПВЗ" }
 *               address: { type: string, description: "нужен для курьера" }
 *               comment: { type: string }
 *               items:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     productId: { type: integer, example: 1 }
 *                     buildId: { type: integer, example: 1 }
 *                     title: { type: string }
 *                     price: { type: number }
 *                     quantity: { type: integer, example: 1 }
 *     responses:
 *       201:
 *         description: Заказ создан (возвращается номер заказа, состав и итоговая сумма)
 *       400:
 *         description: Ошибка валидации
 */
export async function create(req: Request, res: Response, next: NextFunction) {
  try {
    const user = (req as AuthRequest).user; // заказ может оформить и гость
    res.status(201).json(await ordersService.createOrder(req.body, user?.id));
  } catch (error) {
    next(error);
  }
}

/**
 * @openapi
 * /api/orders/my:
 *   get:
 *     summary: Мои заказы (история заказов в личном кабинете)
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Список заказов пользователя
 *       401:
 *         description: Требуется авторизация
 */
export async function listMine(req: Request, res: Response, next: NextFunction) {
  try {
    const user = (req as AuthRequest).user!;
    res.json(await ordersService.listMyOrders(user.id));
  } catch (error) {
    next(error);
  }
}

/**
 * @openapi
 * /api/orders/{orderNumber}:
 *   get:
 *     summary: Заказ по номеру
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - { in: path, name: orderNumber, required: true, schema: { type: string }, example: "4821" }
 *     responses:
 *       200:
 *         description: Данные заказа
 *       403:
 *         description: Заказ принадлежит другому пользователю
 *       404:
 *         description: Заказ не найден
 */
export async function getByNumber(req: Request, res: Response, next: NextFunction) {
  try {
    const user = (req as AuthRequest).user;
    res.json(await ordersService.getOrder(String(req.params.orderNumber), user?.id, user?.role === "admin"));
  } catch (error) {
    next(error);
  }
}

/**
 * @openapi
 * /api/orders/{id}/status:
 *   patch:
 *     summary: Изменить статус заказа (только администратор)
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - { in: path, name: id, required: true, schema: { type: integer }, example: 1 }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [status]
 *             properties:
 *               status: { type: string, enum: [new, confirmed, making, ready, done, canceled] }
 *     responses:
 *       200:
 *         description: Статус обновлён
 *       403:
 *         description: Доступно только администратору
 */
export async function updateStatus(req: Request, res: Response, next: NextFunction) {
  try {
    res.json(await ordersService.updateStatus(Number(req.params.id), String(req.body.status)));
  } catch (error) {
    next(error);
  }
}
