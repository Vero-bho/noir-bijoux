import type { Route } from "./+types/constructor";
import { Link } from "react-router";

import Layout from "~/components/Layout";
import SectionTitle from "~/components/ui/SectionTitle";
import { jewelryTypes } from "~/data/catalog";

export function meta({}: Route.MetaArgs) {
  return [{ title: "Конструктор украшений — Noir Bijoux" }];
}

export default function ConstructorStartPage() {
  return (
    <Layout>
      <SectionTitle
        title="С чего начнем творить?"
        subtitle="Выберите тип изделия, чтобы перейти к визуальной сборке"
      />

      <div className="grid gap-8 sm:grid-cols-2 xl:grid-cols-4">
        {jewelryTypes.map((type) => (
          <Link
            key={type.slug}
            to={`/constructor/${type.slug}`}
            className="group flex flex-col overflow-hidden rounded-2xl border border-brand-plum bg-brand-purple/40 p-6 transition-colors hover:border-brand-mauve"
          >
            <span className="mb-4 text-6xl leading-none text-brand-mauve">{type.icon}</span>
            <h2 className="text-3xl">{type.type}</h2>
            <p className="mt-3 flex-1 text-lg text-brand-mauve">{type.description}</p>

            <span className="mt-6 overflow-hidden rounded-xl border border-brand-plum">
              <img
                src={type.image}
                alt={type.type}
                className="h-40 w-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
            </span>

            <span className="mt-6 text-lg text-brand-white group-hover:text-brand-mauve">
              Начать сборку →
            </span>
          </Link>
        ))}
      </div>
    </Layout>
  );
}
