import type { Route } from "./+types/cart";
import { Link } from "react-router";

import Layout from "~/components/Layout";
import CartItemRow from "~/components/CartItemRow";
import Button from "~/components/ui/Button";
import SectionTitle from "~/components/ui/SectionTitle";
import { useCart } from "~/hooks/useCart";
import { formatPrice } from "~/lib/format";

export function meta({}: Route.MetaArgs) {
  return [{ title: "Корзина — Noir Bijoux" }];
}

export default function CartPage() {
  const { items, total, count, updateQuantity, removeItem, clearCart } = useCart();

  return (
    <Layout>
      <SectionTitle title="Корзина" subtitle={`Позиций в корзине: ${count}`} />

      {items.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-brand-plum p-12 text-center">
          <p className="text-2xl text-brand-mauve">Корзина пока пуста</p>
          <p className="mt-3 text-lg text-brand-mauve/80">
            Добавьте готовое изделие из каталога или соберите своё в конструкторе.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Button to="/catalog">В каталог</Button>
            <Button to="/constructor" variant="outline">
              В конструктор
            </Button>
          </div>
        </div>
      ) : (
        <div className="grid gap-8 lg:grid-cols-[2fr_1fr]">
          <div className="space-y-5">
            {items.map((item) => (
              <CartItemRow
                key={item.key}
                item={item}
                onQuantityChange={updateQuantity}
                onRemove={removeItem}
              />
            ))}

            <button
              type="button"
              onClick={clearCart}
              className="text-lg text-brand-mauve/80 underline-offset-4 hover:text-red-300 hover:underline"
            >
              Очистить корзину
            </button>
          </div>

          <aside className="h-fit rounded-2xl border border-brand-plum bg-brand-purple p-6">
            <h2 className="mb-6 text-3xl font-normal">Ваш заказ</h2>

            <div className="space-y-3 border-b border-dashed border-brand-plum pb-5 text-lg">
              {items.map((item) => (
                <div key={item.key} className="flex justify-between gap-4">
                  <span className="text-brand-mauve">
                    {item.name} × {item.quantity}
                  </span>
                  <span className="whitespace-nowrap">{formatPrice(item.price * item.quantity)}</span>
                </div>
              ))}
            </div>

            <div className="flex justify-between py-5 text-2xl">
              <span>Итого:</span>
              <span>{formatPrice(total)}</span>
            </div>

            <Button to="/checkout" fullWidth size="lg">
              Оформить заказ
            </Button>

            <Link
              to="/catalog"
              className="mt-4 block text-center text-lg text-brand-mauve hover:text-brand-white"
            >
              ← Продолжить покупки
            </Link>
          </aside>
        </div>
      )}
    </Layout>
  );
}
