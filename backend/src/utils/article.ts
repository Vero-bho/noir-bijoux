// ─────────────────────────────────────────────────────────────────────────────
// Артикул сборки — формируется из типа изделия и идентификаторов компонентов.
// Пример: NB-NK-1-3-6 (Noir Bijoux, колье, компоненты 1, 3 и 6).
// Такой же артикул формирует фронтенд (app/lib/format.ts), поэтому номера
// сборок в интерфейсе и в базе совпадают.
// ─────────────────────────────────────────────────────────────────────────────
const TYPE_CODES: Record<string, string> = {
  necklace: "NK",
  bracelet: "BR",
  earrings: "ER",
  ring: "RG",
};

export function buildArticle(jewelryType: string, componentIds: number[]): string {
  const code = TYPE_CODES[jewelryType] ?? "XX";
  const sorted = [...componentIds].sort((a, b) => a - b);
  return ["NB", code, ...sorted].join("-");
}
