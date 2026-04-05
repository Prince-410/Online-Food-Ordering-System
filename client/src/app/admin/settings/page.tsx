"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Settings, Globe, Bell, Shield, Palette, Database, Save } from 'lucide-react';

export default function AdminSettings() {
  const [settings, setSettings] = useState({
    siteName: 'CraveBite',
    tagline: 'Next-Gen Food Delivery',
    currency: 'INR',
    language: 'en',
    deliveryRadius: 15,
    minOrderAmount: 99,
    taxRate: 5,
    enableNotifications: true,
    enableEmails: true,
    maintenanceMode: false,
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-white">Settings</h1>
        <p className="text-sm text-slate-400">Platform configuration</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="admin-card p-6">
          <div className="flex items-center gap-3 mb-6">
            <Globe size={18} className="text-blue-400" />
            <h2 className="text-lg font-bold text-white">General</h2>
          </div>
          <div className="space-y-4">
            <div>
              <label className="text-xs text-slate-400 block mb-1">Site Name</label>
              <input value={settings.siteName} onChange={e => setSettings({ ...settings, siteName: e.target.value })} className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white outline-none" />
            </div>
            <div>
              <label className="text-xs text-slate-400 block mb-1">Currency</label>
              <select value={settings.currency} onChange={e => setSettings({ ...settings, currency: e.target.value })} className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white outline-none">
                <option value="INR">INR (₹)</option>
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
              </select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-slate-400 block mb-1">Delivery Radius (km)</label>
                <input type="number" value={settings.deliveryRadius} onChange={e => setSettings({ ...settings, deliveryRadius: +e.target.value })} className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white outline-none" />
              </div>
              <div>
                <label className="text-xs text-slate-400 block mb-1">Tax Rate (%)</label>
                <input type="number" value={settings.taxRate} onChange={e => setSettings({ ...settings, taxRate: +e.target.value })} className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white outline-none" />
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="admin-card p-6">
          <div className="flex items-center gap-3 mb-6">
            <Bell size={18} className="text-amber-400" />
            <h2 className="text-lg font-bold text-white">Notifications</h2>
          </div>
          <div className="space-y-4">
            {[
              { key: 'enableNotifications', label: 'Push Notifications', desc: 'Send push notifications to users' },
              { key: 'enableEmails', label: 'Email Alerts', desc: 'Send email notifications' },
              { key: 'maintenanceMode', label: 'Maintenance Mode', desc: 'Enable site maintenance mode' },
            ].map(toggle => (
              <div key={toggle.key} className="flex items-center justify-between p-3 rounded-xl bg-white/[0.03]">
                <div>
                  <p className="text-sm text-white font-medium">{toggle.label}</p>
                  <p className="text-xs text-slate-500">{toggle.desc}</p>
                </div>
                <button
                  onClick={() => setSettings({ ...settings, [toggle.key]: !(settings as any)[toggle.key] })}
                  className={`w-12 h-6 rounded-full transition-colors relative ${(settings as any)[toggle.key] ? 'bg-primary' : 'bg-slate-700'}`}
                >
                  <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-all ${(settings as any)[toggle.key] ? 'left-6' : 'left-0.5'}`} />
                </button>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      <button className="flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-white font-bold hover:bg-primary-dark transition-colors">
        <Save size={16} /> Save Settings
      </button>
    </div>
  );
}
