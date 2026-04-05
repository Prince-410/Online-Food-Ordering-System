"use client";

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/axios';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, MapPin, Star, Clock, Heart, Filter, SlidersHorizontal, ArrowRight } from 'lucide-react';
import Link from 'next/link';

const fetchRestaurants = async (search: string, cuisine: string) => {
  const { data } = await api.get('/restaurants', {
    params: { search, cuisine }
  });
  return data;
};

// Available cuisines for filter chips
const cuisines = ['All', 'Indian', 'American', 'Japanese', 'Italian', 'Chinese', 'Mediterranean', 'Café'];

export default function RestaurantsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCuisine, setSelectedCuisine] = useState('All');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  // Debounce search
  React.useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchTerm), 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const { data: restaurants, isLoading, error } = useQuery({
    queryKey: ['restaurants', debouncedSearch, selectedCuisine],
    queryFn: () => fetchRestaurants(debouncedSearch, selectedCuisine === 'All' ? '' : selectedCuisine),
  });

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0a0a0a] pb-24">
      {/* Dynamic Header */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 pt-8 pb-12 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-32 bg-primary/5 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 p-32 bg-accent/5 rounded-full blur-[100px] pointer-events-none" />
        
        <div className="max-w-7xl mx-auto px-6 lg:px-12 relative z-10">
          <div className="flex flex-col md:flex-row gap-6 justify-between items-start md:items-end">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold font-heading text-slate-900 dark:text-white mb-4">
                Explore Restaurants
              </h1>
              <p className="text-slate-600 dark:text-slate-400 text-lg max-w-xl">
                Discover the best food & drinks in your city. From swanky fine dining to cozy cafes.
              </p>
            </div>
            
            <div className="w-full md:w-[400px]">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                <input
                  type="text"
                  placeholder="Search for restaurants, cuisines..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-slate-100 dark:bg-slate-800/50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-primary/50 text-slate-800 dark:text-slate-200 transition-shadow shadow-inner"
                />
              </div>
            </div>
          </div>

          {/* Cuisine Filters */}
          <div className="mt-8 flex items-center gap-3 overflow-x-auto no-scrollbar pb-2">
            <div className="flex items-center gap-2 mr-4 text-slate-500 font-medium whitespace-nowrap">
              <Filter size={18} /> Filters:
            </div>
            <div className="flex gap-3">
              {cuisines.map((c) => (
                <button
                  key={c}
                  onClick={() => setSelectedCuisine(c)}
                  className={`px-5 py-2.5 rounded-full font-medium whitespace-nowrap transition-all ${
                    selectedCuisine === c 
                      ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-md transform scale-105' 
                      : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid Section */}
      <div className="max-w-7xl mx-auto px-6 lg:px-12 pt-12">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-bold font-heading text-slate-900 dark:text-white flex items-center gap-2">
            {isLoading ? 'Searching...' : `${restaurants?.length || 0} Places Found`}
          </h2>
          <button className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors">
            <SlidersHorizontal size={16} /> Sort By
          </button>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div key={i} className="bg-white dark:bg-slate-900 rounded-2xl p-4 shimmer border border-slate-100 dark:border-slate-800">
                <div className="w-full h-48 bg-slate-200 dark:bg-slate-800 rounded-xl mb-4 animate-pulse"></div>
                <div className="w-3/4 h-6 bg-slate-200 dark:bg-slate-800 rounded mb-2 animate-pulse"></div>
                <div className="w-1/2 h-4 bg-slate-200 dark:bg-slate-800 rounded mb-4 animate-pulse"></div>
                <div className="w-full h-8 bg-slate-200 dark:bg-slate-800 rounded animate-pulse"></div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-20 text-red-500 glass-card">
            <p className="text-xl font-bold">Failed to load restaurants.</p>
            <p className="text-sm">Please try again later.</p>
          </div>
        ) : !restaurants || restaurants.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 text-center text-slate-500">
            <Search size={64} className="mb-4 text-slate-300" />
            <h3 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">No restaurants found</h3>
            <p>Try adjusting your search criteria or changing the cuisine filter.</p>
          </div>
        ) : (
          <motion.div 
            layout
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8"
          >
            <AnimatePresence>
              {restaurants.map((restaurant: any, i: number) => (
                <motion.div
                  key={restaurant._id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.3, delay: i * 0.05 }}
                  className="bg-white dark:bg-slate-900 rounded-2xl overflow-hidden shadow-sm hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 border border-slate-100 dark:border-slate-800 group group/card relative"
                >
                  {/* Image container */}
                  <div className="relative h-56 overflow-hidden">
                    <img 
                      src={restaurant.image || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800'} 
                      alt={restaurant.name} 
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                    />
                    
                    {/* Overlay gradient */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    
                    {/* Tags */}
                    <div className="absolute top-4 left-4 flex flex-col gap-2">
                      <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-md px-2.5 py-1 rounded-lg text-sm font-bold flex items-center gap-1.5 shadow-lg border border-white/20">
                        <Star size={14} className="text-amber-500 fill-amber-500" /> 
                        {restaurant.rating}
                        <span className="text-slate-400 font-normal text-xs ml-0.5">({restaurant.totalRatings >= 1000 ? (restaurant.totalRatings/1000).toFixed(1)+'k' : restaurant.totalRatings})</span>
                      </div>
                      
                      {!restaurant.isOpen && (
                         <div className="bg-rose-500/90 text-white backdrop-blur px-2.5 py-1 rounded-lg text-xs font-bold uppercase tracking-wider shadow-lg">
                           Closed
                         </div>
                      )}
                    </div>
                    
                    {/* Favorite Button */}
                    <button className="absolute top-4 right-4 w-9 h-9 bg-white/50 hover:bg-white dark:bg-slate-900/50 dark:hover:bg-slate-800 backdrop-blur rounded-full flex items-center justify-center text-slate-700 dark:text-slate-300 hover:text-rose-500 transition-colors shadow-lg border border-white/20">
                      <Heart size={18} />
                    </button>
                    
                    {/* Quick view button (visible on hover) */}
                    <Link href={`/restaurant/${restaurant._id}`} className="absolute bottom-4 left-1/2 -translate-x-1/2 translate-y-12 group-hover:translate-y-0 bg-white dark:bg-slate-900 text-slate-900 dark:text-white px-6 py-2 rounded-full font-bold shadow-xl transition-all duration-300 flex items-center gap-2 hover:bg-primary hover:text-white border border-transparent">
                      View Menu <ArrowRight size={16} />
                    </Link>
                  </div>
                  
                  {/* Content details */}
                  <div className="p-5 flex flex-col">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-bold text-xl text-slate-900 dark:text-white line-clamp-1 group-hover:text-primary transition-colors">
                        {restaurant.name}
                      </h3>
                    </div>
                    
                    <p className="text-slate-500 dark:text-slate-400 text-sm mb-4 line-clamp-1">
                      {restaurant.cuisines?.join(' • ')}
                    </p>
                    
                    <div className="flex items-center justify-between mt-auto pt-4 border-t border-slate-100 dark:border-slate-800/80 text-sm">
                      <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300 font-medium">
                        <Clock size={16} className="text-primary" /> 
                        {restaurant.deliveryTime}
                      </div>
                      <div className="w-1.5 h-1.5 rounded-full bg-slate-200 dark:bg-slate-700"></div>
                      <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300 font-medium">
                        <MapPin size={16} className="text-primary" /> 
                        {restaurant.deliveryFee === 0 ? <span className="text-emerald-500">Free</span> : `₹${restaurant.deliveryFee}`}
                      </div>
                      <div className="w-1.5 h-1.5 rounded-full bg-slate-200 dark:bg-slate-700"></div>
                      <div className="text-slate-600 dark:text-slate-300 font-medium whitespace-nowrap">
                        ₹{restaurant.minOrder} for one
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </div>
    </div>
  );
}
