// ─────────────────────────────────────────────────────────────────────────────
// ДЕМОНСТРАЦИОННЫЙ ЗАПУСК БЕЗ SQL SERVER
//
// Запуск:  npm run demo        (после сборки: сначала выполняется tsc)
// Адрес:   http://localhost:4000/api-docs  — Swagger UI со всеми эндпоинтами
//
// Зачем нужен: чтобы проверить API и связку с фронтендом, пока не установлен
// базы (PostgreSQL в Supabase, шаг 5б). Prisma Client подменяется заглушкой из
// tests/fake-prisma.js, данные берутся из того же набора, что и в seed-файле:
// 8 изделий, 40 компонентов конструктора, 5 точек выдачи, 2 пользователя.
//
// ВАЖНО: данные живут только в памяти процесса — после остановки сервера
// изменения пропадают. Реальная работа с базой — обычный запуск (npm run dev).
// ─────────────────────────────────────────────────────────────────────────────

"use strict";

// демо-режим работает и без файла .env, поэтому значения по умолчанию задаём заранее
process.env.NODE_ENV = process.env.NODE_ENV || "development";
process.env.PORT = process.env.PORT || "4000";
process.env.JWT_SECRET = process.env.JWT_SECRET || "noir-bijoux-demo-secret-key";
process.env.JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "12h";

const path = require("node:path");

const { createFakePrisma, seed, seedUsers } = require("../tests/fake-prisma");

const prisma = createFakePrisma();
seed(prisma); // каталог, компоненты, точки выдачи
seedUsers(prisma); // демо-пользователи: клиент и администратор

// подменяем настоящий Prisma Client — приложение об этом не знает
const clientPath = require.resolve(path.join(__dirname, "..", "dist", "prisma", "client.js"));
require.cache[clientPath] = {
  id: clientPath,
  filename: clientPath,
  loaded: true,
  exports: { prisma },
  children: [],
  paths: [],
};

const { createApp } = require("../dist/app.js");

const PORT = Number(process.env.PORT);
const HOST = "0.0.0.0";

createApp().listen(PORT, HOST, () => {
  console.log("──────────────────────────────────────────────────────────────");
  console.log("  Noir Bijoux API — демонстрационный режим (база в памяти)");
  console.log("──────────────────────────────────────────────────────────────");
  console.log(`  Документация Swagger: http://localhost:${PORT}/api-docs`);
  console.log(`  Проверка сервера:     http://localhost:${PORT}/api/health`);
  console.log(`  Каталог:              http://localhost:${PORT}/api/products`);
  console.log("");
  console.log("  Вход: olga@mail.ru / noir1234 (клиент)");
  console.log("        admin@noir.ru / admin1234 (администратор)");
  console.log("");
  console.log("  Демо-режим: данные хранятся в памяти и после остановки пропадут.");
  console.log("  Для работы с реальной базой (PostgreSQL в Supabase): npm run dev — см. docs/ШАГ-5b_База_данных_Supabase.md");
  console.log("──────────────────────────────────────────────────────────────");
});
