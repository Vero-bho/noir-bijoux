// ─────────────────────────────────────────────────────────────────────────────
// Чтение и проверка переменных окружения из файла .env
// ─────────────────────────────────────────────────────────────────────────────
import "dotenv/config";

function required(name: string, fallback?: string): string {
  const value = process.env[name] ?? fallback;
  if (value === undefined || value === "") {
    throw new Error(
      `Не задана переменная окружения ${name}. Проверьте файл .env (образец — .env.example)`,
    );
  }
  return value;
}

export const env = {
  port: Number(process.env.PORT ?? 4000),

  // Строка подключения к PostgreSQL (облако Supabase):
  // postgresql://postgres.<ref>:<пароль>@aws-0-<регион>.pooler.supabase.com:5432/postgres?sslmode=require
  databaseUrl: required("DATABASE_URL"),

  // Адрес(а) фронтенда, которым разрешены запросы (CORS). Несколько — через запятую.
  corsOrigin: (process.env.CORS_ORIGIN ?? "http://localhost:5173").split(","),

  jwtSecret: required("JWT_SECRET", "noir-bijoux-dev-secret"),
  jwtExpiresIn: process.env.JWT_EXPIRES_IN ?? "7d",

  uploadDir: process.env.UPLOAD_DIR ?? "uploads",
  nodeEnv: process.env.NODE_ENV ?? "development",
};
