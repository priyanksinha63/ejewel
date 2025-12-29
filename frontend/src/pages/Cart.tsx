import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, Minus, Plus, ShoppingBag, ArrowRight, Tag, Truck } from 'lucide-react';
import { useAuthStore } from '../stores/authStore';
import { useCartStore } from '../stores/cartStore';
import { Button } from '../components/ui/Button';
import { useToast } from '../components/ui/Toast';

export const Cart: React.FC = () => {
  const { isAuthenticated, user } = useAuthStore();
  const { cart, fetchCart, updateQuantity, removeFromCart, isLoading } = useCartStore();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [couponCode, setCouponCode] = useState('');

  useEffect(() => {
    if (isAuthenticated) {
      fetchCart();
    }
  }, [isAuthenticated, fetchCart]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(price);
  };

  const handleQuantityChange = async (productId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      await removeFromCart(productId);
      showToast('Item removed from cart', 'info');
    } else {
      await updateQuantity(productId, newQuantity);
    }
  };

  const handleRemove = async (productId: string) => {
    await removeFromCart(productId);
    showToast('Item removed from cart', 'info');
  };

  const subtotal = cart?.total || 0;
  const tax = subtotal * 0.18;
  const shippingCost = subtotal >= 5000 ? 0 : 199;
  const total = subtotal + tax + shippingCost;

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center py-12 px-4">
        <div className="text-center">
          <ShoppingBag className="w-16 h-16 mx-auto text-charcoal-600 mb-4" />
          <h2 className="font-display text-2xl font-bold text-cream-50 mb-4">
            Please Login to View Cart
          </h2>
          <p className="text-charcoal-400 mb-6">
            Sign in to add items and view your shopping cart
          </p>
          <Link to="/login">
            <Button size="lg">Sign In</Button>
          </Link>
        </div>
      </div>
    );
  }

  if (!cart || cart.items?.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center py-12 px-4">
        <div className="text-center">
          <ShoppingBag className="w-16 h-16 mx-auto text-charcoal-600 mb-4" />
          <h2 className="font-display text-2xl font-bold text-cream-50 mb-4">
            Your Cart is Empty
          </h2>
          <p className="text-charcoal-400 mb-6">
            Discover our exquisite jewelry collection and add your favorites
          </p>
          <Link to="/products">
            <Button size="lg">Start Shopping</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="font-display text-4xl font-bold text-cream-50 mb-8"
        >
          Shopping Cart
        </motion.h1>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            <AnimatePresence>
              {cart.items?.map((item, index) => (
                <motion.div
                  key={item.productId}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex gap-4 p-4 bg-charcoal-800/50 rounded-xl border border-charcoal-700"
                >
                  {/* Image */}
                  <Link to={`/products/${item.productId}`} className="flex-shrink-0">
                    <img
                      src={item.thumbnail || 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=200'}
                      alt={item.productName}
                      className="w-24 h-24 object-cover rounded-lg"
                    />
                  </Link>

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <Link
                      to={`/products/${item.productId}`}
                      className="text-cream-100 font-medium hover:text-gold-500 transition-colors line-clamp-1"
                    >
                      {item.productName}
                    </Link>
                    {item.size && (
                      <p className="text-charcoal-400 text-sm mt-1">Size: {item.size}</p>
                    )}
                    <p className="text-gold-500 font-semibold mt-2">{formatPrice(item.price)}</p>

                    {/* Quantity Controls */}
                    <div className="flex items-center gap-4 mt-3">
                      <div className="flex items-center bg-charcoal-700 rounded-lg overflow-hidden">
                        <button
                          onClick={() => handleQuantityChange(item.productId, item.quantity - 1)}
                          disabled={isLoading}
                          className="w-8 h-8 flex items-center justify-center text-cream-100 hover:bg-charcoal-600 transition-colors"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="w-10 text-center text-cream-100 text-sm">{item.quantity}</span>
                        <button
                          onClick={() => handleQuantityChange(item.productId, item.quantity + 1)}
                          disabled={isLoading}
                          className="w-8 h-8 flex items-center justify-center text-cream-100 hover:bg-charcoal-600 transition-colors"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                      <button
                        onClick={() => handleRemove(item.productId)}
                        disabled={isLoading}
                        className="text-red-400 hover:text-red-300 transition-colors"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>

                  {/* Item Total */}
                  <div className="text-right">
                    <p className="text-cream-50 font-semibold">
                      {formatPrice(item.price * item.quantity)}
                    </p>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-charcoal-800/50 rounded-xl border border-charcoal-700 p-6 sticky top-24"
            >
              <h2 className="font-display text-xl font-bold text-cream-50 mb-6">Order Summary</h2>

              {/* Coupon */}
              <div className="mb-6">
                <div className="flex gap-2">
                  <div className="flex-1 relative">
                    <input
                      type="text"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      placeholder="Coupon code"
                      className="w-full pl-10 pr-4 py-2 bg-charcoal-700 border border-charcoal-600 rounded-lg text-cream-100 placeholder:text-charcoal-500 focus:border-gold-500 focus:outline-none"
                    />
                    <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-charcoal-500" />
                  </div>
                  <Button variant="outline" size="sm">
                    Apply
                  </Button>
                </div>
              </div>

              {/* Summary */}
              <div className="space-y-4 text-sm">
                <div className="flex justify-between">
                  <span className="text-charcoal-400">Subtotal</span>
                  <span className="text-cream-100">{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-charcoal-400">GST (18%)</span>
                  <span className="text-cream-100">{formatPrice(tax)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-charcoal-400 flex items-center gap-2">
                    <Truck className="w-4 h-4" />
                    Shipping
                  </span>
                  <span className={shippingCost === 0 ? 'text-emerald-500' : 'text-cream-100'}>
                    {shippingCost === 0 ? 'FREE' : formatPrice(shippingCost)}
                  </span>
                </div>
                {shippingCost > 0 && (
                  <p className="text-charcoal-500 text-xs">
                    Add {formatPrice(5000 - subtotal)} more for free shipping
                  </p>
                )}
                <div className="border-t border-charcoal-700 pt-4 flex justify-between">
                  <span className="text-cream-50 font-semibold">Total</span>
                  <span className="text-gold-500 font-bold text-lg">{formatPrice(total)}</span>
                </div>
              </div>

              {/* Checkout Button */}
              <Button
                className="w-full mt-6"
                size="lg"
                onClick={() => navigate('/checkout')}
              >
                Proceed to Checkout
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>

              {/* Continue Shopping */}
              <Link
                to="/products"
                className="block mt-4 text-center text-charcoal-400 hover:text-gold-500 transition-colors"
              >
                Continue Shopping
              </Link>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

