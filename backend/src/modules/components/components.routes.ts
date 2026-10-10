import { Router } from "express";
import { param } from "express-validator";

import { runValidation } from "../../middleware/validate";
import * as componentsController from "./components.controller";

const router = Router();

router.get("/components", componentsController.list);
router.get(
  "/components/:id",
  [param("id").isInt({ min: 1 }).withMessage("Идентификатор компонента — целое число")],
  runValidation,
  componentsController.getById,
);

export default router;
