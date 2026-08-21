import React, { useState } from 'react';
import { useShop } from '../context/ShopContext';
import {
  Sparkles,
  ShieldCheck,
  Hammer,
  Truck,
  RotateCcw,
  Mail,
  Check,
  Heart,
  Lock,
  Layers
} from 'lucide-react';

export const Footer: React.FC = () => {
  const { applyCoupon, addToast, setIsInventoryManagerOpen } = useShop();
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail.trim()) return;
    setIsSubscribed(true);
    addToast(
      'success',
      'Welcome to Private Atelier Circle',
      'Use code ARTISAN10 for $10% off your first heirloom order!'
    );
  };

  return (
    <footer id="atelier-footer" className="bg-stone-950 text-stone-200 border-t border-stone-800 pt-16 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Core Atelier Pillars / Value propositions */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pb-12 border-b border-stone-800">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
              <Hammer className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <h4 className="text-sm font-serif-luxury font-medium text-stone-100">Pure Hand-Forged Craft</h4>
              <p className="text-xs text-stone-400 leading-relaxed">
                Every piece is individually hand-shaped, set, and hallmarked by master bench goldsmiths.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <h4 className="text-sm font-serif-luxury font-medium text-stone-100">Conflict-Free & Certified</h4>
              <p className="text-xs text-stone-400 leading-relaxed">
                100% recycled 18K solid gold, 950 platinum, and ethically sourced Kimberly-certified gems.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
              <Truck className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <h4 className="text-sm font-serif-luxury font-medium text-stone-100">Insured Delivery & Vault Box</h4>
              <p className="text-xs text-stone-400 leading-relaxed">
                Complimentary insured courier over $150 in our custom keepsake jewelry presentation casing.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
              <RotateCcw className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <h4 className="text-sm font-serif-luxury font-medium text-stone-100">Complimentary Resizing</h4>
              <p className="text-xs text-stone-400 leading-relaxed">
                60-day complimentary ring resizing service and lifetime cleaning warranty.
              </p>
            </div>
          </div>
        </div>

        {/* Links & Newsletter */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 pb-12 border-b border-stone-800 text-xs">
          
          {/* Brand Col */}
          <div className="md:col-span-4 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-amber-600 via-amber-400 to-amber-200 flex items-center justify-center shadow-md">
                <Sparkles className="w-4 h-4 text-stone-950" />
              </div>
              <span className="font-serif-luxury text-lg tracking-[0.2em] font-medium text-stone-100 uppercase">
                Aura Atelier
              </span>
            </div>
            <p className="text-stone-400 leading-relaxed max-w-sm">
              Contemporary fine jewelry shaped by centuries of goldsmithing heritage. Designed to become the heirlooms of tomorrow.
            </p>
            <div className="flex items-center gap-4 text-stone-400 font-mono text-[11px]">
              <span>KYOTO</span>
              <span>•</span>
              <span>FLORENCE</span>
              <span>•</span>
              <span>SAN FRANCISCO</span>
            </div>
          </div>

          {/* Collections */}
          <div className="md:col-span-2 space-y-3">
            <h5 className="font-semibold text-stone-100 uppercase tracking-wider text-[11px]">Atelier Collections</h5>
            <ul className="space-y-2 text-stone-400">
              <li><a href="#atelier-catalog" className="hover:text-amber-300 transition">Solitaire Rings</a></li>
              <li><a href="#atelier-catalog" className="hover:text-amber-300 transition">Pendants & Necklaces</a></li>
              <li><a href="#atelier-catalog" className="hover:text-amber-300 transition">Earrings & Huggies</a></li>
              <li><a href="#atelier-catalog" className="hover:text-amber-300 transition">Bridal & Heirlooms</a></li>
              <li><a href="#atelier-catalog" className="hover:text-amber-300 transition">Bespoke Commissions</a></li>
            </ul>
          </div>

          {/* Client Concierge */}
          <div className="md:col-span-2 space-y-3">
            <h5 className="font-semibold text-stone-100 uppercase tracking-wider text-[11px]">Client Concierge</h5>
            <ul className="space-y-2 text-stone-400">
              <li><span className="text-stone-400">Insured Delivery Track</span></li>
              <li><span className="text-stone-400">Ring Size Guide</span></li>
              <li><span className="text-stone-400">Gemstone Authenticity</span></li>
              <li><span className="text-stone-400">Care & Cleansing</span></li>
              <li><span className="text-stone-400">Lifetime Warranty</span></li>
            </ul>
          </div>

          {/* Newsletter Subscription */}
          <div className="md:col-span-4 space-y-3">
            <h5 className="font-semibold text-stone-100 uppercase tracking-wider text-[11px]">
              Join the Private Atelier Circle
            </h5>
            <p className="text-stone-400">
              Receive private invitations to limited jewelry drops, gemstone releases, and receive $10% off your initial order.
            </p>

            {isSubscribed ? (
              <div className="p-3 bg-amber-950/60 border border-amber-800 rounded-xl text-amber-200 flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-400" />
                <span>You're enrolled! Use code <strong className="font-mono text-white">ARTISAN10</strong> at checkout.</span>
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="flex gap-2">
                <input
                  type="email"
                  required
                  value={newsletterEmail}
                  onChange={(e) => setNewsletterEmail(e.target.value)}
                  placeholder="Enter your email address..."
                  className="flex-1 px-3 py-2 bg-stone-900 border border-stone-700 rounded-lg text-stone-100 placeholder-stone-500 focus:outline-none focus:border-amber-500"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-stone-950 font-semibold rounded-lg transition"
                >
                  Join
                </button>
              </form>
            )}
          </div>

        </div>

        {/* Bottom Bar: Copyright & Admin Portal Trigger */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-stone-500">
          <div className="flex items-center gap-4">
            <p>© {new Date().getFullYear()} Aura Atelier Inc. All rights reserved.</p>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Lock className="w-3 h-3 text-stone-400" /> 256-Bit SSL PCI Compliant
            </span>
          </div>

          {/* Workshop Staff Inventory Trigger */}
          <button
            id="btn-footer-inventory-manager"
            onClick={() => setIsInventoryManagerOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-stone-900 hover:bg-stone-800 text-stone-400 hover:text-amber-200 border border-stone-800 transition font-mono text-[11px]"
          >
            <Layers className="w-3.5 h-3.5 text-amber-500" />
            <span>Staff Workshop Command (Live Inventory)</span>
          </button>
        </div>

      </div>
    </footer>
  );
};
