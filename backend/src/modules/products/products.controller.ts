import type { NextFunction, Request, Response } from "express";

import * as productsService from "./products.service";

/**
 * @openapi
 * /api/products:
 *   get:
 *     summary: Каталог изделий с фильтрами
 *     tags: [Catalog]
 *     parameters:
 *       - { in: query, name: type, schema: { type: string }, description: "slug категории: necklace, bracelet, earrings, ring" }
 *       - { in: query, name: material, schema: { type: string }, description: "название материала" }
 *       - { in: query, name: minPrice, schema: { type: number } }
 *       - { in: query, name: maxPrice, schema: { type: number } }
 *       - { in: query, name: search, schema: { type: string }, description: "поиск по названию и описанию" }
 *       - { in: query, name: sort, schema: { type: string, enum: [popular, price-asc, price-desc, name] } }
 *     responses:
 *       200:
 *         description: Список изделий и их общее количество
 */
export async function list(req: Request, res: Response, next: NextFunction) {
  try {
    const query = req.query;

    const result = await productsService.listProducts({
      type: query.type ? String(query.type) : undefined,
      material: query.material ? String(query.material) : undefined,
      minPrice: query.minPrice ? Number(query.minPrice) : undefined,
      maxPrice: query.maxPrice ? Number(query.maxPrice) : undefined,
      search: query.search ? String(query.search) : undefined,
      sort: query.sort as never,
    });

    res.json(result);
  } catch (error) {
    next(error);
  }
}

/**
 * @openapi
 * /api/products/{slug}:
 *   get:
 *     summary: Изделие по адресу (slug)
 *     tags: [Catalog]
 *     parameters:
 *       - { in: path, name: slug, required: true, schema: { type: string }, example: necklace-night-rose }
 *     responses:
 *       200:
 *         description: Карточка изделия
 *       404:
 *         description: Изделие не найдено
 */
export async function getBySlug(req: Request, res: Response, next: NextFunction) {
  try {
    res.json(await productsService.getProductBySlug(String(req.params.slug)));
  } catch (error) {
    next(error);
  }
}

/**
 * @openapi
 * /api/categories:
 *   get:
 *     summary: Категории изделий (для фильтров каталога)
 *     tags: [Catalog]
 *     responses:
 *       200:
 *         description: Список категорий
 */
export async function categories(_req: Request, res: Response, next: NextFunction) {
  try {
    res.json({ items: await productsService.listCategories() });
  } catch (error) {
    next(error);
  }
}

/**
 * @openapi
 * /api/materials:
 *   get:
 *     summary: Материалы изделий (для фильтров каталога)
 *     tags: [Catalog]
 *     responses:
 *       200:
 *         description: Список материалов
 */
export async function materials(_req: Request, res: Response, next: NextFunction) {
  try {
    res.json({ items: await productsService.listMaterials() });
  } catch (error) {
    next(error);
  }
}
