"use client";

import React, { useState, useEffect, useRef } from 'react';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { 
  Search, MapPin, Star, Clock, ArrowRight, TrendingUp, Sparkles, 
  Navigation, ShoppingBag, Mic, MicOff, Heart, Zap, Gift, ChefHat, X
} from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

const categories = [
  { name: 'Pizza', emoji: '🍕', color: 'bg-orange-100 dark:bg-orange-500/10 text-orange-600 dark:text-orange-400' },
  { name: 'Burger', emoji: '🍔', color: 'bg-amber-100 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400' },
  { name: 'Sushi', emoji: '🍣', color: 'bg-rose-100 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400' },
  { name: 'Healthy', emoji: '🥗', color: 'bg-green-100 dark:bg-green-500/10 text-green-600 dark:text-green-400' },
  { name: 'Desserts', emoji: '🍰', color: 'bg-pink-100 dark:bg-pink-500/10 text-pink-600 dark:text-pink-400' },
  { name: 'Indian', emoji: '🍛', color: 'bg-red-100 dark:bg-red-500/10 text-red-600 dark:text-red-400' },
  { name: 'Drinks', emoji: '🥤', color: 'bg-blue-100 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400' },
  { name: 'Vegan', emoji: '🥬', color: 'bg-emerald-100 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' },
];

const moods = [
  { id: 'happy', emoji: '😊', label: 'Happy', color: 'from-amber-400 to-orange-500' },
  { id: 'sad', emoji: '😢', label: 'Comfort Me', color: 'from-blue-400 to-indigo-500' },
  { id: 'energetic', emoji: '⚡', label: 'Energetic', color: 'from-green-400 to-emerald-500' },
  { id: 'spicy', emoji: '🌶️', label: 'Spicy Mood', color: 'from-red-400 to-rose-500' },
  { id: 'chill', emoji: '😎', label: 'Chill Vibes', color: 'from-cyan-400 to-blue-500' },
  { id: 'adventurous', emoji: '🌍', label: 'Adventurous', color: 'from-violet-400 to-purple-500' },
  { id: 'romantic', emoji: '❤️', label: 'Date Night', color: 'from-pink-400 to-rose-500' },
  { id: 'healthy', emoji: '🥑', label: 'Healthy', color: 'from-lime-400 to-green-500' },
];

function FoodMoodSelector({ onSelect }: { onSelect: (mood: string) => void }) {
  const [selected, setSelected] = useState<string | null>(null);

  return (
    <div className="grid grid-cols-4 gap-3 sm:gap-4">
      {moods.map((mood, i) => (
        <motion.button
          key={mood.id}
          whileHover={{ scale: 1.05, y: -4 }}
          whileTap={{ scale: 0.95 }}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: i * 0.05 }}
          onClick={() => { setSelected(mood.id); onSelect(mood.id); }}
          className={cn(
            'flex flex-col items-center gap-2 p-4 rounded-2xl transition-all border',
            selected === mood.id 
              ? 'border-primary shadow-lg shadow-primary/20 bg-primary/5 dark:bg-primary/10' 
              : 'border-slate-100 dark:border-slate-800 hover:border-slate-200 dark:hover:border-slate-700 bg-white dark:bg-slate-900/50'
          )}
        >
          <span className="text-3xl">{mood.emoji}</span>
          <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">{mood.label}</span>
        </motion.button>
      ))}
    </div>
  );
}

function MoodResults({ mood, results }: { mood: string; results: any[] }) {
  if (!mood || results.length === 0) return null;
  const moodInfo = moods.find(m => m.id === mood);

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      className="mt-8"
    >
      <h3 className="text-xl font-bold dark:text-white mb-4 flex items-center gap-2">
        <span className="text-2xl">{moodInfo?.emoji}</span> 
        Perfect for your {moodInfo?.label} mood
      </h3>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {results.slice(0, 8).map((item: any, i: number) => (
          <motion.div
            key={item._id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.05 }}
            className="bg-white dark:bg-slate-900 rounded-2xl overflow-hidden shadow-sm hover:shadow-lg border border-slate-100 dark:border-slate-800 transition-all group"
          >
            <div className="h-32 overflow-hidden relative">
              {item.image ? (
                <img src={item.image} alt={item.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
              ) : (
                <div className={cn('w-full h-full bg-gradient-to-br flex items-center justify-center text-4xl', `${moodInfo?.color}`)}>
                  {moodInfo?.emoji}
                </div>
              )}
            </div>
            <div className="p-3">
              <p className="text-sm font-bold text-slate-800 dark:text-white truncate">{item.name}</p>
              <p className="text-xs text-slate-400 truncate">{item.restaurant?.name}</p>
              <p className="text-sm font-bold text-primary mt-1">₹{item.price}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}

export default function HomeClient({ restaurants = [], featuredItems = [] }: { restaurants: any[]; featuredItems: any[] }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [moodSelected, setMoodSelected] = useState('');
  const [moodResults, setMoodResults] = useState<any[]>([]);
  const [isListening, setIsListening] = useState(false);
  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 1000], [0, 200]);
  const y2 = useTransform(scrollY, [0, 1000], [0, -150]);
  const heroOpacity = useTransform(scrollY, [0, 400], [1, 0]);
  const heroScale = useTransform(scrollY, [0, 400], [1, 0.95]);

  const handleMoodSelect = async (mood: string) => {
    setMoodSelected(mood);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/recommendations/mood?mood=${mood}`);
      const data = await res.json();
      setMoodResults(data.suggestions || []);
    } catch { setMoodResults([]); }
  };

  const handleVoiceSearch = () => {
    if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      alert('Voice search is not supported in this browser');
      return;
    }
    const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = 'en-IN';
    recognition.interimResults = false;
    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setSearchQuery(transcript);
    };
    recognition.start();
  };

  return (
    <div className="flex flex-col min-h-screen bg-background overflow-hidden selection:bg-primary/20">
      
      {/* ─── Hero Section ─── */}
      <section className="relative min-h-[92vh] flex items-center pt-20 pb-16 overflow-hidden">
        {/* Animated Background Blobs */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-primary/15 blur-[120px] mix-blend-multiply dark:mix-blend-screen animate-blob" />
          <div className="absolute top-[20%] -right-[10%] w-[40%] h-[40%] rounded-full bg-accent/15 blur-[120px] mix-blend-multiply dark:mix-blend-screen animate-blob animation-delay-2000" />
          <div className="absolute -bottom-[20%] left-[20%] w-[60%] h-[60%] rounded-full bg-secondary/15 blur-[120px] mix-blend-multiply dark:mix-blend-screen animate-blob animation-delay-4000" />
        </div>

        <motion.div style={{ opacity: heroOpacity, scale: heroScale }} className="max-w-7xl mx-auto px-6 lg:px-12 w-full grid grid-cols-1 lg:grid-cols-2 gap-12 items-center relative z-10">
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="flex flex-col gap-6"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass w-max border border-white/50 text-primary dark:text-primary-light font-medium text-sm">
              <Sparkles size={16} />
              <span>AI-Powered Food Discovery</span>
            </div>
            
            <h1 className="text-5xl lg:text-7xl font-heading font-extrabold leading-[1.08] tracking-tight text-slate-900 dark:text-white">
              It&apos;s not just food,<br/> it&apos;s an{' '}
              <span className="text-gradient">Experience.</span>
            </h1>
            
            <p className="text-lg lg:text-xl text-slate-600 dark:text-slate-400 max-w-xl leading-relaxed">
              Discover the fastest, smartest, and most premium way to satisfy your cravings. Powered by AI recommendations and real-time tracking.
            </p>

            {/* Smart Search Bar */}
            <motion.div 
              className="glass-panel mt-4 p-3 rounded-2xl flex flex-col sm:flex-row gap-3 relative z-20 max-w-xl shadow-premium"
              whileHover={{ scale: 1.01 }}
            >
              <div className="flex-1 flex items-center gap-3 px-4 py-3 bg-white/50 dark:bg-slate-800/50 rounded-xl">
                <Navigation className="text-primary shrink-0" size={20} />
                <input 
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search for food, restaurants..." 
                  className="bg-transparent border-none outline-none w-full text-slate-800 dark:text-slate-200 placeholder-slate-400 font-medium text-sm"
                />
                <button 
                  onClick={handleVoiceSearch}
                  className={cn(
                    "shrink-0 transition-colors",
                    isListening ? 'text-primary animate-pulse' : 'text-slate-400 hover:text-primary'
                  )}
                >
                  {isListening ? <MicOff size={18} /> : <Mic size={18} />}
                </button>
              </div>
              <Link href="/restaurants">
                <button className="px-8 py-4 bg-gradient-to-r from-primary to-primary-dark text-white font-bold rounded-xl shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all flex items-center justify-center gap-2 shrink-0 w-full sm:w-auto">
                  <Search size={18} /> Find Food
                </button>
              </Link>
            </motion.div>

            {/* Social Proof */}
            <div className="flex items-center gap-6 mt-2">
              <div className="flex -space-x-3">
                {[11,12,13,14].map(i => (
                  <img key={i} src={`https://i.pravatar.cc/100?img=${i}`} alt="User" className="w-10 h-10 rounded-full border-2 border-white dark:border-slate-900 object-cover" />
                ))}
              </div>
              <div className="text-sm">
                <span className="text-slate-900 dark:text-white font-bold text-lg">250k+</span>
                <span className="text-slate-500 ml-2">Happy Foodies</span>
              </div>
            </div>
          </motion.div>

          {/* Hero Visual */}
          <motion.div 
            style={{ y: y1 }}
            className="hidden lg:flex relative h-[600px] w-full items-center justify-center overflow-visible"
          >
            <motion.div 
              animate={{ y: [0, -20, 0] }}
              transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
              className="w-[480px] h-[480px] rounded-full bg-gradient-to-tr from-primary/20 to-accent/30 relative shadow-2xl overflow-hidden ring-4 ring-white/10"
            >
              <img 
                src="https://images.unsplash.com/photo-1550547660-d9450f859349?w=800" 
                alt="Hero Food" 
                className="w-full h-full object-cover mix-blend-overlay opacity-60"
              />
              <img 
                src="https://plus.unsplash.com/premium_photo-1683619761468-b06992704398?w=800" 
                alt="Burger" 
                className="absolute inset-0 w-full h-full object-cover"
              />
            </motion.div>

            {/* Floating Cards */}
            <motion.div 
              className="absolute top-16 -left-8 glass-card p-4 rounded-xl flex items-center gap-3"
              animate={{ y: [0, -12, 0] }}
              transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
            >
              <div className="bg-emerald-100 dark:bg-emerald-500/20 p-2 rounded-full text-emerald-600 dark:text-emerald-400"><Clock size={18}/></div>
              <div>
                <p className="text-[11px] text-slate-500 font-medium">Delivery in</p>
                <p className="font-bold text-slate-800 dark:text-white text-sm">15-20 Min</p>
              </div>
            </motion.div>

            <motion.div 
              className="absolute bottom-16 -right-8 glass-card p-4 rounded-xl flex items-center gap-3"
              animate={{ y: [0, 12, 0] }}
              transition={{ repeat: Infinity, duration: 5, ease: "easeInOut", delay: 1 }}
            >
              <div className="bg-amber-100 dark:bg-amber-500/20 p-2 rounded-full text-amber-500"><Star size={18} fill="currentColor" /></div>
              <div>
                <p className="font-bold text-slate-800 dark:text-white text-sm">4.9/5 Rating</p>
                <p className="text-[11px] text-slate-500 font-medium">From 2k+ reviews</p>
              </div>
            </motion.div>

            <motion.div
              className="absolute top-1/2 -left-4 glass-card p-3 rounded-xl"
              animate={{ y: [0, 8, 0] }}
              transition={{ repeat: Infinity, duration: 3.5, ease: "easeInOut", delay: 2 }}
            >
              <div className="flex items-center gap-2">
                <div className="bg-primary/10 p-1.5 rounded-full"><Zap size={14} className="text-primary" /></div>
                <span className="text-xs font-bold text-slate-700 dark:text-slate-200">Free Delivery</span>
              </div>
            </motion.div>
          </motion.div>
        </motion.div>
      </section>

      {/* ─── Food Mood Selector ─── */}
      <section className="py-16 bg-slate-50 dark:bg-slate-950/50 relative z-20">
        <div className="max-w-5xl mx-auto px-6 lg:px-12">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-10"
          >
            <span className="text-sm font-bold text-primary uppercase tracking-widest">Food Mood Selector</span>
            <h2 className="text-3xl lg:text-4xl font-heading font-bold dark:text-white mt-2">How are you feeling today?</h2>
            <p className="text-slate-500 mt-2 max-w-md mx-auto">Tell us your mood and we&apos;ll recommend the perfect food for you</p>
          </motion.div>
          <FoodMoodSelector onSelect={handleMoodSelect} />
          <MoodResults mood={moodSelected} results={moodResults} />
        </div>
      </section>

      {/* ─── Categories ─── */}
      <section className="py-12 bg-white dark:bg-slate-950 relative z-20">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold font-heading dark:text-white">What&apos;s your craving?</h2>
            <Link href="/restaurants" className="text-primary font-bold hover:text-primary-dark transition-colors flex items-center gap-1 group text-sm">
              Explore All <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
          <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar snap-x">
            {categories.map((cat, i) => (
              <motion.button 
                key={cat.name}
                whileHover={{ scale: 1.05, y: -5 }}
                whileTap={{ scale: 0.95 }}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="flex flex-col items-center gap-3 min-w-[100px] snap-center p-4 rounded-2xl cursor-pointer hover:shadow-lg transition-all border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900/50"
              >
                <div className={cn('w-16 h-16 flex items-center justify-center rounded-2xl text-3xl', cat.color)}>
                  {cat.emoji}
                </div>
                <span className="font-medium text-sm text-slate-700 dark:text-slate-300">{cat.name}</span>
              </motion.button>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Trending Restaurants ─── */}
      <section className="py-16 bg-slate-50 dark:bg-black relative z-20">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="flex items-center justify-between mb-10">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shadow-lg shadow-primary/5">
                <TrendingUp size={24} />
              </div>
              <h2 className="text-3xl font-bold font-heading dark:text-white">Trending Near You</h2>
            </div>
            <Link href="/restaurants" className="hidden sm:flex text-slate-600 dark:text-slate-400 font-medium hover:text-primary transition-colors items-center gap-1 text-sm">
              Explore More <ArrowRight size={16} />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {restaurants.slice(0, 8).map((restaurant, i) => (
              <Link href={`/restaurant/${restaurant._id}`} key={restaurant._id}>
                <motion.div 
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ delay: i * 0.08 }}
                  whileHover={{ y: -8 }}
                  className="bg-white dark:bg-slate-900 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all border border-slate-100 dark:border-slate-800 group"
                >
                  <div className="relative h-44 overflow-hidden">
                    <img src={restaurant.image} alt={restaurant.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
                    <div className="absolute top-3 left-3 bg-white/90 dark:bg-slate-900/90 backdrop-blur px-2.5 py-1 rounded-lg text-sm font-bold flex items-center gap-1 shadow-sm">
                      <Star size={13} className="text-amber-500" fill="currentColor" /> {restaurant.rating}
                    </div>
                    {restaurant.deliveryTime && (
                      <div className="absolute bottom-3 right-3 bg-white/90 dark:bg-slate-900/90 backdrop-blur px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1">
                        <Clock size={11} /> {restaurant.deliveryTime}
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="font-bold text-base text-slate-900 dark:text-white mb-1 line-clamp-1 group-hover:text-primary transition-colors">{restaurant.name}</h3>
                    <p className="text-slate-500 text-sm mb-3 line-clamp-1">{restaurant.cuisines?.join(', ')}</p>
                    <div className="flex items-center justify-between text-xs text-slate-500">
                      <span className="font-medium flex items-center gap-1">
                        <MapPin size={12} /> {restaurant.deliveryFee === 0 ? 'Free Delivery' : `₹${restaurant.deliveryFee}`}
                      </span>
                      <span>₹{restaurant.minOrder} for one</span>
                    </div>
                  </div>
                </motion.div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Featured / Must-Try ─── */}
      <section className="py-16 bg-white dark:bg-slate-950 relative z-20">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="text-center mb-12">
            <span className="text-sm font-bold text-primary uppercase tracking-widest flex items-center justify-center gap-2 mb-2">
              <ChefHat size={16} /> Chef&apos;s Special
            </span>
            <h2 className="text-3xl font-bold font-heading dark:text-white">Must-Try Signatures</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {featuredItems.slice(0, 3).map((item, i) => (
              <motion.div 
                key={item._id}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                className="glass-card relative overflow-hidden group p-6 flex flex-col items-center text-center isolate"
              >
                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/60 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <img src={item.image} alt={item.name} className="absolute inset-0 w-full h-full object-cover z-0 opacity-10 blur-[2px] group-hover:blur-sm scale-110 group-hover:scale-125 transition-all duration-700" />
                
                <div className="relative z-20 w-36 h-36 rounded-full overflow-hidden border-4 border-white dark:border-slate-800 shadow-2xl mb-6 group-hover:-translate-y-2 transition-transform duration-500">
                  <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                </div>
                
                <div className="relative z-20">
                  <span className="inline-block px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-bold uppercase tracking-wider mb-3">Chef&apos;s Special</span>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">{item.name}</h3>
                  <p className="text-slate-600 dark:text-slate-300 text-sm mb-4 line-clamp-2">{item.description}</p>
                  <p className="text-2xl font-black text-primary mb-6">₹{item.price}</p>
                  
                  <Link 
                    href={`/restaurant/${item.restaurant?._id || item.restaurant}`}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl font-medium shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all"
                  >
                    View Details
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Why CraveBite ─── */}
      <section className="py-20 bg-slate-50 dark:bg-slate-950/50 relative z-20">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold font-heading dark:text-white">Why CraveBite?</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: Zap, title: 'Lightning Fast', desc: 'Average delivery in under 20 minutes', color: 'text-amber-500 bg-amber-100 dark:bg-amber-500/10' },
              { icon: Sparkles, title: 'AI-Powered', desc: 'Smart recommendations based on your taste', color: 'text-violet-500 bg-violet-100 dark:bg-violet-500/10' },
              { icon: Gift, title: 'Earn Rewards', desc: 'Get points, badges, and exclusive offers', color: 'text-emerald-500 bg-emerald-100 dark:bg-emerald-500/10' },
            ].map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                className="glass-card p-8 text-center hover:shadow-xl transition-all group"
              >
                <div className={cn('w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-5', feature.color)}>
                  <feature.icon size={28} />
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2 group-hover:text-primary transition-colors">{feature.title}</h3>
                <p className="text-sm text-slate-500">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── App Download CTA ─── */}
      <section className="py-24 relative overflow-hidden bg-primary">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1550547660-d9450f859349?w=1600')] bg-cover bg-center mix-blend-overlay opacity-10 grayscale" />
        <div className="absolute inset-0 bg-gradient-to-r from-primary to-accent opacity-90" />
        
        <div className="max-w-7xl mx-auto px-6 lg:px-12 relative z-10 flex flex-col md:flex-row items-center gap-12">
          <div className="flex-1 text-white text-center md:text-left">
            <h2 className="text-4xl md:text-5xl font-black font-heading mb-6 leading-tight">Download the<br/>CraveBite App!</h2>
            <p className="text-white/80 text-lg mb-8 max-w-xl mx-auto md:mx-0">Get exclusive app-only offers, live order tracking, and a much smoother experience on iOS and Android.</p>
            <div className="flex flex-wrap justify-center md:justify-start gap-4">
              <button className="flex items-center gap-3 bg-black text-white px-6 py-3 rounded-xl hover:scale-105 transition-transform shadow-lg">
                <div className="text-left">
                  <p className="text-xs text-slate-300">Download on the</p>
                  <p className="text-lg font-bold">App Store</p>
                </div>
              </button>
              <button className="flex items-center gap-3 bg-black text-white px-6 py-3 rounded-xl hover:scale-105 transition-transform shadow-lg">
                <div className="text-left">
                  <p className="text-xs text-slate-300">GET IT ON</p>
                  <p className="text-lg font-bold">Google Play</p>
                </div>
              </button>
            </div>
          </div>
          
          <div className="flex-1 w-full max-w-sm hidden md:block">
            <div className="relative mx-auto w-60 h-[480px] bg-slate-900 rounded-[3rem] border-8 border-slate-800 shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden">
              <div className="absolute top-0 inset-x-0 h-6 bg-slate-800 rounded-b-xl z-20 w-28 mx-auto" />
              <img src="https://images.unsplash.com/photo-1544025162-d76694265947?w=400" className="w-full h-full object-cover opacity-80" alt="App Preview" />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent z-10 flex flex-col justify-end p-6">
                <div className="w-full h-14 bg-white/20 backdrop-blur rounded-full flex items-center justify-around px-4 mb-2">
                  <div className="w-5 h-5 rounded-full bg-white/50" />
                  <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center shrink-0 -translate-y-3 shadow-lg shadow-primary/50 text-white"><ShoppingBag size={14}/></div>
                  <div className="w-5 h-5 rounded-full bg-white/50" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Footer ─── */}
      <footer className="py-12 bg-slate-900 dark:bg-black relative z-20">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-white font-bold text-sm">C</div>
                <span className="text-lg font-bold text-white">Crave<span className="text-primary">Bite</span></span>
              </div>
              <p className="text-sm text-slate-400 leading-relaxed">The smartest way to order food. AI-powered, lightning fast.</p>
            </div>
            <div>
              <h4 className="text-sm font-bold text-white mb-4 uppercase tracking-wider">Company</h4>
              <div className="space-y-2">
                {['About Us', 'Careers', 'Blog', 'Press'].map(item => (
                  <a key={item} className="block text-sm text-slate-400 hover:text-white transition-colors cursor-pointer">{item}</a>
                ))}
              </div>
            </div>
            <div>
              <h4 className="text-sm font-bold text-white mb-4 uppercase tracking-wider">For You</h4>
              <div className="space-y-2">
                {['Privacy Policy', 'Terms', 'Security', 'Accessibility'].map(item => (
                  <a key={item} className="block text-sm text-slate-400 hover:text-white transition-colors cursor-pointer">{item}</a>
                ))}
              </div>
            </div>
            <div>
              <h4 className="text-sm font-bold text-white mb-4 uppercase tracking-wider">Partners</h4>
              <div className="space-y-2">
                {['Register Restaurant', 'Deliver with Us', 'Partnerships', 'Developers'].map(item => (
                  <a key={item} className="block text-sm text-slate-400 hover:text-white transition-colors cursor-pointer">{item}</a>
                ))}
              </div>
            </div>
          </div>
          <div className="border-t border-slate-800 mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs text-slate-500">© {new Date().getFullYear()} CraveBite. All rights reserved.</p>
            <div className="flex gap-4">
              {['Twitter', 'Instagram', 'LinkedIn'].map(social => (
                <a key={social} className="text-xs text-slate-500 hover:text-white transition-colors cursor-pointer">{social}</a>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
