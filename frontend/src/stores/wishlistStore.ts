import { create } from 'zustand';
import type { WishlistProduct } from '../types';
import { wishlistApi } from '../api/cart';

interface WishlistState {
  items: WishlistProduct[];
  isLoading: boolean;
  fetchWishlist: () => Promise<void>;
  addToWishlist: (productId: string) => Promise<void>;
  removeFromWishlist: (productId: string) => Promise<void>;
  isInWishlist: (productId: string) => boolean;
  clearWishlist: () => Promise<void>;
}

export const useWishlistStore = create<WishlistState>()((set, get) => ({
  items: [],
  isLoading: false,

  fetchWishlist: async () => {
    set({ isLoading: true });
    try {
      const response = await wishlistApi.getWishlist();
      if (response.success && response.data) {
        set({ items: response.data.products || [] });
      }
    } catch (error) {
      // User might not be logged in
    } finally {
      set({ isLoading: false });
    }
  },

  addToWishlist: async (productId) => {
    set({ isLoading: true });
    try {
      await wishlistApi.addToWishlist(productId);
      await get().fetchWishlist();
    } finally {
      set({ isLoading: false });
    }
  },

  removeFromWishlist: async (productId) => {
    set({ isLoading: true });
    try {
      await wishlistApi.removeFromWishlist(productId);
      set({ items: get().items.filter(item => item.id !== productId) });
    } finally {
      set({ isLoading: false });
    }
  },

  isInWishlist: (productId) => {
    return get().items.some(item => item.id === productId);
  },

  clearWishlist: async () => {
    set({ isLoading: true });
    try {
      await wishlistApi.clearWishlist();
      set({ items: [] });
    } finally {
      set({ isLoading: false });
    }
  },
}));

