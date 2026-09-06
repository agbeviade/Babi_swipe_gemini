'use client';

import React, { useState } from 'react';
import { Download, Share2, X, Smartphone } from 'lucide-react';
import { usePWAInstall } from '@/hooks/usePWAInstall';

export const PWAInstallButton: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  // Hide if already running in standalone mode
  if (isInstalled) {
    return null;
  }

  if (isInstallable) {
    return (
      <button
        id="pwa-install-btn"
        onClick={install}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#FF5A2D] hover:bg-[#FF5A2D]/90 text-white text-xs font-semibold shadow-[0_0_12px_rgba(255,90,45,0.4)] transition active:scale-95 whitespace-nowrap"
      >
        <Download className="w-3.5 h-3.5" />
        <span>Installer l’App</span>
      </button>
    );
  }

  if (isIOS) {
    return (
      <>
        <button
          id="pwa-install-ios-btn"
          onClick={() => setShowIOSGuide(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 text-white hover:bg-white/15 text-xs font-semibold border border-white/10 transition whitespace-nowrap"
        >
          <Smartphone className="w-3.5 h-3.5 text-[#FF5A2D]" />
          <span>Installer PWA</span>
        </button>

        {showIOSGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4">
            <div className="w-full max-w-sm rounded-3xl bg-[#16181D] border border-white/10 p-6 shadow-2xl text-white animate-in fade-in zoom-in duration-200">
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-[#FF5A2D] flex items-center justify-center text-white font-black text-xs shadow-sm">
                    BABI
                  </div>
                  <h3 className="font-bold text-base text-white">Installer sur iPhone / iPad</h3>
                </div>
                <button
                  onClick={() => setShowIOSGuide(false)}
                  className="p-1.5 rounded-full hover:bg-white/10 text-gray-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="mt-4 space-y-3 text-sm text-gray-300">
                <div className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-[#FF5A2D] text-white font-bold text-xs flex items-center justify-center">1</span>
                  <p>
                    Touchez l’icône <strong>Partager</strong> <Share2 className="w-4 h-4 inline text-[#FF5A2D] mx-1" /> dans la barre de Safari en bas.
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-[#FF5A2D] text-white font-bold text-xs flex items-center justify-center">2</span>
                  <p>
                    Faites défiler vers le bas et sélectionnez <strong className="text-white">Sur l’écran d’accueil</strong>.
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-[#FF5A2D] text-white font-bold text-xs flex items-center justify-center">3</span>
                  <p>
                    Profitez de BABI SWIPE IMMO en plein écran avec performances natives !
                  </p>
                </div>
              </div>

              <button
                onClick={() => setShowIOSGuide(false)}
                className="mt-6 w-full py-3 rounded-2xl bg-[#FF5A2D] text-white font-bold text-sm hover:bg-[#FF5A2D]/90 shadow-[0_0_15px_rgba(255,90,45,0.4)] transition active:scale-98"
              >
                C’est compris
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  return null;
};