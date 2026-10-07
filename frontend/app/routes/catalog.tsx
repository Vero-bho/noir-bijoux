import type { Route } from "./+types/catalog";

import Layout from "~/components/Layout";
import FilterPanel from "~/components/FilterPanel";
import ProductCard from "~/components/ProductCard";
import SectionTitle from "~/components/ui/SectionTitle";
import { catalogProducts } from "~/data/catalog";
import { useFilters } from "~/hooks/useFilters";

export function meta({}: Route.MetaArgs) {
  return [{ title: "Каталог изделий — Noir Bijoux" }];
}

export default function CatalogPage() {
  const filters = useFilters(catalogProducts);

  return (
    <Layout>
      <SectionTitle
        title="Каталог изделий"
        subtitle="Готовые украшения ручной работы. Любое изделие можно повторить в конструкторе под свои параметры."
      />

      <div className="grid gap-10 lg:grid-cols-[320px_1fr]">
        <FilterPanel
          selectedTypes={filters.types}
          selectedMaterials={filters.materials}
          availableMaterials={filters.availableMaterials}
          maxPrice={filters.maxPrice}
          sort={filters.sort}
          hasActiveFilters={filters.hasActiveFilters}
          onToggleType={filters.toggleType}
          onToggleMaterial={filters.toggleMaterial}
          onMaxPriceChange={filters.setMaxPrice}
          onSortChange={filters.setSort}
          onReset={filters.reset}
        />

        <div>
          <p className="mb-6 text-lg text-brand-mauve">
            Найдено изделий: <span className="text-brand-white">{filters.filtered.length}</span> из{" "}
            {catalogProducts.length}
          </p>

          {filters.filtered.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-brand-plum p-10 text-center">
              <p className="text-2xl text-brand-mauve">По выбранным фильтрам товаров пока нет</p>
              <button
                type="button"
                onClick={filters.reset}
                className="mt-6 rounded-xl border border-brand-mauve px-6 py-3 text-lg text-brand-mauve transition-colors hover:bg-brand-mauve hover:text-brand-bg"
              >
                Сбросить фильтры
              </button>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {filters.filtered.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
