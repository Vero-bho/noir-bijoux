import { Router } from "express";

import { optionalAuth, requireAuth } from "../../middleware/auth";
import { runValidation } from "../../middleware/validate";
import * as buildsController from "./builds.controller";
import { createBuildRules } from "./builds.validation";

const router = Router();

// сборку может сохранить и гость (userId будет пустым)
router.post("/", optionalAuth, createBuildRules, runValidation, buildsController.create);
router.get("/my", requireAuth, buildsController.listMine);
router.get("/:id", optionalAuth, buildsController.getById);
router.delete("/:id", requireAuth, buildsController.remove);

export default router;
