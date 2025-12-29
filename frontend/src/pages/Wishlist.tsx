import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Heart, ShoppingCart, Trash2 } from 'lucide-react';
import { useAuthStore } from '../stores/authStore';
import { useWishlistStore } from '../stores/wishlistStore';
import { useCartStore } from '../stores/cartStore';
import { Button } from '../components/ui/Button';
import { useToast } from '../components/ui/Toast';

export const Wishlist: React.FC = () => {
  const { isAuthenticated } = useAuthStore();
  const { items, fetchWishlist, removeFromWishlist, isLoading } = useWishlistStore();
  const { addToCart } = useCartStore();
  const { showToast } = useToast();

  useEffect(() => {
    if (isAuthenticated) {
      fetchWishlist();
    }
  }, [isAuthenticated, fetchWishlist]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(price);
  };

  const handleRemove = async (productId: string) => {
    await removeFromWishlist(productId);
    showToast('Removed from wishlist', 'info');
  };

  const handleAddToCart = async (productId: string) => {
    await addToCart(productId, 1);
    showToast('Added to cart', 'success');
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center py-12 px-4">
        <div className="text-center">
          <Heart className="w-16 h-16 mx-auto text-charcoal-600 mb-4" />
          <h2 className="font-display text-2xl font-bold text-cream-50 mb-4">
            Please Login to View Wishlist
          </h2>
          <p className="text-charcoal-400 mb-6">
            Sign in to save your favorite items
          </p>
          <Link to="/login">
            <Button size="lg">Sign In</Button>
          </Link>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center py-12 px-4">
        <div className="text-center">
          <Heart className="w-16 h-16 mx-auto text-charcoal-600 mb-4" />
          <h2 className="font-display text-2xl font-bold text-cream-50 mb-4">
            Your Wishlist is Empty
          </h2>
          <p className="text-charcoal-400 mb-6">
            Save items you love by clicking the heart icon
          </p>
          <Link to="/products">
            <Button size="lg">Browse Products</Button>
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
          My Wishlist
          <span className="text-charcoal-400 text-xl ml-3">({items.length} items)</span>
        </motion.h1>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {items.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-charcoal-800/50 rounded-xl border border-charcoal-700 overflow-hidden group"
            >
              <Link to={`/products/${item.id}`} className="block relative aspect-square">
                <img
                  src={item.thumbnail || 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=400'}
                  alt={item.name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                {!item.isActive && (
                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                    <span className="text-red-500 font-medium">Unavailable</span>
                  </div>
                )}
                {item.stock === 0 && item.isActive && (
                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                    <span className="text-yellow-500 font-medium">Out of Stock</span>
                  </div>
                )}
              </Link>

              <div className="p-4">
                <Link
                  to={`/products/${item.id}`}
                  className="text-cream-100 font-medium hover:text-gold-500 transition-colors line-clamp-1"
                >
                  {item.name}
                </Link>
                <p className="text-charcoal-400 text-sm capitalize mt-1">
                  {item.metalType.replace('_', ' ')}
                </p>

                <div className="flex items-center gap-2 mt-2">
                  {item.discountPrice < item.basePrice ? (
                    <>
                      <span className="text-gold-500 font-semibold">{formatPrice(item.discountPrice)}</span>
                      <span className="text-charcoal-500 line-through text-sm">{formatPrice(item.basePrice)}</span>
                    </>
                  ) : (
                    <span className="text-gold-500 font-semibold">{formatPrice(item.basePrice)}</span>
                  )}
                </div>

                <div className="flex gap-2 mt-4">
                  <Button
                    size="sm"
                    className="flex-1"
                    onClick={() => handleAddToCart(item.id)}
                    disabled={!item.isActive || item.stock === 0}
                  >
                    <ShoppingCart className="w-4 h-4 mr-2" />
                    Add to Cart
                  </Button>
                  <button
                    onClick={() => handleRemove(item.id)}
                    disabled={isLoading}
                    className="w-10 h-10 rounded-lg border border-charcoal-600 flex items-center justify-center text-charcoal-400 hover:text-red-500 hover:border-red-500 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

