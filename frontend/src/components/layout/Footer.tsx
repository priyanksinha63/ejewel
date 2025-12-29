import React from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Instagram, Twitter, Youtube, Mail, Phone, MapPin } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-charcoal-900 border-t border-charcoal-800">
      {/* Newsletter Section */}
      <div className="bg-gradient-to-r from-gold-600/10 via-gold-500/5 to-gold-600/10 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h3 className="font-display text-2xl md:text-3xl text-gold-500 mb-4">
            Subscribe to Our Newsletter
          </h3>
          <p className="text-charcoal-300 mb-6 max-w-md mx-auto">
            Get exclusive offers, new arrivals updates, and special discounts directly to your inbox.
          </p>
          <form className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-4 py-3 bg-charcoal-800 border border-charcoal-700 rounded-lg text-cream-50 placeholder:text-charcoal-500 focus:border-gold-500 focus:outline-none"
            />
            <button className="btn-gold whitespace-nowrap">
              Subscribe
            </button>
          </form>
        </div>
      </div>

      {/* Main Footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div>
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gold-400 to-gold-600 flex items-center justify-center">
                <span className="text-charcoal-900 font-display font-bold text-xl">e</span>
              </div>
              <span className="font-display text-2xl font-semibold text-gold-gradient">
                eJewel
              </span>
            </Link>
            <p className="text-charcoal-400 text-sm mb-6">
              Discover exquisite gold and silver jewelry crafted with precision and passion. Every piece tells a story of elegance and timeless beauty.
            </p>
            <div className="flex gap-4">
              <a href="#" className="w-10 h-10 rounded-full bg-charcoal-800 flex items-center justify-center text-charcoal-400 hover:bg-gold-500 hover:text-charcoal-900 transition-all">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-charcoal-800 flex items-center justify-center text-charcoal-400 hover:bg-gold-500 hover:text-charcoal-900 transition-all">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-charcoal-800 flex items-center justify-center text-charcoal-400 hover:bg-gold-500 hover:text-charcoal-900 transition-all">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-charcoal-800 flex items-center justify-center text-charcoal-400 hover:bg-gold-500 hover:text-charcoal-900 transition-all">
                <Youtube className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-cream-50 font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li><Link to="/products" className="text-charcoal-400 hover:text-gold-500 transition-colors">All Products</Link></li>
              <li><Link to="/products?metalType=gold" className="text-charcoal-400 hover:text-gold-500 transition-colors">Gold Jewelry</Link></li>
              <li><Link to="/products?metalType=silver" className="text-charcoal-400 hover:text-gold-500 transition-colors">Silver Jewelry</Link></li>
              <li><Link to="/products?isFeatured=true" className="text-charcoal-400 hover:text-gold-500 transition-colors">New Arrivals</Link></li>
              <li><Link to="/about" className="text-charcoal-400 hover:text-gold-500 transition-colors">About Us</Link></li>
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h4 className="text-cream-50 font-semibold mb-4">Customer Service</h4>
            <ul className="space-y-2">
              <li><Link to="/contact" className="text-charcoal-400 hover:text-gold-500 transition-colors">Contact Us</Link></li>
              <li><Link to="/faq" className="text-charcoal-400 hover:text-gold-500 transition-colors">FAQs</Link></li>
              <li><Link to="/shipping" className="text-charcoal-400 hover:text-gold-500 transition-colors">Shipping Policy</Link></li>
              <li><Link to="/returns" className="text-charcoal-400 hover:text-gold-500 transition-colors">Returns & Exchanges</Link></li>
              <li><Link to="/privacy" className="text-charcoal-400 hover:text-gold-500 transition-colors">Privacy Policy</Link></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-cream-50 font-semibold mb-4">Get in Touch</h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-gold-500 flex-shrink-0 mt-0.5" />
                <span className="text-charcoal-400 text-sm">
                  123 Jewelry Lane, Gold District<br />
                  Mumbai, Maharashtra 400001
                </span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-gold-500 flex-shrink-0" />
                <a href="tel:+911234567890" className="text-charcoal-400 hover:text-gold-500 transition-colors text-sm">
                  +91 123 456 7890
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-gold-500 flex-shrink-0" />
                <a href="mailto:hello@ejewel.com" className="text-charcoal-400 hover:text-gold-500 transition-colors text-sm">
                  hello@ejewel.com
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-charcoal-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-charcoal-500 text-sm">
              © {new Date().getFullYear()} eJewel. All rights reserved.
            </p>
            <div className="flex items-center gap-6">
              <img src="https://upload.wikimedia.org/wikipedia/commons/a/a4/Visa_2021.svg" alt="Visa" className="h-6 opacity-50" />
              <img src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg" alt="Mastercard" className="h-6 opacity-50" />
              <img src="https://upload.wikimedia.org/wikipedia/commons/b/b5/PayPal.svg" alt="PayPal" className="h-6 opacity-50" />
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

