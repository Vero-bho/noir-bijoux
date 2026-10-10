import { body } from "express-validator";

export const createBuildRules = [
  body("jewelryType")
    .notEmpty().withMessage("Укажите тип изделия")
    .isIn(["necklace", "bracelet", "earrings", "ring"])
    .withMessage("Тип изделия: necklace, bracelet, earrings или ring"),
  body("componentIds")
    .isArray({ min: 1 }).withMessage("Передайте массив componentIds хотя бы с одним компонентом"),
  body("componentIds.*")
    .isInt({ min: 1 }).withMessage("Идентификаторы компонентов — целые числа"),
];
