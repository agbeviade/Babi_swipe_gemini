'use client';

import React, { useState } from 'react';
import { Sparkles, X, ArrowRight, Search, CheckCircle2, MessageSquare } from 'lucide-react';
import { parseBabiAiQuery, AI_SAMPLE_PROMPTS } from '@/services/babiAiService';
import { UserPreferences, Property } from '@/types';
import { formatFCFA } from '@/services/budgetService';

interface BabiAiModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyAiFilter: (newPreferences: Partial<UserPreferences>, querySummary: string) => void;
  propertiesCount: number;
}

export const BabiAiModal: React.FC<BabiAiModalProps> = ({
  isOpen,
  onClose,
  onApplyAiFilter,
  propertiesCount
}) => {
  const [query, setQuery] = useState('');
  const [parsedPreview, setParsedPreview] = useState<ReturnType<typeof parseBabiAiQuery> | null>(null);

  if (!isOpen) return null;

  const handleInputChange = (text: string) => {
    setQuery(text);
    if (text.trim().length >= 3) {
      const res = parseBabiAiQuery(text);
      setParsedPreview(res);
    } else {
      setParsedPreview(null);
    }
  };

  const handleSelectSample = (sample: string) => {
    setQuery(sample);
    const res = parseBabiAiQuery(sample);
    setParsedPreview(res);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    const parsed = parseBabiAiQuery(query);
    const ext = parsed.extracted;
    const updates: Partial<UserPreferences> = {};

    if (ext.commune) updates.communes = [ext.commune];
    if (ext.propertyType) updates.propertyTypes = [ext.propertyType];
    if (ext.budgetMax) updates.budgetMax = ext.budgetMax;
    if (ext.features && ext.features.length > 0) updates.features = ext.features;
    if (ext.transaction) updates.transaction = ext.transaction;

    onApplyAiFilter(updates, query);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4">
      <div
        id="babi-ai-modal"
        className="w-full max-w-md bg-[#16181D] border border-white/10 rounded-3xl shadow-2xl overflow-hidden flex flex-col text-white animate-in zoom-in-95 duration-200"
      >
        {/* Header with Sleek Accent */}
        <div className="p-5 bg-gradient-to-r from-[#16181D] to-[#0F1115] border-b border-white/10 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#FF5A2D] text-white flex items-center justify-center shadow-[0_0_15px_rgba(255,90,45,0.4)] font-black text-base">
              <Sparkles className="w-5 h-5 text-white animate-pulse" />
            </div>
            <div>
              <h3 className="font-black text-lg tracking-tight text-white">Babi AI Search</h3>
              <p className="text-xs text-gray-400">
                Recherche en langage naturel adaptée à Abidjan
              </p>
            </div>
          </div>
        </div>

        {/* Input Form */}
        <div className="p-5 space-y-4">
          <form onSubmit={handleSubmit} className="relative">
            <input
              type="text"
              autoFocus
              value={query}
              onChange={(e) => handleInputChange(e.target.value)}
              placeholder="Ex: Studio Cocody moins de 200 000 avec balcon"
              className="w-full pl-11 pr-12 py-3.5 rounded-2xl border border-white/10 bg-[#0F1115] text-white text-sm font-medium placeholder-gray-500 focus:outline-none focus:border-[#FF5A2D]"
            />
            <Search className="w-5 h-5 text-[#FF5A2D] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <button
              type="submit"
              disabled={!query.trim()}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-xl bg-[#FF5A2D] hover:bg-[#FF5A2D]/90 text-white disabled:opacity-30 transition shadow-[0_0_10px_rgba(255,90,45,0.4)]"
            >
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Real-time AI Extracted Entities Breakdown */}
          {parsedPreview && (
            <div className="p-3.5 rounded-2xl bg-[#FF5A2D]/10 border border-[#FF5A2D]/30 text-xs space-y-2 animate-in fade-in">
              <div className="flex items-center gap-1.5 font-bold text-[#FF5A2D] text-[11px] uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5 text-[#FFD700]" />
                <span>Critères identifiés par l'IA :</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {parsedPreview.extracted.commune && (
                  <span className="px-2.5 py-1 rounded-xl bg-white/10 font-semibold text-white">
                    📍 {parsedPreview.extracted.commune}
                  </span>
                )}
                {parsedPreview.extracted.propertyType && (
                  <span className="px-2.5 py-1 rounded-xl bg-white/10 font-semibold text-white">
                    🏠 {parsedPreview.extracted.propertyType.toUpperCase()}
                  </span>
                )}
                {parsedPreview.extracted.budgetMax && (
                  <span className="px-2.5 py-1 rounded-xl bg-white/10 font-semibold text-[#FFD700]">
                    💰 Max {formatFCFA(parsedPreview.extracted.budgetMax)}
                  </span>
                )}
                {parsedPreview.extracted.features && parsedPreview.extracted.features.map((f) => (
                  <span
                    key={f}
                    className="px-2.5 py-1 rounded-xl bg-white/10 font-semibold text-white"
                  >
                    ✓ {f}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Quick Prompts Suggestions */}
          <div>
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-2">
              Suggestions populaires :
            </span>
            <div className="space-y-1.5">
              {AI_SAMPLE_PROMPTS.map((sample, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSelectSample(sample)}
                  className="w-full text-left p-3 rounded-2xl border border-white/5 bg-white/5 hover:bg-white/10 hover:border-[#FF5A2D]/50 text-xs text-gray-200 transition flex items-center justify-between"
                >
                  <span className="line-clamp-1">"{sample}"</span>
                  <ArrowRight className="w-3.5 h-3.5 text-gray-400 flex-shrink-0 ml-1" />
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer Apply Button */}
        <div className="p-4 bg-[#0F1115] border-t border-white/10 flex items-center justify-between">
          <span className="text-xs text-gray-400">
            {propertiesCount} annonces cataloguées
          </span>
          <button
            onClick={handleSubmit}
            disabled={!query.trim()}
            className="px-5 py-2.5 rounded-xl bg-[#FF5A2D] hover:bg-[#FF5A2D]/90 disabled:opacity-40 text-white font-bold text-xs transition shadow-[0_0_15px_rgba(255,90,45,0.4)] active:scale-95"
          >
            Appliquer la recherche
          </button>
        </div>
      </div>
    </div>
  );
};