import React, { useState } from 'react';
import { useShop } from '../context/ShopContext';
import {
  Filter,
  RotateCcw,
  Sparkles,
  ChevronDown,
  Check,
  CheckCircle2,
  X
} from 'lucide-react';
import { JewelryCategory, MetalType, GemstoneType } from '../types';

export const ProductFilter: React.FC = () => {
  const {
    selectedCategory,
    setSelectedCategory,
    selectedMetal,
    setSelectedMetal,
    selectedGemstone,
    setSelectedGemstone,
    onlyInStock,
    setOnlyInStock,
    sortBy,
    setSortBy,
    priceRange,
    setPriceRange,
    searchQuery,
    setSearchQuery,
    formatPrice,
    products,
  } = useShop();

  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);

  const categories: { key: JewelryCategory; label: string }[] = [
    { key: 'all', label: 'All Designs' },
    { key: 'rings', label: 'Rings' },
    { key: 'necklaces', label: 'Necklaces' },
    { key: 'earrings', label: 'Earrings' },
    { key: 'bracelets', label: 'Bracelets' },
    { key: 'bridal', label: 'Bridal' },
  ];

  const metals: { key: MetalType | 'all'; label: string }[] = [
    { key: 'all', label: 'All Precious Metals' },
    { key: '18k-yellow-gold', label: '18K Yellow Gold' },
    { key: '14k-rose-gold', label: '14K Rose Gold' },
    { key: '925-sterling-silver', label: '925 Sterling Silver' },
    { key: 'platinum', label: '950 Platinum' },
  ];

  const gemstones: { key: GemstoneType | 'all'; label: string }[] = [
    { key: 'all', label: 'All Gemstones' },
    { key: 'diamond', label: 'Diamonds' },
    { key: 'emerald', label: 'Emeralds' },
    { key: 'sapphire', label: 'Sapphires' },
    { key: 'freshwater-pearl', label: 'Freshwater Pearls' },
    { key: 'ruby', label: 'Rubies' },
    { key: 'opal', label: 'Opals' },
    { key: 'moissanite', label: 'Ethical Moissanite' },
    { key: 'none', label: 'Pure Metal Sculpting' },
  ];

  const hasActiveFilters =
    selectedCategory !== 'all' ||
    selectedMetal !== 'all' ||
    selectedGemstone !== 'all' ||
    onlyInStock ||
    searchQuery.trim() !== '' ||
    priceRange[1] < 1500;

  const handleResetFilters = () => {
    setSelectedCategory('all');
    setSelectedMetal('all');
    setSelectedGemstone('all');
    setOnlyInStock(false);
    setSearchQuery('');
    setPriceRange([0, 1500]);
    setSortBy('featured');
  };

  return (
    <div id="filter-controls-container" className="bg-white border-y border-stone-200 py-4 mb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
        
        {/* Top Control Bar: Category Pills + Search + Sort */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          
          {/* Category Quick Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
            {categories.map((cat) => (
              <button
                key={cat.key}
                id={`filter-pill-${cat.key}`}
                onClick={() => setSelectedCategory(cat.key)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition ${
                  selectedCategory === cat.key
                    ? 'bg-stone-900 text-amber-200 shadow-xs'
                    : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Search, Filter Drawer Toggle & Sort dropdown */}
          <div className="flex items-center gap-3 justify-between md:justify-end">
            
            {/* Filter Toggle Button */}
            <button
              id="btn-toggle-filters"
              onClick={() => setIsFilterPanelOpen(!isFilterPanelOpen)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition ${
                isFilterPanelOpen || hasActiveFilters
                  ? 'border-amber-600 bg-amber-50 text-amber-900'
                  : 'border-stone-200 text-stone-700 hover:bg-stone-50'
              }`}
            >
              <Filter className="w-3.5 h-3.5 text-amber-700" />
              <span>Refine Attributes</span>
              {hasActiveFilters && (
                <span className="w-2 h-2 rounded-full bg-amber-600" />
              )}
            </button>

            {/* In-stock Only quick switch */}
            <button
              id="filter-toggle-instock"
              onClick={() => setOnlyInStock(!onlyInStock)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition ${
                onlyInStock
                  ? 'border-emerald-600 bg-emerald-50 text-emerald-800'
                  : 'border-stone-200 text-stone-600 hover:bg-stone-50'
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${onlyInStock ? 'bg-emerald-600' : 'bg-stone-300'}`} />
              <span className="hidden sm:inline">In Stock Only</span>
              <span className="sm:hidden">In Stock</span>
            </button>

            {/* Sort Selector */}
            <div className="relative">
              <select
                id="filter-sort-select"
                value={sortBy}
                onChange={(e: any) => setSortBy(e.target.value)}
                aria-label="Sort products by"
                className="appearance-none bg-stone-100 border border-stone-200 text-stone-800 text-xs rounded-lg pl-3 pr-8 py-1.5 font-medium focus:outline-none focus:border-stone-400 cursor-pointer"
              >
                <option value="featured">Featured Atelier Pieces</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="stock-urgency">⚡ Stock Urgency (Lowest First)</option>
                <option value="rating">Highest Rated (★ 5.0)</option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-500 pointer-events-none" />
            </div>

          </div>
        </div>

        {/* Expandable Advanced Filter Drawer */}
        {isFilterPanelOpen && (
          <div id="expanded-filters-panel" className="pt-4 border-t border-stone-200 grid grid-cols-1 sm:grid-cols-3 gap-6 text-xs animate-fadeIn">
            
            {/* Precious Metal Selector */}
            <div className="space-y-2">
              <label className="font-semibold text-stone-800 uppercase tracking-wider text-[11px] block">
                Precious Metal
              </label>
              <div className="space-y-1">
                {metals.map((m) => (
                  <button
                    key={m.key}
                    onClick={() => setSelectedMetal(m.key)}
                    className={`w-full text-left px-2.5 py-1.5 rounded flex items-center justify-between transition ${
                      selectedMetal === m.key
                        ? 'bg-amber-100/80 text-amber-950 font-semibold'
                        : 'text-stone-600 hover:bg-stone-100'
                    }`}
                  >
                    <span>{m.label}</span>
                    {selectedMetal === m.key && <Check className="w-3.5 h-3.5 text-amber-800" />}
                  </button>
                ))}
              </div>
            </div>

            {/* Gemstone Selector */}
            <div className="space-y-2">
              <label className="font-semibold text-stone-800 uppercase tracking-wider text-[11px] block">
                Gemstone & Solitaire
              </label>
              <div className="space-y-1 max-h-44 overflow-y-auto pr-1">
                {gemstones.map((g) => (
                  <button
                    key={g.key}
                    onClick={() => setSelectedGemstone(g.key)}
                    className={`w-full text-left px-2.5 py-1.5 rounded flex items-center justify-between transition ${
                      selectedGemstone === g.key
                        ? 'bg-amber-100/80 text-amber-950 font-semibold'
                        : 'text-stone-600 hover:bg-stone-100'
                    }`}
                  >
                    <span>{g.label}</span>
                    {selectedGemstone === g.key && <Check className="w-3.5 h-3.5 text-amber-800" />}
                  </button>
                ))}
              </div>
            </div>

            {/* Price Range Slider */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="font-semibold text-stone-800 uppercase tracking-wider text-[11px]">
                  Price Ceiling: {formatPrice(priceRange[1])}
                </label>
              </div>
              <input
                id="filter-price-slider"
                type="range"
                min="100"
                max="1500"
                step="25"
                value={priceRange[1]}
                onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                className="w-full h-1.5 bg-stone-200 rounded-lg appearance-none cursor-pointer accent-stone-900"
              />
              <div className="flex justify-between text-[11px] text-stone-400 font-mono">
                <span>$100</span>
                <span>$750</span>
                <span>$1,500+</span>
              </div>

              {hasActiveFilters && (
                <button
                  id="btn-reset-filters"
                  onClick={handleResetFilters}
                  className="w-full mt-2 py-1.5 border border-stone-300 text-stone-600 hover:bg-stone-100 rounded text-xs flex items-center justify-center gap-1.5 transition"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset All Refinements</span>
                </button>
              )}
            </div>

          </div>
        )}

        {/* Active Filter Tags */}
        {hasActiveFilters && (
          <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
            <span className="text-stone-400 text-[11px]">Active Filters:</span>

            {selectedCategory !== 'all' && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-stone-100 text-stone-700 border border-stone-200">
                Category: {categories.find((c) => c.key === selectedCategory)?.label}
                <button onClick={() => setSelectedCategory('all')} className="hover:text-stone-950">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            {selectedMetal !== 'all' && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-stone-100 text-stone-700 border border-stone-200">
                Metal: {metals.find((m) => m.key === selectedMetal)?.label}
                <button onClick={() => setSelectedMetal('all')} className="hover:text-stone-950">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            {selectedGemstone !== 'all' && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-stone-100 text-stone-700 border border-stone-200">
                Gemstone: {gemstones.find((g) => g.key === selectedGemstone)?.label}
                <button onClick={() => setSelectedGemstone('all')} className="hover:text-stone-950">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            {onlyInStock && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                In Stock Only
                <button onClick={() => setOnlyInStock(false)} className="hover:text-emerald-950">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            {searchQuery && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-200">
                Search: "{searchQuery}"
                <button onClick={() => setSearchQuery('')} className="hover:text-amber-950">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            <button
              onClick={handleResetFilters}
              className="text-stone-500 hover:text-stone-900 underline text-[11px] ml-2"
            >
              Clear all
            </button>
          </div>
        )}

      </div>
    </div>
  );
};
