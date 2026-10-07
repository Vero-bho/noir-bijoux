import { Link } from "react-router";

import type { JewelrySlug } from "~/types";
import { useConstructor } from "~/hooks/useConstructor";
import Layout from "./Layout";
import ConstructorCanvas from "./ConstructorCanvas";
import ConstructorPanel from "./ConstructorPanel";

interface ConstructorPageProps {
  slug: JewelrySlug;
}

export default function ConstructorPage({ slug }: ConstructorPageProps) {
  const state = useConstructor(slug);

  return (
    <Layout>
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-4xl font-normal md:text-5xl">Сборка: {state.title}</h1>
        <Link
          to="/constructor"
          className="rounded-xl border border-brand-plum px-5 py-2 text-lg text-brand-mauve transition-colors hover:border-brand-mauve hover:text-brand-white"
        >
          ← Выбрать другой тип
        </Link>
      </div>

      <div className="grid gap-8 lg:grid-cols-[2fr_1fr]">
        <ConstructorCanvas
          title={state.title}
          layers={state.layers}
          textOptions={state.textOptions}
        />
        <ConstructorPanel state={state} />
      </div>
    </Layout>
  );
}
