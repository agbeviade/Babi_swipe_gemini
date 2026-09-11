'use client';

import React, { useState } from 'react';
import { motion, useMotionValue, useTransform, AnimatePresence } from 'motion/react';
import {
  Heart,
  X,
  RotateCcw,
  Info,
  MapPin,
  CheckCircle2,
  Sparkles,
  Bed,
  Bath,
  Maximize,
  Share2,
  Flame,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Zap
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Property, UserPreferences } from '@/types';
import { formatDistance } from '@/services/geoService';
import { formatFCFA, formatFCFAOrUnknown } from '@/services/budgetService';
import { calculateBabiScore } from '@/services/babiScoreService';

interface SwipeViewProps {
  properties: Property[];
  userPreferences: UserPreferences;
  onSwipe: (propertyId: string, direction: 'left' | 'right' | 'super') => void;
  onUndo: () => void;
  canUndo: boolean;
  onSelectProperty: (property: Property) => void;
  onResetSwipes: () => void;
  onOpenPreferences: () => void;
}

export const SwipeView: React.FC<SwipeViewProps> = ({
  properties,
  userPreferences,
  onSwipe,
  onUndo,
  canUndo,
  onSelectProperty,
  onResetSwipes,
  onOpenPreferences
}) => {
  const [currentImageIndex, setCurrentImageIndex] = useState<{ [propId: string]: number }>({});
  const [showMatchToast, setShowMatchToast] = useState<string | null>(null);

  const topProperty = properties[0];
  const nextProperty = properties[1];

  // Motion values for swipe drag
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-18, 18]);
  const opacityLike = useTransform(x, [20, 100], [0, 1]);
  const opacityPass = useTransform(x, [-20, -100], [0, 1]);
  const cardScale = useTransform(x, [-150, 0, 150], [0.95, 1, 0.95]);

  const handleDragEnd = (_: unknown, info: { offset: { x: number; y: number } }) => {
    if (!topProperty) return;
    const threshold = 90;
    if (info.offset.x > threshold) {
      triggerSwipe('right');
    } else if (info.offset.x < -threshold) {
      triggerSwipe('left');
    }
  };

  const triggerSwipe = (direction: 'left' | 'right' | 'super') => {
    if (!topProperty) return;

    if (direction === 'right' || direction === 'super') {
      try {
        confetti({
          particleCount: direction === 'super' ? 80 : 40,
          spread: 60,
          origin: { y: 0.7 }
        });
      } catch {
        // Fallback gracefully
      }
      setShowMatchToast(topProperty.title);
      setTimeout(() => setShowMatchToast(null), 2500);
    }

    onSwipe(topProperty.id, direction);
  };

  const handleNextPhoto = (e: React.MouseEvent, propId: string, totalPhotos: number) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => {
      const cur = prev[propId] || 0;
      return { ...prev, [propId]: (cur + 1) % totalPhotos };
    });
  };

  const handlePrevPhoto = (e: React.MouseEvent, propId: string, totalPhotos: number) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => {
      const cur = prev[propId] || 0;
      return { ...prev, [propId]: (cur - 1 + totalPhotos) % totalPhotos };
    });
  };

  // Empty state when all cards swiped
  if (!topProperty) {
    return (
      <div
        id="swipe-empty-state"
        className="flex flex-col items-center justify-center p-6 text-center h-[calc(100vh-140px)] max-w-md mx-auto animate-in fade-in"
      >
        <div className="w-20 h-20 rounded-2xl bg-[#1A1C22] border border-white/10 flex items-center justify-center text-[#FF5A2D] mb-4 shadow-[0_0_25px_rgba(255,90,45,0.2)]">
          <Flame className="w-10 h-10 text-[#FF5A2D] animate-bounce" />
        </div>

        <h3 className="text-xl font-bold text-white">
          Vous avez vu tous les logements disponibles !
        </h3>

        <p className="text-sm text-gray-400 mt-2 max-w-xs leading-relaxed">
          Revenez un peu plus tard pour découvrir les nouvelles annonces ajoutées par les propriétaires abidjanais, ou élargissez vos filtres.
        </p>

        <div className="flex flex-col gap-2.5 w-full mt-6 max-w-xs">
          <button
            onClick={onResetSwipes}
            className="w-full py-3 rounded-xl bg-[#FF5A2D] hover:bg-[#FF5A2D]/90 text-white font-bold text-sm shadow-[0_0_20px_rgba(255,90,45,0.4)] transition active:scale-98 flex items-center justify-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Revoir tous les logements</span>
          </button>

          <button
            onClick={onOpenPreferences}
            className="w-full py-2.5 rounded-xl bg-white/5 border border-white/10 text-gray-300 hover:text-white font-semibold text-xs hover:bg-white/10 transition"
          >
            Élargir mes critères de recherche
          </button>
        </div>
      </div>
    );
  }

  const currentPhotoIndex = currentImageIndex[topProperty.id] || 0;
  const currentImage = topProperty.images[currentPhotoIndex] || topProperty.images[0];
  const babiScore = calculateBabiScore(topProperty, userPreferences, topProperty.distanceKm);

  return (
    <div id="swipe-container" className="relative w-full max-w-md mx-auto px-3 py-2 flex flex-col items-center">
      {/* Match banner toast */}
      <AnimatePresence>
        {showMatchToast && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-4 z-30 px-4 py-2 rounded-full bg-emerald-600 text-white text-xs font-bold shadow-lg flex items-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-spin" />
            <span>Ajouté à vos favoris ! Coup de cœur</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Card Deck Area */}
      <div className="relative w-full h-[66vh] max-h-[580px] min-h-[480px]">
        {/* Underneath Next Card (Visual depth preview) */}
        {nextProperty && (
          <div className="absolute inset-0 rounded-3xl overflow-hidden shadow-md bg-stone-100 dark:bg-stone-800 scale-95 translate-y-3 opacity-60 pointer-events-none transition-all">
            <img
              src={nextProperty.images[0]?.url}
              alt={nextProperty.title}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {/* Top Swipable Card */}
        <motion.div
          key={topProperty.id}
          style={{ x, rotate, scale: cardScale }}
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          onDragEnd={handleDragEnd}
          className="absolute inset-0 rounded-3xl overflow-hidden shadow-2xl bg-stone-900 cursor-grab active:cursor-grabbing select-none"
          onClick={() => onSelectProperty(topProperty)}
        >
          {/* Main Background Image */}
          <img
            src={currentImage?.url}
            alt={topProperty.title}
            className="w-full h-full object-cover pointer-events-none"
            loading="eager"
          />

          {/* Photo Gallery Indicator Dots */}
          <div className="absolute top-3 left-0 right-0 z-20 flex justify-center gap-1 px-4">
            {topProperty.images.map((_, idx) => (
              <div
                key={idx}
                className={`h-1 rounded-full transition-all duration-300 ${
                  idx === currentPhotoIndex
                    ? 'w-6 bg-white shadow-xs'
                    : 'w-2 bg-white/40'
                }`}
              />
            ))}
          </div>

          {/* Swipe Left/Right photo tap navigation */}
          {topProperty.images.length > 1 && (
            <>
              <button
                type="button"
                onClick={(e) => handlePrevPhoto(e, topProperty.id, topProperty.images.length)}
                className="absolute left-2 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full bg-black/30 hover:bg-black/50 text-white backdrop-blur-xs transition"
                aria-label="Photo précédente"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={(e) => handleNextPhoto(e, topProperty.id, topProperty.images.length)}
                className="absolute right-2 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full bg-black/30 hover:bg-black/50 text-white backdrop-blur-xs transition"
                aria-label="Photo suivante"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </>
          )}

          {/* Stamp Feedback "LIKE" (Green) */}
          <motion.div
            style={{ opacity: opacityLike }}
            className="absolute top-10 left-6 z-30 px-4 py-1.5 rounded-xl border-3 border-emerald-400 bg-emerald-500/80 backdrop-blur-xs text-white font-black text-xl tracking-wider uppercase rotate-[-15deg] shadow-lg pointer-events-none"
          >
            J'AIME
          </motion.div>

          {/* Stamp Feedback "PASSER" (Red) */}
          <motion.div
            style={{ opacity: opacityPass }}
            className="absolute top-10 right-6 z-30 px-4 py-1.5 rounded-xl border-3 border-rose-400 bg-rose-500/80 backdrop-blur-xs text-white font-black text-xl tracking-wider uppercase rotate-[15deg] shadow-lg pointer-events-none"
          >
            PASSER
          </motion.div>

          {/* Top Floating Badges */}
          <div className="absolute top-7 left-4 right-4 z-20 flex items-center justify-between pointer-events-none">
            {/* Compatibility Pill */}
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#4CAF50] text-white shadow-[0_0_12px_rgba(76,175,80,0.5)]">
              <span className="text-[11px] font-black uppercase tracking-wider">
                {babiScore.total}% COMPATIBLE
              </span>
            </div>

            {/* Live indicator & Badges */}
            <div className="flex items-center gap-2">
              <div className="bg-black/50 backdrop-blur-md px-3 py-1 rounded-full flex items-center gap-1.5 border border-white/10">
                <div className="w-2 h-2 rounded-full bg-[#FF5A2D] animate-pulse"></div>
                <span className="text-[10px] font-bold text-white tracking-widest uppercase">LIVE</span>
              </div>
              {topProperty.isBoosted && (
                <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#FF5A2D] text-white text-[10px] font-extrabold shadow-[0_0_12px_rgba(255,90,45,0.6)]">
                  <Zap className="w-3 h-3 fill-white" />
                  <span>BOOST</span>
                </div>
              )}
            </div>
          </div>

          {/* Bottom Gradient Overlay & Details */}
          <div className="absolute inset-x-0 bottom-0 z-20 pt-24 pb-5 px-5 bg-gradient-to-t from-black via-black/75 to-transparent text-white pointer-events-none">
            {/* Price & Transaction */}
            <div className="flex items-baseline justify-between">
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl font-black text-white tracking-tight">
                  {formatFCFA(topProperty.price)}
                </span>
                {topProperty.transaction === 'location' && (
                  <span className="text-xs text-gray-400 font-normal">/ mois</span>
                )}
              </div>
              <span className="px-2 py-0.5 rounded-md bg-white/10 backdrop-blur-xs text-[10px] font-bold uppercase tracking-wider text-gray-200 border border-white/10">
                {topProperty.type}
              </span>
            </div>

            {/* Title */}
            <h2 className="text-lg font-bold text-white line-clamp-1 mt-1">
              {topProperty.title}
            </h2>

            {/* Location & Distance */}
            <div className="flex items-center gap-2 text-xs text-gray-300 mt-1">
              <span className="flex items-center gap-1 font-semibold text-white">
                <MapPin className="w-3.5 h-3.5 flex-shrink-0 text-[#FF5A2D]" />
                <span>
                  {topProperty.commune} • {topProperty.neighborhood}
                </span>
              </span>
              <span>•</span>
              <span className="font-medium text-gray-300">
                {formatDistance(topProperty.distanceKm)} de vous
              </span>
            </div>

            {/* Quick Spec Pills */}
            <div className="flex items-center gap-2.5 mt-2.5 text-[11px] text-gray-300">
              {topProperty.bedrooms > 0 && (
                <div className="flex items-center gap-1 bg-white/10 border border-white/5 px-2 py-0.5 rounded-md">
                  <Bed className="w-3 h-3 text-[#FF5A2D]" />
                  <span>{topProperty.bedrooms} ch.</span>
                </div>
              )}
              <div className="flex items-center gap-1 bg-white/10 border border-white/5 px-2 py-0.5 rounded-md">
                <Bath className="w-3 h-3 text-gray-400" />
                <span>{topProperty.bathrooms} sdb</span>
              </div>
              <div className="flex items-center gap-1 bg-white/10 border border-white/5 px-2 py-0.5 rounded-md">
                <Maximize className="w-3 h-3 text-gray-400" />
                <span>{topProperty.areaSqm} m²</span>
              </div>
            </div>

            {/* Babi Budget snippet (true entry cost) */}
            {topProperty.transaction === 'location' && (
              <div className="mt-3 pt-2.5 border-t border-white/10 flex items-center justify-between text-xs">
                <span className="text-gray-400 text-[11px]">Coût d'entrée :</span>
                <span className="font-bold text-[#FF5A2D] bg-[#FF5A2D]/10 px-2 py-0.5 rounded border border-[#FF5A2D]/20">
                  {formatFCFAOrUnknown(topProperty.entryCost.total)}
                </span>
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Action Buttons Bar matching Sleek Interface specification */}
      <div className="flex items-center justify-around w-full max-w-xs mt-3 px-2">
        {/* Pass / Dislike (Left) */}
        <button
          type="button"
          onClick={() => triggerSwipe('left')}
          className="w-14 h-14 rounded-full bg-[#2A2A2A] flex items-center justify-center border border-white/10 shadow-lg active:scale-95 text-[#FF3B30] hover:bg-[#333] transition"
          title="Passer"
        >
          <X className="w-6 h-6 stroke-[2.5]" />
        </button>

        {/* Undo Button */}
        <button
          type="button"
          onClick={onUndo}
          disabled={!canUndo}
          className={`w-11 h-11 rounded-full bg-[#2A2A2A] flex items-center justify-center border border-white/10 transition-all ${
            canUndo
              ? 'text-gray-300 hover:text-white active:scale-95'
              : 'text-gray-600 opacity-40 cursor-not-allowed'
          }`}
          title="Annuler le dernier swipe"
        >
          <RotateCcw className="w-4 h-4" />
        </button>

        {/* Info / Detail Sheet */}
        <button
          type="button"
          onClick={() => onSelectProperty(topProperty)}
          className="w-12 h-12 rounded-full bg-[#2A2A2A] flex items-center justify-center border border-white/10 text-[#FFD700] shadow-md hover:bg-[#333] active:scale-95 transition"
          title="Consulter tous les détails"
        >
          <Info className="w-5 h-5 stroke-[2.5]" />
        </button>

        {/* Like (Right) */}
        <button
          type="button"
          onClick={() => triggerSwipe('right')}
          className="w-14 h-14 rounded-full bg-[#2A2A2A] flex items-center justify-center border border-white/10 shadow-lg active:scale-95 text-[#4CAF50] hover:bg-[#333] transition"
          title="Aimer ce logement"
        >
          <Heart className="w-6 h-6 fill-[#4CAF50] stroke-none" />
        </button>
      </div>
    </div>
  );
};