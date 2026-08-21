import React, { useState } from 'react';
import { Product } from '../types';
import { useShop } from '../context/ShopContext';
import { Heart, Eye, ShoppingBag, Sparkles, ShieldCheck, Hammer, Check } from 'lucide-react';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const {
    formatPrice,
    addToCart,
    toggleWishlist,
    isInWishlist,
    setSelectedProduct,
    addToast,
  } = useShop();

  const [isHovered, setIsHovered] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const isFavorited = isInWishlist(product.id);

  const handleQuickAdd = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (product.stock <= 0) return;
    setIsAdding(true);
    await addToCart(product, 1);
    setIsAdding(false);
  };

  const handleRestockNotify = (e: React.MouseEvent) => {
    e.stopPropagation();
    addToast('info', 'Restock Alert Requested', `We will notify you the moment our goldsmith finishes the next batch of "${product.name}".`);
  };

  // Stock status determination
  const isOutOfStock = product.stock <= 0;
  const isLowStock = product.stock > 0 && product.stock <= product.lowStockThreshold;

  return (
    <div
      id={`product-card-${product.id}`}
      onClick={() => setSelectedProduct(product)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="group relative bg-white border border-stone-200 rounded-xl overflow-hidden shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col cursor-pointer"
    >
      {/* Product Image Stage */}
      <div className="relative aspect-square w-full overflow-hidden bg-stone-100">
        <img
          src={isHovered && product.images[1] ? product.images[1] : product.images[0]}
          alt={product.name}
          className="w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-105"
          loading="lazy"
        />

        {/* Top Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
          {product.isBestSeller && (
            <span className="px-2 py-0.5 bg-amber-900/90 text-amber-200 text-[10px] font-medium tracking-wider uppercase rounded-sm backdrop-blur-xs border border-amber-700/50">
              Atelier Icon
            </span>
          )}
          {product.isNewArrival && (
            <span className="px-2 py-0.5 bg-stone-900/90 text-stone-200 text-[10px] font-medium tracking-wider uppercase rounded-sm backdrop-blur-xs">
              New Forged
            </span>
          )}
        </div>

        {/* Wishlist Button */}
        <button
          id={`btn-wishlist-${product.id}`}
          onClick={(e) => {
            e.stopPropagation();
            toggleWishlist(product.id);
          }}
          className={`absolute top-3 right-3 p-2 rounded-full backdrop-blur-md transition shadow-sm z-10 ${
            isFavorited
              ? 'bg-rose-50 text-rose-600 border border-rose-200'
              : 'bg-white/80 text-stone-600 hover:text-rose-600 hover:bg-white border border-stone-200/60'
          }`}
          aria-label="Toggle Wishlist"
        >
          <Heart className={`w-4 h-4 ${isFavorited ? 'fill-rose-600' : ''}`} />
        </button>

        {/* Quick View Button on Hover */}
        <button
          id={`btn-quick-view-${product.id}`}
          onClick={(e) => {
            e.stopPropagation();
            setSelectedProduct(product);
          }}
          className="absolute bottom-3 left-1/2 -translate-x-1/2 px-4 py-2 bg-stone-950/85 hover:bg-stone-950 text-stone-100 text-xs font-medium rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center gap-1.5 shadow-lg backdrop-blur-xs whitespace-nowrap z-10"
        >
          <Eye className="w-3.5 h-3.5" />
          <span>Inspect Craft Details</span>
        </button>

        {/* Out of Stock Overlay */}
        {isOutOfStock && (
          <div className="absolute inset-0 bg-stone-900/70 backdrop-blur-[2px] flex flex-col items-center justify-center p-4 text-center z-20">
            <span className="text-amber-200 text-xs uppercase font-mono tracking-widest font-bold">
              Sold Out Batch
            </span>
            <p className="text-[11px] text-stone-300 mt-1 max-w-[180px]">
              Our metalsmith is currently crafting new pieces.
            </p>
            <button
              onClick={handleRestockNotify}
              className="mt-3 px-3 py-1.5 bg-amber-600/90 hover:bg-amber-500 text-stone-950 text-[11px] font-semibold rounded-full transition"
            >
              Notify on Restock
            </button>
          </div>
        )}
      </div>

      {/* Product Content Details */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-3 bg-white">
        
        <div className="space-y-1.5">
          {/* Metal & Craft hours */}
          <div className="flex items-center justify-between text-[11px] text-stone-500">
            <span className="truncate font-medium text-stone-600">{product.metalName.split(' ')[0]} {product.metalName.split(' ')[1] || ''}</span>
            <span className="flex items-center gap-1 font-mono text-[10px] text-amber-900 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200/60">
              <Hammer className="w-2.5 h-2.5" />
              {product.handcraftHours}h bench
            </span>
          </div>

          {/* Product Name */}
          <h2 className="text-base font-serif-luxury font-medium text-stone-900 group-hover:text-amber-900 transition line-clamp-1 leading-snug">
            {product.name}
          </h2>

          {/* Gemstone / Stone Spec */}
          <p className="text-xs text-stone-500 line-clamp-1 font-light">
            {product.gemstoneName}
          </p>
        </div>

        {/* Real-Time Stock Status Badge */}
        <div className="pt-1">
          {isOutOfStock ? (
            <div className="flex items-center gap-1.5 text-[11px] text-stone-500">
              <span className="w-1.5 h-1.5 rounded-full bg-stone-400" />
              <span>0 pieces currently available</span>
            </div>
          ) : isLowStock ? (
            <div className="flex items-center gap-1.5 text-[11px] text-amber-700 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
              <span>Only {product.stock} left in atelier stock</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 text-[11px] text-emerald-700">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span>In stock ({product.stock} available)</span>
            </div>
          )}
        </div>

        {/* Pricing & Add to Cart */}
        <div className="pt-2 border-t border-stone-100 flex items-center justify-between">
          <div>
            <span className="text-lg font-serif-luxury font-bold text-stone-900">
              {formatPrice(product.price)}
            </span>
            {product.originalPrice && product.originalPrice > product.price && (
              <span className="text-xs text-stone-400 line-through ml-2">
                {formatPrice(product.originalPrice)}
              </span>
            )}
          </div>

          {!isOutOfStock && (
            <button
              id={`btn-quick-add-${product.id}`}
              onClick={handleQuickAdd}
              disabled={isAdding}
              className="px-3.5 py-1.5 bg-stone-900 hover:bg-amber-600 text-stone-100 text-xs font-medium rounded-full transition flex items-center gap-1.5 active:scale-95"
              title="Add to Shopping Bag with 15-min stock lock"
            >
              {isAdding ? (
                <Check className="w-3.5 h-3.5 text-amber-300" />
              ) : (
                <ShoppingBag className="w-3.5 h-3.5 text-amber-400" />
              )}
              <span>{isAdding ? 'Reserved' : 'Add'}</span>
            </button>
          )}
        </div>

      </div>
    </div>
  );
};
