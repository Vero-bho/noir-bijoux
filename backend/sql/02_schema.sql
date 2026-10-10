/* ============================================================================
   02 — СОЗДАНИЕ ТАБЛИЦ БАЗЫ NOIR BIJOUX
   ----------------------------------------------------------------------------
   Файл СГЕНЕРИРОВАН автоматически из модели данных Prisma:
       npx prisma migrate diff --from-empty --to-schema src/prisma/schema/schema.prisma --script
   поэтому структура таблиц в точности совпадает со схемой schema.prisma,
   с которой работает бэкенд. Правьте схему, затем пересоберите скрипт:
       python3 _tools/generate_sql.py

   Состав: 12 таблиц предметной области интернет-магазина бижутерии и
   12 связей (внешних ключей). Все инструкции обёрнуты в транзакцию:
   при любой ошибке изменения откатываются.

   Как запустить:
     • SQL Server Management Studio: открыть файл → F5 (Execute);
     • sqlcmd: sqlcmd -S localhost -U noir_app -P "NoirApp!2026" -d noir_bijoux -i 02_schema.sql
   ============================================================================ */

USE [noir_bijoux];
GO

BEGIN TRY

BEGIN TRAN;

-- CreateSchema
IF NOT EXISTS (SELECT * FROM sys.schemas WHERE name = N'dbo') EXEC sp_executesql N'CREATE SCHEMA [dbo];';

-- CreateTable
CREATE TABLE [dbo].[users] (
    [id] INT NOT NULL IDENTITY(1,1),
    [email] NVARCHAR(150) NOT NULL,
    [password] NVARCHAR(255) NOT NULL,
    [fullName] NVARCHAR(150) NOT NULL,
    [phone] NVARCHAR(30),
    [avatarUrl] NVARCHAR(400),
    [role] NVARCHAR(20) NOT NULL CONSTRAINT [users_role_df] DEFAULT 'client',
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [users_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT [users_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [users_email_key] UNIQUE NONCLUSTERED ([email])
);

-- CreateTable
CREATE TABLE [dbo].[categories] (
    [id] INT NOT NULL IDENTITY(1,1),
    [name] NVARCHAR(60) NOT NULL,
    [slug] NVARCHAR(60) NOT NULL,
    CONSTRAINT [categories_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [categories_slug_key] UNIQUE NONCLUSTERED ([slug])
);

-- CreateTable
CREATE TABLE [dbo].[materials] (
    [id] INT NOT NULL IDENTITY(1,1),
    [name] NVARCHAR(80) NOT NULL,
    CONSTRAINT [materials_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [materials_name_key] UNIQUE NONCLUSTERED ([name])
);

-- CreateTable
CREATE TABLE [dbo].[products] (
    [id] INT NOT NULL IDENTITY(1,1),
    [name] NVARCHAR(150) NOT NULL,
    [slug] NVARCHAR(150) NOT NULL,
    [categoryId] INT NOT NULL,
    [materialId] INT NOT NULL,
    [price] DECIMAL(10,2) NOT NULL,
    [imageUrl] NVARCHAR(400) NOT NULL,
    [description] NVARCHAR(1000),
    [isActive] BIT NOT NULL CONSTRAINT [products_isActive_df] DEFAULT 1,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [products_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT [products_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [products_slug_key] UNIQUE NONCLUSTERED ([slug])
);

-- CreateTable
CREATE TABLE [dbo].[components] (
    [id] INT NOT NULL IDENTITY(1,1),
    [name] NVARCHAR(150) NOT NULL,
    [jewelryType] NVARCHAR(30) NOT NULL,
    [slot] NVARCHAR(30) NOT NULL,
    [materialId] INT,
    [price] DECIMAL(10,2) NOT NULL,
    [imageUrl] NVARCHAR(400) NOT NULL,
    [layerZ] INT NOT NULL CONSTRAINT [components_layerZ_df] DEFAULT 1,
    [isActive] BIT NOT NULL CONSTRAINT [components_isActive_df] DEFAULT 1,
    CONSTRAINT [components_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[builds] (
    [id] INT NOT NULL IDENTITY(1,1),
    [userId] INT,
    [jewelryType] NVARCHAR(30) NOT NULL,
    [article] NVARCHAR(50) NOT NULL,
    [totalPrice] DECIMAL(10,2) NOT NULL,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [builds_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT [builds_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [builds_article_key] UNIQUE NONCLUSTERED ([article])
);

-- CreateTable
CREATE TABLE [dbo].[build_items] (
    [id] INT NOT NULL IDENTITY(1,1),
    [buildId] INT NOT NULL,
    [componentId] INT NOT NULL,
    [layerZ] INT NOT NULL CONSTRAINT [build_items_layerZ_df] DEFAULT 1,
    CONSTRAINT [build_items_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[orders] (
    [id] INT NOT NULL IDENTITY(1,1),
    [orderNumber] NVARCHAR(20) NOT NULL,
    [userId] INT,
    [customerName] NVARCHAR(150) NOT NULL,
    [phone] NVARCHAR(30) NOT NULL,
    [email] NVARCHAR(150),
    [deliveryType] NVARCHAR(20) NOT NULL,
    [address] NVARCHAR(400),
    [pickupPointId] INT,
    [total] DECIMAL(10,2) NOT NULL,
    [status] NVARCHAR(20) NOT NULL CONSTRAINT [orders_status_df] DEFAULT 'new',
    [comment] NVARCHAR(500),
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [orders_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT [orders_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [orders_orderNumber_key] UNIQUE NONCLUSTERED ([orderNumber])
);

-- CreateTable
CREATE TABLE [dbo].[order_items] (
    [id] INT NOT NULL IDENTITY(1,1),
    [orderId] INT NOT NULL,
    [productId] INT,
    [buildId] INT,
    [title] NVARCHAR(200) NOT NULL,
    [price] DECIMAL(10,2) NOT NULL,
    [quantity] INT NOT NULL CONSTRAINT [order_items_quantity_df] DEFAULT 1,
    CONSTRAINT [order_items_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[favorites] (
    [id] INT NOT NULL IDENTITY(1,1),
    [userId] INT NOT NULL,
    [buildId] INT,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [favorites_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT [favorites_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[pickup_points] (
    [id] INT NOT NULL IDENTITY(1,1),
    [kind] NVARCHAR(20) NOT NULL,
    [provider] NVARCHAR(50) NOT NULL,
    [city] NVARCHAR(80) NOT NULL,
    [address] NVARCHAR(250) NOT NULL,
    [workHours] NVARCHAR(120),
    [phone] NVARCHAR(30),
    CONSTRAINT [pickup_points_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[chat_messages] (
    [id] INT NOT NULL IDENTITY(1,1),
    [userId] INT,
    [room] NVARCHAR(60) NOT NULL CONSTRAINT [chat_messages_room_df] DEFAULT 'support',
    [body] NVARCHAR(1000) NOT NULL,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [chat_messages_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT [chat_messages_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateIndex
CREATE NONCLUSTERED INDEX [products_categoryId_idx] ON [dbo].[products]([categoryId]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [products_materialId_idx] ON [dbo].[products]([materialId]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [components_jewelryType_slot_idx] ON [dbo].[components]([jewelryType], [slot]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [builds_userId_idx] ON [dbo].[builds]([userId]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [build_items_buildId_idx] ON [dbo].[build_items]([buildId]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [orders_userId_idx] ON [dbo].[orders]([userId]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [order_items_orderId_idx] ON [dbo].[order_items]([orderId]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [favorites_userId_idx] ON [dbo].[favorites]([userId]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [pickup_points_kind_city_idx] ON [dbo].[pickup_points]([kind], [city]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [chat_messages_room_createdAt_idx] ON [dbo].[chat_messages]([room], [createdAt]);

-- AddForeignKey
ALTER TABLE [dbo].[products] ADD CONSTRAINT [products_categoryId_fkey] FOREIGN KEY ([categoryId]) REFERENCES [dbo].[categories]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[products] ADD CONSTRAINT [products_materialId_fkey] FOREIGN KEY ([materialId]) REFERENCES [dbo].[materials]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[components] ADD CONSTRAINT [components_materialId_fkey] FOREIGN KEY ([materialId]) REFERENCES [dbo].[materials]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[builds] ADD CONSTRAINT [builds_userId_fkey] FOREIGN KEY ([userId]) REFERENCES [dbo].[users]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[build_items] ADD CONSTRAINT [build_items_buildId_fkey] FOREIGN KEY ([buildId]) REFERENCES [dbo].[builds]([id]) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[build_items] ADD CONSTRAINT [build_items_componentId_fkey] FOREIGN KEY ([componentId]) REFERENCES [dbo].[components]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[orders] ADD CONSTRAINT [orders_userId_fkey] FOREIGN KEY ([userId]) REFERENCES [dbo].[users]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[order_items] ADD CONSTRAINT [order_items_orderId_fkey] FOREIGN KEY ([orderId]) REFERENCES [dbo].[orders]([id]) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[order_items] ADD CONSTRAINT [order_items_productId_fkey] FOREIGN KEY ([productId]) REFERENCES [dbo].[products]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[order_items] ADD CONSTRAINT [order_items_buildId_fkey] FOREIGN KEY ([buildId]) REFERENCES [dbo].[builds]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[favorites] ADD CONSTRAINT [favorites_userId_fkey] FOREIGN KEY ([userId]) REFERENCES [dbo].[users]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[favorites] ADD CONSTRAINT [favorites_buildId_fkey] FOREIGN KEY ([buildId]) REFERENCES [dbo].[builds]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
GO

/* ----------------------------------------------------------------------------
   Проверка: список созданных таблиц
   ---------------------------------------------------------------------------- */
SELECT t.name AS [Таблица], p.rows AS [Строк]
FROM sys.tables AS t
JOIN sys.partitions AS p ON p.object_id = t.object_id AND p.index_id IN (0, 1)
ORDER BY t.name;
GO
