// ─────────────────────────────────────────────────────────────────────────────
// Настройка Swagger (OpenAPI). Документация доступна по адресу /api-docs
// Описания эндпоинтов берутся из JSDoc-комментариев (блоки @openapi) в файлах
// src/modules/**/*.routes.ts и src/modules/**/*.controller.ts,
// а также из YAML-файлов в папке docs/ (если такие появятся).
// ─────────────────────────────────────────────────────────────────────────────
import path from "node:path";

import swaggerJsdoc from "swagger-jsdoc";

import { env } from "./env";

// Пути считаем относительно этого файла, чтобы документация собиралась
// независимо от того, из какой папки запущен сервер (src при tsx, dist после tsc).
const MODULES_DIR = path.join(__dirname, "..", "modules").replace(/\\/g, "/");

export const swaggerSpec = swaggerJsdoc({
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Noir Bijoux API",
      version: "1.0.0",
      description:
        "REST API веб-приложения для визуального конфигурирования и заказа авторской бижутерии ручной работы",
    },
    servers: [{ url: `http://localhost:${env.port}`, description: "Локальный сервер" }],
    components: {
      securitySchemes: {
        bearerAuth: { type: "http", scheme: "bearer", bearerFormat: "JWT" },
      },
    },
    tags: [
      { name: "Service", description: "Служебные эндпоинты" },
      { name: "Auth", description: "Регистрация и вход" },
      { name: "Catalog", description: "Каталог, категории, материалы" },
      { name: "Constructor", description: "Компоненты конструктора, сборки" },
      { name: "Favorites", description: "Избранные сборки" },
      { name: "Delivery", description: "Самовывоз, ПВЗ, адрес курьера" },
      { name: "Orders", description: "Оформление и история заказов" },
      { name: "Profile", description: "Личный кабинет" },
      { name: "Admin", description: "Управление каталогом (только администратор)" },
    ],
  },
  // Где искать описание эндпоинтов
  apis: [
    // при запуске через tsx читаются исходники, после сборки — скомпилированные файлы
    `${MODULES_DIR}/**/*.routes.ts`,
    `${MODULES_DIR}/**/*.controller.ts`,
    `${MODULES_DIR}/**/*.routes.js`,
    `${MODULES_DIR}/**/*.controller.js`,
    "./docs/*.yaml",
  ],
});
