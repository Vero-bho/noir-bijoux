/* ============================================================================
   03 — ИНДЕКСЫ ПО ВНЕШНИМ КЛЮЧАМ (РЕКОМЕНДУЕТСЯ)
   ----------------------------------------------------------------------------
   Prisma создаёт только первичные ключи и уникальные ограничения (02_schema.sql).
   SQL Server НЕ создаёт индексы по внешним ключам автоматически, поэтому
   добавляем их вручную: благодаря этому выборки «изделия категории»,
   «позиции заказа», «сборки пользователя» выполняются быстрее.

   Скрипт безопасно запускать повторно: каждый индекс создаётся только если
   его ещё нет. Запускать после 02_schema.sql.
   ============================================================================ */

USE [noir_bijoux];
GO

-- Каталог: фильтр по категории и материалу
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'ix_products_category' AND object_id = OBJECT_ID(N'dbo.products'))
    CREATE NONCLUSTERED INDEX [ix_products_category] ON [dbo].[products] ([categoryId]) INCLUDE ([price], [isActive]);
GO
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'ix_products_material' AND object_id = OBJECT_ID(N'dbo.products'))
    CREATE NONCLUSTERED INDEX [ix_products_material] ON [dbo].[products] ([materialId]);
GO

-- Конструктор: выборка компонентов по типу изделия и вкладке
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'ix_components_type_slot' AND object_id = OBJECT_ID(N'dbo.components'))
    CREATE NONCLUSTERED INDEX [ix_components_type_slot] ON [dbo].[components] ([jewelryType], [slot], [layerZ]);
GO
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'ix_components_material' AND object_id = OBJECT_ID(N'dbo.components'))
    CREATE NONCLUSTERED INDEX [ix_components_material] ON [dbo].[components] ([materialId]);
GO

-- Сборки пользователя («мои сборки»)
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'ix_builds_user' AND object_id = OBJECT_ID(N'dbo.builds'))
    CREATE NONCLUSTERED INDEX [ix_builds_user] ON [dbo].[builds] ([userId], [createdAt] DESC);
GO
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'ix_build_items_build' AND object_id = OBJECT_ID(N'dbo.build_items'))
    CREATE NONCLUSTERED INDEX [ix_build_items_build] ON [dbo].[build_items] ([buildId]);
GO
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'ix_build_items_component' AND object_id = OBJECT_ID(N'dbo.build_items'))
    CREATE NONCLUSTERED INDEX [ix_build_items_component] ON [dbo].[build_items] ([componentId]);
GO

-- Заказы: история заказов пользователя и фильтр по статусу (админ-раздел)
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'ix_orders_user' AND object_id = OBJECT_ID(N'dbo.orders'))
    CREATE NONCLUSTERED INDEX [ix_orders_user] ON [dbo].[orders] ([userId], [createdAt] DESC);
GO
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'ix_orders_status' AND object_id = OBJECT_ID(N'dbo.orders'))
    CREATE NONCLUSTERED INDEX [ix_orders_status] ON [dbo].[orders] ([status]);
GO
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'ix_order_items_order' AND object_id = OBJECT_ID(N'dbo.order_items'))
    CREATE NONCLUSTERED INDEX [ix_order_items_order] ON [dbo].[order_items] ([orderId]);
GO

-- Избранное и сообщения поддержки
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'ix_favorites_user' AND object_id = OBJECT_ID(N'dbo.favorites'))
    CREATE NONCLUSTERED INDEX [ix_favorites_user] ON [dbo].[favorites] ([userId], [createdAt] DESC);
GO
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'ix_favorites_build' AND object_id = OBJECT_ID(N'dbo.favorites'))
    CREATE NONCLUSTERED INDEX [ix_favorites_build] ON [dbo].[favorites] ([buildId]);
GO
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'ix_chat_messages_room' AND object_id = OBJECT_ID(N'dbo.chat_messages'))
    CREATE NONCLUSTERED INDEX [ix_chat_messages_room] ON [dbo].[chat_messages] ([room], [createdAt] DESC);
GO

PRINT N'Индексы созданы.';
GO
