/* ============================================================================
   02 — ИНДЕКСЫ (РЕКОМЕНДУЕТСЯ)
   ----------------------------------------------------------------------------
   Prisma уже создала индексы, описанные в схеме (@@index и @unique) — их
   создаст 01_schema.sql. Здесь добавляются те, которых в схеме нет:
   индексы по столбцам внешних ключей и по статусу заказа.

   Зачем: PostgreSQL, как и SQL Server, не индексирует столбцы внешних ключей
   автоматически. С этими индексами фильтры каталога, поиск «где использован
   компонент», список избранного и фильтр заказов по статусу работают быстрее.

   Скрипт безопасно запускать повторно: IF NOT EXISTS.
   Запускать после 01_schema.sql.
   ============================================================================ */

SET search_path = public;

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

/* Проверка: список индексов базы */
SELECT tablename AS "Таблица", indexname AS "Индекс"
FROM pg_indexes
WHERE schemaname = 'public'
ORDER BY tablename, indexname;
