'use client';

import React from 'react';
import { Sparkles, Coins, Filter, ShieldCheck } from 'lucide-react';
import { PWAInstallButton } from '@/components/PWAInstallButton';

interface NavbarProps {
  coinBalance: number;
  onOpenCoins: () => void;
  onOpenAiSearch: () => void;
  onOpenFilters: () => void;
  isPriorityActive: boolean;
  activeTab: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  coinBalance,
  onOpenCoins,
  onOpenAiSearch,
  onOpenFilters,
  isPriorityActive
}) => {
  return (
    <header
      id="app-navbar"
      className="sticky top-0 z-40 w-full bg-[#0F1115]/90 backdrop-blur-md border-b border-white/10 text-white"
    >
      <div className="max-w-md mx-auto px-4 h-14 flex items-center justify-between">
        {/* Brand Logo & Slogan */}
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-[#FF5A2D] flex items-center justify-center text-white font-extrabold text-sm shadow-[0_0_20px_rgba(255,90,45,0.4)]">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
              <polyline points="9 22 9 12 15 12 15 22"></polyline>
            </svg>
          </div>
          <div>
            <div className="flex items-center gap-1">
              <span className="font-extrabold tracking-tight text-sm text-white">
                BABI SWIPE
              </span>
              <span className="text-sm font-extrabold text-[#FF5A2D]">
                IMMO
              </span>
            </div>
            <span className="block text-[10px] text-gray-400 font-medium -mt-0.5">
              Abidjan & environs
            </span>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {/* PWA Install Button */}
          <PWAInstallButton />

          {/* Babi AI Prompt Button */}
          <button
            id="open-babi-ai-btn"
            onClick={onOpenAiSearch}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-white/5 hover:bg-white/10 text-gray-200 hover:text-white text-xs font-semibold border border-white/10 transition active:scale-95"
            title="Assistant Babi AI"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#FF5A2D] animate-pulse" />
            <span className="hidden xs:inline text-[11px] tracking-wide font-bold">Babi AI</span>
          </button>

          {/* Babi Coins Balance Pill */}
          <button
            id="babi-coins-pill"
            onClick={onOpenCoins}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-white/5 hover:bg-white/10 text-white text-xs font-bold border border-white/10 hover:border-[#FFD700]/50 transition active:scale-95"
            title="Acheter ou gérer mes Babi Coins"
          >
            <Coins className="w-3.5 h-3.5 text-[#FFD700]" />
            <span className="font-mono text-xs">{coinBalance}</span>
            {isPriorityActive && (
              <span className="w-2 h-2 rounded-full bg-[#4CAF50] animate-ping" title="Priorité active" />
            )}
          </button>

          {/* Filter Trigger Button */}
          <button
            id="open-filters-btn"
            onClick={onOpenFilters}
            className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white border border-white/10 transition active:scale-95"
            title="Affiner les critères"
          >
            <Filter className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};