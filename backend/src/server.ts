// ─────────────────────────────────────────────────────────────────────────────
// Точка входа сервера (файл, который запускается командой `npm run dev`
// или `npm start` после сборки).
// ─────────────────────────────────────────────────────────────────────────────
import "dotenv/config";
import { createApp } from "./app";
import { env } from "./config/env";

const app = createApp();

// Явно слушаем 0.0.0.0, чтобы порт был доступен с хоста через Docker.
app.listen(env.port, "0.0.0.0", () => {
  console.log(`\n  Noir Bijoux API запущен`);
  console.log(`  API:      http://localhost:${env.port}/api/health`);
  console.log(`  Swagger:  http://localhost:${env.port}/api-docs\n`);
});
