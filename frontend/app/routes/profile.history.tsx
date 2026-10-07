import type { Route } from "./+types/profile.history";
import { Link } from "react-router";

import Layout from "~/components/Layout";
import OrderCard from "~/components/OrderCard";
import ProfileSidebar from "~/components/ProfileSidebar";
import Button from "~/components/ui/Button";
import SectionTitle from "~/components/ui/SectionTitle";
import { useAuth } from "~/hooks/useAuth";
import { useOrders } from "~/hooks/useOrders";

export function meta({}: Route.MetaArgs) {
  return [{ title: "История заказов — Noir Bijoux" }];
}

export default function ProfileHistoryPage() {
  const { user } = useAuth();
  const { orders, ready } = useOrders();

  return (
    <Layout>
      <SectionTitle title="Личный кабинет" />

      {!user && (
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-brand-plum bg-brand-purple/40 p-6">
          <p className="text-lg text-brand-mauve">
            Вы не авторизованы — показаны демонстрационные заказы.{" "}
            <Link to="/login" className="text-brand-white hover:text-brand-mauve">
              Войти
            </Link>{" "}
            или{" "}
            <Link to="/register" className="text-brand-white hover:text-brand-mauve">
              зарегистрироваться
            </Link>
            .
          </p>
        </div>
      )}

      <div className="grid gap-8 lg:grid-cols-[280px_1fr]">
        <ProfileSidebar />

        <div className="space-y-6">
          {!ready && <p className="text-lg text-brand-mauve">Загружаем заказы…</p>}

          {ready && orders.length === 0 && (
            <div className="rounded-2xl border border-dashed border-brand-plum p-10 text-center">
              <p className="text-2xl text-brand-mauve">Заказов пока нет</p>
              <p className="mt-3 text-lg text-brand-mauve/80">
                Оформите первый заказ — он появится здесь вместе со статусом.
              </p>
              <div className="mt-8 flex flex-wrap justify-center gap-4">
                <Button to="/catalog">В каталог</Button>
                <Button to="/constructor" variant="outline">
                  В конструктор
                </Button>
              </div>
            </div>
          )}

          {orders.map((order) => (
            <OrderCard key={order.id} order={order} />
          ))}
        </div>
      </div>
    </Layout>
  );
}
