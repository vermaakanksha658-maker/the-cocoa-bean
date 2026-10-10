import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

const CartContext = createContext(null);

const STORAGE_KEY = 'cocoa_cart';

function loadCart() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

export function CartProvider({ children }) {
  const [items, setItems] = useState(loadCart);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      /* storage unavailable */
    }
  }, [items]);

  const add = useCallback((item, qty = 1) => {
    setItems((prev) => {
      const existing = prev[item._id];
      const next = existing ? existing.qty + qty : qty;
      return { ...prev, [item._id]: { id: item._id, name: item.name, price: item.price, image: item.image || '', qty: Math.min(99, next) } };
    });
  }, []);

  const setQty = useCallback((id, qty) => {
    setItems((prev) => {
      if (qty <= 0) {
        const copy = { ...prev };
        delete copy[id];
        return copy;
      }
      const existing = prev[id];
      if (!existing) return prev;
      return { ...prev, [id]: { ...existing, qty: Math.min(99, qty) } };
    });
  }, []);

  const remove = useCallback((id) => {
    setItems((prev) => {
      const copy = { ...prev };
      delete copy[id];
      return copy;
    });
  }, []);

  const clear = useCallback(() => setItems({}), []);

  const openCart = useCallback(() => setOpen(true), []);
  const closeCart = useCallback(() => setOpen(false), []);

  const count = useMemo(() => Object.values(items).reduce((sum, i) => sum + i.qty, 0), [items]);
  const total = useMemo(() => Object.values(items).reduce((sum, i) => sum + i.qty * i.price, 0), [items]);

  const value = useMemo(
    () => ({ items, add, setQty, remove, clear, count, total, open, openCart, closeCart }),
    [items, add, setQty, remove, clear, count, total, open, openCart, closeCart]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}