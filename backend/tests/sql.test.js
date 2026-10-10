// ─────────────────────────────────────────────────────────────────────────────
// Проверка SQL-скриптов базы MSSQL (шаг 5) — без установленного SQL Server.
//
// Запуск:  npm run test:sql
//
// Что проверяется:
//   1. структура: 02_schema.sql содержит таблицу для каждой модели schema.prisma
//      и все связи (внешние ключи), которые объявлены в схеме;
//   2. столбцы: все столбцы из инструкций INSERT существуют в CREATE TABLE;
//   3. целостность данных в 04_seed.sql: ссылки на категории, материалы,
//      компоненты, сборки и заказы указывают на существующие записи;
//   4. суммы: итог заказа равен сумме позиций плюс стоимость доставки;
//   5. пароли: в базе лежат bcrypt-хеши, и они действительно соответствуют
//      демо-паролям «noir1234» и «admin1234»;
//   6. индексы из 03_indexes.sql покрывают все внешние ключи;
//   7. данные совпадают с сайтом: цены и названия изделий в 04_seed.sql
//      совпадают с frontend/app/data/catalog.ts.
// ─────────────────────────────────────────────────────────────────────────────

"use strict";

const fs = require("node:fs");
const path = require("node:path");
const bcrypt = require("bcryptjs");

const BACKEND = path.join(__dirname, "..");
const ROOT = path.join(BACKEND, "..");
const SQL_DIR = path.join(BACKEND, "sql");

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

// ── вспомогательное: разбор строк VALUES из INSERT в SQL-скрипте ────────────
/** Возвращает список строк (каждая строка — массив значений) для всех INSERT в указанную таблицу */
function parseInsertRows(sql, table) {
  const rows = [];
  const marker = `INSERT INTO [dbo].[${table}]`;
  let position = 0;

  while (true) {
    const start = sql.indexOf(marker, position);
    if (start === -1) break;

    const valuesStart = sql.indexOf("VALUES", start);
    const blockEnd = sql.indexOf(";", valuesStart);
    const block = sql.slice(valuesStart + "VALUES".length, blockEnd);
    position = blockEnd + 1;

    // разбираем «(1, N'Колье', N'necklace')»: учитываем кавычки и вложенные скобки
    let depth = 0;
    let inString = false;
    let current = "";
    let cells = [];

    const flush = () => {
      cells.push(current.trim());
      current = "";
    };

    for (let i = 0; i < block.length; i += 1) {
      const char = block[i];

      if (char === "'") {
        if (inString && block[i + 1] === "'") {
          // удвоенный апостроф внутри строки = один символ
          current += "'";
          i += 1;
          continue;
        }

        if (!inString) {
          // перед открывающей кавычкой может стоять префикс N (юникод-строка) — убираем его
          const before = current[current.length - 2];
          if (/[Nn]$/.test(current) && (current.length === 1 || (before !== undefined && !/[A-Za-z0-9_@]/.test(before)))) {
            current = current.slice(0, -1);
          }
        }

        inString = !inString;
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
          flush();
          rows.push(cells.map(toCell));
          continue;
        }
      }
      if (char === "," && depth === 1) {
        flush();
        continue;
      }
      if (depth === 1) current += char;
    }
  }

  return rows.filter((row) => row.length > 1);
}

/** Преобразует значение из SQL: число, строка или null (для выражений вроде DATEADD(...)) */
function toCell(cell) {
  const text = cell.trim();
  if (!text || text.toUpperCase() === "NULL") return null;
  if (/^-?\d+(\.\d+)?$/.test(text)) return Number(text);

  // текст: строковый литерал, переменная (@olgaId) или выражение (DATEADD(...))
  return text;
}

function main() {
  console.log("Проверка SQL-скриптов базы MSSQL\n");

  const createScript = read(path.join(SQL_DIR, "01_create_database.sql"));
  const schemaScript = read(path.join(SQL_DIR, "02_schema.sql"));
  const indexScript = read(path.join(SQL_DIR, "03_indexes.sql"));
  const seedScript = read(path.join(SQL_DIR, "04_seed.sql"));
  const verifyScript = read(path.join(SQL_DIR, "05_verify.sql"));
  const schemaPrisma = read(path.join(BACKEND, "src", "prisma", "schema", "schema.prisma"));

  // ── 1. файлы на месте ────────────────────────────────────────────────────
  console.log("Файлы скриптов");
  for (const [name, content] of [
    ["01_create_database.sql", createScript],
    ["02_schema.sql", schemaScript],
    ["03_indexes.sql", indexScript],
    ["04_seed.sql", seedScript],
    ["05_verify.sql", verifyScript],
  ]) {
    check(`${name} — ${content.split("\n").length} строк`, content.length > 500);
  }

  // ── 2. таблицы соответствуют схеме Prisma ────────────────────────────────
  console.log("\nСтруктура таблиц (02_schema.sql против schema.prisma)");

  // имена таблиц в базе (во множественном числе, как их создаёт Prisma)
  const TABLE_OF_MODEL = {
    User: "users",
    Category: "categories",
    Material: "materials",
    Product: "products",
    Component: "components",
    Build: "builds",
    BuildItem: "build_items",
    Order: "orders",
    OrderItem: "order_items",
    Favorite: "favorites",
    PickupPoint: "pickup_points",
    ChatMessage: "chat_messages",
  };
  const models = [...schemaPrisma.matchAll(/^model (\w+) \{/gm)].map((match) => match[1]);
  const expectedTables = models.map((model) => TABLE_OF_MODEL[model]);

  const createdTables = [...schemaScript.matchAll(/CREATE TABLE \[dbo\]\.\[(\w+)\]/g)].map((match) => match[1]);

  check(
    `Таблиц создано: ${createdTables.length} (моделей в схеме: ${models.length})`,
    createdTables.length === models.length,
  );
  const missingTables = expectedTables.filter((table) => !createdTables.includes(table));
  check("Для каждой модели есть таблица", missingTables.length === 0, missingTables.join(", ") || "все совпадают");
  check(
    "Имена таблиц: users, categories, materials, products, components, builds, build_items, orders, order_items, favorites, pickup_points, chat_messages",
    createdTables.sort().join(",") === expectedTables.sort().join(","),
  );

  // ── 3. связи (внешние ключи) ─────────────────────────────────────────────
  console.log("\nСвязи между таблицами");
  const relationFields = [...schemaPrisma.matchAll(/@relation\(fields: \[(\w+)\]/g)].length;
  const foreignKeys = [...schemaScript.matchAll(/ADD CONSTRAINT \[(\w+)\] FOREIGN KEY/g)].map((match) => match[1]);

  check(
    `Внешних ключей: ${foreignKeys.length} (связей в схеме: ${relationFields})`,
    foreignKeys.length === relationFields,
  );
  check(
    "Для связей с заказом и сборкой стоит каскадное удаление (позиции удаляются вместе с заказом)",
    schemaScript.includes("[order_items_orderId_fkey]") && schemaScript.includes("ON DELETE CASCADE"),
  );
  check(
    "Обязательные связи защищены от случайного удаления (NO ACTION) — иначе MSSQL выдаёт ошибку «multiple cascade paths»",
    (schemaScript.match(/ON DELETE NO ACTION/g) ?? []).length >= 10,
  );

  // ── 4. столбцы в INSERT существуют в CREATE TABLE ────────────────────────
  console.log("\nСтолбцы в скрипте заполнения");
  const seedBatches = seedScript.split(/^\s*GO\s*$/m);
  let unknownColumns = [];

  for (const batch of seedBatches) {
    for (const match of batch.matchAll(/INSERT INTO \[dbo\]\.\[(\w+)\] \(([^)]+)\)/g)) {
      const table = match[1];
      const columns = match[2].split(",").map((column) => column.trim().replace(/[\[\]]/g, ""));

      const createBlock = schemaScript.split(`CREATE TABLE [dbo].[${table}] (`)[1]?.split("\n);")[0] ?? "";
      const existing = [...createBlock.matchAll(/\[(\w+)\]\s+(INT|NVARCHAR|DECIMAL|BIT|DATETIME2)/g)].map((row) => row[1]);

      for (const column of columns) {
        if (!existing.includes(column)) unknownColumns.push(`${table}.${column}`);
      }
    }
  }
  check("Все столбцы в INSERT описаны в таблицах", unknownColumns.length === 0, unknownColumns.join(", ") || "расхождений нет");

  // ── 5. количество данных ─────────────────────────────────────────────────
  console.log("\nДанные магазина (04_seed.sql)");
  const expected = {
    categories: 4,
    materials: 3,
    products: 8,
    components: 40,
    pickup_points: 5,
    users: 2,
    builds: 2,
    build_items: 6,
    favorites: 1,
    orders: 2,
    order_items: 3,
  };

  const rows = {};
  for (const [table, count] of Object.entries(expected)) {
    rows[table] = parseInsertRows(seedScript, table);
    check(`${table}: ${rows[table].length} строк`, rows[table].length === count, `ожидалось ${count}`);
  }

  // ── 6. ссылочная целостность ─────────────────────────────────────────────
  console.log("\nСсылочная целостность данных");
  const categoryIds = new Set(rows.categories.map((row) => row[0]));
  const materialIds = new Set(rows.materials.map((row) => row[0]));
  const productIds = new Set(rows.products.map((row) => row[0]));
  const componentIds = new Set(rows.components.map((row) => row[0]));
  const userIds = new Set([1, 2]); // пользователи вставляются автонумерацией, id будут 1 и 2
  const buildIds = new Set([1, 2]); // сборки тоже создаются по порядку
  const pointIds = new Set(rows.pickup_points.map((row) => row[0]));

  const badProducts = rows.products.filter((row) => !categoryIds.has(row[3]) || !materialIds.has(row[4]));
  check("Каждое изделие ссылается на существующую категорию и материал", badProducts.length === 0, `проблемных: ${badProducts.length}`);

  const badBuildItems = rows.build_items.filter((row) => !componentIds.has(row[1]));
  check("Каждый компонент сборки существует в таблице components", badBuildItems.length === 0);

  const badPoints = rows.orders.filter((row) => !pointIds.has(row[6]));
  check("Каждый заказ ссылается на существующую точку получения", badPoints.length === 0);

  const buildsWithoutOwner = rows.builds.filter((row) => String(row[0]) !== "@olgaId");
  check(
    "У демонстрационных сборок есть владелец (@olgaId — пользователь Ольга)",
    buildsWithoutOwner.length === 0,
    buildsWithoutOwner.map((row) => String(row[0])).join(", ") || "обе сборки привязаны к клиенту",
  );

  // ── 7. суммы заказов ─────────────────────────────────────────────────────
  console.log("\nРасчёты по заказам");
  const DELIVERY = { "Самовывоз": 0, "Курьер": 400, "Пункт выдачи": 250 };
  // позиции привязаны к переменным @order1 и @order2 — считаем суммы отдельно
  const itemsSumByOrder = { "@order1": 0, "@order2": 0 };

  rows.order_items.forEach((row) => {
    const key = String(row[0]);
    itemsSumByOrder[key] = (itemsSumByOrder[key] ?? 0) + Number(row[4]) * Number(row[5]);
  });

  const orderKeys = ["@order1", "@order2"];

  rows.orders.forEach((order, index) => {
    const total = Number(order[7]);
    const delivery = DELIVERY[order[5]] ?? 0;
    const itemsSum = itemsSumByOrder[orderKeys[index]] ?? 0;
    check(
      `Заказ № ${order[0]} — ${itemsSum} ₽ позиции + ${delivery} ₽ доставка = ${itemsSum + delivery} ₽`,
      total === itemsSum + delivery,
      `в базе указано ${total} ₽`,
    );
  });

  // ── 8. товары в заказе и сборки ──────────────────────────────────────────
  const orderProductIds = rows.order_items.filter((row) => row[1] !== null).map((row) => row[1]);
  check(
    "Позиции-изделия ссылаются на реальные изделия каталога",
    orderProductIds.every((id) => productIds.has(id)),
    `изделия: ${orderProductIds.join(", ")}`,
  );

  const buildArticles = rows.builds.map((row) => row[2]);
  check("Артикулы сборок: NB-NK-1-3-6 и NB-BR-11-13-16", buildArticles.sort().join(" | ") === "NB-BR-11-13-16 | NB-NK-1-3-6", buildArticles.join(" | "));

  const buildPrices = rows.builds.map((row) => Number(row[3]));
  const buildPriceByArticle = Object.fromEntries(rows.builds.map((row) => [String(row[2]), Number(row[3])]));
  check(
    "Цена сборки NB-NK-1-3-6 = 1500 + 1200 + 300 = 3000 ₽",
    buildPriceByArticle["NB-NK-1-3-6"] === 3000,
    `${buildPriceByArticle["NB-NK-1-3-6"]} ₽`,
  );
  check(
    "Цена сборки NB-BR-11-13-16 = 1200 + 700 + 400 = 2300 ₽",
    buildPriceByArticle["NB-BR-11-13-16"] === 2300,
    `${buildPriceByArticle["NB-BR-11-13-16"]} ₽`,
  );

  // ── 9. пароли ────────────────────────────────────────────────────────────
  console.log("\nПользователи и пароли");
  const users = rows.users;
  check("Пользователей двое: клиент и администратор", users.length === 2);
  check(
    "Роли: client и admin",
    users.map((row) => row[4]).sort().join(",") === "admin,client",
    users.map((row) => row[4]).join(", "),
  );

  const olga = users.find((row) => row[0] === "olga@mail.ru");
  const admin = users.find((row) => row[0] === "admin@noir.ru");
  check("E-mail клиента olga@mail.ru", Boolean(olga));
  check("E-mail администратора admin@noir.ru", Boolean(admin));

  check("Пароли хранятся в виде bcrypt-хешей ($2b$10$…)", users.every((row) => String(row[1]).startsWith("$2b$10$")));
  check("Хеш клиента соответствует паролю noir1234", bcrypt.compareSync("noir1234", String(olga?.[1])));
  check("Хеш администратора соответствует паролю admin1234", bcrypt.compareSync("admin1234", String(admin?.[1])));
  check("Открытых паролей в скрипте нет", !seedScript.includes("'noir1234'") && !seedScript.includes("'admin1234'"));

  // ── 10. индексы ──────────────────────────────────────────────────────────
  console.log("\nИндексы (03_indexes.sql)");
  const indexNames = [...indexScript.matchAll(/CREATE NONCLUSTERED INDEX \[(\w+)\]/g)].map((match) => match[1]);
  check(`Проиндексировано связей: ${indexNames.length}`, indexNames.length >= 12, indexNames.slice(0, 4).join(", ") + ", …");
  check(
    "Индексы создаются безопасно (IF NOT EXISTS, повторный запуск не ломает скрипт)",
    (indexScript.match(/IF NOT EXISTS \(SELECT 1 FROM sys\.indexes/g) ?? []).length === indexNames.length,
  );

  // ── 11. скрипт проверки и удаления базы ──────────────────────────────────
  console.log("\nВспомогательные скрипты");
  check("05_verify.sql содержит 11 запросов для отчёта", (verifyScript.match(/^SELECT/gm) ?? []).length === 11, String((verifyScript.match(/^SELECT/gm) ?? []).length));
  check("05_verify.sql проверяет, что итог заказа = позиции + доставка", verifyScript.includes("Сходится"));
  check("06_drop_database.sql закрывает соединения перед удалением", read(path.join(SQL_DIR, "06_drop_database.sql")).includes("SINGLE_USER WITH ROLLBACK IMMEDIATE"));

  // ── 12. данные совпадают с сайтом ────────────────────────────────────────
  console.log("\nДанные базы против данных сайта (frontend/app/data/catalog.ts)");
  const catalog = read(path.join(ROOT, "frontend", "app", "data", "catalog.ts"));
  const siteProducts = [...catalog.matchAll(/name: "([^"]+)",\s*\n\s*slug: "([^"]+)",\s*\n\s*type: "[^"]+",\s*\n\s*typeSlug: "([^"]+)",\s*\n\s*material: "([^"]+)",\s*\n\s*price: (\d+)/g)];

  check(`Изделий на сайте: ${siteProducts.length}`, siteProducts.length === 8);

  const mismatched = siteProducts.filter((match) => {
    const [, name, slug, , , price] = match;
    const row = rows.products.find((product) => product[2] === slug);
    return !row || row[1] !== name || Number(row[5]) !== Number(price);
  });
  check("Названия и цены изделий в базе совпадают с сайтом", mismatched.length === 0, mismatched.map((match) => match[1]).join(", ") || "полное совпадение");

  const componentsSource = read(path.join(ROOT, "frontend", "app", "data", "constructorComponents.ts"));
  const siteComponents = [...componentsSource.matchAll(/\{ id: (\d+), jewelryType: "(?:[^"]+)", slot: "(?:[^"]+)", name: "([^"]+)", price: (\d+)/g)];
  const componentMismatch = siteComponents.filter((match) => {
    const row = rows.components.find((component) => Number(component[0]) === Number(match[1]));
    return !row || row[1] !== match[2] || Number(row[5]) !== Number(match[3]);
  });
  check(
    `Компоненты конструктора совпадают с сайтом (${siteComponents.length} шт.)`,
    siteComponents.length === 40 && componentMismatch.length === 0,
    componentMismatch.map((match) => match[2]).join(", ") || "полное совпадение",
  );


  // ── 13. простой скрипт «всё в одном» (для создания базы вручную) ──────────
  console.log("\nПростой скрипт 00_create_all_simple.sql");

  const simplePath = path.join(SQL_DIR, "00_create_all_simple.sql");
  check("Файл есть в папке sql/", fs.existsSync(simplePath));

  const simple = fs.existsSync(simplePath) ? read(simplePath) : "";

  /** Разбор простого скрипта: таблицы, поля и связи */
  function parseSimpleScript(sql) {
    const tables = {};
    const fk = [];

    for (const match of sql.matchAll(/CREATE TABLE (\w+) \(([\s\S]*?)\n\);/g)) {
      const [, table, body] = match;
      const columns = [];

      for (const line of body.split("\n")) {
        const clean = line.replace(/\/\*[\s\S]*?\*\//g, "").replace(/--.*$/, "").trim();
        const column = clean.match(/^(\w+)\s+(INT|DECIMAL\(\d+,\d+\)|NVARCHAR\(\d+\)|DATETIME|BIT)(?=[\s,])/);
        if (column) columns.push(column[1]);
      }
      tables[table] = columns;
    }

    for (const match of sql.matchAll(
      /ALTER TABLE (\w+) ADD CONSTRAINT (\w+)\s+FOREIGN KEY \((\w+)\) REFERENCES (\w+)\((\w+)\)([^;]*);/g,
    )) {
      const [, child, name, column, parent, parentColumn, tail] = match;
      fk.push({ child, name, column, parent, parentColumn, cascade: tail.includes("CASCADE") });
    }

    return { tables, fk };
  }

  const simpleParsed = parseSimpleScript(simple);
  const simpleTables = Object.keys(simpleParsed.tables);
  check(`Таблиц в простом скрипте: ${simpleTables.length}`, simpleTables.length === 12);
  check(
    "Имена таблиц совпадают со схемой приложения",
    simpleTables.sort().join(",") === createdTables.sort().join(","),
    simpleTables.sort().join(", "),
  );

  // поля каждой таблицы должны совпадать с полями из 02_schema.sql (схема Prisma)
  const prismaTables = {};
  for (const match of schemaScript.matchAll(/CREATE TABLE \[dbo\]\.\[(\w+)\] \(([\s\S]*?)\n\);/g)) {
    prismaTables[match[1]] = [...match[2].matchAll(/^\s{4}\[(\w+)\]/gm)].map((row) => row[1]);
  }

  const columnMismatch = simpleTables.filter((table) => {
    const expected = (prismaTables[table] ?? []).slice().sort().join(",");
    const actual = simpleParsed.tables[table].slice().sort().join(",");
    return expected !== actual;
  });
  check(
    "Поля всех таблиц совпадают с полями из 02_schema.sql",
    columnMismatch.length === 0,
    columnMismatch.map((table) => `${table}: ${prismaTables[table]?.length} ≠ ${simpleParsed.tables[table].length}`).join("; ") || "полное совпадение",
  );

  // связи
  const prismaFk = [...schemaScript.matchAll(/ALTER TABLE \[dbo\]\.\[(\w+)\] ADD CONSTRAINT \[(\w+)\] FOREIGN KEY \(\[(\w+)\]\) REFERENCES \[dbo\]\.\[(\w+)\]/g)]
    .map((match) => `${match[1]}.${match[3]}→${match[4]}`)
    .sort();

  const simpleFk = simpleParsed.fk.map((row) => `${row.child}.${row.column}→${row.parent}`).sort();

  check(`Связей в простом скрипте: ${simpleFk.length}`, simpleFk.length === 12);
  check(
    "Связи совпадают со схемой приложения",
    simpleFk.join(", ") === prismaFk.join(", "),
    simpleFk.join(", ") === prismaFk.join(", ") ? "все 12 связей на месте" : simpleFk.join(", "),
  );
  check(
    "Каскадное удаление только у состава сборки и позиций заказа (2 связи)",
    simpleParsed.fk.filter((row) => row.cascade).length === 2,
    simpleParsed.fk.filter((row) => row.cascade).map((row) => row.name).join(", "),
  );

  // ── только простые типы данных ──
  check(
    "Используются только простые типы: INT, DECIMAL, NVARCHAR, DATETIME, BIT",
    !/\b(DATETIME2|SMALLDATETIME|FLOAT|REAL|MONEY|UNIQUEIDENTIFIER|VARBINARY|XML|GEOGRAPHY|HIERARCHYID|SQL_VARIANT|NVARCHAR\(MAX\)|NTEXT|IMAGE)\b/.test(simple),
  );
  check(
    "Нет служебных конструкций (sys-схемы, транзакции, автоматические имена ограничений)",
    !/sys\.schemas|sp_executesql|BEGIN TRY|@@TRANCOUNT|_pkey|_key\]|DEFAULT CONSTRAINT/.test(simple),
  );

  // ── первичные ключи и деньги ──
  const tablesWithoutPk = simpleTables.filter((table) => !/INT IDENTITY\(1,1\) PRIMARY KEY/.test(
    simple.split(`CREATE TABLE ${table} (`)[1]?.split("\n);")[0] ?? "",
  ));
  check("У каждой таблицы есть первичный ключ INT IDENTITY(1,1)", tablesWithoutPk.length === 0, tablesWithoutPk.join(", ") || "у всех 12 таблиц");

  const moneyColumns = [...simple.matchAll(/(price|total|totalPrice)\s+DECIMAL\(10,2\)/g)].map((match) => match[1]);
  check(`Деньги хранятся в DECIMAL(10,2) (найдено полей: ${moneyColumns.length})`, moneyColumns.length >= 5);

  const simpleIndexes = [...simple.matchAll(/CREATE INDEX (\w+)/g)].map((match) => match[1]);
  check(`Индексов в простом скрипте: ${simpleIndexes.length}`, simpleIndexes.length === 13);

  // ── подсказки для тех, кто запускает скрипт вручную ──
  check("В файле есть инструкция «как запустить в SSMS»", simple.includes("SQL Server Management Studio") && simple.includes("F5"));
  check("Есть закомментированный блок удаления базы", simple.includes("DROP DATABASE noir_bijoux"));
  check("Есть подсказка про отдельного пользователя базы (noir_app)", simple.includes("CREATE LOGIN noir_app"));

  // ── итог ─────────────────────────────────────────────────────────────────
  console.log("\n──────── ИТОГ ────────");
  console.log(`успешно: ${passed.length} | ошибок: ${failed.length}`);
  for (const item of failed) console.log(`  ОШИБКА: ${item}`);

  process.exit(failed.length === 0 ? 0 : 1);
}

main();
