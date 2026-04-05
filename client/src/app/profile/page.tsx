"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '@/store/authStore';
import api from '@/lib/axios';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Mail, Phone, MapPin, Package, Settings, LogOut, ChevronRight, Clock, Star, Edit3 } from 'lucide-react';
import Link from 'next/link';

export default function ProfilePage() {
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuthStore();
  const [activeTab, setActiveTab] = useState('orders');

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/login');
    }
  }, [isAuthenticated, router]);

  const { data: orders, isLoading: isLoadingOrders } = useQuery({
    queryKey: ['my-orders'],
    queryFn: async () => {
      const { data } = await api.get('/orders/my-orders');
      return data;
    },
    enabled: isAuthenticated,
  });

  if (!isAuthenticated || !user) return null;

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0a0a0a] pt-24 pb-24">
      <div className="max-w-7xl mx-auto px-6 lg:px-12 flex flex-col lg:flex-row gap-8">
        
        {/* Sidebar */}
        <div className="w-full lg:w-80 shrink-0 space-y-6">
          <div className="glass-card p-6 md:p-8 flex flex-col items-center text-center relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-bl-full -z-10 group-hover:scale-110 transition-transform" />
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-accent/10 rounded-tr-full -z-10 group-hover:scale-110 transition-transform" />
            
            <div className="w-24 h-24 bg-gradient-to-tr from-primary to-accent rounded-full mb-4 flex items-center justify-center p-1 shadow-xl">
              <div className="w-full h-full rounded-full overflow-hidden bg-white dark:bg-slate-900 border-4 border-white dark:border-slate-800 flex items-center justify-center text-slate-300">
                 {user.avatar ? (
                    <img src={user.avatar} className="w-full h-full object-cover" />
                 ) : (
                    <User size={40} className="text-slate-400" />
                 )}
              </div>
            </div>
            
            <h2 className="text-2xl font-bold font-heading text-slate-800 dark:text-white mb-1">{user.name}</h2>
            <p className="text-slate-500 font-medium text-sm flex items-center gap-1"><Mail size={14}/> {user.email}</p>
            
            <button className="mt-6 w-full py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors">
              <Edit3 size={16} /> Edit Profile
            </button>
          </div>

          <div className="glass-card overflow-hidden">
            <div className="flex flex-col">
              <button 
                onClick={() => setActiveTab('orders')}
                className={`flex items-center justify-between p-4 ${activeTab === 'orders' ? 'bg-primary/5 text-primary border-l-4 border-primary' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 border-l-4 border-transparent'} transition-colors font-medium`}
              >
                <div className="flex items-center gap-3"><Package size={18}/> My Orders</div>
                <ChevronRight size={16} />
              </button>
              <button 
                onClick={() => setActiveTab('addresses')}
                className={`flex items-center justify-between p-4 ${activeTab === 'addresses' ? 'bg-primary/5 text-primary border-l-4 border-primary' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 border-l-4 border-transparent'} transition-colors font-medium`}
              >
                <div className="flex items-center gap-3"><MapPin size={18}/> Saved Addresses</div>
                <ChevronRight size={16} />
              </button>
              <button 
                onClick={() => setActiveTab('settings')}
                className={`flex items-center justify-between p-4 ${activeTab === 'settings' ? 'bg-primary/5 text-primary border-l-4 border-primary' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 border-l-4 border-transparent'} transition-colors font-medium`}
              >
                <div className="flex items-center gap-3"><Settings size={18}/> Settings</div>
                <ChevronRight size={16} />
              </button>
            </div>
            <div className="p-4 border-t border-slate-100 dark:border-slate-800">
               <button 
                 onClick={handleLogout}
                 className="flex items-center gap-3 text-red-500 hover:text-red-600 font-bold p-2 transition-colors w-full"
               >
                 <LogOut size={18}/> Sign Out
               </button>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 w-full">
           {activeTab === 'orders' && (
             <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                <h1 className="text-3xl font-black font-heading text-slate-800 dark:text-white mb-2">Order History</h1>
                <p className="text-slate-500 mb-8">View and track all your recent orders.</p>
                
                {isLoadingOrders ? (
                   <div className="space-y-4">
                     {[1,2,3].map(i => <div key={i} className="h-32 bg-slate-200 dark:bg-slate-800 animate-pulse rounded-2xl w-full"></div>)}
                   </div>
                ) : !orders || orders.length === 0 ? (
                   <div className="glass-card p-12 flex flex-col items-center justify-center text-center text-slate-500">
                      <Package size={64} className="mb-4 opacity-50 text-primary" />
                      <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2">No orders yet</h3>
                      <p className="mb-6">You haven't placed any orders yet. Start exploring restaurants!</p>
                      <Link href="/restaurants" className="px-6 py-3 bg-primary text-white rounded-xl font-bold hover:shadow-lg transition-shadow">Order Food Now</Link>
                   </div>
                ) : (
                   <div className="space-y-6">
                     {orders.map((order: any) => (
                        <div key={order._id} className="glass-card hover:-translate-y-1 transition-transform duration-300">
                           <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                              <div>
                                 <div className="flex items-center gap-3 mb-2">
                                    <h3 className="font-bold text-lg text-slate-800 dark:text-white">{order.restaurant?.name || 'Restaurant'}</h3>
                                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider ${
                                      order.orderStatus === 'delivered' ? 'bg-green-100 text-green-600 dark:bg-green-500/20' :
                                      order.orderStatus === 'cancelled' ? 'bg-red-100 text-red-600 dark:bg-red-500/20' :
                                      'bg-blue-100 text-blue-600 dark:bg-blue-500/20'
                                    }`}>
                                      {order.orderStatus.replace('_', ' ')}
                                    </span>
                                 </div>
                                 <p className="text-sm text-slate-500 flex items-center gap-2">
                                   <Clock size={14} /> {new Date(order.createdAt).toLocaleDateString()} at {new Date(order.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                 </p>
                              </div>
                              <div className="text-right flex md:flex-col items-center justify-between w-full md:w-auto mt-2 md:mt-0">
                                 <span className="font-black text-xl text-primary">₹{order.totalAmount}</span>
                                 <Link href={`/orders/${order._id}`} className="text-sm font-bold text-slate-800 dark:text-white underline hover:text-primary transition-colors">Track Order</Link>
                              </div>
                           </div>
                           <div className="px-6 py-4 bg-slate-50 dark:bg-slate-800/30 rounded-b-2xl">
                             <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">
                               {order.items.map((item: any) => `${item.quantity} × ${item.name}`).join(', ')}
                             </p>
                             {order.orderStatus === 'delivered' && (
                               <div className="mt-4 flex gap-2">
                                  <button className="text-sm font-bold px-4 py-2 bg-white dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-white border border-slate-200 dark:border-slate-700 rounded-lg shadow-sm">Reorder</button>
                                  <button className="text-sm font-bold flex gap-1 items-center px-4 py-2 bg-amber-50 dark:bg-amber-500/10 text-amber-600 rounded-lg hover:bg-amber-100 transition-colors border border-amber-200 dark:border-amber-500/20 shadow-sm"><Star size={14}/> Rate Order</button>
                               </div>
                             )}
                           </div>
                        </div>
                     ))}
                   </div>
                )}
             </motion.div>
           )}

           {activeTab === 'addresses' && (
             <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                <div className="flex items-center justify-between mb-2">
                  <h1 className="text-3xl font-black font-heading text-slate-800 dark:text-white">Saved Addresses</h1>
                  <button className="px-4 py-2 bg-primary text-white rounded-lg font-bold text-sm shadow-md hover:shadow-lg transition-all">+ Add New</button>
                </div>
                <p className="text-slate-500 mb-8">Manage your delivery locations for faster checkout.</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   {user.addresses && user.addresses.length > 0 ? user.addresses.map((addr: any, idx: number) => (
                      <div key={idx} className="glass-card p-6 border-t-4 border-t-primary relative">
                         <div className="absolute top-4 right-4 flex gap-2">
                            <button className="p-2 text-slate-400 hover:text-slate-800 dark:hover:text-white"><Edit3 size={16}/></button>
                         </div>
                         <div className="flex items-center gap-2 mb-3">
                            <span className="bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-white font-bold text-xs uppercase tracking-wider px-2.5 py-1 rounded-md">Home</span>
                         </div>
                         <p className="text-slate-600 dark:text-slate-300 font-medium">
                           {addr.street}<br/>
                           {addr.city}, {addr.state} - {addr.zipCode}
                         </p>
                      </div>
                   )) : (
                      <div className="glass-card p-8 border-2 border-dashed border-slate-200 dark:border-slate-700 text-center flex flex-col items-center justify-center col-span-full">
                         <MapPin size={40} className="text-slate-300 mb-3" />
                         <p className="text-slate-500 font-medium">No saved addresses</p>
                      </div>
                   )}
                </div>
             </motion.div>
           )}

           {activeTab === 'settings' && (
             <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                <h1 className="text-3xl font-black font-heading text-slate-800 dark:text-white mb-8">Account Settings</h1>
                
                <div className="glass-card p-8 space-y-8">
                   <div>
                     <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-slate-800 dark:text-white"><User size={20} className="text-primary"/> Personal Information</h3>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">Full Name</label>
                          <input type="text" defaultValue={user.name} className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl outline-none" />
                        </div>
                        <div>
                          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">Phone Number</label>
                          <input type="tel" defaultValue={user.phone} className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl outline-none" />
                        </div>
                     </div>
                   </div>
                   
                   <div className="border-t border-slate-100 dark:border-slate-800 pt-8">
                     <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-slate-800 dark:text-white"><Settings size={20} className="text-primary"/> Preferences</h3>
                     <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                        <div>
                           <p className="font-bold text-slate-800 dark:text-white">Push Notifications</p>
                           <p className="text-sm text-slate-500">Receive order updates & offers</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" className="sr-only peer" defaultChecked />
                          <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary"></div>
                        </label>
                     </div>
                   </div>

                   <button className="px-6 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold rounded-xl shadow-md hover:bg-primary dark:hover:bg-primary transition-colors">Save Changes</button>
                </div>
             </motion.div>
           )}
        </div>
      </div>
    </div>
  );
}
