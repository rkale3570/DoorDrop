import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { cartApi } from '../api/cartApi';
import { CartResponse, AddToCartRequest } from '../api/types';
import { useAuth } from './AuthContext';

interface CartContextType {
  cart: CartResponse | null;
  itemCount: number;
  loading: boolean;
  fetchCart: () => Promise<void>;
  addToCart: (data: AddToCartRequest) => Promise<void>;
  updateQty: (itemId: number, quantity: number) => Promise<void>;
  removeItem: (itemId: number) => Promise<void>;
  clearCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType>({
  cart: null,
  itemCount: 0,
  loading: false,
  fetchCart: async () => {},
  addToCart: async () => {},
  updateQty: async () => {},
  removeItem: async () => {},
  clearCart: async () => {},
});

export const CartProvider = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();
  const [cart, setCart] = useState<CartResponse | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchCart = useCallback(async () => {
    if (!user) return;
    try {
      setLoading(true);
      const data = await cartApi.getCart();
      setCart(data);
    } catch {
      // silently fail — cart might be empty
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Fetch cart when user logs in
  useEffect(() => {
    if (user) fetchCart();
    else setCart(null);
  }, [user]);

  const addToCart = useCallback(async (data: AddToCartRequest) => {
    const updated = await cartApi.addItem(data);
    setCart(updated);
  }, []);

  const updateQty = useCallback(async (itemId: number, quantity: number) => {
    const updated = await cartApi.updateQty(itemId, quantity);
    setCart(updated);
  }, []);

  const removeItem = useCallback(async (itemId: number) => {
    const updated = await cartApi.removeItem(itemId);
    setCart(updated);
  }, []);

  const clearCart = useCallback(async () => {
    await cartApi.clearCart();
    setCart(null);
  }, []);

  const itemCount = cart?.totalItems ?? 0;

  return (
    <CartContext.Provider value={{ cart, itemCount, loading, fetchCart, addToCart, updateQty, removeItem, clearCart }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
