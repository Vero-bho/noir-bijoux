const RAW_BASE = (import.meta.env.VITE_API_URL as string | undefined) ?? "http://localhost:4000/api";

export const API_BASE = RAW_BASE.replace(/\/$/, "");

async function request<T>(path: string, init?: RequestInit, timeoutMs = 2500): Promise<T> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(`${API_BASE}${path}`, {
      headers: { "Content-Type": "application/json" },
      signal: controller.signal,
      ...init,
    });

    if (!response.ok) {
      throw new Error(`Запрос ${path} завершился со статусом ${response.status}`);
    }

    return (await response.json()) as T;
  } finally {
    clearTimeout(timer);
  }
}

export const api = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body: unknown) =>
    request<T>(path, { method: "POST", body: JSON.stringify(body) }),
  patch: <T>(path: string, body: unknown) =>
    request<T>(path, { method: "PATCH", body: JSON.stringify(body) }),
  remove: <T>(path: string) => request<T>(path, { method: "DELETE" }),
};

export async function tryApi<T>(call: () => Promise<T>, fallback: T): Promise<{ data: T; online: boolean }> {
  try {
    const data = await call();
    return { data, online: true };
  } catch {
    return { data: fallback, online: false };
  }
}
