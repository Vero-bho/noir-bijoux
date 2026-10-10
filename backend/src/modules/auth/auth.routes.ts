import { Router } from "express";

import { requireAuth } from "../../middleware/auth";
import { runValidation } from "../../middleware/validate";
import * as authController from "./auth.controller";
import { loginRules, registerRules } from "./auth.validation";

const router = Router();

router.post("/register", registerRules, runValidation, authController.register);
router.post("/login", loginRules, runValidation, authController.login);
router.get("/me", requireAuth, authController.me);

export default router;
