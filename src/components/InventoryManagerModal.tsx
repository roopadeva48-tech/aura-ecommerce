import React, { useState, useEffect } from 'react';
import { useShop } from '../context/ShopContext';
import {
  X,
  Layers,
  TrendingUp,
  Package,
  AlertTriangle,
  Plus,
  RefreshCw,
  Search,
  CheckCircle2,
  DollarSign,
  ClipboardList,
  Activity,
  Trash2,
  Edit,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { Product, JewelryCategory, MetalType, GemstoneType, Order, InventoryStats, InventoryLog } from '../types';

export const InventoryManagerModal: React.FC = () => {
  const {
    isInventoryManagerOpen,
    setIsInventoryManagerOpen,
    products,
    fetchProducts,
    formatPrice,
    updateStockRealtime,
    addToast,
  } = useShop();

  if (!isInventoryManagerOpen) return null;

  const [activeTab, setActiveTab] = useState<'inventory' | 'orders' | 'logs' | 'add_product'>('inventory');
  const [searchFilter, setSearchFilter] = useState('');
  const [stats, setStats] = useState<InventoryStats | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [logs, setLogs] = useState<InventoryLog[]>([]);
  const [isLoadingAnalytics, setIsLoadingAnalytics] = useState(false);

  // New Product Form State
  const [newProduct, setNewProduct] = useState<Partial<Product>>({
    name: '',
    category: 'rings',
    price: 350,
    stock: 5,
    lowStockThreshold: 2,
    metal: '18k-yellow-gold',
    metalName: '18K Recycled Solid Yellow Gold',
    gemstone: 'diamond',
    gemstoneName: '0.5ct Conflict-Free Brilliant Diamond',
    description: 'Artisan handcrafted in limited studio quantity using pure reclaimed metals.',
    artisanStory: 'Hand-forged using traditional goldsmithing anvils and micro-prong setting.',
    handcraftHours: 4.5,
    dimensions: 'Band width: 2.0mm',
    weightGrams: 3.8,
    images: ['https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=1000&q=80'],
    availableSizes: ['5', '6', '7', '8', '9'],
    allowCustomEngraving: true,
    careInstructions: 'Clean gently with mild soap and soft jewelers cloth.',
  });

  const loadAnalyticsAndOrders = async () => {
    setIsLoadingAnalytics(true);
    try {
      const [resAnalytics, resOrders] = await Promise.all([
        fetch('/api/inventory/analytics'),
        fetch('/api/orders'),
      ]);

      if (resAnalytics.ok) {
        const data = await resAnalytics.json();
        setStats(data.stats);
        setLogs(data.logs || []);
      }
      if (resOrders.ok) {
        const dataOrders = await resOrders.json();
        setOrders(dataOrders.orders || []);
      }
    } catch (err) {
      console.error('Failed to load inventory data:', err);
    } finally {
      setIsLoadingAnalytics(false);
    }
  };

  useEffect(() => {
    loadAnalyticsAndOrders();
  }, []);

  const handleStockQuickChange = async (product: Product, delta: number) => {
    const newStock = Math.max(0, product.stock + delta);
    await updateStockRealtime(product.id, {
      change: delta,
      reason: delta > 0 ? 'restock' : 'manual_adjustment',
      note: `Live admin quick adjust (${delta > 0 ? `+${delta}` : delta})`,
    });
    loadAnalyticsAndOrders();
  };

  const handleUpdateOrderStatus = async (orderId: string, newStatus: any) => {
    try {
      const res = await fetch(`/api/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o)));
        addToast('success', 'Order Stage Updated', `Order status changed to ${newStatus}.`);
      }
    } catch {
      addToast('error', 'Update Failed', 'Could not update order status.');
    }
  };

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProduct.name || !newProduct.price) {
      addToast('error', 'Missing Fields', 'Please complete the product name and price.');
      return;
    }

    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newProduct),
      });

      if (res.ok) {
        addToast('success', 'Jewelry Item Created', `"${newProduct.name}" added to live inventory.`);
        await fetchProducts();
        loadAnalyticsAndOrders();
        setActiveTab('inventory');
      }
    } catch {
      addToast('error', 'Creation Error', 'Could not save new jewelry piece.');
    }
  };

  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(searchFilter.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchFilter.toLowerCase()) ||
      p.category.toLowerCase().includes(searchFilter.toLowerCase())
  );

  return (
    <div
      id="inventory-manager-backdrop"
      className="fixed inset-0 z-50 bg-stone-950/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto"
      onClick={() => setIsInventoryManagerOpen(false)}
    >
      <div
        id="inventory-manager-panel"
        className="relative bg-white w-full max-w-6xl rounded-2xl shadow-2xl overflow-hidden my-4 border border-stone-200 flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-stone-900 text-stone-100 p-5 flex items-center justify-between border-b border-stone-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-serif-luxury font-medium tracking-wide">
                  Atelier Real-Time Inventory & Workshop Command
                </h2>
                <span className="text-[10px] bg-amber-950 border border-amber-700 text-amber-300 px-2 py-0.5 rounded font-mono">
                  LIVE SYNC ACTIVE
                </span>
              </div>
              <p className="text-xs text-stone-400">
                Manage hand-forged batches, stock levels, sales turnover, and custom customer orders
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                fetchProducts();
                loadAnalyticsAndOrders();
              }}
              className="p-2 text-stone-400 hover:text-white rounded-lg hover:bg-stone-800 transition"
              title="Refresh Live Metrics"
            >
              <RefreshCw className={`w-4 h-4 ${isLoadingAnalytics ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={() => setIsInventoryManagerOpen(false)}
              className="p-2 text-stone-400 hover:text-white rounded-lg hover:bg-stone-800 transition"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Live Metrics Row */}
        <div className="bg-stone-50 border-b border-stone-200 p-4 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <div className="bg-white p-3 rounded-xl border border-stone-200 space-y-1">
            <span className="text-[10px] uppercase font-mono text-stone-400 block">Total Active SKUs</span>
            <span className="text-xl font-bold font-mono text-stone-900">{products.length}</span>
          </div>

          <div className="bg-white p-3 rounded-xl border border-stone-200 space-y-1">
            <span className="text-[10px] uppercase font-mono text-stone-400 block">Handcrafted Units</span>
            <span className="text-xl font-bold font-mono text-stone-900">
              {products.reduce((sum, p) => sum + p.stock, 0)}
            </span>
          </div>

          <div className="bg-white p-3 rounded-xl border border-stone-200 space-y-1">
            <span className="text-[10px] uppercase font-mono text-amber-700 block">Low Stock Alert</span>
            <span className="text-xl font-bold font-mono text-amber-700">
              {products.filter((p) => p.stock > 0 && p.stock <= p.lowStockThreshold).length}
            </span>
          </div>

          <div className="bg-white p-3 rounded-xl border border-stone-200 space-y-1">
            <span className="text-[10px] uppercase font-mono text-rose-700 block">Sold Out Batches</span>
            <span className="text-xl font-bold font-mono text-rose-700">
              {products.filter((p) => p.stock === 0).length}
            </span>
          </div>

          <div className="bg-white p-3 rounded-xl border border-stone-200 space-y-1">
            <span className="text-[10px] uppercase font-mono text-stone-400 block">Inventory Valuation</span>
            <span className="text-xl font-bold font-mono text-stone-900">
              {formatPrice(products.reduce((sum, p) => sum + p.price * p.stock, 0))}
            </span>
          </div>

          <div className="bg-white p-3 rounded-xl border border-stone-200 space-y-1">
            <span className="text-[10px] uppercase font-mono text-emerald-700 block">Total Revenue</span>
            <span className="text-xl font-bold font-mono text-emerald-800">
              {formatPrice(orders.reduce((sum, o) => sum + o.total, 0))}
            </span>
          </div>
        </div>

        {/* Tab Navigation & Search */}
        <div className="px-6 py-3 border-b border-stone-200 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white">
          <div className="flex items-center gap-2 overflow-x-auto text-xs font-semibold">
            <button
              onClick={() => setActiveTab('inventory')}
              className={`px-3 py-1.5 rounded-lg transition ${
                activeTab === 'inventory'
                  ? 'bg-stone-900 text-amber-200'
                  : 'text-stone-600 hover:bg-stone-100'
              }`}
            >
              Inventory Table ({products.length})
            </button>

            <button
              onClick={() => setActiveTab('orders')}
              className={`px-3 py-1.5 rounded-lg transition ${
                activeTab === 'orders'
                  ? 'bg-stone-900 text-amber-200'
                  : 'text-stone-600 hover:bg-stone-100'
              }`}
            >
              Customer Orders ({orders.length})
            </button>

            <button
              onClick={() => setActiveTab('logs')}
              className={`px-3 py-1.5 rounded-lg transition ${
                activeTab === 'logs'
                  ? 'bg-stone-900 text-amber-200'
                  : 'text-stone-600 hover:bg-stone-100'
              }`}
            >
              Audit Activity Logs ({logs.length})
            </button>

            <button
              onClick={() => setActiveTab('add_product')}
              className={`px-3 py-1.5 rounded-lg flex items-center gap-1 transition ${
                activeTab === 'add_product'
                  ? 'bg-amber-600 text-stone-950 font-bold'
                  : 'bg-amber-50 text-amber-900 hover:bg-amber-100 border border-amber-200'
              }`}
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add New Jewelry Batch</span>
            </button>
          </div>

          {activeTab === 'inventory' && (
            <div className="relative max-w-xs w-full">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
              <input
                type="text"
                placeholder="Search SKU, name, or category..."
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:border-stone-400"
              />
            </div>
          )}
        </div>

        {/* Tab Content Panels */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-stone-50/50">
          
          {/* 1. INVENTORY STOCK MANAGEMENT TABLE */}
          {activeTab === 'inventory' && (
            <div className="bg-white rounded-xl border border-stone-200 overflow-hidden shadow-xs">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-stone-100/80 border-b border-stone-200 text-stone-500 text-[10px] uppercase font-mono">
                    <th className="py-3 px-4">Jewelry Piece & SKU</th>
                    <th className="py-3 px-3">Category</th>
                    <th className="py-3 px-3">Material Craft</th>
                    <th className="py-3 px-3">Price</th>
                    <th className="py-3 px-3 text-center">Live Stock</th>
                    <th className="py-3 px-3">Status</th>
                    <th className="py-3 px-4 text-right">Quick Restock Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {filteredProducts.map((product) => {
                    const isOut = product.stock <= 0;
                    const isLow = product.stock > 0 && product.stock <= product.lowStockThreshold;

                    return (
                      <tr key={product.id} className="hover:bg-stone-50/80 transition">
                        {/* Piece & SKU */}
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <img
                              src={product.images[0]}
                              alt={product.name}
                              className="w-10 h-10 rounded-lg object-cover border border-stone-200 shrink-0"
                            />
                            <div>
                              <p className="font-semibold text-stone-900">{product.name}</p>
                              <span className="font-mono text-[10px] text-stone-400">{product.sku}</span>
                            </div>
                          </div>
                        </td>

                        {/* Category */}
                        <td className="py-3 px-3 uppercase text-[10px] font-semibold text-amber-900">
                          {product.category}
                        </td>

                        {/* Material */}
                        <td className="py-3 px-3 text-[11px] text-stone-600 max-w-[160px] truncate">
                          {product.metalName.split(' ')[0]} {product.metalName.split(' ')[1]} • {product.gemstoneName}
                        </td>

                        {/* Price */}
                        <td className="py-3 px-3 font-mono font-bold text-stone-900">
                          {formatPrice(product.price)}
                        </td>

                        {/* Live Stock Level */}
                        <td className="py-3 px-3 text-center">
                          <span
                            className={`inline-block px-2.5 py-1 rounded-md font-mono font-bold text-xs ${
                              isOut
                                ? 'bg-rose-100 text-rose-900 border border-rose-200'
                                : isLow
                                ? 'bg-amber-100 text-amber-900 border border-amber-300'
                                : 'bg-emerald-100 text-emerald-900 border border-emerald-200'
                            }`}
                          >
                            {product.stock} units
                          </span>
                        </td>

                        {/* Status */}
                        <td className="py-3 px-3">
                          {isOut ? (
                            <span className="text-[10px] font-semibold text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                              Sold Out
                            </span>
                          ) : isLow ? (
                            <span className="text-[10px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                              Low (≤ {product.lowStockThreshold})
                            </span>
                          ) : (
                            <span className="text-[10px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                              Optimal
                            </span>
                          )}
                        </td>

                        {/* Quick Actions */}
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => handleStockQuickChange(product, -1)}
                              disabled={product.stock <= 0}
                              className="px-2.5 py-1 bg-stone-100 hover:bg-stone-200 disabled:opacity-30 rounded text-stone-700 font-bold"
                              title="Decrease 1 unit"
                            >
                              -1
                            </button>

                            <button
                              onClick={() => handleStockQuickChange(product, +1)}
                              className="px-2.5 py-1 bg-amber-100 hover:bg-amber-200 rounded text-amber-950 font-bold"
                              title="Restock 1 unit"
                            >
                              +1
                            </button>

                            <button
                              onClick={() => handleStockQuickChange(product, +5)}
                              className="px-2.5 py-1 bg-stone-900 hover:bg-stone-800 text-amber-200 rounded font-mono text-[11px]"
                              title="Restock full batch (+5 units)"
                            >
                              +5 Batch
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* 2. CUSTOMER ORDERS WORKSHOP QUEUE */}
          {activeTab === 'orders' && (
            <div className="space-y-4">
              {orders.length === 0 ? (
                <div className="text-center p-8 bg-white rounded-xl border border-stone-200 text-stone-500 text-xs">
                  No orders placed yet.
                </div>
              ) : (
                orders.map((order) => (
                  <div
                    key={order.id}
                    className="bg-white rounded-xl border border-stone-200 p-5 shadow-xs space-y-4"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-stone-100 pb-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-sm text-stone-900">
                            ORDER #{order.orderNumber}
                          </span>
                          <span className="text-[11px] bg-stone-100 text-stone-600 px-2 py-0.5 rounded font-mono">
                            {new Date(order.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-xs text-stone-500">
                          Recipient: <strong>{order.shippingAddress.fullName}</strong> • {order.shippingAddress.city}, {order.shippingAddress.state}
                        </p>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="text-right text-xs">
                          <span className="text-stone-400 block text-[10px] uppercase font-mono">Total Paid</span>
                          <span className="font-mono font-bold text-stone-900">{formatPrice(order.total)}</span>
                        </div>

                        {/* Stage Selector */}
                        <select
                          value={order.status}
                          onChange={(e) => handleUpdateOrderStatus(order.id, e.target.value)}
                          className="bg-stone-50 border border-stone-300 text-xs rounded-lg px-3 py-1.5 font-medium focus:outline-none focus:border-stone-900 cursor-pointer"
                        >
                          <option value="payment_confirmed">1. Payment Confirmed</option>
                          <option value="artisan_crafting">2. Artisan Bench Crafting</option>
                          <option value="hallmarking">3. Hallmarking & Inspection</option>
                          <option value="packaged">4. Packaged in Keepsake Box</option>
                          <option value="shipped">5. Shipped with Courier</option>
                          <option value="delivered">6. Delivered to Recipient</option>
                        </select>
                      </div>
                    </div>

                    {/* Order Items */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {order.items.map((item, i) => (
                        <div key={i} className="flex gap-2.5 p-2 bg-stone-50 rounded-lg border border-stone-200/70 text-xs">
                          <img src={item.image} alt={item.productName} className="w-12 h-12 object-cover rounded-md border border-stone-200" />
                          <div className="min-w-0">
                            <p className="font-medium text-stone-900 truncate">{item.productName}</p>
                            <p className="text-[11px] text-stone-500">Qty: {item.quantity} • {formatPrice(item.price)}</p>
                            {item.selectedSize && <p className="text-[10px] text-stone-600 font-mono">Size: US {item.selectedSize}</p>}
                            {item.customEngraving && <p className="text-[10px] text-amber-900 italic font-serif">Engraving: "{item.customEngraving}"</p>}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Gift note if attached */}
                    {order.giftMessage && (
                      <div className="p-2.5 bg-amber-50 rounded-lg border border-amber-200/60 text-xs text-amber-950">
                        <strong>Handwritten Gift Card Note:</strong> "{order.giftMessage}"
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          )}

          {/* 3. AUDIT ACTIVITY LOGS */}
          {activeTab === 'logs' && (
            <div className="bg-white rounded-xl border border-stone-200 overflow-hidden shadow-xs">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-stone-100 border-b border-stone-200 text-stone-500 text-[10px] uppercase font-mono">
                    <th className="py-2.5 px-4">Timestamp</th>
                    <th className="py-2.5 px-3">Product Name</th>
                    <th className="py-2.5 px-3">SKU</th>
                    <th className="py-2.5 px-3">Type</th>
                    <th className="py-2.5 px-3 text-center">Stock Shift</th>
                    <th className="py-2.5 px-4">Audit Note</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 font-mono text-[11px]">
                  {logs.map((log) => (
                    <tr key={log.id} className="hover:bg-stone-50">
                      <td className="py-2.5 px-4 text-stone-400">
                        {new Date(log.timestamp).toLocaleString()}
                      </td>
                      <td className="py-2.5 px-3 font-sans font-medium text-stone-900">{log.productName}</td>
                      <td className="py-2.5 px-3 text-stone-500">{log.sku}</td>
                      <td className="py-2.5 px-3 uppercase text-[10px] font-bold">
                        {log.reason === 'sale' ? (
                          <span className="text-emerald-700">Sale Order</span>
                        ) : log.reason === 'restock' ? (
                          <span className="text-amber-800">Restock Batch</span>
                        ) : (
                          <span className="text-stone-600">Manual Edit</span>
                        )}
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <span className={`font-bold ${log.change < 0 ? 'text-rose-700' : 'text-emerald-700'}`}>
                          {log.change > 0 ? `+${log.change}` : log.change} units ({log.previousStock} → {log.newStock})
                        </span>
                      </td>
                      <td className="py-2.5 px-4 text-stone-600 font-sans text-xs">
                        {log.note || 'Recorded in atelier database'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* 4. ADD NEW JEWELRY PIECE FORM */}
          {activeTab === 'add_product' && (
            <form onSubmit={handleCreateProduct} className="max-w-2xl mx-auto bg-white p-6 rounded-2xl border border-stone-200 shadow-sm space-y-4 text-xs">
              <h3 className="text-sm font-semibold text-stone-900 uppercase tracking-wider">
                Add Handcrafted Piece to Atelier Collection
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-stone-700 font-medium mb-1">Design Title *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Luminary Rose Cut Diamond Band"
                    value={newProduct.name}
                    onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:outline-none focus:border-stone-900"
                  />
                </div>

                <div>
                  <label className="block text-stone-700 font-medium mb-1">Category</label>
                  <select
                    value={newProduct.category}
                    onChange={(e: any) => setNewProduct({ ...newProduct, category: e.target.value })}
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:outline-none focus:border-stone-900"
                  >
                    <option value="rings">Rings</option>
                    <option value="necklaces">Necklaces</option>
                    <option value="earrings">Earrings</option>
                    <option value="bracelets">Bracelets</option>
                    <option value="bridal">Bridal & Heirlooms</option>
                  </select>
                </div>

                <div>
                  <label className="block text-stone-700 font-medium mb-1">Price (USD $) *</label>
                  <input
                    type="number"
                    required
                    min={10}
                    value={newProduct.price}
                    onChange={(e) => setNewProduct({ ...newProduct, price: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg font-mono focus:outline-none focus:border-stone-900"
                  />
                </div>

                <div>
                  <label className="block text-stone-700 font-medium mb-1">Initial Handcrafted Stock Units *</label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={newProduct.stock}
                    onChange={(e) => setNewProduct({ ...newProduct, stock: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg font-mono focus:outline-none focus:border-stone-900"
                  />
                </div>

                <div>
                  <label className="block text-stone-700 font-medium mb-1">Low Stock Alert Threshold</label>
                  <input
                    type="number"
                    min={1}
                    value={newProduct.lowStockThreshold}
                    onChange={(e) => setNewProduct({ ...newProduct, lowStockThreshold: parseInt(e.target.value) || 2 })}
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg font-mono focus:outline-none focus:border-stone-900"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-stone-700 font-medium mb-1">Precious Metal Description</label>
                  <input
                    type="text"
                    value={newProduct.metalName}
                    onChange={(e) => setNewProduct({ ...newProduct, metalName: e.target.value })}
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:outline-none focus:border-stone-900"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-stone-700 font-medium mb-1">Gemstone Specification</label>
                  <input
                    type="text"
                    value={newProduct.gemstoneName}
                    onChange={(e) => setNewProduct({ ...newProduct, gemstoneName: e.target.value })}
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:outline-none focus:border-stone-900"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-stone-700 font-medium mb-1">Description & Heirloom Narrative</label>
                  <textarea
                    rows={2}
                    value={newProduct.description}
                    onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:outline-none focus:border-stone-900"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-stone-700 font-medium mb-1">Primary Image URL</label>
                  <input
                    type="url"
                    value={newProduct.images?.[0]}
                    onChange={(e) => setNewProduct({ ...newProduct, images: [e.target.value] })}
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg font-mono text-[11px] focus:outline-none focus:border-stone-900"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setActiveTab('inventory')}
                  className="px-4 py-2 border border-stone-300 rounded-lg text-stone-600 hover:bg-stone-100 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-stone-900 hover:bg-stone-800 text-amber-200 font-semibold rounded-lg transition shadow-sm"
                >
                  Create & Launch to Atelier
                </button>
              </div>
            </form>
          )}

        </div>

      </div>
    </div>
  );
};
