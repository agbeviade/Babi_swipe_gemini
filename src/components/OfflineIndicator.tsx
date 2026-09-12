'use client';

import React, { useEffect, useState } from 'react';
import { WifiOff } from 'lucide-react';

export const OfflineIndicator: React.FC = () => {
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (isOnline) return null;

  return (
    <div
      id="offline-indicator"
      className="fixed bottom-20 left-4 right-4 z-50 flex items-center justify-center gap-2 rounded-xl bg-amber-600/95 backdrop-blur-xs px-4 py-2.5 text-xs font-medium text-white shadow-lg animate-in slide-in-from-bottom"
    >
      <WifiOff className="w-4 h-4 animate-pulse flex-shrink-0" />
      <span>Mode hors-ligne • Données en cache optimisées pour réseau ivoirien.</span>
    </div>
  );
};