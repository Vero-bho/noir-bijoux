import type { Order, SavedBuild } from "~/types";

export const demoOrders: Order[] = [
  {
    id: 1,
    orderNumber: "1024",
    createdAt: "2026-09-15T10:00:00.000Z",
    customerName: "Ольга",
    phone: "+7 (999) 000-00-00",
    email: "olga@mail.com",
    deliveryType: "Самовывоз",
    deliveryPoint: "Мастерская Noir Bijoux, ул. Дуси Ковальчук, 67",
    total: 4500,
    status: "making",
    items: [{ key: "product-1", title: "Колье «Ночная Роза»", price: 4500, quantity: 1 }],
  },
  {
    id: 2,
    orderNumber: "1031",
    createdAt: "2026-09-28T10:00:00.000Z",
    customerName: "Ольга",
    phone: "+7 (999) 000-00-00",
    deliveryType: "Пункт выдачи",
    deliveryPoint: "ПВЗ СДЭК, ул. Ленина, 12",
    total: 3700,
    status: "done",
    items: [
      { key: "build-NB-BR-11-14-16", title: "Браслет", price: 2400, quantity: 1 },
      { key: "product-6", title: "Серьги «Абсолют»", price: 1300, quantity: 1 },
    ],
  },
];

export const demoBuilds: SavedBuild[] = [
  {
    id: "build-demo-1",
    article: "NB-NK-2-5-6",
    jewelryType: "necklace",
    jewelryTitle: "Колье",
    totalPrice: 3200,
    createdAt: "2026-09-20T10:00:00.000Z",
    components: [
      { name: "Бархатный чокер", price: 900, slot: "chain", layerZ: 1 },
      { name: "Подвеска «Крест»", price: 2000, slot: "pendant", layerZ: 5 },
      { name: "Карабин", price: 300, slot: "clasp", layerZ: 8 },
    ],
  },
];
