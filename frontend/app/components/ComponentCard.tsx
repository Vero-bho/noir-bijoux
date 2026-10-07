import type { JewelryComponent } from "~/types";
import { formatPrice } from "~/lib/format";

interface ComponentCardProps {
  component: JewelryComponent;
  selected: boolean;
  onToggle: (component: JewelryComponent) => void;
}

export default function ComponentCard({ component, selected, onToggle }: ComponentCardProps) {
  return (
    <button
      type="button"
      onClick={() => onToggle(component)}
      aria-pressed={selected}
      className={[
        "rounded-xl border p-3 text-left transition-colors",
        selected
          ? "border-brand-mauve bg-brand-plum"
          : "border-brand-plum bg-brand-bg hover:border-brand-mauve",
      ].join(" ")}
    >
      <div className="mb-2 flex h-24 items-center justify-center overflow-hidden rounded-lg bg-brand-bg/70">
        {component.image ? (
          <img src={component.image} alt={component.name} className="h-full w-full object-contain" />
        ) : (
          <span className="text-center text-base text-brand-mauve">{component.name.split(" ")[0]}</span>
        )}
      </div>

      <p className="text-base leading-snug text-brand-white">{component.name}</p>
      <p className="mt-1 text-base text-brand-mauve">{formatPrice(component.price)}</p>
      {selected && <p className="mt-1 text-sm text-brand-mauve">✓ выбрано</p>}
    </button>
  );
}
