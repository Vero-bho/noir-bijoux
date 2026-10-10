import type { NextFunction, Request, Response } from "express";

import type { AuthRequest } from "../../middleware/auth";
import { AppError } from "../../utils/AppError";
import * as profileService from "./profile.service";

/**
 * @openapi
 * /api/profile:
 *   get:
 *     summary: Данные профиля
 *     tags: [Profile]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Профиль пользователя
 *   patch:
 *     summary: Обновить профиль (имя, телефон, e-mail)
 *     tags: [Profile]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               fullName: { type: string, example: Ольга Иванова }
 *               phone: { type: string, example: "+7 999 000-00-00" }
 *               email: { type: string, example: olga@mail.ru }
 *     responses:
 *       200:
 *         description: Профиль обновлён
 *       409:
 *         description: E-mail занят другим пользователем
 */
export async function get(req: Request, res: Response, next: NextFunction) {
  try {
    const user = (req as AuthRequest).user!;
    res.json({ user: await profileService.getProfile(user.id) });
  } catch (error) {
    next(error);
  }
}

export async function update(req: Request, res: Response, next: NextFunction) {
  try {
    const user = (req as AuthRequest).user!;
    res.json({ user: await profileService.updateProfile(user.id, req.body) });
  } catch (error) {
    next(error);
  }
}

/**
 * @openapi
 * /api/profile/avatar:
 *   post:
 *     summary: Загрузка фото профиля
 *     description: Файл передаётся как multipart/form-data в поле avatar (JPG, PNG, WEBP, GIF, до 3 МБ). Файл сохраняется в папку uploads и отдаётся по адресу /uploads/avatars/...
 *     tags: [Profile]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               avatar: { type: string, format: binary }
 *     responses:
 *       200:
 *         description: Профиль с обновлённым avatarUrl
 *       400:
 *         description: Файл не передан или недопустимый формат
 */
export async function uploadAvatarHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const user = (req as AuthRequest).user!;
    if (!req.file) throw new AppError(400, "Файл не передан: отправьте изображение в поле avatar");

    res.json({ user: await profileService.updateAvatar(user.id, req.file.path) });
  } catch (error) {
    next(error);
  }
}

/**
 * @openapi
 * /api/profile/password:
 *   post:
 *     summary: Смена пароля
 *     tags: [Profile]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [currentPassword, newPassword]
 *             properties:
 *               currentPassword: { type: string, example: noir1234 }
 *               newPassword: { type: string, example: newnoir12345 }
 *     responses:
 *       200:
 *         description: Пароль изменён
 *       400:
 *         description: Текущий пароль указан неверно
 */
export async function password(req: Request, res: Response, next: NextFunction) {
  try {
    const user = (req as AuthRequest).user!;
    res.json(await profileService.changePassword(user.id, req.body));
  } catch (error) {
    next(error);
  }
}
