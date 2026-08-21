import React, { useState } from 'react';
import { useShop } from '../context/ShopContext';
import {
  X,
  ShoppingBag,
  Trash2,
  Clock,
  Gift,
  Tag,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  AlertCircle
} from 'lucide-react';

export const CartDrawer: React.FC = () => {
  const {
    isCartOpen,
    setIsCartOpen,
    cart,
    cartSubtotal,
    removeFromCart,
    updateCartQuantity,
    formatPrice,
    reservationTimeLeft,
    appliedCoupon,
    applyCoupon,
    removeCoupon,
    giftWrap,
    setGiftWrap,
    giftMessage,
    setGiftMessage,
    setIsCheckoutOpen,
  } = useShop();

  const [couponInput, setCouponInput] = useState('');
  const [couponError, setCouponError] = useState('');
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);
  const [showGiftMessageInput, setShowGiftMessageInput] = useState(giftWrap);

  if (!isCartOpen) return null;

  // Free shipping threshold math ($150)
  const FREE_SHIPPING_THRESHOLD = 150;
  const progressPercent = Math.min(100, (cartSubtotal / FREE_SHIPPING_THRESHOLD) * 100);
  const amountToFreeShipping = Math.max(0, FREE_SHIPPING_THRESHOLD - cartSubtotal);

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponInput.trim()) return;
    setIsApplyingCoupon(true);
    setCouponError('');
    const result = await applyCoupon(couponInput.trim());
    setIsApplyingCoupon(false);
    if (!result.success) {
      setCouponError(result.message);
    } else {
      setCouponInput('');
    }
  };

  const discountAmount = appliedCoupon ? appliedCoupon.discountAmount : 0;
  const giftFee = giftWrap ? 15 : 0;
  const estimatedTax = Number(((cartSubtotal - discountAmount) * 0.0725).toFixed(2));
  const estimatedTotal = Math.max(0, cartSubtotal - discountAmount + giftFee + estimatedTax);

  const handleProceedToCheckout = () => {
    setIsCartOpen(false);
    setIsCheckoutOpen(true);
  };

  return (
    <div
      id="cart-drawer-backdrop"
      className="fixed inset-0 z-50 bg-stone-950/70 backdrop-blur-xs flex justify-end animate-fadeIn"
      onClick={() => setIsCartOpen(false)}
    >
      <div
        id="cart-drawer-panel"
        className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col justify-between overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drawer Header */}
        <div className="p-5 border-b border-stone-200 bg-stone-900 text-stone-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-amber-400" />
            <h2 className="text-lg font-serif-luxury font-medium tracking-wide">
              Reserved Shopping Bag
            </h2>
            <span className="text-xs bg-amber-900/60 text-amber-300 px-2 py-0.5 rounded-full font-mono">
              {cart.reduce((sum, i) => sum + i.quantity, 0)}
            </span>
          </div>

          <button
            id="btn-close-cart-drawer"
            onClick={() => setIsCartOpen(false)}
            className="p-1.5 text-stone-400 hover:text-white rounded-full hover:bg-stone-800 transition"
            aria-label="Close Shopping Bag"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Real-time Inventory Reservation Countdown Warning */}
        {cart.length > 0 && reservationTimeLeft && (
          <div className="bg-amber-50 border-b border-amber-200 px-4 py-2.5 flex items-center justify-between text-xs text-amber-900">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-700 animate-pulse" />
              <span>
                Pieces reserved for <strong className="font-mono text-amber-950 font-bold">{reservationTimeLeft}</strong>
              </span>
            </div>
            <span className="text-[10px] text-amber-700 font-medium">Guaranteed Batch Hold</span>
          </div>
        )}

        {/* Free shipping progress bar */}
        {cart.length > 0 && (
          <div className="bg-stone-50 border-b border-stone-200 px-4 py-2 text-xs">
            <div className="flex justify-between items-center text-stone-600 mb-1">
              <span>
                {amountToFreeShipping === 0 ? (
                  <strong className="text-emerald-700 flex items-center gap-1 font-semibold">
                    <Sparkles className="w-3.5 h-3.5 text-amber-600" /> Complimentary Insured Courier unlocked!
                  </strong>
                ) : (
                  <>Add <strong>{formatPrice(amountToFreeShipping)}</strong> for Complimentary Delivery</>
                )}
              </span>
              <span className="font-mono text-[11px] font-bold">{Math.round(progressPercent)}%</span>
            </div>
            <div className="w-full bg-stone-200 h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-amber-600 h-full rounded-full transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        )}

        {/* Cart Item List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-3">
              <div className="w-16 h-16 rounded-full bg-stone-100 flex items-center justify-center text-stone-400">
                <ShoppingBag className="w-8 h-8" />
              </div>
              <h3 className="text-base font-serif-luxury font-medium text-stone-800">
                Your shopping bag is empty
              </h3>
              <p className="text-xs text-stone-500 max-w-xs">
                Explore our fine handmade jewelry collection and reserve your unique piece.
              </p>
              <button
                onClick={() => setIsCartOpen(false)}
                className="mt-2 px-5 py-2 bg-stone-900 text-amber-200 text-xs font-semibold rounded-full hover:bg-stone-800 transition"
              >
                Browse Collections
              </button>
            </div>
          ) : (
            cart.map((item, idx) => (
              <div
                key={`${item.product.id}-${item.selectedSize || 'nosize'}-${idx}`}
                className="flex gap-3 p-3 bg-stone-50 border border-stone-200 rounded-xl relative group"
              >
                {/* Thumbnail */}
                <div className="w-20 h-20 bg-stone-200 rounded-lg overflow-hidden shrink-0 border border-stone-200">
                  <img
                    src={item.product.images[0]}
                    alt={item.product.name}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0 flex flex-col justify-between">
                  <div className="space-y-0.5">
                    <div className="flex justify-between items-start">
                      <h4 className="text-xs font-serif-luxury font-medium text-stone-900 truncate pr-2">
                        {item.product.name}
                      </h4>
                      <button
                        onClick={() => removeFromCart(item.product.id, item.selectedSize)}
                        className="text-stone-400 hover:text-rose-600 transition p-0.5"
                        title="Remove item"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <p className="text-[11px] text-stone-500">{item.product.metalName.split(' ')[0]} {item.product.metalName.split(' ')[1]}</p>

                    {item.selectedSize && (
                      <p className="text-[10px] text-stone-600 font-mono">
                        Ring Size: <strong>US {item.selectedSize}</strong>
                      </p>
                    )}

                    {item.customEngraving && (
                      <p className="text-[10px] text-amber-900 font-serif italic truncate">
                        Engraving: "{item.customEngraving}"
                      </p>
                    )}
                  </div>

                  {/* Pricing and Quantity */}
                  <div className="flex items-center justify-between pt-2">
                    <div className="flex items-center border border-stone-300 rounded bg-white">
                      <button
                        onClick={() => updateCartQuantity(item.product.id, item.quantity - 1, item.selectedSize)}
                        className="px-2 py-0.5 text-stone-600 hover:bg-stone-100 text-xs"
                      >
                        -
                      </button>
                      <span className="px-2 text-xs font-mono font-bold text-stone-800">{item.quantity}</span>
                      <button
                        onClick={() => updateCartQuantity(item.product.id, item.quantity + 1, item.selectedSize)}
                        disabled={item.quantity >= item.product.stock}
                        className="px-2 py-0.5 text-stone-600 hover:bg-stone-100 disabled:opacity-30 text-xs"
                      >
                        +
                      </button>
                    </div>

                    <span className="text-xs font-serif-luxury font-bold text-stone-900">
                      {formatPrice(item.product.price * item.quantity)}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Cart Drawer Footer / Checkout Summary */}
        {cart.length > 0 && (
          <div className="p-4 bg-stone-50 border-t border-stone-200 space-y-3">
            
            {/* Gift wrap add-on toggle */}
            <div className="p-2.5 bg-white border border-stone-200 rounded-lg space-y-2">
              <label className="flex items-center justify-between text-xs cursor-pointer select-none">
                <span className="flex items-center gap-1.5 text-stone-800 font-medium">
                  <Gift className="w-3.5 h-3.5 text-amber-700" />
                  <span>Artisan Gift Box & Handwritten Card</span>
                </span>
                <input
                  type="checkbox"
                  checked={giftWrap}
                  onChange={(e) => {
                    setGiftWrap(e.target.checked);
                    setShowGiftMessageInput(e.target.checked);
                  }}
                  className="rounded border-stone-300 text-amber-600 focus:ring-amber-500"
                />
              </label>

              {showGiftMessageInput && (
                <div className="pt-1.5 border-t border-stone-100 space-y-1">
                  <textarea
                    rows={2}
                    value={giftMessage}
                    onChange={(e) => setGiftMessage(e.target.value)}
                    placeholder="Enter your personal gift message to be calligraphed on parchment..."
                    className="w-full text-[11px] p-2 bg-stone-50 border border-stone-200 rounded text-stone-800 placeholder-stone-400 focus:outline-none focus:border-amber-600"
                  />
                </div>
              )}
            </div>

            {/* Coupon Code Input */}
            <div className="space-y-1">
              {appliedCoupon ? (
                <div className="flex items-center justify-between p-2 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-900">
                  <div className="flex items-center gap-1.5">
                    <Tag className="w-3.5 h-3.5 text-amber-700" />
                    <span>Promo <strong>{appliedCoupon.code}</strong> applied (-{formatPrice(appliedCoupon.discountAmount)})</span>
                  </div>
                  <button
                    onClick={removeCoupon}
                    className="text-stone-500 hover:text-stone-900 text-xs underline"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <form onSubmit={handleApplyCoupon} className="flex gap-2">
                  <input
                    type="text"
                    value={couponInput}
                    onChange={(e) => setCouponInput(e.target.value)}
                    placeholder="Promo code (e.g. ARTISAN10)"
                    className="flex-1 text-xs px-3 py-1.5 bg-white border border-stone-200 rounded-lg uppercase placeholder:normal-case placeholder-stone-400 focus:outline-none focus:border-amber-600"
                  />
                  <button
                    type="submit"
                    disabled={isApplyingCoupon || !couponInput.trim()}
                    className="px-3 py-1.5 bg-stone-900 text-stone-100 text-xs font-medium rounded-lg hover:bg-stone-800 disabled:opacity-40 transition"
                  >
                    Apply
                  </button>
                </form>
              )}
              {couponError && <p className="text-[10px] text-rose-600">{couponError}</p>}
            </div>

            {/* Price Calculations */}
            <div className="space-y-1 text-xs text-stone-600 pt-1">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>{formatPrice(cartSubtotal)}</span>
              </div>
              {appliedCoupon && (
                <div className="flex justify-between text-amber-800">
                  <span>Promo Discount ({appliedCoupon.code})</span>
                  <span>-{formatPrice(appliedCoupon.discountAmount)}</span>
                </div>
              )}
              {giftWrap && (
                <div className="flex justify-between">
                  <span>Artisan Gift Box Packaging</span>
                  <span>{formatPrice(15)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Estimated Insured Delivery</span>
                <span>{cartSubtotal >= FREE_SHIPPING_THRESHOLD ? 'Complimentary' : '$15.00'}</span>
              </div>
              <div className="flex justify-between">
                <span>Estimated Sales Tax (7.25%)</span>
                <span>{formatPrice(estimatedTax)}</span>
              </div>
              <div className="flex justify-between text-sm font-serif-luxury font-bold text-stone-950 pt-2 border-t border-stone-200">
                <span>Estimated Total</span>
                <span>{formatPrice(estimatedTotal)}</span>
              </div>
            </div>

            {/* Proceed to Checkout Button */}
            <button
              id="btn-proceed-to-checkout"
              onClick={handleProceedToCheckout}
              className="w-full py-3.5 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs uppercase tracking-wider rounded-full shadow-lg shadow-amber-950/20 transition flex items-center justify-center gap-2 active:scale-[0.99]"
            >
              <ShieldCheck className="w-4 h-4 text-stone-950" />
              <span>Proceed to Secure Checkout</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <div className="flex items-center justify-center gap-2 text-[10px] text-stone-400">
              <span>🔒 256-Bit SSL Encrypted</span>
              <span>•</span>
              <span>30-Day Atelier Guarantee</span>
            </div>

          </div>
        )}

      </div>
    </div>
  );
};
