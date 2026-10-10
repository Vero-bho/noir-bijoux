// ─────────────────────────────────────────────────────────────────────────────
// Администрирование каталога: добавление, изменение и скрытие изделий.
// Доступно только пользователям с ролью admin (см. middleware/auth.ts).
// ─────────────────────────────────────────────────────────────────────────────
import { prisma } from "../../prisma/client";
import { AppError } from "../../utils/AppError";
import { toProductDto } from "../../utils/mappers";

export interface ProductInput {
  name: string;
  slug: string;
  categoryId: number;
  materialId: number;
  price: number;
  imageUrl: string;
  description?: string;
}

export async function createProduct(input: ProductInput) {
  const existing = await prisma.product.findUnique({ where: { slug: input.slug } });
  if (existing) throw new AppError(409, `Изделие с адресом «${input.slug}» уже существует`);

  const product = await prisma.product.create({
    data: {
      name: input.name.trim(),
      slug: input.slug.trim(),
      categoryId: input.categoryId,
      materialId: input.materialId,
      price: input.price,
      imageUrl: input.imageUrl,
      description: input.description?.trim() || null,
    },
    include: { category: true, material: true },
  });

  return toProductDto(product);
}

export async function updateProduct(id: number, input: Partial<ProductInput> & { isActive?: boolean }) {
  const existing = await prisma.product.findUnique({ where: { id } });
  if (!existing) throw new AppError(404, `Изделие с идентификатором ${id} не найдено`);

  const product = await prisma.product.update({
    where: { id },
    data: {
      ...(input.name !== undefined ? { name: input.name.trim() } : {}),
      ...(input.price !== undefined ? { price: input.price } : {}),
      ...(input.imageUrl !== undefined ? { imageUrl: input.imageUrl } : {}),
      ...(input.description !== undefined ? { description: input.description.trim() } : {}),
      ...(input.categoryId !== undefined ? { categoryId: input.categoryId } : {}),
      ...(input.materialId !== undefined ? { materialId: input.materialId } : {}),
      ...(input.isActive !== undefined ? { isActive: input.isActive } : {}),
    },
    include: { category: true, material: true },
  });

  return toProductDto(product);
}

/** Скрытие изделия: строку не удаляем, чтобы не потерять данные о старых заказах */
export async function deactivateProduct(id: number) {
  const existing = await prisma.product.findUnique({ where: { id } });
  if (!existing) throw new AppError(404, `Изделие с идентификатором ${id} не найдено`);

  const product = await prisma.product.update({
    where: { id },
    data: { isActive: false },
    include: { category: true, material: true },
  });

  return toProductDto(product);
}
