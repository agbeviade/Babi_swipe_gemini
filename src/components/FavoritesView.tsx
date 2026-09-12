'use client';

import React, { useState } from 'react';
import {
  Heart,
  Trash2,
  GitCompare,
  MapPin,
  Bed,
  Bath,
  Maximize,
  ArrowRight,
  Sparkles,
  Phone,
  MessageCircle,
  ShieldCheck
} from 'lucide-react';
import { Property, UserPreferences } from '@/types';
import { formatFCFA, formatFCFAOrUnknown } from '@/services/budgetService';
import { formatDistance } from '@/services/geoService';
import { calculateBabiScore } from '@/services/babiScoreService';
import { ComparatorModal } from '@/components/ComparatorModal';

interface FavoritesViewProps {
  favoriteProperties: Property[];
  onRemoveFavorite: (id: string) => void;
  onSelectProperty: (property: Property) => void;
  userPreferences: UserPreferences;
}

export const FavoritesView: React.FC<FavoritesViewProps> = ({
  favoriteProperties,
  onRemoveFavorite,
  onSelectProperty,
  userPreferences
}) => {
  const [selectedForComparison, setSelectedForComparison] = useState<string[]>([]);
  const [showComparator, setShowComparator] = useState<boolean>(false);

  const toggleCompare = (e: React.MouseEvent, propId: string) => {
    e.stopPropagation();
    if (selectedForComparison.includes(propId)) {
      setSelectedForComparison(selectedForComparison.filter((id) => id !== propId));
    } else {
      if (selectedForComparison.length >= 3) {
        alert('Vous pouvez comparer jusqu’à 3 logements simultanément.');
        return;
      }
      setSelectedForComparison([...selectedForComparison, propId]);
    }
  };

  const propertiesToCompare = favoriteProperties.filter((p) =>
    selectedForComparison.includes(p.id)
  );

  return (
    <div id="favorites-view" className="w-full max-w-md mx-auto px-4 py-4 space-y-4 pb-24">
      {/* Header with comparison action */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-extrabold text-white">
            Vos Coups de Cœur ({favoriteProperties.length})
          </h2>
          <p className="text-xs text-gray-400">
            Biens enregistrés et prêts à visiter à Abidjan
          </p>
        </div>

        {favoriteProperties.length >= 2 && (
          <button
            onClick={() => {
              if (selectedForComparison.length < 2) {
                setSelectedForComparison([favoriteProperties[0].id, favoriteProperties[1].id]);
              }
              setShowComparator(true);
            }}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-[#FF5A2D] hover:bg-[#FF5A2D]/90 text-white text-xs font-bold shadow-[0_0_15px_rgba(255,90,45,0.4)] transition active:scale-95"
          >
            <GitCompare className="w-3.5 h-3.5" />
            <span>Comparer ({selectedForComparison.length || 2})</span>
          </button>
        )}
      </div>

      {/* Comparison Helper Bar if selected */}
      {selectedForComparison.length > 0 && (
        <div className="p-3 rounded-2xl bg-[#FF5A2D]/10 border border-[#FF5A2D]/30 flex items-center justify-between text-xs">
          <span className="font-semibold text-white">
            {selectedForComparison.length} logement{selectedForComparison.length > 1 ? 's' : ''} sélectionné(s)
          </span>
          <div className="flex gap-2.5 items-center">
            <button
              onClick={() => setSelectedForComparison([])}
              className="text-gray-400 hover:text-white text-[11px]"
            >
              Effacer
            </button>
            <button
              onClick={() => setShowComparator(true)}
              className="font-bold text-[#FF5A2D] underline text-[11px]"
            >
              Ouvrir le comparateur
            </button>
          </div>
        </div>
      )}

      {/* Empty State */}
      {favoriteProperties.length === 0 ? (
        <div className="py-20 text-center space-y-3">
          <div className="w-16 h-16 rounded-full bg-[#FF5A2D]/15 border border-[#FF5A2D]/30 text-[#FF5A2D] mx-auto flex items-center justify-center">
            <Heart className="w-8 h-8 fill-[#FF5A2D]" />
          </div>
          <h3 className="font-bold text-base text-white">
            Aucun favori pour le moment
          </h3>
          <p className="text-xs text-gray-400 max-w-xs mx-auto leading-relaxed">
            Swiper vers la droite sur l'écran d'accueil ou appuyez sur l'icône cœur pour sauvegarder les logements qui vous plaisent !
          </p>
        </div>
      ) : (
        /* Favorites Cards List */
        <div className="space-y-3">
          {favoriteProperties.map((property) => {
            const isComparing = selectedForComparison.includes(property.id);
            const score = calculateBabiScore(property, userPreferences, property.distanceKm);

            return (
              <div
                key={property.id}
                onClick={() => onSelectProperty(property)}
                className="p-3 rounded-2xl bg-[#16181D] border border-white/10 shadow-lg hover:border-white/20 transition cursor-pointer flex gap-3 text-white"
              >
                {/* Thumbnail & Score Chip */}
                <div className="relative w-28 h-28 rounded-xl overflow-hidden flex-shrink-0 bg-stone-900">
                  <img
                    src={property.images[0]?.url}
                    alt={property.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-1.5 left-1.5 px-2 py-0.5 rounded-md bg-black/80 backdrop-blur-xs text-[#FFD700] text-[10px] font-black flex items-center gap-1 border border-white/10">
                    <Sparkles className="w-3 h-3 text-[#FFD700]" />
                    <span>{score.total}%</span>
                  </div>
                </div>

                {/* Info Block */}
                <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-base font-black text-white font-mono">
                        {formatFCFA(property.price)}
                      </span>
                      <span className="text-[10px] font-bold text-[#FF5A2D] bg-[#FF5A2D]/15 border border-[#FF5A2D]/30 px-2 py-0.5 rounded-md uppercase">
                        {property.type}
                      </span>
                    </div>

                    <h4 className="text-xs font-bold text-gray-200 line-clamp-1 mt-1">
                      {property.title}
                    </h4>

                    <div className="flex items-center gap-1.5 text-[11px] text-gray-400 mt-1">
                      <MapPin className="w-3 h-3 text-[#FF5A2D] flex-shrink-0" />
                      <span className="truncate">{property.commune}</span>
                      <span>•</span>
                      <span className="text-gray-300 font-semibold">
                        {formatDistance(property.distanceKm)}
                      </span>
                    </div>

                    <div className="text-[10px] text-gray-400 mt-1">
                      Coût d'entrée :{' '}
                      <strong className="text-[#FF5A2D]">
                        {formatFCFAOrUnknown(property.entryCost.total)}
                      </strong>
                    </div>
                  </div>

                  {/* Actions & Compare Checkbox */}
                  <div className="flex items-center justify-between pt-2 border-t border-white/10">
                    <button
                      onClick={(e) => toggleCompare(e, property.id)}
                      className={`text-[10px] font-bold flex items-center gap-1 px-2.5 py-1 rounded-xl transition ${
                        isComparing
                          ? 'bg-[#FF5A2D] text-white shadow-[0_0_10px_rgba(255,90,45,0.4)]'
                          : 'bg-white/5 border border-white/10 text-gray-300 hover:bg-white/10'
                      }`}
                    >
                      <GitCompare className="w-3 h-3" />
                      <span>{isComparing ? 'Sélectionné' : 'Comparer'}</span>
                    </button>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onRemoveFavorite(property.id);
                      }}
                      className="p-1 rounded text-gray-400 hover:text-rose-400 transition"
                      title="Retirer des favoris"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Multi-Property Comparator Modal */}
      {showComparator && (
        <ComparatorModal
          properties={propertiesToCompare.length >= 2 ? propertiesToCompare : favoriteProperties.slice(0, 3)}
          onClose={() => setShowComparator(false)}
          userPreferences={userPreferences}
        />
      )}
    </div>
  );
};