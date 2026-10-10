/* ============================================================================
   05 — УДАЛЕНИЕ ТАБЛИЦ (НАЧАТЬ С НУЛЯ)
   ----------------------------------------------------------------------------
   Удаляет все 12 таблиц вместе с данными. В Supabase базу целиком удалить
   нельзя (она — часть проекта), поэтому удаляются таблицы.

   Внимание: все данные пропадут. Выполнять только если действительно нужно
   пересоздать базу заново: 05 → 01 → 02 → 03.
   ============================================================================ */

SET search_path = public;

DROP TABLE IF EXISTS
    "order_items",
    "orders",
    "favorites",
    "build_items",
    "builds",
    "products",
    "components",
    "pickup_points",
    "chat_messages",
    "users",
    "categories",
    "materials"
CASCADE;

/* Проверка: таблиц в схеме public не осталось */
SELECT COUNT(*) AS "Осталось таблиц"
FROM information_schema.tables
WHERE table_schema = 'public' AND table_type = 'BASE TABLE';
