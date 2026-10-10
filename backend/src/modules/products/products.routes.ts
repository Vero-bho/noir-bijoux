import { Router } from "express";

import * as productsController from "./products.controller";

const router = Router();

// каталог
router.get("/products", productsController.list);
router.get("/products/:slug", productsController.getBySlug);

// справочники для фильтров
router.get("/categories", productsController.categories);
router.get("/materials", productsController.materials);

export default router;
