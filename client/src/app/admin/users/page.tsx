"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Search, Shield, Ban, Crown, ChevronDown, Mail, Phone, Calendar } from 'lucide-react';
import api from '@/lib/axios';
import { cn } from '@/lib/utils';

const roleColors: Record<string, string> = {
  customer: 'bg-blue-500/10 text-blue-400',
  admin: 'bg-amber-500/10 text-amber-400',
  restaurant_owner: 'bg-emerald-500/10 text-emerald-400',
  delivery_partner: 'bg-purple-500/10 text-purple-400',
};

export default function AdminUsers() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/admin/users', { params: { search, role: roleFilter, page, limit: 20 } });
      setUsers(data.users || []);
      setTotalPages(data.pages || 1);
    } catch (err) {
      console.error('Failed to fetch users:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, [search, roleFilter, page]);

  const updateRole = async (userId: string, newRole: string) => {
    try {
      await api.put(`/admin/users/${userId}/role`, { role: newRole });
      fetchUsers();
    } catch (err) {
      console.error('Failed to update role:', err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white">User Management</h1>
          <p className="text-sm text-slate-400">Manage users, roles &amp; behavior</p>
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <Users size={14} /> {users.length} users shown
        </div>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 flex items-center gap-3 px-4 py-3 admin-card">
          <Search size={16} className="text-slate-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search by name or email..."
            className="bg-transparent border-none outline-none text-sm text-white placeholder-slate-500 w-full"
          />
        </div>
        <div className="flex gap-2">
          {['', 'customer', 'admin', 'restaurant_owner', 'delivery_partner'].map(role => (
            <button
              key={role}
              onClick={() => { setRoleFilter(role); setPage(1); }}
              className={cn(
                'px-3 py-2 rounded-xl text-xs font-medium transition-all whitespace-nowrap',
                roleFilter === role ? 'bg-white/10 text-white border border-white/10' : 'text-slate-400 hover:bg-white/5'
              )}
            >
              {role ? role.replace(/_/g, ' ') : 'All'}
            </button>
          ))}
        </div>
      </div>

      {/* Users Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {users.map((user, i) => (
          <motion.div
            key={user._id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.03 }}
            className="admin-card p-5 hover:border-white/10 transition-all"
          >
            <div className="flex items-start gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center text-primary font-bold text-lg shrink-0">
                {user.avatar ? (
                  <img src={user.avatar} alt={user.name} className="w-full h-full rounded-xl object-cover" />
                ) : (
                  user.name?.[0]?.toUpperCase()
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-white truncate">{user.name}</p>
                <p className="text-xs text-slate-500 truncate flex items-center gap-1">
                  <Mail size={10} /> {user.email}
                </p>
                {user.phone && (
                  <p className="text-xs text-slate-600 flex items-center gap-1 mt-0.5">
                    <Phone size={10} /> {user.phone}
                  </p>
                )}
              </div>
              <span className={cn('text-[10px] px-2 py-0.5 rounded-full font-semibold capitalize', roleColors[user.role])}>
                {user.role?.replace(/_/g, ' ')}
              </span>
            </div>

            <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-1 text-xs text-slate-500">
                <Calendar size={12} />
                Joined {new Date(user.createdAt).toLocaleDateString()}
              </div>
              <select
                value={user.role}
                onChange={(e) => updateRole(user._id, e.target.value)}
                className="bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-xs text-slate-300 outline-none cursor-pointer"
              >
                <option value="customer">Customer</option>
                <option value="admin">Admin</option>
                <option value="restaurant_owner">Restaurant Owner</option>
                <option value="delivery_partner">Delivery Partner</option>
              </select>
            </div>
          </motion.div>
        ))}
      </div>

      {users.length === 0 && !loading && (
        <div className="admin-card p-16 flex flex-col items-center justify-center text-center">
          <Users size={48} className="text-slate-700 mb-4" />
          <p className="text-lg font-semibold text-slate-400">No users found</p>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
            <button
              key={p}
              onClick={() => setPage(p)}
              className={cn('w-8 h-8 rounded-lg text-sm font-medium', p === page ? 'bg-primary text-white' : 'text-slate-400 hover:bg-white/5')}
            >
              {p}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
