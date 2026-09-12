'use client';

import React from 'react';
import { Flame, Map, Heart, Bell, User, Building2, ShieldAlert } from 'lucide-react';

export type AppTab = 'swipe' | 'map' | 'favorites' | 'alerts' | 'owner' | 'admin';

interface MobileTabBarProps {
  activeTab: AppTab;
  onTabChange: (tab: AppTab) => void;
  favoritesCount: number;
  unreadAlertsCount: number;
  /** Rôle vérifié côté serveur : l'onglet Admin est masqué sans habilitation. */
  canAccessAdmin?: boolean;
}

export const MobileTabBar: React.FC<MobileTabBarProps> = ({
  activeTab,
  onTabChange,
  favoritesCount,
  unreadAlertsCount,
  canAccessAdmin = false
}) => {
  const tabs = [
    { id: 'swipe' as AppTab, label: 'Swipe', icon: Flame },
    { id: 'map' as AppTab, label: 'Carte', icon: Map },
    { id: 'favorites' as AppTab, label: 'Favoris', icon: Heart, badge: favoritesCount },
    { id: 'alerts' as AppTab, label: 'Alertes', icon: Bell, badge: unreadAlertsCount },
    { id: 'owner' as AppTab, label: 'Espace Pro', icon: Building2 },
    ...(canAccessAdmin ? [{ id: 'admin' as AppTab, label: 'Admin', icon: ShieldAlert }] : [])
  ];

  return (
    <nav
      id="mobile-tab-bar"
      className="fixed bottom-0 left-0 right-0 z-40 bg-[#0F1115]/95 backdrop-blur-md border-t border-white/10 pb-[env(safe-area-inset-bottom,0px)]"
    >
      <div className="max-w-md mx-auto flex items-center justify-around h-16 px-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              id={`tab-btn-${tab.id}`}
              onClick={() => onTabChange(tab.id)}
              className={`flex-1 flex flex-col items-center justify-center py-1 relative transition-colors ${
                isActive
                  ? 'text-[#FF5A2D] font-bold'
                  : 'text-gray-500 hover:text-gray-300 font-medium'
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 transition-transform ${isActive ? 'scale-110 drop-shadow-[0_0_8px_rgba(255,90,45,0.4)]' : ''}`} />
                {tab.badge && tab.badge > 0 ? (
                  <span className="absolute -top-1.5 -right-2.5 px-1 min-w-[16px] h-4 rounded-full bg-[#FF5A2D] text-white text-[9px] font-extrabold flex items-center justify-center shadow-[0_0_8px_rgba(255,90,45,0.6)]">
                    {tab.badge}
                  </span>
                ) : null}
              </div>
              <span className="text-[10px] tracking-tight mt-1 truncate max-w-[56px]">
                {tab.label}
              </span>
              {isActive && (
                <span className="w-5 h-0.5 rounded-full bg-[#FF5A2D] shadow-[0_0_6px_#FF5A2D] mt-0.5" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};