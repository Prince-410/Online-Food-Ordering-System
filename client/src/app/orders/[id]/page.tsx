"use client";

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '@/store/authStore';
import api from '@/lib/axios';
import io from 'socket.io-client';
import { motion } from 'framer-motion';
import { CheckCircle2, ChefHat, Bike, MapPin, MapPinHouse, PackageCheck, Phone, AlertCircle, ArrowLeft, Store } from 'lucide-react';
import Link from 'next/link';

export default function OrderTrackingPage() {
  const { id } = useParams() as { id: string };
  const { user, token } = useAuthStore();
  const [liveStatus, setLiveStatus] = useState<string | null>(null);

  const { data: order, isLoading, error } = useQuery({
    queryKey: ['order', id],
    queryFn: async () => {
      const { data } = await api.get(`/orders/${id}`);
      return data;
    },
    enabled: !!id,
  });

  useEffect(() => {
    if (order && token) {
      // Setup web socket for live tracking
      const backendUrl = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:5000';
      const socket = io(backendUrl, {
        auth: { token }
      });

      socket.on('orderStatusUpdate', (data) => {
        if (data.orderId === id) {
          setLiveStatus(data.status);
        }
      });

      return () => {
        socket.disconnect();
      };
    }
  }, [order, id, token]);

  if (isLoading) return <div className="min-h-screen flex items-center justify-center"><div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div></div>;

  if (error || !order) return (
    <div className="min-h-screen flex items-center justify-center flex-col text-center">
      <AlertCircle size={64} className="text-red-500 mb-4" />
      <h2 className="text-2xl font-bold mb-2">Order Not Found</h2>
      <Link href="/profile" className="text-primary font-bold hover:underline">Go to Profile</Link>
    </div>
  );

  const currentStatus = liveStatus || order.orderStatus;
  
  const statuses = [
    { key: 'placed', label: 'Order Placed', icon: PackageCheck, color: 'text-blue-500', bg: 'bg-blue-100 dark:bg-blue-500/20' },
    { key: 'confirmed', label: 'Confirmed', icon: CheckCircle2, color: 'text-indigo-500', bg: 'bg-indigo-100 dark:bg-indigo-500/20' },
    { key: 'preparing', label: 'Preparing Food', icon: ChefHat, color: 'text-amber-500', bg: 'bg-amber-100 dark:bg-amber-500/20' },
    { key: 'out_for_delivery', label: 'Out for Delivery', icon: Bike, color: 'text-primary', bg: 'bg-primary/20 dark:bg-primary/20' },
    { key: 'delivered', label: 'Delivered', icon: MapPinHouse, color: 'text-green-500', bg: 'bg-green-100 dark:bg-green-500/20' }
  ];

  const currentStatusIndex = statuses.findIndex(s => s.key === currentStatus);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0a0a0a] pt-24 pb-24">
      <div className="max-w-4xl mx-auto px-6 lg:px-12">
        <Link href="/profile" className="flex items-center gap-2 text-slate-500 hover:text-slate-800 dark:hover:text-white transition-colors mb-6 font-medium w-max">
           <ArrowLeft size={18} /> Back to Profile
        </Link>
        <div className="flex flex-col md:flex-row gap-6 items-start justify-between mb-8">
           <div>
             <h1 className="text-3xl font-black font-heading text-slate-900 dark:text-white flex items-center gap-3">
               Order Tracking 
               <span className="bg-primary/10 text-primary text-xs font-bold px-3 py-1 rounded-full uppercase tracking-widest border border-primary/20">Live</span>
             </h1>
             <p className="text-slate-500 font-medium mt-1">Order #{order._id.substring(0, 8).toUpperCase()}</p>
           </div>
           {currentStatus === 'delivered' && (
              <div className="bg-green-50 dark:bg-green-500/10 border border-green-200 dark:border-green-500/20 text-green-600 dark:text-green-400 font-bold px-4 py-2 rounded-xl flex items-center gap-2">
                 <CheckCircle2 size={20} /> Order Delivered
              </div>
           )}
        </div>

        {/* Live Timeline Section */}
        <div className="glass-panel p-8 md:p-12 mb-8 relative z-10 overflow-hidden border-t-4 border-t-primary">
          <div className="absolute -top-32 -right-32 w-64 h-64 bg-primary/10 rounded-full blur-[80px]" />
          
          <div className="relative">
            {/* Map / Route visual abstract */}
            <div className="h-64 md:h-80 w-full mb-12 bg-slate-100 dark:bg-slate-800/50 rounded-2xl overflow-hidden relative border border-slate-200 dark:border-slate-700">
               {/* Abstract map elements */}
               <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/clean-gray-paper.png')] opacity-20" />
               <div className="absolute inset-0 bg-slate-200/50 dark:bg-slate-900/50 backdrop-blur-sm" />
               
               {/* A nice route visual representation connecting two points */}
               <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-full max-w-lg px-8 flex items-center justify-between relative">
                     {/* Line connecting points */}
                     <div className="absolute top-1/2 left-16 right-16 h-1 -translate-y-1/2 bg-slate-300 dark:bg-slate-700 rounded-full overflow-hidden">
                        <motion.div 
                           className="h-full bg-primary"
                           initial={{ width: '0%' }}
                           animate={{ width: `${Math.max(0, currentStatusIndex * 25)}%` }}
                           transition={{ duration: 1, ease: "easeInOut" }}
                        />
                     </div>
                     
                     <div className="relative z-10 flex flex-col items-center gap-2">
                        <div className="w-12 h-12 bg-white dark:bg-slate-900 rounded-full shadow-lg flex items-center justify-center border-2 border-slate-200 dark:border-slate-700">
                          <Store className="text-slate-600 dark:text-slate-400" size={20} />
                        </div>
                        <span className="text-xs font-bold text-slate-800 dark:text-slate-200 bg-white/80 dark:bg-slate-900/80 backdrop-blur px-2 py-1 rounded-md">{order.restaurant.name}</span>
                     </div>
                     
                     {currentStatus === 'out_for_delivery' && (
                        <motion.div 
                           className="absolute top-1/2 left-1/2 -translate-y-1/2 -translate-x-1/2 z-20"
                           animate={{ x: [0, 20, 0, -20, 0] }}
                           transition={{ repeat: Infinity, duration: 4 }}
                        >
                           <div className="w-10 h-10 bg-primary rounded-full shadow-lg shadow-primary/40 flex items-center justify-center text-white">
                              <Bike size={20} className="animate-bounce" />
                           </div>
                        </motion.div>
                     )}
                     
                     <div className="relative z-10 flex flex-col items-center gap-2">
                        <div className="w-12 h-12 bg-white dark:bg-slate-900 rounded-full shadow-lg flex items-center justify-center border-2 border-slate-200 dark:border-slate-700">
                          <MapPinHouse className={currentStatus === 'delivered' ? 'text-green-500' : 'text-slate-600 dark:text-slate-400'} size={20} />
                        </div>
                        <span className="text-xs font-bold text-slate-800 dark:text-slate-200 bg-white/80 dark:bg-slate-900/80 backdrop-blur px-2 py-1 rounded-md">Home</span>
                     </div>
                  </div>
               </div>
            </div>

            {/* Status Stepper */}
            <div className="flex flex-col md:flex-row justify-between relative gap-6 md:gap-0">
               <div className="hidden md:block absolute top-6 left-12 right-12 h-1 bg-slate-200 dark:bg-slate-800 z-0 rounded-full" />
               <motion.div 
                 className="hidden md:block absolute top-6 left-12 h-1 bg-primary z-0 rounded-full"
                 initial={{ width: 0 }}
                 animate={{ width: `${Math.max(0, currentStatusIndex * 25)}%` }}
                 transition={{ duration: 0.5 }}
               />

               {statuses.map((status, idx) => {
                 const isActive = idx === currentStatusIndex;
                 const isCompleted = idx < currentStatusIndex;
                 const Icon = status.icon;

                 return (
                   <div key={status.key} className="relative z-10 flex md:flex-col items-center gap-4 md:gap-3 text-left md:text-center w-full md:w-auto">
                     <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 border-4 ${
                       isActive ? `border-white dark:border-[#111] shadow-[0_0_20px_rgba(255,71,87,0.3)] ${status.bg} ${status.color}` : 
                       isCompleted ? 'bg-primary border-primary text-white' : 
                       'bg-slate-100 dark:bg-slate-800 border-white dark:border-[#111] text-slate-400'
                     } transition-all duration-500`}>
                       <Icon size={isActive || isCompleted ? 20 : 18} />
                     </div>
                     <div className="flex-1 md:w-24">
                       <p className={`font-bold text-sm ${isActive ? 'text-slate-900 dark:text-white scale-105 origin-left md:origin-center' : 'text-slate-500'} transition-transform`}>{status.label}</p>
                       {isActive && <p className="text-xs text-primary font-medium mt-1 animate-pulse">In Progress</p>}
                     </div>
                   </div>
                 );
               })}
            </div>
          </div>
        </div>

        {/* Order Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
           <div className="md:col-span-2 glass-card p-6 md:p-8">
              <h2 className="text-xl font-bold font-heading mb-6 border-b border-slate-100 dark:border-slate-800 pb-4 text-slate-800 dark:text-white">Order Summary</h2>
              
              <div className="space-y-4 mb-6">
                {order.items.map((item: any) => (
                  <div key={item._id} className="flex justify-between items-center bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 bg-white dark:bg-slate-700 rounded-lg overflow-hidden shrink-0">
                         {item.menuItem?.image ? (
                           <img src={item.menuItem?.image} className="w-full h-full object-cover" />
                         ) : <div className="w-full h-full bg-slate-200 dark:bg-slate-800"></div>}
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-800 dark:text-white line-clamp-1">{item.name}</h4>
                        <p className="text-sm font-medium text-slate-500">₹{item.price} × {item.quantity}</p>
                      </div>
                    </div>
                    <span className="font-black text-slate-800 dark:text-white">₹{item.price * item.quantity}</span>
                  </div>
                ))}
              </div>

              <div className="flex justify-between items-center text-lg md:text-xl font-black bg-primary/5 dark:bg-primary/10 p-4 rounded-xl text-primary">
                 <span>Total Paid</span>
                 <span>₹{order.totalAmount}</span>
              </div>
           </div>

           <div className="space-y-6">
              <div className="glass-card p-6">
                 <h3 className="font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                   <MapPin size={18} className="text-primary" /> Delivery Details
                 </h3>
                 <div className="text-sm text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl">
                    <p className="font-bold text-slate-800 dark:text-white mb-1">{user?.name}</p>
                    <p>{order.shippingAddress.street}</p>
                    <p>{order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.zipCode}</p>
                    <div className="flex items-center gap-2 mt-3 pt-3 border-t border-slate-200 dark:border-slate-700 font-medium">
                       <Phone size={14} className="text-slate-400" /> {user?.phone || 'Not provided'}
                    </div>
                 </div>
              </div>

              <div className="glass-card p-6">
                 <h3 className="font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                   <Store size={18} className="text-primary" /> Restaurant Info
                 </h3>
                 <div className="text-sm text-slate-600 dark:text-slate-300">
                    <p className="font-bold text-slate-800 dark:text-white mb-1">{order.restaurant.name}</p>
                    <p className="line-clamp-2">{order.restaurant.address?.street}, {order.restaurant.address?.city}</p>
                    <Link href={`/restaurant/${order.restaurant._id}`} className="text-primary font-bold hover:underline mt-2 inline-block">
                       View Menu
                    </Link>
                 </div>
              </div>
           </div>
        </div>

      </div>
    </div>
  );
}
