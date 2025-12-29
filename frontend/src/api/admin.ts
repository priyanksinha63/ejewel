import api from './axios';
import type { ApiResponse, PaginatedResponse, DashboardStats, User, Product, Order, OrderStatus, Category } from '../types';

export const adminApi = {
  getDashboardStats: async (): Promise<ApiResponse<DashboardStats>> => {
    const response = await api.get('/admin/dashboard');
    return response.data;
  },

  // Users
  getUsers: async (params?: { role?: string }): Promise<PaginatedResponse<User>> => {
    const response = await api.get('/admin/users', { params });
    return response.data;
  },

  getUser: async (id: string): Promise<ApiResponse<{ user: User; orders: Order[] }>> => {
    const response = await api.get(`/admin/users/${id}`);
    return response.data;
  },

  updateUser: async (id: string, data: { role?: string; isActive?: boolean }): Promise<ApiResponse<User>> => {
    const response = await api.put(`/admin/users/${id}`, data);
    return response.data;
  },

  // Products
  getProducts: async (): Promise<PaginatedResponse<Product>> => {
    const response = await api.get('/admin/products');
    return response.data;
  },

  createProduct: async (data: Partial<Product>): Promise<ApiResponse<Product>> => {
    const response = await api.post('/admin/products', data);
    return response.data;
  },

  updateProduct: async (id: string, data: Partial<Product>): Promise<ApiResponse<Product>> => {
    const response = await api.put(`/admin/products/${id}`, data);
    return response.data;
  },

  deleteProduct: async (id: string): Promise<ApiResponse<null>> => {
    const response = await api.delete(`/admin/products/${id}`);
    return response.data;
  },

  // Orders
  getOrders: async (params?: { status?: string }): Promise<PaginatedResponse<Order>> => {
    const response = await api.get('/admin/orders', { params });
    return response.data;
  },

  updateOrderStatus: async (id: string, data: {
    status: OrderStatus;
    trackingId?: string;
    carrier?: string;
    cancelReason?: string;
  }): Promise<ApiResponse<Order>> => {
    const response = await api.put(`/admin/orders/${id}/status`, data);
    return response.data;
  },

  // Categories
  createCategory: async (data: Partial<Category>): Promise<ApiResponse<Category>> => {
    const response = await api.post('/admin/categories', data);
    return response.data;
  },

  updateCategory: async (id: string, data: Partial<Category>): Promise<ApiResponse<Category>> => {
    const response = await api.put(`/admin/categories/${id}`, data);
    return response.data;
  },

  deleteCategory: async (id: string): Promise<ApiResponse<null>> => {
    const response = await api.delete(`/admin/categories/${id}`);
    return response.data;
  },
};

