import type { Route } from "./+types/about";

import Layout from "~/components/Layout";
import Button from "~/components/ui/Button";
import { masterInfo } from "~/data/masterInfo";

export function meta({}: Route.MetaArgs) {
  return [{ title: "О мастере — Noir Bijoux" }];
}

export default function AboutPage() {
  return (
    <Layout>
      <div className="grid gap-10 lg:grid-cols-2">
        <div className="overflow-hidden rounded-3xl border border-brand-plum bg-brand-purple/40">
          <img src={masterInfo.photo} alt={`Мастер ${masterInfo.name}`} className="h-full w-full object-cover" />
        </div>

        <div>
          <h1 className="text-4xl md:text-5xl">{masterInfo.title}</h1>

          <p className="mt-6 text-lg text-brand-white/85">{masterInfo.text}</p>

          <blockquote className="mt-8 border-l-4 border-brand-mauve pl-6 text-xl italic text-brand-mauve">
            «{masterInfo.quote}»
          </blockquote>

          <p className="mt-6 text-3xl tracking-wide text-brand-mauve">{masterInfo.signature}</p>

          <div className="mt-8 grid grid-cols-3 gap-4">
            {masterInfo.stats.map((stat) => (
              <div key={stat.label} className="rounded-2xl border border-brand-plum bg-brand-purple/30 p-4 text-center">
                <p className="text-2xl text-brand-white">{stat.value}</p>
                <p className="text-sm text-brand-mauve">{stat.label}</p>
              </div>
            ))}
          </div>

          <div className="mt-8 flex flex-wrap gap-4">
            <Button size="lg" to="/constructor">
              Перейти в конструктор
            </Button>
            <Button size="lg" variant="outline" to="/catalog">
              Каталог изделий
            </Button>
          </div>
        </div>
      </div>
    </Layout>
  );
}
