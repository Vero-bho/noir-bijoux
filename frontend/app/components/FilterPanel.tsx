import type { JewelryType } from "~/types";
import { productTypes } from "~/data/catalog";
import type { SortValue } from "~/hooks/useFilters";
import { SORT_OPTIONS } from "~/hooks/useFilters";

interface FilterPanelProps {
  selectedTypes: JewelryType[];
  selectedMaterials: string[];
  availableMaterials: string[];
  maxPrice: number;
  sort: SortValue;
  hasActiveFilters: boolean;
  onToggleType: (type: JewelryType) => void;
  onToggleMaterial: (material: string) => void;
  onMaxPriceChange: (value: number) => void;
  onSortChange: (value: SortValue) => void;
  onReset: () => void;
}

export default function FilterPanel({
  selectedTypes,
  selectedMaterials,
  availableMaterials,
  maxPrice,
  sort,
  hasActiveFilters,
  onToggleType,
  onToggleMaterial,
  onMaxPriceChange,
  onSortChange,
  onReset,
}: FilterPanelProps) {
  return (
    <aside className="h-fit rounded-2xl border border-brand-plum bg-brand-purple p-6">
      <div className="mb-6 border-b border-dashed border-brand-plum pb-6">
        <h4 className="mb-4 text-2xl font-normal text-brand-mauve">Тип изделия</h4>
        {productTypes.map((type) => (
          <label key={type} className="mb-3 flex cursor-pointer items-center gap-3 text-lg">
            <input
              type="checkbox"
              className="h-5 w-5 accent-[#B8A3B8]"
              checked={selectedTypes.includes(type)}
              onChange={() => onToggleType(type)}
            />
            {type}
          </label>
        ))}
      </div>

      <div className="mb-6 border-b border-dashed border-brand-plum pb-6">
        <h4 className="mb-4 text-2xl font-normal text-brand-mauve">Материал</h4>
        {availableMaterials.map((material) => (
          <label key={material} className="mb-3 flex cursor-pointer items-center gap-3 text-lg">
            <input
              type="checkbox"
              className="h-5 w-5 accent-[#B8A3B8]"
              checked={selectedMaterials.includes(material)}
              onChange={() => onToggleMaterial(material)}
            />
            {material}
          </label>
        ))}
      </div>

      <div className="mb-6 border-b border-dashed border-brand-plum pb-6">
        <h4 className="mb-4 text-2xl font-normal text-brand-mauve">Цена до</h4>
        <input
          type="range"
          min={1000}
          max={6000}
          step={100}
          value={maxPrice}
          onChange={(event) => onMaxPriceChange(Number(event.target.value))}
          className="w-full accent-[#B8A3B8]"
        />
        <p className="mt-2 text-lg text-brand-white">{maxPrice} ₽</p>
      </div>

      <div className="mb-6">
        <h4 className="mb-4 text-2xl font-normal text-brand-mauve">Сортировка</h4>
        <select
          value={sort}
          onChange={(event) => onSortChange(event.target.value as SortValue)}
          className="w-full rounded-xl border border-brand-plum bg-brand-bg px-4 py-3 text-lg text-brand-white focus:border-brand-mauve focus:outline-none"
        >
          {SORT_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      <button
        type="button"
        onClick={onReset}
        disabled={!hasActiveFilters}
        className="w-full rounded-xl border border-brand-mauve px-4 py-3 text-lg text-brand-mauve transition-colors hover:bg-brand-mauve hover:text-brand-bg disabled:opacity-40"
      >
        Сбросить фильтры
      </button>
    </aside>
  );
}
