"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BarChart3, TrendingUp, DollarSign, Package, Clock, Flame } from 'lucide-react';
import api from '@/lib/axios';
import { cn } from '@/lib/utils';

export default function AdminAnalytics() {
  const [revenue, setRevenue] = useState<any>(null);
  const [orderStats, setOrderStats] = useState<any>(null);
  const [popular, setPopular] = useState<any>(null);
  const [heatmap, setHeatmap] = useState<any>(null);
  const [period, setPeriod] = useState('30');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      try {
        const [rev, ord, pop, heat] = await Promise.all([
          api.get('/admin/analytics/revenue', { params: { period } }),
          api.get('/admin/analytics/orders'),
          api.get('/admin/analytics/popular'),
          api.get('/admin/analytics/heatmap'),
        ]);
        setRevenue(rev.data);
        setOrderStats(ord.data);
        setPopular(pop.data);
        setHeatmap(heat.data);
      } catch (err) {
        console.error('Analytics error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, [period]);

  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const hours = Array.from({ length: 24 }, (_, i) => i);

  const getHeatmapValue = (day: number, hour: number) => {
    const entry = heatmap?.heatmapData?.find((d: any) => d._id.day === day && d._id.hour === hour);
    return entry?.count || 0;
  };

  const maxHeatmapValue = Math.max(1, ...(heatmap?.heatmapData?.map((d: any) => d.count) || [1]));

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white">Financial Analytics</h1>
          <p className="text-sm text-slate-400">Revenue breakdown &amp; data storytelling</p>
        </div>
        <div className="flex gap-2">
          {[{ v: '7', l: '7 Days' }, { v: '30', l: '30 Days' }, { v: '90', l: '90 Days' }].map(p => (
            <button
              key={p.v}
              onClick={() => setPeriod(p.v)}
              className={cn(
                'px-4 py-2 rounded-xl text-xs font-medium transition-all',
                period === p.v ? 'bg-white/10 text-white border border-white/10' : 'text-slate-400 hover:bg-white/5'
              )}
            >
              {p.l}
            </button>
          ))}
        </div>
      </div>

      {/* Revenue Chart (Visual Bar Chart) */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="admin-card p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
            <DollarSign size={18} className="text-emerald-400" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">Revenue Trend</h2>
            <p className="text-xs text-slate-500">Daily revenue for the selected period</p>
          </div>
        </div>
        
        {revenue?.dailyRevenue?.length > 0 ? (
          <div className="flex items-end gap-1 h-48 pt-4">
            {revenue.dailyRevenue.map((day: any, i: number) => {
              const maxRev = Math.max(...revenue.dailyRevenue.map((d: any) => d.revenue));
              const height = maxRev > 0 ? (day.revenue / maxRev) * 100 : 0;
              return (
                <motion.div
                  key={day._id}
                  initial={{ height: 0 }}
                  animate={{ height: `${height}%` }}
                  transition={{ delay: i * 0.02, duration: 0.5 }}
                  className="flex-1 min-w-[4px] rounded-t-md bg-gradient-to-t from-emerald-600 to-emerald-400 relative group cursor-pointer hover:opacity-80 transition-opacity"
                  title={`${day._id}: ₹${day.revenue.toLocaleString('en-IN')} (${day.orders} orders)`}
                >
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                    <div className="bg-slate-800 text-white text-[10px] px-2 py-1 rounded-md whitespace-nowrap font-medium">
                      ₹{day.revenue.toLocaleString('en-IN')}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        ) : (
          <div className="h-48 flex items-center justify-center text-slate-500 text-sm">No revenue data yet</div>
        )}
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Order Status Distribution */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="admin-card p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
              <Package size={18} className="text-blue-400" />
            </div>
            <h2 className="text-lg font-bold text-white">Order Status</h2>
          </div>
          <div className="space-y-3">
            {orderStats?.statusDistribution?.map((status: any) => {
              const total = orderStats.statusDistribution.reduce((s: number, d: any) => s + d.count, 0);
              const pct = total > 0 ? (status.count / total * 100) : 0;
              const colors: Record<string, string> = {
                placed: 'bg-blue-500', confirmed: 'bg-indigo-500', preparing: 'bg-amber-500',
                out_for_delivery: 'bg-purple-500', delivered: 'bg-emerald-500', cancelled: 'bg-red-500'
              };
              return (
                <div key={status._id} className="flex items-center gap-3">
                  <span className="text-xs text-slate-400 w-28 capitalize">{status._id?.replace(/_/g, ' ')}</span>
                  <div className="flex-1 h-6 bg-white/5 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ duration: 0.8 }}
                      className={cn('h-full rounded-full', colors[status._id] || 'bg-slate-500')}
                    />
                  </div>
                  <span className="text-xs text-white font-bold w-12 text-right">{status.count}</span>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* Top Selling Items */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="admin-card p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
              <Flame size={18} className="text-amber-400" />
            </div>
            <h2 className="text-lg font-bold text-white">Top Items</h2>
          </div>
          <div className="space-y-3 max-h-[300px] overflow-y-auto no-scrollbar">
            {popular?.popularItems?.map((item: any, i: number) => (
              <div key={i} className="flex items-center gap-3 p-2 rounded-xl hover:bg-white/[0.03] transition-colors">
                <span className="w-6 h-6 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-400 text-xs font-bold">
                  {i + 1}
                </span>
                {item.image && <img src={item.image} alt={item.name} className="w-8 h-8 rounded-lg object-cover" />}
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white truncate">{item.name}</p>
                  <p className="text-xs text-slate-500">{item.totalOrdered} orders</p>
                </div>
                <span className="text-sm font-bold text-emerald-400">₹{item.totalRevenue?.toLocaleString('en-IN')}</span>
              </div>
            ))}
            {(!popular?.popularItems || popular.popularItems.length === 0) && (
              <p className="text-sm text-slate-500 text-center py-8">No data yet</p>
            )}
          </div>
        </motion.div>
      </div>

      {/* Order Heatmap */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="admin-card p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-violet-500/10 flex items-center justify-center">
            <Clock size={18} className="text-violet-400" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">Order Activity Heatmap</h2>
            <p className="text-xs text-slate-500">Order volume by day &amp; hour</p>
          </div>
        </div>
        <div className="overflow-x-auto no-scrollbar">
          <div className="min-w-[600px]">
            {/* Hour labels */}
            <div className="flex gap-0.5 ml-12 mb-1">
              {hours.filter(h => h % 3 === 0).map(h => (
                <div key={h} className="text-[10px] text-slate-600 text-center" style={{ width: `${100/8}%` }}>
                  {h}:00
                </div>
              ))}
            </div>
            {days.map((day, dayIdx) => (
              <div key={day} className="flex items-center gap-0.5 mb-0.5">
                <span className="text-[10px] text-slate-500 w-10 text-right pr-2">{day}</span>
                <div className="flex-1 flex gap-0.5">
                  {hours.map(hour => {
                    const val = getHeatmapValue(dayIdx + 1, hour);
                    const intensity = maxHeatmapValue > 0 ? val / maxHeatmapValue : 0;
                    return (
                      <div
                        key={hour}
                        className="flex-1 h-6 rounded-[3px] transition-colors cursor-pointer"
                        style={{
                          backgroundColor: intensity > 0 
                            ? `rgba(255, 56, 92, ${0.1 + intensity * 0.7})` 
                            : 'rgba(255,255,255,0.02)'
                        }}
                        title={`${day} ${hour}:00 - ${val} orders`}
                      />
                    );
                  })}
                </div>
              </div>
            ))}
            <div className="flex items-center gap-2 mt-3 ml-12">
              <span className="text-[10px] text-slate-500">Less</span>
              {[0.1, 0.25, 0.5, 0.75, 1].map((v, i) => (
                <div key={i} className="w-4 h-4 rounded-[2px]" style={{ backgroundColor: `rgba(255, 56, 92, ${0.1 + v * 0.7})` }} />
              ))}
              <span className="text-[10px] text-slate-500">More</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Top Restaurants & Payment Methods */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="admin-card p-6">
          <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <TrendingUp size={18} className="text-primary" /> Top Restaurants
          </h2>
          <div className="space-y-3">
            {popular?.topRestaurants?.map((r: any, i: number) => (
              <div key={i} className="flex items-center gap-3 p-2 rounded-xl hover:bg-white/[0.03] transition-colors">
                <span className="w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center">{i + 1}</span>
                {r.image && <img src={r.image} alt={r.name} className="w-8 h-8 rounded-lg object-cover" />}
                <div className="flex-1">
                  <p className="text-sm text-white">{r.name}</p>
                  <p className="text-xs text-slate-500">{r.orderCount} orders</p>
                </div>
                <span className="text-sm font-bold text-emerald-400">₹{r.revenue?.toLocaleString('en-IN')}</span>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="admin-card p-6">
          <h2 className="text-lg font-bold text-white mb-4">Payment Methods</h2>
          <div className="space-y-4">
            {revenue?.paymentMethods?.map((pm: any) => {
              const total = revenue.paymentMethods.reduce((s: number, p: any) => s + p.count, 0);
              const pct = total > 0 ? (pm.count / total * 100) : 0;
              return (
                <div key={pm._id}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-slate-300 capitalize font-medium">{pm._id || 'Unknown'}</span>
                    <span className="text-white font-bold">{pm.count} ({pct.toFixed(0)}%)</span>
                  </div>
                  <div className="h-3 bg-white/5 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      className="h-full rounded-full bg-gradient-to-r from-primary to-accent"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
