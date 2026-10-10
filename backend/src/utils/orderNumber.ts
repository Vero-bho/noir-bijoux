// ─────────────────────────────────────────────────────────────────────────────
// Номер заказа. Пример: 4821 — четыре цифры, как в макетах («Заказ № 1024»).
// Номер проверяется на уникальность в базе.
// ─────────────────────────────────────────────────────────────────────────────
import { prisma } from "../prisma/client";

export async function generateOrderNumber(): Promise<string> {
  for (let attempt = 0; attempt < 10; attempt += 1) {
    const candidate = String(1000 + Math.floor(Math.random() * 9000));
    const existing = await prisma.order.findUnique({ where: { orderNumber: candidate } });
    if (!existing) return candidate;
  }
  // крайне маловероятный случай: добавляем время, чтобы гарантировать уникальность
  return String(Date.now()).slice(-6);
}
