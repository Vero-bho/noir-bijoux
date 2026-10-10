import { Router } from "express";
import { body, param } from "express-validator";

import { requireAuth } from "../../middleware/auth";
import { runValidation } from "../../middleware/validate";
import * as favoritesController from "./favorites.controller";

const router = Router();

router.use(requireAuth); // все операции — только для авторизованных

router.get("/", favoritesController.list);
router.post(
  "/",
  [body("buildId").isInt({ min: 1 }).withMessage("Укажите buildId — целое число")],
  runValidation,
  favoritesController.add,
);
router.delete(
  "/:id",
  [param("id").isInt({ min: 1 }).withMessage("Идентификатор — целое число")],
  runValidation,
  favoritesController.remove,
);

export default router;
