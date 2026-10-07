import { Link } from "react-router";

import type { CatalogProduct } from "~/types";
import { formatPrice } from "~/lib/format";
import { useCart } from "~/hooks/useCart";
import Button from "./ui/Button";

interface ProductCardProps {
  product: CatalogProduct;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addItem } = useCart();

  return (
    <article className="flex flex-col overflow-hidden rounded-2xl border border-brand-plum bg-brand-purple/40 transition-colors hover:border-brand-mauve">
      <Link to={`/product/${product.slug}`} className="block">
        <img src={product.image} alt={product.name} className="h-64 w-full object-cover" />
      </Link>

      <div className="flex flex-1 flex-col p-5">
        <div className="mb-3 flex items-start justify-between gap-4">
          <h3 className="text-2xl leading-tight text-brand-white">
            <Link to={`/product/${product.slug}`} className="hover:text-brand-mauve">
              {product.name}
            </Link>
          </h3>
          <span className="whitespace-nowrap text-xl text-brand-mauve">{formatPrice(product.price)}</span>
        </div>

        <p className="mb-5 text-brand-mauve">
          {product.type} · {product.material}
        </p>

        <div className="mt-auto space-y-3">
          <Button
            fullWidth
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
          <Button variant="outline" fullWidth to={`/product/${product.slug}`}>
            Подробнее
          </Button>
        </div>
      </div>
    </article>
  );
}
