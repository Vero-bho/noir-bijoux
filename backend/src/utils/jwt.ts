// ─────────────────────────────────────────────────────────────────────────────
// Работа с JWT-токенами: создание при входе и проверка в middleware.
// ─────────────────────────────────────────────────────────────────────────────
import jwt, { type SignOptions } from "jsonwebtoken";
import { env } from "../config/env";
import { AppError } from "./AppError";

export interface TokenPayload {
  /** идентификатор пользователя */
  sub: number;
  email: string;
  role: string;
}

/** Создать токен для пользователя (срок жизни — JWT_EXPIRES_IN из .env) */
export function signToken(payload: TokenPayload): string {
  return jwt.sign(payload, env.jwtSecret, {
    expiresIn: env.jwtExpiresIn as SignOptions["expiresIn"],
  });
}

/** Проверить токен и получить его содержимое (или ошибку 401) */
export function verifyToken(token: string): TokenPayload {
  let decoded: string | jwt.JwtPayload;

  try {
    decoded = jwt.verify(token, env.jwtSecret);
  } catch {
    throw new AppError(401, "Токен недействителен или истёк — войдите заново");
  }

  if (typeof decoded === "string" || typeof decoded.sub !== "number") {
    throw new AppError(401, "Некорректное содержимое токена");
  }

  return { sub: decoded.sub, email: String(decoded.email ?? ""), role: String(decoded.role ?? "client") };
}
