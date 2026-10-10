// ─────────────────────────────────────────────────────────────────────────────
// Избранные сборки пользователя (личный кабинет → «Избранные сборки»).
// ─────────────────────────────────────────────────────────────────────────────
import { prisma } from "../../prisma/client";
import { AppError } from "../../utils/AppError";
import { toFavoriteDto } from "../../utils/mappers";

export async function listFavorites(userId: number) {
  const favorites = await prisma.favorite.findMany({
    where: { userId },
    include: { build: { include: { items: { include: { component: true } } } } },
    orderBy: { createdAt: "desc" },
  });

  return { items: favorites.map(toFavoriteDto), total: favorites.length };
}

export async function addFavorite(userId: number, buildId: number) {
  const build = await prisma.build.findUnique({ where: { id: buildId } });
  if (!build) throw new AppError(404, `Сборка с идентификатором ${buildId} не найдена`);

  const existing = await prisma.favorite.findFirst({ where: { userId, buildId } });
  if (existing) throw new AppError(409, "Эта сборка уже добавлена в избранное");

  const favorite = await prisma.favorite.create({
    data: { userId, buildId },
    include: { build: { include: { items: { include: { component: true } } } } },
  });

  return toFavoriteDto(favorite);
}

export async function removeFavorite(id: number, userId: number) {
  const favorite = await prisma.favorite.findUnique({ where: { id } });
  if (!favorite) throw new AppError(404, `Запись избранного с идентификатором ${id} не найдена`);
  if (favorite.userId !== userId) throw new AppError(403, "Можно удалять только свои избранные сборки");

  await prisma.favorite.delete({ where: { id } });
  return { message: "Сборка удалена из избранного" };
}
