import { body } from "express-validator";

export const createOrderRules = [
  body("customerName")
    .trim()
    .notEmpty().withMessage("Укажите имя получателя")
    .isLength({ min: 2, max: 150 }).withMessage("Имя должно быть от 2 до 150 символов"),
  body("phone")
    .trim()
    .notEmpty().withMessage("Укажите телефон")
    .matches(/^[\d+()\s-]{10,18}$/).withMessage("Телефон в формате +7 (999) 000-00-00"),
  body("email")
    .optional({ values: "falsy" })
    .isEmail().withMessage("Проверьте адрес электронной почты"),
  body("deliveryType")
    .notEmpty().withMessage("Укажите способ получения")
    .isIn(["Самовывоз", "Курьер", "Пункт выдачи"])
    .withMessage("Способ получения: Самовывоз, Курьер или Пункт выдачи"),
  body("deliveryPointId").optional({ values: "null" }).isInt({ min: 1 }).withMessage("deliveryPointId — целое число"),
  body("address").optional({ values: "falsy" }).trim().isLength({ max: 400 }).withMessage("Адрес слишком длинный"),
  body("comment").optional({ values: "falsy" }).trim().isLength({ max: 500 }).withMessage("Комментарий слишком длинный"),
  body("items")
    .isArray({ min: 1 }).withMessage("В заказе должна быть хотя бы одна позиция"),
  body("items.*.quantity").optional({ values: "null" }).isInt({ min: 1, max: 99 }).withMessage("Количество — от 1 до 99"),
];

export const updateStatusRules = [
  body("status")
    .notEmpty().withMessage("Укажите статус")
    .isIn(["new", "confirmed", "making", "ready", "done", "canceled"])
    .withMessage("Недопустимый статус"),
];
