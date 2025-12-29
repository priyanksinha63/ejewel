export type MetalType = 'gold' | 'silver' | 'platinum' | 'rose_gold';
export type Role = 'customer' | 'admin' | 'seller';
export type OrderStatus = 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded';
export type PaymentStatus = 'pending' | 'completed' | 'failed' | 'refunded';
export type PaymentMethod = 'cod' | 'card' | 'upi' | 'wallet';

export interface Address {
  id: string;
  type: string;
  street: string;
  city: string;
  state: string;
  country: string;
  zipCode: string;
  phone: string;
  isDefault: boolean;
}

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  avatar: string;
  role: Role;
  addresses: Address[];
  isActive: boolean;
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

export interface ProductVariant {
  id: string;
  size: string;
  weight: number;
  price: number;
  stock: number;
  sku: string;
  isDefault: boolean;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  shortDesc: string;
  metalType: MetalType;
  purity: string;
  categoryId: string;
  categoryName: string;
  images: string[];
  thumbnail: string;
  basePrice: number;
  discountPrice: number;
  discountPercent: number;
  variants: ProductVariant[];
  tags: string[];
  features: string[];
  isFeatured: boolean;
  isNewArrival: boolean;
  isBestSeller: boolean;
  isActive: boolean;
  stock: number;
  rating: number;
  reviewCount: number;
  sellerId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  image: string;
  icon: string;
  parentId?: string;
  isActive: boolean;
  sortOrder: number;
}

export interface CartItem {
  productId: string;
  productName: string;
  thumbnail: string;
  variantId?: string;
  size: string;
  price: number;
  quantity: number;
  addedAt: string;
}

export interface Cart {
  id: string;
  userId: string;
  items: CartItem[];
  total: number;
  updatedAt: string;
}

export interface OrderItem {
  productId: string;
  productName: string;
  thumbnail: string;
  variantId?: string;
  size: string;
  quantity: number;
  price: number;
  totalPrice: number;
}

export interface ShippingInfo {
  address: Address;
  method: string;
  cost: number;
  trackingId: string;
  carrier: string;
  estimatedDate: string;
}

export interface PaymentInfo {
  method: PaymentMethod;
  status: PaymentStatus;
  transactionId: string;
  paidAt: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  userId: string;
  userEmail: string;
  userName: string;
  items: OrderItem[];
  subtotal: number;
  tax: number;
  discount: number;
  couponCode: string;
  shippingInfo: ShippingInfo;
  paymentInfo: PaymentInfo;
  total: number;
  status: OrderStatus;
  notes: string;
  cancelReason: string;
  createdAt: string;
  updatedAt: string;
}

export interface Review {
  id: string;
  productId: string;
  userId: string;
  userName: string;
  userAvatar: string;
  rating: number;
  title: string;
  comment: string;
  images: string[];
  isVerified: boolean;
  helpfulCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface WishlistProduct {
  id: string;
  name: string;
  thumbnail: string;
  basePrice: number;
  discountPrice: number;
  metalType: MetalType;
  isActive: boolean;
  stock: number;
}

export interface DashboardStats {
  overview: {
    totalProducts: number;
    activeProducts: number;
    totalUsers: number;
    totalOrders: number;
    pendingOrders: number;
    processingOrders: number;
    deliveredOrders: number;
    totalRevenue: number;
    todayOrders: number;
    todayRevenue: number;
  };
  recentOrders: Order[];
  lowStockProducts: Product[];
  monthlyStats: Array<{
    _id: { year: number; month: number };
    revenue: number;
    orders: number;
  }>;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ProductFilter {
  metalType?: string;
  categoryId?: string;
  minPrice?: number;
  maxPrice?: number;
  purity?: string;
  search?: string;
  isFeatured?: string;
  sortBy?: string;
  sortOrder?: string;
  page?: number;
  limit?: number;
}

