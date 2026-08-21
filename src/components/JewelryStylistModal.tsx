import React, { useState } from 'react';
import { useShop } from '../context/ShopContext';
import { X, Sparkles, Send, Bot, User, ArrowRight, Heart } from 'lucide-react';

export const JewelryStylistModal: React.FC = () => {
  const { isStylistOpen, setIsStylistOpen, products, setSelectedProduct, formatPrice } = useShop();

  const [prompt, setPrompt] = useState('');
  const [occasion, setOccasion] = useState('Anniversary Celebration');
  const [budget, setBudget] = useState('$300 - $700');
  const [metal, setMetal] = useState('18K Yellow Gold');
  const [isConsulting, setIsConsulting] = useState(false);
  const [messages, setMessages] = useState<
    { role: 'user' | 'assistant'; text: string; recommendedIds?: string[] }[]
  >([
    {
      role: 'assistant',
      text: 'Welcome to the Aura Atelier Concierge. I am your Master Goldsmith & Jewelry Consultant. Tell me about the special occasion, outfit, or loved one you are celebrating, and I will recommend the ideal handcrafted heirloom pieces.',
    },
  ]);

  if (!isStylistOpen) return null;

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() && !occasion) return;

    const userText = prompt.trim() || `Looking for a recommendation for a ${occasion} with a budget of ${budget} in ${metal}.`;
    const newMessages = [...messages, { role: 'user' as const, text: userText }];
    setMessages(newMessages);
    setPrompt('');
    setIsConsulting(true);

    try {
      const res = await fetch('/api/ai-consultant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: userText,
          occasion,
          budget,
          metalPreference: metal,
        }),
      });

      const data = await res.json();
      setMessages([
        ...newMessages,
        {
          role: 'assistant',
          text: data.advice || 'Our goldsmiths recommend pairing an ethical solitaire gemstone with our hand-forged bands.',
        },
      ]);
    } catch (err) {
      setMessages([
        ...newMessages,
        {
          role: 'assistant',
          text: 'Thank you for consulting Aura Atelier. For your special celebration, our Celestial Solstice Ring and Verdant Meadow Emerald Pendant offer timeless elegance crafted with recycled solid gold.',
        },
      ]);
    } finally {
      setIsConsulting(false);
    }
  };

  return (
    <div
      id="stylist-modal-backdrop"
      className="fixed inset-0 z-50 bg-stone-950/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto"
      onClick={() => setIsStylistOpen(false)}
    >
      <div
        id="stylist-modal-panel"
        className="relative bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden my-4 border border-stone-200 flex flex-col h-[650px] max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-stone-900 text-stone-100 p-4 sm:p-5 flex items-center justify-between border-b border-stone-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-serif-luxury font-medium tracking-wide">
                Aura AI Atelier Stylist & Gift Concierge
              </h3>
              <p className="text-xs text-stone-400">
                Grounded in our live handmade gemstone catalog & metal craftsmanship
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsStylistOpen(false)}
            className="p-1.5 text-stone-400 hover:text-white rounded-full hover:bg-stone-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Preferences Chips */}
        <div className="bg-stone-50 p-3 border-b border-stone-200 grid grid-cols-3 gap-2 text-xs">
          <div>
            <label className="block text-[10px] uppercase font-mono text-stone-400 mb-1">Occasion</label>
            <select
              value={occasion}
              onChange={(e) => setOccasion(e.target.value)}
              className="w-full bg-white border border-stone-200 rounded p-1 text-[11px] focus:outline-none"
            >
              <option value="Anniversary Celebration">Anniversary</option>
              <option value="Wedding / Bridal">Wedding & Bridal</option>
              <option value="Milestone Birthday">Birthday Gift</option>
              <option value="Self-Reward Everyday Heirloom">Self-Reward Heirloom</option>
              <option value="Graduation / New Chapter">Graduation</option>
            </select>
          </div>

          <div>
            <label className="block text-[10px] uppercase font-mono text-stone-400 mb-1">Budget Target</label>
            <select
              value={budget}
              onChange={(e) => setBudget(e.target.value)}
              className="w-full bg-white border border-stone-200 rounded p-1 text-[11px] focus:outline-none"
            >
              <option value="Under $400">Under $400</option>
              <option value="$400 - $700">$400 - $700</option>
              <option value="$700 - $1,200">$700 - $1,200</option>
              <option value="$1,200+ Luxury">$1,200+ Luxury</option>
            </select>
          </div>

          <div>
            <label className="block text-[10px] uppercase font-mono text-stone-400 mb-1">Metal</label>
            <select
              value={metal}
              onChange={(e) => setMetal(e.target.value)}
              className="w-full bg-white border border-stone-200 rounded p-1 text-[11px] focus:outline-none"
            >
              <option value="18K Yellow Gold">18K Yellow Gold</option>
              <option value="14K Rose Gold">14K Rose Gold</option>
              <option value="925 Sterling Silver">925 Sterling Silver</option>
              <option value="Solid 950 Platinum">950 Platinum</option>
            </select>
          </div>
        </div>

        {/* Messages Scroll Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-stone-50/40">
          {messages.map((m, idx) => (
            <div
              key={idx}
              className={`flex gap-3 text-xs ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {m.role === 'assistant' && (
                <div className="w-7 h-7 rounded-full bg-stone-900 text-amber-300 flex items-center justify-center shrink-0">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div
                className={`p-3.5 rounded-2xl max-w-md leading-relaxed whitespace-pre-wrap ${
                  m.role === 'user'
                    ? 'bg-stone-900 text-amber-100 rounded-tr-xs'
                    : 'bg-white text-stone-800 border border-stone-200 rounded-tl-xs shadow-xs'
                }`}
              >
                {m.text}
              </div>

              {m.role === 'user' && (
                <div className="w-7 h-7 rounded-full bg-amber-600 text-white flex items-center justify-center shrink-0">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          ))}

          {isConsulting && (
            <div className="flex gap-3 text-xs items-center text-stone-500">
              <div className="w-7 h-7 rounded-full bg-stone-900 text-amber-300 flex items-center justify-center shrink-0">
                <Bot className="w-4 h-4" />
              </div>
              <div className="bg-white p-3 rounded-2xl border border-stone-200 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-amber-600 animate-ping" />
                <span>Consulting bench smiths and evaluating gemstone pairings...</span>
              </div>
            </div>
          )}
        </div>

        {/* Input Footer */}
        <form onSubmit={handleSendMessage} className="p-3 bg-white border-t border-stone-200 flex gap-2">
          <input
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Ask about stone meanings, ring pairings, or anniversary gifts..."
            className="flex-1 px-4 py-2.5 bg-stone-50 border border-stone-300 rounded-full text-xs text-stone-800 placeholder-stone-400 focus:outline-none focus:border-stone-900"
          />
          <button
            type="submit"
            disabled={isConsulting}
            className="px-5 py-2.5 bg-stone-900 hover:bg-amber-600 text-amber-200 hover:text-stone-950 text-xs font-semibold rounded-full transition flex items-center gap-1.5 disabled:opacity-40"
          >
            <span>Ask</span>
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>
      </div>
    </div>
  );
};
