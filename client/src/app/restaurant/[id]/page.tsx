"use client";

import React, { useState } from 'react';
import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/axios';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, Clock, MapPin, Search, ArrowLeft, Heart, Info, Plus, Minus, BadgeCheck, UtensilsCrossed } from 'lucide-react';
import Link from 'next/link';
import { useCartStore } from '@/store/cartStore';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

const fetchRestaurantDetails = async (id: string) => {
  const [resRest, resMenu, resCoupons] = await Promise.all([
    api.get(`/restaurants/${id}`),
    api.get(`/menu/${id}`),
    api.get('/coupons').catch(() => ({ data: { coupons: [] } }))
  ]);
  return { 
    restaurant: resRest.data, 
    menu: resMenu.data,
    coupons: resCoupons.data.coupons || []
  };
};

export default function RestaurantDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  
  const { addItem, updateQuantity, items, setIsOpen } = useCartStore();

  const { data, isLoading, error } = useQuery({
    queryKey: ['restaurant', id],
    queryFn: () => fetchRestaurantDetails(id),
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-black pt-24 px-6 md:px-12 pb-24 max-w-7xl mx-auto flex flex-col gap-8">
        <div className="w-full h-[400px] bg-slate-200 dark:bg-slate-800 rounded-3xl animate-pulse"></div>
        <div className="w-1/2 h-12 bg-slate-200 dark:bg-slate-800 rounded-xl animate-pulse"></div>
        <div className="flex gap-4">
          <div className="w-32 h-10 bg-slate-200 dark:bg-slate-800 rounded-full animate-pulse"></div>
          <div className="w-32 h-10 bg-slate-200 dark:bg-slate-800 rounded-full animate-pulse"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
          {[1,2,3,4].map(i => <div key={i} className="h-48 bg-slate-200 dark:bg-slate-800 rounded-2xl animate-pulse"></div>)}
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center text-center">
        <div>
          <h2 className="text-2xl font-bold mb-4">Something went wrong</h2>
          <Link href="/restaurants" className="text-primary hover:underline flex items-center justify-center gap-2">
            <ArrowLeft size={16} /> Back to restaurants
          </Link>
        </div>
      </div>
    );
  }

  const { restaurant, menu, coupons } = data;

  const categories = ['All', ...Array.from(new Set<string>(menu.map((item: any) => item.category)))];
  
  const filteredMenu = menu.filter((item: any) => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = activeCategory === 'All' || item.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const getCartQuantity = (itemId: string) => {
    const item = items.find(i => i.menuItem?._id === itemId || (i.menuItem as unknown as string) === itemId);
    return item ? item.quantity : 0;
  };

  const getCartItemId = (itemId: string) => {
    const item = items.find(i => i.menuItem?._id === itemId || (i.menuItem as unknown as string) === itemId);
    return item?._id;
  };

  const handleAddToCart = async (item: any) => {
    try {
      await addItem({
        menuItem: item._id,
        name: item.name,
        price: item.price,
        image: item.image,
        quantity: 1,
        restaurantId: restaurant._id
      });
      toast.success(`Added ${item.name} to cart`);
      setIsOpen(true);
    } catch (err: any) {
      if (err.response?.status === 401) {
        toast.error('Please log in to add items to your cart');
        router.push('/auth/login');
      } else if (err.response?.status === 400 && err.response.data?.message?.includes('from a different restaurant')) {
        toast.error('You have items from another restaurant in your cart. Please clear it first.', { duration: 4000 });
      } else {
        toast.error(err.response?.data?.message || 'Failed to add item to cart');
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0a0a0a] pb-32 -mt-20">
      {/* Restaurant Header */}
      <div className="relative h-[60vh] min-h-[400px] w-full">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="w-full h-full relative overflow-hidden"
        >
          <img src={restaurant.image || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4'} alt={restaurant.name} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-black/30" />
          
          <div className="absolute top-24 left-6 md:left-12">
            <Link href="/restaurants" className="w-10 h-10 bg-black/30 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-all border border-white/10">
              <ArrowLeft size={20} />
            </Link>
          </div>
          <div className="absolute top-24 right-6 md:right-12">
            <button className="w-10 h-10 bg-black/30 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:text-rose-400 hover:bg-white/20 transition-all border border-white/10">
              <Heart size={20} />
            </button>
          </div>

          <div className="absolute bottom-0 left-0 right-0 p-6 md:p-12 text-white bg-gradient-to-t from-black/80 to-transparent">
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <BadgeCheck className="text-blue-400" size={24} />
                  <span className="bg-primary px-3 py-1 rounded-full text-xs font-bold tracking-wider uppercase shadow-lg shadow-primary/20">Promoted</span>
                </div>
                <h1 className="text-4xl md:text-6xl lg:text-7xl font-black font-heading tracking-tight mb-2">
                  {restaurant.name}
                </h1>
                <p className="text-lg text-white/90 font-medium mb-4">{restaurant.cuisines?.join(' • ')}</p>
                <div className="flex items-center gap-2 text-white/70 text-sm md:text-base">
                  <MapPin size={16} className="text-primary" />
                  <span>{restaurant.address?.street}, {restaurant.address?.city}</span>
                </div>
              </div>
            
            <div className="flex gap-4 flex-wrap pb-2 shrink-0">
              <div className="glass-panel px-4 py-3 rounded-2xl flex items-center gap-3 border-white/20 bg-black/40 text-center">
                <Star className="text-amber-400 fill-amber-400" size={24} />
                <div>
                  <p className="font-bold text-lg leading-none">{restaurant.rating}</p>
                  <p className="text-xs text-white/60">{(restaurant.totalRatings >= 1000 ? (restaurant.totalRatings/1000).toFixed(1)+'k' : restaurant.totalRatings) || 0} reviews</p>
                </div>
              </div>
              <div className="glass-panel px-4 py-3 rounded-2xl flex items-center gap-3 border-white/20 bg-black/40 text-center">
                <Clock className="text-emerald-400" size={24} />
                <div>
                  <p className="font-bold text-lg leading-none">{restaurant.deliveryTime}</p>
                  <p className="text-xs text-white/60">Delivery time</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
      </div>

      <div className="max-w-7xl mx-auto px-6 lg:px-12 mt-12 flex flex-col lg:flex-row gap-12">
        
        {/* Main Content (Menu & Offers) */}
        <div className="flex-1 overflow-visible">
           
           {/* Offers Section */}
           {coupons && coupons.length > 0 && (
             <div className="mb-10">
               <h2 className="text-xl font-bold font-heading mb-4 text-slate-900 dark:text-white flex items-center gap-2">
                 <BadgeCheck className="text-primary" size={22} /> Available Offers
               </h2>
               <div className="flex flex-nowrap overflow-x-auto gap-4 pb-4 no-scrollbar -mx-6 px-6 lg:mx-0 lg:px-0">
                 {coupons.map((coupon: any) => (
                   <div key={coupon._id} className="min-w-[280px] md:min-w-[320px] bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/10 border border-emerald-100 dark:border-emerald-800/30 p-4 rounded-2xl flex items-start gap-4 shrink-0 shadow-sm relative overflow-hidden group">
                     <div className="absolute -right-6 -top-6 w-24 h-24 bg-emerald-500/10 rounded-full blur-xl group-hover:bg-emerald-500/20 transition-colors" />
                     <div className="w-12 h-12 bg-white dark:bg-slate-900 rounded-full flex items-center justify-center shrink-0 shadow-sm border border-emerald-100 dark:border-slate-800 z-10">
                       <span className="text-emerald-600 font-bold text-lg">%</span>
                     </div>
                     <div className="z-10 bg-transparent">
                       <p className="font-bold text-slate-800 dark:text-white leading-tight mb-1">{coupon.description}</p>
                       <div className="flex items-center gap-2">
                         <span className="font-mono text-xs font-bold bg-slate-200 dark:bg-slate-800 px-2 py-0.5 rounded text-slate-700 dark:text-slate-300 tracking-wider">
                           {coupon.code}
                         </span>
                         {coupon.minOrderAmount > 0 && (
                           <span className="text-xs text-slate-500">Above ₹{coupon.minOrderAmount}</span>
                         )}
                       </div>
                     </div>
                   </div>
                 ))}
               </div>
             </div>
           )}

           {/* Sticky Search & Categories */}
           <div className="sticky top-[72px] bg-slate-50/90 dark:bg-[#0a0a0a]/90 backdrop-blur-xl z-40 py-4 -mx-4 px-4 border-b border-slate-200 dark:border-slate-800 mb-8 transition-all duration-300">
             <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 max-w-7xl mx-auto">
               <div className="flex overflow-x-auto no-scrollbar gap-2 pb-1">
                 {categories.map((cat) => (
                   <button
                     key={cat}
                     onClick={() => setActiveCategory(cat)}
                     className={`px-5 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-all duration-300 ${
                       activeCategory === cat 
                         ? 'bg-primary text-white shadow-lg shadow-primary/30' 
                         : 'bg-white dark:bg-slate-900 text-slate-500 hover:text-slate-800 dark:hover:text-white'
                     }`}
                   >
                     {cat}
                   </button>
                 ))}
               </div>
               
               <div className="relative w-full md:w-72 shrink-0">
                 <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                 <input
                   type="text"
                   placeholder="Search within menu..."
                   value={searchTerm}
                   onChange={(e) => setSearchTerm(e.target.value)}
                   className="w-full pl-11 pr-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl outline-none focus:ring-2 focus:ring-primary/50 text-slate-800 dark:text-slate-200 text-sm shadow-sm transition-all"
                 />
               </div>
             </div>
           </div>

           {/* Menu Grid */}
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
<AnimatePresence>
               {filteredMenu.map((item: any, i: number) => {
                 const quantity = getCartQuantity(item._id);
                 const cartItemId = getCartItemId(item._id);
                 
                 return (
                   <motion.div
                     layout
                     initial={{ opacity: 0, y: 20 }}
                     animate={{ opacity: 1, y: 0 }}
                     exit={{ opacity: 0, scale: 0.95 }}
                     transition={{ duration: 0.2 }}
                     key={item._id}
                     className="glass-card hover:shadow-2xl hover:shadow-primary/5 transition-all duration-300 overflow-hidden flex group/card"
                   >
                     {/* Dynamic Color Strip */}
                     <div className={`w-1.5 shrink-0 transition-opacity group-hover/card:opacity-100 ${item.isVeg ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                     
                     <div className="flex-1 p-5 flex flex-col justify-between">
                       <div>
                         <div className="flex justify-between items-start mb-1">
                           <h3 className="font-bold text-lg text-slate-900 dark:text-white leading-tight pr-4 group-hover/card:text-primary transition-colors">
                             {item.name}
                           </h3>
                           <div className={`shrink-0 border-2 rounded-sm p-0.5 w-4 h-4 flex items-center justify-center ${item.isVeg ? 'border-emerald-500 text-emerald-500' : 'border-rose-500 text-rose-500'}`}>
                             <div className="w-2 h-2 rounded-full bg-current" />
                           </div>
                         </div>
                         <p className="font-black text-xl text-slate-900 dark:text-slate-100 mt-1 mb-2">₹{item.price}</p>
                         <p className="text-slate-500 dark:text-slate-400 text-xs leading-relaxed line-clamp-2 mb-4">
                           {item.description}
                         </p>
                       </div>
                       
                       <div className="flex items-center justify-between mt-auto pt-4 border-t border-slate-100 dark:border-slate-800/80">
                         {quantity > 0 && cartItemId ? (
                           <div className="flex items-center gap-3 bg-primary/10 dark:bg-primary/20 rounded-full px-2 py-1 shadow-sm border border-primary/20">
                             <button 
                               onClick={() => updateQuantity(cartItemId, quantity - 1)}
                               className="w-8 h-8 flex items-center justify-center rounded-full bg-white dark:bg-slate-800 text-primary shadow-sm hover:scale-110 active:scale-95 transition-all"
                             >
                               {quantity === 1 ? <UtensilsCrossed size={14} /> : <Minus size={14} />}
                             </button>
                             <span className="w-4 text-center font-bold text-primary">{quantity}</span>
                             <button 
                               onClick={() => updateQuantity(cartItemId, quantity + 1)}
                               className="w-8 h-8 flex items-center justify-center rounded-full bg-white dark:bg-slate-800 text-primary shadow-sm hover:scale-110 active:scale-95 transition-all"
                             >
                               <Plus size={14} />
                             </button>
                           </div>
                         ) : (
                           <button 
                             onClick={() => handleAddToCart(item)}
                             className="px-6 py-2.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold rounded-full hover:bg-primary hover:text-white dark:hover:bg-primary dark:hover:text-white transition-all shadow-md active:scale-95"
                           >
                             Add to cart
                           </button>
                         )}
                       </div>
                     </div>
                     
                     <div className="w-32 md:w-36 shrink-0 relative overflow-hidden">
                       {item.image ? (
                         <img src={item.image} alt={item.name} className="w-full h-full object-cover group-hover/card:scale-110 transition-transform duration-500" />
                       ) : (
                         <div className="w-full h-full bg-slate-100 dark:bg-slate-800 flex flex-col items-center justify-center text-slate-300 gap-2 p-4 text-center">
                           <UtensilsCrossed size={24} className="opacity-20" />
                           <span className="text-[10px] font-bold uppercase tracking-widest opacity-40">{item.name}</span>
                         </div>
                       )}
                       {item.preparationTime && (
                         <div className="absolute bottom-2 right-2 bg-black/60 backdrop-blur text-white text-[10px] px-2 py-1 rounded-md font-medium flex items-center gap-1">
                           <Clock size={10} /> {item.preparationTime}m
                         </div>
                       )}
                     </div>
                   </motion.div>
                 );
               })}
             </AnimatePresence>
             {filteredMenu.length === 0 && (
               <div className="col-span-full py-20 text-center text-slate-500 glass-card">
                 <h3 className="text-xl font-bold mb-2 text-slate-700 dark:text-slate-300">No items found</h3>
                 <p>Try searching for something else</p>
               </div>
             )}
           </div>
        </div>
        
        {/* Sidebar Info */}
        <div className="w-full lg:w-80 shrink-0 flex flex-col gap-6">
          <div className="glass-card p-6 sticky top-24">
            <h3 className="text-lg font-bold font-heading mb-4 flex items-center gap-2">
              <Info size={20} className="text-primary" /> About
            </h3>
            <div className="flex flex-col gap-4 text-sm">
              <div className="flex gap-3 text-slate-600 dark:text-slate-400">
                <MapPin size={18} className="shrink-0 text-slate-400" />
                <p>{restaurant.address?.street}, {restaurant.address?.city}, {restaurant.address?.state} - {restaurant.address?.zipCode}</p>
              </div>
              
              <div className="h-px bg-slate-200 dark:bg-slate-800 my-1" />
              
              <div className="flex justify-between items-center text-slate-700 dark:text-slate-300 font-medium">
                <span>Minimum Order</span>
                <span>₹{restaurant.minOrder}</span>
              </div>
              <div className="flex justify-between items-center text-slate-700 dark:text-slate-300 font-medium">
                <span>Delivery Fee</span>
                <span>{restaurant.deliveryFee === 0 ? 'Free' : `₹${restaurant.deliveryFee}`}</span>
              </div>
              <div className="flex justify-between items-center text-slate-700 dark:text-slate-300 font-medium">
                <span>Preparation Time</span>
                <span>~{restaurant.deliveryTime}</span>
              </div>
            </div>
            
            <div className={`mt-6 p-4 rounded-xl border ${restaurant.isOpen ? 'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/20 text-emerald-600 dark:text-emerald-400' : 'bg-rose-50 dark:bg-rose-500/10 border-rose-200 dark:border-rose-500/20 text-rose-600 dark:text-rose-400'} text-center font-bold tracking-wide uppercase text-sm`}>
              {restaurant.isOpen ? 'Open Now' : 'Closed Currently'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
