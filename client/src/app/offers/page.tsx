"use client";

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/axios';
import { motion, AnimatePresence } from 'framer-motion';
import { BadgeCheck, Copy, Clock, CheckCircle2, Tag, Scissors, Ticket, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';

export default function OffersPage() {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const { data: coupons, isLoading, error } = useQuery({
    queryKey: ['coupons'],
    queryFn: async () => {
      const { data } = await api.get('/coupons');
      return data.coupons || [];
    }
  });

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    toast.success(`Coupon code ${code} copied!`);
    setTimeout(() => setCopiedCode(null), 3000);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#0a0a0a] pt-24 pb-24 px-6 md:px-12 max-w-7xl mx-auto flex flex-col gap-8">
        <div className="w-1/3 h-12 bg-slate-200 dark:bg-slate-800 rounded-xl animate-pulse"></div>
        <div className="w-1/2 h-6 bg-slate-200 dark:bg-slate-800 rounded-lg animate-pulse mb-8"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1,2,3,4,5,6].map(i => <div key={i} className="h-48 bg-slate-200 dark:bg-slate-800 rounded-3xl animate-pulse"></div>)}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center flex-col text-center">
        <h2 className="text-2xl font-bold mb-2">Something went wrong</h2>
        <p className="text-slate-500">Could not fetch available offers</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0a0a0a] pt-12 pb-24 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] -z-10 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-[120px] -z-10 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        
        {/* Header */}
        <div className="flex flex-col items-center justify-center text-center space-y-4 mb-16 relative z-10">
          <div className="w-16 h-16 bg-white dark:bg-slate-900 rounded-2xl shadow-xl flex items-center justify-center mb-2 border border-slate-100 dark:border-slate-800 rotate-12 hover:rotate-0 transition-transform">
             <Tag className="text-primary w-8 h-8" />
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-black font-heading tracking-tight text-slate-800 dark:text-white">
            Exclusive <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">Offers</span>
          </h1>
          <p className="text-lg text-slate-500 max-w-2xl mx-auto font-medium">
            Grab the best deals, discounts, and exclusive promo codes to save on your next delicious meal.
          </p>
        </div>

        {/* Offers Grid */}
        {coupons.length === 0 ? (
          <div className="glass-card p-16 flex flex-col items-center justify-center text-center max-w-2xl mx-auto">
            <Ticket className="text-slate-300 dark:text-slate-700 w-24 h-24 mb-6" />
            <h3 className="text-2xl font-bold font-heading text-slate-800 dark:text-white mb-2">No active offers right now</h3>
            <p className="text-slate-500">Check back later for new discounts and amazing deals!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 relative z-10">
            <AnimatePresence>
              {coupons.map((coupon: any, idx: number) => (
                <motion.div
                  key={coupon._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="bg-white dark:bg-slate-900 rounded-3xl overflow-hidden hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 border border-slate-100 dark:border-slate-800 group relative flex flex-col"
                >
                  {/* Coupon Strip Design */}
                  <div className="absolute top-0 left-0 w-2 h-full bg-gradient-to-b from-primary to-accent" />
                  <div className="absolute top-1/2 -left-4 w-8 h-8 bg-slate-50 dark:bg-[#0a0a0a] rounded-full -translate-y-1/2 border-r border-slate-100 dark:border-slate-800" />
                  <div className="absolute top-1/2 -right-4 w-8 h-8 bg-slate-50 dark:bg-[#0a0a0a] rounded-full -translate-y-1/2 border-l border-slate-100 dark:border-slate-800" />

                  {/* Header / Discount Value */}
                  <div className="p-8 pb-6 border-b border-dashed border-slate-200 dark:border-slate-700 relative">
                     <div className="absolute top-6 right-6 opacity-10 group-hover:opacity-20 transition-opacity">
                        <Sparkles className="w-20 h-20 text-primary" />
                     </div>
                     <h3 className="text-4xl font-black text-slate-800 dark:text-white mb-2">
                       {coupon.discountType === 'percentage' ? `${coupon.discountValue}% OFF` : `₹${coupon.discountValue} OFF`}
                     </h3>
                     <p className="font-bold text-slate-600 dark:text-slate-400">
                       {coupon.description}
                     </p>
                  </div>

                  {/* Details */}
                  <div className="px-8 py-6 flex-1 flex flex-col justify-between">
                     <ul className="space-y-3 mb-6">
                        <li className="flex items-start gap-2 text-sm text-slate-500">
                           <BadgeCheck className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                           <span>Applicable when spending above <strong className="text-slate-800 dark:text-slate-300 font-bold">₹{coupon.minOrderAmount}</strong></span>
                        </li>
                        <li className="flex items-start gap-2 text-sm text-slate-500">
                           <Clock className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                           <span>Valid until <strong className="text-slate-800 dark:text-slate-300 font-bold">{new Date(coupon.validUntil).toLocaleDateString()}</strong></span>
                        </li>
                        {coupon.maxDiscount > 0 && coupon.discountType === 'percentage' && (
                           <li className="flex items-start gap-2 text-sm text-slate-500">
                              <BadgeCheck className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                              <span>Maximum discount up to <strong className="text-slate-800 dark:text-slate-300 font-bold">₹{coupon.maxDiscount}</strong></span>
                           </li>
                        )}
                     </ul>

                     <div className="mt-auto">
                       <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block text-center">Tap to copy code</label>
                       <button 
                         onClick={() => copyCode(coupon.code)}
                         className={`w-full py-4 border-2 border-dashed ${copiedCode === coupon.code ? 'border-green-500 bg-green-50 dark:bg-green-500/10 text-green-600 dark:text-green-400' : 'border-slate-300 dark:border-slate-700 hover:border-primary hover:bg-primary/5 text-slate-800 dark:text-white'} rounded-2xl font-black font-mono text-xl tracking-widest flex items-center justify-center gap-3 transition-colors`}
                       >
                         {copiedCode === coupon.code ? (
                           <>
                             COPIED <CheckCircle2 className="w-5 h-5" />
                           </>
                         ) : (
                           <>
                             {coupon.code} <Copy className="w-5 h-5 opacity-50" />
                           </>
                         )}
                       </button>
                     </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}
