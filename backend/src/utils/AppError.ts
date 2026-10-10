// ─────────────────────────────────────────────────────────────────────────────
// Кастомный класс ошибок: позволяет из любого места приложения «бросить»
// ошибку с нужным HTTP-статусом, например: throw new AppError(404, "...")
// ─────────────────────────────────────────────────────────────────────────────
export class AppError extends Error {
  public readonly statusCode: number;

  constructor(statusCode: number, message: string) {
    super(message);
    this.statusCode = statusCode;
    this.name = "AppError";
  }
}
