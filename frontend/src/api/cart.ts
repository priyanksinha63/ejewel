import api from './axios';
import type { ApiResponse, Cart, WishlistProduct } from '../types';

export const cartApi = {
  getCart: async (): Promise<ApiResponse<Cart>> => {
    const response = await api.get('/cart');
    return response.data;
  },

  addToCart: async (data: {
    productId: string;
    variantId?: string;
    quantity: number;
  }): Promise<ApiResponse<Cart>> => {
    const response = await api.post('/cart', data);
    return response.data;
  },

  updateCartItem: async (productId: string, quantity: number): Promise<ApiResponse<Cart>> => {
    const response = await api.put(`/cart/${productId}`, { quantity });
    return response.data;
  },

  removeFromCart: async (productId: string): Promise<ApiResponse<Cart>> => {
    const response = await api.delete(`/cart/${productId}`);
    return response.data;
  },

  clearCart: async (): Promise<ApiResponse<null>> => {
    const response = await api.delete('/cart');
    return response.data;
  },
};

export const wishlistApi = {
  getWishlist: async (): Promise<ApiResponse<{ products: WishlistProduct[] }>> => {
    const response = await api.get('/wishlist');
    return response.data;
  },

  addToWishlist: async (productId: string): Promise<ApiResponse<null>> => {
    const response = await api.post('/wishlist', { productId });
    return response.data;
  },

  removeFromWishlist: async (productId: string): Promise<ApiResponse<null>> => {
    const response = await api.delete(`/wishlist/${productId}`);
    return response.data;
  },

  clearWishlist: async (): Promise<ApiResponse<null>> => {
    const response = await api.delete('/wishlist');
    return response.data;
  },
};

