export function formatPrice(value: number): string {
  const rounded = Math.round(value);
  return `${rounded.toString().replace(/\B(?=(\d{3})+(?!\d))/g, "\u00A0")}\u00A0₽`;
}

export function formatDate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "—";
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  return `${day}.${month}.${date.getFullYear()}`;
}

export function buildArticle(slug: string, componentIds: number[]): string {
  const typeCode: Record<string, string> = {
    necklace: "NK",
    bracelet: "BR",
    earrings: "ER",
    ring: "RG",
  };
  const code = typeCode[slug] ?? "XX";
  return ["NB", code, ...componentIds].join("-");
}

export const ORDER_STATUS_LABELS: Record<string, string> = {
  new: "Новый",
  confirmed: "Подтверждён",
  making: "В обработке",
  ready: "Готов к выдаче",
  done: "Выполнен",
  canceled: "Отменён",
};
