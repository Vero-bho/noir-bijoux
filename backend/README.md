# Noir Bijoux — бэкенд (REST API)

Node.js + Express 5 + TypeScript + Prisma 7 + **PostgreSQL (облако Supabase)** + Swagger.

## Запуск

```powershell
npm ci
# Если файла .env нет:
Copy-Item .env.example .env
# Откройте .env и вставьте DATABASE_URL из Supabase
npm run prisma:generate    # сгенерировать Prisma Client
npm run db:check           # проверить подключение (после создания таблиц)
npm run dev                # API: http://localhost:4000
```

* Проверка API: <http://localhost:4000/api/health>
* Документация Swagger: <http://localhost:4000/api-docs>

База проекта — PostgreSQL в облаке Supabase (методические указания, практики №7–№8).
Строка подключения берётся в проекте Supabase: кнопка **Connect → ORMs → Prisma**,
и вставляется в `.env`. Подробная инструкция — `../docs/ШАГ-5b_База_данных_Supabase.md`.

API можно посмотреть и вовсе без базы — в демонстрационном режиме она подменяется
данными в памяти:

```bash
npm run demo               # http://localhost:4000/api-docs
```

## Скрипты

| Команда | Что делает |
|---|---|
| `npm run dev` | запуск с автоперезагрузкой (tsx watch) |
| `npm run build` / `npm start` | сборка в `dist/` и запуск собранного кода |
| `npm run demo` | демонстрационный запуск без подключения к настоящей БД: данные в памяти + Swagger |
| `npm run typecheck` | проверка типов TypeScript |
| `npm run prisma:generate` | генерация Prisma Client из `schema.prisma` |
| `npm run prisma:migrate` | применить схему к базе (создать таблицы) |
| `npm run prisma:studio` | веб-интерфейс для просмотра данных базы |
| `npm run prisma:sql` | вывести SQL-скрипт создания таблиц (PostgreSQL) |
| `npm run seed` | наполнить базу данными магазина (каталог, компоненты, пользователи) |
| `npm test` | все проверки: 64 SQL (MSSQL) + 62 SQL (PostgreSQL) + 89 API + 33 данные + 37 коллекция Postman = 285 |
| `npm run test:sql` | проверка SQL-скриптов MSSQL (сервер не нужен) |
| `npm run test:sql:pg` | проверка SQL-скриптов PostgreSQL/Supabase (интернет не нужен) |
| `npm run check:files` | проверка, все ли файлы и папки проекта на месте |
| `npm run db:check` | проверка подключения к базе и состояния данных |
| `npm run test:api` | 89 проверок всех эндпоинтов (смоук-тест) |
| `npm run test:seed` | 33 проверки файла заполнения базы |
| `npm run test:postman` | прогон коллекции Postman движком Newman |

## Структура

```
src/
├── server.ts          точка входа: читает PORT и запускает приложение
├── app.ts             сборка Express-приложения (middleware + маршруты)
├── config/            env.ts (переменные окружения), swagger.ts (Swagger)
├── middleware/        errorHandler, notFound, auth (JWT), validate, upload (файлы)
├── modules/           модули API: health, auth, products, components, builds,
│                      favorites, delivery, orders, profile, admin
│   └── <модуль>/      routes (маршруты) · controller (запрос/ответ)
│                      · service (логика и обращения к базе) · validation (проверки)
├── prisma/
│   ├── schema/schema.prisma   модель данных PostgreSQL/Supabase (12 таблиц)
│   ├── client.ts              экземпляр Prisma Client (+ @prisma/adapter-pg)
│   ├── seed.ts                заполнение базы (данные из фронтенда)
│   ├── generated/             сгенерированный Prisma Client
│   └── migrations/            миграции
└── utils/             AppError, jwt, password, article, orderNumber, mappers

sql/                   SQL-скрипты базы: создание, таблицы, индексы, данные, проверка
tests/                 проверки API без подключения к настоящей базе (Prisma подменяется заглушкой)
scripts/demo-server.js демонстрационный запуск с базой в памяти
postman/               коллекция запросов и окружение для Postman
docs/                  место для YAML-описаний Swagger (если нужны)
```

## Как устроен ответ API

Успех:

```json
{ "items": [], "total": 0 }
```

Ошибка (одинаково для всех эндпоинтов):

```json
{ "message": "Изделие «...» не найдено" }
```

Коды: `200` успех, `201` создано, `400` ошибка валидации, `401` нет токена,
`403` нет прав, `404` не найдено, `409` конфликт (занятый e-mail, повтор
в избранном), `500` внутренняя ошибка.

## База данных PostgreSQL / Supabase (основной вариант)

Для проекта по методическим указаниям используйте облачную базу Supabase:
**создайте проект**, скопируйте строку из **Connect → ORMs → Prisma** в
`DATABASE_URL` файла `.env`, затем в Supabase → **SQL Editor** выполните
`sql-postgres/00_create_all_simple.sql` один раз. После этого:

```powershell
npm run prisma:generate
npm run db:check
npm run dev
```

### Docker для backend + Supabase

В папке `backend` лежат `Dockerfile`, `.dockerignore` и `docker-compose.yml`.
Compose запускает **контейнер API**; база остаётся в Supabase, локальный PostgreSQL
контейнер не запускается. Сначала заполните `backend/.env` строкой `DATABASE_URL`
из Supabase и один раз создайте таблицы через `sql-postgres/00_create_all_simple.sql`
(см. `../docs/ШАГ-5b_База_данных_Supabase.md`). Затем из папки `backend`:

```powershell
docker compose config
docker compose up --build -d
docker compose ps
docker compose logs -f api
```

API: `http://localhost:4000/api/health`; Swagger: `http://localhost:4000/api-docs`.
Остановка: `docker compose down`. Dockerfile сам устанавливает пакеты по
`package-lock.json`, генерирует Prisma Client и собирает API. `.dockerignore` не
передаёт файл `.env` в Docker-образ; Compose подаёт переменные контейнеру во время
запуска.

Те же Docker-команды без Compose:

```powershell
docker build -t noir-bijoux-backend .
docker run --name noir-bijoux-api -p 4000:4000 --env-file .env -v noir-bijoux-uploads:/app/uploads -d noir-bijoux-backend
docker ps
docker logs -f noir-bijoux-api
```

В полном репозитории корневой `../docker-compose.yml` дополнительно запускает
фронтенд вместе с backend. Старый `docker-compose.databases.yml` оставлен как
необязательная конфигурация локальных PostgreSQL/MSSQL баз; для Supabase он не нужен.
Для тестов и локального запуска без Docker: `npm ci` в папке `backend`.

### GitHub Actions и GHCR

Для backend-репозитория workflow находится в `.github/workflows/build.yml`: push и Pull Request
в `main` запускают проверки; успешный push в `main` дополнительно собирает Docker-образ и
публикует его в GitHub Container Registry (GHCR) с тегами `latest` и SHA коммита.
Для всего monorepo аналогичная конфигурация лежит в корневой папке
`../.github/workflows/backend-ci.yml`; используйте только workflow, который соответствует
корню вашего GitHub-репозитория. Тесты CI не требуют Supabase-пароля.

## MSSQL (архивный альтернативный вариант)

Файлы T-SQL сохранены в `sql/`, но основная схема и Prisma настроены на PostgreSQL.
Не выполняйте MSSQL-скрипты в Supabase.

Схема PostgreSQL для отчёта: `../docs/схема-базы-данных.svg`.

## Проверка API без запущенной базы

В папке `tests/` лежит in-memory заглушка Prisma Client (`fake-prisma.js`) —
она повторяет все методы, которые использует приложение. Благодаря ей можно
проверить маршруты, валидацию, JWT и бизнес-логику ещё до шага 5:

```bash
npm test
```

Подробное описание каждого файла — в `../docs/ШАГ-2_Инициализация_и_структура.md`,
полный код и разбор — в `../docs/ШАГ-4_Код_бэкенда.md`,
база данных PostgreSQL/Supabase — в `../docs/ШАГ-5b_База_данных_Supabase.md`.
