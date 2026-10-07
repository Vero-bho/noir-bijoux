export type JewelryType = "Колье" | "Браслет" | "Серьги" | "Кольцо";

export type JewelrySlug = "necklace" | "bracelet" | "earrings" | "ring";

export type ComponentSlot =
  | "chain"
  | "pendant"
  | "clasp"
  | "length"
  | "beads"
  | "charm"
  | "stone"
  | "material"
  | "size"
  | "profile";

export interface SlotConfig {
  slot: ComponentSlot;
  title: string;
  multiple?: boolean;
}

export interface CatalogProduct {
  id: number;
  name: string;
  slug: string;
  type: JewelryType;
  typeSlug: JewelrySlug;
  material: string;
  price: number;
  image: string;
  description: string;
}

export interface JewelryComponent {
  id: number;
  name: string;
  slot: ComponentSlot;
  jewelryType: JewelrySlug;
  price: number;
  image?: string;
  layerZ: number;
}

export interface JewelryTypeInfo {
  type: JewelryType;
  slug: JewelrySlug;
  icon: string;
  description: string;
  image: string;
}

export interface SavedBuild {
  id: string;
  article: string;
  jewelryType: JewelrySlug;
  jewelryTitle: string;
  totalPrice: number;
  createdAt: string;
  components: Array<{ name: string; price: number; slot: ComponentSlot; image?: string; layerZ: number; }>;
}

export interface CartItem {
  key: string;
  kind: "product" | "build";
  id: number;
  name: string;
  price: number;
  quantity: number;
  image?: string;
  article?: string;
}

export type DeliveryType = "Самовывоз" | "Курьер" | "Пункт выдачи";

export interface DeliveryPoint {
  id: number;
  kind: "pickup" | "pvz";
  provider: string;
  city: string;
  address: string;
  workHours: string;
  phone?: string;
}

export type OrderStatus = "new" | "confirmed" | "making" | "ready" | "done" | "canceled";

export interface OrderItem {
  key: string;
  title: string;
  price: number;
  quantity: number;
}

export interface Order {
  id: number;
  orderNumber: string;
  createdAt: string;
  customerName: string;
  phone: string;
  email?: string;
  deliveryType: DeliveryType;
  deliveryPoint?: string;
  address?: string;
  comment?: string;
  total: number;
  status: OrderStatus;
  items: OrderItem[];
}

export interface User {
  id: number;
  fullName: string;
  email: string;
  phone?: string;
  avatarUrl?: string;
}

export interface CheckoutFormValues {
  customerName: string;
  phone: string;
  email?: string;
  deliveryType: DeliveryType;
  comment?: string;
}

export interface LoginFormValues {
  email: string;
  password: string;
}

export interface RegisterFormValues {
  fullName: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
}

export interface AddressFormValues {
  city: string;
  street: string;
  house: string;
  flat?: string;
  index?: string;
}

export interface ProfileFormValues {
  fullName: string;
  phone: string;
  email: string;
}
