'use client';

import React, { useEffect, useState } from 'react';
import { X, CheckCircle2, RotateCcw } from 'lucide-react';
import { UserPreferences, PropertyType, PropertySortBy, TransactionType } from '@/types';
import { ABIDJAN_COMMUNES, PROPERTY_FEATURES_LIST } from '@/lib/constants';
import { formatFCFA } from '@/services/budgetService';

const SORT_OPTIONS: { id: PropertySortBy; label: string }[] = [
  { id: 'score', label: 'Babi Score (Recommandé)' },
  { id: 'distance', label: 'Plus proche de moi' },
  { id: 'price_asc', label: 'Prix croissant' },
  { id: 'price_desc', label: 'Prix décroissant' }
];

interface FilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  preferences: UserPreferences;
  onApply: (newPreferences: UserPreferences) => void;
  onReset: () => void;
  totalResultsCount: number;
}

export const FilterModal: React.FC<FilterModalProps> = ({
  isOpen,
  onClose,
  preferences,
  onApply,
  onReset,
  totalResultsCount
}) => {
  const [transaction, setTransaction] = useState<TransactionType>(preferences.transaction);
  const [selectedTypes, setSelectedTypes] = useState<PropertyType[]>(preferences.propertyTypes);
  const [selectedCommunes, setSelectedCommunes] = useState<string[]>(preferences.communes);
  const [budgetMax, setBudgetMax] = useState<number>(preferences.budgetMax || 350000);
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>(preferences.features);
  const [onlyVerified, setOnlyVerified] = useState<boolean>(preferences.onlyVerified || false);
  const [sortBy, setSortBy] = useState<PropertySortBy>(preferences.sortBy || 'score');

  // Le modal reste monté : à chaque ouverture le brouillon repart des préférences
  // courantes, sinon "Appliquer" réécrirait des critères obsolètes.
  useEffect(() => {
    if (!isOpen) return;
    setTransaction(preferences.transaction);
    setSelectedTypes(preferences.propertyTypes);
    setSelectedCommunes(preferences.communes);
    setBudgetMax(preferences.budgetMax || 350000);
    setSelectedFeatures(preferences.features);
    setOnlyVerified(preferences.onlyVerified || false);
    setSortBy(preferences.sortBy || 'score');
  }, [isOpen, preferences]);

  if (!isOpen) return null;

  const toggleType = (t: PropertyType) => {
    if (selectedTypes.includes(t)) {
      if (selectedTypes.length > 1) setSelectedTypes(selectedTypes.filter((item) => item !== t));
    } else {
      setSelectedTypes([...selectedTypes, t]);
    }
  };

  const toggleCommune = (c: string) => {
    if (selectedCommunes.includes(c)) {
      if (selectedCommunes.length > 1) setSelectedCommunes(selectedCommunes.filter((item) => item !== c));
    } else {
      setSelectedCommunes([...selectedCommunes, c]);
    }
  };

  const toggleFeature = (f: string) => {
    if (selectedFeatures.includes(f)) {
      setSelectedFeatures(selectedFeatures.filter((item) => item !== f));
    } else {
      setSelectedFeatures([...selectedFeatures, f]);
    }
  };

  const handleApply = () => {
    onApply({
      ...preferences,
      transaction,
      propertyTypes: selectedTypes,
      communes: selectedCommunes,
      budgetMax,
      features: selectedFeatures,
      onlyVerified,
      sortBy
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-60 flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-sm p-0 sm:p-4">
      <div
        id="filters-modal"
        className="w-full sm:max-w-md bg-[#16181D] rounded-t-[32px] sm:rounded-[32px] border border-white/10 shadow-2xl overflow-hidden flex flex-col max-h-[92vh] text-white animate-in slide-in-from-bottom duration-200"
      >
        {/* Header */}
        <div className="p-5 border-b border-white/10 flex items-center justify-between">
          <div>
            <h3 className="font-extrabold text-base text-white">Filtres de recherche</h3>
            <p className="text-xs text-gray-400">Affinez vos critères pour Abidjan</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-white/10 text-gray-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Filters Body */}
        <div className="p-5 overflow-y-auto flex-1 space-y-5 text-xs">
          {/* Tri */}
          <div>
            <label className="font-bold block mb-2 uppercase text-[11px] text-gray-400 tracking-wider">
              Trier les annonces par
            </label>
            <div className="grid grid-cols-2 gap-2">
              {SORT_OPTIONS.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setSortBy(s.id)}
                  className={`p-2.5 rounded-2xl border text-left font-medium transition ${
                    sortBy === s.id
                      ? 'border-[#FF5A2D] bg-[#FF5A2D]/15 text-[#FF5A2D] font-bold shadow-[0_0_10px_rgba(255,90,45,0.2)]'
                      : 'border-white/10 bg-[#0F1115] text-gray-300 hover:border-white/20'
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          {/* Transaction */}
          <div>
            <label className="font-bold block mb-2 uppercase text-[11px] text-gray-400 tracking-wider">
              Type d'opération
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setTransaction('location')}
                className={`py-2.5 rounded-2xl border font-bold transition ${
                  transaction === 'location'
                    ? 'border-[#FF5A2D] bg-[#FF5A2D]/15 text-[#FF5A2D] shadow-[0_0_10px_rgba(255,90,45,0.2)]'
                    : 'border-white/10 bg-[#0F1115] text-gray-400 hover:text-white'
                }`}
              >
                Location
              </button>
              <button
                type="button"
                onClick={() => setTransaction('vente')}
                className={`py-2.5 rounded-2xl border font-bold transition ${
                  transaction === 'vente'
                    ? 'border-[#FF5A2D] bg-[#FF5A2D]/15 text-[#FF5A2D] shadow-[0_0_10px_rgba(255,90,45,0.2)]'
                    : 'border-white/10 bg-[#0F1115] text-gray-400 hover:text-white'
                }`}
              >
                Vente / Achat
              </button>
            </div>
          </div>

          {/* Types de biens */}
          <div>
            <label className="font-bold block mb-2 uppercase text-[11px] text-gray-400 tracking-wider">
              Type de bien
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['studio', 'appartement', 'maison', 'villa', 'bureau', 'terrain'] as PropertyType[]).map(
                (t) => {
                  const isSelected = selectedTypes.includes(t);
                  return (
                    <button
                      key={t}
                      type="button"
                      onClick={() => toggleType(t)}
                      className={`p-2 rounded-2xl border text-center capitalize transition font-medium ${
                        isSelected
                          ? 'border-[#FF5A2D] bg-[#FF5A2D]/15 text-[#FF5A2D] font-bold shadow-[0_0_10px_rgba(255,90,45,0.2)]'
                          : 'border-white/10 bg-[#0F1115] text-gray-400 hover:text-white'
                      }`}
                    >
                      {t}
                    </button>
                  );
                }
              )}
            </div>
          </div>

          {/* Budget Slider */}
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="font-bold uppercase text-[11px] text-gray-400 tracking-wider">
                Loyer maximum
              </label>
              <span className="font-black text-[#FF5A2D] text-sm font-mono">
                {formatFCFA(budgetMax)}
              </span>
            </div>
            <input
              type="range"
              min="50000"
              max="1500000"
              step="25000"
              value={budgetMax}
              onChange={(e) => setBudgetMax(Number(e.target.value))}
              className="w-full accent-[#FF5A2D] h-2 bg-white/10 rounded-lg cursor-pointer"
            />
          </div>

          {/* Communes d'Abidjan */}
          <div>
            <label className="font-bold block mb-2 uppercase text-[11px] text-gray-400 tracking-wider">
              Communes souhaitées
            </label>
            <div className="flex flex-wrap gap-1.5">
              {ABIDJAN_COMMUNES.map((c) => {
                const isSelected = selectedCommunes.includes(c);
                return (
                  <button
                    key={c}
                    type="button"
                    onClick={() => toggleCommune(c)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                      isSelected
                        ? 'bg-[#FF5A2D] text-white shadow-[0_0_10px_rgba(255,90,45,0.4)]'
                        : 'bg-white/5 border border-white/10 text-gray-300 hover:bg-white/10'
                    }`}
                  >
                    {c}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Équipements */}
          <div>
            <label className="font-bold block mb-2 uppercase text-[11px] text-gray-400 tracking-wider">
              Équipements requis
            </label>
            <div className="grid grid-cols-2 gap-2">
              {PROPERTY_FEATURES_LIST.map((f) => {
                const isSelected = selectedFeatures.includes(f.id);
                return (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => toggleFeature(f.id)}
                    className={`p-2.5 rounded-2xl border text-left transition flex items-center justify-between ${
                      isSelected
                        ? 'border-[#FF5A2D] bg-[#FF5A2D]/15 text-[#FF5A2D] font-bold'
                        : 'border-white/10 bg-[#0F1115] text-gray-400 hover:text-white'
                    }`}
                  >
                    <span>{f.label}</span>
                    {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-[#4CAF50]" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Uniquement certifiés */}
          <div className="flex items-center gap-2 pt-2 border-t border-white/10">
            <input
              type="checkbox"
              id="verified-only"
              checked={onlyVerified}
              onChange={(e) => setOnlyVerified(e.target.checked)}
              className="w-4 h-4 accent-[#FF5A2D] rounded"
            />
            <label htmlFor="verified-only" className="font-bold cursor-pointer text-gray-200">
              Afficher uniquement les annonces et annonceurs certifiés
            </label>
          </div>
        </div>

        {/* Footer actions */}
        <div className="p-4 bg-[#0F1115] border-t border-white/10 flex items-center justify-between">
          <button
            type="button"
            onClick={() => {
              onReset();
              onClose();
            }}
            className="flex items-center gap-1.5 text-gray-400 hover:text-white text-xs font-semibold transition"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Réinitialiser</span>
          </button>

          <button
            type="button"
            onClick={handleApply}
            className="px-6 py-3 rounded-2xl bg-[#FF5A2D] hover:bg-[#FF5A2D]/90 text-white font-bold text-xs shadow-[0_0_20px_rgba(255,90,45,0.4)] transition active:scale-95"
          >
            Voir les {totalResultsCount} logements
          </button>
        </div>
      </div>
    </div>
  );
};