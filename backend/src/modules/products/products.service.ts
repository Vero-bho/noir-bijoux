// ─────────────────────────────────────────────────────────────────────────────
// Каталог: список изделий с фильтрами, изделие по slug, категории и материалы.
// ─────────────────────────────────────────────────────────────────────────────
import { prisma } from "../../prisma/client";
import { AppError } from "../../utils/AppError";
import { toProductDto } from "../../utils/mappers";

export interface ProductFilters {
  type?: string; // slug категории: necklace | bracelet | earrings | ring
  material?: string; // название материала
  minPrice?: number;
  maxPrice?: number;
  search?: string;
  sort?: "popular" | "price-asc" | "price-desc" | "name";
}

function buildOrderBy(sort: ProductFilters["sort"]) {
  switch (sort) {
    case "price-asc":
      return { price: "asc" as const };
    case "price-desc":
      return { price: "desc" as const };
    case "name":
      return { name: "asc" as const };
    default:
      return { id: "asc" as const };
  }
}

export async function listProducts(filters: ProductFilters) {
  const where: Record<string, unknown> = { isActive: true };

  if (filters.type) where.category = { slug: filters.type };
  if (filters.material) where.material = { name: filters.material };

  if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
    where.price = {
      ...(filters.minPrice !== undefined ? { gte: filters.minPrice } : {}),
      ...(filters.maxPrice !== undefined ? { lte: filters.maxPrice } : {}),
    };
  }

  if (filters.search) {
    // содержит подстроку в названии или описании
    where.OR = [
      { name: { contains: filters.search } },
      { description: { contains: filters.search } },
    ];
  }

  const [items, total] = await Promise.all([
    prisma.product.findMany({
      where,
      include: { category: true, material: true },
      orderBy: buildOrderBy(filters.sort),
    }),
    prisma.product.count({ where }),
  ]);

  return { items: items.map(toProductDto), total };
}

export async function getProductBySlug(slug: string) {
  const product = await prisma.product.findUnique({
    where: { slug },
    include: { category: true, material: true },
  });

  if (!product) throw new AppError(404, `Изделие «${slug}» не найдено`);
  return toProductDto(product);
}

export async function listCategories() {
  const categories = await prisma.category.findMany({ orderBy: { id: "asc" } });
  return categories.map((category) => ({ id: category.id, name: category.name, slug: category.slug }));
}

export async function listMaterials() {
  const materials = await prisma.material.findMany({ orderBy: { id: "asc" } });
  return materials.map((material) => ({ id: material.id, name: material.name }));
}
