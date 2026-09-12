'use client';

import React, { useState, useMemo } from 'react';
import {
  MapPin,
  Navigation,
  Sparkles,
  Layers,
  ZoomIn,
  ZoomOut,
  Bed,
  Bath,
  Maximize,
  ArrowRight,
  ShieldCheck,
  Zap
} from 'lucide-react';
import { Property, UserPreferences } from '@/types';
import { formatFCFA } from '@/services/budgetService';
import { formatDistance, DEFAULT_ABIDJAN_CENTER } from '@/services/geoService';

interface MapViewProps {
  properties: Property[];
  userPreferences: UserPreferences;
  onSelectProperty: (property: Property) => void;
  onRefreshLocation: () => void;
}

export const MapView: React.FC<MapViewProps> = ({
  properties,
  userPreferences,
  onSelectProperty,
  onRefreshLocation
}) => {
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(properties[0] || null);
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [mapCenter, setMapCenter] = useState<{ lat: number; lng: number }>({
    lat: userPreferences.userLat || DEFAULT_ABIDJAN_CENTER.latitude,
    lng: userPreferences.userLng || DEFAULT_ABIDJAN_CENTER.longitude
  });

  // Map coordinate projection bounds for Abidjan Greater Area
  // Latitude: ~5.26 to 5.42 (North-South)
  // Longitude: ~-4.12 to -3.86 (West-East)
  const BOUNDS = {
    minLat: 5.27,
    maxLat: 5.41,
    minLng: -4.10,
    maxLng: -3.88
  };

  const projectToSvg = (lat: number, lng: number) => {
    const xPercent = ((lng - BOUNDS.minLng) / (BOUNDS.maxLng - BOUNDS.minLng)) * 100;
    // Invert Y because latitude goes North (up) but SVG coordinates go down
    const yPercent = (1 - (lat - BOUNDS.minLat) / (BOUNDS.maxLat - BOUNDS.minLat)) * 100;
    return {
      x: Math.max(5, Math.min(95, xPercent)),
      y: Math.max(5, Math.min(95, yPercent))
    };
  };

  const userSvgPos = useMemo(() => {
    return projectToSvg(
      userPreferences.userLat || DEFAULT_ABIDJAN_CENTER.latitude,
      userPreferences.userLng || DEFAULT_ABIDJAN_CENTER.longitude
    );
  }, [userPreferences.userLat, userPreferences.userLng]);

  return (
    <div id="map-view-container" className="relative w-full h-[calc(100vh-120px)] max-w-md mx-auto overflow-hidden bg-stone-900 select-none">
      {/* Interactive Vector Canvas / Map Stage */}
      <div className="relative w-full h-full bg-[#17202a] overflow-hidden">
        {/* SVG Decorative Lagoon & Roads of Abidjan */}
        <svg
          viewBox="0 0 1000 1000"
          className="w-full h-full object-cover transition-transform duration-300 pointer-events-none opacity-80"
          style={{ transform: `scale(${zoomLevel})` }}
        >
          {/* Ébrié Lagoon water shape */}
          <path
            d="M 50 620 C 180 580, 260 670, 390 640 C 470 620, 520 600, 590 630 C 680 670, 750 630, 950 680 L 950 780 C 820 800, 690 730, 540 760 C 420 780, 310 740, 50 790 Z"
            fill="#0f3b46"
            opacity="0.8"
          />
          <path
            d="M 320 640 C 370 580, 410 590, 450 640 C 430 700, 360 710, 320 640 Z"
            fill="#0f3b46"
          />
          {/* Main Boulevards & Bridges (HKB, De Gaulle, Houphouët) */}
          <line x1="430" y1="580" x2="440" y2="720" stroke="#f59e0b" strokeWidth="4" strokeDasharray="6 4" opacity="0.6" />
          <line x1="520" y1="590" x2="530" y2="740" stroke="#10b981" strokeWidth="5" opacity="0.6" />
          <line x1="100" y1="420" x2="880" y2="390" stroke="#334155" strokeWidth="6" opacity="0.5" />
          <line x1="480" y1="120" x2="510" y2="880" stroke="#334155" strokeWidth="6" opacity="0.5" />

          {/* Abidjan Communes Labels */}
          <text x="520" y="380" fill="#94a3b8" fontSize="26" fontWeight="bold" letterSpacing="2">COCODY</text>
          <text x="410" y="550" fill="#94a3b8" fontSize="24" fontWeight="bold" letterSpacing="2">PLATEAU</text>
          <text x="470" y="740" fill="#94a3b8" fontSize="24" fontWeight="bold" letterSpacing="2">MARCORY</text>
          <text x="180" y="440" fill="#94a3b8" fontSize="24" fontWeight="bold" letterSpacing="2">YOPOUGON</text>
          <text x="760" y="360" fill="#94a3b8" fontSize="24" fontWeight="bold" letterSpacing="2">BINGERVILLE</text>
        </svg>

        {/* User Geolocation Pulse Ring */}
        <div
          className="absolute z-20 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
          style={{ left: `${userSvgPos.x}%`, top: `${userSvgPos.y}%` }}
        >
          <div className="relative flex items-center justify-center">
            <span className="absolute w-12 h-12 rounded-full bg-[#FF5A2D]/30 animate-ping" />
            <span className="w-5 h-5 rounded-full bg-[#FF5A2D] border-2 border-white shadow-lg flex items-center justify-center">
              <span className="w-1.5 h-1.5 rounded-full bg-white" />
            </span>
          </div>
          <div className="mt-1 -ml-6 px-2 py-0.5 rounded-md bg-black/80 backdrop-blur-xs text-[9px] font-bold text-[#FF5A2D] text-center whitespace-nowrap shadow-xs border border-white/10">
            Ma position
          </div>
        </div>

        {/* Property Pins with Price Chips */}
        {properties.map((prop) => {
          const pos = projectToSvg(prop.latitude, prop.longitude);
          const isSelected = selectedProperty?.id === prop.id;
          return (
            <button
              key={prop.id}
              onClick={() => setSelectedProperty(prop)}
              className={`absolute z-30 -translate-x-1/2 -translate-y-1/2 transition-transform duration-200 ${
                isSelected ? 'scale-110 z-40' : 'hover:scale-105'
              }`}
              style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
            >
              <div
                className={`flex items-center gap-1 px-2.5 py-1 rounded-full shadow-lg font-extrabold text-[11px] whitespace-nowrap transition-all border ${
                  isSelected
                    ? 'bg-[#FF5A2D] text-white border-white ring-4 ring-[#FF5A2D]/40 shadow-xl'
                    : prop.isBoosted
                    ? 'bg-[#FFD700] text-black border-amber-300 font-black'
                    : 'bg-[#16181D] text-white border-white/20'
                }`}
              >
                {prop.isBoosted && <Zap className="w-3 h-3 fill-black" />}
                <span>
                  {prop.price >= 1000000
                    ? `${(prop.price / 1000000).toFixed(1)}M`
                    : `${Math.round(prop.price / 1000)}k`}
                </span>
              </div>
              <div
                className={`w-1.5 h-1.5 mx-auto rotate-45 -mt-0.5 ${
                  isSelected ? 'bg-[#FF5A2D]' : prop.isBoosted ? 'bg-[#FFD700]' : 'bg-[#16181D]'
                }`}
              />
            </button>
          );
        })}
      </div>

      {/* Floating Map Controls */}
      <div className="absolute top-4 right-4 z-30 flex flex-col gap-2">
        {/* Re-center / Geolocation Button */}
        <button
          onClick={onRefreshLocation}
          className="p-3 rounded-2xl bg-[#16181D]/90 text-[#FF5A2D] border border-white/10 backdrop-blur-md shadow-lg hover:scale-105 active:scale-95 transition"
          title="Recentrer sur ma position"
        >
          <Navigation className="w-5 h-5" />
        </button>

        {/* Zoom Controls */}
        <div className="flex flex-col bg-[#16181D]/90 backdrop-blur-md rounded-2xl shadow-lg overflow-hidden border border-white/10">
          <button
            onClick={() => setZoomLevel((z) => Math.min(2, z + 0.25))}
            className="p-2.5 text-gray-300 hover:bg-white/10 transition"
            title="Zoomer"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <div className="h-px bg-white/10" />
          <button
            onClick={() => setZoomLevel((z) => Math.max(0.8, z - 0.25))}
            className="p-2.5 text-gray-300 hover:bg-white/10 transition"
            title="Dézoomer"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Map Legend Overlay */}
      <div className="absolute top-4 left-4 z-30 flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-black/80 backdrop-blur-md text-white text-[10px] font-bold border border-white/10">
        <span className="w-2 h-2 rounded-full bg-[#FF5A2D]" />
        <span>{properties.length} logements dans votre zone</span>
      </div>

      {/* Bottom Selected Property Preview Card (Section 13) */}
      {selectedProperty && (
        <div
          id="map-preview-card"
          onClick={() => onSelectProperty(selectedProperty)}
          className="absolute bottom-20 left-3 right-3 z-30 p-3.5 rounded-[24px] bg-[#16181D] shadow-2xl border border-white/15 cursor-pointer animate-in slide-in-from-bottom duration-200 text-white"
        >
          <div className="flex gap-3">
            <img
              src={selectedProperty.images[0]?.url}
              alt={selectedProperty.title}
              className="w-24 h-24 rounded-2xl object-cover flex-shrink-0 border border-white/10"
            />
            <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-base font-black text-white font-mono">
                    {formatFCFA(selectedProperty.price)}
                  </span>
                  <span className="text-[10px] font-bold text-[#FF5A2D] bg-[#FF5A2D]/15 border border-[#FF5A2D]/30 px-2 py-0.5 rounded-md uppercase">
                    {selectedProperty.type}
                  </span>
                </div>
                <h4 className="text-xs font-bold text-gray-200 truncate mt-1">
                  {selectedProperty.title}
                </h4>
                <div className="flex items-center gap-1.5 text-[11px] text-gray-400 mt-1">
                  <MapPin className="w-3 h-3 text-[#FF5A2D] flex-shrink-0" />
                  <span className="truncate">{selectedProperty.commune}</span>
                  <span>•</span>
                  <span className="text-gray-300 font-semibold">
                    {formatDistance(selectedProperty.distanceKm)}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between text-[10px] text-gray-400 pt-2 border-t border-white/10">
                <span>
                  {selectedProperty.bedrooms} ch. • {selectedProperty.areaSqm} m²
                </span>
                <span className="text-[#FF5A2D] font-bold flex items-center gap-1">
                  <span>Voir la fiche</span>
                  <ArrowRight className="w-3 h-3" />
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};