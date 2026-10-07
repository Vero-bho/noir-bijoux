import type { Route } from "./+types/product.$slug";
import { Link, useParams } from "react-router";

import Layout from "~/components/Layout";
import Button from "~/components/ui/Button";
import { getProductBySlug } from "~/data/catalog";
import { useCart } from "~/hooks/useCart";
import { formatPrice } from "~/lib/format";

export function meta({ params }: Route.MetaArgs) {
  const product = getProductBySlug(params.slug ?? "");
  return [{ title: product ? `${product.name} — Noir Bijoux` : "Изделие не найдено" }];
}

export default function ProductPage() {
  const { slug } = useParams();
  const { addItem } = useCart();
  const product = getProductBySlug(slug ?? "");

  if (!product) {
    return (
      <Layout>
        <h1 className="text-4xl text-brand-mauve">Изделие не найдено</h1>
        <p className="mt-4 text-xl text-brand-mauve/80">
          Возможно, оно было переименовано. Вернитесь в каталог.
        </p>
        <div className="mt-8">
          <Button to="/catalog">В каталог</Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <Link to="/catalog" className="text-lg text-brand-mauve hover:text-brand-white">
        ← Назад в каталог
      </Link>

      <div className="mt-6 grid gap-10 lg:grid-cols-2">
        <img
          src={product.image}
          alt={product.name}
          className="w-full rounded-3xl border border-brand-plum bg-brand-purple/40 object-cover"
        />

        <div>
          <h1 className="text-4xl md:text-5xl">{product.name}</h1>
          <p className="mt-3 text-xl text-brand-mauve">
            {product.type} · {product.material}
          </p>
          <p className="mt-6 text-4xl text-brand-mauve">{formatPrice(product.price)}</p>

          <p className="mt-6 text-lg text-brand-white/80">{product.description}</p>

          <div className="mt-8 flex flex-wrap gap-4">
            <Button
              size="lg"
              onClick={() =>
                addItem({
                  key: `product-${product.id}`,
                  kind: "product",
                  id: product.id,
                  name: product.name,
                  price: product.price,
                  image: product.image,
                })
              }
            >
              В корзину
            </Button>
            <Button variant="outline" size="lg" to={`/constructor/${product.typeSlug}`}>
              Собрать похожее в конструкторе
            </Button>
          </div>

          <ul className="mt-8 space-y-2 text-lg text-brand-mauve">
            <li>• Гипоаллергенные материалы и фурнитура</li>
            <li>• Ручная сборка, срок изготовления 2–5 дней</li>
            <li>• Самовывоз, курьер или пункт выдачи</li>
          </ul>
        </div>
      </div>
    </Layout>
  );
}
