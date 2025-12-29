import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { ArrowRight, Sparkles, Shield, Truck, RefreshCw } from 'lucide-react';
import { productsApi } from '../api/products';
import { ProductGrid } from '../components/product/ProductGrid';
import { Button } from '../components/ui/Button';

export const Home: React.FC = () => {
  const { data: featuredProducts, isLoading: loadingFeatured } = useQuery({
    queryKey: ['featuredProducts'],
    queryFn: () => productsApi.getFeaturedProducts(),
  });

  const { data: newArrivals, isLoading: loadingNew } = useQuery({
    queryKey: ['newArrivals'],
    queryFn: () => productsApi.getNewArrivals(),
  });

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: () => productsApi.getCategories(),
  });

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center justify-center hero-pattern overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 60, repeat: Infinity, ease: 'linear' }}
            className="absolute -top-1/2 -right-1/2 w-full h-full"
          >
            <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-gradient-to-br from-gold-500/10 to-transparent rounded-full blur-3xl" />
          </motion.div>
          <motion.div
            animate={{ rotate: -360 }}
            transition={{ duration: 80, repeat: Infinity, ease: 'linear' }}
            className="absolute -bottom-1/2 -left-1/2 w-full h-full"
          >
            <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-gradient-to-tr from-gold-600/10 to-transparent rounded-full blur-3xl" />
          </motion.div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Content */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="inline-flex items-center gap-2 px-4 py-2 bg-gold-500/10 border border-gold-500/30 rounded-full text-gold-500 text-sm font-medium mb-6"
              >
                <Sparkles className="w-4 h-4" />
                Handcrafted Excellence
              </motion.div>

              <h1 className="font-display text-5xl md:text-6xl lg:text-7xl font-bold leading-tight mb-6">
                <span className="text-cream-50">Timeless</span>
                <br />
                <span className="text-gold-gradient">Elegance</span>
                <br />
                <span className="text-cream-50">Redefined</span>
              </h1>

              <p className="text-charcoal-300 text-lg md:text-xl mb-8 max-w-lg">
                Discover our exquisite collection of handcrafted gold and silver jewelry. 
                Each piece is a masterwork of artistry and timeless beauty.
              </p>

              <div className="flex flex-wrap gap-4">
                <Link to="/products">
                  <Button size="lg" className="group">
                    Explore Collection
                    <ArrowRight className="w-5 h-5 ml-2 transition-transform group-hover:translate-x-1" />
                  </Button>
                </Link>
                <Link to="/products?metalType=gold">
                  <Button variant="outline" size="lg">
                    Shop Gold
                  </Button>
                </Link>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-8 mt-12 pt-8 border-t border-charcoal-700">
                <div>
                  <div className="font-display text-3xl font-bold text-gold-500">500+</div>
                  <div className="text-charcoal-400 text-sm">Unique Designs</div>
                </div>
                <div>
                  <div className="font-display text-3xl font-bold text-gold-500">50K+</div>
                  <div className="text-charcoal-400 text-sm">Happy Customers</div>
                </div>
                <div>
                  <div className="font-display text-3xl font-bold text-gold-500">25+</div>
                  <div className="text-charcoal-400 text-sm">Years Legacy</div>
                </div>
              </div>
            </motion.div>

            {/* Hero Image */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="relative hidden lg:block"
            >
              <div className="relative">
                <motion.div
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
                  className="relative z-10"
                >
                  <div className="animated-border rounded-3xl overflow-hidden">
                    <img
                      src="https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=600"
                      alt="Luxury Jewelry"
                      className="w-full h-auto rounded-3xl"
                    />
                  </div>
                </motion.div>
                
                {/* Floating Elements */}
                <motion.div
                  animate={{ y: [0, 15, 0] }}
                  transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
                  className="absolute -bottom-8 -left-8 w-48 h-48 rounded-2xl overflow-hidden border-2 border-gold-500/30 shadow-2xl"
                >
                  <img
                    src="https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=300"
                    alt="Gold Ring"
                    className="w-full h-full object-cover"
                  />
                </motion.div>

                <motion.div
                  animate={{ y: [0, -15, 0] }}
                  transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
                  className="absolute -top-4 -right-4 w-32 h-32 rounded-full overflow-hidden border-2 border-gold-500/30 shadow-2xl"
                >
                  <img
                    src="https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=200"
                    alt="Earrings"
                    className="w-full h-full object-cover"
                  />
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 bg-charcoal-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { icon: Shield, title: 'BIS Hallmarked', desc: '100% Certified Purity' },
              { icon: Truck, title: 'Free Shipping', desc: 'On orders above ₹5,000' },
              { icon: RefreshCw, title: 'Easy Returns', desc: '15-day return policy' },
              { icon: Sparkles, title: 'Lifetime Exchange', desc: 'Upgrade anytime' },
            ].map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-gradient-to-br from-gold-500/20 to-gold-600/10 flex items-center justify-center">
                  <feature.icon className="w-7 h-7 text-gold-500" />
                </div>
                <h3 className="text-cream-50 font-semibold mb-1">{feature.title}</h3>
                <p className="text-charcoal-400 text-sm">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="font-display text-4xl font-bold text-cream-50 mb-4">
              Shop by <span className="text-gold-gradient">Category</span>
            </h2>
            <p className="text-charcoal-400 max-w-2xl mx-auto">
              Explore our diverse collection across various categories
            </p>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {categories?.data?.map((category, index) => (
              <motion.div
                key={category.id}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Link
                  to={`/products?categoryId=${category.id}`}
                  className="group block p-6 bg-charcoal-800/30 rounded-2xl border border-charcoal-700 hover:border-gold-500/50 hover:bg-charcoal-800/50 transition-all text-center"
                >
                  <div className="text-4xl mb-3">{category.icon}</div>
                  <h3 className="text-cream-100 font-medium group-hover:text-gold-500 transition-colors">
                    {category.name}
                  </h3>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-20 bg-gradient-to-b from-transparent via-charcoal-900/50 to-transparent">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12"
          >
            <div>
              <h2 className="font-display text-4xl font-bold text-cream-50 mb-2">
                Featured <span className="text-gold-gradient">Collection</span>
              </h2>
              <p className="text-charcoal-400">Handpicked pieces for discerning tastes</p>
            </div>
            <Link to="/products?isFeatured=true" className="mt-4 md:mt-0">
              <Button variant="outline" className="group">
                View All
                <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
          </motion.div>

          <ProductGrid
            products={featuredProducts?.data || []}
            isLoading={loadingFeatured}
          />
        </div>
      </section>

      {/* New Arrivals */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12"
          >
            <div>
              <h2 className="font-display text-4xl font-bold text-cream-50 mb-2">
                New <span className="text-gold-gradient">Arrivals</span>
              </h2>
              <p className="text-charcoal-400">Fresh additions to our collection</p>
            </div>
            <Link to="/products?sortBy=newest" className="mt-4 md:mt-0">
              <Button variant="outline" className="group">
                View All
                <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
          </motion.div>

          <ProductGrid
            products={newArrivals?.data || []}
            isLoading={loadingNew}
          />
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="relative rounded-3xl overflow-hidden"
          >
            <div className="absolute inset-0">
              <img
                src="https://images.unsplash.com/photo-1617038220319-276d3cfab638?w=1200"
                alt="Jewelry Background"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-charcoal-900 via-charcoal-900/80 to-transparent" />
            </div>
            
            <div className="relative z-10 py-20 px-8 md:px-16 max-w-xl">
              <h2 className="font-display text-4xl md:text-5xl font-bold text-cream-50 mb-4">
                Experience <span className="text-gold-gradient">Luxury</span> Like Never Before
              </h2>
              <p className="text-charcoal-300 text-lg mb-8">
                Visit our showroom for an exclusive in-store experience. Our jewelry consultants are ready to help you find the perfect piece.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link to="/products">
                  <Button size="lg">Shop Now</Button>
                </Link>
                <Link to="/contact">
                  <Button variant="outline" size="lg">Book Appointment</Button>
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

