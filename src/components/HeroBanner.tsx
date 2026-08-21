import React from 'react';
import { useShop } from '../context/ShopContext';
import { Sparkles, Shield, Award, Clock, ArrowRight } from 'lucide-react';
import { JewelryCategory } from '../types';

export const HeroBanner: React.FC = () => {
  const { setSelectedCategory, setIsStylistOpen, setIsInventoryManagerOpen } = useShop();

  const featuredCollections: { title: string; category: JewelryCategory; img: string; tag: string }[] = [
    {
      title: 'Hand-Forged Rings',
      category: 'rings',
      img: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=600&q=80',
      tag: 'Bespoke Sizing',
    },
    {
      title: 'Emeralds & Sapphires',
      category: 'necklaces',
      img: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=600&q=80',
      tag: 'Untreated Stones',
    },
    {
      title: 'Baroque Pearls',
      category: 'earrings',
      img: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=600&q=80',
      tag: 'Organically Cultured',
    },
    {
      title: 'Solid 950 Platinum',
      category: 'bridal',
      img: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=600&q=80',
      tag: 'Heirloom Grade',
    },
  ];

  return (
    <section id="hero-atelier-section" className="relative bg-gradient-to-b from-stone-900 via-stone-850 to-stone-900 text-stone-100 py-12 lg:py-16 border-b border-stone-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Main Editorial Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* Left Text Block */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-950/70 border border-amber-800/60 text-amber-300 text-xs font-mono tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>LIVE ATELIER INVENTORY • MICRO-BATCH CRAFTSMANSHIP</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-serif-luxury font-normal text-amber-100 tracking-tight leading-[1.1]">
              Heirloom Jewelry, <br className="hidden sm:inline" />
              <span className="italic font-light text-amber-200/90">forged by hand for generations.</span>
            </h1>

            <p className="text-stone-300 text-base sm:text-lg font-light leading-relaxed max-w-2xl mx-auto lg:mx-0">
              Each piece is individually sculpted at our bench using 100% recycled solid gold, ethically unearthed raw gemstones, and centuries-old metalsmithing traditions. Featuring live inventory synchronization and personalized bespoke engravings.
            </p>

            {/* Quick Action Badges */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 pt-2">
              <button
                id="btn-explore-collection"
                onClick={() => {
                  const el = document.getElementById('products-section');
                  el?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="px-6 py-3 bg-amber-500 hover:bg-amber-400 text-stone-950 font-semibold text-sm rounded-full transition shadow-lg shadow-amber-950/50 flex items-center gap-2"
              >
                <span>Explore Available Pieces</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                id="btn-consult-concierge"
                onClick={() => setIsStylistOpen(true)}
                className="px-5 py-3 bg-stone-800/80 hover:bg-stone-700/80 text-amber-200 border border-stone-700 text-sm rounded-full transition flex items-center gap-2"
              >
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>Ask Atelier Stylist</span>
              </button>
            </div>

            {/* Value Props */}
            <div className="grid grid-cols-3 gap-4 pt-4 border-t border-stone-800 text-center lg:text-left">
              <div className="space-y-1">
                <div className="flex items-center justify-center lg:justify-start gap-1.5 text-amber-400">
                  <Clock className="w-4 h-4" />
                  <span className="text-xs font-mono font-bold">15-Min</span>
                </div>
                <p className="text-xs text-stone-400">Cart Stock Hold</p>
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-center lg:justify-start gap-1.5 text-amber-400">
                  <Shield className="w-4 h-4" />
                  <span className="text-xs font-mono font-bold">256-Bit</span>
                </div>
                <p className="text-xs text-stone-400">Secure Checkout</p>
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-center lg:justify-start gap-1.5 text-amber-400">
                  <Award className="w-4 h-4" />
                  <span className="text-xs font-mono font-bold">Lifetime</span>
                </div>
                <p className="text-xs text-stone-400">Atelier Warranty</p>
              </div>
            </div>
          </div>

          {/* Right Featured Grid */}
          <div className="lg:col-span-5 grid grid-cols-2 gap-3 sm:gap-4">
            {featuredCollections.map((item, idx) => (
              <div
                key={idx}
                id={`hero-collection-${item.category}`}
                onClick={() => setSelectedCategory(item.category)}
                className="group relative h-40 sm:h-48 rounded-xl overflow-hidden cursor-pointer border border-stone-700/60 shadow-md hover:border-amber-500/80 transition"
              >
                <img
                  src={item.img}
                  alt={item.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-stone-950/90 via-stone-950/40 to-transparent" />
                
                <div className="absolute bottom-3 left-3 right-3 text-left">
                  <span className="text-[10px] uppercase font-mono tracking-widest text-amber-400 bg-stone-900/80 px-2 py-0.5 rounded backdrop-blur-sm border border-amber-800/40">
                    {item.tag}
                  </span>
                  <h2 className="text-sm sm:text-base font-serif-luxury text-stone-100 font-medium mt-1 leading-tight group-hover:text-amber-300 transition">
                    {item.title}
                  </h2>
                </div>
              </div>
            ))}
          </div>

        </div>
      </div>
    </section>
  );
};
