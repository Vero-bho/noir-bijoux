// ─────────────────────────────────────────────────────────────────────────────
// Смоук-тест API Noir Bijoux.
//
// Запуск:  npm run test:api      (сначала собирает проект, затем запускает тест)
//
// Что происходит:
//   1. Prisma Client подменяется in-memory заглушкой (tests/fake-prisma.js),
//      чтобы проверять API без запущенного SQL Server;
//   2. поднимается настоящее Express-приложение (dist/app.js);
//   3. выполняются реальные HTTP-запросы ко всем эндпоинтам;
//   4. проверяются коды ответов, структура данных, валидация, JWT и права доступа.
//
// Для проверки с настоящей базой MSSQL этот тест не нужен — там достаточно
// Swagger UI (/api-docs) или коллекции Postman (postman/NoirBijoux.postman_collection.json).
// ─────────────────────────────────────────────────────────────────────────────

"use strict";

const path = require("node:path");

// ── 1. Переменные окружения должны быть заданы ДО загрузки приложения ───────
process.env.NODE_ENV = "test";
process.env.PORT = "0";
process.env.JWT_SECRET = "test-secret-key";
process.env.JWT_EXPIRES_IN = "1h";
process.env.UPLOAD_DIR = "uploads";
process.env.DATABASE_URL = "postgresql://noir:noir@localhost:5432/noir_bijoux_test?schema=public";

// ── 2. Подменяем Prisma Client заглушкой ────────────────────────────────────
const { createFakePrisma, seed } = require("./fake-prisma");

const fakePrisma = createFakePrisma();
seed(fakePrisma);

const clientPath = require.resolve(path.join(__dirname, "..", "dist", "prisma", "client.js"));
require.cache[clientPath] = {
  id: clientPath,
  filename: clientPath,
  loaded: true,
  exports: { prisma: fakePrisma },
  children: [],
  paths: [],
};

// ── 3. Поднимаем приложение ─────────────────────────────────────────────────
const { createApp } = require("../dist/app.js");

// ── мини-фреймворк проверок ─────────────────────────────────────────────────
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

function section(title) {
  console.log(`\n${title}`);
}

const PNG_1PX = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==",
  "base64",
);

async function main() {
  const app = createApp();
  const server = app.listen(0);
  await new Promise((resolve) => server.once("listening", resolve));
  const base = `http://127.0.0.1:${server.address().port}`;

  const request = async (method, url, { token, body, form } = {}) => {
    const headers = {};
    if (token) headers.Authorization = `Bearer ${token}`;
    if (body !== undefined) headers["Content-Type"] = "application/json";

    const response = await fetch(`${base}${url}`, {
      method,
      headers,
      body: form ?? (body !== undefined ? JSON.stringify(body) : undefined),
    });

    const text = await response.text();
    let json = null;
    try {
      json = text ? JSON.parse(text) : null;
    } catch {
      json = text;
    }

    return { status: response.status, body: json };
  };

  // ── служебные эндпоинты ───────────────────────────────────────────────────
  section("Служебные эндпоинты и документация");
  {
    const health = await request("GET", "/api/health");
    check("GET /api/health отвечает 200 и status=ok", health.status === 200 && health.body.status === "ok", JSON.stringify(health.body));
    check("Проверка связи с базой выполняется", health.body.database === "connected", health.body.database);

    const docs = await request("GET", "/api-docs.json");
    const paths = Object.keys(docs.body?.paths ?? {});
    check("Swagger отдаёт спецификацию OpenAPI", docs.status === 200 && docs.body.openapi === "3.0.0");
    check(`В Swagger описано ${paths.length} эндпоинтов`, paths.length >= 20, paths.slice(0, 3).join(", "));
    check(
      "В Swagger есть схема авторизации bearerAuth",
      Boolean(docs.body?.components?.securitySchemes?.bearerAuth),
    );

    const missing = await request("GET", "/api/такого-нет");
    check("Неизвестный маршрут отвечает 404 в формате JSON", missing.status === 404 && Boolean(missing.body.message));
  }

  // ── регистрация и вход ────────────────────────────────────────────────────
  section("Авторизация (модуль auth)");
  let token = "";
  let adminToken = "";
  let userId = 0;

  {
    const bad = await request("POST", "/api/auth/register", { body: { fullName: "О", email: "не-почта", password: "123" } });
    check("Регистрация с некорректными данными → 400", bad.status === 400);
    check("В ответе 400 есть список ошибок по полям", Array.isArray(bad.body.errors) && bad.body.errors.length >= 3, `полей с ошибками: ${bad.body.errors?.length}`);

    const created = await request("POST", "/api/auth/register", {
      body: { fullName: "Ольга Иванова", email: "Olga@Mail.ru", phone: "+7 (999) 000-00-00", password: "noir1234" },
    });
    check("Регистрация → 201 и токен", created.status === 201 && Boolean(created.body.token));
    check("Пароль не возвращается в ответе", created.body.user && created.body.user.password === undefined);
    check("E-mail приведён к нижнему регистру", created.body.user?.email === "olga@mail.ru", created.body.user?.email);
    token = created.body.token;
    userId = created.body.user?.id;

    const duplicate = await request("POST", "/api/auth/register", {
      body: { fullName: "Ольга Вторая", email: "olga@mail.ru", password: "noir1234" },
    });
    check("Повторная регистрация того же e-mail → 409", duplicate.status === 409, duplicate.body.message);

    const wrongPassword = await request("POST", "/api/auth/login", { body: { email: "olga@mail.ru", password: "неверный" } });
    check("Вход с неверным паролем → 401", wrongPassword.status === 401);

    const login = await request("POST", "/api/auth/login", { body: { email: "olga@mail.ru", password: "noir1234" } });
    check("Вход с верным паролем → 200 и токен", login.status === 200 && Boolean(login.body.token));
    token = login.body.token;

    const noToken = await request("GET", "/api/auth/me");
    check("GET /api/auth/me без токена → 401", noToken.status === 401);

    const me = await request("GET", "/api/auth/me", { token });
    check("GET /api/auth/me с токеном → данные пользователя", me.status === 200 && me.body.user.email === "olga@mail.ru");

    const broken = await request("GET", "/api/auth/me", { token: "broken.token.value" });
    check("Испорченный токен → 401", broken.status === 401);
  }

  // ── каталог ───────────────────────────────────────────────────────────────
  section("Каталог (модуль products)");
  {
    const all = await request("GET", "/api/products");
    check("GET /api/products → 8 изделий", all.status === 200 && all.body.items.length === 8, `получено: ${all.body.items?.length}`);
    check("Цена приходит числом, а не строкой", typeof all.body.items[0].price === "number", `${all.body.items[0].price} (${typeof all.body.items[0].price})`);
    check("У изделия есть категория и материал", Boolean(all.body.items[0].type && all.body.items[0].material));

    const necklaces = await request("GET", "/api/products?type=necklace");
    check("Фильтр type=necklace → 3 изделия", necklaces.body.items.length === 3, `получено: ${necklaces.body.items.length}`);

    const byMaterial = await request("GET", "/api/products?material=Ювелирный сплав");
    check("Фильтр material=Ювелирный сплав → 2 изделия", byMaterial.body.items.length === 2, `получено: ${byMaterial.body.items.length}`);

    const byPrice = await request("GET", "/api/products?maxPrice=3200");
    check("Фильтр maxPrice=3200 → 3 изделия", byPrice.body.items.length === 3, `получено: ${byPrice.body.items.length}`);

    const sorted = await request("GET", "/api/products?sort=price-asc");
    const prices = sorted.body.items.map((item) => item.price);
    check("Сортировка по цене возрастает", prices.every((price, index) => index === 0 || prices[index - 1] <= price), prices.join(", "));

    const search = await request("GET", "/api/products?search=роза");
    check("Поиск «роза» находит изделие", search.body.items.length >= 1, `найдено: ${search.body.items.length}`);

    const one = await request("GET", "/api/products/necklace-night-rose");
    check("GET /api/products/:slug → карточка изделия", one.status === 200 && one.body.name === "Колье «Ночная Роза»");

    const missing = await request("GET", "/api/products/no-such-slug");
    check("Несуществующий slug → 404", missing.status === 404);

    const categories = await request("GET", "/api/categories");
    check("GET /api/categories → 4 категории", categories.body.items.length === 4);

    const materials = await request("GET", "/api/materials");
    check("GET /api/materials → 3 материала", materials.body.items.length === 3);
  }

  // ── компоненты конструктора ───────────────────────────────────────────────
  section("Конструктор (модуль components)");
  {
    const necklace = await request("GET", "/api/components?type=necklace");
    check("Компоненты колье отдаются", necklace.status === 200 && necklace.body.total >= 6, `компонентов: ${necklace.body.total}`);

    const pendants = await request("GET", "/api/components?type=necklace&slot=pendant");
    check("Фильтр по вкладке slot=pendant", pendants.body.items.every((item) => item.slot === "pendant") && pendants.body.total === 3, `подвесок: ${pendants.body.total}`);
    check("У компонента есть слой картинки и layerZ", Boolean(pendants.body.items[0].image && typeof pendants.body.items[0].layerZ === "number"));

    const single = await request("GET", "/api/components/1");
    check("GET /api/components/:id → компонент", single.status === 200 && single.body.name === "Панцирная цепочка");

    const badId = await request("GET", "/api/components/abc");
    check("Идентификатор не число → 400 (express-validator)", badId.status === 400);
  }

  // ── точки получения ───────────────────────────────────────────────────────
  section("Доставка (модуль delivery)");
  {
    const pickup = await request("GET", "/api/delivery/points?kind=pickup");
    check("Точки самовывоза фильтруются", pickup.body.items.length === 2 && pickup.body.items.every((point) => point.kind === "pickup"));

    const pvz = await request("GET", "/api/delivery/points?kind=pvz");
    check("Пункты выдачи фильтруются", pvz.body.items.length === 2 && pvz.body.items.every((point) => point.kind === "pvz"));

    const one = await request("GET", "/api/delivery/points/1");
    check("GET /api/delivery/points/:id → точка", one.status === 200 && one.body.provider.includes("Мастерская"));

    const missing = await request("GET", "/api/delivery/points/999");
    check("Несуществующая точка → 404", missing.status === 404);
  }

  // ── сборки ────────────────────────────────────────────────────────────────
  section("Сборки (модуль builds)");
  let buildId = 0;
  {
    const badType = await request("POST", "/api/builds", { token, body: { jewelryType: "колье", componentIds: [1] } });
    check("Неизвестный тип изделия → 400", badType.status === 400);

    const wrongComponent = await request("POST", "/api/builds", { token, body: { jewelryType: "ring", componentIds: [1] } });
    check("Компонент из другого типа изделия → 400", wrongComponent.status === 400, wrongComponent.body.message);

    const missingComponent = await request("POST", "/api/builds", { token, body: { jewelryType: "necklace", componentIds: [999] } });
    check("Несуществующий компонент → 400", missingComponent.status === 400);

    const created = await request("POST", "/api/builds", { token, body: { jewelryType: "necklace", componentIds: [1, 3, 6] } });
    check("Создание сборки → 201", created.status === 201);
    check("Артикул сформирован сервером: NB-NK-1-3-6", created.body.article === "NB-NK-1-3-6", created.body.article);
    check("Итоговая цена посчитана сервером (1500+1200+300)", created.body.totalPrice === 3000, String(created.body.totalPrice));
    check("Состав сборки содержит 3 компонента", created.body.components?.length === 3);
    buildId = created.body.id;

    const guest = await request("POST", "/api/builds", { body: { jewelryType: "ring", componentIds: [29, 32] } });
    check("Гость тоже может собрать украшение (optionalAuth)", guest.status === 201 && guest.body.totalPrice === 2300, `цена: ${guest.body.totalPrice}`);

    const mine = await request("GET", "/api/builds/my", { token });
    check("GET /api/builds/my возвращает сборки пользователя", mine.status === 200 && mine.body.items.length === 1, `сборок: ${mine.body.items?.length}`);

    const noAuth = await request("GET", "/api/builds/my");
    check("GET /api/builds/my без токена → 401", noAuth.status === 401);

    const one = await request("GET", `/api/builds/${buildId}`, { token });
    check("GET /api/builds/:id → сборка с составом", one.status === 200 && one.body.article === "NB-NK-1-3-6");
  }

  // ── избранное ─────────────────────────────────────────────────────────────
  section("Избранное (модуль favorites)");
  let favoriteId = 0;
  {
    const added = await request("POST", "/api/favorites", { token, body: { buildId } });
    check("Добавление сборки в избранное → 201", added.status === 201);
    check("В ответе есть вложенная сборка", Boolean(added.body.build?.article === "NB-NK-1-3-6"));
    favoriteId = added.body.id;

    const duplicate = await request("POST", "/api/favorites", { token, body: { buildId } });
    check("Повторное добавление → 409", duplicate.status === 409);

    const list = await request("GET", "/api/favorites", { token });
    check("Список избранного содержит 1 сборку", list.body.items.length === 1);

    const noAuth = await request("GET", "/api/favorites");
    check("Избранное без токена → 401", noAuth.status === 401);

    const removed = await request("DELETE", `/api/favorites/${favoriteId}`, { token });
    check("Удаление из избранного → 200", removed.status === 200);

    const afterRemove = await request("GET", "/api/favorites", { token });
    check("После удаления список пуст", afterRemove.body.items.length === 0);
  }

  // ── заказы ────────────────────────────────────────────────────────────────
  section("Заказы (модуль orders)");
  let orderNumber = "";
  let orderId = 0;
  {
    const invalid = await request("POST", "/api/orders", { body: { customerName: "О", phone: "12", deliveryType: "Курьер", items: [] } });
    check("Некорректный заказ → 400", invalid.status === 400);
    check("Ошибки валидации перечислены по полям", Array.isArray(invalid.body.errors) && invalid.body.errors.length >= 3, `ошибок: ${invalid.body.errors?.length}`);

    const courierWithoutAddress = await request("POST", "/api/orders", {
      body: { customerName: "Ольга", phone: "+7 (999) 000-00-00", deliveryType: "Курьер", items: [{ productId: 1, quantity: 1 }] },
    });
    check("Курьер без адреса → 400", courierWithoutAddress.status === 400, courierWithoutAddress.body.message);

    const created = await request("POST", "/api/orders", {
      token,
      body: {
        customerName: "Ольга Иванова",
        phone: "+7 (999) 000-00-00",
        email: "olga@mail.ru",
        deliveryType: "Самовывоз",
        deliveryPointId: 1,
        items: [
          { productId: 1, quantity: 2 },
          { buildId, quantity: 1 },
        ],
      },
    });

    check("Оформление заказа → 201", created.status === 201, created.body.message ?? "");
    check("Номер заказа присвоен (4 цифры)", /^\d{4,6}$/.test(created.body.orderNumber ?? ""), created.body.orderNumber);
    check("Цена изделия взята из базы (4500 × 2 = 9000)", created.body.items?.[0]?.price === 4500 && created.body.items?.[0]?.quantity === 2);
    check("Цена сборки взята из базы (3000)", created.body.items?.[1]?.price === 3000, `сборка: ${created.body.items?.[1]?.price}`);
    check("Позиции: 9000 + 3000 = 12000", created.body.itemsTotal === 12000, `позиции: ${created.body.itemsTotal}`);
    check("Самовывоз бесплатный, итог = 12000", created.body.total === 12000 && created.body.deliveryCost === 0, `итог: ${created.body.total}`);
    check("Статус нового заказа — new", created.body.status === "new");
    orderNumber = created.body.orderNumber;
    orderId = created.body.id;

    const courier = await request("POST", "/api/orders", {
      body: {
        customerName: "Гость",
        phone: "+7 (999) 111-22-33",
        deliveryType: "Курьер",
        address: "г. Новосибирск, ул. Ленина, д. 1, кв. 5",
        items: [{ productId: 6, quantity: 1 }],
      },
    });
    check("Заказ гостем + доставка курьером (+400 ₽)", courier.status === 201 && courier.body.total === 3200, `итог: ${courier.body.total}`);

    const pvz = await request("POST", "/api/orders", {
      body: {
        customerName: "Гость",
        phone: "+7 (999) 111-22-33",
        deliveryType: "Пункт выдачи",
        deliveryPointId: 3,
        items: [{ productId: 8, quantity: 1 }],
      },
    });
    check("Заказ в ПВЗ (+250 ₽)", pvz.status === 201 && pvz.body.total === 4150, `итог: ${pvz.body.total}`);

    const badPoint = await request("POST", "/api/orders", {
      body: {
        customerName: "Гость",
        phone: "+7 (999) 111-22-33",
        deliveryType: "Пункт выдачи",
        deliveryPointId: 777,
        items: [{ productId: 8, quantity: 1 }],
      },
    });
    check("Несуществующий пункт выдачи → 404", badPoint.status === 404);

    const mine = await request("GET", "/api/orders/my", { token });
    check("GET /api/orders/my → заказы пользователя (1)", mine.status === 200 && mine.body.items.length === 1, `заказов: ${mine.body.items?.length}`);

    const noAuth = await request("GET", "/api/orders/my");
    check("История заказов без токена → 401", noAuth.status === 401);

    const byNumber = await request("GET", `/api/orders/${orderNumber}`, { token });
    check("GET /api/orders/:orderNumber → заказ", byNumber.status === 200 && byNumber.body.total === 12000);

    const otherUser = await request("POST", "/api/auth/register", {
      body: { fullName: "Другой Пользователь", email: "other@mail.ru", password: "noir1234" },
    });
    const foreign = await request("GET", `/api/orders/${orderNumber}`, { token: otherUser.body.token });
    check("Чужой заказ → 403", foreign.status === 403);
  }

  // ── профиль ───────────────────────────────────────────────────────────────
  section("Личный кабинет (модуль profile)");
  {
    const profile = await request("GET", "/api/profile", { token });
    check("GET /api/profile → профиль", profile.status === 200 && profile.body.user.fullName === "Ольга Иванова");

    const updated = await request("PATCH", "/api/profile", { token, body: { fullName: "Ольга П.", phone: "+7 999 000-11-22" } });
    check("PATCH /api/profile обновляет данные", updated.status === 200 && updated.body.user.fullName === "Ольга П.");

    const conflict = await request("PATCH", "/api/profile", { token, body: { email: "other@mail.ru" } });
    check("Занятый e-mail → 409", conflict.status === 409);

    const form = new FormData();
    form.append("avatar", new Blob([PNG_1PX], { type: "image/png" }), "avatar.png");
    const avatar = await request("POST", "/api/profile/avatar", { token, form });
    check(
      "Загрузка аватара → 200 и путь к файлу",
      avatar.status === 200 && /^\/uploads\/avatars\/avatar-\d+-\d+\.png$/.test(String(avatar.body.user?.avatarUrl)),
      avatar.body.user?.avatarUrl,
    );

    const noFile = await request("POST", "/api/profile/avatar", { token });
    check("Загрузка без файла → 400", noFile.status === 400);

    const wrongPassword = await request("POST", "/api/profile/password", { token, body: { currentPassword: "неверный", newPassword: "новыйпароль" } });
    check("Смена пароля с неверным текущим → 400", wrongPassword.status === 400);

    const changed = await request("POST", "/api/profile/password", { token, body: { currentPassword: "noir1234", newPassword: "noir5678" } });
    check("Смена пароля → 200", changed.status === 200);

    const relogin = await request("POST", "/api/auth/login", { body: { email: "olga@mail.ru", password: "noir5678" } });
    check("Вход с новым паролем работает", relogin.status === 200);
    token = relogin.body.token;
  }

  // ── права администратора ──────────────────────────────────────────────────
  section("Управление каталогом (модуль admin)");
  {
    const forbidden = await request("GET", "/api/admin/orders", { token });
    check("Доступ к /api/admin без роли admin → 403", forbidden.status === 403);

    // выдаём роль администратора напрямую в «базе»
    fakePrisma.__db.user.find((user) => user.id === userId).role = "admin";
    const adminLogin = await request("POST", "/api/auth/login", { body: { email: "olga@mail.ru", password: "noir5678" } });
    adminToken = adminLogin.body.token;

    const orders = await request("GET", "/api/admin/orders", { token: adminToken });
    check("Администратор видит все заказы (3)", orders.status === 200 && orders.body.items.length === 3, `заказов: ${orders.body.items?.length}`);

    const status = await request("PATCH", `/api/orders/${orderId}/status`, { token: adminToken, body: { status: "making" } });
    check("Изменение статуса заказа → 200 (making)", status.status === 200 && status.body.status === "making");

    const badStatus = await request("PATCH", `/api/orders/${orderId}/status`, { token: adminToken, body: { status: "летит" } });
    check("Недопустимый статус → 400", badStatus.status === 400);

    const createdProduct = await request("POST", "/api/admin/products", {
      token: adminToken,
      body: { name: "Колье «Полночь»", slug: "necklace-midnight", categoryId: 1, materialId: 1, price: 4900, imageUrl: "/uploads/products/midnight.png" },
    });
    check("Добавление изделия в каталог → 201", createdProduct.status === 201, createdProduct.body.message ?? "");

    const catalog = await request("GET", "/api/products");
    check("Новое изделие появилось в каталоге (9)", catalog.body.items.length === 9, `изделий: ${catalog.body.items?.length}`);

    const hidden = await request("DELETE", `/api/admin/products/${createdProduct.body.id}`, { token: adminToken });
    check("Скрытие изделия → isActive=false", hidden.status === 200 && hidden.body.isActive === false);

    const afterHide = await request("GET", "/api/products");
    check("Скрытое изделие пропало из каталога (8)", afterHide.body.items.length === 8, `изделий: ${afterHide.body.items?.length}`);
  }

  server.close();

  // ── итог ──────────────────────────────────────────────────────────────────
  console.log("\n──────── ИТОГ ────────");
  console.log(`успешно: ${passed.length} | ошибок: ${failed.length}`);
  for (const item of failed) console.log(`  ОШИБКА: ${item}`);

  process.exit(failed.length === 0 ? 0 : 1);
}

main().catch((error) => {
  console.error("Тест упал с необработанной ошибкой:", error);
  process.exit(1);
});
