// Конфигурационный файл Prisma 7 (создаётся командой `npx prisma init --datasource-provider postgresql`).
// Здесь Prisma берёт путь к схеме, папку миграций и строку подключения к PostgreSQL (Supabase).
import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "src/prisma/schema/schema.prisma",
  migrations: {
    path: "src/prisma/migrations",
  },
  datasource: {
    url: process.env["DATABASE_URL"],
  },
});
