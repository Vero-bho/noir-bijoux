import type { ConstructorState } from "~/hooks/useConstructor";
import { formatPrice } from "~/lib/format";
import Button from "./ui/Button";
import ComponentCard from "./ComponentCard";

interface ConstructorPanelProps {
  state: ConstructorState;
}

export default function ConstructorPanel({ state }: ConstructorPanelProps) {
  const {
    tabs,
    activeSlot,
    setActiveSlot,
    activeComponents,
    isSelected,
    toggle,
    selected,
    total,
    article,
    canSave,
    addToCart,
    save,
    saved,
    missingSlots,
    clear,
  } = state;

  return (
    <div className="flex flex-col gap-5 rounded-2xl border border-brand-plum bg-brand-purple p-6">
      <div className="flex gap-2 overflow-x-auto border-b-2 border-brand-plum pb-1">
        {tabs.map((tab) => (
          <button
            key={tab.slot}
            type="button"
            onClick={() => setActiveSlot(tab.slot)}
            className={[
              "flex-1 whitespace-nowrap border-b-2 px-4 py-3 text-lg transition-colors",
              activeSlot === tab.slot
                ? "border-brand-mauve text-brand-white"
                : "border-transparent text-brand-mauve hover:text-brand-white",
            ].join(" ")}
          >
            {tab.title}
          </button>
        ))}
      </div>

      <div className="grid max-h-[430px] grid-cols-2 gap-4 overflow-y-auto pr-1">
        {activeComponents.map((component) => (
          <ComponentCard
            key={component.id}
            component={component}
            selected={isSelected(component)}
            onToggle={toggle}
          />
        ))}
      </div>

      <div className="border-t border-dashed border-brand-plum pt-5">
        {selected.length > 0 ? (
          <ul className="mb-4 space-y-1 text-base text-brand-mauve">
            {selected.map((component) => (
              <li key={component.id} className="flex justify-between gap-4">
                <span>{component.name}</span>
                <span className="whitespace-nowrap text-brand-white">{formatPrice(component.price)}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mb-4 text-base text-brand-mauve">
            Пока ничего не выбрано. Начните с вкладки «{tabs[0].title}».
          </p>
        )}

        <p className="mb-2 text-sm text-brand-mauve/80">Артикул сборки: {article}</p>

        <div className="mb-5 flex items-center justify-between text-2xl">
          <span>Итого:</span>
          <span>{formatPrice(total)}</span>
        </div>

        {missingSlots.length > 0 && (
          <p className="mb-4 text-sm text-brand-mauve/80">
            Не выбрано: {missingSlots.join(", ")}
          </p>
        )}

        <div className="space-y-3">
          <Button fullWidth onClick={addToCart} disabled={!canSave}>
            В корзину
          </Button>

          <div className="flex gap-3">
            <Button variant="outline" fullWidth onClick={save} disabled={!canSave}>
              {saved ? "Сохранено ✓" : "Сохранить в избранное"}
            </Button>
            <Button variant="ghost" onClick={clear} disabled={selected.length === 0}>
              Очистить
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
