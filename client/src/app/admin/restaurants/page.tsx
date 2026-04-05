"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Store, Plus, Edit3, Trash2, Search, MapPin, Star, Clock, X } from 'lucide-react';
import api from '@/lib/axios';
import { cn } from '@/lib/utils';

export default function AdminRestaurants() {
  const [restaurants, setRestaurants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: '', description: '', cuisines: '', image: '', 
    deliveryTime: '30-45 min', deliveryFee: 0, minOrder: 0,
    address: { street: '', city: '', state: '', zip: '' }
  });

  const fetchRestaurants = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/restaurants');
      setRestaurants(data.restaurants || data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchRestaurants(); }, []);

  const handleSubmit = async () => {
    try {
      const payload = {
        ...form,
        cuisines: form.cuisines.split(',').map(c => c.trim()).filter(Boolean)
      };
      if (editId) {
        await api.put(`/restaurants/${editId}`, payload);
      } else {
        await api.post('/restaurants', payload);
      }
      setShowForm(false);
      setEditId(null);
      setForm({ name: '', description: '', cuisines: '', image: '', deliveryTime: '30-45 min', deliveryFee: 0, minOrder: 0, address: { street: '', city: '', state: '', zip: '' } });
      fetchRestaurants();
    } catch (err: any) {
      console.error('Save error:', err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this restaurant?')) return;
    try {
      await api.delete(`/admin/restaurants/${id}`);
      fetchRestaurants();
    } catch (err) {
      console.error(err);
    }
  };

  const startEdit = (r: any) => {
    setEditId(r._id);
    setForm({
      name: r.name, description: r.description || '', cuisines: r.cuisines?.join(', ') || '',
      image: r.image || '', deliveryTime: r.deliveryTime || '30-45 min',
      deliveryFee: r.deliveryFee || 0, minOrder: r.minOrder || 0,
      address: r.address || { street: '', city: '', state: '', zip: '' }
    });
    setShowForm(true);
  };

  const filtered = restaurants.filter(r => 
    r.name?.toLowerCase().includes(search.toLowerCase()) ||
    r.cuisines?.some((c: string) => c.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white">Restaurant Management</h1>
          <p className="text-sm text-slate-400">Manage restaurants &amp; menus</p>
        </div>
        <button
          onClick={() => { setEditId(null); setForm({ name: '', description: '', cuisines: '', image: '', deliveryTime: '30-45 min', deliveryFee: 0, minOrder: 0, address: { street: '', city: '', state: '', zip: '' } }); setShowForm(true); }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-white text-sm font-bold hover:bg-primary-dark transition-colors"
        >
          <Plus size={16} /> Add Restaurant
        </button>
      </div>

      <div className="flex items-center gap-3 px-4 py-3 admin-card">
        <Search size={16} className="text-slate-500" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search restaurants..."
          className="bg-transparent border-none outline-none text-sm text-white placeholder-slate-500 w-full"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map((r, i) => (
          <motion.div
            key={r._id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.03 }}
            className="admin-card overflow-hidden hover:border-white/10 transition-all group"
          >
            <div className="h-40 relative overflow-hidden">
              {r.image ? (
                <img src={r.image} alt={r.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                  <Store size={40} className="text-primary/40" />
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <div className="absolute bottom-3 left-3 flex items-center gap-2">
                <span className="text-xs bg-white/20 backdrop-blur px-2 py-0.5 rounded-md text-white font-bold flex items-center gap-1">
                  <Star size={10} className="text-amber-400" fill="currentColor" /> {r.rating || '4.0'}
                </span>
                <span className="text-xs bg-white/20 backdrop-blur px-2 py-0.5 rounded-md text-white font-medium flex items-center gap-1">
                  <Clock size={10} /> {r.deliveryTime}
                </span>
              </div>
              <div className="absolute top-3 right-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => startEdit(r)} className="w-8 h-8 rounded-lg bg-white/20 backdrop-blur text-white flex items-center justify-center hover:bg-white/30">
                  <Edit3 size={14} />
                </button>
                <button onClick={() => handleDelete(r._id)} className="w-8 h-8 rounded-lg bg-red-500/30 backdrop-blur text-white flex items-center justify-center hover:bg-red-500/50">
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
            <div className="p-4">
              <h3 className="text-sm font-bold text-white mb-1">{r.name}</h3>
              <p className="text-xs text-slate-500 mb-2 line-clamp-1">{r.cuisines?.join(', ')}</p>
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>{r.isOpen ? '🟢 Open' : '🔴 Closed'}</span>
                <span>Min ₹{r.minOrder}</span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Add/Edit Form Modal */}
      {showForm && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setShowForm(false)}
        >
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            className="admin-card p-6 w-full max-w-lg max-h-[85vh] overflow-y-auto no-scrollbar"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-white">{editId ? 'Edit' : 'Add'} Restaurant</h3>
              <button onClick={() => setShowForm(false)} className="text-slate-400 hover:text-white">
                <X size={20} />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-xs text-slate-400 block mb-1">Name *</label>
                <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white outline-none focus:border-primary/50" />
              </div>
              <div>
                <label className="text-xs text-slate-400 block mb-1">Description</label>
                <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={2} className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white outline-none focus:border-primary/50 resize-none" />
              </div>
              <div>
                <label className="text-xs text-slate-400 block mb-1">Cuisines (comma-separated)</label>
                <input value={form.cuisines} onChange={(e) => setForm({ ...form, cuisines: e.target.value })} placeholder="Italian, Indian, Chinese" className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white outline-none focus:border-primary/50" />
              </div>
              <div>
                <label className="text-xs text-slate-400 block mb-1">Image URL</label>
                <input value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })} className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white outline-none focus:border-primary/50" />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Delivery Time</label>
                  <input value={form.deliveryTime} onChange={(e) => setForm({ ...form, deliveryTime: e.target.value })} className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white outline-none focus:border-primary/50" />
                </div>
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Delivery Fee</label>
                  <input type="number" value={form.deliveryFee} onChange={(e) => setForm({ ...form, deliveryFee: +e.target.value })} className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white outline-none focus:border-primary/50" />
                </div>
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Min Order</label>
                  <input type="number" value={form.minOrder} onChange={(e) => setForm({ ...form, minOrder: +e.target.value })} className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white outline-none focus:border-primary/50" />
                </div>
              </div>
              <button onClick={handleSubmit} className="w-full py-3 rounded-xl bg-primary text-white font-bold text-sm hover:bg-primary-dark transition-colors mt-2">
                {editId ? 'Update' : 'Create'} Restaurant
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}
