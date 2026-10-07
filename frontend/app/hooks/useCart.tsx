import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import type { CartItem } from "~/types";
import { STORAGE_KEYS, readStorage, writeStorage } from "~/lib/storage";

interface CartContextValue {
  items: CartItem[];
  count: number;
  total: number;
  ready: boolean;
  toast: string | null;
  addItem: (item: Omit<CartItem, "quantity">, quantity?: number) => void;
  removeItem: (key: string) => void;
  updateQuantity: (key: string, quantity: number) => void;
  clearCart: () => void;
  showToast: (message: string) => void;
}

const CartContext = createContext<CartContextValue | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [ready, setReady] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    setItems(readStorage<CartItem[]>(STORAGE_KEYS.cart, []));
    setReady(true);
  }, []);

  useEffect(() => {
    if (ready) writeStorage(STORAGE_KEYS.cart, items);
  }, [items, ready]);

  const showToast = useCallback((message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(null), 2500);
  }, []);

  const addItem = useCallback(
    (item: Omit<CartItem, "quantity">, quantity = 1) => {
      setItems((prev) => {
        const existing = prev.find((row) => row.key === item.key);
        if (existing) {
          return prev.map((row) =>
            row.key === item.key ? { ...row, quantity: row.quantity + quantity } : row,
          );
        }
        return [...prev, { ...item, quantity }];
      });
      showToast(`${item.name} — добавлено в корзину`);
    },
    [showToast],
  );

  const removeItem = useCallback((key: string) => {
    setItems((prev) => prev.filter((row) => row.key !== key));
  }, []);

  const updateQuantity = useCallback(
    (key: string, quantity: number) => {
      if (quantity <= 0) {
        removeItem(key);
        return;
      }
      setItems((prev) => prev.map((row) => (row.key === key ? { ...row, quantity } : row)));
    },
    [removeItem],
  );

  const clearCart = useCallback(() => setItems([]), []);

  const count = useMemo(() => items.reduce((sum, row) => sum + row.quantity, 0), [items]);
  const total = useMemo(
    () => items.reduce((sum, row) => sum + row.price * row.quantity, 0),
    [items],
  );

  const value: CartContextValue = {
    items,
    count,
    total,
    ready,
    toast,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    showToast,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart должен использоваться внутри <CartProvider>");
  }
  return context;
}
