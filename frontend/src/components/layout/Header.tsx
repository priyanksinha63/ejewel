import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  ShoppingCart,
  Heart,
  User,
  Menu,
  X,
  LogOut,
  Settings,
  Package,
  LayoutDashboard,
} from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';
import { useCartStore } from '../../stores/cartStore';

export const Header: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const { user, isAuthenticated, logout } = useAuthStore();
  const { itemCount } = useCartStore();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery)}`);
      setSearchQuery('');
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
    setIsUserMenuOpen(false);
  };

  const navLinks = [
    { label: 'Home', path: '/' },
    { label: 'Gold', path: '/products?metalType=gold' },
    { label: 'Silver', path: '/products?metalType=silver' },
    { label: 'Collections', path: '/products' },
    { label: 'New Arrivals', path: '/products?isFeatured=true' },
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-charcoal-900/95 backdrop-blur-md shadow-lg shadow-black/20'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gold-400 to-gold-600 flex items-center justify-center">
              <span className="text-charcoal-900 font-display font-bold text-xl">e</span>
            </div>
            <span className="font-display text-2xl font-semibold text-gold-gradient">
              eJewel
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className="text-cream-200 hover:text-gold-500 transition-colors font-medium"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Right Section */}
          <div className="flex items-center gap-4">
            {/* Search */}
            <form onSubmit={handleSearch} className="hidden md:flex items-center">
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search jewelry..."
                  className="w-48 lg:w-64 pl-10 pr-4 py-2 bg-charcoal-800/50 border border-charcoal-700 rounded-full text-cream-50 text-sm placeholder:text-charcoal-500 focus:border-gold-500 focus:outline-none transition-all"
                />
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-charcoal-500" />
              </div>
            </form>

            {/* Wishlist */}
            {isAuthenticated && (
              <Link
                to="/wishlist"
                className="p-2 text-cream-200 hover:text-gold-500 transition-colors relative"
              >
                <Heart className="w-6 h-6" />
              </Link>
            )}

            {/* Cart */}
            <Link
              to="/cart"
              className="p-2 text-cream-200 hover:text-gold-500 transition-colors relative"
            >
              <ShoppingCart className="w-6 h-6" />
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-gold-500 text-charcoal-900 text-xs font-bold rounded-full flex items-center justify-center">
                  {itemCount}
                </span>
              )}
            </Link>

            {/* User Menu */}
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center gap-2 p-2 text-cream-200 hover:text-gold-500 transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gold-400 to-gold-600 flex items-center justify-center">
                    <span className="text-charcoal-900 font-semibold text-sm">
                      {user?.firstName?.[0]?.toUpperCase()}
                    </span>
                  </div>
                </button>

                <AnimatePresence>
                  {isUserMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute right-0 mt-2 w-56 bg-charcoal-800 border border-charcoal-700 rounded-xl shadow-xl overflow-hidden"
                    >
                      <div className="px-4 py-3 border-b border-charcoal-700">
                        <p className="text-cream-50 font-medium">{user?.firstName} {user?.lastName}</p>
                        <p className="text-charcoal-400 text-sm truncate">{user?.email}</p>
                      </div>
                      <div className="py-2">
                        {user?.role === 'admin' && (
                          <Link
                            to="/admin"
                            onClick={() => setIsUserMenuOpen(false)}
                            className="flex items-center gap-3 px-4 py-2 text-cream-200 hover:bg-charcoal-700 hover:text-gold-500 transition-colors"
                          >
                            <LayoutDashboard className="w-4 h-4" />
                            Admin Dashboard
                          </Link>
                        )}
                        <Link
                          to="/account/orders"
                          onClick={() => setIsUserMenuOpen(false)}
                          className="flex items-center gap-3 px-4 py-2 text-cream-200 hover:bg-charcoal-700 hover:text-gold-500 transition-colors"
                        >
                          <Package className="w-4 h-4" />
                          My Orders
                        </Link>
                        <Link
                          to="/account/settings"
                          onClick={() => setIsUserMenuOpen(false)}
                          className="flex items-center gap-3 px-4 py-2 text-cream-200 hover:bg-charcoal-700 hover:text-gold-500 transition-colors"
                        >
                          <Settings className="w-4 h-4" />
                          Settings
                        </Link>
                        <button
                          onClick={handleLogout}
                          className="flex items-center gap-3 w-full px-4 py-2 text-red-400 hover:bg-charcoal-700 transition-colors"
                        >
                          <LogOut className="w-4 h-4" />
                          Logout
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <Link
                to="/login"
                className="flex items-center gap-2 px-4 py-2 text-gold-500 border border-gold-500 rounded-full hover:bg-gold-500 hover:text-charcoal-900 transition-all"
              >
                <User className="w-4 h-4" />
                <span className="hidden sm:inline">Login</span>
              </Link>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 text-cream-200 hover:text-gold-500"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden bg-charcoal-900/98 border-t border-charcoal-800"
          >
            <div className="px-4 py-6 space-y-4">
              <form onSubmit={handleSearch} className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search jewelry..."
                  className="w-full pl-10 pr-4 py-3 bg-charcoal-800 border border-charcoal-700 rounded-lg text-cream-50 placeholder:text-charcoal-500 focus:border-gold-500 focus:outline-none"
                />
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-charcoal-500" />
              </form>
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block py-2 text-cream-200 hover:text-gold-500 transition-colors text-lg"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

