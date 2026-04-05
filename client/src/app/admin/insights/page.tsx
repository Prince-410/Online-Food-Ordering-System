"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Brain, TrendingUp, TrendingDown, Zap, Lightbulb, Target, ArrowUpRight, BarChart2, Sparkles } from 'lucide-react';
import api from '@/lib/axios';
import { cn } from '@/lib/utils';

export default function AdminInsights() {
  const [insights, setInsights] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInsights = async () => {
      try {
        const { data } = await api.get('/admin/ai-insights');
        setInsights(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchInsights();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 bg-white/5 rounded animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1,2,3,4].map(i => <div key={i} className="admin-card p-6 h-48 animate-pulse" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-black text-white flex items-center gap-3">
          <Brain className="text-violet-400" size={28} /> AI Insights
        </h1>
        <p className="text-sm text-slate-400 mt-1">Intelligent analysis &amp; predictions powered by your data</p>
      </div>

      {/* Growth Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="admin-card p-5 relative overflow-hidden">
          <div className="absolute -top-8 -right-8 w-24 h-24 rounded-full bg-emerald-500/10 blur-2xl" />
          <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold mb-2">Revenue Growth</p>
          <div className="flex items-end gap-2">
            <span className={cn("text-3xl font-black", (insights?.revenueGrowth || 0) >= 0 ? 'text-emerald-400' : 'text-red-400')}>
              {insights?.revenueGrowth > 0 ? '+' : ''}{insights?.revenueGrowth || 0}%
            </span>
            {(insights?.revenueGrowth || 0) >= 0 ? <TrendingUp size={20} className="text-emerald-400 mb-1" /> : <TrendingDown size={20} className="text-red-400 mb-1" />}
          </div>
          <p className="text-xs text-slate-500 mt-1">vs last 30 days</p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="admin-card p-5 relative overflow-hidden">
          <div className="absolute -top-8 -right-8 w-24 h-24 rounded-full bg-blue-500/10 blur-2xl" />
          <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold mb-2">Order Growth</p>
          <div className="flex items-end gap-2">
            <span className={cn("text-3xl font-black", (insights?.orderGrowth || 0) >= 0 ? 'text-blue-400' : 'text-red-400')}>
              {insights?.orderGrowth > 0 ? '+' : ''}{insights?.orderGrowth || 0}%
            </span>
            {(insights?.orderGrowth || 0) >= 0 ? <TrendingUp size={20} className="text-blue-400 mb-1" /> : <TrendingDown size={20} className="text-red-400 mb-1" />}
          </div>
          <p className="text-xs text-slate-500 mt-1">vs last 30 days</p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="admin-card p-5">
          <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold mb-2">Monthly Revenue</p>
          <p className="text-3xl font-black text-white">₹{(insights?.currentRevenue || 0).toLocaleString('en-IN')}</p>
          <p className="text-xs text-slate-500 mt-1">Current period</p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="admin-card p-5">
          <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold mb-2">Monthly Orders</p>
          <p className="text-3xl font-black text-white">{(insights?.currentOrders || 0).toLocaleString('en-IN')}</p>
          <p className="text-xs text-slate-500 mt-1">Current period</p>
        </motion.div>
      </div>

      {/* AI Insight Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="admin-card p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg shadow-violet-500/20">
              <Sparkles size={18} className="text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">AI Recommendations</h2>
              <p className="text-xs text-slate-500">Data-driven insights for growth</p>
            </div>
          </div>
          <div className="space-y-3">
            {insights?.insights?.map((insight: any, i: number) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + i * 0.1 }}
                className={cn(
                  "p-4 rounded-xl border",
                  insight.type === 'positive' && 'bg-emerald-500/5 border-emerald-500/10',
                  insight.type === 'warning' && 'bg-amber-500/5 border-amber-500/10',
                  insight.type === 'info' && 'bg-blue-500/5 border-blue-500/10',
                  insight.type === 'tip' && 'bg-violet-500/5 border-violet-500/10',
                )}
              >
                <div className="flex items-start gap-3">
                  <span className="text-2xl">{insight.icon}</span>
                  <div>
                    <p className="text-sm font-bold text-white">{insight.title}</p>
                    <p className="text-xs text-slate-400 mt-1 leading-relaxed">{insight.message}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        <div className="space-y-6">
          {/* Trending Items */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="admin-card p-6">
            <div className="flex items-center gap-3 mb-4">
              <Zap size={18} className="text-amber-400" />
              <h2 className="text-lg font-bold text-white">Trending Items</h2>
            </div>
            <div className="space-y-3">
              {insights?.growingItems?.map((item: any, i: number) => {
                const maxCount = insights.growingItems[0]?.count || 1;
                const pct = (item.count / maxCount * 100);
                return (
                  <div key={i}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-slate-300">{item._id}</span>
                      <span className="text-white font-bold">{item.count} orders</span>
                    </div>
                    <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ delay: 0.6 + i * 0.1, duration: 0.6 }}
                        className="h-full rounded-full bg-gradient-to-r from-amber-500 to-orange-500"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>

          {/* Peak Hours */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }} className="admin-card p-6">
            <div className="flex items-center gap-3 mb-4">
              <Target size={18} className="text-blue-400" />
              <h2 className="text-lg font-bold text-white">Peak Hours</h2>
            </div>
            <div className="space-y-3">
              {insights?.peakHours?.map((peak: any, i: number) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-white/[0.03]">
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm",
                      i === 0 ? 'bg-primary/10 text-primary' : 'bg-slate-700/50 text-slate-400'
                    )}>
                      #{i + 1}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-white">{peak._id}:00 - {peak._id + 1}:00</p>
                      <p className="text-xs text-slate-500">{i === 0 ? 'Busiest hour' : 'High traffic'}</p>
                    </div>
                  </div>
                  <span className="text-sm font-bold text-white">{peak.count} orders</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
