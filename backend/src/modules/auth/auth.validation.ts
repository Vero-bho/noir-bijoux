// Правила проверки данных для регистрации и входа
import { body } from "express-validator";

export const registerRules = [
  body("fullName")
    .trim()
    .notEmpty().withMessage("Укажите имя")
    .isLength({ min: 2, max: 150 }).withMessage("Имя должно быть от 2 до 150 символов"),
  body("email")
    .trim()
    .notEmpty().withMessage("Укажите e-mail")
    .isEmail().withMessage("Проверьте адрес электронной почты")
    .normalizeEmail({ gmail_remove_dots: false }),
  body("phone")
    .optional({ values: "falsy" })
    .trim()
    .matches(/^[\d+()\s-]{10,18}$/).withMessage("Телефон в формате +7 (999) 000-00-00"),
  body("password")
    .notEmpty().withMessage("Придумайте пароль")
    .isLength({ min: 6, max: 72 }).withMessage("Пароль должен быть от 6 до 72 символов"),
];

export const loginRules = [
  body("email").trim().notEmpty().withMessage("Укажите e-mail").isEmail().withMessage("Проверьте адрес почты"),
  body("password").notEmpty().withMessage("Введите пароль"),
];
