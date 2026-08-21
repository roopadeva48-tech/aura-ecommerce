export type JewelryCategory = 'all' | 'rings' | 'necklaces' | 'earrings' | 'bracelets' | 'bridal';

export type MetalType = '18k-yellow-gold' | '14k-rose-gold' | '925-sterling-silver' | 'platinum' | 'vermeil';

export type GemstoneType = 'diamond' | 'emerald' | 'sapphire' | 'freshwater-pearl' | 'ruby' | 'opal' | 'moissanite' | 'amethyst' | 'none';

export interface Product {
  id: string;
  sku: string;
  name: string;
  category: JewelryCategory;
  price: number;
  originalPrice?: number;
  stock: number;
  lowStockThreshold: number;
  metal: MetalType;
  metalName: string;
  gemstone: GemstoneType;
  gemstoneName: string;
  description: string;
  artisanStory: string;
  handcraftHours: number;
  dimensions: string;
  weightGrams: number;
  images: string[];
  rating: number;
  reviewCount: number;
  isBestSeller?: boolean;
  isNewArrival?: boolean;
  allowCustomEngraving?: boolean;
  availableSizes?: string[]; // For rings e.g. ["5", "6", "7", "8", "9"]
  careInstructions: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
  selectedSize?: string;
  customEngraving?: string;
  giftWrap?: boolean;
  giftMessage?: string;
  reservedUntil: number; // timestamp
}

export interface Coupon {
  code: string;
  discountPercent?: number;
  discountAmount?: number;
  minOrderAmount?: number;
  freeShipping?: boolean;
  description: string;
}

export interface ShippingAddress {
  fullName: string;
  email: string;
  phone: string;
  street: string;
  apartment?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

export type ShippingMethod = {
  id: string;
  name: string;
  estimatedDays: string;
  price: number;
  description: string;
};

export type PaymentMethodType = 'card' | 'apple_pay' | 'google_pay' | 'paypal' | 'bank_transfer';

export interface PaymentDetails {
  method: PaymentMethodType;
  cardNumber?: string;
  cardHolder?: string;
  expiryMonth?: string;
  expiryYear?: string;
  cvv?: string;
  saveCard?: boolean;
  billingAddressSameAsShipping: boolean;
}

export type OrderStatus = 'payment_confirmed' | 'artisan_crafting' | 'hallmarking' | 'packaged' | 'shipped' | 'delivered';

export interface Order {
  id: string;
  orderNumber: string;
  createdAt: string;
  items: {
    productId: string;
    productName: string;
    sku: string;
    image: string;
    price: number;
    quantity: number;
    selectedSize?: string;
    customEngraving?: string;
    metalName: string;
    gemstoneName: string;
  }[];
  subtotal: number;
  discount: number;
  couponCode?: string;
  shippingFee: number;
  tax: number;
  total: number;
  shippingAddress: ShippingAddress;
  shippingMethod: ShippingMethod;
  paymentMethod: PaymentMethodType;
  paymentTransactionId: string;
  status: OrderStatus;
  trackingNumber?: string;
  giftWrap: boolean;
  giftMessage?: string;
}

export interface InventoryLog {
  id: string;
  productId: string;
  productName: string;
  sku: string;
  previousStock: number;
  newStock: number;
  change: number;
  reason: 'sale' | 'restock' | 'manual_adjustment' | 'cancellation_return';
  timestamp: string;
  note?: string;
}

export interface InventoryStats {
  totalSkus: number;
  totalStockUnits: number;
  lowStockItemsCount: number;
  outOfStockItemsCount: number;
  totalInventoryValuation: number;
  totalRevenue: number;
  totalOrdersCount: number;
}
