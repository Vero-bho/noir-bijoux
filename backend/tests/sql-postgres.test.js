// ─────────────────────────────────────────────────────────────────────────────
// Проверка SQL-скриптов базы PostgreSQL / Supabase (папка backend/sql-postgres) —
// без подключения к облаку.
//
// Запуск:  npm run test:sql:pg
//
// Что проверяется:
//   1. структура: 01_schema.sql (и 00 «всё в одном») содержит таблицу для
//      каждой модели schema.prisma и все 12 связей;
//   2. типы данных PostgreSQL: SERIAL, VARCHAR, DECIMAL(10,2), TIMESTAMP(3),
//      BOOLEAN — и отсутствие остатков от MSSQL (nvarchar, [dbo], GO, GETDATE);
//   3. данные 03_seed.sql: количества записей, сходимость сумм заказов,
//      bcrypt-хеши паролей, reset счётчиков id через setval;
//   4. совпадение данных с сайтом (frontend/app/data/*.ts);
//   5. индексы: 7 штук, по внешним ключам и статусам;
//   6. проверочные запросы 04_verify.sql (11 запросов);
//   7. комментарии: нет «/*» внутри комментария — в PostgreSQL комментарии
//      вложенные, такая запись ломает скрипт;
//   8. миграция Prisma совпадает со схемой и объявляет провайдер postgresql.
// ─────────────────────────────────────────────────────────────────────────────

"use strict";

const fs = require("node:fs");
const path = require("node:path");
const bcrypt = require("bcryptjs");

const BACKEND = path.join(__dirname, "..");
const ROOT = path.join(BACKEND, "..");
const SQL_DIR = path.join(BACKEND, "sql-postgres");
const MIGRATIONS = path.join(BACKEND, "src", "prisma", "migrations");

const passed = [];
const failed = [];

function check(title, condition, details = "") {
  if (condition) {
    passed.push(title);
    console.log(`  ✔ ${title}${details ? ` — ${details}` : ""}`);
  } else {
    failed.push(`${title}${details ? ` — ${details}` : ""}`);
    console.log(`  ✘ ${title}${details ? ` — ${details}` : ""}`);
  }
}

function read(file) {
  return fs.readFileSync(file, "utf8");
}

/**
 * Возвращает строки VALUES одного INSERT в таблицу Postgres-скрипта.
 * Сканер учитывает кавычки, вложенные скобки (подзапросы) и завершает разбор
 * по точке с запятой вне строки и вне скобок.
 */
function parseInsertRows(sql, table) {
  const marker = `INSERT INTO "${table}"`;
  const rows = [];
  let position = 0;

  while (true) {
    const start = sql.indexOf(marker, position);
    if (start === -1) break;

    const valuesStart = sql.indexOf("VALUES", start);
    const body = sql.slice(valuesStart + "VALUES".length);
    position = valuesStart + "VALUES".length;

    let depth = 0;
    let inString = false;
    let current = "";
    let cells = [];

    for (let i = 0; i < body.length; i += 1) {
      const char = body[i];

      if (char === "'") {
        if (inString && body[i + 1] === "'") {
          current += "'";
          i += 1;
          continue;
        }
        inString = !inString;
        current += char;
        continue;
      }

      if (inString) {
        current += char;
        continue;
      }

      if (char === "(") {
        depth += 1;
        if (depth === 1) {
          cells = [];
          current = "";
          continue;
        }
      }

      if (char === ")") {
        depth -= 1;
        if (depth === 0) {
          cells.push(current.trim());
          rows.push(cells);
          current = "";
          continue;
        }
      }

      if (char === ";" && depth === 0) break;
      if (depth === 0) continue;

      // запятая на верхнем уровне строки разделяет значения;
      // внутри подзапроса (depth ≥ 2) запятая — часть значения
      if (char === "," && depth === 1) {
        cells.push(current.trim());
        current = "";
        continue;
      }

      current += char;
    }
  }

  return rows;
}

const FILES = {
  all: "00_create_all_simple.sql",
  schema: "01_schema.sql",
  indexes: "02_indexes.sql",
  seed: "03_seed.sql",
  verify: "04_verify.sql",
  drop: "05_drop.sql",
  readme: "README.md",
};

console.log("Проверка SQL-скриптов PostgreSQL (Supabase)\n");

// ── 1. файлы ────────────────────────────────────────────────────────────────
console.log("Файлы скриптов");
for (const [key, file] of Object.entries(FILES)) {
  const full = path.join(SQL_DIR, file);
  const exists = fs.existsSync(full);
  check(`Есть ${file}`, exists, exists ? `${read(full).split("\n").length} строк` : "файл не найден");
}

const schema = read(path.join(SQL_DIR, FILES.schema));
const indexes = read(path.join(SQL_DIR, FILES.indexes));
const seed = read(path.join(SQL_DIR, FILES.seed));
const verify = read(path.join(SQL_DIR, FILES.verify));
const drop = read(path.join(SQL_DIR, FILES.drop));
const allInOne = read(path.join(SQL_DIR, FILES.all));
const readme = read(path.join(SQL_DIR, FILES.readme));
const schemaPrisma = read(path.join(BACKEND, "src", "prisma", "schema", "schema.prisma"));

// ── 2. схема и модель данных ────────────────────────────────────────────────
console.log("\nСхема таблиц (01_schema.sql против schema.prisma)");
const models = [...schemaPrisma.matchAll(/^model (\w+) \{/gm)].map((match) => match[1]);
const mappedTables = [...schemaPrisma.matchAll(/@@map\("(\w+)"\)/g)].map((match) => match[1]);
const tablesInSchema = [...schema.matchAll(/CREATE TABLE "(\w+)"/g)].map((match) => match[1]);

check(`Моделей в schema.prisma: ${models.length}, таблиц в скрипте: ${tablesInSchema.length}`, models.length === 12 && tablesInSchema.length === 12);
check(
  "Для каждой модели есть таблица",
  mappedTables.slice().sort().join(",") === tablesInSchema.slice().sort().join(","),
  tablesInSchema.join(", "),
);

const foreignKeys = [...schema.matchAll(/ADD CONSTRAINT "(\w+)" FOREIGN KEY/g)].map((match) => match[1]);
const schemaRelations = [...schemaPrisma.matchAll(/@relation\(fields: \[(\w+)\]/g)].map((match) => match[1]);
check(`Внешних ключей в схеме приложения: ${schemaRelations.length}, в скрипте: ${foreignKeys.length}`, schemaRelations.length === 12 && foreignKeys.length === 12);
check(
  "Каскадное удаление стоит только у состава сборки и позиций заказа",
  (schema.match(/ON DELETE CASCADE/g) ?? []).length === 2,
  (schema.match(/ON DELETE CASCADE/g) ?? []).length + " шт.",
);

const uniqueIndexes = [...schema.matchAll(/CREATE UNIQUE INDEX "(\w+)"/g)].map((match) => match[1]);
check(
  `Уникальные ограничения создаются (${uniqueIndexes.length}): e-mail, slug, артикул, номер заказа`,
  uniqueIndexes.length === 6,
  uniqueIndexes.join(", "),
);

// провайдер и типы Prisma
check('Провайдер базы в schema.prisma — "postgresql"', /provider\s*=\s*"postgresql"/.test(schemaPrisma));
check("В schema.prisma не осталось типов MSSQL (@db.NVarChar, @db.DateTime2)", !/@db\.NVarChar|@db\.DateTime2/.test(schemaPrisma));
check(
  "Клиент Prisma использует адаптер PostgreSQL (@prisma/adapter-pg)",
  read(path.join(BACKEND, "src", "prisma", "client.ts")).includes("@prisma/adapter-pg"),
);

// ── 3. типы данных PostgreSQL ───────────────────────────────────────────────
console.log("\nТипы данных PostgreSQL");
check("Счётчики id через SERIAL (автонумерация PostgreSQL)", (schema.match(/SERIAL NOT NULL/g) ?? []).length === 12, (schema.match(/SERIAL NOT NULL/g) ?? []).length + " столбцов");
check("Текстовые поля — VARCHAR с ограничением длины", (schema.match(/VARCHAR\(\d+\)/g) ?? []).length >= 30);
check("Деньги — DECIMAL(10,2)", (schema.match(/DECIMAL\(10,2\)/g) ?? []).length >= 5);
check("Даты — TIMESTAMP(3) с CURRENT_TIMESTAMP по умолчанию", (schema.match(/TIMESTAMP\(3\)/g) ?? []).length >= 5 && schema.includes("CURRENT_TIMESTAMP"));
check("Логические поля — BOOLEAN", schema.includes("BOOLEAN NOT NULL DEFAULT true"));

const mssqlLeftovers = /\[dbo\]|nvarchar|NVARCHAR|DATETIME2|GETDATE|IDENTITY\(1,1\)|SET IDENTITY_INSERT|^\s*GO\s*$/m;
const cleanFiles = { schema, indexes, seed, verify, drop, all: allInOne };
const dirty = Object.entries(cleanFiles).filter(([, text]) => mssqlLeftovers.test(text)).map(([name]) => name);
check("В скриптах не осталось конструкций MSSQL ([dbo], GO, IDENTITY_INSERT, GETDATE)", dirty.length === 0, dirty.join(", ") || "чисто");

// ── 4. комментарии Postgres ─────────────────────────────────────────────────
console.log("\nКомментарии (в PostgreSQL они вложенные)");
const nestedCommentFiles = [];
for (const [name, file] of Object.entries(FILES)) {
  if (name === "readme") continue;
  const text = read(path.join(SQL_DIR, file));
  for (const [index, line] of text.split("\n").entries()) {
    const position = line.indexOf("/*");
    // «/*» допустим только в начале строки (открытие комментария),
    // а внутри текста комментария он открыл бы вложенный комментарий
    if (position > 0 || (line.trim().startsWith("/*") && line.split("/*").length > 2)) {
      nestedCommentFiles.push(`${file}:${index + 1}`);
    }
  }
}
check(
  "Внутри комментариев нет «/*» (иначе PostgreSQL не закроет комментарий)",
  nestedCommentFiles.length === 0,
  nestedCommentFiles.slice(0, 3).join(", ") || "чисто",
);

// ── 5. индексы ──────────────────────────────────────────────────────────────
console.log("\nИндексы (02_indexes.sql)");
const newIndexes = [...indexes.matchAll(/CREATE INDEX IF NOT EXISTS (\w+)/g)].map((match) => match[1]);
check(`Добавляется 7 индексов`, newIndexes.length === 7, newIndexes.join(", "));
check("Все индексы создаются безопасно повторно (IF NOT EXISTS)", !/CREATE INDEX (?!IF NOT EXISTS)/.test(indexes));

const neededIndexes = [
  ["components", "materialId"],
  ["build_items", "componentId"],
  ["orders", "status"],
  ["order_items", "productId"],
  ["order_items", "buildId"],
  ["favorites", "buildId"],
];
const missing = neededIndexes.filter(
  ([table, column]) => !new RegExp(`CREATE INDEX IF NOT EXISTS \\w+ ON ${table} \\([^)]*${column}`, "i").test(indexes),
);
check("Индексы покрывают внешние ключи, которых нет в схеме Prisma", missing.length === 0, missing.map((row) => `${row[0]}.${row[1]}`).join(", ") || "все на месте");
check("Есть индекс для фильтра каталога (isActive, price)", /ON products \(isActive, price\)/.test(indexes));

// ── 6. данные ───────────────────────────────────────────────────────────────
console.log("\nДанные магазина (03_seed.sql)");
const rows = {
  categories: parseInsertRows(seed, "categories"),
  materials: parseInsertRows(seed, "materials"),
  products: parseInsertRows(seed, "products"),
  components: parseInsertRows(seed, "components"),
  pickup_points: parseInsertRows(seed, "pickup_points"),
  users: parseInsertRows(seed, "users"),
  builds: parseInsertRows(seed, "builds"),
  build_items: parseInsertRows(seed, "build_items"),
  orders: parseInsertRows(seed, "orders"),
  order_items: parseInsertRows(seed, "order_items"),
  favorites: parseInsertRows(seed, "favorites"),
};

const expected = {
  categories: 4,
  materials: 3,
  products: 8,
  components: 40,
  pickup_points: 5,
  users: 2,
  builds: 2,
  build_items: 6,
  orders: 2,
  order_items: 3,
  favorites: 1,
};

for (const [table, count] of Object.entries(expected)) {
  check(`${table}: ${count} ${count === 1 ? "строка" : "строк"}`, rows[table].length === count, `разобрано ${rows[table].length}`);
}

check("Перед вставкой таблицы очищаются (TRUNCATE … RESTART IDENTITY CASCADE)", /TRUNCATE TABLE[\s\S]*RESTART IDENTITY CASCADE/.test(seed));
const setvals = [...seed.matchAll(/setval\(pg_get_serial_sequence\('(\w+)'/g)].map((match) => match[1]);
check(`Счётчики id выставляются через setval (${setvals.length} таблиц)`, setvals.length === 5, setvals.join(", "));

// пароли — bcrypt-хеши демо-паролей
const userRows = rows.users.map((row) => row.map((cell) => cell.replace(/^'|'$/g, "")));
const hashesOk = userRows.every(([, hash, , , role]) => hash.startsWith("$2") && hash.length === 60 && role.length > 0);
check("Пароли хранятся bcrypt-хешами (60 символов, без открытого пароля)", hashesOk);
const olgaHash = userRows.find((row) => row[0] === "olga@mail.ru");
const adminHash = userRows.find((row) => row[0] === "admin@noir.ru");
check("Хеш клиента соответствует паролю noir1234", Boolean(olgaHash) && bcrypt.compareSync("noir1234", olgaHash[1]));
check("Хеш администратора соответствует паролю admin1234", Boolean(adminHash) && bcrypt.compareSync("admin1234", adminHash[1]));

// суммы заказов: позиции + доставка = итог
const deliveryPrice = { "Самовывоз": 0, "Курьер": 400, "Пункт выдачи": 250 };
const ordersOk = rows.orders.every((order) => {
  const number = order[0].replace(/'/g, "");
  const total = Number(order[7]);
  const type = order[5].replace(/'/g, "");
  const items = rows.order_items
    .filter((row) => row[0].includes(`'${number}'`))
    .reduce((sum, row) => sum + Number(row[4]) * Number(row[5]), 0);
  return items + deliveryPrice[type] === total;
});
check("Итог каждого заказа = сумма позиций + стоимость доставки", ordersOk);

// ── 7. сверка с сайтом ──────────────────────────────────────────────────────
console.log("\nДанные скриптов против данных сайта (frontend/app/data)");
const catalog = read(path.join(ROOT, "frontend", "app", "data", "catalog.ts"));
const siteProducts = [...catalog.matchAll(/name: "([^"]+)",\s*\n\s*slug: "([^"]+)",\s*\n\s*type: "[^"]+",\s*\n\s*typeSlug: "[^"]+",\s*\n\s*material: "[^"]+",\s*\n\s*price: (\d+)/g)];
check(`Изделий на сайте: ${siteProducts.length}`, siteProducts.length === 8);

const productMismatch = siteProducts.filter((match) => {
  const [, name, slug, price] = match;
  const row = rows.products.find((item) => item[2] === `'${slug}'`);
  return !row || row[1] !== `'${name}'` || Number(row[5]) !== Number(price);
});
check("Названия и цены 8 изделий совпадают с сайтом", productMismatch.length === 0, productMismatch.map((match) => match[1]).join(", ") || "полное совпадение");

const componentsSource = read(path.join(ROOT, "frontend", "app", "data", "constructorComponents.ts"));
const siteComponents = [...componentsSource.matchAll(/\{ id: (\d+), jewelryType: "[^"]+", slot: "[^"]+", name: "([^"]+)", price: (\d+)/g)];
const componentMismatch = siteComponents.filter((match) => {
  const row = rows.components.find((item) => Number(item[0]) === Number(match[1]));
  return !row || row[1] !== `'${match[2]}'` || Number(row[5]) !== Number(match[3]);
});
check(`Компоненты конструктора совпадают с сайтом (${siteComponents.length} шт.)`, siteComponents.length === 40 && componentMismatch.length === 0, componentMismatch.map((match) => match[2]).join(", ") || "полное совпадение");

// ── 8. проверочные запросы и «всё в одном» ──────────────────────────────────
console.log("\nПроверочные запросы и файл «всё в одном»");
const verifyQueries = [...verify.matchAll(/\/\* (\d{1,2})\./g)].map((match) => Number(match[1]));
check(`04_verify.sql содержит 11 запросов для отчёта`, verifyQueries.length === 11, `найдено ${verifyQueries.length}`);
check("Проверка использует системные представления PostgreSQL (pg_indexes, pg_class)", verify.includes("pg_indexes") && verify.includes("pg_total_relation_size"));
check("Список таблиц берётся из information_schema (также в 01_schema.sql и 05_drop.sql)", schema.includes("information_schema") && drop.includes("information_schema"));
check("Нет обращения к системным таблицам MSSQL (sys.tables)", !verify.includes("sys.tables"));
check("Есть запрос проверки суммы заказа (позиции + доставка)", verify.includes("Позиции, ₽") && verify.includes("Доставка, ₽"));

check("00_create_all_simple.sql содержит все 12 таблиц", (allInOne.match(/CREATE TABLE "/g) ?? []).length === 12);
check("00_create_all_simple.sql содержит данные (TRUNCATE, INSERT, setval)", allInOne.includes("TRUNCATE TABLE") && allInOne.includes('INSERT INTO "products"') && allInOne.includes("setval"));
check("00_create_all_simple.sql содержит 7 индексов и проверку", (allInOne.match(/CREATE INDEX IF NOT EXISTS/g) ?? []).length === 7 && allInOne.includes("UNION ALL SELECT 'categories'"));
check("В «всё в одном» есть инструкция для SQL Editor Supabase", allInOne.includes("SQL Editor") && allInOne.includes("Table Editor"));

check("05_drop.sql удаляет таблицы и в правильном порядке (CASCADE)", drop.includes("DROP TABLE IF EXISTS") && drop.includes("CASCADE"));
check("README объясняет работу через Supabase SQL Editor", readme.includes("SQL Editor") && readme.includes("Supabase"));

// ── 9. миграция Prisma ──────────────────────────────────────────────────────
console.log("\nМиграция Prisma для PostgreSQL");
const migrationDir = path.join(MIGRATIONS, "20261007120000_init");
const migrationFile = path.join(migrationDir, "migration.sql");
check("Миграция 20261007120000_init есть", fs.existsSync(migrationFile));

const migration = fs.existsSync(migrationFile) ? read(migrationFile) : "";
const migrationTables = [...migration.matchAll(/CREATE TABLE "(\w+)"/g)].map((match) => match[1]);
check("Миграция создаёт те же 12 таблиц, что и 01_schema.sql", migrationTables.slice().sort().join(",") === tablesInSchema.slice().sort().join(","));
check("Миграция содержит 12 связей", (migration.match(/ADD CONSTRAINT "\w+" FOREIGN KEY/g) ?? []).length === 12);

const lockFile = path.join(MIGRATIONS, "migration_lock.toml");
check('migration_lock.toml объявляет провайдер "postgresql"', fs.existsSync(lockFile) && read(lockFile).includes('provider = "postgresql"'));
check("Миграции MSSQL удалены (история соответствует провайдеру)", !fs.existsSync(path.join(MIGRATIONS, "20261006120000_init")));

// ── итог ────────────────────────────────────────────────────────────────────
console.log("\n──────── ИТОГ ────────");
console.log(`успешно: ${passed.length} | ошибок: ${failed.length}`);
if (failed.length > 0) {
  console.log("\nНе прошли проверки:");
  for (const title of failed) console.log(`  ОШИБКА: ${title}`);
  process.exitCode = 1;
}
