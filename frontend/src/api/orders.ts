import api from './axios';
import type { ApiResponse, Order, PaymentMethod } from '../types';

export const ordersApi = {
  getOrders: async (): Promise<ApiResponse<Order[]>> => {
    const response = await api.get('/orders');
    return response.data;
  },

  getOrder: async (id: string): Promise<ApiResponse<Order>> => {
    const response = await api.get(`/orders/${id}`);
    return response.data;
  },

  createOrder: async (data: {
    addressId: string;
    paymentMethod: PaymentMethod;
    shippingMethod?: string;
    couponCode?: string;
    notes?: string;
  }): Promise<ApiResponse<Order>> => {
    const response = await api.post('/orders', data);
    return response.data;
  },

  cancelOrder: async (id: string, reason?: string): Promise<ApiResponse<null>> => {
    const response = await api.post(`/orders/${id}/cancel`, { reason });
    return response.data;
  },
};

export const reviewsApi = {
  createReview: async (data: {
    productId: string;
    rating: number;
    title?: string;
    comment: string;
    images?: string[];
  }): Promise<ApiResponse<null>> => {
    const response = await api.post('/reviews', data);
    return response.data;
  },

  updateReview: async (id: string, data: {
    rating?: number;
    title?: string;
    comment?: string;
    images?: string[];
  }): Promise<ApiResponse<null>> => {
    const response = await api.put(`/reviews/${id}`, data);
    return response.data;
  },

  deleteReview: async (id: string): Promise<ApiResponse<null>> => {
    const response = await api.delete(`/reviews/${id}`);
    return response.data;
  },
};

