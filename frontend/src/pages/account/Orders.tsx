import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { Package, ChevronRight, Clock, Truck, CheckCircle, XCircle } from 'lucide-react';
import { ordersApi } from '../../api/orders';
import { Button } from '../../components/ui/Button';

export const Orders: React.FC = () => {
  const { data, isLoading } = useQuery({
    queryKey: ['orders'],
    queryFn: () => ordersApi.getOrders(),
  });

  const orders = data?.data || [];

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

  const statusConfig: Record<string, { icon: React.ElementType; color: string; bg: string }> = {
    pending: { icon: Clock, color: 'text-yellow-500', bg: 'bg-yellow-500/20' },
    confirmed: { icon: CheckCircle, color: 'text-blue-500', bg: 'bg-blue-500/20' },
    processing: { icon: Package, color: 'text-purple-500', bg: 'bg-purple-500/20' },
    shipped: { icon: Truck, color: 'text-indigo-500', bg: 'bg-indigo-500/20' },
    delivered: { icon: CheckCircle, color: 'text-emerald-500', bg: 'bg-emerald-500/20' },
    cancelled: { icon: XCircle, color: 'text-red-500', bg: 'bg-red-500/20' },
  };

  if (isLoading) {
    return (
      <div className="min-h-screen py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-40 bg-charcoal-800 rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center py-12 px-4">
        <div className="text-center">
          <Package className="w-16 h-16 mx-auto text-charcoal-600 mb-4" />
          <h2 className="font-display text-2xl font-bold text-cream-50 mb-4">No Orders Yet</h2>
          <p className="text-charcoal-400 mb-6">Start shopping to see your orders here</p>
          <Link to="/products">
            <Button size="lg">Browse Products</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="font-display text-4xl font-bold text-cream-50 mb-8"
        >
          My Orders
        </motion.h1>

        <div className="space-y-4">
          {orders.map((order, index) => {
            const config = statusConfig[order.status] || statusConfig.pending;
            const StatusIcon = config.icon;

            return (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Link
                  to={`/account/orders/${order.id}`}
                  className="block bg-charcoal-800/50 rounded-xl border border-charcoal-700 p-6 hover:border-gold-500/50 transition-all"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <p className="text-gold-500 font-semibold">{order.orderNumber}</p>
                      <p className="text-charcoal-400 text-sm">{formatDate(order.createdAt)}</p>
                    </div>
                    <div className={`flex items-center gap-2 px-3 py-1 rounded-full ${config.bg}`}>
                      <StatusIcon className={`w-4 h-4 ${config.color}`} />
                      <span className={`text-sm font-medium capitalize ${config.color}`}>
                        {order.status}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 mb-4">
                    <div className="flex -space-x-3">
                      {order.items.slice(0, 3).map((item, i) => (
                        <img
                          key={i}
                          src={item.thumbnail || 'https://via.placeholder.com/50'}
                          alt={item.productName}
                          className="w-12 h-12 object-cover rounded-lg border-2 border-charcoal-800"
                        />
                      ))}
                      {order.items.length > 3 && (
                        <div className="w-12 h-12 rounded-lg bg-charcoal-700 border-2 border-charcoal-800 flex items-center justify-center">
                          <span className="text-cream-100 text-sm">+{order.items.length - 3}</span>
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="text-cream-100">
                        {order.items.length} item{order.items.length > 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-charcoal-700">
                    <span className="text-charcoal-400">Total</span>
                    <div className="flex items-center gap-2">
                      <span className="text-gold-500 font-bold text-lg">{formatPrice(order.total)}</span>
                      <ChevronRight className="w-5 h-5 text-charcoal-500" />
                    </div>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

