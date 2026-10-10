import { Router } from "express";

import * as deliveryController from "./delivery.controller";

const router = Router();

router.get("/points", deliveryController.list);
router.get("/points/:id", deliveryController.getById);

export default router;
