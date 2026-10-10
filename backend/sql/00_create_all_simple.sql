/* ============================================================================
   NOIR BIJOUX — СОЗДАНИЕ БАЗЫ ДАННЫХ И ТАБЛИЦ
   Файл «всё в одном»: база + 12 таблиц + связи + индексы.
   ----------------------------------------------------------------------------
   КАК ЗАПУСТИТЬ (Microsoft SQL Server Management Studio):

     1. Открыть SSMS и подключиться к серверу (обычно имя сервера: localhost,
        проверка подлинности SQL Server, логин sa и пароль от установки).
     2. В верхнем меню: File → Open → File… → выбрать этот файл.
     3. Нажать F5 (кнопка Execute). Внизу появится «Запрос выполнен успешно».
     4. Слева в дереве: обновить Databases (правая кнопка → Refresh).
        Появится база noir_bijoux, внутри неё Tables — 12 таблиц.

   ЕСЛИ ЧТО-ТО ПОШЛО НЕ ТАК и нужно начать заново: в самом низу файла есть
   закомментированный блок «УДАЛИТЬ БАЗУ» — снять комментарии и выполнить.

   ЧТО ВНУТРИ:
     часть 1 — создание базы noir_bijoux;
     часть 2 — 12 таблиц (каталог, конструктор, пользователи, заказы);
     часть 3 — связи между таблицами (внешние ключи);
     часть 4 — индексы, чтобы выборки работали быстрее;
     часть 5 — проверка: список созданных таблиц.

   ФАЙЛ ЗАМЕНЯЕТ скрипты 01_create_database.sql, 02_schema.sql и 03_indexes.sql:
   он делает то же самое, но записан понятнее — простыми типами данных и без
   служебных конструкций (никаких sys-схем, транзакций и автоматических имён
   ограничений). Данные добавляются отдельно: файл 04_seed.sql.

   ТИПЫ ДАННЫХ (всего пять, самых обычных):
     INT              — целое число (id, количество, размер)
     DECIMAL(10,2)    — деньги: всего 10 цифр, 2 после запятой (например 4500.00)
     NVARCHAR(n)      — текст до n символов; обычный varchar, но понимает русские буквы
     DATETIME         — дата и время
     BIT              — да/нет (1 = да, 0 = нет)
   ============================================================================ */

/* ============================================================================
   ЧАСТЬ 1. СОЗДАНИЕ БАЗЫ
   ============================================================================ */

USE master;
GO

IF DB_ID('noir_bijoux') IS NULL
BEGIN
    CREATE DATABASE noir_bijoux;
    PRINT 'База noir_bijoux создана.';
END
ELSE
BEGIN
    PRINT 'База noir_bijoux уже есть — переходим к таблицам.';
END
GO

USE noir_bijoux;
GO


/* ============================================================================
   ЧАСТЬ 2. ТАБЛИЦЫ
   Порядок: сначала справочники (категории, материалы, точки выдачи),
   затем основная таблица пользователей и всё, что на неё ссылается.
   ============================================================================ */

/* --- 1. Категории изделий: колье, браслет, серьги, кольцо ------------------ */
CREATE TABLE categories (
    id    INT IDENTITY(1,1) PRIMARY KEY,   -- номер записи, заполняется сам: 1, 2, 3…
    name  NVARCHAR(60)  NOT NULL,          -- «Колье»
    slug  NVARCHAR(60)  NOT NULL UNIQUE    -- адрес на латинице: necklace
);
GO

/* --- 2. Материалы: серебро 925, ювелирный сплав, чёрный родий -------------- */
CREATE TABLE materials (
    id    INT IDENTITY(1,1) PRIMARY KEY,
    name  NVARCHAR(80) NOT NULL UNIQUE
);
GO

/* --- 3. Точки получения: мастерская, шоурум, ПВЗ СДЭК и Boxberry ----------- */
CREATE TABLE pickup_points (
    id        INT IDENTITY(1,1) PRIMARY KEY,
    kind      NVARCHAR(20)  NOT NULL,      -- pickup = самовывоз, pvz = пункт выдачи
    provider  NVARCHAR(50)  NOT NULL,      -- «Мастерская Noir Bijoux»
    city      NVARCHAR(80)  NOT NULL,
    address   NVARCHAR(250) NOT NULL,
    workHours NVARCHAR(120) NULL,          -- может быть пустым
    phone     NVARCHAR(30)  NULL
);
GO

/* --- 4. Пользователи сайта ----------------------------------------------- */
CREATE TABLE users (
    id        INT IDENTITY(1,1) PRIMARY KEY,
    email     NVARCHAR(150) NOT NULL UNIQUE,
    password  NVARCHAR(255) NOT NULL,      -- хранится хеш пароля, не сам пароль
    fullName  NVARCHAR(150) NOT NULL,
    phone     NVARCHAR(30)  NULL,
    avatarUrl NVARCHAR(400) NULL,
    role      NVARCHAR(20)  NOT NULL DEFAULT 'client',   -- client или admin
    createdAt DATETIME      NOT NULL DEFAULT GETDATE()   -- дата регистрации
);
GO

/* --- 5. Готовые изделия каталога ----------------------------------------- */
CREATE TABLE products (
    id          INT IDENTITY(1,1) PRIMARY KEY,
    name        NVARCHAR(150)  NOT NULL,   -- «Колье «Ночная Роза»»
    slug        NVARCHAR(150)  NOT NULL UNIQUE,   -- necklace-night-rose
    categoryId  INT            NOT NULL,   -- ссылка на categories.id
    materialId  INT            NOT NULL,   -- ссылка на materials.id
    price       DECIMAL(10,2)  NOT NULL,
    imageUrl    NVARCHAR(400)  NOT NULL,   -- путь к картинке
    description NVARCHAR(1000) NULL,
    isActive    BIT            NOT NULL DEFAULT 1,   -- 1 = показывать в каталоге
    createdAt   DATETIME       NOT NULL DEFAULT GETDATE()
);
GO

/* --- 6. Компоненты конструктора: цепочки, подвески, камни, застёжки ------- */
CREATE TABLE components (
    id          INT IDENTITY(1,1) PRIMARY KEY,
    name        NVARCHAR(150) NOT NULL,    -- «Подвеска «Чёрная Роза»»
    jewelryType NVARCHAR(30)  NOT NULL,    -- necklace | bracelet | earrings | ring
    slot        NVARCHAR(30)  NOT NULL,    -- chain | pendant | clasp | stone | size ...
    materialId  INT           NULL,        -- материал (может быть не указан)
    price       DECIMAL(10,2) NOT NULL,
    imageUrl    NVARCHAR(400) NOT NULL,    -- слой картинки для наложения
    layerZ      INT           NOT NULL DEFAULT 1,    -- порядок слоя: больше = выше
    isActive    BIT           NOT NULL DEFAULT 1
);
GO

/* --- 7. Авторские сборки пользователя ------------------------------------ */
CREATE TABLE builds (
    id          INT IDENTITY(1,1) PRIMARY KEY,
    userId      INT           NULL,        -- NULL = сборка гостя (без входа)
    jewelryType NVARCHAR(30)  NOT NULL,
    article     NVARCHAR(50)  NOT NULL UNIQUE,   -- артикул: NB-NK-1-3-6
    totalPrice  DECIMAL(10,2) NOT NULL,    -- цена сборки, считает сервер
    createdAt   DATETIME      NOT NULL DEFAULT GETDATE()
);
GO

/* --- 8. Состав сборки: какие компоненты и в каком слое ------------------- */
CREATE TABLE build_items (
    id          INT IDENTITY(1,1) PRIMARY KEY,
    buildId     INT NOT NULL,              -- ссылка на builds.id
    componentId INT NOT NULL,              -- ссылка на components.id
    layerZ      INT NOT NULL DEFAULT 1
);
GO

/* --- 9. Заказы ------------------------------------------------------------ */
CREATE TABLE orders (
    id            INT IDENTITY(1,1) PRIMARY KEY,
    orderNumber   NVARCHAR(20)  NOT NULL UNIQUE,   -- номер заказа: 4821
    userId        INT           NULL,      -- NULL = заказ гостя
    customerName  NVARCHAR(150) NOT NULL,
    phone         NVARCHAR(30)  NOT NULL,
    email         NVARCHAR(150) NULL,
    deliveryType  NVARCHAR(20)  NOT NULL,  -- Самовывоз | Курьер | Пункт выдачи
    address       NVARCHAR(400) NULL,      -- нужен для курьера
    pickupPointId INT           NULL,      -- нужен для самовывоза и ПВЗ
    total         DECIMAL(10,2) NOT NULL,  -- итог: позиции + доставка
    status        NVARCHAR(20)  NOT NULL DEFAULT 'new',  -- new | confirmed | making | ready | done | canceled
    comment       NVARCHAR(500) NULL,
    createdAt     DATETIME      NOT NULL DEFAULT GETDATE()
);
GO

/* --- 10. Позиции заказа --------------------------------------------------- */
CREATE TABLE order_items (
    id        INT IDENTITY(1,1) PRIMARY KEY,
    orderId   INT           NOT NULL,      -- ссылка на orders.id
    productId INT           NULL,          -- позиция из каталога (если это готовое изделие)
    buildId   INT           NULL,          -- позиция-сборка (если это авторская сборка)
    title     NVARCHAR(200) NOT NULL,      -- название на момент заказа
    price     DECIMAL(10,2) NOT NULL,      -- цена на момент заказа
    quantity  INT           NOT NULL DEFAULT 1
);
GO

/* --- 11. Избранные сборки ------------------------------------------------- */
CREATE TABLE favorites (
    id        INT IDENTITY(1,1) PRIMARY KEY,
    userId    INT NOT NULL,                -- ссылка на users.id
    buildId   INT NULL,                    -- ссылка на builds.id
    createdAt DATETIME NOT NULL DEFAULT GETDATE()
);
GO

/* --- 12. Сообщения чата поддержки ---------------------------------------- */
CREATE TABLE chat_messages (
    id        INT IDENTITY(1,1) PRIMARY KEY,
    userId    INT            NULL,
    room      NVARCHAR(60)   NOT NULL DEFAULT 'support',
    body      NVARCHAR(1000) NOT NULL,
    createdAt DATETIME       NOT NULL DEFAULT GETDATE()
);
GO


/* ============================================================================
   ЧАСТЬ 3. СВЯЗИ МЕЖДУ ТАБЛИЦАМИ (ВНЕШНИЕ КЛЮЧИ)
   ----------------------------------------------------------------------------
   NO ACTION у большинства связей означает «нельзя удалить то, на что ссылаются»
   — так данные защищены от случайного удаления.
   CASCADE стоит только там, где это логично: удалили заказ или сборку → вместе
   с ними удаляются их позиции, потому что отдельно они не нужны.
   ============================================================================ */

/* изделие относится к категории и сделано из материала */
ALTER TABLE products ADD CONSTRAINT FK_products_categories
    FOREIGN KEY (categoryId) REFERENCES categories(id);
GO
ALTER TABLE products ADD CONSTRAINT FK_products_materials
    FOREIGN KEY (materialId) REFERENCES materials(id);
GO

/* у компонента конструктора может быть указан материал */
ALTER TABLE components ADD CONSTRAINT FK_components_materials
    FOREIGN KEY (materialId) REFERENCES materials(id);
GO

/* сборка принадлежит пользователю (или гостю) */
ALTER TABLE builds ADD CONSTRAINT FK_builds_users
    FOREIGN KEY (userId) REFERENCES users(id);
GO

/* состав сборки: если сборку удалить, её строки состава удаляются вместе с ней */
ALTER TABLE build_items ADD CONSTRAINT FK_build_items_builds
    FOREIGN KEY (buildId) REFERENCES builds(id) ON DELETE CASCADE;
GO
ALTER TABLE build_items ADD CONSTRAINT FK_build_items_components
    FOREIGN KEY (componentId) REFERENCES components(id);
GO

/* заказ принадлежит пользователю (или гостю) */
ALTER TABLE orders ADD CONSTRAINT FK_orders_users
    FOREIGN KEY (userId) REFERENCES users(id);
GO

/* позиции заказа: удалили заказ — удаляются и его позиции */
ALTER TABLE order_items ADD CONSTRAINT FK_order_items_orders
    FOREIGN KEY (orderId) REFERENCES orders(id) ON DELETE CASCADE;
GO
ALTER TABLE order_items ADD CONSTRAINT FK_order_items_products
    FOREIGN KEY (productId) REFERENCES products(id);
GO
ALTER TABLE order_items ADD CONSTRAINT FK_order_items_builds
    FOREIGN KEY (buildId) REFERENCES builds(id);
GO

/* избранное: чьи сборки и какие */
ALTER TABLE favorites ADD CONSTRAINT FK_favorites_users
    FOREIGN KEY (userId) REFERENCES users(id);
GO
ALTER TABLE favorites ADD CONSTRAINT FK_favorites_builds
    FOREIGN KEY (buildId) REFERENCES builds(id);
GO


/* ============================================================================
   ЧАСТЬ 4. ИНДЕКСЫ (ПО ЖЕЛАНИЮ, НО ПОЛЕЗНО)
   ----------------------------------------------------------------------------
   SQL Server сам индексы по связям не создаёт. С индексами фильтры каталога,
   список сборок и история заказов работают быстрее. Можно не выполнять.
   ============================================================================ */

CREATE INDEX ix_products_category   ON products (categoryId);              -- фильтр каталога по категории
CREATE INDEX ix_products_material   ON products (materialId);              -- фильтр по материалу
CREATE INDEX ix_components_type     ON components (jewelryType, slot);     -- вкладки конструктора
CREATE INDEX ix_components_material ON components (materialId);
CREATE INDEX ix_builds_user         ON builds (userId);                    -- «мои сборки»
CREATE INDEX ix_build_items_build   ON build_items (buildId);              -- состав сборки
CREATE INDEX ix_build_items_component ON build_items (componentId);
CREATE INDEX ix_orders_user         ON orders (userId);                    -- история заказов
CREATE INDEX ix_orders_status       ON orders (status);                    -- фильтр статусов в админке
CREATE INDEX ix_order_items_order   ON order_items (orderId);              -- позиции заказа
CREATE INDEX ix_favorites_user      ON favorites (userId);                 -- избранное пользователя
CREATE INDEX ix_favorites_build     ON favorites (buildId);
CREATE INDEX ix_chat_messages_room  ON chat_messages (room);               -- чат поддержки
GO


/* ============================================================================
   ЧАСТЬ 5. ПРОВЕРКА
   ============================================================================ */

PRINT 'Готово. Ниже список созданных таблиц:';

SELECT TABLE_NAME AS [Таблица]
FROM INFORMATION_SCHEMA.TABLES
WHERE TABLE_TYPE = 'BASE TABLE'
ORDER BY TABLE_NAME;
GO

/* Дополнительно можно посмотреть поля любой таблицы, например каталога:

   SELECT COLUMN_NAME   AS [Поле],
          DATA_TYPE     AS [Тип],
          CHARACTER_MAXIMUM_LENGTH AS [Длина],
          IS_NULLABLE   AS [Может быть пустым]
   FROM INFORMATION_SCHEMA.COLUMNS
   WHERE TABLE_NAME = 'products';
   GO
*/

/* Дальше: заполнить базу данными — выполнить файл 04_seed.sql
   (8 изделий каталога, 40 компонентов конструктора, точки выдачи, пользователи,
   сборки и заказы). Либо, когда бэкенд уже подключён к базе: npm run seed. */


/* ============================================================================
   УДАЛИТЬ БАЗУ (если нужно начать заново)
   ----------------------------------------------------------------------------
   Снять комментарии со строк ниже и выполнить. Внимание: все данные пропадут.

   USE master;
   GO
   IF DB_ID('noir_bijoux') IS NOT NULL
   BEGIN
       ALTER DATABASE noir_bijoux SET SINGLE_USER WITH ROLLBACK IMMEDIATE;
       DROP DATABASE noir_bijoux;
   END
   GO
   ============================================================================ */


/* ============================================================================
   НЕОБЯЗАТЕЛЬНО: ОТДЕЛЬНЫЙ ПОЛЬЗОВАТЕЛЬ ДЛЯ ПРИЛОЖЕНИЯ
   ----------------------------------------------------------------------------
   По умолчанию бэкенд подключается логином sa — для учебного проекта этого
   достаточно. Если нужно, чтобы сайт ходил в базу под своим логином, выполните:

   USE master;
   GO
   CREATE LOGIN noir_app WITH PASSWORD = 'NoirApp!2026', CHECK_POLICY = OFF;
   GO
   USE noir_bijoux;
   GO
   CREATE USER noir_app FOR LOGIN noir_app;
   GO
   ALTER ROLE db_owner ADD MEMBER noir_app;
   GO

   Тогда в файле backend\.env строка подключения будет такой:
   DATABASE_URL="sqlserver://localhost:1433;database=noir_bijoux;user=noir_app;password=NoirApp!2026;encrypt=true;trustServerCertificate=true"
   ============================================================================ */
