import type { Route } from "./+types/profile.favorites";

import Layout from "~/components/Layout";
import ProfileSidebar from "~/components/ProfileSidebar";
import Button from "~/components/ui/Button";
import SectionTitle from "~/components/ui/SectionTitle";
import { useBuilds } from "~/hooks/useBuilds";
import { useCart } from "~/hooks/useCart";
import { formatDate, formatPrice } from "~/lib/format";

export function meta({}: Route.MetaArgs) {
  return [{ title: "Избранные сборки — Noir Bijoux" }];
}

export default function ProfileFavoritesPage() {
  const { builds, removeBuild, toCartItem } = useBuilds();
  const { addItem } = useCart();

  return (
    <Layout>
      <SectionTitle title="Личный кабинет" />

      <div className="grid gap-8 lg:grid-cols-[280px_1fr]">
        <ProfileSidebar />

        <div className="space-y-6">
          {builds.length === 0 && (
            <div className="rounded-2xl border border-dashed border-brand-plum p-10 text-center">
              <p className="text-2xl text-brand-mauve">Сохранённых сборок пока нет</p>
              <p className="mt-3 text-lg text-brand-mauve/80">
                Соберите украшение в конструкторе и нажмите «Сохранить в избранное».
              </p>
              <div className="mt-8">
                <Button to="/constructor">Открыть конструктор</Button>
              </div>
            </div>
          )}

          {builds.map((build) => (
            <article
              key={build.id}
              className="flex flex-col gap-6 rounded-2xl border border-brand-plum bg-brand-purple/40 p-6 lg:flex-row"
            >
              <div className="relative h-40 w-full shrink-0 overflow-hidden rounded-xl border border-brand-plum bg-brand-bg/60 lg:h-44 lg:w-44">
                {build.components
                  .filter((component) => component.image)
                  .map((component) => (
                    <img
                      key={component.name}
                      src={component.image}
                      alt={component.name}
                      className="absolute inset-0 h-full w-full object-contain"
                      style={{ zIndex: component.layerZ }}
                    />
                  ))}
              </div>

              <div className="flex flex-1 flex-col">
                <h3 className="text-2xl font-normal">
                  {build.jewelryTitle} · {build.article}
                </h3>
                <p className="mt-1 text-brand-mauve">Сохранено {formatDate(build.createdAt)}</p>

                <ul className="mt-4 space-y-1 text-lg text-brand-mauve">
                  {build.components.map((component) => (
                    <li key={component.name} className="flex justify-between gap-4">
                      <span>{component.name}</span>
                      <span className="text-brand-white">{formatPrice(component.price)}</span>
                    </li>
                  ))}
                </ul>

                <p className="mt-5 text-3xl text-brand-mauve">{formatPrice(build.totalPrice)}</p>

                <div className="mt-5 flex flex-wrap gap-3">
                  <Button onClick={() => addItem(toCartItem(build))}>В корзину</Button>
                  <Button variant="outline" to={`/constructor/${build.jewelryType}`}>
                    Изменить
                  </Button>
                  <Button variant="ghost" onClick={() => removeBuild(build.id)}>
                    Удалить
                  </Button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </Layout>
  );
}
