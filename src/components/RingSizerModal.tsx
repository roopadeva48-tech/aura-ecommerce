import React, { useState } from 'react';
import { useShop } from '../context/ShopContext';
import { X, Compass, Check, HelpCircle, Ruler, Printer } from 'lucide-react';

export const RingSizerModal: React.FC = () => {
  const { isRingSizerOpen, setIsRingSizerOpen } = useShop();

  // Diameter in mm for the interactive circle
  const [diameterMm, setDiameterMm] = useState(17.3); // Default US size 7

  if (!isRingSizerOpen) return null;

  // Conversion table
  const sizeChart = [
    { us: '4', uk: 'H 1/2', eu: '47', jp: '7', mm: 14.9 },
    { us: '5', uk: 'J 1/2', eu: '49', jp: '9', mm: 15.7 },
    { us: '6', uk: 'M', eu: '52', jp: '12', mm: 16.5 },
    { us: '7', uk: 'O', eu: '54', jp: '14', mm: 17.3 },
    { us: '8', uk: 'Q', eu: '57', jp: '16', mm: 18.1 },
    { us: '9', uk: 'S', eu: '59', jp: '18', mm: 18.9 },
    { us: '10', uk: 'T 1/2', eu: '62', jp: '20', mm: 19.8 },
    { us: '11', uk: 'V 1/2', eu: '65', jp: '23', mm: 20.6 },
    { us: '12', uk: 'Y', eu: '67', jp: '25', mm: 21.4 },
  ];

  // Find nearest US size
  const nearestSize = sizeChart.reduce((prev, curr) =>
    Math.abs(curr.mm - diameterMm) < Math.abs(prev.mm - diameterMm) ? curr : prev
  );

  return (
    <div
      id="ring-sizer-backdrop"
      className="fixed inset-0 z-50 bg-stone-950/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto"
      onClick={() => setIsRingSizerOpen(false)}
    >
      <div
        id="ring-sizer-panel"
        className="relative bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden my-4 border border-stone-200 flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-stone-900 text-stone-100 p-5 flex items-center justify-between border-b border-stone-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-serif-luxury font-medium tracking-wide">
                Interactive Atelier Ring Sizing Guide
              </h3>
              <p className="text-xs text-stone-400">
                Match your ring diameter directly on-screen or reference our international scale
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsRingSizerOpen(false)}
            className="p-1.5 text-stone-400 hover:text-white rounded-full hover:bg-stone-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* Interactive Screen Circle Matcher */}
          <div className="bg-stone-50 p-6 rounded-2xl border border-stone-200 text-center space-y-4">
            <h4 className="text-xs font-semibold text-stone-900 uppercase tracking-wider">
              1. On-Screen Ring Overlay Matcher
            </h4>
            <p className="text-xs text-stone-500 max-w-md mx-auto">
              Place a ring that fits you comfortably over the golden circle below. Adjust the slider until the circle edges align flush with the <strong>inside edge</strong> of your ring.
            </p>

            {/* Visual Ring Circle */}
            <div className="py-6 flex items-center justify-center">
              <div
                className="rounded-full border-4 border-amber-500 bg-amber-100/40 shadow-inner flex items-center justify-center transition-all duration-150 relative"
                style={{
                  width: `${diameterMm * 4.2}px`,
                  height: `${diameterMm * 4.2}px`,
                }}
              >
                <div className="text-[11px] font-mono font-bold text-amber-950">
                  {diameterMm.toFixed(1)} mm
                </div>
              </div>
            </div>

            {/* Slider */}
            <div className="max-w-xs mx-auto space-y-1">
              <input
                type="range"
                min="14.0"
                max="22.5"
                step="0.1"
                value={diameterMm}
                onChange={(e) => setDiameterMm(parseFloat(e.target.value))}
                className="w-full h-2 bg-stone-200 rounded-lg appearance-none cursor-pointer accent-stone-900"
              />
              <div className="flex justify-between text-[10px] text-stone-400 font-mono">
                <span>14.0 mm</span>
                <span>Adjust Diameter</span>
                <span>22.5 mm</span>
              </div>
            </div>

            {/* Result Box */}
            <div className="p-3 bg-white rounded-xl border border-amber-300 max-w-sm mx-auto shadow-xs">
              <span className="text-[10px] uppercase font-mono text-stone-400 block">Matched Size Result</span>
              <p className="text-xl font-serif-luxury font-bold text-stone-950">
                US Size {nearestSize.us} <span className="text-xs font-mono font-normal text-stone-500">(UK {nearestSize.uk} / EU {nearestSize.eu})</span>
              </p>
            </div>
          </div>

          {/* International Conversion Table */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold text-stone-900 uppercase tracking-wider">
              2. International Ring Size Conversion Chart
            </h4>

            <div className="overflow-x-auto rounded-xl border border-stone-200">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-stone-100 border-b border-stone-200 text-stone-600 font-mono text-[10px] uppercase">
                    <th className="py-2.5 px-3">US / Canada</th>
                    <th className="py-2.5 px-3">UK / Australia</th>
                    <th className="py-2.5 px-3">Europe</th>
                    <th className="py-2.5 px-3">Japan</th>
                    <th className="py-2.5 px-3">Inside Diameter</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 font-mono">
                  {sizeChart.map((row) => (
                    <tr
                      key={row.us}
                      className={nearestSize.us === row.us ? 'bg-amber-100/70 font-bold text-amber-950' : 'hover:bg-stone-50'}
                    >
                      <td className="py-2 px-3">US {row.us}</td>
                      <td className="py-2 px-3">{row.uk}</td>
                      <td className="py-2 px-3">{row.eu}</td>
                      <td className="py-2 px-3">{row.jp}</td>
                      <td className="py-2 px-3">{row.mm} mm</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pro Tips Box */}
          <div className="p-4 bg-stone-50 rounded-xl border border-stone-200 text-xs text-stone-600 space-y-2">
            <h5 className="font-semibold text-stone-800 flex items-center gap-1.5">
              <HelpCircle className="w-3.5 h-3.5 text-amber-700" />
              Master Goldsmith Sizing Tips
            </h5>
            <ul className="list-disc list-inside space-y-1 text-[11px] leading-relaxed text-stone-600">
              <li><strong>Time of Day:</strong> Fingers are typically slightly larger in the evening and warmer temperatures. Measure at the end of the day.</li>
              <li><strong>Knuckle Size:</strong> If your knuckle is significantly larger than the base of your finger, measure both and choose a size midway.</li>
              <li><strong>Free Resizing:</strong> Aura Atelier provides 1 complimentary ring resizing within 60 days of your purchase on all solid gold and platinum bands.</li>
            </ul>
          </div>

        </div>
      </div>
    </div>
  );
};
