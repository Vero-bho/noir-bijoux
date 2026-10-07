import type { Route } from "./+types/home";
import { Link } from "react-router";

import Layout from "~/components/Layout";
import ProductCard from "~/components/ProductCard";
import Button from "~/components/ui/Button";
import SectionTitle from "~/components/ui/SectionTitle";
import { catalogProducts } from "~/data/catalog";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Noir Bijoux — авторская бижутерия ручной работы" },
    {
      name: "description",
      content:
        "Визуальный конструктор авторской бижутерии: соберите украшение из цепочек, подвесок и камней и закажите с доставкой.",
    },
  ];
}

const STEPS = [
  { title: "1. Выберите основу", text: "Колье, браслет, серьги или кольцо — начните с типа изделия." },
  { title: "2. Соберите изделие", text: "Добавляйте цепочки, подвески, камни и застёжки — эскиз обновляется сразу." },
  { title: "3. Оформите заказ", text: "Самовывоз, курьер или ПВЗ. Мастер приступит к работе в тот же день." },
];

export default function Home() {
  const popular = catalogProducts.slice(0, 3);

  return (
    <Layout>
      {/* Герой-блок */}
      <section className="grid items-center gap-10 rounded-3xl border border-brand-plum bg-brand-purple/40 p-8 md:grid-cols-2 md:p-14">
        <div>
          <p className="mb-4 text-7xl leading-none text-brand-mauve">𝒩</p>
          <h1 className="text-5xl leading-tight md:text-6xl">Noir Bijoux</h1>
          <p className="mt-4 text-2xl text-brand-mauve">
            Авторская бижутерия ручной работы: от идеи до готового украшения за 15 минут
          </p>
          <p className="mt-4 text-lg text-brand-white/80">
            Соберите своё украшение в онлайн-конструкторе: выбирайте цепочки, подвески, камни и фурнитуру —
            результат виден мгновенно, до оформления заказа.
          </p>

          <div className="mt-8 flex flex-wrap gap-4">
            <Button to="/catalog" size="lg">
              В каталог
            </Button>
            <Button to="/constructor" variant="outline" size="lg">
              Собрать украшение
            </Button>
          </div>
        </div>

        <div className="relative aspect-square overflow-hidden rounded-3xl border border-brand-plum">
          <img
            src={catalogProducts[0].image}
            alt="Колье «Ночная Роза»"
            className="h-full w-full object-cover"
          />
        </div>
      </section>

      {/* Как это работает */}
      <section className="mt-16">
        <SectionTitle as="h2" title="Как это работает" />
        <div className="grid gap-6 md:grid-cols-3">
          {STEPS.map((step) => (
            <div key={step.title} className="rounded-2xl border border-brand-plum bg-brand-purple/30 p-6">
              <p className="mb-3 text-2xl text-brand-white">{step.title}</p>
              <p className="text-lg text-brand-mauve">{step.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Популярные изделия */}
      <section className="mt-16">
        <SectionTitle as="h2" title="Популярные изделия">
          <Link to="/catalog" className="text-lg text-brand-mauve hover:text-brand-white">
            Смотреть весь каталог →
          </Link>
        </SectionTitle>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {popular.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* Призыв к конструктору */}
      <section className="mt-16 rounded-3xl border border-brand-plum bg-brand-plum/40 p-10 text-center">
        <h2 className="text-4xl">Не нашли подходящее?</h2>
        <p className="mx-auto mt-4 max-w-2xl text-xl text-brand-mauve">
          В конструкторе можно собрать украшение с нуля: выбрать основу, подвески, камни и фурнитуру —
          и увидеть результат до заказа.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-4">
          <Button to="/constructor" size="lg">
            Открыть конструктор
          </Button>
          <Button to="/about" variant="outline" size="lg">
            О мастере
          </Button>
        </div>
      </section>
    </Layout>
  );
}
