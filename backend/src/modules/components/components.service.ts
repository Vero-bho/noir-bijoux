// ─────────────────────────────────────────────────────────────────────────────
// Компоненты конструктора: цепочки, подвески, камни, застёжки, профили и т.д.
// Фронтенд запрашивает их по типу изделия и раскладывает по вкладкам (slot).
// ─────────────────────────────────────────────────────────────────────────────
import { prisma } from "../../prisma/client";
import { AppError } from "../../utils/AppError";
import { toComponentDto } from "../../utils/mappers";

export interface ComponentFilters {
  type?: string; // necklace | bracelet | earrings | ring
  slot?: string; // chain | pendant | clasp | stone | ...
}

export async function listComponents(filters: ComponentFilters) {
  const where: Record<string, unknown> = { isActive: true };
  if (filters.type) where.jewelryType = filters.type;
  if (filters.slot) where.slot = filters.slot;

  const components = await prisma.component.findMany({
    where,
    include: { material: true },
    orderBy: [{ jewelryType: "asc" }, { slot: "asc" }, { layerZ: "asc" }, { id: "asc" }],
  });

  return { items: components.map(toComponentDto), total: components.length };
}

export async function getComponentById(id: number) {
  const component = await prisma.component.findUnique({ where: { id }, include: { material: true } });
  if (!component) throw new AppError(404, `Компонент с идентификатором ${id} не найден`);
  return toComponentDto(component);
}

/** Проверка набора компонентов перед созданием сборки (используется в builds.service) */
export async function getComponentsByIds(ids: number[]) {
  const components = await prisma.component.findMany({ where: { id: { in: ids }, isActive: true } });

  if (components.length !== ids.length) {
    const foundIds = components.map((component) => component.id);
    const missing = ids.filter((id) => !foundIds.includes(id));
    throw new AppError(400, `Компоненты не найдены: ${missing.join(", ")}`);
  }

  return components;
}
