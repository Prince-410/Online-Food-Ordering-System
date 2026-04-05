"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { useCartStore } from '@/store/cartStore';
import api from '@/lib/axios';
import toast from 'react-hot-toast';
import { MapPin, CreditCard, ArrowRight, Tag, BadgeIcon, Store, ShieldCheck, Loader2, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Script from 'next/script';

export default function CheckoutPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  const { items, restaurantId, discount, appliedCoupon, clearCart, fetchCart } = useCartStore();
  
  const [loading, setLoading] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const [applyingCoupon, setApplyingCoupon] = useState(false);
  
  const [address, setAddress] = useState({
    street: '', city: '', state: '', zipCode: ''
  });

  const getSafePrice = (item: any) => Number(item.price || item.menuItem?.price || 0);

  const subtotal = items.reduce((sum, item) => sum + (getSafePrice(item) * item.quantity), 0);
  const deliveryFee = 40;
  const taxes = subtotal * 0.05;
  const total = Math.max(0, subtotal - (discount || 0) + deliveryFee + taxes);

  useEffect(() => {
    if (!isAuthenticated) {
      toast.error("Please login to checkout");
      router.push('/auth/login');
    }
  }, [isAuthenticated, router]);

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    setApplyingCoupon(true);
    try {
      await api.post('/coupons/apply', { code: couponCode });
      await fetchCart();
      toast.success(`Coupon ${couponCode} applied!`);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Invalid coupon');
    } finally {
      setApplyingCoupon(false);
    }
  };

  const initPayment = async () => {
    if (!address.street || !address.city || !address.state || !address.zipCode) {
      return toast.error("Please fill in all address fields");
    }

    setLoading(true);
    try {
      const orderRes = await api.post('/orders', {
        shippingAddress: address,
        paymentMethod: 'razorpay'
      });
      
      const order = orderRes.data;

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || 'rzp_test_Prince',
        amount: order.totalAmount * 100, // in paise
        currency: "INR",
        name: "CraveBite",
        description: "Food Delivery Order",
        order_id: order.razorpayOrderId,
        handler: async function (response: any) {
          try {
            await api.post('/payment/verify', {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              orderId: order._id
            });
            clearCart();
            toast.success("Payment Successful! Order Placed.");
            router.push(`/orders/${order._id}`);
          } catch (err: any) {
            toast.error("Payment verification failed");
          }
        },
        prefill: {
          name: user?.name,
          email: user?.email,
          contact: user?.phone || '9999999999'
        },
        theme: {
          color: "#ff385c"
        }
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to initiate payment");
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-black flex flex-col items-center justify-center p-6 text-center pt-24">
        <div className="w-24 h-24 bg-slate-100 dark:bg-slate-900 rounded-full flex items-center justify-center mb-6 text-slate-400">
          <Store size={40} />
        </div>
        <h2 className="text-3xl font-bold font-heading mb-4 text-slate-800 dark:text-white">Your cart is empty</h2>
        <p className="text-slate-500 mb-8 max-w-sm">Looks like you haven't added anything to your cart yet. Let's find you some delicious food.</p>
        <button 
          onClick={() => router.push('/restaurants')}
          className="px-8 py-3 bg-primary text-white font-bold rounded-2xl shadow-lg hover:shadow-primary/30 transition-shadow"
        >
          Browse Restaurants
        </button>
      </div>
    );
  }

  return (
    <>
      <Script src="https://checkout.razorpay.com/v1/checkout.js" />
      
      <div className="min-h-screen bg-slate-50 dark:bg-[#0a0a0a] pb-32">
        <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 pt-8 pb-12 relative overflow-hidden">
          <div className="max-w-6xl mx-auto px-6 lg:px-12 relative z-10 w-full mt-16">
            <h1 className="text-3xl md:text-5xl font-black font-heading tracking-tight text-slate-900 dark:text-white mb-2">Checkout</h1>
            <p className="text-slate-500 dark:text-slate-400 font-medium">Almost there! Complete your details to place the order.</p>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-6 lg:px-12 mt-12 flex flex-col lg:flex-row gap-12 items-start">
          {/* Left Column (Forms) */}
          <div className="flex-1 w-full space-y-8">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-card p-6 md:p-8"
            >
              <h2 className="text-xl font-bold font-heading mb-6 flex items-center gap-3 text-slate-800 dark:text-white">
                <MapPin className="text-primary" /> Delivery Address
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="col-span-1 md:col-span-2 relative">
                   <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">Street Address</label>
                   <input
                     type="text"
                     placeholder="House no, Street name, Landmark"
                     value={address.street}
                     onChange={(e) => setAddress({ ...address, street: e.target.value })}
                     className="w-full px-4 py-3.5 bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 rounded-xl outline-none focus:ring-2 focus:ring-primary/50 text-slate-800 dark:text-slate-200 shadow-inner"
                   />
                </div>
                <div>
                   <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">City</label>
                   <input
                     type="text"
                     value={address.city}
                     onChange={(e) => setAddress({ ...address, city: e.target.value })}
                     className="w-full px-4 py-3.5 bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 rounded-xl outline-none focus:ring-2 focus:ring-primary/50 text-slate-800 dark:text-slate-200 shadow-inner"
                   />
                </div>
                <div>
                   <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">State</label>
                   <input
                     type="text"
                     value={address.state}
                     onChange={(e) => setAddress({ ...address, state: e.target.value })}
                     className="w-full px-4 py-3.5 bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 rounded-xl outline-none focus:ring-2 focus:ring-primary/50 text-slate-800 dark:text-slate-200 shadow-inner"
                   />
                </div>
                <div className="col-span-1 md:col-span-2">
                   <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">Zip Code</label>
                   <input
                     type="text"
                     value={address.zipCode}
                     onChange={(e) => setAddress({ ...address, zipCode: e.target.value })}
                     className="w-full px-4 py-3.5 bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 rounded-xl outline-none focus:ring-2 focus:ring-primary/50 text-slate-800 dark:text-slate-200 shadow-inner"
                   />
                </div>
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="glass-card p-6 md:p-8 relative overflow-hidden group"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-bl-full group-hover:scale-110 transition-transform" />
              <h2 className="text-xl font-bold font-heading mb-6 flex items-center gap-3 text-slate-800 dark:text-white relative z-10">
                <Tag className="text-primary" /> Apply Coupon
              </h2>
              
              {!appliedCoupon ? (
                <div className="flex gap-3 relative z-10">
                  <input
                    type="text"
                    placeholder="Enter coupon code (e.g. WELCOME50)"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                    className="flex-1 px-4 py-3.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-primary/50 uppercase font-medium tracking-wide text-slate-800 dark:text-slate-200 shadow-sm"
                  />
                  <button 
                    onClick={handleApplyCoupon}
                    disabled={applyingCoupon || !couponCode}
                    className="px-6 py-3.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold rounded-xl disabled:opacity-50 hover:bg-primary dark:hover:bg-primary dark:hover:text-white transition-colors shadow-lg"
                  >
                    {applyingCoupon ? <Loader2 size={20} className="animate-spin" /> : 'Apply'}
                  </button>
                </div>
              ) : (
                <div className="flex items-center justify-between p-4 bg-green-50 dark:bg-green-500/10 border border-green-200 dark:border-green-500/30 rounded-xl relative z-10">
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="text-green-500" size={24} />
                    <div>
                        <p className="font-bold text-green-700 dark:text-green-400 uppercase tracking-widest text-sm">{appliedCoupon} Applied</p>
                        <p className="text-xs text-green-600 dark:text-green-500 mt-0.5">You saved ₹{discount.toFixed(2)} with this coupon!</p>
                    </div>
                  </div>
                  <button onClick={async () => {
                    await api.post('/coupons/remove');
                    fetchCart();
                  }} className="text-sm font-bold text-slate-400 hover:text-red-500 underline transition-colors">
                    Remove
                  </button>
                </div>
              )}
            </motion.div>
          </div>

          {/* Right Column (Summary) */}
          <div className="w-full lg:w-[400px] shrink-0 space-y-6">
            <motion.div 
               initial={{ opacity: 0, x: 20 }}
               animate={{ opacity: 1, x: 0 }}
               className="glass-card p-6 md:p-8 sticky top-28"
            >
              <h3 className="text-xl font-bold font-heading mb-6 text-slate-800 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-4">
                Order Summary
              </h3>
              
              <div className="flex flex-col gap-4 mb-6 max-h-[300px] overflow-y-auto no-scrollbar">
                {items.map((item) => {
                  const safePrice = getSafePrice(item);
                  return (
                    <div key={item._id} className="flex justify-between items-start">
                      <div className="flex gap-3">
                          <div className={`mt-1 border-2 rounded-sm p-0.5 w-3 h-3 flex items-center justify-center ${(item.isVeg || item.menuItem?.isVeg) ? 'border-green-500 text-green-500' : 'border-red-500 text-red-500'} shrink-0`}>
                             <div className="w-1 h-1 rounded-full bg-current" />
                          </div>
                          <div>
                           <p className="font-medium text-slate-800 dark:text-slate-200 text-sm leading-tight">{item.name || item.menuItem?.name}</p>
                           <p className="text-xs text-slate-500 mt-1">₹{safePrice} x {item.quantity}</p>
                          </div>
                      </div>
                      <span className="font-bold text-slate-900 dark:text-white text-sm whitespace-nowrap">₹{safePrice * item.quantity}</span>
                    </div>
                  );
                })}
              </div>

              <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-5 mb-8 border border-slate-100 dark:border-slate-800">
                <div className="flex flex-col gap-3">
                  <div className="flex justify-between text-slate-600 dark:text-slate-400 text-sm">
                    <span>Item Total</span>
                    <span className="font-medium text-slate-800 dark:text-white">₹{subtotal.toFixed(2)}</span>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between text-green-600 dark:text-green-400 text-sm font-medium">
                      <span>Item Discount</span>
                      <span>-₹{discount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-slate-600 dark:text-slate-400 text-sm">
                    <span>Delivery Fee</span>
                    <span className="font-medium text-slate-800 dark:text-white">₹{deliveryFee.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-slate-600 dark:text-slate-400 text-sm">
                    <span className="flex items-center gap-1 cursor-help" title="Government Taxes">Taxes <ShieldCheck size={12}/></span>
                    <span className="font-medium text-slate-800 dark:text-white">₹{taxes.toFixed(2)}</span>
                  </div>
                  <div className="h-px bg-slate-200 dark:bg-slate-700 my-2" />
                  <div className="flex justify-between items-end">
                    <div>
                        <span className="font-bold text-slate-900 dark:text-white block">Grand Total</span>
                        <span className="text-xs text-slate-500">Including all taxes</span>
                    </div>
                    <span className="text-2xl font-black text-primary">₹{total.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <button 
                onClick={initPayment}
                disabled={loading}
                className="w-full py-4 bg-gradient-to-r from-primary to-accent text-white rounded-2xl font-bold text-lg shadow-[0_8px_20px_-5px_rgba(255,71,87,0.5)] hover:shadow-[0_12px_25px_-5px_rgba(255,71,87,0.6)] hover:-translate-y-1 transition-all flex items-center justify-center gap-2"
              >
                {loading ? <Loader2 className="animate-spin" size={24} /> : (
                  <>Pay Now & Order <ArrowRight size={20} /></>
                )}
              </button>
              
              <div className="mt-6 flex items-center justify-center gap-2 text-xs text-slate-500 font-medium">
                <ShieldCheck size={14} className="text-emerald-500" /> Secure Payments by Razorpay
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </>
  );
}
