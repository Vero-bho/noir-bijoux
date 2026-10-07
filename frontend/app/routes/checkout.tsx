import type { Route } from "./+types/checkout";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router";

import Layout from "~/components/Layout";
import Button from "~/components/ui/Button";
import Input from "~/components/ui/Input";
import SectionTitle from "~/components/ui/SectionTitle";
import PickupModal from "~/components/modals/PickupModal";
import PvzModal from "~/components/modals/PvzModal";
import AddressModal from "~/components/modals/AddressModal";
import { useCart } from "~/hooks/useCart";
import { useOrders } from "~/hooks/useOrders";
import { formatPrice } from "~/lib/format";
import type { CheckoutFormValues, DeliveryType } from "~/types";

export function meta({}: Route.MetaArgs) {
  return [{ title: "Оформление заказа — Noir Bijoux" }];
}

const DELIVERY_TYPES: { value: DeliveryType; hint: string; cost: number }[] = [
  { value: "Самовывоз", hint: "Мастерская или шоурум, бесплатно", cost: 0 },
  { value: "Курьер", hint: "По городу, 400 ₽", cost: 400 },
  { value: "Пункт выдачи", hint: "СДЭК и Boxberry, 250 ₽", cost: 250 },
];

export default function CheckoutPage() {
  const { items, total, clearCart, showToast } = useCart();
  const { addOrder } = useOrders();
  const navigate = useNavigate();

  const [deliveryType, setDeliveryType] = useState<DeliveryType>("Самовывоз");
  const [deliveryPoint, setDeliveryPoint] = useState("");
  const [address, setAddress] = useState("");
  const [pickupOpen, setPickupOpen] = useState(false);
  const [pvzOpen, setPvzOpen] = useState(false);
  const [addressOpen, setAddressOpen] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CheckoutFormValues>({
    defaultValues: { customerName: "", phone: "", email: "", deliveryType: "Самовывоз", comment: "" },
  });

  const deliveryCost = DELIVERY_TYPES.find((row) => row.value === deliveryType)?.cost ?? 0;
  const grandTotal = total + (items.length > 0 ? deliveryCost : 0);

  const submit = (values: CheckoutFormValues) => {
    if (items.length === 0) return;

    if (deliveryType !== "Самовывоз" && !deliveryPoint && !address) {
      showToast("Выберите точку получения или введите адрес");
      return;
    }

    const order = addOrder({
      customerName: values.customerName,
      phone: values.phone,
      email: values.email,
      deliveryType,
      deliveryPoint: deliveryPoint || undefined,
      address: address || undefined,
      comment: values.comment,
      total: grandTotal,
      items: items.map((item) => ({
        key: item.key,
        title: item.name,
        price: item.price,
        quantity: item.quantity,
      })),
    });

    clearCart();
    showToast(`Заказ № ${order.orderNumber} оформлен`);
    navigate("/profile/history");
  };

  if (items.length === 0) {
    return (
      <Layout>
        <SectionTitle title="Оформление заказа" />
        <div className="rounded-2xl border border-dashed border-brand-plum p-12 text-center">
          <p className="text-2xl text-brand-mauve">В корзине нет товаров — оформлять пока нечего</p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Button to="/catalog">В каталог</Button>
            <Button to="/constructor" variant="outline">
              Собрать украшение
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <SectionTitle title="Оформление заказа" />

      <form className="grid gap-10 lg:grid-cols-[2fr_1fr]" onSubmit={handleSubmit(submit)}>
        <div className="space-y-8">
          {/* 1. Способ получения */}
          <section className="rounded-2xl border border-brand-plum bg-brand-purple/40 p-6">
            <h3 className="mb-5 text-2xl font-normal">1. Способ получения</h3>

            <div className="grid gap-3 sm:grid-cols-3">
              {DELIVERY_TYPES.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => {
                    setDeliveryType(option.value);
                    setDeliveryPoint("");
                    setAddress("");
                  }}
                  className={[
                    "rounded-xl border p-4 text-left transition-colors",
                    deliveryType === option.value
                      ? "border-brand-mauve bg-brand-plum"
                      : "border-brand-plum bg-brand-bg/40 hover:border-brand-mauve",
                  ].join(" ")}
                >
                  <span className="block text-xl text-brand-white">{option.value}</span>
                  <span className="block text-base text-brand-mauve">{option.hint}</span>
                </button>
              ))}
            </div>

            {deliveryType === "Самовывоз" && (
              <div className="mt-5 flex flex-wrap items-center gap-4">
                <Button type="button" variant="outline" onClick={() => setPickupOpen(true)}>
                  Выбрать точку самовывоза
                </Button>
                <span className="text-lg text-brand-mauve">
                  {deliveryPoint || "точка не выбрана — можно уточнить при подтверждении"}
                </span>
              </div>
            )}

            {deliveryType === "Пункт выдачи" && (
              <div className="mt-5 flex flex-wrap items-center gap-4">
                <Button type="button" variant="outline" onClick={() => setPvzOpen(true)}>
                  Выбрать пункт выдачи
                </Button>
                <span className="text-lg text-brand-mauve">{deliveryPoint || "ПВЗ не выбран"}</span>
              </div>
            )}

            {deliveryType === "Курьер" && (
              <div className="mt-5 flex flex-wrap items-center gap-4">
                <Button type="button" variant="outline" onClick={() => setAddressOpen(true)}>
                  Ввести адрес доставки
                </Button>
                <span className="text-lg text-brand-mauve">{address || "адрес не указан"}</span>
              </div>
            )}
          </section>

          {/* 2. Контактные данные */}
          <section className="rounded-2xl border border-brand-plum bg-brand-purple/40 p-6">
            <h3 className="mb-5 text-2xl font-normal">2. Контактные данные</h3>

            <div className="grid gap-5 sm:grid-cols-2">
              <Input
                label="Имя"
                placeholder="Имя"
                error={errors.customerName?.message}
                {...register("customerName", {
                  required: "Укажите имя",
                  minLength: { value: 2, message: "Слишком короткое имя" },
                })}
              />

              <Input
                label="Телефон"
                placeholder="+7 (999) 000-00-00"
                inputMode="tel"
                error={errors.phone?.message}
                {...register("phone", {
                  required: "Укажите телефон",
                  pattern: {
                    value: /^[\d+()\s-]{10,18}$/,
                    message: "Телефон в формате +7 (999) 000-00-00",
                  },
                })}
              />

              <Input
                label="E-mail"
                placeholder="mail@example.com"
                type="email"
                error={errors.email?.message}
                {...register("email", {
                  pattern: { value: /^\S+@\S+\.\S+$/, message: "Проверьте адрес почты" },
                })}
              />

              <Input label="Комментарий к заказу" placeholder="Необязательно" {...register("comment")} />
            </div>
          </section>

          <p className="text-brand-mauve">
            Нажимая «Подтвердить заказ», вы соглашаетесь с условиями обработки персональных данных.
            Оплата — при получении.
          </p>
        </div>

        {/* Итоги заказа */}
        <aside className="h-fit rounded-2xl border border-brand-plum bg-brand-purple p-6">
          <h3 className="mb-6 text-3xl font-normal">Ваш заказ</h3>

          <div className="space-y-3 border-b border-dashed border-brand-plum pb-5 text-lg">
            {items.map((item) => (
              <div key={item.key} className="flex justify-between gap-4">
                <span className="text-brand-mauve">
                  {item.name} × {item.quantity}
                </span>
                <span className="whitespace-nowrap">{formatPrice(item.price * item.quantity)}</span>
              </div>
            ))}

            <div className="flex justify-between gap-4">
              <span className="text-brand-mauve">Доставка ({deliveryType})</span>
              <span className="whitespace-nowrap">
                {deliveryCost === 0 ? "0 ₽" : formatPrice(deliveryCost)}
              </span>
            </div>
          </div>

          <div className="flex justify-between py-5 text-2xl">
            <span>К оплате:</span>
            <span>{formatPrice(grandTotal)}</span>
          </div>

          <Button type="submit" fullWidth size="lg">
            Подтвердить заказ
          </Button>

          <Link to="/cart" className="mt-4 block text-center text-lg text-brand-mauve hover:text-brand-white">
            ← Вернуться в корзину
          </Link>
        </aside>
      </form>

      <PickupModal isOpen={pickupOpen} onClose={() => setPickupOpen(false)} onSelect={setDeliveryPoint} />
      <PvzModal isOpen={pvzOpen} onClose={() => setPvzOpen(false)} onSelect={setDeliveryPoint} />
      <AddressModal
        isOpen={addressOpen}
        onClose={() => setAddressOpen(false)}
        onSave={setAddress}
        initialAddress={address}
      />
    </Layout>
  );
}
