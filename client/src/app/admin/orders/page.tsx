"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, Search, Filter, ChevronDown, RefreshCw, Eye, Clock, MapPin, Store } from 'lucide-react';
import api from '@/lib/axios';
import { cn } from '@/lib/utils';

const statusOptions = [
  { value: 'all', label: 'All Orders', color: 'bg-slate-400' },
  { value: 'placed', label: 'Placed', color: 'bg-blue-400' },
  { value: 'confirmed', label: 'Confirmed', color: 'bg-indigo-400' },
  { value: 'preparing', label: 'Preparing', color: 'bg-amber-400' },
  { value: 'out_for_delivery', label: 'Out for Delivery', color: 'bg-purple-400' },
  { value: 'delivered', label: 'Delivered', color: 'bg-emerald-400' },
  { value: 'cancelled', label: 'Cancelled', color: 'bg-red-400' },
];

const statusBadge: Record<string, string> = {
  placed: 'bg-blue-500/10 text-blue-400 ring-blue-500/20',
  confirmed: 'bg-indigo-500/10 text-indigo-400 ring-indigo-500/20',
  preparing: 'bg-amber-500/10 text-amber-400 ring-amber-500/20',
  out_for_delivery: 'bg-purple-500/10 text-purple-400 ring-purple-500/20',
  delivered: 'bg-emerald-500/10 text-emerald-400 ring-emerald-500/20',
  cancelled: 'bg-red-500/10 text-red-400 ring-red-500/20',
};

export default function AdminOrders() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/admin/orders', { params: { status: filter, page: currentPage, limit: 15 } });
      setOrders(data.orders || []);
      setTotalPages(data.pages || 1);
    } catch (err) {
      console.error('Failed to fetch orders:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchOrders(); }, [filter, currentPage]);

  const updateStatus = async (orderId: string, newStatus: string) => {
    try {
      await api.patch(`/orders/${orderId}/status`, { status: newStatus });
      fetchOrders();
      if (selectedOrder?._id === orderId) {
        setSelectedOrder({ ...selectedOrder, orderStatus: newStatus });
      }
    } catch (err) {
      console.error('Failed to update status:', err);
    }
  };

  const nextStatus: Record<string, string> = {
    placed: 'confirmed',
    confirmed: 'preparing',
    preparing: 'out_for_delivery',
    out_for_delivery: 'delivered',
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white">Order Management</h1>
          <p className="text-sm text-slate-400">Real-time order stream &amp; management</p>
        </div>
        <button onClick={fetchOrders} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-sm text-slate-300 hover:bg-white/10 transition-colors">
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Refresh
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
        {statusOptions.map(opt => (
          <button
            key={opt.value}
            onClick={() => { setFilter(opt.value); setCurrentPage(1); }}
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all',
              filter === opt.value 
                ? 'bg-white/10 text-white border border-white/10' 
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            )}
          >
            <div className={cn('w-2 h-2 rounded-full', opt.color)} />
            {opt.label}
          </button>
        ))}
      </div>

      {/* Orders Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
        <AnimatePresence mode="popLayout">
          {orders.map((order, i) => (
            <motion.div
              key={order._id}
              layout
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ delay: i * 0.03 }}
              className="admin-card p-5 hover:border-white/10 transition-all group cursor-pointer"
              onClick={() => setSelectedOrder(order)}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-slate-600 to-slate-700 flex items-center justify-center text-white text-xs font-bold">
                    #{String(order._id).slice(-4)}
                  </div>
                  <span className={cn('text-[11px] px-2 py-0.5 rounded-full font-semibold ring-1', statusBadge[order.orderStatus])}>
                    {order.orderStatus?.replace(/_/g, ' ')}
                  </span>
                </div>
                <span className="text-xs text-slate-500">{new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
              </div>

              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center text-primary text-xs font-bold">
                  {order.user?.name?.[0]?.toUpperCase() || '?'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-white truncate">{order.user?.name || 'Unknown'}</p>
                  <p className="text-xs text-slate-500 truncate flex items-center gap-1">
                    <Store size={10} /> {order.restaurant?.name}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-white/5">
                <div>
                  <p className="text-lg font-bold text-white">₹{order.pricing?.total?.toLocaleString('en-IN')}</p>
                  <p className="text-xs text-slate-500">{order.items?.length} items</p>
                </div>
                {nextStatus[order.orderStatus] && (
                  <button
                    onClick={(e) => { e.stopPropagation(); updateStatus(order._id, nextStatus[order.orderStatus]); }}
                    className="px-3 py-1.5 rounded-lg bg-primary/10 text-primary text-xs font-bold hover:bg-primary/20 transition-colors"
                  >
                    → {nextStatus[order.orderStatus].replace(/_/g, ' ')}
                  </button>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {orders.length === 0 && !loading && (
        <div className="admin-card p-16 flex flex-col items-center justify-center text-center">
          <ShoppingBag size={48} className="text-slate-700 mb-4" />
          <p className="text-lg font-semibold text-slate-400">No orders found</p>
          <p className="text-sm text-slate-600">Try changing the filter or check back later</p>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
            <button
              key={page}
              onClick={() => setCurrentPage(page)}
              className={cn(
                'w-8 h-8 rounded-lg text-sm font-medium transition-colors',
                page === currentPage ? 'bg-primary text-white' : 'text-slate-400 hover:bg-white/5'
              )}
            >
              {page}
            </button>
          ))}
        </div>
      )}

      {/* Order Detail Modal */}
      <AnimatePresence>
        {selectedOrder && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedOrder(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="admin-card p-6 w-full max-w-lg max-h-[85vh] overflow-y-auto no-scrollbar"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-white">Order #{String(selectedOrder._id).slice(-6)}</h3>
                <span className={cn('text-xs px-3 py-1 rounded-full font-semibold ring-1', statusBadge[selectedOrder.orderStatus])}>
                  {selectedOrder.orderStatus?.replace(/_/g, ' ')}
                </span>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.03]">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
                    {selectedOrder.user?.name?.[0]?.toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">{selectedOrder.user?.name}</p>
                    <p className="text-xs text-slate-500">{selectedOrder.user?.email}</p>
                  </div>
                </div>

                <div>
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Items</p>
                  {selectedOrder.items?.map((item: any, i: number) => (
                    <div key={i} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
                      <div className="flex items-center gap-3">
                        {item.image && <img src={item.image} alt={item.name} className="w-10 h-10 rounded-lg object-cover" />}
                        <div>
                          <p className="text-sm text-white">{item.name}</p>
                          <p className="text-xs text-slate-500">Qty: {item.quantity}</p>
                        </div>
                      </div>
                      <p className="text-sm font-bold text-white">₹{(item.price * item.quantity).toLocaleString('en-IN')}</p>
                    </div>
                  ))}
                </div>

                <div className="p-3 rounded-xl bg-white/[0.03]">
                  <div className="flex justify-between text-sm mb-1"><span className="text-slate-400">Subtotal</span><span className="text-white">₹{selectedOrder.pricing?.subtotal}</span></div>
                  <div className="flex justify-between text-sm mb-1"><span className="text-slate-400">Delivery</span><span className="text-white">₹{selectedOrder.pricing?.deliveryFee}</span></div>
                  <div className="flex justify-between text-sm mb-1"><span className="text-slate-400">Tax</span><span className="text-white">₹{selectedOrder.pricing?.tax}</span></div>
                  {selectedOrder.pricing?.discount > 0 && (
                    <div className="flex justify-between text-sm mb-1"><span className="text-emerald-400">Discount</span><span className="text-emerald-400">-₹{selectedOrder.pricing?.discount}</span></div>
                  )}
                  <hr className="border-white/5 my-2" />
                  <div className="flex justify-between text-base"><span className="text-white font-bold">Total</span><span className="text-white font-bold">₹{selectedOrder.pricing?.total?.toLocaleString('en-IN')}</span></div>
                </div>

                {nextStatus[selectedOrder.orderStatus] && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => { updateStatus(selectedOrder._id, nextStatus[selectedOrder.orderStatus]); }}
                      className="flex-1 px-4 py-3 rounded-xl bg-primary text-white font-bold text-sm hover:bg-primary-dark transition-colors"
                    >
                      Move to: {nextStatus[selectedOrder.orderStatus].replace(/_/g, ' ')}
                    </button>
                    {selectedOrder.orderStatus !== 'cancelled' && (
                      <button
                        onClick={() => { updateStatus(selectedOrder._id, 'cancelled'); }}
                        className="px-4 py-3 rounded-xl bg-red-500/10 text-red-400 font-bold text-sm hover:bg-red-500/20 transition-colors"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
