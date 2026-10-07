import type { CartItem } from "~/types";
import { formatPrice } from "~/lib/format";

interface CartItemRowProps {
  item: CartItem;
  onQuantityChange: (key: string, quantity: number) => void;
  onRemove: (key: string) => void;
}

export default function CartItemRow({ item, onQuantityChange, onRemove }: CartItemRowProps) {
  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-brand-plum bg-brand-purple/40 p-5 sm:flex-row sm:items-center">
      <div className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-brand-bg/60">
        {item.image ? (
          <img src={item.image} alt={item.name} className="h-full w-full object-contain" />
        ) : (
          <span className="text-3xl text-brand-mauve">𝒩</span>
        )}
      </div>

      <div className="flex-1">
        <p className="text-xl text-brand-white">{item.name}</p>
        <p className="text-brand-mauve">
          {item.kind === "build" ? "Авторская сборка" : "Готовое изделие"} ·{" "}
          {formatPrice(item.price)}
        </p>
        {item.article && <p className="text-sm text-brand-mauve/80">Артикул: {item.article}</p>}
      </div>

      <div className="flex items-center gap-3">
        <button
          type="button"
          aria-label="Уменьшить количество"
          onClick={() => onQuantityChange(item.key, item.quantity - 1)}
          className="h-10 w-10 rounded-lg border border-brand-plum text-xl text-brand-mauve hover:border-brand-mauve hover:text-brand-white"
        >
          −
        </button>
        <span className="w-8 text-center text-xl">{item.quantity}</span>
        <button
          type="button"
          aria-label="Увеличить количество"
          onClick={() => onQuantityChange(item.key, item.quantity + 1)}
          className="h-10 w-10 rounded-lg border border-brand-plum text-xl text-brand-mauve hover:border-brand-mauve hover:text-brand-white"
        >
          +
        </button>
      </div>

      <div className="text-right sm:w-32">
        <p className="text-xl text-brand-white">{formatPrice(item.price * item.quantity)}</p>
        <button
          type="button"
          onClick={() => onRemove(item.key)}
          className="mt-1 text-sm text-brand-mauve/80 hover:text-red-300"
        >
          Удалить
        </button>
      </div>
    </div>
  );
}
