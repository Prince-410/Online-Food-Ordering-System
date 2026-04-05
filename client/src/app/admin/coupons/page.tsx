"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Ticket, Plus, Edit3, Trash2, Calendar, X } from 'lucide-react';
import api from '@/lib/axios';
import { cn } from '@/lib/utils';

export default function AdminCoupons() {
  const [coupons, setCoupons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    code: '', description: '', discountType: 'percentage', discountValue: 10,
    minOrderAmount: 0, maxDiscount: 0, validUntil: '', usageLimit: 0
  });

  const fetchCoupons = async () => {
    try {
      const { data } = await api.get('/coupons');
      setCoupons(data.coupons || data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCoupons(); }, []);

  const handleCreate = async () => {
    try {
      await api.post('/coupons', {
        ...form,
        maxDiscount: form.maxDiscount || null,
        usageLimit: form.usageLimit || null
      });
      setShowForm(false);
      fetchCoupons();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this coupon?')) return;
    try {
      await api.delete(`/coupons/${id}`);
      fetchCoupons();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-white">Coupon Management</h1>
          <p className="text-sm text-slate-400">Create &amp; manage promotional coupons</p>
        </div>
        <button onClick={() => setShowForm(true)} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-white text-sm font-bold hover:bg-primary-dark transition-colors">
          <Plus size={16} /> Create Coupon
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {coupons.map((coupon, i) => (
          <motion.div
            key={coupon._id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="admin-card p-5 relative overflow-hidden hover:border-white/10 transition-all"
          >
            <div className="absolute top-0 right-0 w-20 h-20 bg-primary/5 rounded-bl-[40px]" />
            <div className="flex items-center justify-between mb-3">
              <span className="text-lg font-black text-primary tracking-wider">{coupon.code}</span>
              <button onClick={() => handleDelete(coupon._id)} className="text-slate-600 hover:text-red-400 transition-colors">
                <Trash2 size={14} />
              </button>
            </div>
            <p className="text-sm text-slate-300 mb-3">{coupon.description}</p>
            <div className="flex items-center gap-3 text-xs text-slate-500">
              <span className="bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded-full font-bold">
                {coupon.discountType === 'percentage' ? `${coupon.discountValue}% OFF` : `₹${coupon.discountValue} OFF`}
              </span>
              <span className="flex items-center gap-1">
                <Calendar size={10} /> {new Date(coupon.validUntil).toLocaleDateString()}
              </span>
            </div>
            <div className="mt-3 pt-3 border-t border-white/5 flex justify-between text-xs text-slate-500">
              <span>Min: ₹{coupon.minOrderAmount}</span>
              <span>Used: {coupon.usedCount}{coupon.usageLimit ? `/${coupon.usageLimit}` : ''}</span>
              <span className={coupon.isActive ? 'text-emerald-400' : 'text-red-400'}>{coupon.isActive ? 'Active' : 'Inactive'}</span>
            </div>
          </motion.div>
        ))}
      </div>

      {coupons.length === 0 && !loading && (
        <div className="admin-card p-16 flex flex-col items-center justify-center text-center">
          <Ticket size={48} className="text-slate-700 mb-4" />
          <p className="text-lg font-semibold text-slate-400">No coupons yet</p>
        </div>
      )}

      {/* Create Form */}
      {showForm && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowForm(false)}>
          <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="admin-card p-6 w-full max-w-md" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-white">Create Coupon</h3>
              <button onClick={() => setShowForm(false)} className="text-slate-400"><X size={20} /></button>
            </div>
            <div className="space-y-3">
              <input value={form.code} onChange={e => setForm({ ...form, code: e.target.value.toUpperCase() })} placeholder="Code (e.g. SAVE20)" className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white outline-none uppercase" />
              <input value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Description" className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white outline-none" />
              <div className="grid grid-cols-2 gap-3">
                <select value={form.discountType} onChange={e => setForm({ ...form, discountType: e.target.value })} className="px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white outline-none">
                  <option value="percentage">Percentage</option>
                  <option value="flat">Flat</option>
                </select>
                <input type="number" value={form.discountValue} onChange={e => setForm({ ...form, discountValue: +e.target.value })} placeholder="Value" className="px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white outline-none" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <input type="number" value={form.minOrderAmount} onChange={e => setForm({ ...form, minOrderAmount: +e.target.value })} placeholder="Min Order ₹" className="px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white outline-none" />
                <input type="number" value={form.maxDiscount} onChange={e => setForm({ ...form, maxDiscount: +e.target.value })} placeholder="Max Discount ₹" className="px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white outline-none" />
              </div>
              <input type="date" value={form.validUntil} onChange={e => setForm({ ...form, validUntil: e.target.value })} className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white outline-none" />
              <button onClick={handleCreate} className="w-full py-3 rounded-xl bg-primary text-white font-bold text-sm hover:bg-primary-dark transition-colors">Create Coupon</button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}
