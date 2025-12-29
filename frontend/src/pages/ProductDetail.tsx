import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import {
  Heart,
  ShoppingCart,
  Star,
  ChevronLeft,
  ChevronRight,
  Shield,
  Truck,
  RefreshCw,
  Check,
  Minus,
  Plus,
} from 'lucide-react';
import { productsApi } from '../api/products';
import { useAuthStore } from '../stores/authStore';
import { useCartStore } from '../stores/cartStore';
import { useWishlistStore } from '../stores/wishlistStore';
import { useToast } from '../components/ui/Toast';
import { Button } from '../components/ui/Button';
import { ProductGrid } from '../components/product/ProductGrid';

export const ProductDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { isAuthenticated } = useAuthStore();
  const { addToCart, isLoading: cartLoading } = useCartStore();
  const { isInWishlist, addToWishlist, removeFromWishlist } = useWishlistStore();
  const { showToast } = useToast();

  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [selectedVariant, setSelectedVariant] = useState<string | null>(null);

  const { data: productData, isLoading } = useQuery({
    queryKey: ['product', id],
    queryFn: () => productsApi.getProduct(id!),
    enabled: !!id,
  });

  const { data: reviewsData } = useQuery({
    queryKey: ['reviews', id],
    queryFn: () => productsApi.getProductReviews(id!),
    enabled: !!id,
  });

  const { data: relatedProducts } = useQuery({
    queryKey: ['relatedProducts', productData?.data?.categoryId],
    queryFn: () =>
      productsApi.getProducts({ categoryId: productData?.data?.categoryId, limit: 4 }),
    enabled: !!productData?.data?.categoryId,
  });

  const product = productData?.data;
  const inWishlist = product ? isInWishlist(product.id) : false;

  if (isLoading) {
    return (
      <div className="min-h-screen py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12">
            <div className="aspect-square skeleton rounded-2xl" />
            <div className="space-y-6">
              <div className="h-8 w-32 skeleton rounded" />
              <div className="h-12 w-full skeleton rounded" />
              <div className="h-6 w-48 skeleton rounded" />
              <div className="h-24 w-full skeleton rounded" />
              <div className="h-12 w-48 skeleton rounded" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-display text-cream-50 mb-4">Product Not Found</h2>
          <Link to="/products">
            <Button>Browse Products</Button>
          </Link>
        </div>
      </div>
    );
  }

  const images = product.images?.length > 0 ? product.images : [product.thumbnail];

  const handleWishlist = async () => {
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

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      showToast('Please login to add to cart', 'info');
      return;
    }

    await addToCart(product.id, quantity, selectedVariant || undefined);
    showToast('Added to cart', 'success');
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(price);
  };

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-charcoal-400 mb-8">
          <Link to="/" className="hover:text-gold-500">Home</Link>
          <span>/</span>
          <Link to="/products" className="hover:text-gold-500">Products</Link>
          <span>/</span>
          <Link to={`/products?categoryId=${product.categoryId}`} className="hover:text-gold-500">
            {product.categoryName}
          </Link>
          <span>/</span>
          <span className="text-cream-100">{product.name}</span>
        </nav>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Image Gallery */}
          <div className="space-y-4">
            <div className="relative aspect-square rounded-2xl overflow-hidden bg-charcoal-800">
              <AnimatePresence mode="wait">
                <motion.img
                  key={selectedImage}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  src={images[selectedImage]}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              </AnimatePresence>

              {images.length > 1 && (
                <>
                  <button
                    onClick={() => setSelectedImage((prev) => (prev === 0 ? images.length - 1 : prev - 1))}
                    className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-charcoal-900/80 rounded-full flex items-center justify-center text-cream-100 hover:bg-gold-500 hover:text-charcoal-900 transition-colors"
                  >
                    <ChevronLeft className="w-6 h-6" />
                  </button>
                  <button
                    onClick={() => setSelectedImage((prev) => (prev === images.length - 1 ? 0 : prev + 1))}
                    className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-charcoal-900/80 rounded-full flex items-center justify-center text-cream-100 hover:bg-gold-500 hover:text-charcoal-900 transition-colors"
                  >
                    <ChevronRight className="w-6 h-6" />
                  </button>
                </>
              )}

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
              </div>
            </div>

            {/* Thumbnails */}
            {images.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-2">
                {images.map((img, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-colors ${
                      selectedImage === index ? 'border-gold-500' : 'border-transparent'
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <p className="text-gold-500 text-sm font-medium mb-2">{product.categoryName}</p>
              <h1 className="font-display text-3xl md:text-4xl font-bold text-cream-50 mb-4">
                {product.name}
              </h1>

              {/* Rating */}
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-5 h-5 ${
                        i < Math.round(product.rating)
                          ? 'text-gold-500 fill-gold-500'
                          : 'text-charcoal-600'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-charcoal-400">
                  {product.rating.toFixed(1)} ({product.reviewCount} reviews)
                </span>
              </div>
            </div>

            {/* Price */}
            <div className="flex items-baseline gap-4">
              {product.discountPrice < product.basePrice ? (
                <>
                  <span className="text-gold-500 font-display text-4xl font-bold">
                    {formatPrice(product.discountPrice)}
                  </span>
                  <span className="text-charcoal-500 line-through text-xl">
                    {formatPrice(product.basePrice)}
                  </span>
                  <span className="text-emerald-500 text-sm font-medium">
                    Save {formatPrice(product.basePrice - product.discountPrice)}
                  </span>
                </>
              ) : (
                <span className="text-gold-500 font-display text-4xl font-bold">
                  {formatPrice(product.basePrice)}
                </span>
              )}
            </div>

            {/* Metal & Purity */}
            <div className="flex flex-wrap gap-4">
              <div className="px-4 py-2 bg-charcoal-800 rounded-lg">
                <span className="text-charcoal-400 text-sm">Metal:</span>
                <span className="ml-2 text-cream-100 font-medium capitalize">
                  {product.metalType.replace('_', ' ')}
                </span>
              </div>
              <div className="px-4 py-2 bg-charcoal-800 rounded-lg">
                <span className="text-charcoal-400 text-sm">Purity:</span>
                <span className="ml-2 text-cream-100 font-medium">{product.purity}</span>
              </div>
            </div>

            {/* Description */}
            <p className="text-charcoal-300 leading-relaxed">{product.shortDesc || product.description}</p>

            {/* Variants */}
            {product.variants && product.variants.length > 0 && (
              <div>
                <label className="block text-cream-200 font-medium mb-3">Select Size</label>
                <div className="flex flex-wrap gap-3">
                  {product.variants.map((variant) => (
                    <button
                      key={variant.id}
                      onClick={() => setSelectedVariant(variant.id)}
                      className={`px-4 py-2 rounded-lg border transition-colors ${
                        selectedVariant === variant.id
                          ? 'bg-gold-500 border-gold-500 text-charcoal-900'
                          : 'border-charcoal-600 text-cream-100 hover:border-gold-500'
                      }`}
                    >
                      {variant.size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity */}
            <div>
              <label className="block text-cream-200 font-medium mb-3">Quantity</label>
              <div className="flex items-center gap-4">
                <div className="flex items-center bg-charcoal-800 rounded-lg overflow-hidden">
                  <button
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="w-12 h-12 flex items-center justify-center text-cream-100 hover:bg-charcoal-700 transition-colors"
                  >
                    <Minus className="w-5 h-5" />
                  </button>
                  <span className="w-16 text-center text-cream-100 font-medium">{quantity}</span>
                  <button
                    onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
                    className="w-12 h-12 flex items-center justify-center text-cream-100 hover:bg-charcoal-700 transition-colors"
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                </div>
                <span className="text-charcoal-400 text-sm">
                  {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-4">
              <Button
                size="lg"
                className="flex-1"
                onClick={handleAddToCart}
                isLoading={cartLoading}
                disabled={product.stock === 0}
              >
                <ShoppingCart className="w-5 h-5 mr-2" />
                Add to Cart
              </Button>
              <button
                onClick={handleWishlist}
                className={`w-14 h-14 rounded-lg border flex items-center justify-center transition-all ${
                  inWishlist
                    ? 'bg-red-500 border-red-500 text-white'
                    : 'border-charcoal-600 text-cream-100 hover:border-gold-500 hover:text-gold-500'
                }`}
              >
                <Heart className={`w-6 h-6 ${inWishlist ? 'fill-current' : ''}`} />
              </button>
            </div>

            {/* Features */}
            <div className="grid grid-cols-3 gap-4 pt-6 border-t border-charcoal-700">
              <div className="text-center">
                <Shield className="w-8 h-8 mx-auto text-gold-500 mb-2" />
                <p className="text-cream-100 text-sm font-medium">BIS Hallmarked</p>
              </div>
              <div className="text-center">
                <Truck className="w-8 h-8 mx-auto text-gold-500 mb-2" />
                <p className="text-cream-100 text-sm font-medium">Free Shipping</p>
              </div>
              <div className="text-center">
                <RefreshCw className="w-8 h-8 mx-auto text-gold-500 mb-2" />
                <p className="text-cream-100 text-sm font-medium">15-Day Returns</p>
              </div>
            </div>

            {/* Product Features List */}
            {product.features && product.features.length > 0 && (
              <div className="pt-6">
                <h3 className="text-cream-100 font-medium mb-4">Features</h3>
                <ul className="space-y-2">
                  {product.features.map((feature, index) => (
                    <li key={index} className="flex items-center gap-3 text-charcoal-300">
                      <Check className="w-5 h-5 text-gold-500 flex-shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        {/* Description & Reviews Tabs */}
        <div className="mt-16">
          <div className="border-b border-charcoal-700">
            <div className="flex gap-8">
              <button className="px-4 py-3 text-gold-500 border-b-2 border-gold-500 font-medium">
                Description
              </button>
              <button className="px-4 py-3 text-charcoal-400 hover:text-cream-100 transition-colors">
                Reviews ({reviewsData?.data?.count || 0})
              </button>
            </div>
          </div>
          <div className="py-8">
            <p className="text-charcoal-300 leading-relaxed max-w-3xl">{product.description}</p>
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts?.data && relatedProducts.data.length > 0 && (
          <div className="mt-16">
            <h2 className="font-display text-3xl font-bold text-cream-50 mb-8">
              You May Also Like
            </h2>
            <ProductGrid products={relatedProducts.data.filter((p) => p.id !== product.id).slice(0, 4)} />
          </div>
        )}
      </div>
    </div>
  );
};

