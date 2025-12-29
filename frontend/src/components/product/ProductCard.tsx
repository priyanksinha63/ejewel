import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Heart, ShoppingCart, Star } from 'lucide-react';
import type { Product } from '../../types';
import { useAuthStore } from '../../stores/authStore';
import { useCartStore } from '../../stores/cartStore';
import { useWishlistStore } from '../../stores/wishlistStore';
import { useToast } from '../ui/Toast';

interface ProductCardProps {
  product: Product;
  index?: number;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, index = 0 }) => {
  const { isAuthenticated } = useAuthStore();
  const { addToCart } = useCartStore();
  const { isInWishlist, addToWishlist, removeFromWishlist } = useWishlistStore();
  const { showToast } = useToast();

  const inWishlist = isInWishlist(product.id);

  const handleWishlist = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!isAuthenticated) {
      showToast('Please login to add to wishlist', 'info');
      return;
    }

    if (inWishlist) {
      await removeFromWishlist(product.id);
      showToast('Removed from wishlist', 'info');
    } else {
      await addToWishlist(product.id);
      showToast('Added to wishlist', 'success');
    }
  };

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!isAuthenticated) {
      showToast('Please login to add to cart', 'info');
      return;
    }

    await addToCart(product.id, 1);
    showToast('Added to cart', 'success');
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(price);
  };

  const metalColors = {
    gold: 'from-yellow-400 to-amber-600',
    silver: 'from-gray-300 to-gray-500',
    platinum: 'from-gray-200 to-gray-400',
    rose_gold: 'from-rose-300 to-rose-500',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.5 }}
    >
      <Link to={`/products/${product.slug}`}>
        <div className="group relative bg-charcoal-800/50 rounded-2xl overflow-hidden border border-charcoal-700 hover:border-gold-500/50 transition-all duration-500 hover:shadow-xl hover:shadow-gold-500/10">
          {/* Image Container */}
          <div className="relative aspect-square overflow-hidden">
            <img
              src={product.thumbnail || product.images?.[0] || 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=400'}
              alt={product.name}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            />
            
            {/* Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-charcoal-900/90 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

            {/* Quick Actions */}
            <div className="absolute top-4 right-4 flex flex-col gap-2 transform translate-x-12 group-hover:translate-x-0 transition-transform duration-300">
              <button
                onClick={handleWishlist}
                className={`w-10 h-10 rounded-full backdrop-blur-md flex items-center justify-center transition-all ${
                  inWishlist
                    ? 'bg-red-500 text-white'
                    : 'bg-white/10 text-white hover:bg-white/20'
                }`}
              >
                <Heart className={`w-5 h-5 ${inWishlist ? 'fill-current' : ''}`} />
              </button>
              <button
                onClick={handleAddToCart}
                className="w-10 h-10 rounded-full bg-gold-500 text-charcoal-900 flex items-center justify-center hover:bg-gold-400 transition-all"
              >
                <ShoppingCart className="w-5 h-5" />
              </button>
            </div>

            {/* Badges */}
            <div className="absolute top-4 left-4 flex flex-col gap-2">
              {product.isNewArrival && (
                <span className="px-3 py-1 bg-emerald-500 text-white text-xs font-semibold rounded-full">
                  NEW
                </span>
              )}
              {product.discountPercent > 0 && (
                <span className="px-3 py-1 bg-red-500 text-white text-xs font-semibold rounded-full">
                  -{product.discountPercent}%
                </span>
              )}
              {product.isBestSeller && (
                <span className="px-3 py-1 bg-gold-500 text-charcoal-900 text-xs font-semibold rounded-full">
                  BESTSELLER
                </span>
              )}
            </div>

            {/* Metal Type Badge */}
            <div className="absolute bottom-4 left-4">
              <span className={`px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r ${metalColors[product.metalType]} text-charcoal-900`}>
                {product.purity}
              </span>
            </div>
          </div>

          {/* Content */}
          <div className="p-4">
            <div className="mb-2">
              <p className="text-charcoal-400 text-xs uppercase tracking-wider mb-1">
                {product.categoryName}
              </p>
              <h3 className="text-cream-50 font-medium text-lg line-clamp-1 group-hover:text-gold-500 transition-colors">
                {product.name}
              </h3>
            </div>

            {/* Rating */}
            {product.rating > 0 && (
              <div className="flex items-center gap-2 mb-3">
                <div className="flex items-center gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${
                        i < Math.round(product.rating)
                          ? 'text-gold-500 fill-gold-500'
                          : 'text-charcoal-600'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-charcoal-400 text-sm">({product.reviewCount})</span>
              </div>
            )}

            {/* Price */}
            <div className="flex items-center gap-2">
              {product.discountPrice < product.basePrice ? (
                <>
                  <span className="text-gold-500 font-semibold text-lg">
                    {formatPrice(product.discountPrice)}
                  </span>
                  <span className="text-charcoal-500 line-through text-sm">
                    {formatPrice(product.basePrice)}
                  </span>
                </>
              ) : (
                <span className="text-gold-500 font-semibold text-lg">
                  {formatPrice(product.basePrice)}
                </span>
              )}
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

