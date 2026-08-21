import React, { useState } from 'react';
import { useShop, CURRENCY_RATES, CurrencyCode } from '../context/ShopContext';
import {
  ShoppingBag,
  Heart,
  Search,
  Sparkles,
  SlidersHorizontal,
  Compass,
  Clock,
  ShieldCheck,
  Menu,
  X,
  Layers,
  ChevronDown
} from 'lucide-react';
import { JewelryCategory } from '../types';

export const Navbar: React.FC = () => {
  const {
    cartCount,
    setIsCartOpen,
    wishlist,
    currency,
    setCurrency,
    selectedCategory,
    setSelectedCategory,
    searchQuery,
    setSearchQuery,
    setIsInventoryManagerOpen,
    setIsStylistOpen,
    setIsRingSizerOpen,
    reservationTimeLeft,
    products,
  } = useShop();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCurrencyDropdownOpen, setIsCurrencyDropdownOpen] = useState(false);

  const lowStockCount = products.filter((p) => p.stock > 0 && p.stock <= p.lowStockThreshold).length;

  const categories: { key: JewelryCategory; label: string }[] = [
    { key: 'all', label: 'All Collections' },
    { key: 'rings', label: 'Rings & Bands' },
    { key: 'necklaces', label: 'Pendants & Necklaces' },
    { key: 'earrings', label: 'Earrings' },
    { key: 'bracelets', label: 'Cuffs & Bracelets' },
    { key: 'bridal', label: 'Bridal & Heirlooms' },
  ];

  return (
    <header id="main-header" className="sticky top-0 z-40 bg-stone-900 text-stone-100 shadow-md">
      {/* Announcement Bar */}
      <div id="announcement-bar" className="bg-amber-950/80 border-b border-amber-800/40 text-amber-200/90 text-xs py-1.5 px-4 text-center font-medium tracking-wider flex items-center justify-center gap-2">
        <span className="inline-block w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
        <span>COMPLIMENTARY HEIRLOOM VELVET BOX ON ORDERS OVER $150</span>
        <span className="hidden md:inline text-amber-400/60">•</span>
        <span className="hidden md:inline">100% RECYCLED SOLID GOLD & ETHICAL GEMSTONES</span>
        <span className="hidden md:inline text-amber-400/60">•</span>
        <span className="hidden lg:inline flex items-center gap-1">
          <ShieldCheck className="w-3.5 h-3.5 text-amber-300 inline" /> SECURE 256-BIT ENCRYPTED CHECKOUT
        </span>
      </div>

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Mobile menu button */}
          <div className="flex items-center gap-3 lg:hidden">
            <button
              id="mobile-menu-toggle"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 text-stone-300 hover:text-white rounded-md focus:outline-none"
              aria-label="Toggle Navigation Menu"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
            <button
              id="btn-search-mobile"
              onClick={() => {
                const searchEl = document.getElementById('catalog-search-input');
                searchEl?.focus();
                searchEl?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="p-2 text-stone-300 hover:text-white"
              title="Search"
            >
              <Search className="w-5 h-5" />
            </button>
          </div>

          {/* Brand Atelier Logo */}
          <div className="flex flex-col items-center lg:items-start cursor-pointer select-none" onClick={() => setSelectedCategory('all')}>
            <div className="flex items-center gap-2">
              <span className="text-2xl sm:text-3xl font-serif-luxury tracking-[0.25em] text-amber-100 font-normal">
                A U R A
              </span>
              <span className="text-[10px] bg-amber-900/60 border border-amber-700/50 text-amber-300 px-1.5 py-0.5 rounded font-mono tracking-normal">
                ATELIER
              </span>
            </div>
            <span className="text-[9px] uppercase tracking-[0.3em] text-stone-400 font-light -mt-1 hidden sm:block">
              Fine Handmade Jewelry
            </span>
          </div>

          {/* Center Search on Desktop */}
          <div className="hidden lg:flex items-center flex-1 max-w-xs mx-8">
            <div className="relative w-full">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
              <input
                id="header-search-input"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search rings, emeralds, 18k gold..."
                className="w-full pl-9 pr-4 py-1.5 bg-stone-800/80 border border-stone-700 rounded-full text-xs text-stone-200 placeholder-stone-400 focus:outline-none focus:border-amber-400 transition"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-stone-400 hover:text-white"
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          {/* Quick Tools & CTAs */}
          <div className="flex items-center gap-2 sm:gap-4">
            {/* AI Stylist */}
            <button
              id="btn-ai-stylist"
              onClick={() => setIsStylistOpen(true)}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-full bg-gradient-to-r from-amber-900/50 to-stone-800 border border-amber-600/40 text-amber-200 hover:border-amber-400 transition shadow-sm"
              title="Get personalized styling advice from our Master Atelier Goldsmith"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
              <span>AI Jewelry Stylist</span>
            </button>

            {/* Ring Sizer */}
            <button
              id="btn-ring-sizer"
              onClick={() => setIsRingSizerOpen(true)}
              className="hidden md:flex items-center gap-1.5 px-2.5 py-1.5 text-xs text-stone-300 hover:text-amber-200 hover:bg-stone-800 rounded-md transition"
              title="Interactive Ring Sizing Guide"
            >
              <Compass className="w-3.5 h-3.5 text-stone-400" />
              <span>Ring Sizer</span>
            </button>

            {/* Live Inventory Admin Portal */}
            <button
              id="btn-inventory-admin"
              onClick={() => setIsInventoryManagerOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-full bg-stone-800 border border-stone-700 hover:border-amber-500/80 text-stone-200 hover:text-white transition shadow-sm"
              title="Live Real-time Inventory & Atelier Workshop Hub"
            >
              <Layers className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">Live Inventory Hub</span>
              <span className="sm:hidden">Inventory</span>
              {lowStockCount > 0 && (
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                </span>
              )}
            </button>

            {/* Currency Selector */}
            <div className="relative">
              <button
                id="btn-currency-selector"
                onClick={() => setIsCurrencyDropdownOpen(!isCurrencyDropdownOpen)}
                className="flex items-center gap-1 text-xs text-stone-300 hover:text-white px-2 py-1.5 rounded bg-stone-800/50 border border-stone-700"
              >
                <span>{currency}</span>
                <ChevronDown className="w-3 h-3 text-stone-400" />
              </button>
              {isCurrencyDropdownOpen && (
                <div
                  id="currency-dropdown"
                  className="absolute right-0 mt-2 w-32 bg-stone-900 border border-stone-700 rounded-lg shadow-xl py-1 z-50 text-xs"
                >
                  {(Object.keys(CURRENCY_RATES) as CurrencyCode[]).map((code) => (
                    <button
                      key={code}
                      onClick={() => {
                        setCurrency(code);
                        setIsCurrencyDropdownOpen(false);
                      }}
                      className={`w-full text-left px-3 py-1.5 hover:bg-stone-800 transition flex items-center justify-between ${
                        currency === code ? 'text-amber-400 font-semibold bg-stone-800/40' : 'text-stone-300'
                      }`}
                    >
                      <span>{code}</span>
                      <span className="text-stone-500">{CURRENCY_RATES[code].symbol}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Wishlist */}
            <button
              id="btn-wishlist"
              onClick={() => {
                const searchEl = document.getElementById('catalog-search-input');
                searchEl?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="relative p-2 text-stone-300 hover:text-amber-200 transition"
              title="Saved Items"
            >
              <Heart className="w-5 h-5" />
              {wishlist.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-rose-600 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                  {wishlist.length}
                </span>
              )}
            </button>

            {/* Shopping Cart Drawer Trigger */}
            <button
              id="btn-open-cart"
              onClick={() => setIsCartOpen(true)}
              className="relative flex items-center gap-2 px-3.5 py-2 rounded-full bg-amber-500 hover:bg-amber-400 text-stone-950 font-semibold text-xs tracking-wide transition shadow-md shadow-amber-950/40 group"
            >
              <ShoppingBag className="w-4 h-4 transition-transform group-hover:scale-110" />
              <span className="hidden sm:inline">Bag</span>
              <span className="bg-stone-950 text-amber-300 text-[11px] px-1.5 py-0.2 rounded-full font-mono font-bold">
                {cartCount}
              </span>
              {reservationTimeLeft && (
                <span
                  className="hidden md:flex items-center gap-1 text-[10px] bg-stone-900/80 text-amber-300 px-1.5 py-0.5 rounded font-mono"
                  title="Active stock reservation hold countdown"
                >
                  <Clock className="w-2.5 h-2.5 text-amber-400 animate-spin" />
                  {reservationTimeLeft}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Category Navigation Links (Desktop) */}
        <nav id="category-navigation" className="hidden lg:flex items-center justify-center gap-8 py-3 border-t border-stone-800/80 text-xs tracking-widest uppercase font-medium">
          {categories.map((cat) => {
            const isActive = selectedCategory === cat.key;
            return (
              <button
                key={cat.key}
                id={`nav-category-${cat.key}`}
                onClick={() => setSelectedCategory(cat.key)}
                className={`pb-1 transition border-b-2 ${
                  isActive
                    ? 'text-amber-300 border-amber-400 font-semibold'
                    : 'text-stone-400 hover:text-stone-200 border-transparent'
                }`}
              >
                {cat.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Mobile Drawer Menu */}
      {isMobileMenuOpen && (
        <div id="mobile-menu-drawer" className="lg:hidden bg-stone-950 border-t border-stone-800 px-4 py-4 space-y-4">
          <div className="space-y-1">
            <p className="text-[10px] uppercase font-bold text-stone-400 tracking-wider px-2 mb-2">Collections</p>
            {categories.map((cat) => (
              <button
                key={cat.key}
                onClick={() => {
                  setSelectedCategory(cat.key);
                  setIsMobileMenuOpen(false);
                }}
                className={`w-full text-left px-3 py-2 rounded-md text-sm ${
                  selectedCategory === cat.key
                    ? 'bg-amber-950/60 text-amber-300 font-medium border border-amber-800/40'
                    : 'text-stone-300 hover:bg-stone-900'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          <div className="pt-2 border-t border-stone-800 space-y-2">
            <button
              onClick={() => {
                setIsStylistOpen(true);
                setIsMobileMenuOpen(false);
              }}
              className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg bg-stone-900 text-amber-200 text-xs font-medium border border-amber-800/30"
            >
              <span className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                AI Jewelry Stylist & Gift Concierge
              </span>
              <span>→</span>
            </button>
            <button
              onClick={() => {
                setIsRingSizerOpen(true);
                setIsMobileMenuOpen(false);
              }}
              className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg bg-stone-900 text-stone-300 text-xs"
            >
              <span className="flex items-center gap-2">
                <Compass className="w-4 h-4 text-stone-400" />
                Ring Size Finder & Conversion Chart
              </span>
              <span>→</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
