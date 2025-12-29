import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import {
  Package,
  Users,
  ShoppingCart,
  DollarSign,
  TrendingUp,
  AlertTriangle,
  ArrowUpRight,
  Clock,
} from 'lucide-react';
import { adminApi } from '../../api/admin';

export const AdminDashboard: React.FC = () => {
  const { data, isLoading } = useQuery({
    queryKey: ['dashboardStats'],
    queryFn: () => adminApi.getDashboardStats(),
  });

  const stats = data?.data?.overview;
  const recentOrders = data?.data?.recentOrders || [];
  const lowStockProducts = data?.data?.lowStockProducts || [];

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(price);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const statCards = [
    {
      title: 'Total Revenue',
      value: formatPrice(stats?.totalRevenue || 0),
      change: '+12.5%',
      icon: DollarSign,
      color: 'from-emerald-500 to-emerald-600',
    },
    {
      title: 'Total Orders',
      value: stats?.totalOrders || 0,
      change: '+8.2%',
      icon: ShoppingCart,
      color: 'from-blue-500 to-blue-600',
    },
    {
      title: 'Total Users',
      value: stats?.totalUsers || 0,
      change: '+15.3%',
      icon: Users,
      color: 'from-purple-500 to-purple-600',
    },
    {
      title: 'Active Products',
      value: stats?.activeProducts || 0,
      change: '+5.1%',
      icon: Package,
      color: 'from-gold-500 to-gold-600',
    },
  ];

  const statusColors: Record<string, string> = {
    pending: 'bg-yellow-500/20 text-yellow-500',
    confirmed: 'bg-blue-500/20 text-blue-500',
    processing: 'bg-purple-500/20 text-purple-500',
    shipped: 'bg-indigo-500/20 text-indigo-500',
    delivered: 'bg-emerald-500/20 text-emerald-500',
    cancelled: 'bg-red-500/20 text-red-500',
  };

  if (isLoading) {
    return (
      <div className="min-h-screen py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse space-y-8">
            <div className="h-10 w-48 bg-charcoal-700 rounded" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-32 bg-charcoal-800 rounded-xl" />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 bg-charcoal-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="font-display text-4xl font-bold text-cream-50">Admin Dashboard</h1>
          <p className="text-charcoal-400 mt-2">Welcome back! Here's what's happening with your store.</p>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statCards.map((stat, index) => (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-charcoal-800/50 rounded-xl border border-charcoal-700 p-6"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-charcoal-400 text-sm">{stat.title}</p>
                  <p className="text-2xl font-bold text-cream-50 mt-1">{stat.value}</p>
                  <div className="flex items-center gap-1 mt-2 text-emerald-500 text-sm">
                    <TrendingUp className="w-4 h-4" />
                    {stat.change}
                  </div>
                </div>
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center`}>
                  <stat.icon className="w-6 h-6 text-white" />
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-gradient-to-br from-gold-500/10 to-gold-600/5 rounded-xl border border-gold-500/20 p-6"
          >
            <h3 className="text-gold-500 font-medium mb-4">Today's Stats</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-charcoal-400">Orders</span>
                <span className="text-cream-50 font-semibold">{stats?.todayOrders || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-charcoal-400">Revenue</span>
                <span className="text-cream-50 font-semibold">{formatPrice(stats?.todayRevenue || 0)}</span>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-charcoal-800/50 rounded-xl border border-charcoal-700 p-6"
          >
            <h3 className="text-cream-100 font-medium mb-4">Order Status</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-charcoal-400">Pending</span>
                <span className="text-yellow-500 font-semibold">{stats?.pendingOrders || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-charcoal-400">Processing</span>
                <span className="text-blue-500 font-semibold">{stats?.processingOrders || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-charcoal-400">Delivered</span>
                <span className="text-emerald-500 font-semibold">{stats?.deliveredOrders || 0}</span>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-charcoal-800/50 rounded-xl border border-charcoal-700 p-6"
          >
            <h3 className="text-cream-100 font-medium mb-4">Quick Actions</h3>
            <div className="space-y-2">
              <Link
                to="/admin/products/new"
                className="flex items-center justify-between p-2 rounded-lg hover:bg-charcoal-700 transition-colors"
              >
                <span className="text-charcoal-300">Add Product</span>
                <ArrowUpRight className="w-4 h-4 text-gold-500" />
              </Link>
              <Link
                to="/admin/orders"
                className="flex items-center justify-between p-2 rounded-lg hover:bg-charcoal-700 transition-colors"
              >
                <span className="text-charcoal-300">View Orders</span>
                <ArrowUpRight className="w-4 h-4 text-gold-500" />
              </Link>
              <Link
                to="/admin/users"
                className="flex items-center justify-between p-2 rounded-lg hover:bg-charcoal-700 transition-colors"
              >
                <span className="text-charcoal-300">Manage Users</span>
                <ArrowUpRight className="w-4 h-4 text-gold-500" />
              </Link>
            </div>
          </motion.div>
        </div>

        {/* Tables */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Orders */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="bg-charcoal-800/50 rounded-xl border border-charcoal-700 overflow-hidden"
          >
            <div className="flex items-center justify-between p-6 border-b border-charcoal-700">
              <h3 className="text-cream-100 font-semibold flex items-center gap-2">
                <Clock className="w-5 h-5 text-gold-500" />
                Recent Orders
              </h3>
              <Link to="/admin/orders" className="text-gold-500 text-sm hover:underline">
                View All
              </Link>
            </div>
            <div className="divide-y divide-charcoal-700">
              {recentOrders.slice(0, 5).map((order) => (
                <div key={order.id} className="p-4 hover:bg-charcoal-700/30 transition-colors">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-cream-100 font-medium">{order.orderNumber}</p>
                      <p className="text-charcoal-400 text-sm">{order.userName}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-gold-500 font-semibold">{formatPrice(order.total)}</p>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${statusColors[order.status]}`}>
                        {order.status}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Low Stock Products */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="bg-charcoal-800/50 rounded-xl border border-charcoal-700 overflow-hidden"
          >
            <div className="flex items-center justify-between p-6 border-b border-charcoal-700">
              <h3 className="text-cream-100 font-semibold flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-yellow-500" />
                Low Stock Alert
              </h3>
              <Link to="/admin/products" className="text-gold-500 text-sm hover:underline">
                View All
              </Link>
            </div>
            <div className="divide-y divide-charcoal-700">
              {lowStockProducts.slice(0, 5).map((product) => (
                <div key={product.id} className="p-4 flex items-center gap-4 hover:bg-charcoal-700/30 transition-colors">
                  <img
                    src={product.thumbnail || 'https://via.placeholder.com/50'}
                    alt={product.name}
                    className="w-12 h-12 object-cover rounded-lg"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-cream-100 font-medium truncate">{product.name}</p>
                    <p className="text-charcoal-400 text-sm">{product.categoryName}</p>
                  </div>
                  <div className="text-right">
                    <p className={`font-semibold ${product.stock < 5 ? 'text-red-500' : 'text-yellow-500'}`}>
                      {product.stock} left
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

