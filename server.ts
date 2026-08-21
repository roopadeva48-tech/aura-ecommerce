import 'dotenv/config';
import express, { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';
import { INITIAL_PRODUCTS, INITIAL_COUPONS } from './src/data/initialProducts.js';
import { Product, Order, InventoryLog, Coupon } from './src/types.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json());

// Lazy-initialized Gemini AI client
let aiClient: GoogleGenAI | null = null;
function getGeminiAI(): GoogleGenAI | null {
  if (!aiClient && process.env.GEMINI_API_KEY) {
    try {
      aiClient = new GoogleGenAI({
        apiKey: process.env.GEMINI_API_KEY,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          },
        },
      });
    } catch (err) {
      console.warn('Failed to initialize GoogleGenAI client:', err);
    }
  }
  return aiClient;
}

// In-Memory Database for Real-Time Inventory & Orders
let productsDatabase: Product[] = JSON.parse(JSON.stringify(INITIAL_PRODUCTS));
let couponsDatabase: Coupon[] = JSON.parse(JSON.stringify(INITIAL_COUPONS));
let ordersDatabase: Order[] = [
  {
    id: 'ord-1001',
    orderNumber: 'AURA-2026-8942',
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    items: [
      {
        productId: 'aura-neck-02',
        productName: 'Verdant Meadow Emerald Pendant',
        sku: 'AUR-NC-002',
        image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=1000&q=80',
        price: 620,
        quantity: 1,
        metalName: '18K Fairmined Yellow Gold',
        gemstoneName: '0.85ct Natural Zambian Emerald'
      }
    ],
    subtotal: 620,
    discount: 62,
    couponCode: 'ARTISAN10',
    shippingFee: 0,
    tax: 44.64,
    total: 602.64,
    shippingAddress: {
      fullName: 'Genevieve Dupond',
      email: 'genevieve.dupond@example.com',
      phone: '+1 (555) 234-8901',
      street: '452 Rue de la Paix',
      city: 'Paris / New York',
      state: 'NY',
      postalCode: '10021',
      country: 'United States'
    },
    shippingMethod: {
      id: 'express',
      name: 'Express Insured Courier',
      estimatedDays: '1-2 business days',
      price: 0,
      description: 'Hand-packed in velvet keepsake box with tamper-evident seal'
    },
    paymentMethod: 'card',
    paymentTransactionId: 'TXN-AURA-8942-8812',
    status: 'hallmarking',
    trackingNumber: 'AURA-FEDEX-9988231',
    giftWrap: true,
    giftMessage: 'Happy 5th Anniversary, my love!'
  }
];

let inventoryLogs: InventoryLog[] = [
  {
    id: 'log-1',
    productId: 'aura-neck-02',
    productName: 'Verdant Meadow Emerald Pendant',
    sku: 'AUR-NC-002',
    previousStock: 3,
    newStock: 2,
    change: -1,
    reason: 'sale',
    timestamp: new Date(Date.now() - 86400000 * 2).toISOString(),
    note: 'Fulfilled for Order #AURA-2026-8942'
  }
];

// Active stock reservations: { [key: string]: { productId: string, quantity: number, expiresAt: number, sessionId: string } }
interface ActiveReservation {
  id: string;
  sessionId: string;
  items: { productId: string; quantity: number }[];
  expiresAt: number;
}
let activeReservations: ActiveReservation[] = [];

// Clean up expired stock reservations periodically (every 30s)
setInterval(() => {
  const now = Date.now();
  const expired = activeReservations.filter((r) => r.expiresAt <= now);
  if (expired.length > 0) {
    activeReservations = activeReservations.filter((r) => r.expiresAt > now);
  }
}, 30000);

// Compute available stock (actual stock minus active non-expired reservations for other sessions)
function getAvailableStock(productId: string, currentSessionId?: string): number {
  const product = productsDatabase.find((p) => p.id === productId);
  if (!product) return 0;
  const now = Date.now();
  const reservedByOthers = activeReservations
    .filter((r) => r.expiresAt > now && r.sessionId !== currentSessionId)
    .reduce((sum, res) => {
      const match = res.items.find((i) => i.productId === productId);
      return sum + (match ? match.quantity : 0);
    }, 0);

  return Math.max(0, product.stock - reservedByOthers);
}

// ----------------------------------------------------
// API ROUTES
// ----------------------------------------------------

// 1. Get all products with real-time stock
app.get('/api/products', (req: Request, res: Response) => {
  const sessionId = (req.query.sessionId as string) || '';
  const productsWithLiveStock = productsDatabase.map((p) => ({
    ...p,
    availableStock: getAvailableStock(p.id, sessionId),
    isLowStock: p.stock <= p.lowStockThreshold && p.stock > 0,
    isOutOfStock: p.stock <= 0,
  }));
  res.json({ products: productsWithLiveStock });
});

// 2. Get single product detail
app.get('/api/products/:id', (req: Request, res: Response) => {
  const product = productsDatabase.find((p) => p.id === req.params.id);
  if (!product) {
    return res.status(404).json({ error: 'Product not found' });
  }
  const sessionId = (req.query.sessionId as string) || '';
  res.json({
    product: {
      ...product,
      availableStock: getAvailableStock(product.id, sessionId),
      isLowStock: product.stock <= product.lowStockThreshold && product.stock > 0,
      isOutOfStock: product.stock <= 0,
    },
  });
});

// 3. Add new handmade jewelry product (Admin)
app.post('/api/products', (req: Request, res: Response) => {
  const newProduct: Product = req.body;
  if (!newProduct.name || !newProduct.price || newProduct.stock === undefined) {
    return res.status(400).json({ error: 'Missing required product attributes' });
  }

  const productToAdd: Product = {
    ...newProduct,
    id: newProduct.id || `aura-${Date.now()}`,
    sku: newProduct.sku || `AUR-${newProduct.category.toUpperCase().slice(0, 2)}-${Math.floor(100 + Math.random() * 900)}`,
    rating: newProduct.rating || 5.0,
    reviewCount: newProduct.reviewCount || 0,
    lowStockThreshold: newProduct.lowStockThreshold || 2,
    images: newProduct.images && newProduct.images.length > 0
      ? newProduct.images
      : ['https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=1000&q=80'],
  };

  productsDatabase.unshift(productToAdd);

  inventoryLogs.unshift({
    id: `log-${Date.now()}`,
    productId: productToAdd.id,
    productName: productToAdd.name,
    sku: productToAdd.sku,
    previousStock: 0,
    newStock: productToAdd.stock,
    change: productToAdd.stock,
    reason: 'restock',
    timestamp: new Date().toISOString(),
    note: 'Initial handcrafted collection inventory batch',
  });

  res.status(201).json({ success: true, product: productToAdd });
});

// 4. Update Product Stock (Instant Real-time Adjustment)
app.patch('/api/products/:id/stock', (req: Request, res: Response) => {
  const { id } = req.params;
  const { newStock, change, reason, note } = req.body;

  const product = productsDatabase.find((p) => p.id === id);
  if (!product) {
    return res.status(404).json({ error: 'Product not found' });
  }

  const prev = product.stock;
  let finalStock = prev;

  if (typeof newStock === 'number') {
    finalStock = Math.max(0, newStock);
  } else if (typeof change === 'number') {
    finalStock = Math.max(0, prev + change);
  }

  product.stock = finalStock;

  const log: InventoryLog = {
    id: `log-${Date.now()}`,
    productId: product.id,
    productName: product.name,
    sku: product.sku,
    previousStock: prev,
    newStock: finalStock,
    change: finalStock - prev,
    reason: reason || 'manual_adjustment',
    timestamp: new Date().toISOString(),
    note: note || `Admin live adjustment from ${prev} to ${finalStock}`,
  };

  inventoryLogs.unshift(log);

  res.json({
    success: true,
    product,
    log,
    isLowStock: product.stock <= product.lowStockThreshold && product.stock > 0,
    isOutOfStock: product.stock <= 0,
  });
});

// 5. Update Product details (Admin)
app.patch('/api/products/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const index = productsDatabase.findIndex((p) => p.id === id);
  if (index === -1) {
    return res.status(404).json({ error: 'Product not found' });
  }

  productsDatabase[index] = {
    ...productsDatabase[index],
    ...req.body,
  };

  res.json({ success: true, product: productsDatabase[index] });
});

// 6. Delete Product (Admin)
app.delete('/api/products/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const index = productsDatabase.findIndex((p) => p.id === id);
  if (index === -1) {
    return res.status(404).json({ error: 'Product not found' });
  }
  const deleted = productsDatabase.splice(index, 1)[0];
  res.json({ success: true, deletedProduct: deleted });
});

// 7. Temporary Stock Reservation (Locks stock for 15 mins during checkout process)
app.post('/api/inventory/reserve', (req: Request, res: Response) => {
  const { sessionId, items } = req.body as {
    sessionId: string;
    items: { productId: string; quantity: number }[];
  };

  if (!sessionId || !items || !Array.isArray(items)) {
    return res.status(400).json({ error: 'Invalid reservation request' });
  }

  // Verify stock availability
  for (const item of items) {
    const product = productsDatabase.find((p) => p.id === item.productId);
    if (!product) {
      return res.status(400).json({ error: `Product ${item.productId} not found` });
    }
    const available = getAvailableStock(item.productId, sessionId);
    if (available < item.quantity) {
      return res.status(409).json({
        error: `Insufficient stock for ${product.name}. Only ${available} handcrafted pieces available.`,
        availableStock: available,
        productName: product.name,
      });
    }
  }

  // Remove existing reservation for this session
  activeReservations = activeReservations.filter((r) => r.sessionId !== sessionId);

  // Set 15-minute reservation
  const expiresAt = Date.now() + 15 * 60 * 1000;
  activeReservations.push({
    id: `res-${Date.now()}`,
    sessionId,
    items,
    expiresAt,
  });

  res.json({
    success: true,
    expiresAt,
    minutesRemaining: 15,
  });
});

// 8. Release Stock Reservation
app.post('/api/inventory/release', (req: Request, res: Response) => {
  const { sessionId } = req.body;
  if (sessionId) {
    activeReservations = activeReservations.filter((r) => r.sessionId !== sessionId);
  }
  res.json({ success: true });
});

// 9. Validate Promo Coupon
app.post('/api/checkout/validate-coupon', (req: Request, res: Response) => {
  const { code, orderSubtotal } = req.body;
  if (!code) {
    return res.status(400).json({ error: 'Promo code required' });
  }

  const coupon = couponsDatabase.find((c) => c.code.toUpperCase() === code.trim().toUpperCase());
  if (!coupon) {
    return res.status(404).json({ error: 'Invalid or expired promotional code' });
  }

  if (coupon.minOrderAmount && orderSubtotal < coupon.minOrderAmount) {
    return res.status(400).json({
      error: `Coupon requires a minimum order of $${coupon.minOrderAmount}`,
    });
  }

  let discountAmount = 0;
  if (coupon.discountPercent) {
    discountAmount = (orderSubtotal * coupon.discountPercent) / 100;
  } else if (coupon.discountAmount) {
    discountAmount = coupon.discountAmount;
  }

  res.json({
    success: true,
    coupon: {
      code: coupon.code,
      discountAmount: Math.min(discountAmount, orderSubtotal),
      description: coupon.description,
      freeShipping: coupon.freeShipping || false,
    },
  });
});

// 10. Process Secure Payment and Finalize Order
app.post('/api/checkout/process-payment', (req: Request, res: Response) => {
  const {
    sessionId,
    cartItems,
    shippingAddress,
    shippingMethod,
    paymentDetails,
    couponCode,
    giftWrap,
    giftMessage,
  } = req.body;

  if (!cartItems || cartItems.length === 0) {
    return res.status(400).json({ error: 'Cart is empty' });
  }
  if (!shippingAddress || !shippingAddress.fullName || !shippingAddress.street || !shippingAddress.email) {
    return res.status(400).json({ error: 'Complete shipping address is required' });
  }
  if (!paymentDetails || !paymentDetails.method) {
    return res.status(400).json({ error: 'Payment information required' });
  }

  // Realistic Payment Gateway Validation
  if (paymentDetails.method === 'card') {
    const rawNum = (paymentDetails.cardNumber || '').replace(/\s+/g, '');
    if (rawNum.length < 13 || rawNum.length > 19) {
      return res.status(422).json({ error: 'Invalid card number length (must be 13-19 digits)' });
    }
    if (!paymentDetails.expiryMonth || !paymentDetails.expiryYear) {
      return res.status(422).json({ error: 'Valid expiration month and year are required' });
    }
    if (!paymentDetails.cvv || paymentDetails.cvv.length < 3) {
      return res.status(422).json({ error: 'Valid 3 or 4-digit CVV security code is required' });
    }
  }

  // Final check: are all items in stock?
  for (const item of cartItems) {
    const product = productsDatabase.find((p) => p.id === item.productId);
    if (!product) {
      return res.status(400).json({ error: `Jewelry item ${item.productName} no longer exists` });
    }
    if (product.stock < item.quantity) {
      return res.status(409).json({
        error: `Sorry, only ${product.stock} pieces of "${product.name}" remain in our atelier.`,
      });
    }
  }

  // Deduct Inventory permanently and write logs
  for (const item of cartItems) {
    const product = productsDatabase.find((p) => p.id === item.productId)!;
    const prev = product.stock;
    product.stock -= item.quantity;

    inventoryLogs.unshift({
      id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      productId: product.id,
      productName: product.name,
      sku: product.sku,
      previousStock: prev,
      newStock: product.stock,
      change: -item.quantity,
      reason: 'sale',
      timestamp: new Date().toISOString(),
      note: `Sold via Order Checkout`,
    });
  }

  // Remove reservations for this session
  if (sessionId) {
    activeReservations = activeReservations.filter((r) => r.sessionId !== sessionId);
  }

  // Calculate pricing
  const subtotal = cartItems.reduce((sum: number, item: any) => sum + item.price * item.quantity, 0);
  let discount = 0;
  if (couponCode) {
    const coupon = couponsDatabase.find((c) => c.code.toUpperCase() === couponCode.trim().toUpperCase());
    if (coupon) {
      if (coupon.discountPercent) discount = (subtotal * coupon.discountPercent) / 100;
      else if (coupon.discountAmount) discount = coupon.discountAmount;
    }
  }

  const shippingFee = subtotal > 150 ? 0 : (shippingMethod?.price || 0);
  const tax = Number(((subtotal - discount) * 0.0725).toFixed(2));
  const total = Number((subtotal - discount + shippingFee + tax + (giftWrap ? 15 : 0)).toFixed(2));

  const orderNum = `AURA-2026-${Math.floor(1000 + Math.random() * 9000)}`;
  const txnId = `TXN-AURA-${Math.floor(100000 + Math.random() * 900000)}-AUTH`;

  const newOrder: Order = {
    id: `ord-${Date.now()}`,
    orderNumber: orderNum,
    createdAt: new Date().toISOString(),
    items: cartItems.map((ci: any) => ({
      productId: ci.productId,
      productName: ci.productName,
      sku: ci.sku || 'AUR-GEN',
      image: ci.image,
      price: ci.price,
      quantity: ci.quantity,
      selectedSize: ci.selectedSize,
      customEngraving: ci.customEngraving,
      metalName: ci.metalName || '18K Gold',
      gemstoneName: ci.gemstoneName || 'Fine Gemstone',
    })),
    subtotal,
    discount,
    couponCode: discount > 0 ? couponCode : undefined,
    shippingFee,
    tax,
    total,
    shippingAddress,
    shippingMethod: shippingMethod || {
      id: 'standard',
      name: 'Complimentary Artisan Delivery',
      estimatedDays: '3-5 business days',
      price: 0,
      description: 'Insured delivery with signature on arrival',
    },
    paymentMethod: paymentDetails.method,
    paymentTransactionId: txnId,
    status: 'payment_confirmed',
    trackingNumber: `AURA-EXP-${Math.floor(10000000 + Math.random() * 90000000)}`,
    giftWrap: !!giftWrap,
    giftMessage: giftMessage || undefined,
  };

  ordersDatabase.unshift(newOrder);

  res.status(201).json({
    success: true,
    message: 'Payment authorized and verified successfully!',
    order: newOrder,
  });
});

// 11. Get Order History & Tracking
app.get('/api/orders', (_req: Request, res: Response) => {
  res.json({ orders: ordersDatabase });
});

// 12. Update Order Status (Admin)
app.patch('/api/orders/:id/status', (req: Request, res: Response) => {
  const { id } = req.params;
  const { status, trackingNumber } = req.body;
  const order = ordersDatabase.find((o) => o.id === id);
  if (!order) {
    return res.status(404).json({ error: 'Order not found' });
  }

  if (status) order.status = status;
  if (trackingNumber) order.trackingNumber = trackingNumber;

  res.json({ success: true, order });
});

// 13. Get Real-time Inventory Analytics & Logs
app.get('/api/inventory/analytics', (_req: Request, res: Response) => {
  const totalSkus = productsDatabase.length;
  const totalStockUnits = productsDatabase.reduce((sum, p) => sum + p.stock, 0);
  const lowStockItemsCount = productsDatabase.filter((p) => p.stock > 0 && p.stock <= p.lowStockThreshold).length;
  const outOfStockItemsCount = productsDatabase.filter((p) => p.stock === 0).length;
  const totalInventoryValuation = productsDatabase.reduce((sum, p) => sum + p.price * p.stock, 0);
  const totalRevenue = ordersDatabase.reduce((sum, o) => sum + o.total, 0);
  const totalOrdersCount = ordersDatabase.length;

  res.json({
    stats: {
      totalSkus,
      totalStockUnits,
      lowStockItemsCount,
      outOfStockItemsCount,
      totalInventoryValuation,
      totalRevenue,
      totalOrdersCount,
    },
    logs: inventoryLogs.slice(0, 30),
    activeReservationsCount: activeReservations.length,
  });
});

// 14. AI Artisan Jewelry Concierge & Stylist
app.post('/api/ai-consultant', async (req: Request, res: Response) => {
  const { query, occasion, budget, recipient, metalPreference } = req.body;

  const catalogContext = productsDatabase.map((p) => ({
    id: p.id,
    name: p.name,
    price: p.price,
    category: p.category,
    metal: p.metalName,
    gemstone: p.gemstoneName,
    stock: p.stock,
    story: p.artisanStory,
  }));

  const ai = getGeminiAI();
  if (ai) {
    try {
      const prompt = `You are the Master Atelier Stylist & Jewelry Consultant at "Aura Artisan Jewelry".
A customer is asking for recommendations.
Customer Query / Context:
- Query: "${query || 'Help me select a special jewelry piece'}"
- Occasion: "${occasion || 'Special Celebration'}"
- Budget: "${budget || 'Flexible'}"
- Recipient: "${recipient || 'Loved One / Self'}"
- Metal Preference: "${metalPreference || 'Any'}"

Available Handmade Catalog:
${JSON.stringify(catalogContext, null, 2)}

Provide a warm, sophisticated, and expert recommendation.
Highlight 2-3 specific matching jewelry pieces from the catalog by exact name and price, explaining why their gemstone, metal craft, and heirloom symbolism suit the customer. Mention care tips or engraving possibilities where appropriate. Keep response elegant, concise (under 200 words), and encouraging.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.7-flash',
        contents: prompt,
      });

      return res.json({ advice: response.text });
    } catch (err: any) {
      console.warn('Gemini API call failed, falling back to smart stylist logic:', err);
    }
  }

  // Fallback intelligent styling logic
  const inStock = productsDatabase.filter((p) => p.stock > 0);
  const matched = inStock.slice(0, 2);
  const responseText = `Welcome to Aura Atelier. For your ${occasion || 'special occasion'}, our Master Goldsmith recommends the ${matched[0]?.name || 'Celestial Solitaire'} ($${matched[0]?.price}) crafted in ${matched[0]?.metalName}, paired beautifully with ${matched[1]?.name || 'Verdant Meadow Emerald'} ($${matched[1]?.price}). Both pieces feature ethically sourced natural gemstones forged by hand in limited studio batches.`;

  res.json({ advice: responseText });
});

// ----------------------------------------------------
// Production / Dev Vite Serving
// ----------------------------------------------------
async function setupApp() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Aura Artisan Jewelry Server running at http://0.0.0.0:${PORT}`);
  });
}

setupApp();
