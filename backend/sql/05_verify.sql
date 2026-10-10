/* ============================================================================
   05 — ПРОВЕРКА ДАННЫХ (запросы для отчёта и скриншотов)
   ----------------------------------------------------------------------------
   Запускать после 02_schema.sql, 03_indexes.sql и 04_seed.sql.
   Каждый запрос можно выполнять по отдельности — удобно для скриншотов
   в разделе «База данных» пояснительной записки.
   ============================================================================ */

USE [noir_bijoux];
GO

/* 1. Сколько строк в каждой таблице ---------------------------------------- */
SELECT
    [Таблица] = t.name,
    [Строк]   = SUM(p.rows)
FROM sys.tables AS t
JOIN sys.partitions AS p ON p.object_id = t.object_id AND p.index_id IN (0, 1)
GROUP BY t.name
ORDER BY t.name;
GO

/* 2. Каталог изделий: изделие, категория, материал, цена -------------------- */
SELECT
    p.[id]          AS [Код],
    p.[name]        AS [Изделие],
    c.[name]        AS [Категория],
    m.[name]        AS [Материал],
    p.[price]       AS [Цена, ₽],
    p.[slug]        AS [Адрес страницы]
FROM [dbo].[products] AS p
JOIN [dbo].[categories] AS c ON c.[id] = p.[categoryId]
JOIN [dbo].[materials]  AS m ON m.[id] = p.[materialId]
ORDER BY p.[id];
GO

/* 3. Компоненты конструктора по типам изделий ------------------------------ */
SELECT
    [Тип изделия] = CASE [jewelryType]
        WHEN N'necklace' THEN N'Колье'
        WHEN N'bracelet' THEN N'Браслет'
        WHEN N'earrings' THEN N'Серьги'
        WHEN N'ring'     THEN N'Кольцо'
    END,
    [Вкладка]  = [slot],
    [Компонентов] = COUNT(*),
    [Цена от] = MIN([price]),
    [Цена до] = MAX([price])
FROM [dbo].[components]
WHERE [isActive] = 1
GROUP BY [jewelryType], [slot]
ORDER BY [jewelryType], [slot];
GO

/* 4. Авторские сборки и их состав (с порядком слоёв отрисовки) -------------- */
SELECT
    b.[article]            AS [Артикул],
    u.[fullName]           AS [Автор сборки],
    b.[jewelryType]        AS [Тип],
    ci.[name]              AS [Компонент],
    ci.[slot]              AS [Вкладка],
    bi.[layerZ]            AS [Слой],
    ci.[price]             AS [Цена, ₽],
    b.[totalPrice]         AS [Сборка, ₽],
    b.[createdAt]          AS [Создана]
FROM [dbo].[builds] AS b
LEFT JOIN [dbo].[users]      AS u  ON u.[id]  = b.[userId]
JOIN      [dbo].[build_items] AS bi ON bi.[buildId] = b.[id]
JOIN      [dbo].[components]  AS ci ON ci.[id] = bi.[componentId]
ORDER BY b.[id], bi.[layerZ];
GO

/* 5. Заказы: шапка заказа -------------------------------------------------- */
SELECT
    o.[orderNumber]  AS [Номер],
    o.[createdAt]    AS [Дата],
    o.[customerName] AS [Получатель],
    o.[deliveryType] AS [Способ получения],
    pp.[provider]    AS [Точка],
    o.[total]        AS [Итого, ₽],
    o.[status]       AS [Статус]
FROM [dbo].[orders] AS o
LEFT JOIN [dbo].[pickup_points] AS pp ON pp.[id] = o.[pickupPointId]
ORDER BY o.[id];
GO

/* 6. Заказы: позиции (что именно заказано) --------------------------------- */
SELECT
    o.[orderNumber] AS [Номер],
    oi.[title]      AS [Позиция],
    oi.[price]      AS [Цена, ₽],
    oi.[quantity]   AS [Кол-во],
    [Сумма, ₽]      = oi.[price] * oi.[quantity],
    [Изделие каталога] = pi.[name],
    [Авторская сборка] = b.[article]
FROM [dbo].[order_items] AS oi
JOIN      [dbo].[orders]   AS o ON o.[id] = oi.[orderId]
LEFT JOIN [dbo].[products] AS pi ON pi.[id] = oi.[productId]
LEFT JOIN [dbo].[builds]   AS b  ON b.[id] = oi.[buildId]
ORDER BY o.[id], oi.[id];
GO

/* 7. Проверка суммы заказа: позиции + доставка = итог ----------------------
   Стоимость доставки: самовывоз 0 ₽, курьер 400 ₽, пункт выдачи 250 ₽.      */
SELECT
    o.[orderNumber]        AS [Номер],
    [Позиции, ₽]           = SUM(oi.[price] * oi.[quantity]),
    [Доставка, ₽]          = CASE o.[deliveryType]
                                 WHEN N'Самовывоз'    THEN 0
                                 WHEN N'Курьер'       THEN 400
                                 WHEN N'Пункт выдачи' THEN 250
                             END,
    [Итог в базе, ₽]       = o.[total],
    [Сходится]             = CASE
        WHEN o.[total] = SUM(oi.[price] * oi.[quantity]) + CASE o.[deliveryType]
                                 WHEN N'Самовывоз'    THEN 0
                                 WHEN N'Курьер'       THEN 400
                                 WHEN N'Пункт выдачи' THEN 250
                             END
        THEN N'да' ELSE N'нет' END
FROM [dbo].[orders] AS o
JOIN [dbo].[order_items] AS oi ON oi.[orderId] = o.[id]
GROUP BY o.[id], o.[orderNumber], o.[deliveryType], o.[total]
ORDER BY o.[id];
GO

/* 8. Пользователи: пароли только в виде хешей ------------------------------ */
SELECT
    [id],
    [email],
    [fullName],
    [role],
    [Хеш пароля] = LEFT([password], 7) + N'…' + RIGHT([password], 5),
    [Длина хеша] = LEN([password])
FROM [dbo].[users]
ORDER BY [id];
GO

/* 9. Точки получения ------------------------------------------------------- */
SELECT
    [Вид] = CASE [kind] WHEN N'pickup' THEN N'Самовывоз' ELSE N'Пункт выдачи' END,
    [provider]   AS [Организация],
    [city]       AS [Город],
    [address]    AS [Адрес],
    [workHours]  AS [Часы работы]
FROM [dbo].[pickup_points]
ORDER BY [kind], [id];
GO

/* 10. Индексы: проверка, что список индексов создан ------------------------ */
SELECT
    [Таблица] = OBJECT_NAME(i.object_id),
    [Индекс]  = i.name,
    [Уникальный] = CASE i.is_unique WHEN 1 THEN N'да' ELSE N'нет' END,
    [По условию] = SUBSTRING(ISNULL(COL_NAME(ic.object_id, ic.column_id), N''), 1, 40)
FROM sys.indexes AS i
LEFT JOIN sys.index_columns AS ic
       ON ic.object_id = i.object_id AND ic.index_id = i.index_id AND ic.key_ordinal = 1
WHERE i.name IS NOT NULL
  AND OBJECT_NAME(i.object_id) IN (
      N'products', N'components', N'builds', N'build_items',
      N'orders', N'order_items', N'favorites', N'chat_messages',
      N'users', N'categories', N'materials', N'pickup_points')
ORDER BY OBJECT_NAME(i.object_id), i.name;
GO

/* 11. Размер таблиц на диске (необязательно, для отчёта) -------------------- */
SELECT
    [Таблица] = t.name,
    [Строк]   = SUM(p.rows),
    [Данные, КБ] = CAST(SUM(a.total_pages) * 8.0 AS DECIMAL(10, 1))
FROM sys.tables AS t
JOIN sys.partitions AS p ON p.object_id = t.object_id AND p.index_id IN (0, 1)
JOIN sys.allocation_units AS a ON a.container_id = p.partition_id
GROUP BY t.name
ORDER BY SUM(a.total_pages) DESC;
GO
