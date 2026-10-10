// ─────────────────────────────────────────────────────────────────────────────
// Проверка структуры проекта: все ли файлы и папки на месте.
//
// Запуск:  npm run check:files        (дополнительные пакеты не нужны)
//
// Скрипт печатает дерево папок и отмечает:
//   ✔ — файл (папка) есть;
//   ✘ — файла нет, и что делать, чтобы он появился.
//
// Полезно после распаковки архива или при переносе проекта на другой компьютер.
// ─────────────────────────────────────────────────────────────────────────────

"use strict";

const fs = require("node:fs");
const path = require("node:path");

const BACKEND = path.join(__dirname, "..");

// ── что должно быть в проекте ───────────────────────────────────────────────
// [путь, описание, что делать если нет]
const REQUIRED = [
  ["package.json", "список пакетов и команды запуска", "файл из архива проекта (экспорт/noir-bijoux-backend.zip)"],
  ["package-lock.json", "точные версии пакетов", "создастся сам при npm install"],
  ["tsconfig.json", "настройки TypeScript", "файл из архива проекта"],
  ["prisma7.config.ts", "настройки Prisma 7: схема, миграции, DATABASE_URL", "файл из архива проекта"],
  [".env.example", "образец настроек (копируется в .env)", "файл из архива проекта"],
  [".env", "ваши настройки: строка подключения к базе, JWT-секрет", "скопировать: copy .env.example .env"],
  [".gitignore", "что не попадает в git (node_modules, .env)", "файл из архива проекта"],
  [".dockerignore", "не копирует .env и лишние файлы в Docker-образ", "файл из архива проекта"],
  ["Dockerfile", "сборка бэкенда в контейнер", "файл из архива проекта"],
  ["docker-compose.yml", "контейнер backend; Supabase подключается через .env", "файл из архива проекта"],
  [".github/workflows/build.yml", "CI: тесты, сборка и публикация Docker-образа в GHCR", "файл из архива проекта"],
  ["README.md", "описание бэкенда и список команд", "файл из архива проекта"],

  ["src/server.ts", "точка входа: запускает сервер", "файл из архива проекта"],
  ["src/app.ts", "сборка приложения Express: маршруты, middleware, Swagger", "файл из архива проекта"],
  ["src/config/env.ts", "чтение переменных из .env с проверкой", "файл из архива проекта"],
  ["src/config/swagger.ts", "описание API для Swagger (/api-docs)", "файл из архива проекта"],

  ["src/middleware/auth.ts", "проверка JWT и роли пользователя", "файл из архива проекта"],
  ["src/middleware/errorHandler.ts", "единая обработка ошибок", "файл из архива проекта"],
  ["src/middleware/notFound.ts", "ответ 404 для неизвестных адресов", "файл из архива проекта"],
  ["src/middleware/upload.ts", "загрузка аватара (multer)", "файл из архива проекта"],
  ["src/middleware/validate.ts", "проверка данных запроса", "файл из архива проекта"],

  ["src/modules/products/products.routes.ts", "каталог изделий", "файл из архива проекта"],
  ["src/modules/components/components.routes.ts", "компоненты конструктора", "файл из архива проекта"],
  ["src/modules/builds/builds.routes.ts", "авторские сборки", "файл из архива проекта"],
  ["src/modules/orders/orders.routes.ts", "оформление и история заказов", "файл из архива проекта"],
  ["src/modules/auth/auth.routes.ts", "регистрация и вход (JWT)", "файл из архива проекта"],
  ["src/modules/profile/profile.routes.ts", "личный кабинет", "файл из архива проекта"],
  ["src/modules/favorites/favorites.routes.ts", "избранные сборки", "файл из архива проекта"],
  ["src/modules/delivery/delivery.routes.ts", "способы получения и точки выдачи", "файл из архива проекта"],
  ["src/modules/admin/admin.routes.ts", "админ-панель: заказы, изделия, пользователи", "файл из архива проекта"],
  ["src/modules/health/health.routes.ts", "проверка работоспособности API", "файл из архива проекта"],

  ["src/prisma/schema/schema.prisma", "модель данных (12 таблиц)", "файл из архива проекта"],
  ["src/prisma/client.ts", "подключение к базе (адаптер PostgreSQL)", "файл из архива проекта"],
  ["src/prisma/seed.ts", "заполнение базы данными магазина", "файл из архива проекта"],
  ["src/prisma/migrations/migration_lock.toml", "провайдер базы для миграций", "файл из архива проекта"],
  ["src/prisma/migrations/20261007120000_init/migration.sql", "миграция: создание 12 таблиц", "файл из архива проекта"],
  ["src/prisma/generated/client.ts", "сгенерированный Prisma Client", "выполнить: npm run prisma:generate"],

  ["src/utils/jwt.ts", "выдача и проверка токенов", "файл из архива проекта"],
  ["src/utils/password.ts", "хеширование паролей (bcrypt)", "файл из архива проекта"],
  ["src/utils/article.ts", "артикул авторской сборки", "файл из архива проекта"],
  ["src/utils/orderNumber.ts", "номер заказа", "файл из архива проекта"],
  ["src/utils/mappers.ts", "преобразование данных базы в ответы API", "файл из архива проекта"],

  ["sql-postgres/00_create_all_simple.sql", "база Supabase «всё в одном»: таблицы + данные", "файл из архива проекта"],
  ["sql-postgres/01_schema.sql", "12 таблиц PostgreSQL", "файл из архива проекта"],
  ["sql-postgres/02_indexes.sql", "7 индексов", "файл из архива проекта"],
  ["sql-postgres/03_seed.sql", "данные магазина", "файл из архива проекта"],
  ["sql-postgres/04_verify.sql", "11 проверочных запросов", "файл из архива проекта"],
  ["sql-postgres/05_drop.sql", "удаление таблиц", "файл из архива проекта"],
  ["sql/00_create_all_simple.sql", "вариант MSSQL «всё в одном»", "файл из архива проекта"],

  ["postman/Noir-Bijoux.postman_collection.json", "коллекция запросов Postman", "файл из архива проекта"],
  ["postman/Noir-Bijoux.postman_environment.json", "переменные Postman (адрес, токен)", "файл из архива проекта"],

  ["scripts/db-check.js", "проверка подключения к базе", "файл из архива проекта"],
  ["scripts/demo-server.js", "запуск API без базы (демо-режим)", "файл из архива проекта"],
  ["scripts/check-structure.js", "этот скрипт проверки структуры", "файл из архива проекта"],

  ["tests/sql.test.js", "проверки SQL-скриптов MSSQL", "файл из архива проекта"],
  ["tests/sql-postgres.test.js", "проверки SQL-скриптов PostgreSQL", "файл из архива проекта"],
  ["tests/api.test.js", "проверки всех эндпоинтов", "файл из архива проекта"],
  ["tests/seed.test.js", "проверки данных магазина", "файл из архива проекта"],
  ["tests/postman.test.js", "прогон коллекции Postman", "файл из архива проекта"],
  ["tests/fixtures/avatar.png", "картинка для теста загрузки аватара", "файл из архива проекта"],
];

const TREE = [
  [".github/", "workflow GitHub Actions: проверки backend и публикация образа"],
  ["src/", "весь код API"],
  ["src/config/", "настройки: .env и Swagger"],
  ["src/middleware/", "посредники: авторизация, ошибки, загрузка файлов"],
  ["src/modules/", "10 модулей API (по папке на раздел сайта)"],
  ["src/prisma/", "схема базы, миграции, подключение, заполнение данными"],
  ["src/utils/", "мелкие помощники (токены, пароли, номера заказов)"],
  ["sql-postgres/", "SQL-скрипты для PostgreSQL (Supabase) — основная база"],
  ["sql/", "SQL-скрипты для MS SQL Server (альтернатива для отчёта)"],
  ["postman/", "коллекция запросов для проверки API"],
  ["scripts/", "служебные скрипты: проверка базы, демо-режим"],
  ["tests/", "автоматические проверки"],
  ["docs/", "заметки по бэкенду"],
];

function exists(relative) {
  return fs.existsSync(path.join(BACKEND, relative));
}

function dirSize(relative) {
  const full = path.join(BACKEND, relative);
  if (!fs.existsSync(full)) return null;
  let total = 0;
  const walk = (dir) => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const next = path.join(dir, entry.name);
      if (entry.isDirectory()) walk(next);
      else total += fs.statSync(next).size;
    }
  };
  walk(full);
  return total;
}

console.log("Проверка структуры бэкенда Noir Bijoux\n");
console.log(`  папка проекта: ${BACKEND}\n`);

// ── 1. папки ────────────────────────────────────────────────────────────────
console.log("Папки");
let missingDirs = 0;
for (const [dir, purpose] of TREE) {
  const relative = dir.replace(/\/$/, "");
  const ok = dir === "docs/" ? exists(relative) || true : exists(relative);
  if (!ok) missingDirs += 1;
  const size = ok && dir !== "docs/" ? dirSize(relative) : 0;
  const sizeText = size === null ? "" : size > 0 ? `  ${Math.round(size / 1024)} КБ` : "  (пусто)";
  console.log(`  ${ok ? "✔" : "✘"} ${dir.padEnd(20)} ${purpose}${sizeText}`);
}

// ── 2. файлы ────────────────────────────────────────────────────────────────
console.log("\nФайлы");
const missing = [];
for (const [file, purpose, fix] of REQUIRED) {
  if (exists(file)) continue;
  missing.push([file, purpose, fix]);
}

console.log(`  проверено файлов: ${REQUIRED.length}`);
console.log(`  на месте: ${REQUIRED.length - missing.length}`);

if (missing.length > 0) {
  console.log(`  отсутствует: ${missing.length}\n`);
  for (const [file, purpose, fix] of missing) {
    console.log(`  ✘ ${file}`);
    console.log(`      что это: ${purpose}`);
    console.log(`      как получить: ${fix}\n`);
  }
} else {
  console.log("  ✔ все файлы на месте");
}

// ── 3. состояние проекта ────────────────────────────────────────────────────
console.log("\nСостояние");

const hasModules = exists("node_modules");
console.log(`  ${hasModules ? "✔" : "✘"} node_modules ${hasModules ? "— пакеты установлены" : "— выполните: npm ci"}`);

let envText = "";
if (exists(".env")) envText = fs.readFileSync(path.join(BACKEND, ".env"), "utf8");
const envFilled = /DATABASE_URL\s*=\s*"(?!.*<(project-ref|ПАРОЛЬ|регион)>)[^"]+"/.test(envText);
console.log(
  `  ${envFilled ? "✔" : "✘"} .env — строка подключения к базе ${
    envFilled ? "заполнена" : "не заполнена: вставьте строку из Supabase (Connect → ORMs → Prisma)"
  }`,
);

const generated = exists("src/prisma/generated/client.ts");
console.log(`  ${generated ? "✔" : "✘"} Prisma Client ${generated ? "сгенерирован" : "— выполните: npm run prisma:generate"}`);

console.log("\nЧто дальше:");
if (missing.length === 0 && hasModules && generated) {
  console.log("  npm run db:check     проверка подключения к базе");
  console.log("  npm run dev          запуск API: http://localhost:4000/api-docs");
} else {
  console.log("  npm ci                       установить пакеты по package-lock.json");
  console.log("  copy .env.example .env      создать файл настроек (PowerShell: Copy-Item)");
  console.log("  npm run prisma:generate     собрать Prisma Client");
  console.log("  npm run db:check            проверка подключения к базе");
}

if (missing.length > 0) process.exitCode = 1;
