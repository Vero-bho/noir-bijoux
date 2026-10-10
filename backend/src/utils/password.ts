// ─────────────────────────────────────────────────────────────────────────────
// Хеширование паролей (bcrypt). В базе хранится только хеш — открытый пароль
// не сохраняется никогда.
// ─────────────────────────────────────────────────────────────────────────────
import bcrypt from "bcryptjs";

const SALT_ROUNDS = 10;

export function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, SALT_ROUNDS);
}

export function comparePassword(plain: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}
