import { Router } from "express";

import { optionalAuth, requireAdmin, requireAuth } from "../../middleware/auth";
import { runValidation } from "../../middleware/validate";
import * as ordersController from "./orders.controller";
import { createOrderRules, updateStatusRules } from "./orders.validation";

const router = Router();

router.post("/", optionalAuth, createOrderRules, runValidation, ordersController.create);
router.get("/my", requireAuth, ordersController.listMine);
router.get("/:orderNumber", optionalAuth, ordersController.getByNumber);
router.patch(
  "/:id/status",
  requireAdmin,
  updateStatusRules,
  runValidation,
  ordersController.updateStatus,
);

export default router;
