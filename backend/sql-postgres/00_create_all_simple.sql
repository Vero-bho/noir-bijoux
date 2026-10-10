/* ============================================================================
   NOIR BIJOUX — СОЗДАНИЕ БАЗЫ В SUPABASE (POSTGRESQL), «ВСЁ В ОДНОМ»
   ----------------------------------------------------------------------------
   Один файл вместо четырёх: таблицы + индексы + данные магазина + проверка.

   КАК ВЫПОЛНИТЬ (ничего устанавливать не нужно, всё в браузере):
     1. Открыть https://supabase.com → войти → выбрать свой проект.
     2. Слева выбрать раздел «SQL Editor» (иконка с базой).
     3. Нажать «New query», вставить всё содержимое этого файла.
     4. Нажать «Run» (или Ctrl+Enter). Внизу появится «Success. No rows returned».
     5. Открыть раздел «Table Editor» — появятся 12 таблиц с данными.

   Файл читается сверху вниз, части отмечены в комментариях:
     часть 1 — 12 таблиц (создаются из схемы Prisma);
     часть 2 — 7 индексов;
     часть 3 — данные магазина (8 изделий, 40 компонентов, заказы и т. д.);
     часть 4 — проверка: сколько строк в каждой таблице.

   ЕСЛИ ТАБЛИЦЫ УЖЕ СОЗДАНЫ, скрипт выдаст ошибку «relation "users" already
   exists». Чтобы пересоздать базу с нуля: раскомментируйте блок удаления ниже
   (он удалит таблицы вместе со старыми данными) или выполните 05_drop.sql.

   Данные магазина — вымышленные (учебный проект), пароли хранятся хешами:
     клиент — olga@mail.ru / noir1234, администратор — admin@noir.ru / admin1234
   ============================================================================ */

-- РАСКОММЕНТИРОВАТЬ, ЧТОБЫ НАЧАТЬ С НУЛЯ (УДАЛИТ ВСЕ ДАННЫЕ):
-- DROP TABLE IF EXISTS "order_items", "orders", "favorites", "build_items", "builds",
--     "products", "components", "pickup_points", "chat_messages",
--     "users", "categories", "materials" CASCADE;

SET search_path = public;

/* ============================================================================
   ЧАСТЬ 1. ТАБЛИЦЫ
   ============================================================================ */

-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateTable
CREATE TABLE "users" (
    "id" SERIAL NOT NULL,
    "email" VARCHAR(150) NOT NULL,
    "password" VARCHAR(255) NOT NULL,
    "fullName" VARCHAR(150) NOT NULL,
    "phone" VARCHAR(30),
    "avatarUrl" VARCHAR(400),
    "role" VARCHAR(20) NOT NULL DEFAULT 'client',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "categories" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(60) NOT NULL,
    "slug" VARCHAR(60) NOT NULL,

    CONSTRAINT "categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "materials" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(80) NOT NULL,

    CONSTRAINT "materials_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "products" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(150) NOT NULL,
    "slug" VARCHAR(150) NOT NULL,
    "categoryId" INTEGER NOT NULL,
    "materialId" INTEGER NOT NULL,
    "price" DECIMAL(10,2) NOT NULL,
    "imageUrl" VARCHAR(400) NOT NULL,
    "description" VARCHAR(1000),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "products_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "components" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(150) NOT NULL,
    "jewelryType" VARCHAR(30) NOT NULL,
    "slot" VARCHAR(30) NOT NULL,
    "materialId" INTEGER,
    "price" DECIMAL(10,2) NOT NULL,
    "imageUrl" VARCHAR(400) NOT NULL,
    "layerZ" INTEGER NOT NULL DEFAULT 1,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "components_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "builds" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER,
    "jewelryType" VARCHAR(30) NOT NULL,
    "article" VARCHAR(50) NOT NULL,
    "totalPrice" DECIMAL(10,2) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "builds_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "build_items" (
    "id" SERIAL NOT NULL,
    "buildId" INTEGER NOT NULL,
    "componentId" INTEGER NOT NULL,
    "layerZ" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "build_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "orders" (
    "id" SERIAL NOT NULL,
    "orderNumber" VARCHAR(20) NOT NULL,
    "userId" INTEGER,
    "customerName" VARCHAR(150) NOT NULL,
    "phone" VARCHAR(30) NOT NULL,
    "email" VARCHAR(150),
    "deliveryType" VARCHAR(20) NOT NULL,
    "address" VARCHAR(400),
    "pickupPointId" INTEGER,
    "total" DECIMAL(10,2) NOT NULL,
    "status" VARCHAR(20) NOT NULL DEFAULT 'new',
    "comment" VARCHAR(500),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "orders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "order_items" (
    "id" SERIAL NOT NULL,
    "orderId" INTEGER NOT NULL,
    "productId" INTEGER,
    "buildId" INTEGER,
    "title" VARCHAR(200) NOT NULL,
    "price" DECIMAL(10,2) NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "order_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "favorites" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "buildId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "favorites_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pickup_points" (
    "id" SERIAL NOT NULL,
    "kind" VARCHAR(20) NOT NULL,
    "provider" VARCHAR(50) NOT NULL,
    "city" VARCHAR(80) NOT NULL,
    "address" VARCHAR(250) NOT NULL,
    "workHours" VARCHAR(120),
    "phone" VARCHAR(30),

    CONSTRAINT "pickup_points_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "chat_messages" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER,
    "room" VARCHAR(60) NOT NULL DEFAULT 'support',
    "body" VARCHAR(1000) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "chat_messages_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "categories_slug_key" ON "categories"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "materials_name_key" ON "materials"("name");

-- CreateIndex
CREATE UNIQUE INDEX "products_slug_key" ON "products"("slug");

-- CreateIndex
CREATE INDEX "products_categoryId_idx" ON "products"("categoryId");

-- CreateIndex
CREATE INDEX "products_materialId_idx" ON "products"("materialId");

-- CreateIndex
CREATE INDEX "components_jewelryType_slot_idx" ON "components"("jewelryType", "slot");

-- CreateIndex
CREATE UNIQUE INDEX "builds_article_key" ON "builds"("article");

-- CreateIndex
CREATE INDEX "builds_userId_idx" ON "builds"("userId");

-- CreateIndex
CREATE INDEX "build_items_buildId_idx" ON "build_items"("buildId");

-- CreateIndex
CREATE UNIQUE INDEX "orders_orderNumber_key" ON "orders"("orderNumber");

-- CreateIndex
CREATE INDEX "orders_userId_idx" ON "orders"("userId");

-- CreateIndex
CREATE INDEX "order_items_orderId_idx" ON "order_items"("orderId");

-- CreateIndex
CREATE INDEX "favorites_userId_idx" ON "favorites"("userId");

-- CreateIndex
CREATE INDEX "pickup_points_kind_city_idx" ON "pickup_points"("kind", "city");

-- CreateIndex
CREATE INDEX "chat_messages_room_createdAt_idx" ON "chat_messages"("room", "createdAt");

-- AddForeignKey
ALTER TABLE "products" ADD CONSTRAINT "products_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "categories"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "products" ADD CONSTRAINT "products_materialId_fkey" FOREIGN KEY ("materialId") REFERENCES "materials"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "components" ADD CONSTRAINT "components_materialId_fkey" FOREIGN KEY ("materialId") REFERENCES "materials"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "builds" ADD CONSTRAINT "builds_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "build_items" ADD CONSTRAINT "build_items_buildId_fkey" FOREIGN KEY ("buildId") REFERENCES "builds"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "build_items" ADD CONSTRAINT "build_items_componentId_fkey" FOREIGN KEY ("componentId") REFERENCES "components"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_buildId_fkey" FOREIGN KEY ("buildId") REFERENCES "builds"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "favorites" ADD CONSTRAINT "favorites_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "favorites" ADD CONSTRAINT "favorites_buildId_fkey" FOREIGN KEY ("buildId") REFERENCES "builds"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

/* ============================================================================
   ЧАСТЬ 2. ИНДЕКСЫ (ТЕ, КОТОРЫХ НЕТ В СХЕМЕ Prisma)
   ============================================================================ */


-- Каталог: фильтр «в наличии» + сортировка по цене
CREATE INDEX IF NOT EXISTS ix_products_active_price ON products (isActive, price);

-- Конструктор: материал компонента (цепочки, подвески, вставки)
CREATE INDEX IF NOT EXISTS ix_components_material ON components (materialId);

-- Состав сборки: поиск компонента по всем сборкам
CREATE INDEX IF NOT EXISTS ix_build_items_component ON build_items (componentId);

-- Заказы: фильтр по статусу в админке
CREATE INDEX IF NOT EXISTS ix_orders_status ON orders (status);

-- Позиции заказа: связь с изделием каталога и со сборкой
CREATE INDEX IF NOT EXISTS ix_order_items_product ON order_items (productId);
CREATE INDEX IF NOT EXISTS ix_order_items_build ON order_items (buildId);

-- Избранное: поиск по сборке (сколько пользователей её сохранили)
CREATE INDEX IF NOT EXISTS ix_favorites_build ON favorites (buildId);


/* ============================================================================
   ЧАСТЬ 3. ДАННЫЕ МАГАЗИНА
   ============================================================================ */
TRUNCATE TABLE
    "order_items", "orders", "favorites", "build_items", "builds",
    "products", "components", "pickup_points", "chat_messages",
    "users", "categories", "materials"
RESTART IDENTITY CASCADE;

/* --------------------------------------------- 2. КАТЕГОРИИ И МАТЕРИАЛЫ --- */
INSERT INTO "categories" ("id", "name", "slug") VALUES
    (1, 'Колье', 'necklace'),
    (2, 'Браслет', 'bracelet'),
    (3, 'Серьги', 'earrings'),
    (4, 'Кольцо', 'ring');
INSERT INTO "materials" ("id", "name") VALUES
    (1, 'Серебро 925'),
    (2, 'Ювелирный сплав'),
    (3, 'Чёрный родий');

/* ------------------------------------------------- 3. ИЗДЕЛИЯ КАТАЛОГА --- */
INSERT INTO "products" ("id", "name", "slug", "categoryId", "materialId", "price", "imageUrl", "description", "isActive") VALUES
    (1, 'Колье «Ночная Роза»', 'necklace-night-rose', 1, 1, 4500, '/assets/catalog/necklace-rose.svg', 'Колье на панцирной цепочке с подвеской-розой из чёрного оникса. Гипоаллергенное серебро 925 пробы, регулируемая длина.', TRUE),
    (2, 'Колье «Оникс капля»', 'necklace-onyx-drop', 1, 1, 5200, '/assets/catalog/necklace-onyx-drop.svg', 'Минималистичное колье с крупной каплей оникса. Подходит и к деловому образу, и к вечернему выходу.', TRUE),
    (3, 'Чокер «Оникс»', 'choker-onyx', 1, 2, 3200, '/assets/catalog/choker-onyx.svg', 'Бархатный чокер с каплей оникса и фурнитурой из ювелирного сплава.', TRUE),
    (4, 'Браслет «Dark Star»', 'bracelet-dark-star', 2, 2, 3200, '/assets/catalog/bracelet-dark-star.svg', 'Браслет из бусин оникса с шармом-звездой. Собирается на прочной резинке.', TRUE),
    (5, 'Браслет «Лилит»', 'bracelet-lilith', 2, 1, 3900, '/assets/catalog/bracelet-lilith.svg', 'Жемчужный браслет с серебряным шармом-полумесяцем.', TRUE),
    (6, 'Серьги «Абсолют»', 'earrings-absolute', 3, 1, 2800, '/assets/catalog/earrings-absolute.svg', 'Серьги с английским замком и подвесками из чёрного оникса.', TRUE),
    (7, 'Серьги «Чёрная роза»', 'earrings-black-rose', 3, 3, 3400, '/assets/catalog/earrings-black-rose.svg', 'Длинные серьги на швензах-крючках с цветами из оксидированного металла.', TRUE),
    (8, 'Кольцо «Жемчужное»', 'ring-pearl', 4, 1, 3900, '/assets/catalog/ring-pearl.svg', 'Кольцо с жемчужиной в классическом касте. Доступны размеры 16–19.', TRUE);

/* --------------------------------------- 4. КОМПОНЕНТЫ КОНСТРУКТОРА --- */
INSERT INTO "components" ("id", "name", "jewelryType", "slot", "materialId", "price", "imageUrl", "layerZ", "isActive") VALUES
    (1, 'Панцирная цепочка', 'necklace', 'chain', NULL, 1500, '/assets/components/necklace/chain-1.svg', 1, TRUE),
    (2, 'Бархатный чокер', 'necklace', 'chain', NULL, 900, '/assets/components/necklace/chain-2.svg', 1, TRUE),
    (3, 'Подвеска «Чёрная Роза»', 'necklace', 'pendant', NULL, 1200, '/assets/components/necklace/pendant-rose.svg', 5, TRUE),
    (4, 'Подвеска «Оникс капля»', 'necklace', 'pendant', NULL, 1500, '/assets/components/necklace/pendant-onyx.svg', 5, TRUE),
    (5, 'Подвеска «Крест»', 'necklace', 'pendant', NULL, 2000, '/assets/components/necklace/pendant-cross.svg', 5, TRUE),
    (6, 'Карабин', 'necklace', 'clasp', NULL, 300, '/assets/components/necklace/clasp-1.svg', 8, TRUE),
    (7, 'Магнитная застёжка', 'necklace', 'clasp', NULL, 400, '/assets/components/necklace/clasp-2.svg', 8, TRUE),
    (8, '40 см — чокер', 'necklace', 'length', NULL, 0, '', 0, TRUE),
    (9, '45 см — принцесса', 'necklace', 'length', NULL, 200, '', 0, TRUE),
    (10, '50 см — матоне', 'necklace', 'length', NULL, 350, '', 0, TRUE),
    (11, 'Бусины из оникса', 'bracelet', 'beads', NULL, 1200, '/assets/components/bracelet/beads-1.svg', 1, TRUE),
    (12, 'Жемчужные бусины', 'bracelet', 'beads', NULL, 1400, '/assets/components/bracelet/beads-2.svg', 1, TRUE),
    (13, 'Шарм «Звезда»', 'bracelet', 'charm', NULL, 700, '/assets/components/bracelet/charm-star.svg', 6, TRUE),
    (14, 'Шарм «Лилит»', 'bracelet', 'charm', NULL, 800, '/assets/components/bracelet/charm-lilith.svg', 6, TRUE),
    (15, 'Висюлька «Крест»', 'bracelet', 'charm', NULL, 900, '/assets/components/bracelet/charm-cross.svg', 6, TRUE),
    (16, 'Карабин для браслета', 'bracelet', 'clasp', NULL, 400, '/assets/components/bracelet/clasp-bracelet.svg', 8, TRUE),
    (17, 'Магнитная застёжка', 'bracelet', 'clasp', NULL, 450, '/assets/components/bracelet/clasp-magnetic.svg', 8, TRUE),
    (18, '16 см', 'bracelet', 'size', NULL, 0, '', 0, TRUE),
    (19, '17 см', 'bracelet', 'size', NULL, 0, '', 0, TRUE),
    (20, '18 см', 'bracelet', 'size', NULL, 100, '', 0, TRUE),
    (21, 'Английский замок', 'earrings', 'clasp', NULL, 900, '/assets/components/earrings/lock-english.svg', 8, TRUE),
    (22, 'Швензы-крючки', 'earrings', 'clasp', NULL, 500, '/assets/components/earrings/lock-hook.svg', 8, TRUE),
    (23, 'Пуссеты', 'earrings', 'clasp', NULL, 300, '/assets/components/earrings/lock-studs.svg', 8, TRUE),
    (24, 'Оникс (капля)', 'earrings', 'stone', NULL, 1000, '/assets/components/earrings/stone-onyx.svg', 5, TRUE),
    (25, 'Жемчуг', 'earrings', 'stone', NULL, 1100, '/assets/components/earrings/stone-pearl.svg', 5, TRUE),
    (26, 'Короткие (до 2 см)', 'earrings', 'length', NULL, 0, '', 0, TRUE),
    (27, 'Средние (3–4 см)', 'earrings', 'length', NULL, 150, '', 0, TRUE),
    (28, 'Длинные (5 см и более)', 'earrings', 'length', NULL, 300, '', 0, TRUE),
    (29, 'Основа — серебро 925', 'ring', 'material', NULL, 2000, '/assets/components/ring/base-silver.svg', 1, TRUE),
    (30, 'Основа — золото', 'ring', 'material', NULL, 2500, '/assets/components/ring/base-gold.svg', 1, TRUE),
    (31, 'Основа — чёрный родий', 'ring', 'material', NULL, 2200, '/assets/components/ring/base-rhodium.svg', 1, TRUE),
    (32, 'Профиль «Классика»', 'ring', 'profile', NULL, 300, '/assets/components/ring/profile-classic.svg', 4, TRUE),
    (33, 'Профиль «Плоский»', 'ring', 'profile', NULL, 350, '/assets/components/ring/profile-flat.svg', 4, TRUE),
    (34, 'Профиль «Морская волна»', 'ring', 'profile', NULL, 500, '/assets/components/ring/profile-sea.svg', 4, TRUE),
    (35, 'Камень — оникс', 'ring', 'stone', NULL, 1200, '/assets/components/ring/stone-onyx.svg', 6, TRUE),
    (36, 'Камень — жемчуг', 'ring', 'stone', NULL, 1500, '/assets/components/ring/stone-pearl.svg', 6, TRUE),
    (37, 'Размер 16', 'ring', 'size', NULL, 0, '', 0, TRUE),
    (38, 'Размер 17', 'ring', 'size', NULL, 0, '', 0, TRUE),
    (39, 'Размер 18', 'ring', 'size', NULL, 0, '', 0, TRUE),
    (40, 'Размер 19', 'ring', 'size', NULL, 0, '', 0, TRUE);

/* -------------------------------------------- 5. ТОЧКИ ПОЛУЧЕНИЯ --- */
INSERT INTO "pickup_points" ("id", "kind", "provider", "city", "address", "workHours", "phone") VALUES
    (1, 'pickup', 'Мастерская Noir Bijoux', 'Новосибирск', 'ул. Дуси Ковальчук, 250, 2 этаж, офис 12', 'Пн–Пт 10:00–19:00, Сб 11:00–16:00', '+7 (383) 000-00-01'),
    (2, 'pickup', 'Шоурум «Aesthetics»', 'Новосибирск', 'Красный проспект, 100, 1 этаж', 'Ежедневно 10:00–20:00', '+7 (383) 000-00-02'),
    (3, 'pvz', 'ПВЗ СДЭК', 'Новосибирск', 'ул. Ленина, 12', 'Пн–Сб 10:00–20:00', NULL),
    (4, 'pvz', 'ПВЗ Boxberry', 'Новосибирск', 'ул. Гоголя, 15', 'Пн–Пт 09:00–19:00', NULL),
    (5, 'pvz', 'ПВЗ СДЭК', 'Бердск', 'ул. Первомайская, 8', 'Пн–Сб 10:00–19:00', NULL);

/* ---------------------------------------------------- 6. ПОЛЬЗОВАТЕЛИ ---
   Пароли: noir1234 (клиент) и admin1234 (администратор) — в виде bcrypt-хешей. */
INSERT INTO "users" ("email", "password", "fullName", "phone", "role") VALUES
    ('olga@mail.ru', '$2b$10$4eEsF97qrPEIKtw0oLB1.eeRCkcTjgx.3JKDQw0.yzzl9i4.8JMA6', 'Ольга Иванова', '+7 (999) 000-00-00', 'client'),
    ('admin@noir.ru', '$2b$10$ZIy3eXImL9726zcSPIaG4eOj2qiWlMHHrfL3GNngR0fqi44/XfW0O', 'Администратор Noir Bijoux', '+7 (383) 000-00-01', 'admin');

/* ------------------------------- 7. АВТОРСКИЕ СБОРКИ И ИЗБРАННОЕ --- */
INSERT INTO "builds" ("userId", "jewelryType", "article", "totalPrice") VALUES
    ((SELECT "id" FROM "users" WHERE "email" = 'olga@mail.ru'), 'necklace', 'NB-NK-1-3-6', 3000);
INSERT INTO "build_items" ("buildId", "componentId", "layerZ") VALUES
    ((SELECT "id" FROM "builds" WHERE "article" = 'NB-NK-1-3-6'), 1, 1),
    ((SELECT "id" FROM "builds" WHERE "article" = 'NB-NK-1-3-6'), 3, 5),
    ((SELECT "id" FROM "builds" WHERE "article" = 'NB-NK-1-3-6'), 6, 8);
INSERT INTO "builds" ("userId", "jewelryType", "article", "totalPrice") VALUES
    ((SELECT "id" FROM "users" WHERE "email" = 'olga@mail.ru'), 'bracelet', 'NB-BR-11-13-16', 2300);
INSERT INTO "build_items" ("buildId", "componentId", "layerZ") VALUES
    ((SELECT "id" FROM "builds" WHERE "article" = 'NB-BR-11-13-16'), 11, 1),
    ((SELECT "id" FROM "builds" WHERE "article" = 'NB-BR-11-13-16'), 13, 6),
    ((SELECT "id" FROM "builds" WHERE "article" = 'NB-BR-11-13-16'), 16, 8);
INSERT INTO "favorites" ("userId", "buildId") VALUES
    ((SELECT "id" FROM "users" WHERE "email" = 'olga@mail.ru'), (SELECT "id" FROM "builds" WHERE "article" = 'NB-NK-1-3-6'));   -- сборка в избранном

/* ------------------------------------------------------- 8. ЗАКАЗЫ ---
   Заказ № 4821 — выполнен (изделие + авторская сборка), № 4822 — новый (2 пары серёг). */
INSERT INTO "orders" ("orderNumber", "userId", "customerName", "phone", "email", "deliveryType", "pickupPointId", "total", "status", "createdAt") VALUES
    ('4821', (SELECT "id" FROM "users" WHERE "email" = 'olga@mail.ru'), 'Ольга Иванова', '+7 (999) 000-00-00', 'olga@mail.ru', 'Самовывоз', 1, 7500, 'done', NOW() - INTERVAL '12 days');
INSERT INTO "orders" ("orderNumber", "userId", "customerName", "phone", "email", "deliveryType", "pickupPointId", "total", "status", "createdAt") VALUES
    ('4822', (SELECT "id" FROM "users" WHERE "email" = 'olga@mail.ru'), 'Ольга Иванова', '+7 (999) 000-00-00', 'olga@mail.ru', 'Пункт выдачи', 3, 5850, 'new', NOW() - INTERVAL '2 days');

INSERT INTO "order_items" ("orderId", "productId", "buildId", "title", "price", "quantity") VALUES
    ((SELECT "id" FROM "orders" WHERE "orderNumber" = '4821'), 1, NULL, 'Колье «Ночная Роза»', 4500, 1),
    ((SELECT "id" FROM "orders" WHERE "orderNumber" = '4821'), NULL, (SELECT "id" FROM "builds" WHERE "article" = 'NB-NK-1-3-6'), 'Колье (авторская сборка NB-NK-1-3-6)', 3000, 1),
    ((SELECT "id" FROM "orders" WHERE "orderNumber" = '4822'), 6, NULL, 'Серьги «Абсолют»', 2800, 2);

/* -------------------------------------- 9. СЧЁТЧИКИ ID (ВАЖНО!) ---------------
   Категории, материалы, изделия, компоненты и точки получения вставлены
   с указанными номерами. После такой вставки счётчик SERIAL остаётся на 1,
   и первый же INSERT из приложения попытался бы занять занятый id.
   setval выставляет счётчик по максимальному id в таблице.               */
SELECT setval(pg_get_serial_sequence('categories', 'id'), (SELECT MAX(id) FROM categories));
SELECT setval(pg_get_serial_sequence('materials', 'id'), (SELECT MAX(id) FROM materials));
SELECT setval(pg_get_serial_sequence('products', 'id'), (SELECT MAX(id) FROM products));
SELECT setval(pg_get_serial_sequence('components', 'id'), (SELECT MAX(id) FROM components));
SELECT setval(pg_get_serial_sequence('pickup_points', 'id'), (SELECT MAX(id) FROM pickup_points));

/* ------------------------------------------------------- 10. ПРОВЕРКА --- */

/* Готово. Вход на сайт: olga@mail.ru / noir1234 (клиент),
   admin@noir.ru / admin1234 (администратор). */

/* ============================================================================
   ЧАСТЬ 4. ПРОВЕРКА
   ============================================================================ */
SELECT 'users' AS "Таблица", COUNT(*) AS "Строк" FROM "users"
UNION ALL SELECT 'categories', COUNT(*) FROM "categories"
UNION ALL SELECT 'materials', COUNT(*) FROM "materials"
UNION ALL SELECT 'products', COUNT(*) FROM "products"
UNION ALL SELECT 'components', COUNT(*) FROM "components"
UNION ALL SELECT 'builds', COUNT(*) FROM "builds"
UNION ALL SELECT 'build_items', COUNT(*) FROM "build_items"
UNION ALL SELECT 'orders', COUNT(*) FROM "orders"
UNION ALL SELECT 'order_items', COUNT(*) FROM "order_items"
UNION ALL SELECT 'favorites', COUNT(*) FROM "favorites"
UNION ALL SELECT 'pickup_points', COUNT(*) FROM "pickup_points"
UNION ALL SELECT 'chat_messages', COUNT(*) FROM "chat_messages"
ORDER BY 1;
