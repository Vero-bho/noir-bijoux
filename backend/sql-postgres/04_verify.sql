/* ============================================================================
   04 — ПРОВЕРКА ДАННЫХ (запросы для отчёта и скриншотов)
   ----------------------------------------------------------------------------
   Запускать после 01_schema.sql, 02_indexes.sql и 03_seed.sql.
   Каждый запрос можно выполнять отдельно — удобно для скриншотов
   в разделе «База данных» пояснительной записки.
   В Supabase: SQL Editor → New query → вставить один запрос → Run.
   ============================================================================ */

SET search_path = public;

/* 1. Сколько строк в каждой таблице ---------------------------------------- */
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

/* 2. Каталог изделий: изделие, категория, материал, цена -------------------- */
SELECT
    p."id"          AS "Код",
    p."name"        AS "Изделие",
    c."name"        AS "Категория",
    m."name"        AS "Материал",
    p."price"       AS "Цена, ₽",
    p."slug"        AS "Адрес страницы"
FROM products AS p
JOIN categories AS c ON c."id" = p."categoryId"
JOIN materials  AS m ON m."id" = p."materialId"
ORDER BY p."id";

/* 3. Компоненты конструктора по типам изделий ------------------------------ */
SELECT
    CASE "jewelryType"
        WHEN 'necklace' THEN 'Колье'
        WHEN 'bracelet' THEN 'Браслет'
        WHEN 'earrings' THEN 'Серьги'
        WHEN 'ring'     THEN 'Кольцо'
    END               AS "Тип изделия",
    "slot"            AS "Вкладка",
    COUNT(*)          AS "Компонентов",
    MIN("price")      AS "Цена от",
    MAX("price")      AS "Цена до"
FROM components
WHERE "isActive" = TRUE
GROUP BY "jewelryType", "slot"
ORDER BY "jewelryType", "slot";

/* 4. Авторские сборки и их состав (с порядком слоёв отрисовки) -------------- */
SELECT
    b."article"      AS "Артикул",
    u."fullName"     AS "Автор сборки",
    b."jewelryType"  AS "Тип",
    ci."name"        AS "Компонент",
    ci."slot"        AS "Вкладка",
    bi."layerZ"      AS "Слой",
    ci."price"       AS "Цена, ₽",
    b."totalPrice"   AS "Сборка, ₽",
    b."createdAt"    AS "Создана"
FROM builds AS b
LEFT JOIN users       AS u  ON u."id"  = b."userId"
JOIN      build_items AS bi ON bi."buildId" = b."id"
JOIN      components  AS ci ON ci."id" = bi."componentId"
ORDER BY b."id", bi."layerZ";

/* 5. Заказы: шапка заказа -------------------------------------------------- */
SELECT
    o."orderNumber"  AS "Номер",
    o."createdAt"    AS "Дата",
    o."customerName" AS "Получатель",
    o."deliveryType" AS "Способ получения",
    pp."provider"    AS "Точка",
    o."total"        AS "Итого, ₽",
    o."status"       AS "Статус"
FROM orders AS o
LEFT JOIN pickup_points AS pp ON pp."id" = o."pickupPointId"
ORDER BY o."id";

/* 6. Заказы: позиции (что именно заказано) --------------------------------- */
SELECT
    o."orderNumber"    AS "Номер",
    oi."title"         AS "Позиция",
    oi."price"         AS "Цена, ₽",
    oi."quantity"      AS "Кол-во",
    oi."price" * oi."quantity" AS "Сумма, ₽",
    pi."name"          AS "Изделие каталога",
    b."article"        AS "Авторская сборка"
FROM order_items AS oi
JOIN      orders   AS o  ON o."id" = oi."orderId"
LEFT JOIN products AS pi ON pi."id" = oi."productId"
LEFT JOIN builds   AS b  ON b."id" = oi."buildId"
ORDER BY o."id", oi."id";

/* 7. Проверка суммы заказа: позиции + доставка = итог ----------------------
   Стоимость доставки: самовывоз 0 ₽, курьер 400 ₽, пункт выдачи 250 ₽.      */
SELECT
    o."orderNumber" AS "Номер",
    SUM(oi."price" * oi."quantity") AS "Позиции, ₽",
    CASE o."deliveryType"
        WHEN 'Самовывоз'    THEN 0
        WHEN 'Курьер'       THEN 400
        WHEN 'Пункт выдачи' THEN 250
    END AS "Доставка, ₽",
    o."total" AS "Итог в базе, ₽",
    CASE
        WHEN o."total" =
             SUM(oi."price" * oi."quantity") +
             CASE o."deliveryType"
                 WHEN 'Самовывоз'    THEN 0
                 WHEN 'Курьер'       THEN 400
                 WHEN 'Пункт выдачи' THEN 250
             END
        THEN 'да' ELSE 'нет'
    END AS "Сходится"
FROM orders AS o
JOIN order_items AS oi ON oi."orderId" = o."id"
GROUP BY o."id", o."orderNumber", o."deliveryType", o."total"
ORDER BY o."id";

/* 8. Пользователи: пароли только в виде хешей ------------------------------ */
SELECT
    "id",
    "email",
    "fullName",
    "role",
    LEFT("password", 7) || '…' || RIGHT("password", 5) AS "Хеш пароля",
    LENGTH("password") AS "Длина хеша"
FROM users
ORDER BY "id";

/* 9. Точки получения ------------------------------------------------------- */
SELECT
    CASE "kind" WHEN 'pickup' THEN 'Самовывоз' ELSE 'Пункт выдачи' END AS "Вид",
    "provider"  AS "Организация",
    "city"      AS "Город",
    "address"   AS "Адрес",
    "workHours" AS "Часы работы"
FROM pickup_points
ORDER BY "kind", "id";

/* 10. Индексы: проверка, что список индексов создан ------------------------ */
SELECT
    tablename AS "Таблица",
    indexname AS "Индекс",
    CASE WHEN indexdef LIKE '%UNIQUE%' THEN 'да' ELSE 'нет' END AS "Уникальный"
FROM pg_indexes
WHERE schemaname = 'public'
  AND tablename IN (
      'products', 'components', 'builds', 'build_items',
      'orders', 'order_items', 'favorites', 'chat_messages',
      'users', 'categories', 'materials', 'pickup_points')
ORDER BY tablename, indexname;

/* 11. Размер таблиц на диске (необязательно, для отчёта) ------------------- */
SELECT
    c.relname AS "Таблица",
    pg_size_pretty(pg_total_relation_size(c.oid)) AS "Размер"
FROM pg_class AS c
JOIN pg_namespace AS n ON n.oid = c.relnamespace
WHERE n.nspname = 'public' AND c.relkind = 'r'
ORDER BY pg_total_relation_size(c.oid) DESC;
