import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { Product, CartItem, Order, JewelryCategory, MetalType, GemstoneType } from '../types';

export type CurrencyCode = 'USD' | 'EUR' | 'GBP' | 'CAD' | 'AUD';

export const CURRENCY_RATES: Record<CurrencyCode, { symbol: string; rate: number; label: string }> = {
  USD: { symbol: '$', rate: 1.0, label: 'USD ($)' },
  EUR: { symbol: '€', rate: 0.92, label: 'EUR (€)' },
  GBP: { symbol: '£', rate: 0.79, label: 'GBP (£)' },
  CAD: { symbol: 'CA$', rate: 1.36, label: 'CAD ($)' },
  AUD: { symbol: 'AU$', rate: 1.52, label: 'AUD ($)' },
};

interface ToastNotification {
  id: string;
  type: 'success' | 'info' | 'warning' | 'error';
  title: string;
  message: string;
}

interface ShopContextType {
  products: Product[];
  filteredProducts: Product[];
  isLoadingProducts: boolean;
  fetchProducts: () => Promise<void>;
  
  // Cart
  cart: CartItem[];
  cartCount: number;
  cartSubtotal: number;
  addToCart: (product: Product, quantity?: number, selectedSize?: string, customEngraving?: string) => Promise<boolean>;
  removeFromCart: (productId: string, selectedSize?: string) => void;
  updateCartQuantity: (productId: string, quantity: number, selectedSize?: string) => Promise<boolean>;
  clearCart: () => void;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  
  // Reservation
  reservationExpiresAt: number | null;
  reservationTimeLeft: string | null;
  refreshReservation: () => Promise<void>;
  
  // Wishlist
  wishlist: string[];
  toggleWishlist: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;
  
  // Currency
  currency: CurrencyCode;
  setCurrency: (code: CurrencyCode) => void;
  formatPrice: (amountInUSD: number) => string;
  
  // Modals & Active View
  selectedProduct: Product | null;
  setSelectedProduct: (product: Product | null) => void;
  isCheckoutOpen: boolean;
  setIsCheckoutOpen: (open: boolean) => void;
  isInventoryManagerOpen: boolean;
  setIsInventoryManagerOpen: (open: boolean) => void;
  isStylistOpen: boolean;
  setIsStylistOpen: (open: boolean) => void;
  isRingSizerOpen: boolean;
  setIsRingSizerOpen: (open: boolean) => void;
  
  // Filters
  selectedCategory: JewelryCategory;
  setSelectedCategory: (cat: JewelryCategory) => void;
  selectedMetal: MetalType | 'all';
  setSelectedMetal: (metal: MetalType | 'all') => void;
  selectedGemstone: GemstoneType | 'all';
  setSelectedGemstone: (gem: GemstoneType | 'all') => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  onlyInStock: boolean;
  setOnlyInStock: (val: boolean) => void;
  sortBy: 'featured' | 'price-asc' | 'price-desc' | 'stock-urgency' | 'rating';
  setSortBy: (val: 'featured' | 'price-asc' | 'price-desc' | 'stock-urgency' | 'rating') => void;
  priceRange: [number, number];
  setPriceRange: (range: [number, number]) => void;
  
  // Discount & Gift
  appliedCoupon: { code: string; discountAmount: number; description: string; freeShipping: boolean } | null;
  applyCoupon: (code: string) => Promise<{ success: boolean; message: string }>;
  removeCoupon: () => void;
  giftWrap: boolean;
  setGiftWrap: (wrap: boolean) => void;
  giftMessage: string;
  setGiftMessage: (msg: string) => void;
  
  // Order completed
  lastCompletedOrder: Order | null;
  setLastCompletedOrder: (order: Order | null) => void;
  
  // Toasts
  toasts: ToastNotification[];
  addToast: (type: ToastNotification['type'], title: string, message: string) => void;
  removeToast: (id: string) => void;
  
  // Admin stock actions
  updateStockRealtime: (productId: string, changeOrNew: { change?: number; newStock?: number; reason?: string; note?: string }) => Promise<void>;
  sessionId: string;
}

const ShopContext = createContext<ShopContextType | undefined>(undefined);

export const ShopProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [sessionId] = useState<string>(() => {
    const saved = sessionStorage.getItem('aura_session_id');
    if (saved) return saved;
    const newId = `sess_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    sessionStorage.setItem('aura_session_id', newId);
    return newId;
  });

  const [products, setProducts] = useState<Product[]>([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState<boolean>(true);
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('aura_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [wishlist, setWishlist] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('aura_wishlist');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [currency, setCurrency] = useState<CurrencyCode>('USD');
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isInventoryManagerOpen, setIsInventoryManagerOpen] = useState(false);
  const [isStylistOpen, setIsStylistOpen] = useState(false);
  const [isRingSizerOpen, setIsRingSizerOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // Reservation timer
  const [reservationExpiresAt, setReservationExpiresAt] = useState<number | null>(null);
  const [reservationTimeLeft, setReservationTimeLeft] = useState<string | null>(null);

  // Filters
  const [selectedCategory, setSelectedCategory] = useState<JewelryCategory>('all');
  const [selectedMetal, setSelectedMetal] = useState<MetalType | 'all'>('all');
  const [selectedGemstone, setSelectedGemstone] = useState<GemstoneType | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [onlyInStock, setOnlyInStock] = useState(false);
  const [sortBy, setSortBy] = useState<'featured' | 'price-asc' | 'price-desc' | 'stock-urgency' | 'rating'>('featured');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1500]);

  // Coupons & Gifts
  const [appliedCoupon, setAppliedCoupon] = useState<{
    code: string;
    discountAmount: number;
    description: string;
    freeShipping: boolean;
  } | null>(null);
  const [giftWrap, setGiftWrap] = useState(false);
  const [giftMessage, setGiftMessage] = useState('');

  // Order
  const [lastCompletedOrder, setLastCompletedOrder] = useState<Order | null>(null);

  // Notifications
  const [toasts, setToasts] = useState<ToastNotification[]>([]);

  const addToast = useCallback((type: ToastNotification['type'], title: string, message: string) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`;
    setToasts((prev) => [...prev, { id, type, title, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Fetch products from API
  const fetchProducts = useCallback(async () => {
    try {
      const res = await fetch(`/api/products?sessionId=${sessionId}`);
      if (res.ok) {
        const data = await res.json();
        setProducts(data.products || []);
      }
    } catch (err) {
      console.error('Failed to load products from server:', err);
    } finally {
      setIsLoadingProducts(false);
    }
  }, [sessionId]);

  useEffect(() => {
    fetchProducts();
    // Poll inventory every 10 seconds for real-time stock sync across customers
    const interval = setInterval(fetchProducts, 10000);
    return () => clearInterval(interval);
  }, [fetchProducts]);

  // Sync Cart to LocalStorage
  useEffect(() => {
    localStorage.setItem('aura_cart', JSON.stringify(cart));
  }, [cart]);

  // Sync Wishlist to LocalStorage
  useEffect(() => {
    localStorage.setItem('aura_wishlist', JSON.stringify(wishlist));
  }, [wishlist]);

  // Real-time reservation request to server whenever cart changes
  const syncReservationToServer = useCallback(async (currentCart: CartItem[]) => {
    if (currentCart.length === 0) {
      setReservationExpiresAt(null);
      setReservationTimeLeft(null);
      try {
        await fetch('/api/inventory/release', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sessionId }),
        });
      } catch (err) {
        console.error('Failed to release reservation:', err);
      }
      return;
    }

    try {
      const payload = {
        sessionId,
        items: currentCart.map((item) => ({
          productId: item.product.id,
          quantity: item.quantity,
        })),
      };
      const res = await fetch('/api/inventory/reserve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        const data = await res.json();
        setReservationExpiresAt(data.expiresAt);
      }
    } catch (err) {
      console.error('Failed to update reservation:', err);
    }
  }, [sessionId]);

  // Reservation countdown ticker
  useEffect(() => {
    if (!reservationExpiresAt) {
      setReservationTimeLeft(null);
      return;
    }

    const updateTimer = () => {
      const now = Date.now();
      const diff = reservationExpiresAt - now;
      if (diff <= 0) {
        setReservationTimeLeft('Expired');
        addToast('warning', 'Cart Reservation Expired', 'Items have been returned to open inventory.');
        setReservationExpiresAt(null);
      } else {
        const minutes = Math.floor(diff / 60000);
        const seconds = Math.floor((diff % 60000) / 1000);
        setReservationTimeLeft(`${minutes}:${seconds < 10 ? '0' : ''}${seconds}`);
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [reservationExpiresAt, addToast]);

  const refreshReservation = async () => {
    await syncReservationToServer(cart);
  };

  // Add to cart with real-time stock validation
  const addToCart = async (
    product: Product,
    quantity = 1,
    selectedSize?: string,
    customEngraving?: string
  ): Promise<boolean> => {
    const latest = products.find((p) => p.id === product.id) || product;
    if (latest.stock <= 0) {
      addToast('error', 'Item Out of Stock', `"${latest.name}" is currently awaiting atelier restock.`);
      return false;
    }

    const existingIndex = cart.findIndex(
      (item) => item.product.id === product.id && item.selectedSize === selectedSize
    );

    const currentQtyInCart = existingIndex > -1 ? cart[existingIndex].quantity : 0;
    const requestedQty = currentQtyInCart + quantity;

    if (requestedQty > latest.stock) {
      addToast(
        'warning',
        'Stock Limit Reached',
        `Only ${latest.stock} handcrafted pieces of "${latest.name}" available.`
      );
      return false;
    }

    let updatedCart: CartItem[];
    if (existingIndex > -1) {
      updatedCart = cart.map((item, idx) =>
        idx === existingIndex ? { ...item, quantity: requestedQty, customEngraving } : item
      );
    } else {
      updatedCart = [
        ...cart,
        {
          product: latest,
          quantity,
          selectedSize: selectedSize || (latest.availableSizes ? latest.availableSizes[0] : undefined),
          customEngraving,
          reservedUntil: Date.now() + 15 * 60 * 1000,
        },
      ];
    }

    setCart(updatedCart);
    await syncReservationToServer(updatedCart);
    addToast('success', 'Added to Shopping Bag', `"${latest.name}" held in your reserved cart for 15 minutes.`);
    return true;
  };

  const removeFromCart = (productId: string, selectedSize?: string) => {
    const updated = cart.filter(
      (item) => !(item.product.id === productId && item.selectedSize === selectedSize)
    );
    setCart(updated);
    syncReservationToServer(updated);
  };

  const updateCartQuantity = async (
    productId: string,
    quantity: number,
    selectedSize?: string
  ): Promise<boolean> => {
    if (quantity <= 0) {
      removeFromCart(productId, selectedSize);
      return true;
    }

    const product = products.find((p) => p.id === productId);
    if (product && quantity > product.stock) {
      addToast('warning', 'Stock Limit', `Only ${product.stock} pieces available in inventory.`);
      return false;
    }

    const updated = cart.map((item) => {
      if (item.product.id === productId && item.selectedSize === selectedSize) {
        return { ...item, quantity };
      }
      return item;
    });

    setCart(updated);
    await syncReservationToServer(updated);
    return true;
  };

  const clearCart = () => {
    setCart([]);
    syncReservationToServer([]);
    setAppliedCoupon(null);
  };

  // Wishlist toggle
  const toggleWishlist = (productId: string) => {
    setWishlist((prev) => {
      const exists = prev.includes(productId);
      if (exists) {
        addToast('info', 'Removed from Wishlist', 'Item removed from your personal keepsake list.');
        return prev.filter((id) => id !== productId);
      } else {
        addToast('success', 'Saved to Wishlist', 'Handcrafted piece added to your favorites.');
        return [...prev, productId];
      }
    });
  };

  const isInWishlist = (productId: string) => wishlist.includes(productId);

  // Price Formatter
  const formatPrice = (amountInUSD: number) => {
    const info = CURRENCY_RATES[currency];
    const converted = amountInUSD * info.rate;
    return `${info.symbol}${converted.toLocaleString('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    })}`;
  };

  // Coupon Application
  const cartSubtotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

  const applyCoupon = async (code: string) => {
    try {
      const res = await fetch('/api/checkout/validate-coupon', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, orderSubtotal: cartSubtotal }),
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, message: data.error || 'Invalid code' };
      }
      setAppliedCoupon(data.coupon);
      addToast('success', 'Promo Code Applied', `Discount code "${data.coupon.code}" activated.`);
      return { success: true, message: 'Coupon applied successfully' };
    } catch {
      return { success: false, message: 'Failed to validate promo code' };
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
  };

  // Real-time stock update by Admin
  const updateStockRealtime = async (
    productId: string,
    changeOrNew: { change?: number; newStock?: number; reason?: string; note?: string }
  ) => {
    try {
      const res = await fetch(`/api/products/${productId}/stock`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(changeOrNew),
      });
      if (res.ok) {
        const data = await res.json();
        setProducts((prev) => prev.map((p) => (p.id === productId ? data.product : p)));
        addToast('success', 'Live Stock Updated', `Inventory for "${data.product.name}" is now ${data.product.stock} units.`);
      }
    } catch (err) {
      console.error('Failed to update stock:', err);
      addToast('error', 'Update Failed', 'Could not sync inventory change with server.');
    }
  };

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  // Compute filtered & sorted products
  const filteredProducts = useMemo(() => {
    return products
      .filter((p) => {
        // Category filter
        if (selectedCategory !== 'all' && p.category !== selectedCategory) {
          return false;
        }
        // Metal filter
        if (selectedMetal !== 'all' && p.metal !== selectedMetal) {
          return false;
        }
        // Gemstone filter
        if (selectedGemstone !== 'all' && p.gemstone !== selectedGemstone) {
          return false;
        }
        // Stock filter
        if (onlyInStock && p.stock <= 0) {
          return false;
        }
        // Price filter
        if (p.price < priceRange[0] || p.price > priceRange[1]) {
          return false;
        }
        // Search query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase().trim();
          const matchName = p.name.toLowerCase().includes(q);
          const matchDesc = p.description.toLowerCase().includes(q);
          const matchMetal = p.metalName.toLowerCase().includes(q);
          const matchGem = p.gemstoneName.toLowerCase().includes(q);
          const matchSku = p.sku.toLowerCase().includes(q);
          if (!matchName && !matchDesc && !matchMetal && !matchGem && !matchSku) {
            return false;
          }
        }
        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'price-asc') {
          return a.price - b.price;
        }
        if (sortBy === 'price-desc') {
          return b.price - a.price;
        }
        if (sortBy === 'stock-urgency') {
          return a.stock - b.stock;
        }
        if (sortBy === 'rating') {
          return (b.rating || 0) - (a.rating || 0);
        }
        // 'featured'
        if (a.isBestSeller && !b.isBestSeller) return -1;
        if (!a.isBestSeller && b.isBestSeller) return 1;
        return 0;
      });
  }, [products, selectedCategory, selectedMetal, selectedGemstone, onlyInStock, priceRange, searchQuery, sortBy]);

  return (
    <ShopContext.Provider
      value={{
        products,
        filteredProducts,
        isLoadingProducts,
        fetchProducts,
        cart,
        cartCount,
        cartSubtotal,
        addToCart,
        removeFromCart,
        updateCartQuantity,
        clearCart,
        isCartOpen,
        setIsCartOpen,
        reservationExpiresAt,
        reservationTimeLeft,
        refreshReservation,
        wishlist,
        toggleWishlist,
        isInWishlist,
        currency,
        setCurrency,
        formatPrice,
        selectedProduct,
        setSelectedProduct,
        isCheckoutOpen,
        setIsCheckoutOpen,
        isInventoryManagerOpen,
        setIsInventoryManagerOpen,
        isStylistOpen,
        setIsStylistOpen,
        isRingSizerOpen,
        setIsRingSizerOpen,
        selectedCategory,
        setSelectedCategory,
        selectedMetal,
        setSelectedMetal,
        selectedGemstone,
        setSelectedGemstone,
        searchQuery,
        setSearchQuery,
        onlyInStock,
        setOnlyInStock,
        sortBy,
        setSortBy,
        priceRange,
        setPriceRange,
        appliedCoupon,
        applyCoupon,
        removeCoupon,
        giftWrap,
        setGiftWrap,
        giftMessage,
        setGiftMessage,
        lastCompletedOrder,
        setLastCompletedOrder,
        toasts,
        addToast,
        removeToast,
        updateStockRealtime,
        sessionId,
      }}
    >
      {children}
    </ShopContext.Provider>
  );
};

export const useShop = () => {
  const context = useContext(ShopContext);
  if (!context) throw new Error('useShop must be used within a ShopProvider');
  return context;
};
