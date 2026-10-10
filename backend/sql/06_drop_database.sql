/* ============================================================================
   06 — УДАЛЕНИЕ БАЗЫ (НУЖНО РЕДКО: чтобы начать всё заново)
   ----------------------------------------------------------------------------
   ВНИМАНИЕ: скрипт полностью удаляет базу noir_bijoux со всеми данными.
   Используйте, если хотите пройти шаг 5 с нуля (например, испортили структуру).

   После удаления порядок повторного создания:
     01_create_database.sql → 02_schema.sql → 03_indexes.sql → 04_seed.sql
   ============================================================================ */

USE [master];
GO

-- Закрываем соединения с базой, иначе DROP DATABASE не выполнится
IF DB_ID(N'noir_bijoux') IS NOT NULL
BEGIN
    ALTER DATABASE [noir_bijoux] SET SINGLE_USER WITH ROLLBACK IMMEDIATE;
    DROP DATABASE [noir_bijoux];
    PRINT N'База noir_bijoux удалена.';
END
ELSE
BEGIN
    PRINT N'Базы noir_bijoux нет — удалять нечего.';
END
GO

-- Логин приложения (нужен, только если будете создавать базу заново с тем же логином)
IF EXISTS (SELECT 1 FROM sys.server_principals WHERE name = N'noir_app')
BEGIN
    DROP LOGIN [noir_app];
    PRINT N'Логин noir_app удалён.';
END
GO
