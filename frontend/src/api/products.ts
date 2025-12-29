import api from './axios';
import type { ApiResponse, PaginatedResponse, Product, ProductFilter, Review, Category } from '../types';

export const productsApi = {
  getProducts: async (filters?: ProductFilter): Promise<PaginatedResponse<Product>> => {
    const response = await api.get('/products', { params: filters });
    return response.data;
  },

  getProduct: async (id: string): Promise<ApiResponse<Product>> => {
    const response = await api.get(`/products/${id}`);
    return response.data;
  },

  getFeaturedProducts: async (): Promise<ApiResponse<Product[]>> => {
    const response = await api.get('/products/featured');
    return response.data;
  },

  getNewArrivals: async (): Promise<ApiResponse<Product[]>> => {
    const response = await api.get('/products/new-arrivals');
    return response.data;
  },

  getBestSellers: async (): Promise<ApiResponse<Product[]>> => {
    const response = await api.get('/products/best-sellers');
    return response.data;
  },

  searchProducts: async (query: string): Promise<ApiResponse<Product[]>> => {
    const response = await api.get('/products/search', { params: { q: query } });
    return response.data;
  },

  getProductReviews: async (productId: string): Promise<ApiResponse<{ reviews: Review[]; count: number; avgRating: number }>> => {
    const response = await api.get(`/products/${productId}/reviews`);
    return response.data;
  },

  getCategories: async (): Promise<ApiResponse<Category[]>> => {
    const response = await api.get('/categories');
    return response.data;
  },

  getCategory: async (id: string): Promise<ApiResponse<Category>> => {
    const response = await api.get(`/categories/${id}`);
    return response.data;
  },
};

