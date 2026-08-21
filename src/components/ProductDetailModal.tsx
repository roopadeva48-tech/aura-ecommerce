import React, { useState } from 'react';
import { useShop } from '../context/ShopContext';
import {
  X,
  Heart,
  ShoppingBag,
  ShieldCheck,
  Hammer,
  Sparkles,
  Compass,
  Truck,
  RotateCcw,
  CheckCircle,
  AlertCircle,
  ChevronRight
} from 'lucide-react';

export const ProductDetailModal: React.FC = () => {
  const {
    selectedProduct,
    setSelectedProduct,
    addToCart,
    formatPrice,
    toggleWishlist,
    isInWishlist,
    setIsRingSizerOpen,
    addToast,
  } = useShop();

  if (!selectedProduct) return null;

  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [selectedSize, setSelectedSize] = useState<string>(
    selectedProduct.availableSizes ? selectedProduct.availableSizes[0] : ''
  );
  const [engravingText, setEngravingText] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState<'craft' | 'specs' | 'care'>('craft');

  const isFavorited = isInWishlist(selectedProduct.id);
  const isOutOfStock = selectedProduct.stock <= 0;
  const isLowStock = selectedProduct.stock > 0 && selectedProduct.stock <= selectedProduct.lowStockThreshold;

  const handleAddToCart = async () => {
    if (isOutOfStock) return;
    setIsSubmitting(true);
    const success = await addToCart(
      selectedProduct,
      quantity,
      selectedSize || undefined,
      engravingText.trim() ? engravingText.trim() : undefined
    );
    setIsSubmitting(false);
    if (success) {
      setSelectedProduct(null);
    }
  };

  return (
    <div
      id="product-detail-modal-backdrop"
      className="fixed inset-0 z-50 bg-stone-950/75 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 overflow-y-auto"
      onClick={() => setSelectedProduct(null)}
    >
      <div
        id="product-detail-modal-content"
        className="relative bg-white w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden my-8 border border-stone-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          id="btn-close-product-modal"
          onClick={() => setSelectedProduct(null)}
          className="absolute top-4 right-4 p-2 bg-white/90 hover:bg-stone-100 rounded-full text-stone-600 hover:text-stone-950 z-20 shadow-sm border border-stone-200"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2">
          
          {/* Left Column: Image Gallery */}
          <div className="p-6 sm:p-8 bg-stone-50 border-r border-stone-100 flex flex-col justify-between space-y-4">
            
            {/* Primary Large Image */}
            <div className="relative aspect-square w-full rounded-xl overflow-hidden bg-stone-200 border border-stone-200 shadow-inner">
              <img
                src={selectedProduct.images[activeImageIndex] || selectedProduct.images[0]}
                alt={selectedProduct.name}
                className="w-full h-full object-cover"
              />

              {/* Badges */}
              <div className="absolute top-3 left-3 flex flex-col gap-1">
                {selectedProduct.isBestSeller && (
                  <span className="px-2.5 py-0.5 bg-amber-950 text-amber-200 text-[10px] font-mono uppercase tracking-wider rounded-sm shadow-sm">
                    Iconic Heirloom
                  </span>
                )}
              </div>

              {/* Wishlist floating toggle */}
              <button
                onClick={() => toggleWishlist(selectedProduct.id)}
                className={`absolute bottom-3 right-3 p-2.5 rounded-full shadow-md backdrop-blur-md transition ${
                  isFavorited ? 'bg-rose-50 text-rose-600' : 'bg-white text-stone-700 hover:text-rose-600'
                }`}
                title="Save to Wishlist"
              >
                <Heart className={`w-4 h-4 ${isFavorited ? 'fill-rose-600' : ''}`} />
              </button>
            </div>

            {/* Gallery Thumbnails */}
            {selectedProduct.images.length > 1 && (
              <div className="flex items-center gap-3 overflow-x-auto pb-1">
                {selectedProduct.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImageIndex(idx)}
                    className={`relative w-16 h-16 rounded-lg overflow-hidden border-2 transition shrink-0 ${
                      activeImageIndex === idx
                        ? 'border-amber-700 ring-2 ring-amber-200'
                        : 'border-stone-200 opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt="Thumbnail" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}

            {/* Assurance trust strip */}
            <div className="pt-2 grid grid-cols-2 gap-2 text-[11px] text-stone-500">
              <div className="flex items-center gap-1.5 bg-white p-2 rounded border border-stone-200/60">
                <ShieldCheck className="w-4 h-4 text-amber-700 shrink-0" />
                <span>Hallmarked & Certified</span>
              </div>
              <div className="flex items-center gap-1.5 bg-white p-2 rounded border border-stone-200/60">
                <Truck className="w-4 h-4 text-amber-700 shrink-0" />
                <span>Insured Signature Courier</span>
              </div>
            </div>

          </div>

          {/* Right Column: Information & Actions */}
          <div className="p-6 sm:p-8 flex flex-col justify-between space-y-6 max-h-[85vh] overflow-y-auto">
            
            <div className="space-y-4">
              
              {/* SKU & Category */}
              <div className="flex items-center justify-between text-xs text-stone-400 font-mono">
                <span>SKU: {selectedProduct.sku}</span>
                <span className="uppercase text-amber-800 font-semibold">{selectedProduct.category}</span>
              </div>

              {/* Name */}
              <h1 className="text-2xl sm:text-3xl font-serif-luxury text-stone-900 font-medium leading-snug">
                {selectedProduct.name}
              </h1>

              {/* Price & Live Stock Urgency Banner */}
              <div className="flex items-center justify-between pt-1 pb-3 border-b border-stone-100">
                <div>
                  <span className="text-2xl font-serif-luxury font-bold text-stone-900">
                    {formatPrice(selectedProduct.price)}
                  </span>
                  {selectedProduct.originalPrice && selectedProduct.originalPrice > selectedProduct.price && (
                    <span className="text-sm text-stone-400 line-through ml-2">
                      {formatPrice(selectedProduct.originalPrice)}
                    </span>
                  )}
                </div>

                {/* Real-Time Stock Pill */}
                <div>
                  {isOutOfStock ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium">
                      <AlertCircle className="w-3.5 h-3.5" /> Out of stock
                    </span>
                  ) : isLowStock ? (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 border border-amber-300 text-amber-900 text-xs font-semibold animate-pulse">
                      <span className="w-2 h-2 rounded-full bg-amber-600" />
                      Only {selectedProduct.stock} left in atelier
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium">
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                      In stock ({selectedProduct.stock} available)
                    </span>
                  )}
                </div>
              </div>

              {/* Description */}
              <p className="text-sm text-stone-600 leading-relaxed">
                {selectedProduct.description}
              </p>

              {/* Ring Size Selector (If applicable) */}
              {selectedProduct.availableSizes && selectedProduct.availableSizes.length > 0 && (
                <div className="space-y-2 pt-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-stone-800">Select US Ring Size:</span>
                    <button
                      onClick={() => setIsRingSizerOpen(true)}
                      className="text-amber-800 hover:text-amber-950 underline flex items-center gap-1 font-medium"
                    >
                      <Compass className="w-3 h-3" /> Size Guide
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {selectedProduct.availableSizes.map((size) => (
                      <button
                        key={size}
                        onClick={() => setSelectedSize(size)}
                        className={`w-9 h-9 rounded-lg border text-xs font-mono font-medium transition ${
                          selectedSize === size
                            ? 'bg-stone-900 text-amber-200 border-stone-900 shadow-xs'
                            : 'border-stone-200 text-stone-700 hover:bg-stone-100'
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Custom Engraving Option */}
              {selectedProduct.allowCustomEngraving && (
                <div className="space-y-2 pt-2 p-3 bg-stone-50 border border-stone-200 rounded-xl">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-stone-800 flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5 text-amber-700" /> Complimentary Bespoke Engraving
                    </span>
                    <span className="text-stone-400 font-mono text-[10px]">{engravingText.length}/18 chars</span>
                  </div>
                  <input
                    type="text"
                    maxLength={18}
                    value={engravingText}
                    onChange={(e) => setEngravingText(e.target.value)}
                    placeholder="e.g. Forever & Always • 08.20.26"
                    className="w-full px-3 py-1.5 bg-white border border-stone-200 rounded-lg text-xs text-stone-800 placeholder-stone-400 focus:outline-none focus:border-amber-600 font-mono"
                  />
                  {engravingText && (
                    <p className="text-[11px] text-amber-900 italic font-serif">
                      Preview: "{engravingText}" hand-inscribed on inner shank
                    </p>
                  )}
                </div>
              )}

              {/* Information Tabs (Craft / Specs / Care) */}
              <div className="pt-2">
                <div className="flex border-b border-stone-200 text-xs">
                  <button
                    onClick={() => setActiveTab('craft')}
                    className={`pb-2 px-3 font-medium transition border-b-2 ${
                      activeTab === 'craft'
                        ? 'border-stone-900 text-stone-900 font-semibold'
                        : 'border-transparent text-stone-400 hover:text-stone-600'
                    }`}
                  >
                    Artisan Story
                  </button>
                  <button
                    onClick={() => setActiveTab('specs')}
                    className={`pb-2 px-3 font-medium transition border-b-2 ${
                      activeTab === 'specs'
                        ? 'border-stone-900 text-stone-900 font-semibold'
                        : 'border-transparent text-stone-400 hover:text-stone-600'
                    }`}
                  >
                    Material Specs
                  </button>
                  <button
                    onClick={() => setActiveTab('care')}
                    className={`pb-2 px-3 font-medium transition border-b-2 ${
                      activeTab === 'care'
                        ? 'border-stone-900 text-stone-900 font-semibold'
                        : 'border-transparent text-stone-400 hover:text-stone-600'
                    }`}
                  >
                    Care Instructions
                  </button>
                </div>

                <div className="py-3 text-xs text-stone-600 leading-relaxed">
                  {activeTab === 'craft' && (
                    <div className="space-y-2">
                      <p>{selectedProduct.artisanStory}</p>
                      <div className="flex items-center gap-2 text-stone-700 font-mono text-[11px] bg-amber-50/70 p-2 rounded border border-amber-200/50">
                        <Hammer className="w-3.5 h-3.5 text-amber-800" />
                        <span>Bench Time: {selectedProduct.handcraftHours} hours of master metalsmithing</span>
                      </div>
                    </div>
                  )}

                  {activeTab === 'specs' && (
                    <dl className="grid grid-cols-2 gap-x-4 gap-y-2">
                      <div>
                        <dt className="text-stone-400 text-[10px] uppercase font-mono">Precious Metal</dt>
                        <dd className="font-medium text-stone-800">{selectedProduct.metalName}</dd>
                      </div>
                      <div>
                        <dt className="text-stone-400 text-[10px] uppercase font-mono">Gemstone Spec</dt>
                        <dd className="font-medium text-stone-800">{selectedProduct.gemstoneName}</dd>
                      </div>
                      <div>
                        <dt className="text-stone-400 text-[10px] uppercase font-mono">Dimensions</dt>
                        <dd className="font-medium text-stone-800">{selectedProduct.dimensions}</dd>
                      </div>
                      <div>
                        <dt className="text-stone-400 text-[10px] uppercase font-mono">Total Weight</dt>
                        <dd className="font-medium text-stone-800">{selectedProduct.weightGrams} grams</dd>
                      </div>
                    </dl>
                  )}

                  {activeTab === 'care' && (
                    <p>{selectedProduct.careInstructions}</p>
                  )}
                </div>
              </div>

            </div>

            {/* Bottom Actions: Quantity + Add to Bag */}
            <div className="pt-4 border-t border-stone-200 space-y-3">
              <div className="flex items-center gap-3">
                {/* Quantity */}
                {!isOutOfStock && (
                  <div className="flex items-center border border-stone-300 rounded-lg overflow-hidden bg-white">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      disabled={quantity <= 1}
                      className="px-3 py-2 text-stone-600 hover:bg-stone-100 disabled:opacity-30 text-sm"
                    >
                      -
                    </button>
                    <span className="px-3 py-2 text-xs font-mono font-bold text-stone-800">{quantity}</span>
                    <button
                      onClick={() => setQuantity(Math.min(selectedProduct.stock, quantity + 1))}
                      disabled={quantity >= selectedProduct.stock}
                      className="px-3 py-2 text-stone-600 hover:bg-stone-100 disabled:opacity-30 text-sm"
                    >
                      +
                    </button>
                  </div>
                )}

                {/* Submit button */}
                <button
                  id="btn-modal-add-to-cart"
                  onClick={handleAddToCart}
                  disabled={isOutOfStock || isSubmitting}
                  className={`flex-1 py-3 px-6 rounded-full font-semibold text-xs tracking-wider uppercase transition flex items-center justify-center gap-2 shadow-md ${
                    isOutOfStock
                      ? 'bg-stone-300 text-stone-500 cursor-not-allowed'
                      : 'bg-stone-900 hover:bg-amber-600 text-amber-200 hover:text-stone-950 active:scale-[0.99]'
                  }`}
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>{isOutOfStock ? 'Sold Out' : 'Reserve & Add to Shopping Bag'}</span>
                </button>
              </div>

              <p className="text-[11px] text-center text-stone-400 font-light">
                ✨ Adding to bag automatically holds inventory for 15 minutes to guarantee your piece.
              </p>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
};
