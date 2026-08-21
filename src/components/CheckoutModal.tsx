import React, { useState } from 'react';
import { useShop } from '../context/ShopContext';
import {
  X,
  ShieldCheck,
  CreditCard,
  Lock,
  Truck,
  CheckCircle2,
  AlertCircle,
  Gift,
  Printer,
  Sparkles,
  ArrowLeft,
  ArrowRight,
  RotateCcw,
  Check,
  Clock,
  Download,
  Building,
  DollarSign
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { ShippingAddress, ShippingMethod, PaymentDetails, Order, PaymentMethodType } from '../types';

export const CheckoutModal: React.FC = () => {
  const {
    isCheckoutOpen,
    setIsCheckoutOpen,
    cart,
    cartSubtotal,
    appliedCoupon,
    giftWrap,
    giftMessage,
    formatPrice,
    clearCart,
    lastCompletedOrder,
    setLastCompletedOrder,
    fetchProducts,
    sessionId,
    addToast,
  } = useShop();

  if (!isCheckoutOpen) return null;

  // Multi-step state: 'shipping' | 'payment' | 'confirmation'
  const [step, setStep] = useState<'shipping' | 'payment' | 'confirmation'>(
    lastCompletedOrder ? 'confirmation' : 'shipping'
  );

  // Shipping Form State
  const [shippingAddress, setShippingAddress] = useState<ShippingAddress>({
    fullName: 'Sophia Montgomery',
    email: 'sophia.montgomery@example.com',
    phone: '+1 (415) 890-2341',
    street: '742 Evergreen Terrace',
    apartment: 'Suite 4B',
    city: 'San Francisco',
    state: 'CA',
    postalCode: '94107',
    country: 'United States',
  });

  const [shippingMethod, setShippingMethod] = useState<ShippingMethod>({
    id: 'standard',
    name: 'Complimentary Insured Courier',
    estimatedDays: '3-5 business days',
    price: 0,
    description: 'Insured delivery with adult signature and tamper-proof velvet casing',
  });

  const shippingOptions: ShippingMethod[] = [
    {
      id: 'standard',
      name: 'Complimentary Insured Courier',
      estimatedDays: '3-5 business days',
      price: 0,
      description: 'Insured delivery with adult signature on arrival',
    },
    {
      id: 'express',
      name: 'Express Atelier Courier',
      estimatedDays: '1-2 business days',
      price: 25,
      description: 'Priority courier with direct live GPS handoff tracking',
    },
    {
      id: 'overnight',
      name: 'Overnight Armored Vault Delivery',
      estimatedDays: 'Next business morning',
      price: 45,
      description: 'Armored transit service for high-value gemstone heirlooms',
    },
  ];

  // Payment Form State
  const [paymentDetails, setPaymentDetails] = useState<PaymentDetails>({
    method: 'card',
    cardNumber: '4532 8921 7843 9021',
    cardHolder: 'SOPHIA MONTGOMERY',
    expiryMonth: '08',
    expiryYear: '28',
    cvv: '842',
    saveCard: true,
    billingAddressSameAsShipping: true,
  });

  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [paymentError, setPaymentError] = useState('');

  // Math Calculations
  const discountAmount = appliedCoupon ? appliedCoupon.discountAmount : 0;
  const giftFee = giftWrap ? 15 : 0;
  const deliveryFee = cartSubtotal > 150 ? 0 : shippingMethod.price;
  const taxableAmount = Math.max(0, cartSubtotal - discountAmount);
  const tax = Number((taxableAmount * 0.0725).toFixed(2));
  const orderTotal = Number((taxableAmount + deliveryFee + giftFee + tax).toFixed(2));

  // Handle format card number
  const handleCardNumberChange = (val: string) => {
    const clean = val.replace(/\D/g, '').substring(0, 16);
    const parts = clean.match(/.{1,4}/g);
    setPaymentDetails((prev) => ({
      ...prev,
      cardNumber: parts ? parts.join(' ') : clean,
    }));
  };

  // Card Type Detector
  const getCardType = (num: string) => {
    const clean = num.replace(/\s+/g, '');
    if (clean.startsWith('4')) return 'Visa';
    if (clean.startsWith('5') || clean.startsWith('2')) return 'Mastercard';
    if (clean.startsWith('34') || clean.startsWith('37')) return 'Amex';
    return 'Credit/Debit';
  };

  // Validation step 1
  const handleProceedToPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!shippingAddress.fullName || !shippingAddress.email || !shippingAddress.street || !shippingAddress.city || !shippingAddress.postalCode) {
      setPaymentError('Please fill in all required shipping address fields.');
      return;
    }
    setPaymentError('');
    setStep('payment');
  };

  // Process Real Payment via backend API
  const handleExecutePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setPaymentError('');
    setIsProcessingPayment(true);

    try {
      const payload = {
        sessionId,
        cartItems: cart.map((item) => ({
          productId: item.product.id,
          productName: item.product.name,
          sku: item.product.sku,
          image: item.product.images[0],
          price: item.product.price,
          quantity: item.quantity,
          selectedSize: item.selectedSize,
          customEngraving: item.customEngraving,
          metalName: item.product.metalName,
          gemstoneName: item.product.gemstoneName,
        })),
        shippingAddress,
        shippingMethod,
        paymentDetails,
        couponCode: appliedCoupon?.code,
        giftWrap,
        giftMessage,
      };

      const res = await fetch('/api/checkout/process-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        setPaymentError(data.error || 'Payment transaction failed. Please check your credentials.');
        setIsProcessingPayment(false);
        return;
      }

      // Success!
      setLastCompletedOrder(data.order);
      clearCart();
      await fetchProducts(); // refresh live stock
      setStep('confirmation');

      // Trigger Celebration Confetti
      try {
        confetti({
          particleCount: 120,
          spread: 80,
          origin: { y: 0.6 },
          colors: ['#f59e0b', '#d97706', '#fbbf24', '#78350f', '#e2e8f0'],
        });
      } catch {}

      addToast('success', 'Payment Successful', `Order #${data.order.orderNumber} authorized and confirmed!`);
    } catch (err: any) {
      setPaymentError('Network error connecting to payment gateway. Please try again.');
    } finally {
      setIsProcessingPayment(false);
    }
  };

  const handlePrintInvoice = () => {
    window.print();
  };

  const handleClose = () => {
    setIsCheckoutOpen(false);
    if (step === 'confirmation') {
      setStep('shipping');
    }
  };

  return (
    <div
      id="checkout-modal-backdrop"
      className="fixed inset-0 z-50 bg-stone-950/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto"
      onClick={handleClose}
    >
      <div
        id="checkout-modal-panel"
        className="relative bg-white w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden my-4 border border-stone-200 flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Bar */}
        <div className="bg-stone-900 text-stone-100 p-4 sm:p-6 flex items-center justify-between border-b border-stone-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-base sm:text-lg font-serif-luxury font-medium tracking-wide">
                  Aura Atelier Secure Payment Gateway
                </span>
                <span className="text-[10px] bg-emerald-950 border border-emerald-700 text-emerald-300 px-2 py-0.5 rounded font-mono">
                  256-BIT SSL ENCRYPTED
                </span>
              </div>
              <p className="text-xs text-stone-400">
                Authorized Merchant ID: AUR-PAY-GATEWAY-2026
              </p>
            </div>
          </div>

          <button
            onClick={handleClose}
            className="p-2 text-stone-400 hover:text-white rounded-full hover:bg-stone-800 transition"
            aria-label="Close Checkout"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step Progress Bar (Hidden during confirmation) */}
        {step !== 'confirmation' && (
          <div className="bg-stone-100 border-b border-stone-200 px-6 py-3 flex items-center justify-center gap-8 text-xs font-medium">
            <div className={`flex items-center gap-2 ${step === 'shipping' ? 'text-amber-900 font-bold' : 'text-stone-500'}`}>
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${step === 'shipping' ? 'bg-amber-800 text-amber-100' : 'bg-stone-300 text-stone-700'}`}>
                1
              </span>
              <span>Shipping & Delivery</span>
            </div>
            <div className="w-12 h-0.5 bg-stone-300" />
            <div className={`flex items-center gap-2 ${step === 'payment' ? 'text-amber-900 font-bold' : 'text-stone-400'}`}>
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${step === 'payment' ? 'bg-amber-800 text-amber-100' : 'bg-stone-300 text-stone-700'}`}>
                2
              </span>
              <span>Payment & Authorization</span>
            </div>
          </div>
        )}

        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          
          {/* STEP 1: SHIPPING & DELIVERY */}
          {step === 'shipping' && (
            <form onSubmit={handleProceedToPayment} className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* Shipping Address Inputs */}
              <div className="lg:col-span-7 space-y-4">
                <h3 className="text-sm font-semibold text-stone-900 uppercase tracking-wider flex items-center gap-2">
                  <Truck className="w-4 h-4 text-amber-700" /> 1. Shipping Destination & Contact
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="sm:col-span-2">
                    <label className="block text-stone-700 font-medium mb-1">Full Recipient Name *</label>
                    <input
                      type="text"
                      required
                      value={shippingAddress.fullName}
                      onChange={(e) => setShippingAddress({ ...shippingAddress, fullName: e.target.value })}
                      className="w-full px-3 py-2 border border-stone-300 rounded-lg bg-stone-50/50 focus:bg-white focus:outline-none focus:border-stone-900"
                    />
                  </div>

                  <div>
                    <label className="block text-stone-700 font-medium mb-1">Email (Order Confirmation) *</label>
                    <input
                      type="email"
                      required
                      value={shippingAddress.email}
                      onChange={(e) => setShippingAddress({ ...shippingAddress, email: e.target.value })}
                      className="w-full px-3 py-2 border border-stone-300 rounded-lg bg-stone-50/50 focus:bg-white focus:outline-none focus:border-stone-900"
                    />
                  </div>

                  <div>
                    <label className="block text-stone-700 font-medium mb-1">Phone Number (Courier SMS) *</label>
                    <input
                      type="tel"
                      required
                      value={shippingAddress.phone}
                      onChange={(e) => setShippingAddress({ ...shippingAddress, phone: e.target.value })}
                      className="w-full px-3 py-2 border border-stone-300 rounded-lg bg-stone-50/50 focus:bg-white focus:outline-none focus:border-stone-900"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-stone-700 font-medium mb-1">Street Address *</label>
                    <input
                      type="text"
                      required
                      placeholder="Street name and house/building number"
                      value={shippingAddress.street}
                      onChange={(e) => setShippingAddress({ ...shippingAddress, street: e.target.value })}
                      className="w-full px-3 py-2 border border-stone-300 rounded-lg bg-stone-50/50 focus:bg-white focus:outline-none focus:border-stone-900"
                    />
                  </div>

                  <div>
                    <label className="block text-stone-700 font-medium mb-1">Suite / Apartment (Optional)</label>
                    <input
                      type="text"
                      value={shippingAddress.apartment}
                      onChange={(e) => setShippingAddress({ ...shippingAddress, apartment: e.target.value })}
                      className="w-full px-3 py-2 border border-stone-300 rounded-lg bg-stone-50/50 focus:bg-white focus:outline-none focus:border-stone-900"
                    />
                  </div>

                  <div>
                    <label className="block text-stone-700 font-medium mb-1">City *</label>
                    <input
                      type="text"
                      required
                      value={shippingAddress.city}
                      onChange={(e) => setShippingAddress({ ...shippingAddress, city: e.target.value })}
                      className="w-full px-3 py-2 border border-stone-300 rounded-lg bg-stone-50/50 focus:bg-white focus:outline-none focus:border-stone-900"
                    />
                  </div>

                  <div>
                    <label className="block text-stone-700 font-medium mb-1">State / Province *</label>
                    <input
                      type="text"
                      required
                      value={shippingAddress.state}
                      onChange={(e) => setShippingAddress({ ...shippingAddress, state: e.target.value })}
                      className="w-full px-3 py-2 border border-stone-300 rounded-lg bg-stone-50/50 focus:bg-white focus:outline-none focus:border-stone-900"
                    />
                  </div>

                  <div>
                    <label className="block text-stone-700 font-medium mb-1">Postal / ZIP Code *</label>
                    <input
                      type="text"
                      required
                      value={shippingAddress.postalCode}
                      onChange={(e) => setShippingAddress({ ...shippingAddress, postalCode: e.target.value })}
                      className="w-full px-3 py-2 border border-stone-300 rounded-lg bg-stone-50/50 focus:bg-white focus:outline-none focus:border-stone-900"
                    />
                  </div>
                </div>

                {/* Delivery Speeds */}
                <div className="pt-4 space-y-2">
                  <h4 className="text-xs font-semibold text-stone-900 uppercase tracking-wider">
                    Select Insured Courier Speed
                  </h4>
                  <div className="space-y-2">
                    {shippingOptions.map((opt) => (
                      <label
                        key={opt.id}
                        onClick={() => setShippingMethod(opt)}
                        className={`flex items-start justify-between p-3 rounded-xl border text-xs cursor-pointer transition ${
                          shippingMethod.id === opt.id
                            ? 'border-amber-700 bg-amber-50/70 shadow-xs'
                            : 'border-stone-200 hover:bg-stone-50'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <input
                            type="radio"
                            name="shippingMethod"
                            checked={shippingMethod.id === opt.id}
                            onChange={() => setShippingMethod(opt)}
                            className="mt-0.5 text-amber-700 focus:ring-amber-500"
                          />
                          <div>
                            <p className="font-semibold text-stone-900">{opt.name}</p>
                            <p className="text-stone-500 text-[11px]">{opt.description}</p>
                            <p className="text-amber-900 font-mono text-[10px] mt-0.5">Est. Arrival: {opt.estimatedDays}</p>
                          </div>
                        </div>
                        <span className="font-mono font-bold text-stone-900">
                          {cartSubtotal > 150 && opt.id === 'standard' ? 'FREE' : formatPrice(opt.price)}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                {paymentError && (
                  <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{paymentError}</span>
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full py-3.5 bg-stone-900 hover:bg-amber-600 text-stone-100 hover:text-stone-950 font-bold text-xs uppercase tracking-wider rounded-full transition flex items-center justify-center gap-2 shadow-md"
                >
                  <span>Continue to Payment Method</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

              {/* Order Summary Sidebar */}
              <div className="lg:col-span-5 bg-stone-50 p-5 rounded-2xl border border-stone-200 space-y-4">
                <h4 className="text-xs font-semibold text-stone-900 uppercase tracking-wider">
                  Order Summary ({cart.reduce((s, i) => s + i.quantity, 0)} Items)
                </h4>

                <div className="space-y-3 max-h-56 overflow-y-auto pr-1">
                  {cart.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-3 text-xs">
                      <img
                        src={item.product.images[0]}
                        alt={item.product.name}
                        className="w-12 h-12 rounded-lg object-cover border border-stone-200 shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-stone-900 truncate">{item.product.name}</p>
                        <p className="text-[11px] text-stone-500">
                          Qty: {item.quantity} {item.selectedSize ? `• US ${item.selectedSize}` : ''}
                        </p>
                      </div>
                      <span className="font-mono font-semibold text-stone-900">
                        {formatPrice(item.product.price * item.quantity)}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="pt-3 border-t border-stone-200 space-y-1.5 text-xs text-stone-600">
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
                      <span>Gift Box Packaging</span>
                      <span>{formatPrice(15)}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span>Insured Delivery</span>
                    <span>{cartSubtotal > 150 ? 'Complimentary' : formatPrice(shippingMethod.price)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Estimated Sales Tax (7.25%)</span>
                    <span>{formatPrice(tax)}</span>
                  </div>
                  <div className="flex justify-between text-sm font-serif-luxury font-bold text-stone-950 pt-2 border-t border-stone-200">
                    <span>Final Order Total</span>
                    <span>{formatPrice(orderTotal)}</span>
                  </div>
                </div>

                <div className="p-3 bg-amber-50 rounded-xl border border-amber-200/70 text-[11px] text-amber-900 space-y-1">
                  <div className="flex items-center gap-1.5 font-semibold">
                    <Sparkles className="w-3.5 h-3.5 text-amber-700" />
                    <span>Complimentary Atelier Services:</span>
                  </div>
                  <p>• Complimentary ring resize within 60 days</p>
                  <p>• Authenticity Certificate & Hallmarking Purity Guarantee</p>
                </div>
              </div>

            </form>
          )}

          {/* STEP 2: PAYMENT & REALISTIC AUTHORIZATION */}
          {step === 'payment' && (
            <form onSubmit={handleExecutePayment} className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              <div className="lg:col-span-7 space-y-5">
                <div className="flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => setStep('shipping')}
                    className="text-xs text-stone-500 hover:text-stone-900 flex items-center gap-1"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" /> Back to Shipping
                  </button>
                  <span className="text-xs text-emerald-700 font-medium flex items-center gap-1">
                    <Lock className="w-3.5 h-3.5" /> Encrypted Payment Channel
                  </span>
                </div>

                {/* Payment Method Selector Tabs */}
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setPaymentDetails({ ...paymentDetails, method: 'card' })}
                    className={`py-2.5 px-3 rounded-xl border text-xs font-semibold flex flex-col items-center gap-1 transition ${
                      paymentDetails.method === 'card'
                        ? 'border-stone-900 bg-stone-900 text-amber-200 shadow-md'
                        : 'border-stone-200 text-stone-600 hover:bg-stone-50'
                    }`}
                  >
                    <CreditCard className="w-4 h-4" />
                    <span>Credit / Debit</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentDetails({ ...paymentDetails, method: 'apple_pay' })}
                    className={`py-2.5 px-3 rounded-xl border text-xs font-semibold flex flex-col items-center gap-1 transition ${
                      paymentDetails.method === 'apple_pay'
                        ? 'border-stone-900 bg-stone-900 text-amber-200 shadow-md'
                        : 'border-stone-200 text-stone-600 hover:bg-stone-50'
                    }`}
                  >
                    <span className="text-sm font-bold"> Pay</span>
                    <span>Apple / Google Pay</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentDetails({ ...paymentDetails, method: 'paypal' })}
                    className={`py-2.5 px-3 rounded-xl border text-xs font-semibold flex flex-col items-center gap-1 transition ${
                      paymentDetails.method === 'paypal'
                        ? 'border-stone-900 bg-stone-900 text-amber-200 shadow-md'
                        : 'border-stone-200 text-stone-600 hover:bg-stone-50'
                    }`}
                  >
                    <span className="text-sm font-bold italic text-sky-400">PayPal</span>
                    <span>PayPal Express</span>
                  </button>
                </div>

                {/* Credit Card Interactive Visualizer & Form */}
                {paymentDetails.method === 'card' && (
                  <div className="space-y-4">
                    
                    {/* Realistic Luxury Credit Card Preview Graphic */}
                    <div className="w-full max-w-sm mx-auto h-48 bg-gradient-to-tr from-stone-900 via-stone-800 to-amber-950 text-amber-100 rounded-2xl p-5 shadow-xl border border-amber-600/30 flex flex-col justify-between select-none relative overflow-hidden">
                      <div className="absolute -right-8 -top-8 w-32 h-32 bg-amber-500/10 rounded-full blur-xl pointer-events-none" />
                      
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="text-[10px] tracking-widest text-amber-300/80 uppercase font-mono">
                            Aura Atelier Private Client Card
                          </span>
                          <p className="text-xs font-serif-luxury tracking-widest text-white">WORLD ELITE</p>
                        </div>
                        <span className="font-mono text-sm font-bold bg-amber-400/20 px-2 py-0.5 rounded border border-amber-300/30 text-amber-300">
                          {getCardType(paymentDetails.cardNumber || '')}
                        </span>
                      </div>

                      {/* Chip icon & Card number */}
                      <div>
                        <div className="w-9 h-7 bg-amber-200/80 rounded-md mb-2 shadow-inner border border-amber-300/60" />
                        <p className="font-mono text-base tracking-[0.2em] text-amber-100 font-medium">
                          {paymentDetails.cardNumber || '•••• •••• •••• ••••'}
                        </p>
                      </div>

                      {/* Holder & Expiry */}
                      <div className="flex justify-between items-end text-xs font-mono">
                        <div>
                          <span className="text-[8px] uppercase text-stone-400 block">Cardholder</span>
                          <span className="tracking-wider text-amber-200 truncate max-w-[170px] block">
                            {paymentDetails.cardHolder || 'CARDHOLDER NAME'}
                          </span>
                        </div>
                        <div>
                          <span className="text-[8px] uppercase text-stone-400 block">Expires</span>
                          <span className="text-amber-200">
                            {paymentDetails.expiryMonth || 'MM'}/{paymentDetails.expiryYear || 'YY'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Card inputs */}
                    <div className="space-y-3 text-xs">
                      <div>
                        <label className="block text-stone-700 font-medium mb-1">Card Number *</label>
                        <div className="relative">
                          <input
                            type="text"
                            required
                            placeholder="4532 8921 7843 9021"
                            value={paymentDetails.cardNumber}
                            onChange={(e) => handleCardNumberChange(e.target.value)}
                            className="w-full px-3 py-2 pl-9 border border-stone-300 rounded-lg font-mono focus:outline-none focus:border-stone-900"
                          />
                          <CreditCard className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        </div>
                      </div>

                      <div>
                        <label className="block text-stone-700 font-medium mb-1">Cardholder Name (as on card) *</label>
                        <input
                          type="text"
                          required
                          value={paymentDetails.cardHolder}
                          onChange={(e) => setPaymentDetails({ ...paymentDetails, cardHolder: e.target.value.toUpperCase() })}
                          className="w-full px-3 py-2 border border-stone-300 rounded-lg uppercase focus:outline-none focus:border-stone-900"
                        />
                      </div>

                      <div className="grid grid-cols-3 gap-3">
                        <div>
                          <label className="block text-stone-700 font-medium mb-1">Month (MM) *</label>
                          <input
                            type="text"
                            maxLength={2}
                            required
                            placeholder="08"
                            value={paymentDetails.expiryMonth}
                            onChange={(e) => setPaymentDetails({ ...paymentDetails, expiryMonth: e.target.value.replace(/\D/g, '') })}
                            className="w-full px-3 py-2 border border-stone-300 rounded-lg font-mono text-center focus:outline-none focus:border-stone-900"
                          />
                        </div>

                        <div>
                          <label className="block text-stone-700 font-medium mb-1">Year (YY) *</label>
                          <input
                            type="text"
                            maxLength={2}
                            required
                            placeholder="28"
                            value={paymentDetails.expiryYear}
                            onChange={(e) => setPaymentDetails({ ...paymentDetails, expiryYear: e.target.value.replace(/\D/g, '') })}
                            className="w-full px-3 py-2 border border-stone-300 rounded-lg font-mono text-center focus:outline-none focus:border-stone-900"
                          />
                        </div>

                        <div>
                          <label className="block text-stone-700 font-medium mb-1">CVV / CVC *</label>
                          <div className="relative">
                            <input
                              type="password"
                              maxLength={4}
                              required
                              placeholder="•••"
                              value={paymentDetails.cvv}
                              onChange={(e) => setPaymentDetails({ ...paymentDetails, cvv: e.target.value.replace(/\D/g, '') })}
                              className="w-full px-3 py-2 border border-stone-300 rounded-lg font-mono text-center focus:outline-none focus:border-stone-900"
                            />
                            <Lock className="w-3.5 h-3.5 text-stone-400 absolute right-2.5 top-1/2 -translate-y-1/2" />
                          </div>
                        </div>
                      </div>
                    </div>

                  </div>
                )}

                {/* Digital Wallet simulation */}
                {paymentDetails.method === 'apple_pay' && (
                  <div className="p-6 bg-stone-900 text-stone-100 rounded-2xl text-center space-y-3">
                    <div className="w-12 h-12 rounded-full bg-stone-800 flex items-center justify-center mx-auto text-xl font-bold">
                      
                    </div>
                    <h4 className="text-sm font-semibold">Instant Biometric Authorization</h4>
                    <p className="text-xs text-stone-400 max-w-xs mx-auto">
                      Click the button below to authorize {formatPrice(orderTotal)} with Touch ID / Face ID or Google Wallet.
                    </p>
                  </div>
                )}

                {paymentDetails.method === 'paypal' && (
                  <div className="p-6 bg-sky-50 text-sky-950 rounded-2xl text-center space-y-3 border border-sky-200">
                    <div className="text-2xl font-bold italic text-sky-700">PayPal</div>
                    <h4 className="text-sm font-semibold">PayPal Express Checkout</h4>
                    <p className="text-xs text-sky-800 max-w-xs mx-auto">
                      You will be authenticated and redirected securely to authorize the payment of {formatPrice(orderTotal)}.
                    </p>
                  </div>
                )}

                {paymentError && (
                  <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{paymentError}</span>
                  </div>
                )}

                {/* Final Submit Payment CTA */}
                <button
                  id="btn-confirm-and-pay"
                  type="submit"
                  disabled={isProcessingPayment}
                  className="w-full py-4 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-sm uppercase tracking-wider rounded-full transition flex items-center justify-center gap-2 shadow-lg shadow-amber-950/20 active:scale-[0.99] disabled:opacity-50"
                >
                  {isProcessingPayment ? (
                    <>
                      <div className="w-4 h-4 border-2 border-stone-950 border-t-transparent rounded-full animate-spin" />
                      <span>Authorizing Secure Transaction...</span>
                    </>
                  ) : (
                    <>
                      <Lock className="w-4 h-4" />
                      <span>Authorize & Pay {formatPrice(orderTotal)}</span>
                    </>
                  )}
                </button>

                {/* Trust Badges */}
                <div className="grid grid-cols-3 gap-2 text-[10px] text-stone-400 text-center pt-2">
                  <div className="p-2 border border-stone-200 rounded-lg">
                    <span>🔒 PCI-DSS Level 1</span>
                  </div>
                  <div className="p-2 border border-stone-200 rounded-lg">
                    <span>🛡️ Norton Secured</span>
                  </div>
                  <div className="p-2 border border-stone-200 rounded-lg">
                    <span>💎 Conflict-Free Trust</span>
                  </div>
                </div>

              </div>

              {/* Sidebar Summary */}
              <div className="lg:col-span-5 bg-stone-50 p-5 rounded-2xl border border-stone-200 space-y-4">
                <h4 className="text-xs font-semibold text-stone-900 uppercase tracking-wider">
                  Review Details Before Authorization
                </h4>

                <div className="text-xs space-y-2 p-3 bg-white rounded-xl border border-stone-200">
                  <p className="font-semibold text-stone-800">Delivering To:</p>
                  <p className="text-stone-600">{shippingAddress.fullName}</p>
                  <p className="text-stone-600">{shippingAddress.street} {shippingAddress.apartment || ''}</p>
                  <p className="text-stone-600">{shippingAddress.city}, {shippingAddress.state} {shippingAddress.postalCode}</p>
                  <p className="text-stone-500 font-mono text-[11px]">{shippingAddress.email}</p>
                </div>

                <div className="text-xs space-y-2 p-3 bg-white rounded-xl border border-stone-200">
                  <p className="font-semibold text-stone-800">Courier Method:</p>
                  <p className="text-stone-600">{shippingMethod.name} ({shippingMethod.estimatedDays})</p>
                </div>

                <div className="space-y-1.5 text-xs text-stone-600 pt-2 border-t border-stone-200">
                  <div className="flex justify-between">
                    <span>Subtotal ({cart.reduce((s, i) => s + i.quantity, 0)} items)</span>
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
                      <span>Artisan Velvet Box</span>
                      <span>{formatPrice(15)}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span>Insured Delivery</span>
                    <span>{cartSubtotal > 150 ? 'Complimentary' : formatPrice(shippingMethod.price)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Sales Tax (7.25%)</span>
                    <span>{formatPrice(tax)}</span>
                  </div>
                  <div className="flex justify-between text-base font-serif-luxury font-bold text-stone-950 pt-2 border-t border-stone-200">
                    <span>Total Amount</span>
                    <span>{formatPrice(orderTotal)}</span>
                  </div>
                </div>
              </div>

            </form>
          )}

          {/* STEP 3: ORDER CONFIRMATION & PRINTABLE INVOICE RECEIPT */}
          {step === 'confirmation' && lastCompletedOrder && (
            <div className="space-y-6 max-w-3xl mx-auto py-2">
              
              {/* Confirmed Banner */}
              <div className="text-center space-y-2 p-6 bg-amber-50/80 rounded-2xl border border-amber-300">
                <div className="w-14 h-14 rounded-full bg-emerald-600 text-white flex items-center justify-center mx-auto shadow-md">
                  <Check className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-serif-luxury font-bold text-stone-900">
                  Payment Authorized & Order Confirmed
                </h3>
                <p className="text-xs text-amber-950 font-medium">
                  Thank you, <strong>{lastCompletedOrder.shippingAddress.fullName}</strong>. Your handmade jewelry order is now being queued at our master atelier.
                </p>
                <div className="inline-flex items-center gap-2 bg-white px-4 py-1.5 rounded-full border border-amber-300 text-xs font-mono font-bold text-amber-900 mt-2">
                  <span>ORDER NUMBER: {lastCompletedOrder.orderNumber}</span>
                </div>
              </div>

              {/* Interactive Atelier Progress Stage Bar */}
              <div className="bg-stone-900 text-stone-100 p-5 rounded-2xl space-y-4">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-amber-400 font-mono tracking-wider font-semibold">
                    LIVE ATELIER CRAFTING TIMELINE
                  </span>
                  <span className="text-stone-400 font-mono">
                    Tracking: {lastCompletedOrder.trackingNumber}
                  </span>
                </div>

                <div className="grid grid-cols-4 gap-2 text-center text-[10px]">
                  <div className="space-y-1">
                    <div className="w-7 h-7 rounded-full bg-emerald-500 text-stone-950 font-bold flex items-center justify-center mx-auto">
                      ✓
                    </div>
                    <span className="font-semibold text-emerald-400">Payment Authorized</span>
                  </div>
                  <div className="space-y-1">
                    <div className="w-7 h-7 rounded-full bg-amber-400 text-stone-950 font-bold flex items-center justify-center mx-auto animate-pulse">
                      2
                    </div>
                    <span className="font-semibold text-amber-300">Goldsmith Bench</span>
                  </div>
                  <div className="space-y-1">
                    <div className="w-7 h-7 rounded-full bg-stone-700 text-stone-400 font-bold flex items-center justify-center mx-auto">
                      3
                    </div>
                    <span className="text-stone-400">Hallmarking</span>
                  </div>
                  <div className="space-y-1">
                    <div className="w-7 h-7 rounded-full bg-stone-700 text-stone-400 font-bold flex items-center justify-center mx-auto">
                      4
                    </div>
                    <span className="text-stone-400">Insured Delivery</span>
                  </div>
                </div>
              </div>

              {/* Formal Itemized Invoice Card */}
              <div id="printable-invoice" className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm space-y-4">
                <div className="flex justify-between items-start border-b border-stone-200 pb-4">
                  <div>
                    <h4 className="text-lg font-serif-luxury font-bold tracking-widest text-stone-900">
                      AURA ATELIER
                    </h4>
                    <p className="text-[11px] text-stone-500">Fine Handmade Jewelry & Bespoke Gemstones</p>
                    <p className="text-[10px] text-stone-400">Kyoto / Florence / San Francisco</p>
                  </div>
                  <div className="text-right text-xs">
                    <p className="font-mono font-bold text-stone-900">INVOICE #{lastCompletedOrder.orderNumber}</p>
                    <p className="text-stone-400 text-[11px]">
                      Date: {new Date(lastCompletedOrder.createdAt).toLocaleDateString()}
                    </p>
                    <p className="text-emerald-700 font-semibold text-[11px]">Status: PAID (Approved)</p>
                  </div>
                </div>

                {/* Items Table */}
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-stone-200 text-stone-400 text-[10px] uppercase font-mono">
                      <th className="py-2">Item Description</th>
                      <th className="py-2 text-center">Qty</th>
                      <th className="py-2 text-right">Unit Price</th>
                      <th className="py-2 text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {lastCompletedOrder.items.map((item, idx) => (
                      <tr key={idx} className="py-2">
                        <td className="py-2.5">
                          <p className="font-medium text-stone-900">{item.productName}</p>
                          <p className="text-[10px] text-stone-500">{item.metalName} • {item.gemstoneName}</p>
                          {item.selectedSize && (
                            <p className="text-[10px] text-stone-600 font-mono">Ring Size: US {item.selectedSize}</p>
                          )}
                          {item.customEngraving && (
                            <p className="text-[10px] text-amber-900 italic font-serif">Engraving: "{item.customEngraving}"</p>
                          )}
                        </td>
                        <td className="py-2.5 text-center font-mono">{item.quantity}</td>
                        <td className="py-2.5 text-right font-mono">{formatPrice(item.price)}</td>
                        <td className="py-2.5 text-right font-mono font-semibold">{formatPrice(item.price * item.quantity)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* Invoice Totals */}
                <div className="pt-3 border-t border-stone-200 flex justify-end">
                  <div className="w-64 space-y-1.5 text-xs text-stone-600">
                    <div className="flex justify-between">
                      <span>Subtotal</span>
                      <span>{formatPrice(lastCompletedOrder.subtotal)}</span>
                    </div>
                    {lastCompletedOrder.discount > 0 && (
                      <div className="flex justify-between text-amber-800">
                        <span>Discount ({lastCompletedOrder.couponCode})</span>
                        <span>-{formatPrice(lastCompletedOrder.discount)}</span>
                      </div>
                    )}
                    {lastCompletedOrder.giftWrap && (
                      <div className="flex justify-between">
                        <span>Gift Velvet Box</span>
                        <span>{formatPrice(15)}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span>Insured Courier</span>
                      <span>{lastCompletedOrder.shippingFee === 0 ? 'Complimentary' : formatPrice(lastCompletedOrder.shippingFee)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Sales Tax (7.25%)</span>
                      <span>{formatPrice(lastCompletedOrder.tax)}</span>
                    </div>
                    <div className="flex justify-between text-sm font-serif-luxury font-bold text-stone-950 pt-2 border-t border-stone-200">
                      <span>Total Paid</span>
                      <span>{formatPrice(lastCompletedOrder.total)}</span>
                    </div>
                  </div>
                </div>

                {/* Transaction auth footprint */}
                <div className="p-3 bg-stone-50 rounded-xl text-[10px] text-stone-500 font-mono flex justify-between items-center">
                  <span>Auth ID: {lastCompletedOrder.paymentTransactionId}</span>
                  <span>Payment Gateway: Visa/Mastercard Network Verified</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
                <button
                  onClick={handlePrintInvoice}
                  className="w-full sm:w-auto px-5 py-2.5 border border-stone-300 hover:bg-stone-100 rounded-full text-xs font-medium text-stone-700 flex items-center justify-center gap-2 transition"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Formal Receipt</span>
                </button>

                <button
                  onClick={handleClose}
                  className="w-full sm:w-auto px-8 py-3 bg-stone-900 hover:bg-stone-800 text-amber-200 font-semibold text-xs rounded-full transition shadow-md"
                >
                  Return to Atelier Boutique
                </button>
              </div>

            </div>
          )}

        </div>

      </div>
    </div>
  );
};
