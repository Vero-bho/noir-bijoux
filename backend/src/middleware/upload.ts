// ─────────────────────────────────────────────────────────────────────────────
// Загрузка файлов (multer) — используется для аватара пользователя.
// Файлы сохраняются в папку UPLOAD_DIR/uploads/avatars и отдаются статикой
// по адресу /uploads/... (см. app.ts).
// ─────────────────────────────────────────────────────────────────────────────
import fs from "node:fs";
import path from "node:path";
import multer from "multer";

import { env } from "../config/env";
import { AppError } from "../utils/AppError";

const AVATAR_DIR = path.join(env.uploadDir, "avatars");
fs.mkdirSync(AVATAR_DIR, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, callback) => callback(null, AVATAR_DIR),
  filename: (req, file, callback) => {
    const userId = (req as any).user?.id ?? "guest";
    const ext = path.extname(file.originalname).toLowerCase() || ".png";
    callback(null, `avatar-${userId}-${Date.now()}${ext}`);
  },
});

const ALLOWED = ["image/jpeg", "image/png", "image/webp", "image/gif"];

export const uploadAvatar = multer({
  storage,
  limits: { fileSize: 3 * 1024 * 1024 }, // 3 МБ — как в модальном окне на фронтенде
  fileFilter: (_req, file, callback) => {
    if (!ALLOWED.includes(file.mimetype)) {
      return callback(new AppError(400, "Недопустимый формат файла: загрузите JPG, PNG, WEBP или GIF"));
    }
    callback(null, true);
  },
}).single("avatar");
