// ─────────────────────────────────────────────────────────────────────────────
// Сборка Express-приложения: middleware, Swagger, маршруты, обработка ошибок.
// Именно этот файл подключает все модули API.
// ─────────────────────────────────────────────────────────────────────────────
import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import swaggerUi from "swagger-ui-express";

import { env } from "./config/env";
import { swaggerSpec } from "./config/swagger";
import { errorHandler } from "./middleware/errorHandler";
import { notFound } from "./middleware/notFound";

// ── Маршруты модулей ────────────────────────────────────────────────────────
import healthRoutes from "./modules/health/health.routes";
import authRoutes from "./modules/auth/auth.routes";
import productRoutes from "./modules/products/products.routes";
import componentRoutes from "./modules/components/components.routes";
import buildRoutes from "./modules/builds/builds.routes";
import favoriteRoutes from "./modules/favorites/favorites.routes";
import deliveryRoutes from "./modules/delivery/delivery.routes";
import orderRoutes from "./modules/orders/orders.routes";
import profileRoutes from "./modules/profile/profile.routes";
import adminRoutes from "./modules/admin/admin.routes";

export function createApp() {
  const app = express();

  // ── Защита и общие middleware ───────────────────────────────────────────
  app.use(
    helmet({
      // разрешаем Swagger UI подгружать свои скрипты и стили
      contentSecurityPolicy: false,
    }),
  );
  app.use(cors({ origin: env.corsOrigin, credentials: true }));
  app.use(express.json({ limit: "1mb" }));
  app.use(express.urlencoded({ extended: true }));

  // Ограничение частоты запросов (защита от перебора пароля и т.п.)
  app.use(
    "/api",
    rateLimit({
      windowMs: 15 * 60 * 1000, // 15 минут
      limit: 300,
      standardHeaders: true,
      legacyHeaders: false,
      // в режиме разработки лимит не мешает тестам
      skip: () => env.nodeEnv !== "production",
    }),
  );

  // ── Документация API ────────────────────────────────────────────────────
  // корень сервера сразу ведёт в документацию: удобно при первом запуске
  app.get("/", (_req, res) => res.redirect("/api-docs"));
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
  app.get("/api-docs.json", (_req, res) => res.json(swaggerSpec));

  // ── Статические файлы (загруженные аватары) ─────────────────────────────
  app.use("/uploads", express.static(env.uploadDir));

  // ── Маршруты API ────────────────────────────────────────────────────────
  app.use("/api", healthRoutes); //            GET  /api/health
  app.use("/api/auth", authRoutes); //         POST /api/auth/register, /login, GET /me
  app.use("/api", productRoutes); //           GET  /api/products, /categories, /materials
  app.use("/api", componentRoutes); //         GET  /api/components
  app.use("/api/builds", buildRoutes); //      сборки конструктора
  app.use("/api/favorites", favoriteRoutes); //избранные сборки
  app.use("/api/delivery", deliveryRoutes); // точки самовывоза и ПВЗ
  app.use("/api/orders", orderRoutes); //      заказы
  app.use("/api/profile", profileRoutes); //   личный кабинет
  app.use("/api/admin", adminRoutes); //       управление каталогом (только admin)

  // ── 404 и обработка ошибок (всегда последними!) ─────────────────────────
  app.use(notFound);
  app.use(errorHandler);

  return app;
}
