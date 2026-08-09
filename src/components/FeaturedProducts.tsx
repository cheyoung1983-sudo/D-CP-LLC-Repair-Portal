/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShoppingBag, ChevronRight, Star, Search, Filter } from 'lucide-react';
import { cn } from '../lib/utils.ts';

const PRODUCTS = [
  {
    id: 'p1',
    name: 'iPhone 15 Pro Max Screen Renewal',
    price: '$141.90',
    tier: 'Tier 2',
    category: 'Displays',
    image: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?q=80&w=800&auto=format&fit=crop',
    rating: 4.9,
    reviews: 128
  },
  {
    id: 'p2',
    name: 'Logic Board Triage & Trace',
    price: '$49.00',
    tier: 'Tier 3',
    category: 'Diagnostics',
    image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=800&auto=format&fit=crop',
    rating: 5.0,
    reviews: 84
  },
  {
    id: 'p3',
    name: 'OEM Battery Refresh (iPhone 14)',
    price: '$119.99',
    tier: 'Tier 1',
    category: 'Power',
    image: 'https://images.unsplash.com/photo-1611186871348-b1ec696e52c9?q=80&w=800&auto=format&fit=crop',
    rating: 4.8,
    reviews: 210
  },
  {
    id: 'p4',
    name: 'Galaxy S24 Ultra Display Pack',
    price: '$369.99',
    tier: 'Tier 2',
    category: 'Displays',
    image: 'https://images.unsplash.com/photo-1707323890204-f6551b327b87?q=80&w=800&auto=format&fit=crop',
    rating: 4.9,
    reviews: 42
  }
];

export default function FeaturedProducts() {
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');

  const categories = ['All', 'Displays', 'Power', 'Diagnostics'];

  const filteredProducts = PRODUCTS.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = activeCategory === 'All' || p.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between mb-16 gap-12">
          <div className="max-w-2xl">
            <h2 className="text-sm font-black uppercase tracking-[0.3em] text-blue-600 mb-4">Precision Inventory</h2>
            <h3 className="text-4xl md:text-6xl font-playfair font-black text-slate-900 leading-tight">
              Curated Service <br />
              <span className="italic text-slate-400">& Repair Assemblies</span>
            </h3>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 flex-1 lg:max-w-md">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input 
                type="text" 
                placeholder="Search inventory..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full h-12 pl-12 pr-4 rounded-2xl bg-slate-50 border-2 border-slate-50 focus:border-slate-900 focus:bg-white outline-none transition-all text-sm font-medium"
              />
            </div>
            <div className="flex gap-1 bg-slate-50 p-1 rounded-2xl overflow-x-auto no-scrollbar">
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={cn(
                    "px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap",
                    activeCategory === cat ? "bg-white text-slate-900 shadow-sm" : "text-slate-400 hover:text-slate-900"
                  )}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <AnimatePresence mode="popLayout">
            {filteredProducts.map((product, idx) => (
              <motion.div
                key={product.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.2 }}
                className="group cursor-pointer"
              >
                <div className="relative aspect-[4/5] overflow-hidden rounded-[2rem] mb-6 bg-slate-100 shadow-sm group-hover:shadow-xl group-hover:shadow-slate-200/50 transition-all">
                  <img 
                    src={product.image} 
                    alt={product.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='500' viewBox='0 0 400 500'%3E%3Crect width='400' height='500' fill='%3C%230f172a'/%3E%3Crect x='100' y='120' width='200' height='260' rx='20' fill='%3C%231e293b' stroke='%3C%23334155' stroke-width='4'/%3E%3Ccircle cx='200' cy='150' r='8' fill='%3C%2338bdf8'/%3E%3Crect x='140' y='180' width='120' height='140' rx='8' fill='%3C%230284c7' opacity='0.3'/%3E%3Ctext x='200' y='420' text-anchor='middle' fill='%3C%2394a3b8' font-family='sans-serif' font-size='14' font-weight='bold'%3EPrecision Hardware Unit%3C/text%3E%3C/svg%3E";
                    }}
                  />
                  <div className="absolute top-4 left-4">
                    <span className="px-3 py-1 bg-white/90 backdrop-blur-md rounded-full text-[10px] font-black uppercase tracking-widest text-slate-900 shadow-sm">
                      {product.tier}
                    </span>
                  </div>
                  <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center transform scale-90 group-hover:scale-100 transition-transform">
                      <ShoppingBag className="w-5 h-5 text-slate-900" />
                    </div>
                  </div>
                </div>

                <div className="space-y-2 px-2">
                  <div className="flex items-center gap-1 text-yellow-500">
                    <Star className="w-3 h-3 fill-current" />
                    <span className="text-[10px] font-black text-slate-900">{product.rating}</span>
                    <span className="text-[10px] text-slate-400 font-medium">({product.reviews})</span>
                  </div>
                  <h4 className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors leading-tight">{product.name}</h4>
                  <div className="flex items-center justify-between">
                    <span className="text-xl font-black text-slate-900">{product.price}</span>
                    <button className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400 group-hover:text-slate-900 group-hover:bg-slate-100 transition-all">
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {filteredProducts.length === 0 && (
          <div className="py-32 text-center space-y-4">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto text-slate-300">
              <Search className="w-8 h-8" />
            </div>
            <p className="text-slate-500 font-medium">No results found in the Laboratory Store.</p>
          </div>
        )}
      </div>
    </section>
  );
}
