import { useState } from "react";

import type { Order } from "~/types";
import { ORDER_STATUS_LABELS, formatDate, formatPrice } from "~/lib/format";

interface OrderCardProps {
  order: Order;
}

export default function OrderCard({ order }: OrderCardProps) {
  const [open, setOpen] = useState(false);

  return (
    <article className="rounded-2xl border border-brand-plum bg-brand-purple/40 p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h4 className="mb-2 text-2xl font-normal text-brand-white">Заказ № {order.orderNumber}</h4>
          <p className="text-lg text-brand-mauve">Дата: {formatDate(order.createdAt)}</p>
          <p className="text-lg text-brand-mauve">Сумма: {formatPrice(order.total)}</p>
          <p className="text-lg text-brand-mauve">Получение: {order.deliveryType}</p>
          {order.deliveryPoint && <p className="text-brand-mauve">{order.deliveryPoint}</p>}
        </div>

        <div className="text-right">
          <span className="mb-4 inline-block rounded-full border border-brand-mauve px-4 py-1 text-brand-mauve">
            {ORDER_STATUS_LABELS[order.status] ?? order.status}
          </span>
          <br />
          <button
            type="button"
            onClick={() => setOpen((prev) => !prev)}
            className="rounded-xl border border-brand-mauve px-4 py-2 text-lg text-brand-mauve transition-colors hover:bg-brand-mauve hover:text-brand-bg"
          >
            {open ? "Скрыть детали" : "Детали заказа"}
          </button>
        </div>
      </div>

      {open && (
        <div className="mt-6 border-t border-dashed border-brand-plum pt-5">
          <p className="mb-3 text-lg text-brand-mauve">Состав заказа</p>
          <ul className="space-y-2">
            {order.items.map((item, index) => (
              <li key={`${item.key}-${index}`} className="flex justify-between gap-4 text-lg">
                <span>
                  {item.title} × {item.quantity}
                </span>
                <span className="text-brand-white">{formatPrice(item.price * item.quantity)}</span>
              </li>
            ))}
          </ul>

          <div className="mt-4 space-y-1 text-brand-mauve">
            <p>Получатель: {order.customerName}</p>
            <p>Телефон: {order.phone}</p>
            {order.email && <p>E-mail: {order.email}</p>}
            {order.address && <p>Адрес: {order.address}</p>}
            {order.comment && <p>Комментарий: {order.comment}</p>}
          </div>
        </div>
      )}
    </article>
  );
}
