import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { api, CartData, CartItemRow } from '../api/client';
import { useAuth } from './AuthContext';

interface CartContextType {
  items: CartItemRow[];
  total: number;
  count: number;
  loading: boolean;
  refresh: () => Promise<void>;
  addItem: (giftSetId: number) => Promise<void>;
  updateQty: (itemId: number, quantity: number) => Promise<void>;
  removeItem: (itemId: number) => Promise<void>;
  clear: () => Promise<void>;
  checkout: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

function parseCart(data: CartData) {
  return {
    items: data.items,
    total: Number(data.total),
    count: data.item_count,
  };
}

export function CartProvider({ children }: { children: ReactNode }) {
  const { plan } = useAuth();
  const [items, setItems] = useState<CartItemRow[]>([]);
  const [total, setTotal] = useState(0);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const apply = useCallback((data: CartData) => {
    const parsed = parseCart(data);
    setItems(parsed.items);
    setTotal(parsed.total);
    setCount(parsed.count);
  }, []);

  const refresh = useCallback(async () => {
    try {
      const data = await api.getCart();
      apply(data);
    } catch {
      setItems([]);
      setTotal(0);
      setCount(0);
    }
  }, [apply]);

  useEffect(() => {
    refresh().finally(() => setLoading(false));
  }, [refresh, plan?.slug]);

  const addItem = async (giftSetId: number) => {
    const data = await api.addToCart(giftSetId, 1);
    apply(data);
  };

  const updateQty = async (itemId: number, quantity: number) => {
    const data = await api.updateCartItem(itemId, quantity);
    apply(data);
  };

  const removeItem = async (itemId: number) => {
    const data = await api.removeCartItem(itemId);
    apply(data);
  };

  const clear = async () => {
    const data = await api.clearCart();
    apply(data);
  };

  const checkout = async () => {
    await api.checkoutGifts();
    await refresh();
  };

  return (
    <CartContext.Provider
      value={{ items, total, count, loading, refresh, addItem, updateQty, removeItem, clear, checkout }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}
