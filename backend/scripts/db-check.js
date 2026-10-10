// ─────────────────────────────────────────────────────────────────────────────
// Проверка подключения к базе PostgreSQL (Supabase) и состояния данных.
//
// Запуск:  npm run db:check        (сначала собирает проект командой tsc)
//
// Скрипт подключается к базе настоящим Prisma Client (адрес берётся из .env)
// и печатает:
//   • версию PostgreSQL, имя базы и логин;
//   • список таблиц и количество строк в каждой;
//   • проверку, что демонстрационные данные на месте (изделия, компоненты,
//     пользователи, сборки, заказы).
//
// Если подключиться не удалось — выводится понятная подсказка, что проверить
// (есть ли интернет, верна ли строка DATABASE_URL, выполнены ли скрипты).
// ─────────────────────────────────────────────────────────────────────────────

"use strict";

const { prisma } = require("../dist/prisma/client.js");

const TABLES = [
  ["users", "пользователи"],
  ["categories", "категории"],
  ["materials", "материалы"],
  ["products", "изделия каталога"],
  ["components", "компоненты конструктора"],
  ["builds", "авторские сборки"],
  ["build_items", "состав сборок"],
  ["orders", "заказы"],
  ["order_items", "позиции заказов"],
  ["favorites", "избранное"],
  ["pickup_points", "точки получения"],
  ["chat_messages", "сообщения поддержки"],
];

async function main() {
  console.log("Проверка подключения к базе PostgreSQL (Supabase)…\n");

  // PostgreSQL: version() — версия сервера, current_database() — имя базы,
  // current_user — логин, inet_server_addr() — адрес сервера.
  const info = await prisma.$queryRaw`
    SELECT version() AS version,
           current_database() AS "dbName",
           current_user AS "loginName"`;
  const server = await prisma.$queryRaw`
    SELECT COALESCE(inet_server_addr()::text, '—') AS host, inet_server_port() AS port`;

  const { version, dbName, loginName } = info[0];
  console.log(`  сервер:  ${String(version).split(",")[0]}`);
  console.log(`  база:    ${dbName}`);
  console.log(`  логин:   ${loginName}`);
  console.log(`  адрес:   ${server[0].host}:${server[0].port}\n`);

  console.log("  таблица                  строк");
  console.log("  ────────────────────────────────");

  let total = 0;
  for (const [table, title] of TABLES) {
    const rows = await prisma.$queryRawUnsafe(`SELECT COUNT(*)::int AS count FROM "${table}"`);
    const count = Number(rows[0].count);
    total += count;
    console.log(`  ${table.padEnd(22)} ${String(count).padStart(5)}   (${title})`);
  }

  console.log("  ────────────────────────────────");
  console.log(`  всего строк: ${total}\n`);

  // важные для демонстрации записи
  const [olga] = await prisma.$queryRaw`SELECT email, role FROM users WHERE email = 'olga@mail.ru'`;
  const [admin] = await prisma.$queryRaw`SELECT email, role FROM users WHERE email = 'admin@noir.ru'`;
  const products = await prisma.$queryRaw`SELECT COUNT(*)::int AS count FROM products WHERE "isActive" = TRUE`;

  console.log("  проверка данных:");
  console.log(`    вход клиента:        ${olga ? `${olga.email} (${olga.role})` : "НЕ НАЙДЕН — выполните 03_seed.sql или npm run seed"}`);
  console.log(`    вход администратора: ${admin ? `${admin.email} (${admin.role})` : "НЕ НАЙДЕН — выполните 03_seed.sql или npm run seed"}`);
  console.log(`    активных изделий:    ${Number(products[0].count)} из 8`);

  console.log("\nГотово: бэкенд подключается к базе. Запускайте npm run dev.");
}

main()
  .catch((error) => {
    console.error("Не удалось подключиться к базе:\n");
    console.error(`  ${error.message}\n`);
    console.error("Что проверить:");
    console.error("  1. есть ли интернет (база находится в облаке Supabase);");
    console.error("  2. верна ли строка DATABASE_URL в файле .env — скопируйте её заново из");
    console.error("     Supabase: Project Settings → Database → Connection string → ORMs → Prisma;");
    console.error("  3. заменён ли <ПАРОЛЬ> (и <ref> проекта) на реальные значения;");
    console.error("  4. созданы ли таблицы и данные: в Supabase → SQL Editor выполните");
    console.error("     sql-postgres/00_create_all_simple.sql (или шаги 01 → 02 → 03);");
    console.error("  5. для миграций используйте строку с портом 5432, а не 6543;");
    console.error("  6. если база на компьютере (docker compose -f docker-compose.databases.yml up -d postgres) — проверьте, что");
    console.error("     контейнер запущен: docker compose -f docker-compose.databases.yml ps.");
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
