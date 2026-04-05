"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { TruckIcon, MapPin, Star, DollarSign, Clock, Activity } from 'lucide-react';
import api from '@/lib/axios';
import { cn } from '@/lib/utils';

export default function AdminDelivery() {
  const [partners, setPartners] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPartners = async () => {
      try {
        const { data } = await api.get('/admin/users', { params: { role: 'delivery_partner' } });
        setPartners(data.users || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchPartners();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-white">Delivery Management</h1>
        <p className="text-sm text-slate-400">Track &amp; manage delivery partners</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="admin-card p-5 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
            <Activity size={18} className="text-emerald-400" />
          </div>
          <div>
            <p className="text-2xl font-bold text-white">{partners.length}</p>
            <p className="text-xs text-slate-500">Total Partners</p>
          </div>
        </div>
        <div className="admin-card p-5 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
            <TruckIcon size={18} className="text-blue-400" />
          </div>
          <div>
            <p className="text-2xl font-bold text-white">0</p>
            <p className="text-xs text-slate-500">Active Deliveries</p>
          </div>
        </div>
        <div className="admin-card p-5 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
            <Star size={18} className="text-amber-400" />
          </div>
          <div>
            <p className="text-2xl font-bold text-white">4.8</p>
            <p className="text-xs text-slate-500">Avg Rating</p>
          </div>
        </div>
      </div>

      {/* Partners List */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {partners.map((partner, i) => (
          <motion.div
            key={partner._id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="admin-card p-5 hover:border-white/10 transition-all"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500/20 to-blue-500/5 flex items-center justify-center text-blue-400 font-bold text-lg">
                {partner.name?.[0]?.toUpperCase() || '?'}
              </div>
              <div>
                <p className="text-sm font-bold text-white">{partner.name}</p>
                <p className="text-xs text-slate-500">{partner.email}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="p-2 rounded-lg bg-white/[0.03] text-center">
                <p className="text-xs text-slate-500">Phone</p>
                <p className="text-sm text-white font-medium">{partner.phone || 'N/A'}</p>
              </div>
              <div className="p-2 rounded-lg bg-white/[0.03] text-center">
                <p className="text-xs text-slate-500">Status</p>
                <p className="text-sm text-emerald-400 font-medium">Active</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {partners.length === 0 && !loading && (
        <div className="admin-card p-16 flex flex-col items-center justify-center text-center">
          <TruckIcon size={48} className="text-slate-700 mb-4" />
          <p className="text-lg font-semibold text-slate-400">No delivery partners yet</p>
          <p className="text-sm text-slate-600">Assign the delivery_partner role to users to see them here</p>
        </div>
      )}
    </div>
  );
}
