/* ============================================================================
   01 — СОЗДАНИЕ БАЗЫ ДАННЫХ NOIR BIJOUX
   ----------------------------------------------------------------------------
   Что делает скрипт:
     1) создаёт базу данных noir_bijoux (если её ещё нет);
     2) задаёт параметры базы (сортировка для русского текста, простая модель
        восстановления — для учебного проекта этого достаточно);
     3) создаёт логин приложения noir_app и пользователя в базе;
     4) выдаёт права: чтение, запись, изменение структуры (нужно миграциям).

   Как запустить:
     • SQL Server Management Studio:
         подключиться к серверу → File → Open → File… → выбрать этот файл →
         нажать F5 (Execute);
     • из командной строки (sqlcmd):
         sqlcmd -S localhost -U sa -P "ВашПароль" -i 01_create_database.sql

   Важно: скрипт рассчитан на запуск под учётной записью с правами
   администратора сервера (sa или Windows-администратор).
   ============================================================================ */

USE [master];
GO

/* ---------------------------------------------------------------- 1. БАЗА --- */
IF DB_ID(N'noir_bijoux') IS NULL
BEGIN
    CREATE DATABASE [noir_bijoux]
    COLLATE Cyrillic_General_CI_AS;   -- сравнение без учёта регистра, кириллица
    PRINT N'База noir_bijoux создана.';
END
ELSE
BEGIN
    PRINT N'База noir_bijoux уже существует — создание пропущено.';
END
GO

-- Простая модель восстановления: не растёт журнал транзакций (для учебного проекта).
ALTER DATABASE [noir_bijoux] SET RECOVERY SIMPLE;
GO

-- Проверка включения режима чтения с фиксацией снимка (при необходимости
-- раскомментируйте: полезно, если база интенсивно читается при записи):
-- ALTER DATABASE [noir_bijoux] SET READ_COMMITTED_SNAPSHOT ON WITH ROLLBACK IMMEDIATE;
-- GO

/* --------------------------------------------------- 2. ЛОГИН ПРИЛОЖЕНИЯ ---
   Бэкенд подключается не под sa, а под отдельным логином приложения:
   так правильно с точки зрения безопасности.                                   */
IF NOT EXISTS (SELECT 1 FROM sys.server_principals WHERE name = N'noir_app')
BEGIN
    CREATE LOGIN [noir_app]
        WITH PASSWORD = N'NoirApp!2026',
             CHECK_POLICY = OFF,               -- учебный проект: пароль без истечения
             DEFAULT_DATABASE = [noir_bijoux];
    PRINT N'Логин noir_app создан.';
END
ELSE
BEGIN
    PRINT N'Логин noir_app уже существует — создание пропущено.';
END
GO

USE [noir_bijoux];
GO

/* ------------------------------------------ 3. ПОЛЬЗОВАТЕЛЬ В БАЗЕ И ПРАВА --- */
IF NOT EXISTS (SELECT 1 FROM sys.database_principals WHERE name = N'noir_app')
BEGIN
    CREATE USER [noir_app] FOR LOGIN [noir_app];
    PRINT N'Пользователь noir_app создан в базе noir_bijoux.';
END
ELSE
BEGIN
    PRINT N'Пользователь noir_app уже существует.';
END
GO

-- db_owner — простой вариант для учебного проекта: логин может создавать таблицы,
-- читать и изменять данные. В реальной эксплуатации выдали бы отдельные права
-- (db_datareader, db_datawriter, db_ddladmin).
ALTER ROLE [db_owner] ADD MEMBER [noir_app];
GO

PRINT N'Готово: база noir_bijoux и логин noir_app подготовлены.';
PRINT N'Дальше выполните 02_schema.sql (создание таблиц).';
GO
