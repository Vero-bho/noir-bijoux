import { Router } from "express";
import { body } from "express-validator";

import { requireAdmin } from "../../middleware/auth";
import { runValidation } from "../../middleware/validate";
import * as adminController from "./admin.controller";

const router = Router();

router.use(requireAdmin); // весь модуль — только для администратора

router.post(
  "/products",
  [
    body("name").trim().notEmpty().withMessage("Укажите название"),
    body("slug").trim().notEmpty().withMessage("Укажите адрес (slug)"),
    body("categoryId").isInt({ min: 1 }).withMessage("Укажите categoryId"),
    body("materialId").isInt({ min: 1 }).withMessage("Укажите materialId"),
    body("price").isFloat({ min: 0 }).withMessage("Цена — положительное число"),
    body("imageUrl").trim().notEmpty().withMessage("Укажите путь к картинке"),
  ],
  runValidation,
  adminController.createProduct,
);

router.patch("/products/:id", adminController.updateProduct);
router.delete("/products/:id", adminController.deactivateProduct);
router.get("/orders", adminController.listOrders);

export default router;
