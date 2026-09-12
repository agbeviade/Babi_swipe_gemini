'use client';

import React from 'react';
import { X, Sparkles, ShieldCheck, MapPin, CheckCircle2, AlertCircle } from 'lucide-react';
import { Property, UserPreferences } from '@/types';
import { formatFCFA, formatFCFAOrUnknown } from '@/services/budgetService';
import { formatDistance } from '@/services/geoService';
import { calculateBabiScore } from '@/services/babiScoreService';
import { PROPERTY_FEATURES_LIST } from '@/lib/constants';

interface ComparatorModalProps {
  properties: Property[];
  onClose: () => void;
  userPreferences: UserPreferences;
}

export const ComparatorModal: React.FC<ComparatorModalProps> = ({
  properties,
  onClose,
  userPreferences
}) => {
  if (properties.length < 2) return null;

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/80 backdrop-blur-sm p-2 sm:p-4">
      <div
        id="comparator-modal"
        className="w-full max-w-2xl bg-[#16181D] rounded-3xl border border-white/10 shadow-2xl overflow-hidden flex flex-col max-h-[90vh] text-white animate-in zoom-in-95 duration-200"
      >
        {/* Header */}
        <div className="p-5 border-b border-white/10 flex items-center justify-between">
          <div>
            <h3 className="font-extrabold text-base text-white">Comparateur BABI IMMO</h3>
            <p className="text-xs text-gray-400">
              Analyse comparative de {properties.length} logements
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-white/10 text-gray-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Comparison Table */}
        <div className="p-4 overflow-x-auto overflow-y-auto flex-1 text-xs">
          <table className="w-full min-w-[500px] border-collapse">
            <thead>
              <tr className="border-b border-white/10">
                <th className="p-3 text-left font-bold text-gray-400 w-28 uppercase tracking-wider text-[10px]">Critères</th>
                {properties.map((p) => (
                  <th key={p.id} className="p-3 text-left font-bold min-w-[140px]">
                    <div className="w-full h-24 rounded-xl overflow-hidden mb-2 bg-stone-900 border border-white/10">
                      <img
                        src={p.images[0]?.url}
                        alt={p.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <span className="line-clamp-1 text-xs text-white">{p.title}</span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {/* Loyer / Prix */}
              <tr>
                <td className="p-3 font-semibold text-gray-400">Loyer mensuel</td>
                {properties.map((p) => (
                  <td key={p.id} className="p-3 font-black text-white font-mono text-sm">
                    {formatFCFA(p.price)}
                  </td>
                ))}
              </tr>

              {/* Coût d'entrée */}
              <tr className="bg-[#FF5A2D]/10">
                <td className="p-3 font-bold text-[#FF5A2D]">
                  Coût Réel d'Entrée
                </td>
                {properties.map((p) => (
                  <td key={p.id} className="p-3 font-black text-[#FF5A2D] font-mono text-sm">
                    {formatFCFAOrUnknown(p.entryCost.total)}
                    <span className="block text-[10px] text-gray-400 font-normal">
                      (Caution + Avance + Frais)
                    </span>
                  </td>
                ))}
              </tr>

              {/* Babi Score */}
              <tr>
                <td className="p-3 font-semibold text-gray-400">Babi Score</td>
                {properties.map((p) => {
                  const score = calculateBabiScore(p, userPreferences, p.distanceKm);
                  return (
                    <td key={p.id} className="p-3">
                      <span className="inline-flex items-center gap-1 font-black text-[#FFD700] bg-[#FFD700]/15 border border-[#FFD700]/30 px-2 py-0.5 rounded-lg">
                        <Sparkles className="w-3 h-3 text-[#FFD700]" />
                        <span>{score.total}%</span>
                      </span>
                    </td>
                  );
                })}
              </tr>

              {/* Distance */}
              <tr>
                <td className="p-3 font-semibold text-gray-400">Distance de vous</td>
                {properties.map((p) => (
                  <td key={p.id} className="p-3 font-medium text-gray-300">
                    {formatDistance(p.distanceKm)}
                  </td>
                ))}
              </tr>

              {/* Chambres & SDB */}
              <tr>
                <td className="p-3 font-semibold text-gray-400">Chambres / Pièces</td>
                {properties.map((p) => (
                  <td key={p.id} className="p-3 text-gray-200">
                    {p.bedrooms} ch. • {p.bathrooms} sdb
                  </td>
                ))}
              </tr>

              {/* Superficie */}
              <tr>
                <td className="p-3 font-semibold text-gray-400">Superficie</td>
                {properties.map((p) => (
                  <td key={p.id} className="p-3 font-medium text-gray-200">
                    {p.areaSqm} m²
                  </td>
                ))}
              </tr>

              {/* Localisation */}
              <tr>
                <td className="p-3 font-semibold text-gray-400">Commune</td>
                {properties.map((p) => (
                  <td key={p.id} className="p-3 font-medium text-gray-200">
                    {p.commune} ({p.neighborhood})
                  </td>
                ))}
              </tr>

              {/* Vérification */}
              <tr>
                <td className="p-3 font-semibold text-gray-400">Niveau de vérification</td>
                {properties.map((p) => (
                  <td key={p.id} className="p-3">
                    {p.advertiser.verifications.length >= 2 ? (
                      <span className="inline-flex items-center gap-1 text-[#4CAF50] font-bold text-[11px]">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span>Certifié BABI</span>
                      </span>
                    ) : (
                      <span className="text-gray-500 text-[11px]">Standard</span>
                    )}
                  </td>
                ))}
              </tr>

              {/* Équipements clés */}
              {PROPERTY_FEATURES_LIST.slice(0, 5).map((feat) => (
                <tr key={feat.id}>
                  <td className="p-3 font-medium text-gray-400">{feat.label}</td>
                  {properties.map((p) => {
                    const has = p.features.includes(feat.id);
                    return (
                      <td key={p.id} className="p-3">
                        {has ? (
                          <CheckCircle2 className="w-4 h-4 text-[#4CAF50]" />
                        ) : (
                          <span className="text-gray-600 font-bold">—</span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="p-4 bg-[#0F1115] border-t border-white/10 text-right">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-2xl bg-[#FF5A2D] hover:bg-[#FF5A2D]/90 text-white font-bold text-xs shadow-[0_0_15px_rgba(255,90,45,0.4)] transition active:scale-95"
          >
            Fermer le comparateur
          </button>
        </div>
      </div>
    </div>
  );
};