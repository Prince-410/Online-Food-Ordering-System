"use client";

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, ShoppingBag, User, Menu, X, Bell, Moon, Sun,
  MapPin, Mic, Heart, LogOut, Settings, Package, Crown
} from 'lucide-react';
import Link from 'next/link';
import { useAuthStore } from '@/store/authStore';
import { useCartStore } from '@/store/cartStore';
import { cn } from '@/lib/utils';

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState({ items: [], restaurants: [] });
  const searchRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);
  const { user, isAuthenticated, logout } = useAuthStore();
  const { items, setIsOpen: setCartOpen } = useCartStore();

  const cartCount = items.reduce((sum, item) => sum + item.quantity, 0);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('theme');
      if (saved === 'dark' || (!saved && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
        setIsDark(true);
        document.documentElement.classList.add('dark');
      }
    }
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) setIsSearchOpen(false);
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) setIsProfileOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleTheme = () => {
    setIsDark(!isDark);
    document.documentElement.classList.toggle('dark');
    localStorage.setItem('theme', isDark ? 'light' : 'dark');
  };

  // AI search suggestions with debounce
  useEffect(() => {
    if (searchQuery.length < 2) { setSearchResults({ items: [], restaurants: [] }); return; }
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/recommendations/search?q=${searchQuery}`);
        const data = await res.json();
        setSearchResults(data);
      } catch { /* ignore */ }
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/restaurants', label: 'Restaurants' },
    { href: '/offers', label: 'Offers' },
  ];

  return (
    <>
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className={cn(
          'fixed top-0 left-0 right-0 z-50 transition-all duration-500',
          isScrolled ? 'glass-nav py-2 shadow-sm' : 'bg-transparent py-4'
        )}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 group">
              <motion.div 
                whileHover={{ rotate: [0, -10, 10, 0] }}
                className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center text-white font-black text-lg shadow-lg shadow-primary/20"
              >
                C
              </motion.div>
              <span className="text-xl font-black font-heading text-slate-900 dark:text-white tracking-tight">
                Crave<span className="text-primary">Bite</span>
              </span>
            </Link>

            {/* Desktop Nav Links */}
            <div className="hidden lg:flex items-center gap-1">
              {navLinks.map(link => (
                <Link 
                  key={link.href}
                  href={link.href} 
                  className="px-4 py-2 rounded-xl text-sm font-semibold text-slate-600 dark:text-slate-300 hover:text-primary hover:bg-primary/5 dark:hover:bg-primary/10 transition-all"
                >
                  {link.label}
                </Link>
              ))}
              {isAuthenticated && user?.role === 'admin' && (
                <Link href="/admin" className="px-4 py-2 rounded-xl text-sm font-semibold text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-500/10 transition-all flex items-center gap-1">
                  <Crown size={14} /> Admin
                </Link>
              )}
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-2">
              {/* Floating Search */}
              <div ref={searchRef} className="relative">
                <motion.button
                  whileTap={{ scale: 0.92 }}
                  onClick={() => setIsSearchOpen(!isSearchOpen)}
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <Search size={20} />
                </motion.button>

                <AnimatePresence>
                  {isSearchOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -10, scale: 0.95 }}
                      transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                      className="absolute right-0 top-14 w-[400px] glass-card p-4 shadow-2xl z-50"
                    >
                      <div className="flex items-center gap-3 px-4 py-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl mb-3">
                        <Search size={18} className="text-slate-400" />
                        <input
                          autoFocus
                          type="text"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          placeholder="Search dishes, restaurants..."
                          className="bg-transparent border-none outline-none w-full text-sm text-slate-800 dark:text-slate-200 placeholder-slate-400"
                        />
                        <button className="text-primary hover:text-primary-dark transition-colors">
                          <Mic size={18} />
                        </button>
                      </div>

                      {searchResults.items.length > 0 && (
                        <div className="mb-3">
                          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 px-1">Dishes</p>
                          {searchResults.items.map((item: any) => (
                            <Link
                              key={item._id}
                              href={`/restaurant/${item.restaurant?._id || item.restaurant}`}
                              onClick={() => setIsSearchOpen(false)}
                              className="flex items-center gap-3 p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                            >
                              {item.image && (
                                <img src={item.image} alt={item.name} className="w-10 h-10 rounded-lg object-cover" />
                              )}
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold text-slate-800 dark:text-white truncate">{item.name}</p>
                                <p className="text-xs text-slate-400">₹{item.price}</p>
                              </div>
                            </Link>
                          ))}
                        </div>
                      )}

                      {searchResults.restaurants.length > 0 && (
                        <div>
                          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 px-1">Restaurants</p>
                          {searchResults.restaurants.map((r: any) => (
                            <Link
                              key={r._id}
                              href={`/restaurant/${r._id}`}
                              onClick={() => setIsSearchOpen(false)}
                              className="flex items-center gap-3 p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                            >
                              {r.image && (
                                <img src={r.image} alt={r.name} className="w-10 h-10 rounded-lg object-cover" />
                              )}
                              <div>
                                <p className="text-sm font-semibold text-slate-800 dark:text-white">{r.name}</p>
                                <p className="text-xs text-slate-400">{r.cuisines?.join(', ')}</p>
                              </div>
                            </Link>
                          ))}
                        </div>
                      )}

                      {searchQuery.length >= 2 && searchResults.items.length === 0 && searchResults.restaurants.length === 0 && (
                        <p className="text-center text-sm text-slate-400 py-6">No results found for &quot;{searchQuery}&quot;</p>
                      )}

                      {searchQuery.length < 2 && (
                        <div className="text-center py-6">
                          <p className="text-sm text-slate-400">Try searching for &quot;Pizza&quot;, &quot;Biryani&quot;, or &quot;Burger&quot;</p>
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Theme Toggle */}
              <motion.button
                whileTap={{ scale: 0.92 }}
                onClick={toggleTheme}
                className="w-10 h-10 rounded-xl flex items-center justify-center text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                {isDark ? <Sun size={20} /> : <Moon size={20} />}
              </motion.button>

              {/* Notifications */}
              {isAuthenticated && (
                <motion.button
                  whileTap={{ scale: 0.92 }}
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors relative"
                >
                  <Bell size={20} />
                  <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-primary rounded-full ring-2 ring-white dark:ring-slate-900" />
                </motion.button>
              )}

              {/* Cart */}
              <motion.button
                whileTap={{ scale: 0.92 }}
                onClick={() => setCartOpen(true)}
                className="w-10 h-10 rounded-xl flex items-center justify-center text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors relative"
              >
                <ShoppingBag size={20} />
                {cartCount > 0 && (
                  <motion.span 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-primary text-white text-[10px] font-bold rounded-full flex items-center justify-center ring-2 ring-white dark:ring-slate-900"
                  >
                    {cartCount}
                  </motion.span>
                )}
              </motion.button>

              {/* Profile */}
              {isAuthenticated ? (
                <div ref={profileRef} className="relative">
                  <motion.button
                    whileTap={{ scale: 0.92 }}
                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                    className="w-10 h-10 rounded-xl overflow-hidden border-2 border-transparent hover:border-primary transition-colors"
                  >
                    {user?.avatar ? (
                      <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center text-white font-bold text-sm">
                        {user?.name?.[0]?.toUpperCase() || 'U'}
                      </div>
                    )}
                  </motion.button>

                  <AnimatePresence>
                    {isProfileOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                        className="absolute right-0 top-14 w-64 glass-card p-2 shadow-2xl z-50"
                      >
                        <div className="px-3 py-3 border-b border-slate-100 dark:border-slate-800 mb-1">
                          <p className="font-bold text-slate-900 dark:text-white text-sm">{user?.name}</p>
                          <p className="text-xs text-slate-400">{user?.email}</p>
                        </div>
                        <Link href="/profile" onClick={() => setIsProfileOpen(false)} className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                          <User size={16} /> Profile
                        </Link>
                        <Link href="/orders" onClick={() => setIsProfileOpen(false)} className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                          <Package size={16} /> Orders
                        </Link>
                        <Link href="/profile" onClick={() => setIsProfileOpen(false)} className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                          <Heart size={16} /> Favorites
                        </Link>
                        <Link href="/profile" onClick={() => setIsProfileOpen(false)} className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                          <Settings size={16} /> Settings
                        </Link>
                        <hr className="my-1 border-slate-100 dark:border-slate-800" />
                        <button onClick={() => { logout(); setIsProfileOpen(false); }} className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors w-full">
                          <LogOut size={16} /> Sign Out
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <Link href="/auth/login">
                  <motion.button 
                    whileTap={{ scale: 0.95 }}
                    className="px-5 py-2.5 bg-gradient-to-r from-primary to-primary-dark text-white text-sm font-bold rounded-xl shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all"
                  >
                    Sign In
                  </motion.button>
                </Link>
              )}

              {/* Mobile Menu Toggle */}
              <motion.button
                whileTap={{ scale: 0.92 }}
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="lg:hidden w-10 h-10 rounded-xl flex items-center justify-center text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
              </motion.button>
            </div>
          </div>
        </div>
      </motion.nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed inset-x-0 top-[72px] z-40 glass-card m-4 p-4 lg:hidden shadow-2xl"
          >
            {navLinks.map(link => (
              <Link 
                key={link.href}
                href={link.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className="block px-4 py-3 rounded-xl text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              >
                {link.label}
              </Link>
            ))}
            {isAuthenticated && user?.role === 'admin' && (
              <Link href="/admin" onClick={() => setIsMobileMenuOpen(false)} className="block px-4 py-3 rounded-xl text-sm font-semibold text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-500/10 transition-colors">
                🛡️ Admin Dashboard
              </Link>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
