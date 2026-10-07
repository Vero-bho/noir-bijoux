import type { Route } from "./+types/not-found";

import Layout from "~/components/Layout";
import Button from "~/components/ui/Button";

export function meta({}: Route.MetaArgs) {
  return [{ title: "Страница не найдена — Noir Bijoux" }];
}

export default function NotFoundPage() {
  return (
    <Layout>
      <div className="rounded-3xl border border-brand-plum bg-brand-purple/40 p-16 text-center">
        <p className="text-8xl text-brand-mauve">404</p>
        <h1 className="mt-6 text-4xl">Такой страницы нет</h1>
        <p className="mt-4 text-xl text-brand-mauve">
          Возможно, ссылка устарела. Начните с каталога или конструктора.
        </p>
        <div className="mt-10 flex flex-wrap justify-center gap-4">
          <Button to="/">На главную</Button>
          <Button to="/catalog" variant="outline">
            В каталог
          </Button>
        </div>
      </div>
    </Layout>
  );
}
