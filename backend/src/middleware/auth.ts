// ─────────────────────────────────────────────────────────────────────────────
// Авторизация по JWT-токену.
//   requireAuth   — доступ только авторизованным (нет токена → 401)
//   optionalAuth  — пользователь не обязателен (например, оформление заказа гостем)
//   requireAdmin  — только администратор (роль admin в базе)
// Токен передаётся в заголовке:  Authorization: Bearer <токен>
// ─────────────────────────────────────────────────────────────────────────────
import type { NextFunction, Request, RequestHandler, Response } from "express";

import { prisma } from "../prisma/client";
import { AppError } from "../utils/AppError";
import { verifyToken } from "../utils/jwt";

export interface AuthUser {
  id: number;
  email: string;
  role: string;
}

export interface AuthRequest extends Request {
  user?: AuthUser;
}

function extractToken(req: Request): string | null {
  const header = req.headers.authorization;
  if (!header) return null;

  const [scheme, token] = header.split(" ");
  if (scheme?.toLowerCase() !== "bearer" || !token) return null;

  return token;
}

/** Загружает пользователя из базы по токену (или null, если токена нет) */
async function resolveUser(req: Request): Promise<AuthUser | null> {
  const token = extractToken(req);
  if (!token) return null;

  const payload = verifyToken(token); // бросит 401, если токен испорчен
  const user = await prisma.user.findUnique({ where: { id: payload.sub } });

  if (!user) throw new AppError(401, "Пользователь не найден — войдите заново");

  return { id: user.id, email: user.email, role: user.role };
}

export const requireAuth: RequestHandler = async (req, _res, next) => {
  try {
    const user = await resolveUser(req);
    if (!user) throw new AppError(401, "Требуется авторизация: передайте заголовок Authorization: Bearer <токен>");

    (req as AuthRequest).user = user;
    next();
  } catch (error) {
    next(error);
  }
};

export const optionalAuth: RequestHandler = async (req, _res, next) => {
  try {
    const user = await resolveUser(req);
    if (user) (req as AuthRequest).user = user;
    next();
  } catch (error) {
    // некорректный токен при необязательной авторизации не мешает работе
    next();
  }
};

export const requireAdmin: RequestHandler = async (req: Request, res: Response, next: NextFunction) => {
  await requireAuth(req, res, async (error?: unknown) => {
    if (error) return next(error);

    const user = (req as AuthRequest).user;
    if (user?.role !== "admin") {
      return next(new AppError(403, "Действие доступно только администратору"));
    }

    next();
  });
};
