// Обработчики HTTP-запросов модуля авторизации
import type { NextFunction, Request, Response } from "express";

import type { AuthRequest } from "../../middleware/auth";
import * as authService from "./auth.service";

/**
 * @openapi
 * /api/auth/register:
 *   post:
 *     summary: Регистрация нового пользователя
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [fullName, email, password]
 *             properties:
 *               fullName: { type: string, example: Ольга Иванова }
 *               email: { type: string, example: olga@mail.ru }
 *               phone: { type: string, example: "+7 (999) 000-00-00" }
 *               password: { type: string, example: noir1234 }
 *     responses:
 *       201:
 *         description: Пользователь создан, возвращён JWT-токен
 *       400:
 *         description: Ошибка валидации
 *       409:
 *         description: E-mail уже занят
 */
export async function register(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await authService.register(req.body);
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
}

/**
 * @openapi
 * /api/auth/login:
 *   post:
 *     summary: Вход в аккаунт
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email: { type: string, example: olga@mail.ru }
 *               password: { type: string, example: noir1234 }
 *     responses:
 *       200:
 *         description: "Успешный вход: токен и данные пользователя"
 *       401:
 *         description: Неверный e-mail или пароль
 */
export async function login(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await authService.login(req.body);
    res.json(result);
  } catch (error) {
    next(error);
  }
}

/**
 * @openapi
 * /api/auth/me:
 *   get:
 *     summary: Текущий пользователь (по JWT-токену)
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Данные пользователя
 *       401:
 *         description: Требуется авторизация
 */
export async function me(req: Request, res: Response, next: NextFunction) {
  try {
    const user = (req as AuthRequest).user!;
    res.json({ user: await authService.getAuthUser(user.id) });
  } catch (error) {
    next(error);
  }
}
