"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { Bell, CheckCheck, Info, Gift, Package } from 'lucide-react';

const mockNotifications = [
  { id: 1, title: 'New Order Received', message: 'Order #1234 placed by John Doe', time: '2 min ago', type: 'order', read: false },
  { id: 2, title: 'Low Stock Alert', message: 'Paneer Tikka is running low at Spice House', time: '15 min ago', type: 'alert', read: false },
  { id: 3, title: 'New User Registered', message: 'Sarah joined CraveBite', time: '1 hour ago', type: 'user', read: true },
  { id: 4, title: 'Payment Received', message: '₹1,250 payment confirmed for Order #1230', time: '2 hours ago', type: 'payment', read: true },
  { id: 5, title: 'Review Posted', message: '5★ review on Burger Palace', time: '3 hours ago', type: 'review', read: true },
];

export default function AdminNotifications() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-white">Notifications</h1>
          <p className="text-sm text-slate-400">All system notifications</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-sm text-slate-300 hover:bg-white/10 transition-colors">
          <CheckCheck size={14} /> Mark All Read
        </button>
      </div>

      <div className="space-y-3">
        {mockNotifications.map((notif, i) => (
          <motion.div
            key={notif.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05 }}
            className={`admin-card p-4 flex items-start gap-4 ${!notif.read ? 'border-l-2 border-l-primary' : ''}`}
          >
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
              notif.type === 'order' ? 'bg-blue-500/10 text-blue-400' :
              notif.type === 'alert' ? 'bg-amber-500/10 text-amber-400' :
              notif.type === 'payment' ? 'bg-emerald-500/10 text-emerald-400' :
              'bg-violet-500/10 text-violet-400'
            }`}>
              {notif.type === 'order' ? <Package size={18} /> :
               notif.type === 'alert' ? <Info size={18} /> :
               notif.type === 'payment' ? <Gift size={18} /> :
               <Bell size={18} />}
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-white">{notif.title}</p>
              <p className="text-xs text-slate-400 mt-0.5">{notif.message}</p>
            </div>
            <span className="text-xs text-slate-600 whitespace-nowrap">{notif.time}</span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
