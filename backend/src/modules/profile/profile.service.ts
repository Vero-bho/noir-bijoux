// ─────────────────────────────────────────────────────────────────────────────
// Личный кабинет: данные профиля, смена аватара, смена пароля.
// ─────────────────────────────────────────────────────────────────────────────
import { prisma } from "../../prisma/client";
import { AppError } from "../../utils/AppError";
import { comparePassword, hashPassword } from "../../utils/password";
import { toUserDto } from "../../utils/mappers";

export async function getProfile(userId: number) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new AppError(404, "Пользователь не найден");
  return toUserDto(user);
}

export interface UpdateProfileInput {
  fullName?: string;
  phone?: string;
  email?: string;
}

export async function updateProfile(userId: number, input: UpdateProfileInput) {
  const data: Record<string, unknown> = {};

  if (input.fullName !== undefined) data.fullName = input.fullName.trim();
  if (input.phone !== undefined) data.phone = input.phone.trim() || null;

  if (input.email !== undefined) {
    const email = input.email.trim().toLowerCase();
    const existing = await prisma.user.findUnique({ where: { email } });

    if (existing && existing.id !== userId) {
      throw new AppError(409, "Этот e-mail уже используется другим пользователем");
    }
    data.email = email;
  }

  const user = await prisma.user.update({ where: { id: userId }, data });
  return toUserDto(user);
}

export async function updateAvatar(userId: number, filePath: string) {
  // в базе храним путь, по которому файл отдаётся статикой
  const avatarUrl = `/${filePath.replace(/\\/g, "/")}`;
  const user = await prisma.user.update({ where: { id: userId }, data: { avatarUrl } });
  return toUserDto(user);
}

export interface ChangePasswordInput {
  currentPassword: string;
  newPassword: string;
}

export async function changePassword(userId: number, input: ChangePasswordInput) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new AppError(404, "Пользователь не найден");

  const isValid = await comparePassword(input.currentPassword, user.password);
  if (!isValid) throw new AppError(400, "Текущий пароль указан неверно");

  await prisma.user.update({
    where: { id: userId },
    data: { password: await hashPassword(input.newPassword) },
  });

  return { message: "Пароль изменён" };
}
