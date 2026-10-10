// ─────────────────────────────────────────────────────────────────────────────
// Точки самовывоза и пункты выдачи — данные для модальных окон на странице
// оформления заказа.
// ─────────────────────────────────────────────────────────────────────────────
import { prisma } from "../../prisma/client";
import { AppError } from "../../utils/AppError";
import { toDeliveryPointDto } from "../../utils/mappers";

export async function listPoints(kind?: string) {
  const where = kind ? { kind } : {};
  const points = await prisma.pickupPoint.findMany({ where, orderBy: [{ kind: "asc" }, { id: "asc" }] });
  return { items: points.map(toDeliveryPointDto), total: points.length };
}

export async function getPoint(id: number) {
  const point = await prisma.pickupPoint.findUnique({ where: { id } });
  if (!point) throw new AppError(404, `Точка получения с идентификатором ${id} не найдена`);
  return toDeliveryPointDto(point);
}
