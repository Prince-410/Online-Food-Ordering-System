"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  TrendingUp, TrendingDown, Users, ShoppingBag, Store,
  DollarSign, Clock, Activity, ArrowUpRight, ArrowDownRight,
  Package, Sparkles, Zap, Eye, Brain
} from 'lucide-react';
import api from '@/lib/axios';
import Link from 'next/link';
import { cn } from '@/lib/utils';

interface DashboardStats {
  totalUsers: number;
  totalOrders: number;
  totalRestaurants: number;
  totalRevenue: number;
  todayOrders: number;
  todayRevenue: number;
  pendingOrders: number;
  activeDeliveryPartners: number;
  recentOrders: any[];
}

function AnimatedCounter({ value, prefix = '', suffix = '' }: { value: number; prefix?: string; suffix?: string }) {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    const duration = 1500;
    const steps = 60;
    const increment = value / steps;
    let current = 0;
    const timer = setInterval(() => {
      current += increment;
      if (current >= value) { setDisplay(value); clearInterval(timer); }
      else setDisplay(Math.floor(current));
    }, duration / steps);
    return () => clearInterval(timer);
  }, [value]);
  return <span>{prefix}{display.toLocaleString('en-IN')}{suffix}</span>;
}

const statusColors: Record<string, string> = {
  placed: 'bg-blue-500/10 text-blue-400 ring-blue-500/20',
  confirmed: 'bg-indigo-500/10 text-indigo-400 ring-indigo-500/20',
  preparing: 'bg-amber-500/10 text-amber-400 ring-amber-500/20',
  out_for_delivery: 'bg-purple-500/10 text-purple-400 ring-purple-500/20',
  delivered: 'bg-emerald-500/10 text-emerald-400 ring-emerald-500/20',
  cancelled: 'bg-red-500/10 text-red-400 ring-red-500/20',
};

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [insights, setInsights] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, insightsRes] = await Promise.all([
          api.get('/admin/stats'),
          api.get('/admin/ai-insights').catch(() => ({ data: null }))
        ]);
        setStats(statsRes.data);
        setInsights(insightsRes.data);
      } catch (err) {
        console.error('Failed to fetch dashboard stats:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
    const interval = setInterval(fetchData, 30000); // Refresh every 30s
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1,2,3,4].map(i => (
            <div key={i} className="admin-card p-6 animate-pulse">
              <div className="w-10 h-10 rounded-xl bg-white/5 mb-4" />
              <div className="w-20 h-8 bg-white/5 rounded mb-2" />
              <div className="w-32 h-4 bg-white/5 rounded" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  const kpiCards = [
    { 
      label: 'Total Revenue', 
      value: stats?.totalRevenue || 0, 
      prefix: '₹', 
      icon: DollarSign, 
      color: 'from-emerald-500 to-green-600',
      bgGlow: 'bg-emerald-500/10',
      change: insights?.revenueGrowth || 0,
    },
    { 
      label: 'Total Orders', 
      value: stats?.totalOrders || 0, 
      icon: ShoppingBag, 
      color: 'from-blue-500 to-indigo-600',
      bgGlow: 'bg-blue-500/10',
      change: insights?.orderGrowth || 0,
    },
    { 
      label: 'Active Users', 
      value: stats?.totalUsers || 0, 
      icon: Users, 
      color: 'from-violet-500 to-purple-600',
      bgGlow: 'bg-violet-500/10',
      change: 12.5,
    },
    { 
      label: 'Restaurants', 
      value: stats?.totalRestaurants || 0, 
      icon: Store, 
      color: 'from-orange-500 to-red-600',
      bgGlow: 'bg-orange-500/10',
      change: 8.3,
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <motion.h1 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl font-black text-white tracking-tight"
          >
            Dashboard <span className="text-gradient">Overview</span>
          </motion.h1>
          <p className="text-slate-400 mt-1 text-sm">Welcome back! Here&apos;s what&apos;s happening with CraveBite.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-medium text-emerald-400">Live</span>
          </div>
          <span className="text-xs text-slate-500">Last updated: {new Date().toLocaleTimeString()}</span>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpiCards.map((card, i) => {
          const Icon = card.icon;
          return (
            <motion.div
              key={card.label}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="admin-card p-5 relative overflow-hidden group hover:border-white/10 transition-all"
            >
              {/* Background Glow */}
              <div className={cn("absolute -top-12 -right-12 w-32 h-32 rounded-full blur-3xl opacity-30 group-hover:opacity-50 transition-opacity", card.bgGlow)} />
              
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <div className={cn("w-11 h-11 rounded-xl bg-gradient-to-br flex items-center justify-center shadow-lg", card.color)}>
                    <Icon size={20} className="text-white" />
                  </div>
                  <div className={cn(
                    "flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full",
                    card.change >= 0 ? 'text-emerald-400 bg-emerald-500/10' : 'text-red-400 bg-red-500/10'
                  )}>
                    {card.change >= 0 ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                    {Math.abs(card.change)}%
                  </div>
                </div>
                <p className="text-3xl font-black text-white mb-1 tabular-nums">
                  <AnimatedCounter value={card.value} prefix={card.prefix || ''} />
                </p>
                <p className="text-sm text-slate-400 font-medium">{card.label}</p>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Quick Stats Bar */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="grid grid-cols-2 lg:grid-cols-4 gap-3"
      >
        <div className="admin-card p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
            <Clock size={18} className="text-amber-400" />
          </div>
          <div>
            <p className="text-lg font-bold text-white">{stats?.pendingOrders || 0}</p>
            <p className="text-xs text-slate-500">Pending Orders</p>
          </div>
        </div>
        <div className="admin-card p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
            <Package size={18} className="text-blue-400" />
          </div>
          <div>
            <p className="text-lg font-bold text-white">{stats?.todayOrders || 0}</p>
            <p className="text-xs text-slate-500">Today&apos;s Orders</p>
          </div>
        </div>
        <div className="admin-card p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
            <DollarSign size={18} className="text-emerald-400" />
          </div>
          <div>
            <p className="text-lg font-bold text-white">₹{(stats?.todayRevenue || 0).toLocaleString('en-IN')}</p>
            <p className="text-xs text-slate-500">Today&apos;s Revenue</p>
          </div>
        </div>
        <div className="admin-card p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-violet-500/10 flex items-center justify-center">
            <Activity size={18} className="text-violet-400" />
          </div>
          <div>
            <p className="text-lg font-bold text-white">{stats?.activeDeliveryPartners || 0}</p>
            <p className="text-xs text-slate-500">Delivery Partners</p>
          </div>
        </div>
      </motion.div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Orders */}
        <div className="lg:col-span-2">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="admin-card p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
                  <ShoppingBag size={18} className="text-blue-400" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white">Recent Orders</h2>
                  <p className="text-xs text-slate-500">Live order stream</p>
                </div>
              </div>
              <Link href="/admin/orders" className="text-xs font-medium text-primary hover:text-primary-light transition-colors flex items-center gap-1">
                View All <ArrowUpRight size={12} />
              </Link>
            </div>

            <div className="space-y-3 max-h-[400px] overflow-y-auto no-scrollbar">
              {stats?.recentOrders?.map((order: any, i: number) => (
                <motion.div
                  key={order._id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.7 + i * 0.05 }}
                  className="flex items-center gap-4 p-3 rounded-xl bg-white/[0.02] hover:bg-white/[0.05] transition-colors group"
                >
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center text-white font-bold text-xs shrink-0">
                    #{String(order._id).slice(-4)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-white truncate">{order.user?.name || 'Unknown User'}</p>
                    <p className="text-xs text-slate-500 truncate">{order.restaurant?.name} • {order.items?.length} items</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-white">₹{order.pricing?.total?.toLocaleString('en-IN')}</p>
                    <span className={cn("text-[10px] px-2 py-0.5 rounded-full font-semibold ring-1", statusColors[order.orderStatus] || 'bg-slate-500/10 text-slate-400')}>
                      {order.orderStatus?.replace(/_/g, ' ')}
                    </span>
                  </div>
                </motion.div>
              ))}

              {(!stats?.recentOrders || stats.recentOrders.length === 0) && (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <ShoppingBag size={40} className="text-slate-700 mb-3" />
                  <p className="text-slate-500 font-medium">No orders yet</p>
                  <p className="text-xs text-slate-600">Orders will appear here in real-time</p>
                </div>
              )}
            </div>
          </motion.div>
        </div>

        {/* AI Insights Panel */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="admin-card p-6"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg shadow-violet-500/20">
              <Brain size={18} className="text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">AI Insights</h2>
              <p className="text-xs text-slate-500">Powered by analytics</p>
            </div>
          </div>

          <div className="space-y-3">
            {insights?.insights?.map((insight: any, i: number) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 + i * 0.1 }}
                className={cn(
                  "p-3 rounded-xl border transition-colors",
                  insight.type === 'positive' && 'bg-emerald-500/5 border-emerald-500/10',
                  insight.type === 'warning' && 'bg-amber-500/5 border-amber-500/10',
                  insight.type === 'info' && 'bg-blue-500/5 border-blue-500/10',
                  insight.type === 'tip' && 'bg-violet-500/5 border-violet-500/10',
                )}
              >
                <div className="flex items-start gap-3">
                  <span className="text-lg">{insight.icon}</span>
                  <div>
                    <p className="text-sm font-semibold text-white">{insight.title}</p>
                    <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">{insight.message}</p>
                  </div>
                </div>
              </motion.div>
            ))}

            {insights?.growingItems?.length > 0 && (
              <div className="mt-4 pt-4 border-t border-white/5">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <Zap size={12} className="text-amber-400" /> Trending Items
                </p>
                {insights.growingItems.slice(0, 3).map((item: any, i: number) => (
                  <div key={i} className="flex items-center justify-between py-2">
                    <span className="text-sm text-slate-300">{item._id}</span>
                    <span className="text-xs text-emerald-400 font-bold">{item.count} orders</span>
                  </div>
                ))}
              </div>
            )}

            {!insights && (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <Sparkles size={32} className="text-violet-500/50 mb-3" />
                <p className="text-sm text-slate-400">Collecting data for insights...</p>
                <p className="text-xs text-slate-600 mt-1">AI insights will appear once you have more orders</p>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
