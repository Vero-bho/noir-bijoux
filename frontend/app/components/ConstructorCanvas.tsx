import type { JewelryComponent } from "~/types";

interface ConstructorCanvasProps {
  title: string;
  layers: JewelryComponent[];
  textOptions: JewelryComponent[];
}

export default function ConstructorCanvas({ title, layers, textOptions }: ConstructorCanvasProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-brand-plum bg-brand-purple/40 p-8">
      <div className="relative aspect-square w-full max-w-[480px]">
        {layers.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center rounded-3xl border-2 border-dashed border-brand-mauve/70 p-8 text-center text-xl text-brand-mauve">
            Эскиз «{title}»
            <br />
            выберите компоненты справа
          </div>
        )}

        {layers.map((component) => (
          <img
            key={component.id}
            src={component.image}
            alt={component.name}
            className="absolute inset-0 h-full w-full object-contain"
            style={{ zIndex: component.layerZ }}
          />
        ))}
      </div>

      {textOptions.length > 0 && (
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          {textOptions.map((option) => (
            <span
              key={option.id}
              className="rounded-full border border-brand-plum px-4 py-1 text-base text-brand-mauve"
            >
              {option.name}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
