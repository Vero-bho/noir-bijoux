/* ============================================================================
   04 — ЗАПОЛНЕНИЕ БАЗЫ ДАННЫМИ МАГАЗИНА
   ----------------------------------------------------------------------------
   Файл СГЕНЕРИРОВАН скриптом _tools/generate_sql_seed.py из данных фронтенда
   (frontend/app/data/*.ts). Поэтому идентификаторы, названия и цены в базе
   совпадают с тем, что показывает сайт, а также с генератором src/prisma/seed.ts.

   Что вставляется:
     • 4 категории, 3 материала, 8 изделий каталога;
     • 40 компонентов конструктора (со слоями отрисовки);
     • 5 точек получения (2 самовывоза + 3 пункта выдачи);
     • 2 пользователя: olga@mail.ru / noir1234 (клиент),
                       admin@noir.ru / admin1234 (администратор);
     • 2 авторские сборки «Ольги», одна из них в избранном;
     • 2 заказа в истории (№ 4821 выполнен, № 4822 новый).

   Пароли хранятся только в виде bcrypt-хешей — открытого пароля в базе нет.

   Скрипт можно запускать повторно: перед вставкой данные удаляются
   (порядок удаления учитывает связи между таблицами).
   ============================================================================ */

USE [noir_bijoux];
GO

SET NOCOUNT ON;
GO

/* ------------------------------------------- 1. ОЧИСТКА ПЕРЕД ЗАПОЛНЕНИЕМ --- */
DELETE FROM [dbo].[order_items];
DELETE FROM [dbo].[orders];
DELETE FROM [dbo].[favorites];
DELETE FROM [dbo].[build_items];
DELETE FROM [dbo].[builds];
DELETE FROM [dbo].[products];
DELETE FROM [dbo].[components];
DELETE FROM [dbo].[pickup_points];
DELETE FROM [dbo].[chat_messages];
DELETE FROM [dbo].[users];
DELETE FROM [dbo].[categories];
DELETE FROM [dbo].[materials];
DBCC CHECKIDENT ('dbo.builds', RESEED, 0) WITH NO_INFOMSGS;
DBCC CHECKIDENT ('dbo.orders', RESEED, 0) WITH NO_INFOMSGS;
DBCC CHECKIDENT ('dbo.users', RESEED, 0) WITH NO_INFOMSGS;
GO

/* --------------------------------------------- 2. КАТЕГОРИИ И МАТЕРИАЛЫ --- */
SET IDENTITY_INSERT [dbo].[categories] ON;
INSERT INTO [dbo].[categories] ([id], [name], [slug]) VALUES
    (1, N'Колье', N'necklace'),
    (2, N'Браслет', N'bracelet'),
    (3, N'Серьги', N'earrings'),
    (4, N'Кольцо', N'ring');
SET IDENTITY_INSERT [dbo].[categories] OFF;
SET IDENTITY_INSERT [dbo].[materials] ON;
INSERT INTO [dbo].[materials] ([id], [name]) VALUES
    (1, N'Серебро 925'),
    (2, N'Ювелирный сплав'),
    (3, N'Чёрный родий');
SET IDENTITY_INSERT [dbo].[materials] OFF;

/* ------------------------------------------------- 3. ИЗДЕЛИЯ КАТАЛОГА --- */
SET IDENTITY_INSERT [dbo].[products] ON;
INSERT INTO [dbo].[products] ([id], [name], [slug], [categoryId], [materialId], [price], [imageUrl], [description], [isActive]) VALUES
    (1, N'Колье «Ночная Роза»', N'necklace-night-rose', 1, 1, 4500, N'/assets/catalog/necklace-rose.svg', N'Колье на панцирной цепочке с подвеской-розой из чёрного оникса. Гипоаллергенное серебро 925 пробы, регулируемая длина.', 1),
    (2, N'Колье «Оникс капля»', N'necklace-onyx-drop', 1, 1, 5200, N'/assets/catalog/necklace-onyx-drop.svg', N'Минималистичное колье с крупной каплей оникса. Подходит и к деловому образу, и к вечернему выходу.', 1),
    (3, N'Чокер «Оникс»', N'choker-onyx', 1, 2, 3200, N'/assets/catalog/choker-onyx.svg', N'Бархатный чокер с каплей оникса и фурнитурой из ювелирного сплава.', 1),
    (4, N'Браслет «Dark Star»', N'bracelet-dark-star', 2, 2, 3200, N'/assets/catalog/bracelet-dark-star.svg', N'Браслет из бусин оникса с шармом-звездой. Собирается на прочной резинке.', 1),
    (5, N'Браслет «Лилит»', N'bracelet-lilith', 2, 1, 3900, N'/assets/catalog/bracelet-lilith.svg', N'Жемчужный браслет с серебряным шармом-полумесяцем.', 1),
    (6, N'Серьги «Абсолют»', N'earrings-absolute', 3, 1, 2800, N'/assets/catalog/earrings-absolute.svg', N'Серьги с английским замком и подвесками из чёрного оникса.', 1),
    (7, N'Серьги «Чёрная роза»', N'earrings-black-rose', 3, 3, 3400, N'/assets/catalog/earrings-black-rose.svg', N'Длинные серьги на швензах-крючках с цветами из оксидированного металла.', 1),
    (8, N'Кольцо «Жемчужное»', N'ring-pearl', 4, 1, 3900, N'/assets/catalog/ring-pearl.svg', N'Кольцо с жемчужиной в классическом касте. Доступны размеры 16–19.', 1);
SET IDENTITY_INSERT [dbo].[products] OFF;

/* --------------------------------------- 4. КОМПОНЕНТЫ КОНСТРУКТОРА --- */
SET IDENTITY_INSERT [dbo].[components] ON;
INSERT INTO [dbo].[components] ([id], [name], [jewelryType], [slot], [materialId], [price], [imageUrl], [layerZ], [isActive]) VALUES
    (1, N'Панцирная цепочка', N'necklace', N'chain', NULL, 1500, N'/assets/components/necklace/chain-1.svg', 1, 1),
    (2, N'Бархатный чокер', N'necklace', N'chain', NULL, 900, N'/assets/components/necklace/chain-2.svg', 1, 1),
    (3, N'Подвеска «Чёрная Роза»', N'necklace', N'pendant', NULL, 1200, N'/assets/components/necklace/pendant-rose.svg', 5, 1),
    (4, N'Подвеска «Оникс капля»', N'necklace', N'pendant', NULL, 1500, N'/assets/components/necklace/pendant-onyx.svg', 5, 1),
    (5, N'Подвеска «Крест»', N'necklace', N'pendant', NULL, 2000, N'/assets/components/necklace/pendant-cross.svg', 5, 1),
    (6, N'Карабин', N'necklace', N'clasp', NULL, 300, N'/assets/components/necklace/clasp-1.svg', 8, 1),
    (7, N'Магнитная застёжка', N'necklace', N'clasp', NULL, 400, N'/assets/components/necklace/clasp-2.svg', 8, 1),
    (8, N'40 см — чокер', N'necklace', N'length', NULL, 0, N'', 0, 1),
    (9, N'45 см — принцесса', N'necklace', N'length', NULL, 200, N'', 0, 1),
    (10, N'50 см — матоне', N'necklace', N'length', NULL, 350, N'', 0, 1),
    (11, N'Бусины из оникса', N'bracelet', N'beads', NULL, 1200, N'/assets/components/bracelet/beads-1.svg', 1, 1),
    (12, N'Жемчужные бусины', N'bracelet', N'beads', NULL, 1400, N'/assets/components/bracelet/beads-2.svg', 1, 1),
    (13, N'Шарм «Звезда»', N'bracelet', N'charm', NULL, 700, N'/assets/components/bracelet/charm-star.svg', 6, 1),
    (14, N'Шарм «Лилит»', N'bracelet', N'charm', NULL, 800, N'/assets/components/bracelet/charm-lilith.svg', 6, 1),
    (15, N'Висюлька «Крест»', N'bracelet', N'charm', NULL, 900, N'/assets/components/bracelet/charm-cross.svg', 6, 1),
    (16, N'Карабин для браслета', N'bracelet', N'clasp', NULL, 400, N'/assets/components/bracelet/clasp-bracelet.svg', 8, 1),
    (17, N'Магнитная застёжка', N'bracelet', N'clasp', NULL, 450, N'/assets/components/bracelet/clasp-magnetic.svg', 8, 1),
    (18, N'16 см', N'bracelet', N'size', NULL, 0, N'', 0, 1),
    (19, N'17 см', N'bracelet', N'size', NULL, 0, N'', 0, 1),
    (20, N'18 см', N'bracelet', N'size', NULL, 100, N'', 0, 1),
    (21, N'Английский замок', N'earrings', N'clasp', NULL, 900, N'/assets/components/earrings/lock-english.svg', 8, 1),
    (22, N'Швензы-крючки', N'earrings', N'clasp', NULL, 500, N'/assets/components/earrings/lock-hook.svg', 8, 1),
    (23, N'Пуссеты', N'earrings', N'clasp', NULL, 300, N'/assets/components/earrings/lock-studs.svg', 8, 1),
    (24, N'Оникс (капля)', N'earrings', N'stone', NULL, 1000, N'/assets/components/earrings/stone-onyx.svg', 5, 1),
    (25, N'Жемчуг', N'earrings', N'stone', NULL, 1100, N'/assets/components/earrings/stone-pearl.svg', 5, 1),
    (26, N'Короткие (до 2 см)', N'earrings', N'length', NULL, 0, N'', 0, 1),
    (27, N'Средние (3–4 см)', N'earrings', N'length', NULL, 150, N'', 0, 1),
    (28, N'Длинные (5 см и более)', N'earrings', N'length', NULL, 300, N'', 0, 1),
    (29, N'Основа — серебро 925', N'ring', N'material', NULL, 2000, N'/assets/components/ring/base-silver.svg', 1, 1),
    (30, N'Основа — золото', N'ring', N'material', NULL, 2500, N'/assets/components/ring/base-gold.svg', 1, 1),
    (31, N'Основа — чёрный родий', N'ring', N'material', NULL, 2200, N'/assets/components/ring/base-rhodium.svg', 1, 1),
    (32, N'Профиль «Классика»', N'ring', N'profile', NULL, 300, N'/assets/components/ring/profile-classic.svg', 4, 1),
    (33, N'Профиль «Плоский»', N'ring', N'profile', NULL, 350, N'/assets/components/ring/profile-flat.svg', 4, 1),
    (34, N'Профиль «Морская волна»', N'ring', N'profile', NULL, 500, N'/assets/components/ring/profile-sea.svg', 4, 1),
    (35, N'Камень — оникс', N'ring', N'stone', NULL, 1200, N'/assets/components/ring/stone-onyx.svg', 6, 1),
    (36, N'Камень — жемчуг', N'ring', N'stone', NULL, 1500, N'/assets/components/ring/stone-pearl.svg', 6, 1),
    (37, N'Размер 16', N'ring', N'size', NULL, 0, N'', 0, 1),
    (38, N'Размер 17', N'ring', N'size', NULL, 0, N'', 0, 1),
    (39, N'Размер 18', N'ring', N'size', NULL, 0, N'', 0, 1),
    (40, N'Размер 19', N'ring', N'size', NULL, 0, N'', 0, 1);
SET IDENTITY_INSERT [dbo].[components] OFF;

/* -------------------------------------------- 5. ТОЧКИ ПОЛУЧЕНИЯ --- */
SET IDENTITY_INSERT [dbo].[pickup_points] ON;
INSERT INTO [dbo].[pickup_points] ([id], [kind], [provider], [city], [address], [workHours], [phone]) VALUES
    (1, N'pickup', N'Мастерская Noir Bijoux', N'Новосибирск', N'ул. Дуси Ковальчук, 250, 2 этаж, офис 12', N'Пн–Пт 10:00–19:00, Сб 11:00–16:00', N'+7 (383) 000-00-01'),
    (2, N'pickup', N'Шоурум «Aesthetics»', N'Новосибирск', N'Красный проспект, 100, 1 этаж', N'Ежедневно 10:00–20:00', N'+7 (383) 000-00-02'),
    (3, N'pvz', N'ПВЗ СДЭК', N'Новосибирск', N'ул. Ленина, 12', N'Пн–Сб 10:00–20:00', NULL),
    (4, N'pvz', N'ПВЗ Boxberry', N'Новосибирск', N'ул. Гоголя, 15', N'Пн–Пт 09:00–19:00', NULL),
    (5, N'pvz', N'ПВЗ СДЭК', N'Бердск', N'ул. Первомайская, 8', N'Пн–Сб 10:00–19:00', NULL);
SET IDENTITY_INSERT [dbo].[pickup_points] OFF;

/* ---------------------------------------------------- 6. ПОЛЬЗОВАТЕЛИ ---
   Пароли: noir1234 (клиент) и admin1234 (администратор) — в виде bcrypt-хешей. */
INSERT INTO [dbo].[users] ([email], [password], [fullName], [phone], [role]) VALUES
    (N'olga@mail.ru', N'$2b$10$4eEsF97qrPEIKtw0oLB1.eeRCkcTjgx.3JKDQw0.yzzl9i4.8JMA6', N'Ольга Иванова', N'+7 (999) 000-00-00', N'client'),
    (N'admin@noir.ru', N'$2b$10$ZIy3eXImL9726zcSPIaG4eOj2qiWlMHHrfL3GNngR0fqi44/XfW0O', N'Администратор Noir Bijoux', N'+7 (383) 000-00-01', N'admin');
DECLARE @olgaId INT = (SELECT [id] FROM [dbo].[users] WHERE [email] = N'olga@mail.ru');

/* ------------------------------- 7. АВТОРСКИЕ СБОРКИ И ИЗБРАННОЕ --- */
INSERT INTO [dbo].[builds] ([userId], [jewelryType], [article], [totalPrice]) VALUES
    (@olgaId, N'necklace', N'NB-NK-1-3-6', 3000);
DECLARE @buildNBNK136 INT = (SELECT [id] FROM [dbo].[builds] WHERE [article] = N'NB-NK-1-3-6');
INSERT INTO [dbo].[build_items] ([buildId], [componentId], [layerZ]) VALUES
    (@buildNBNK136, 1, 1),
    (@buildNBNK136, 3, 5),
    (@buildNBNK136, 6, 8);
INSERT INTO [dbo].[builds] ([userId], [jewelryType], [article], [totalPrice]) VALUES
    (@olgaId, N'bracelet', N'NB-BR-11-13-16', 2300);
DECLARE @buildNBBR111316 INT = (SELECT [id] FROM [dbo].[builds] WHERE [article] = N'NB-BR-11-13-16');
INSERT INTO [dbo].[build_items] ([buildId], [componentId], [layerZ]) VALUES
    (@buildNBBR111316, 11, 1),
    (@buildNBBR111316, 13, 6),
    (@buildNBBR111316, 16, 8);
INSERT INTO [dbo].[favorites] ([userId], [buildId]) VALUES
    (@olgaId, @buildNBNK136);   -- сборка в избранном

/* ------------------------------------------------------- 8. ЗАКАЗЫ ---
   Заказ № 4821 — выполнен (изделие + авторская сборка), № 4822 — новый (2 пары серёг). */
INSERT INTO [dbo].[orders] ([orderNumber], [userId], [customerName], [phone], [email], [deliveryType], [pickupPointId], [total], [status], [createdAt]) VALUES
    (N'4821', @olgaId, N'Ольга Иванова', N'+7 (999) 000-00-00', N'olga@mail.ru', N'Самовывоз', 1, 7500, N'done', DATEADD(DAY, -12, SYSDATETIME()));
INSERT INTO [dbo].[orders] ([orderNumber], [userId], [customerName], [phone], [email], [deliveryType], [pickupPointId], [total], [status], [createdAt]) VALUES
    (N'4822', @olgaId, N'Ольга Иванова', N'+7 (999) 000-00-00', N'olga@mail.ru', N'Пункт выдачи', 3, 5850, N'new', DATEADD(DAY, -2, SYSDATETIME()));

DECLARE @order1 INT = (SELECT [id] FROM [dbo].[orders] WHERE [orderNumber] = N'4821');
DECLARE @order2 INT = (SELECT [id] FROM [dbo].[orders] WHERE [orderNumber] = N'4822');

INSERT INTO [dbo].[order_items] ([orderId], [productId], [buildId], [title], [price], [quantity]) VALUES
    (@order1, 1, NULL, N'Колье «Ночная Роза»', 4500, 1),
    (@order1, NULL, @buildNBNK136, N'Колье (авторская сборка NB-NK-1-3-6)', 3000, 1),
    (@order2, 6, NULL, N'Серьги «Абсолют»', 2800, 2);

/* ------------------------------------------------------- 9. ПРОВЕРКА --- */
SELECT [Таблица] = t.name, [Строк] = p.rows
FROM sys.tables AS t
JOIN sys.partitions AS p ON p.object_id = t.object_id AND p.index_id IN (0, 1)
ORDER BY t.name;
GO

PRINT N'База заполнена. Вход на сайт: olga@mail.ru / noir1234 (клиент), admin@noir.ru / admin1234 (администратор).';
GO
