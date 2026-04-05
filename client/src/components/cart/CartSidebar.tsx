"use client";

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Minus, Trash2, ShoppingBag, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { useCartStore, CartItem } from '@/store/cartStore';
import { useAuthStore } from '@/store/authStore';
import { cn } from '@/lib/utils';

export default function CartSidebar() {
  const { items, isOpen, setIsOpen, updateQuantity, removeItem, clearCart } = useCartStore();
  const { isAuthenticated } = useAuthStore();

  const subtotal = items.reduce((sum, item) => {
    const price = item.menuItem?.price || item.price || 0;
    return sum + price * item.quantity;
  }, 0);

  const deliveryFee = subtotal > 0 ? 40 : 0;
  const tax = Math.round(subtotal * 0.05);
  const total = subtotal + deliveryFee + tax;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
          />

          {/* Sidebar */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 250 }}
            className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-white dark:bg-slate-900 z-50 flex flex-col shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <ShoppingBag size={20} className="text-primary" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white">Your Cart</h2>
                  <p className="text-xs text-slate-400">{items.length} {items.length === 1 ? 'item' : 'items'}</p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="w-10 h-10 rounded-xl flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <X size={20} className="text-slate-500" />
              </button>
            </div>

            {/* Items */}
            <div className="flex-1 overflow-y-auto p-5 no-scrollbar">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center gap-4">
                  <div className="w-24 h-24 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                    <ShoppingBag size={36} className="text-slate-300 dark:text-slate-600" />
                  </div>
                  <div>
                    <p className="text-lg font-bold text-slate-900 dark:text-white mb-1">Your cart is empty</p>
                    <p className="text-sm text-slate-500">Add some delicious items to get started</p>
                  </div>
                  <button 
                    onClick={() => setIsOpen(false)} 
                    className="px-6 py-2.5 bg-primary text-white rounded-xl font-medium text-sm"
                  >
                    Browse Restaurants
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <AnimatePresence mode="popLayout">
                    {items.map((item) => {
                      const itemName = item.menuItem?.name || item.name || 'Item';
                      const itemPrice = item.menuItem?.price || item.price || 0;
                      const itemImage = item.menuItem?.image || item.image || '';

                      return (
                        <motion.div
                          key={item._id}
                          layout
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 20, height: 0, marginBottom: 0 }}
                          className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50"
                        >
                          {itemImage && (
                            <img src={itemImage} alt={itemName} className="w-16 h-16 rounded-lg object-cover shrink-0" />
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">{itemName}</p>
                            <p className="text-sm font-bold text-primary mt-0.5">₹{itemPrice}</p>
                          </div>
                          <div className="flex items-center gap-1">
                            <motion.button
                              whileTap={{ scale: 0.85 }}
                              onClick={() => {
                                if (item.quantity === 1) removeItem(item._id);
                                else updateQuantity(item._id, item.quantity - 1);
                              }}
                              className="w-8 h-8 rounded-lg bg-white dark:bg-slate-700 flex items-center justify-center border border-slate-200 dark:border-slate-600 hover:border-primary transition-colors"
                            >
                              {item.quantity === 1 ? <Trash2 size={14} className="text-red-500" /> : <Minus size={14} />}
                            </motion.button>
                            <span className="w-8 text-center text-sm font-bold text-slate-900 dark:text-white">{item.quantity}</span>
                            <motion.button
                              whileTap={{ scale: 0.85 }}
                              onClick={() => updateQuantity(item._id, item.quantity + 1)}
                              className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center border border-primary/20 hover:bg-primary/20 transition-colors"
                            >
                              <Plus size={14} />
                            </motion.button>
                          </div>
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>

                  {items.length > 0 && (
                    <button
                      onClick={clearCart}
                      className="text-xs text-red-500 hover:text-red-400 font-medium transition-colors"
                    >
                      Clear Cart
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Footer - Price Summary */}
            {items.length > 0 && (
              <div className="p-5 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900">
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Subtotal</span>
                    <span className="text-slate-900 dark:text-white font-medium">₹{subtotal.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Delivery Fee</span>
                    <span className="text-slate-900 dark:text-white font-medium">₹{deliveryFee}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Tax (5% GST)</span>
                    <span className="text-slate-900 dark:text-white font-medium">₹{tax}</span>
                  </div>
                  <hr className="border-slate-100 dark:border-slate-800" />
                  <div className="flex justify-between">
                    <span className="font-bold text-slate-900 dark:text-white">Total</span>
                    <span className="text-xl font-black text-primary">₹{total.toLocaleString('en-IN')}</span>
                  </div>
                </div>

                <Link href={isAuthenticated ? "/checkout" : "/auth/login"} onClick={() => setIsOpen(false)}>
                  <motion.button
                    whileTap={{ scale: 0.98 }}
                    className="w-full py-4 bg-gradient-to-r from-primary to-primary-dark text-white font-bold rounded-xl shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all flex items-center justify-center gap-2"
                  >
                    {isAuthenticated ? 'Proceed to Checkout' : 'Sign in to Checkout'} <ArrowRight size={18} />
                  </motion.button>
                </Link>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
