import React from 'react';
import { ShopProvider, useShop } from './context/ShopContext';
import { Navbar } from './components/Navbar';
import { HeroBanner } from './components/HeroBanner';
import { ProductFilter } from './components/ProductFilter';
import { ProductCard } from './components/ProductCard';
import { ProductDetailModal } from './components/ProductDetailModal';
import { CartDrawer } from './components/CartDrawer';
import { CheckoutModal } from './components/CheckoutModal';
import { InventoryManagerModal } from './components/InventoryManagerModal';
import { JewelryStylistModal } from './components/JewelryStylistModal';
import { RingSizerModal } from './components/RingSizerModal';
import { Footer } from './components/Footer';
import {
  Sparkles,
  Hammer,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Info,
  X,
  RotateCcw,
  Compass,
  Layers,
  Heart
} from 'lucide-react';

const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useShop();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`pointer-events-auto p-4 rounded-xl shadow-xl border flex items-start gap-3 transition-all duration-300 animate-slideUp ${
            toast.type === 'success'
              ? 'bg-stone-900 text-stone-100 border-amber-500/50'
              : toast.type === 'error'
              ? 'bg-rose-950 text-rose-100 border-rose-700'
              : toast.type === 'warning'
              ? 'bg-amber-950 text-amber-100 border-amber-700'
              : 'bg-stone-900 text-stone-100 border-stone-700'
          }`}
        >
          {toast.type === 'success' && <CheckCircle2 className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />}
          {toast.type === 'error' && <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />}
          {toast.type === 'warning' && <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />}
          {toast.type === 'info' && <Info className="w-5 h-5 text-sky-400 shrink-0 mt-0.5" />}

          <div className="flex-1 min-w-0">
            <h5 className="text-xs font-bold tracking-wide font-serif-luxury">{toast.title}</h5>
            <p className="text-[11px] opacity-90 leading-relaxed mt-0.5">{toast.message}</p>
          </div>

          <button
            onClick={() => removeToast(toast.id)}
            className="text-stone-400 hover:text-white p-1"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      ))}
    </div>
  );
};

const ShopContent: React.FC = () => {
  const {
    filteredProducts,
    isLoadingProducts,
    setSelectedCategory,
    setSelectedMetal,
    setSelectedGemstone,
    setOnlyInStock,
    setSearchQuery,
    setIsStylistOpen,
    setIsRingSizerOpen,
    setIsInventoryManagerOpen,
  } = useShop();

  const handleResetFilters = () => {
    setSelectedCategory('all');
    setSelectedMetal('all');
    setSelectedGemstone('all');
    setOnlyInStock(false);
    setSearchQuery('');
  };

  return (
    <div className="min-h-screen bg-[#faf9f6] text-stone-800 flex flex-col font-sans selection:bg-amber-200 selection:text-stone-950">
      {/* Top Navbar */}
      <Navbar />

      {/* Main Hero Header */}
      <HeroBanner />

      {/* Catalog & Shop Section */}
      <main id="atelier-catalog" className="flex-1 pb-20">
        
        {/* Product Filter & Sort Bar */}
        <ProductFilter />

        {/* Product Grid Area */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Header count and quick actions */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-6 gap-3">
            <div>
              <h2 className="text-xl sm:text-2xl font-serif-luxury font-medium text-stone-900">
                Hand-Forged Atelier Collection
              </h2>
              <p className="text-xs text-stone-500 mt-0.5">
                Showing <strong>{filteredProducts.length}</strong> one-of-a-kind and limited-edition handmade creations
              </p>
            </div>

            {/* Quick Sizing & Stylist Help triggers */}
            <div className="flex items-center gap-2 text-xs">
              <button
                onClick={() => setIsRingSizerOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-stone-200 text-stone-700 hover:border-amber-700 hover:text-amber-900 transition shadow-2xs"
              >
                <Compass className="w-3.5 h-3.5 text-amber-700" />
                <span>Ring Size Calibration</span>
              </button>

              <button
                onClick={() => setIsStylistOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-100/70 border border-amber-300 text-amber-950 hover:bg-amber-100 transition shadow-2xs font-medium"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-700" />
                <span>AI Stylist Advice</span>
              </button>
            </div>
          </div>

          {/* Loading state */}
          {isLoadingProducts ? (
            <div className="py-24 text-center space-y-3">
              <div className="w-8 h-8 border-2 border-stone-900 border-t-amber-500 rounded-full animate-spin mx-auto" />
              <p className="text-xs text-stone-500 font-serif-luxury italic">
                Gathering real-time atelier inventory & gemstone hallmarking...
              </p>
            </div>
          ) : filteredProducts.length === 0 ? (
            /* Empty Filter State */
            <div className="py-20 text-center max-w-md mx-auto bg-white rounded-2xl border border-stone-200 p-8 shadow-xs space-y-4">
              <div className="w-14 h-14 rounded-full bg-amber-50 border border-amber-200 flex items-center justify-center mx-auto text-amber-800">
                <Sparkles className="w-6 h-6" />
              </div>
              <h3 className="text-base font-serif-luxury font-semibold text-stone-900">
                No matching jewelry pieces found
              </h3>
              <p className="text-xs text-stone-500 leading-relaxed">
                We couldn't find any designs matching your specific combination of precious metal, gemstone, and price filters.
              </p>
              <button
                onClick={handleResetFilters}
                className="inline-flex items-center gap-1.5 px-5 py-2 bg-stone-900 text-amber-200 rounded-full text-xs font-semibold hover:bg-stone-800 transition"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset All Filters</span>
              </button>
            </div>
          ) : (
            /* Responsive Product Cards Grid */
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}

        </div>

        {/* Artisan Craftsmanship Spotlight Section */}
        <section className="mt-24 bg-stone-900 text-stone-100 py-16 border-y border-stone-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto space-y-3 mb-12">
              <span className="text-xs font-mono uppercase tracking-widest text-amber-400">
                The Anatomy of Handcrafted Luxury
              </span>
              <h2 className="text-2xl sm:text-3xl font-serif-luxury font-medium text-stone-100">
                Every Curve Forged by Hand, Never Mass Produced
              </h2>
              <p className="text-xs sm:text-sm text-stone-400 leading-relaxed">
                Unlike cast commercial jewelry, each Aura piece begins as raw gold grain, shaped over anvil horns and hand-set under high-power stereoscopic microscopes.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-xs">
              <div className="bg-stone-800/60 p-6 rounded-2xl border border-stone-700/60 space-y-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
                  <Hammer className="w-5 h-5" />
                </div>
                <h3 className="text-base font-serif-luxury font-medium text-stone-200">
                  1. Hand-Forged Metal Grain
                </h3>
                <p className="text-stone-400 leading-relaxed">
                  Cold forging on traditional anvils aligns precious metal crystals, producing jewelry that is significantly denser, stronger, and more resilient to daily wear.
                </p>
              </div>

              <div className="bg-stone-800/60 p-6 rounded-2xl border border-stone-700/60 space-y-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
                  <Sparkles className="w-5 h-5" />
                </div>
                <h3 className="text-base font-serif-luxury font-medium text-stone-200">
                  2. Optical Micro-Pavé Setting
                </h3>
                <p className="text-stone-400 leading-relaxed">
                  Gemstones and ethical diamonds are individually seated with custom-cut beads and bright-cut metal edges to maximize refractive light dispersion.
                </p>
              </div>

              <div className="bg-stone-800/60 p-6 rounded-2xl border border-stone-700/60 space-y-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <h3 className="text-base font-serif-luxury font-medium text-stone-200">
                  3. Official Assay Hallmarking
                </h3>
                <p className="text-stone-400 leading-relaxed">
                  Every completed piece is struck with our maker's mark and certified precious metal assay stamps (18K 750 / 925 / PT950) guaranteeing pure alloy integrity.
                </p>
              </div>
            </div>
          </div>
        </section>

      </main>

      {/* Footer */}
      <Footer />

      {/* Floating Active Modals */}
      <ProductDetailModal />
      <CartDrawer />
      <CheckoutModal />
      <InventoryManagerModal />
      <JewelryStylistModal />
      <RingSizerModal />

      {/* Global Real-time Toast Notifications */}
      <ToastContainer />
    </div>
  );
};

export default function App() {
  return (
    <ShopProvider>
      <ShopContent />
    </ShopProvider>
  );
}
