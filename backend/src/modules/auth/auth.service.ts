// ─────────────────────────────────────────────────────────────────────────────
// Бизнес-логика авторизации: регистрация, вход, получение профиля.
// ─────────────────────────────────────────────────────────────────────────────
import { prisma } from "../../prisma/client";
import { AppError } from "../../utils/AppError";
import { signToken } from "../../utils/jwt";
import { comparePassword, hashPassword } from "../../utils/password";
import { toUserDto } from "../../utils/mappers";

export interface RegisterInput {
  fullName: string;
  email: string;
  phone?: string;
  password: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

/** Регистрация: проверяем, что e-mail свободен, хешируем пароль и выдаём токен */
export async function register(input: RegisterInput) {
  const email = input.email.trim().toLowerCase();

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    throw new AppError(409, "Пользователь с таким e-mail уже зарегистрирован");
  }

  const user = await prisma.user.create({
    data: {
      fullName: input.fullName.trim(),
      email,
      phone: input.phone?.trim() || null,
      password: await hashPassword(input.password),
      role: "client",
    },
  });

  return { token: signToken({ sub: user.id, email: user.email, role: user.role }), user: toUserDto(user) };
}

/** Вход: сверяем пароль с хешем */
export async function login(input: LoginInput) {
  const email = input.email.trim().toLowerCase();

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    throw new AppError(401, "Неверный e-mail или пароль");
  }

  const isPasswordValid = await comparePassword(input.password, user.password);
  if (!isPasswordValid) {
    throw new AppError(401, "Неверный e-mail или пароль");
  }

  return { token: signToken({ sub: user.id, email: user.email, role: user.role }), user: toUserDto(user) };
}

/** Профиль по идентификатору (используется в GET /api/auth/me) */
export async function getAuthUser(userId: number) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new AppError(404, "Пользователь не найден");
  return toUserDto(user);
}
