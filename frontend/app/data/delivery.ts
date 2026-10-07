import type { DeliveryPoint } from "~/types";

export const deliveryPoints: DeliveryPoint[] = [
  {
    id: 1,
    kind: "pickup",
    provider: "Мастерская Noir Bijoux",
    city: "Новосибирск",
    address: "ул. Дуси Ковальчук, 250, 2 этаж, офис 12",
    workHours: "Пн–Пт 10:00–19:00, Сб 11:00–16:00",
    phone: "+7 (383) 000-00-01",
  },
  {
    id: 2,
    kind: "pickup",
    provider: "Шоурум «Aesthetics»",
    city: "Новосибирск",
    address: "Красный проспект, 100, 1 этаж",
    workHours: "Ежедневно 10:00–20:00",
    phone: "+7 (383) 000-00-02",
  },
  {
    id: 3,
    kind: "pvz",
    provider: "ПВЗ СДЭК",
    city: "Новосибирск",
    address: "ул. Ленина, 12",
    workHours: "Пн–Сб 10:00–20:00",
  },
  {
    id: 4,
    kind: "pvz",
    provider: "ПВЗ Boxberry",
    city: "Новосибирск",
    address: "ул. Гоголя, 15",
    workHours: "Пн–Пт 09:00–19:00",
  },
  {
    id: 5,
    kind: "pvz",
    provider: "ПВЗ СДЭК",
    city: "Бердск",
    address: "ул. Первомайская, 8",
    workHours: "Пн–Сб 10:00–19:00",
  },
];

export function getDeliveryPoints(kind: DeliveryPoint["kind"]): DeliveryPoint[] {
  return deliveryPoints.filter((point) => point.kind === kind);
}
