// ─────────────────────────────────────────────────────────────────────────────
// Проверка файла заполнения базы (src/prisma/seed.ts).
//
// Запуск:  npm run test:seed
//
// Скрипт имитирует работу seed-файла без SQL Server: Prisma Client подменяется
// in-memory заглушкой, после чего проверяется, что в «базу» попали все данные
// магазина — категории, материалы, изделия, компоненты конструктора, точки
// выдачи, пользователи, сборки, избранное и история заказов.
// ─────────────────────────────────────────────────────────────────────────────

"use strict";

const path = require("node:path");

process.env.NODE_ENV = "test";
process.env.JWT_SECRET = "test-secret-key";
process.env.UPLOAD_DIR = "uploads";
process.env.DATABASE_URL = "postgresql://noir:noir@localhost:5432/noir_bijoux_test?schema=public";

const { createFakePrisma } = require("./fake-prisma");

const fakePrisma = createFakePrisma();
const clientPath = require.resolve(path.join(__dirname, "..", "dist", "prisma", "client.js"));

require.cache[clientPath] = {
  id: clientPath,
  filename: clientPath,
  loaded: true,
  exports: { prisma: fakePrisma },
  children: [],
  paths: [],
};

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

async function main() {
  console.log("Запуск src/prisma/seed.ts на тестовой заглушке базы\n");

  const originalLog = console.log;
  console.log = () => {}; // прячем служебные сообщения seed-скрипта
  require("../dist/prisma/seed.js");
  await new Promise((resolve) => setTimeout(resolve, 2000)); // seed пишет данные асинхронно
  console.log = originalLog;

  const db = fakePrisma.__db;

  check("Ошибок при заполнении нет", process.exitCode !== 1);
  check("Категории: 4 (колье, браслет, серьги, кольцо)", db.category.length === 4, `записей: ${db.category.length}`);
  check("Материалы: 3", db.material.length === 3, db.material.map((row) => row.name).join(", "));
  check("Изделия каталога: 8", db.product.length === 8, `записей: ${db.product.length}`);
  check("Компоненты конструктора: 40", db.component.length === 40, `записей: ${db.component.length}`);
  check("Точки получения: 5 (2 самовывоза + 3 ПВЗ)", db.pickupPoint.length === 5, `записей: ${db.pickupPoint.length}`);
  check("Пользователи: 2 (клиент и администратор)", db.user.length === 2);
  check("Сборки: 2", db.build.length === 2, db.build.map((row) => row.article).join(", "));
  check("Избранная сборка: 1", db.favorite.length === 1);
  check("Заказов в истории: 2", db.order.length === 2, db.order.map((row) => row.orderNumber).join(", "));

  // ── идентификаторы совпадают с фронтендом ─────────────────────────────────
  const product = db.product.find((row) => row.id === 1);
  check("Изделие с id = 1 — «Колье «Ночная Роза»»", product?.name === "Колье «Ночная Роза»", product?.name);
  check("Цена изделия 4500 приходит числом", product?.price === 4500, String(product?.price));
  check(
    "Изделие связано с категорией «колье»",
    db.category.find((row) => row.id === product?.categoryId)?.slug === "necklace",
  );
  check(
    "Изделие связано с материалом «Серебро 925»",
    db.material.find((row) => row.id === product?.materialId)?.name === "Серебро 925",
  );

  const component = db.component.find((row) => row.id === 3);
  check("Компонент id = 3 — «Подвеска «Чёрная Роза»»", component?.name === "Подвеска «Чёрная Роза»", component?.name);
  check("У компонента указаны вкладка и слой", component?.slot === "pendant" && component?.layerZ === 5);

  const necklaceComponents = db.component.filter((row) => row.jewelryType === "necklace");
  check("Компонентов колье: 10", necklaceComponents.length === 10, `компонентов: ${necklaceComponents.length}`);

  // ── сборки и заказы ───────────────────────────────────────────────────────
  const build = db.build.find((row) => row.article === "NB-NK-1-3-6");
  check("Сборка NB-NK-1-3-6 создана", Boolean(build));
  check("Цена сборки посчитана: 1500 + 1200 + 300 = 3000", build?.totalPrice === 3000, String(build?.totalPrice));

  const buildItems = db.buildItem.filter((row) => row.buildId === build?.id);
  check("В сборке 3 компонента с слоями", buildItems.length === 3 && buildItems.some((row) => row.layerZ === 5));

  const order = db.order.find((row) => row.orderNumber === "4821");
  check("Заказ № 4821 принадлежит пользователю «Ольга»", order?.customerName === "Ольга Иванова", order?.customerName);
  check("Итог заказа 4821 = 4500 + 3000 = 7500", order?.total === 7500, String(order?.total));
  check("Статус заказа 4821 — done (выполнен)", order?.status === "done");

  const orderItems = db.orderItem.filter((row) => row.orderId === order?.id);
  check("В заказе 4821 две позиции (изделие + сборка)", orderItems.length === 2, `позиций: ${orderItems.length}`);

  check("Заказ № 4822 — новый, в пункт выдачи", db.order.find((row) => row.orderNumber === "4822")?.status === "new");

  // ── пароли ────────────────────────────────────────────────────────────────
  const client = db.user.find((row) => row.email === "olga@mail.ru");
  const admin = db.user.find((row) => row.email === "admin@noir.ru");

  check("Пароль хранится в виде bcrypt-хеша", String(client?.password).startsWith("$2"), String(client?.password).slice(0, 7));
  check("Открытого пароля в базе нет", !String(client?.password).includes("noir1234"));
  check("Администратор имеет роль admin", admin?.role === "admin", String(admin?.role));
  check("Клиент имеет роль client", client?.role === "client");

  const bcrypt = require("bcryptjs");
  check("Хеш клиента соответствует паролю noir1234", await bcrypt.compare("noir1234", client.password));
  check("Хеш администратора соответствует паролю admin1234", await bcrypt.compare("admin1234", admin.password));

  // ── точки выдачи ──────────────────────────────────────────────────────────
  check("Точек самовывоза: 2", db.pickupPoint.filter((row) => row.kind === "pickup").length === 2);
  check("Пунктов выдачи: 3", db.pickupPoint.filter((row) => row.kind === "pvz").length === 3);

  console.log("\n──────── ИТОГ ────────");
  console.log(`успешно: ${passed.length} | ошибок: ${failed.length}`);
  for (const item of failed) console.log(`  ОШИБКА: ${item}`);

  process.exit(failed.length === 0 ? 0 : 1);
}

main().catch((error) => {
  console.error("Тест упал с необработанной ошибкой:", error);
  process.exit(1);
});
