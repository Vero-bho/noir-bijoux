/* ============================================================================
   03 — ЗАПОЛНЕНИЕ БАЗЫ ДАННЫМИ МАГАЗИНА
   ----------------------------------------------------------------------------
   Файл СГЕНЕРИРОВАН скриптом _tools/generate_sql_postgres.py из данных
   фронтенда (папка frontend/app/data: catalog.ts, constructorComponents.ts,
   delivery.ts). Поэтому идентификаторы, названия и цены
   в базе совпадают с тем, что показывает сайт, и с генератором src/prisma/seed.ts.

   Что вставляется:
     • 4 категории, 3 материала, 8 изделий каталога;
     • 40 компонентов конструктора (со слоями отрисовки);
     • 5 точек получения (2 самовывоза + 3 пункта выдачи);
     • 2 пользователя: olga@mail.ru / noir1234 (клиент),
                       admin@noir.ru / admin1234 (администратор);
     • 2 авторские сборки «Ольги», одна из них в избранном;
     • 2 заказа в истории (№ 4821 выполнен, № 4822 новый).

   Пароли хранятся только в виде bcrypt-хешей — открытого пароля в базе нет.
   Скрипт можно запускать повторно: TRUNCATE очищает таблицы и обнуляет
   счётчики id, блок setval в конце выставляет счётчики по максимальным id.
   ============================================================================ */

SET search_path = public;

/* ------------------------------------------- 1. ОЧИСТКА ПЕРЕД ЗАПОЛНЕНИЕМ --- */
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

/* Готово. Вход на сайт: olga@mail.ru / noir1234 (клиент),
   admin@noir.ru / admin1234 (администратор). */
