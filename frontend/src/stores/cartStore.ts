import { create } from 'zustand';
import type { Cart, CartItem } from '../types';
import { cartApi } from '../api/cart';

interface CartState {
  cart: Cart | null;
  isLoading: boolean;
  itemCount: number;
  fetchCart: () => Promise<void>;
  addToCart: (productId: string, quantity: number, variantId?: string) => Promise<void>;
  updateQuantity: (productId: string, quantity: number) => Promise<void>;
  removeFromCart: (productId: string) => Promise<void>;
  clearCart: () => Promise<void>;
}

export const useCartStore = create<CartState>()((set, get) => ({
  cart: null,
  isLoading: false,
  itemCount: 0,

  fetchCart: async () => {
    set({ isLoading: true });
    try {
      const response = await cartApi.getCart();
      if (response.success && response.data) {
        const itemCount = response.data.items?.reduce((acc: number, item: CartItem) => acc + item.quantity, 0) || 0;
        set({ cart: response.data, itemCount });
      }
    } catch (error) {
      // User might not be logged in
    } finally {
      set({ isLoading: false });
    }
  },

  addToCart: async (productId, quantity, variantId) => {
    set({ isLoading: true });
    try {
      const response = await cartApi.addToCart({ productId, quantity, variantId });
      if (response.success && response.data) {
        const itemCount = response.data.items?.reduce((acc: number, item: CartItem) => acc + item.quantity, 0) || 0;
        set({ cart: response.data, itemCount });
      }
    } finally {
      set({ isLoading: false });
    }
  },

  updateQuantity: async (productId, quantity) => {
    set({ isLoading: true });
    try {
      const response = await cartApi.updateCartItem(productId, quantity);
      if (response.success && response.data) {
        const itemCount = response.data.items?.reduce((acc: number, item: CartItem) => acc + item.quantity, 0) || 0;
        set({ cart: response.data, itemCount });
      }
    } finally {
      set({ isLoading: false });
    }
  },

  removeFromCart: async (productId) => {
    set({ isLoading: true });
    try {
      const response = await cartApi.removeFromCart(productId);
      if (response.success && response.data) {
        const itemCount = response.data.items?.reduce((acc: number, item: CartItem) => acc + item.quantity, 0) || 0;
        set({ cart: response.data, itemCount });
      }
    } finally {
      set({ isLoading: false });
    }
  },

  clearCart: async () => {
    set({ isLoading: true });
    try {
      await cartApi.clearCart();
      set({ cart: null, itemCount: 0 });
    } finally {
      set({ isLoading: false });
    }
  },
}));

