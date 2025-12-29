import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MapPin, CreditCard, Truck, Plus, Check } from 'lucide-react';
import { useAuthStore } from '../stores/authStore';
import { useCartStore } from '../stores/cartStore';
import { ordersApi } from '../api/orders';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Modal } from '../components/ui/Modal';
import { useToast } from '../components/ui/Toast';
import type { Address, PaymentMethod } from '../types';

export const Checkout: React.FC = () => {
  const { user, updateProfile } = useAuthStore();
  const { cart, fetchCart, clearCart } = useCartStore();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [selectedAddress, setSelectedAddress] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cod');
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [newAddress, setNewAddress] = useState<Partial<Address>>({
    type: 'home',
    street: '',
    city: '',
    state: '',
    country: 'India',
    zipCode: '',
    phone: '',
    isDefault: false,
  });

  useEffect(() => {
    if (user?.addresses?.length > 0) {
      const defaultAddr = user.addresses.find((a) => a.isDefault);
      setSelectedAddress(defaultAddr?.id || user.addresses[0].id);
    }
  }, [user]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(price);
  };

  const subtotal = cart?.total || 0;
  const tax = subtotal * 0.18;
  const shippingCost = subtotal >= 5000 ? 0 : 199;
  const total = subtotal + tax + shippingCost;

  const handleAddAddress = async () => {
    if (!newAddress.street || !newAddress.city || !newAddress.state || !newAddress.zipCode || !newAddress.phone) {
      showToast('Please fill all required fields', 'error');
      return;
    }

    const addresses = [...(user?.addresses || []), { ...newAddress, id: Date.now().toString() }];
    await updateProfile({ addresses: addresses as Address[] });
    setIsAddressModalOpen(false);
    setNewAddress({
      type: 'home',
      street: '',
      city: '',
      state: '',
      country: 'India',
      zipCode: '',
      phone: '',
      isDefault: false,
    });
    showToast('Address added successfully', 'success');
  };

  const handlePlaceOrder = async () => {
    if (!selectedAddress) {
      showToast('Please select a delivery address', 'error');
      return;
    }

    setIsLoading(true);
    try {
      const response = await ordersApi.createOrder({
        addressId: selectedAddress,
        paymentMethod,
        shippingMethod: 'standard',
      });

      if (response.success) {
        await clearCart();
        showToast('Order placed successfully!', 'success');
        navigate(`/account/orders/${response.data?.id}`);
      }
    } catch (error: any) {
      showToast(error.response?.data?.error || 'Failed to place order', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const paymentMethods: { value: PaymentMethod; label: string; desc: string }[] = [
    { value: 'cod', label: 'Cash on Delivery', desc: 'Pay when you receive' },
    { value: 'card', label: 'Credit/Debit Card', desc: 'Visa, Mastercard, Rupay' },
    { value: 'upi', label: 'UPI', desc: 'Google Pay, PhonePe, Paytm' },
  ];

  if (!cart || cart.items?.length === 0) {
    navigate('/cart');
    return null;
  }

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="font-display text-4xl font-bold text-cream-50 mb-8"
        >
          Checkout
        </motion.h1>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-8">
            {/* Delivery Address */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-charcoal-800/50 rounded-xl border border-charcoal-700 p-6"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="flex items-center gap-3 font-display text-xl font-bold text-cream-50">
                  <MapPin className="w-6 h-6 text-gold-500" />
                  Delivery Address
                </h2>
                <Button variant="ghost" size="sm" onClick={() => setIsAddressModalOpen(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add New
                </Button>
              </div>

              {user?.addresses && user.addresses.length > 0 ? (
                <div className="grid md:grid-cols-2 gap-4">
                  {user.addresses.map((address) => (
                    <button
                      key={address.id}
                      onClick={() => setSelectedAddress(address.id)}
                      className={`p-4 rounded-lg border text-left transition-all ${
                        selectedAddress === address.id
                          ? 'border-gold-500 bg-gold-500/10'
                          : 'border-charcoal-600 hover:border-charcoal-500'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <span className="px-2 py-0.5 bg-charcoal-700 rounded text-xs text-charcoal-300 uppercase">
                          {address.type}
                        </span>
                        {selectedAddress === address.id && (
                          <Check className="w-5 h-5 text-gold-500" />
                        )}
                      </div>
                      <p className="text-cream-100 mt-2">{address.street}</p>
                      <p className="text-charcoal-400 text-sm">
                        {address.city}, {address.state} - {address.zipCode}
                      </p>
                      <p className="text-charcoal-400 text-sm mt-1">Phone: {address.phone}</p>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-charcoal-400 mb-4">No addresses saved</p>
                  <Button onClick={() => setIsAddressModalOpen(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Address
                  </Button>
                </div>
              )}
            </motion.div>

            {/* Payment Method */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-charcoal-800/50 rounded-xl border border-charcoal-700 p-6"
            >
              <h2 className="flex items-center gap-3 font-display text-xl font-bold text-cream-50 mb-6">
                <CreditCard className="w-6 h-6 text-gold-500" />
                Payment Method
              </h2>

              <div className="space-y-3">
                {paymentMethods.map((method) => (
                  <button
                    key={method.value}
                    onClick={() => setPaymentMethod(method.value)}
                    className={`w-full p-4 rounded-lg border flex items-center justify-between transition-all ${
                      paymentMethod === method.value
                        ? 'border-gold-500 bg-gold-500/10'
                        : 'border-charcoal-600 hover:border-charcoal-500'
                    }`}
                  >
                    <div className="text-left">
                      <p className="text-cream-100 font-medium">{method.label}</p>
                      <p className="text-charcoal-400 text-sm">{method.desc}</p>
                    </div>
                    {paymentMethod === method.value && (
                      <Check className="w-5 h-5 text-gold-500" />
                    )}
                  </button>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-charcoal-800/50 rounded-xl border border-charcoal-700 p-6 sticky top-24"
            >
              <h2 className="font-display text-xl font-bold text-cream-50 mb-6">Order Summary</h2>

              {/* Items */}
              <div className="space-y-3 max-h-60 overflow-y-auto mb-6">
                {cart.items?.map((item) => (
                  <div key={item.productId} className="flex gap-3">
                    <img
                      src={item.thumbnail || 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=100'}
                      alt={item.productName}
                      className="w-12 h-12 object-cover rounded"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-cream-100 text-sm line-clamp-1">{item.productName}</p>
                      <p className="text-charcoal-400 text-xs">Qty: {item.quantity}</p>
                    </div>
                    <p className="text-cream-100 text-sm">{formatPrice(item.price * item.quantity)}</p>
                  </div>
                ))}
              </div>

              {/* Totals */}
              <div className="space-y-3 text-sm border-t border-charcoal-700 pt-4">
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
                <div className="border-t border-charcoal-700 pt-3 flex justify-between">
                  <span className="text-cream-50 font-semibold">Total</span>
                  <span className="text-gold-500 font-bold text-lg">{formatPrice(total)}</span>
                </div>
              </div>

              <Button
                className="w-full mt-6"
                size="lg"
                onClick={handlePlaceOrder}
                isLoading={isLoading}
                disabled={!selectedAddress}
              >
                Place Order
              </Button>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Add Address Modal */}
      <Modal
        isOpen={isAddressModalOpen}
        onClose={() => setIsAddressModalOpen(false)}
        title="Add New Address"
        size="lg"
      >
        <div className="space-y-4">
          <div className="flex gap-3">
            {['home', 'work', 'other'].map((type) => (
              <button
                key={type}
                onClick={() => setNewAddress((prev) => ({ ...prev, type }))}
                className={`px-4 py-2 rounded-lg border capitalize transition-colors ${
                  newAddress.type === type
                    ? 'border-gold-500 bg-gold-500/10 text-gold-500'
                    : 'border-charcoal-600 text-charcoal-400'
                }`}
              >
                {type}
              </button>
            ))}
          </div>

          <Input
            label="Street Address"
            value={newAddress.street}
            onChange={(e) => setNewAddress((prev) => ({ ...prev, street: e.target.value }))}
            placeholder="Enter street address"
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="City"
              value={newAddress.city}
              onChange={(e) => setNewAddress((prev) => ({ ...prev, city: e.target.value }))}
              placeholder="City"
            />
            <Input
              label="State"
              value={newAddress.state}
              onChange={(e) => setNewAddress((prev) => ({ ...prev, state: e.target.value }))}
              placeholder="State"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="ZIP Code"
              value={newAddress.zipCode}
              onChange={(e) => setNewAddress((prev) => ({ ...prev, zipCode: e.target.value }))}
              placeholder="ZIP Code"
            />
            <Input
              label="Phone"
              value={newAddress.phone}
              onChange={(e) => setNewAddress((prev) => ({ ...prev, phone: e.target.value }))}
              placeholder="Phone number"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button variant="ghost" onClick={() => setIsAddressModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddAddress}>Save Address</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

