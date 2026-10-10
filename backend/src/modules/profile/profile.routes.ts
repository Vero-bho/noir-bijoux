import { Router } from "express";
import { body } from "express-validator";

import { requireAuth } from "../../middleware/auth";
import { uploadAvatar } from "../../middleware/upload";
import { runValidation } from "../../middleware/validate";
import * as profileController from "./profile.controller";

const router = Router();

router.use(requireAuth); // весь модуль — только для авторизованных

router.get("/", profileController.get);
router.patch(
  "/",
  [
    body("fullName").optional().trim().isLength({ min: 2, max: 150 }).withMessage("Имя от 2 до 150 символов"),
    body("phone").optional({ values: "falsy" }).trim().matches(/^[\d+()\s-]{10,18}$/).withMessage("Телефон в формате +7 (999) 000-00-00"),
    body("email").optional({ values: "falsy" }).isEmail().withMessage("Проверьте адрес почты"),
  ],
  runValidation,
  profileController.update,
);

// uploadAvatar — middleware multer, разбирает multipart/form-data
router.post("/avatar", uploadAvatar, profileController.uploadAvatarHandler);

router.post(
  "/password",
  [
    body("currentPassword").notEmpty().withMessage("Введите текущий пароль"),
    body("newPassword").isLength({ min: 6, max: 72 }).withMessage("Новый пароль — от 6 до 72 символов"),
  ],
  runValidation,
  profileController.password,
);

export default router;
