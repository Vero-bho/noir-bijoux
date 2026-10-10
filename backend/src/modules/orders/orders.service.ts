// ─────────────────────────────────────────────────────────────────────────────
// Заказы. Цены и итог считаются НА СЕРВЕРЕ по данным базы, а не берутся из
// запроса — так нельзя подменить стоимость на клиенте.
// Стоимость доставки: самовывоз — 0 ₽, курьер — 400 ₽, пункт выдачи — 250 ₽.
// ─────────────────────────────────────────────────────────────────────────────
import { prisma } from "../../prisma/client";
import { AppError } from "../../utils/AppError";
import { toOrderDto } from "../../utils/mappers";
import { generateOrderNumber } from "../../utils/orderNumber";

export const DELIVERY_TYPES = ["Самовывоз", "Курьер", "Пункт выдачи"] as const;
export const ORDER_STATUSES = ["new", "confirmed", "making", "ready", "done", "canceled"] as const;

const DELIVERY_COST: Record<string, number> = {
  Самовывоз: 0,
  Курьер: 400,
  "Пункт выдачи": 250,
};

export interface OrderItemInput {
  productId?: number | string;
  buildId?: number | string;
  title?: string;
  price?: number | string;
  quantity?: number | string;
}

export interface CreateOrderInput {
  customerName: string;
  phone: string;
  email?: string;
  deliveryType: string;
  deliveryPointId?: number | string;
  address?: string;
  comment?: string;
  items: OrderItemInput[];
}

const INCLUDE = { items: true } as const;

/** Приводит значение из JSON к положительному целому числу (или undefined) */
function toId(value: unknown): number | undefined {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : undefined;
}

/** Определяем позицию заказа: готовое изделие, сборка или позиция, переданная клиентом */
async function resolveItem(item: OrderItemInput) {
  const quantity = Math.max(1, Math.floor(Number(item.quantity)) || 1);
  const productId = toId(item.productId);
  const buildId = toId(item.buildId);

  if (productId) {
    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: { category: true, material: true },
    });
    if (!product || !product.isActive) {
      throw new AppError(404, `Изделие с идентификатором ${productId} не найдено`);
    }
    return { productId: product.id, buildId: null, title: product.name, price: Number(product.price), quantity };
  }

  if (buildId) {
    const build = await prisma.build.findUnique({
      where: { id: buildId },
      include: { items: { include: { component: true } } },
    });
    if (!build) throw new AppError(404, `Сборка с идентификатором ${buildId} не найдена`);

    const price = build.items.reduce((sum, row) => sum + Number(row.component?.price ?? 0), 0);
    const title = `${build.jewelryType} (авторская сборка ${build.article})`;

    return { productId: null, buildId: build.id, title, price: price || Number(build.totalPrice), quantity };
  }

  if (!item.title || item.price === undefined) {
    throw new AppError(400, "Для позиции укажите productId, buildId либо title и price");
  }

  return { productId: null, buildId: null, title: item.title, price: Number(item.price), quantity };
}

export async function createOrder(input: CreateOrderInput, userId?: number | null) {
  if (!DELIVERY_TYPES.includes(input.deliveryType as never)) {
    throw new AppError(400, `Способ получения: ${DELIVERY_TYPES.join(", ")}`);
  }

  if (input.deliveryType === "Курьер" && !input.address) {
    throw new AppError(400, "Для доставки курьером укажите адрес");
  }

  const deliveryPointId = toId(input.deliveryPointId);

  if (input.deliveryType !== "Курьер" && deliveryPointId) {
    const point = await prisma.pickupPoint.findUnique({ where: { id: deliveryPointId } });
    if (!point) throw new AppError(404, `Точка получения с идентификатором ${deliveryPointId} не найдена`);
  }

  const items = await Promise.all(input.items.map(resolveItem));
  const itemsTotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const total = itemsTotal + (DELIVERY_COST[input.deliveryType] ?? 0);

  const order = await prisma.order.create({
    data: {
      orderNumber: await generateOrderNumber(),
      userId: userId ?? null,
      customerName: input.customerName.trim(),
      phone: input.phone.trim(),
      email: input.email?.trim() || null,
      deliveryType: input.deliveryType,
      address: input.address?.trim() || null,
      pickupPointId: deliveryPointId ?? null,
      comment: input.comment?.trim() || null,
      total,
      status: "new",
      items: { create: items },
    },
    include: INCLUDE,
  });

  return {
    ...toOrderDto(order),
    deliveryCost: DELIVERY_COST[input.deliveryType] ?? 0,
    itemsTotal,
  };
}

export async function listMyOrders(userId: number) {
  const orders = await prisma.order.findMany({
    where: { userId },
    include: INCLUDE,
    orderBy: { createdAt: "desc" },
  });

  return { items: orders.map(toOrderDto), total: orders.length };
}

export async function getOrder(orderNumber: string, userId?: number, isAdmin = false) {
  const order = await prisma.order.findUnique({ where: { orderNumber }, include: INCLUDE });
  if (!order) throw new AppError(404, `Заказ с номером ${orderNumber} не найден`);

  if (!isAdmin && order.userId && order.userId !== userId) {
    throw new AppError(403, "Нет доступа к этому заказу");
  }

  return toOrderDto(order);
}

export async function updateStatus(id: number, status: string) {
  if (!ORDER_STATUSES.includes(status as never)) {
    throw new AppError(400, `Статус должен быть одним из: ${ORDER_STATUSES.join(", ")}`);
  }

  const order = await prisma.order.findUnique({ where: { id } });
  if (!order) throw new AppError(404, `Заказ с идентификатором ${id} не найден`);

  const updated = await prisma.order.update({ where: { id }, data: { status }, include: INCLUDE });
  return toOrderDto(updated);
}

export async function listAllOrders(status?: string) {
  const orders = await prisma.order.findMany({
    where: status ? { status } : {},
    include: INCLUDE,
    orderBy: { createdAt: "desc" },
  });

  return { items: orders.map(toOrderDto), total: orders.length };
}
