'use client';

import React, { useState } from 'react';
import {
  Home,
  Key,
  MapPin,
  CheckCircle2,
  Navigation,
  ArrowRight,
  Sparkles,
  DollarSign
} from 'lucide-react';
import { UserPreferences, TransactionType, PropertyType } from '@/types';
import { ABIDJAN_COMMUNES, PROPERTY_FEATURES_LIST } from '@/lib/constants';
import { getCurrentPosition } from '@/services/geoService';

interface OnboardingModalProps {
  isOpen: boolean;
  onComplete: (prefs: UserPreferences) => void;
  initialPrefs: UserPreferences;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({
  isOpen,
  onComplete,
  initialPrefs
}) => {
  const [step, setStep] = useState<number>(1);
  const [transaction, setTransaction] = useState<TransactionType>(initialPrefs.transaction);
  const [propertyTypes, setPropertyTypes] = useState<PropertyType[]>(initialPrefs.propertyTypes);
  const [budgetMax, setBudgetMax] = useState<number>(initialPrefs.budgetMax || 250000);
  const [userIncome, setUserIncome] = useState<number>(initialPrefs.userIncome || 600000);
  const [selectedCommunes, setSelectedCommunes] = useState<string[]>(initialPrefs.communes);
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>(initialPrefs.features);
  const [isLocating, setIsLocating] = useState<boolean>(false);
  const [userCoords, setUserCoords] = useState<{ lat?: number; lng?: number }>({
    lat: initialPrefs.userLat,
    lng: initialPrefs.userLng
  });

  if (!isOpen) return null;

  const togglePropertyType = (type: PropertyType) => {
    if (propertyTypes.includes(type)) {
      if (propertyTypes.length > 1) {
        setPropertyTypes(propertyTypes.filter((t) => t !== type));
      }
    } else {
      setPropertyTypes([...propertyTypes, type]);
    }
  };

  const toggleCommune = (commune: string) => {
    if (selectedCommunes.includes(commune)) {
      if (selectedCommunes.length > 1) {
        setSelectedCommunes(selectedCommunes.filter((c) => c !== commune));
      }
    } else {
      setSelectedCommunes([...selectedCommunes, commune]);
    }
  };

  const toggleFeature = (featureId: string) => {
    if (selectedFeatures.includes(featureId)) {
      setSelectedFeatures(selectedFeatures.filter((f) => f !== featureId));
    } else {
      setSelectedFeatures([...selectedFeatures, featureId]);
    }
  };

  const handleEnableGeolocation = async () => {
    setIsLocating(true);
    const pos = await getCurrentPosition();
    setUserCoords({ lat: pos.latitude, lng: pos.longitude });
    setIsLocating(false);
    finishOnboarding(pos.latitude, pos.longitude);
  };

  const finishOnboarding = (lat?: number, lng?: number) => {
    const updated: UserPreferences = {
      ...initialPrefs,
      transaction,
      propertyTypes,
      budgetMax,
      userIncome,
      communes: selectedCommunes,
      features: selectedFeatures,
      userLat: lat ?? userCoords.lat,
      userLng: lng ?? userCoords.lng,
      radiusKm: 10
    };
    onComplete(updated);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-xs p-0 sm:p-4">
      <div
        id="onboarding-modal"
        className="w-full sm:max-w-md bg-[#16181D] border border-white/10 rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] animate-in slide-in-from-bottom duration-300 text-white"
      >
        {/* Header with progress */}
        <div className="bg-[#0F1115] border-b border-white/10 text-white px-6 pt-5 pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="w-6 h-6 rounded-full bg-[#FF5A2D] text-xs font-black flex items-center justify-center text-white">
                {step}/6
              </span>
              <span className="text-xs font-bold uppercase tracking-wider text-gray-300">
                Bienvenue à Abidjan
              </span>
            </div>
            <button
              onClick={() => finishOnboarding()}
              className="text-xs text-gray-400 hover:text-white underline font-medium"
            >
              Passer
            </button>
          </div>
          <div className="w-full bg-white/10 h-1.5 rounded-full mt-3 overflow-hidden">
            <div
              className="bg-[#FF5A2D] h-full transition-all duration-300 rounded-full"
              style={{ width: `${(step / 6) * 100}%` }}
            />
          </div>
        </div>

        {/* Scrollable Content Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-5">
          {/* STEP 1: Louer ou Acheter */}
          {step === 1 && (
            <div className="space-y-4 animate-in fade-in">
              <div>
                <h2 className="text-xl font-extrabold text-white">Que recherchez-vous ?</h2>
                <p className="text-sm text-gray-400 mt-1">
                  Découvrez votre prochain coup de cœur immobilier à Abidjan.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setTransaction('location')}
                  className={`p-5 rounded-2xl border flex flex-col items-center justify-center gap-3 transition-all ${
                    transaction === 'location'
                      ? 'border-[#FF5A2D] bg-[#FF5A2D]/10 text-white shadow-[0_0_15px_rgba(255,90,45,0.3)]'
                      : 'border-white/10 bg-white/5 text-gray-300 hover:border-white/20'
                  }`}
                >
                  <div className={`p-3 rounded-2xl ${transaction === 'location' ? 'bg-[#FF5A2D] text-white shadow-md' : 'bg-white/10 text-gray-400'}`}>
                    <Key className="w-6 h-6" />
                  </div>
                  <span className="font-bold text-base text-white">Louer</span>
                  <span className="text-xs text-gray-400 text-center">Studio, appartement, villa meublée</span>
                </button>

                <button
                  type="button"
                  onClick={() => setTransaction('vente')}
                  className={`p-5 rounded-2xl border flex flex-col items-center justify-center gap-3 transition-all ${
                    transaction === 'vente'
                      ? 'border-[#FF5A2D] bg-[#FF5A2D]/10 text-white shadow-[0_0_15px_rgba(255,90,45,0.3)]'
                      : 'border-white/10 bg-white/5 text-gray-300 hover:border-white/20'
                  }`}
                >
                  <div className={`p-3 rounded-2xl ${transaction === 'vente' ? 'bg-[#FF5A2D] text-white shadow-md' : 'bg-white/10 text-gray-400'}`}>
                    <Home className="w-6 h-6" />
                  </div>
                  <span className="font-bold text-base text-white">Acheter</span>
                  <span className="text-xs text-gray-400 text-center">Maison, terrain avec ACD, triplex</span>
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: Type de bien */}
          {step === 2 && (
            <div className="space-y-4 animate-in fade-in">
              <div>
                <h2 className="text-xl font-extrabold text-white">Quel type de bien ?</h2>
                <p className="text-sm text-gray-400 mt-1">
                  Sélectionnez un ou plusieurs types (vous pourrez affiner ensuite).
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2.5 pt-1">
                {(
                  [
                    { id: 'studio', label: 'Studio moderne', count: '1 pièce' },
                    { id: 'appartement', label: 'Appartement', count: '2 à 4 pièces' },
                    { id: 'maison', label: 'Maison basse', count: 'Cour avant/arrière' },
                    { id: 'villa', label: 'Villa duplex', count: 'Jardin / Piscine' },
                    { id: 'bureau', label: 'Bureau pro', count: 'Plateau / Cocody' },
                    { id: 'terrain', label: 'Terrain avec titre', count: 'ACD / CPF' }
                  ] as const
                ).map((t) => {
                  const isSelected = propertyTypes.includes(t.id as PropertyType);
                  return (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => togglePropertyType(t.id as PropertyType)}
                      className={`p-3.5 rounded-2xl border text-left transition-all ${
                        isSelected
                          ? 'border-[#FF5A2D] bg-[#FF5A2D]/10 text-white font-semibold shadow-xs'
                          : 'border-white/10 bg-white/5 text-gray-300 hover:bg-white/10'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-white font-medium">{t.label}</span>
                        {isSelected && <CheckCircle2 className="w-4 h-4 text-[#FF5A2D]" />}
                      </div>
                      <span className="text-xs text-gray-400 block mt-0.5">{t.count}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 3: Budget & Babi Budget */}
          {step === 3 && (
            <div className="space-y-4 animate-in fade-in">
              <div>
                <h2 className="text-xl font-extrabold text-white">Votre budget mensuel</h2>
                <p className="text-sm text-gray-400 mt-1">
                  BABI calcule automatiquement votre <strong className="text-white">vrai coût d’entrée</strong> (caution + avance + agence).
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-[#0F1115] border border-white/10 space-y-3 shadow-inner">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Loyer max souhaité
                  </span>
                  <span className="text-lg font-black text-[#FF5A2D] font-mono">
                    {budgetMax.toLocaleString('fr-FR')} FCFA
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
                <div className="flex justify-between text-xs text-gray-500">
                  <span>50k FCFA</span>
                  <span>500k FCFA</span>
                  <span>1.5M FCFA</span>
                </div>
              </div>

              {transaction === 'location' && (
                <div className="p-3.5 rounded-2xl bg-[#FF5A2D]/10 border border-[#FF5A2D]/30 text-xs space-y-1.5">
                  <div className="flex items-center gap-1.5 font-bold text-[#FF5A2D]">
                    <Sparkles className="w-3.5 h-3.5 text-[#FFD700]" />
                    <span>Aperçu Babi Budget d'entrée estimé :</span>
                  </div>
                  <p className="text-gray-300">
                    Pour un loyer de {budgetMax.toLocaleString('fr-FR')} FCFA, prévoyez environ{' '}
                    <strong className="text-white font-bold">
                      {(budgetMax * 5 + 30000).toLocaleString('fr-FR')} FCFA
                    </strong>{' '}
                    (2 mois de caution + 2 mois d'avance + frais d'agence 1 mois + dossier).
                  </p>
                </div>
              )}
            </div>
          )}

          {/* STEP 4: Zone & Communes d'Abidjan */}
          {step === 4 && (
            <div className="space-y-4 animate-in fade-in">
              <div>
                <h2 className="text-xl font-extrabold text-white">Dans quelles communes ?</h2>
                <p className="text-sm text-gray-400 mt-1">
                  Sélectionnez vos zones favorites à Abidjan et environs.
                </p>
              </div>

              <div className="flex flex-wrap gap-2 pt-1">
                {ABIDJAN_COMMUNES.map((commune) => {
                  const isSelected = selectedCommunes.includes(commune);
                  return (
                    <button
                      key={commune}
                      type="button"
                      onClick={() => toggleCommune(commune)}
                      className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                        isSelected
                          ? 'bg-[#FF5A2D] text-white shadow-[0_0_10px_rgba(255,90,45,0.4)]'
                          : 'bg-white/5 border border-white/10 text-gray-300 hover:bg-white/10'
                      }`}
                    >
                      {commune}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 5: Équipements & Confort */}
          {step === 5 && (
            <div className="space-y-4 animate-in fade-in">
              <div>
                <h2 className="text-xl font-extrabold text-white">Critères essentiels</h2>
                <p className="text-sm text-gray-400 mt-1">
                  Ce qui compte le plus pour votre confort au quotidien.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2.5 pt-1">
                {PROPERTY_FEATURES_LIST.map((feat) => {
                  const isSelected = selectedFeatures.includes(feat.id);
                  return (
                    <button
                      key={feat.id}
                      type="button"
                      onClick={() => toggleFeature(feat.id)}
                      className={`p-3.5 rounded-2xl border text-left text-xs font-medium transition-all flex items-center justify-between ${
                        isSelected
                          ? 'border-[#FF5A2D] bg-[#FF5A2D]/10 text-white font-bold'
                          : 'border-white/10 bg-white/5 text-gray-300 hover:bg-white/10'
                      }`}
                    >
                      <span>{feat.label}</span>
                      {isSelected && <CheckCircle2 className="w-4 h-4 text-[#FF5A2D] flex-shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 6: Géolocalisation « Autour de moi » */}
          {step === 6 && (
            <div className="space-y-4 animate-in fade-in text-center py-2">
              <div className="w-16 h-16 rounded-full bg-[#FF5A2D]/10 border border-[#FF5A2D]/30 mx-auto flex items-center justify-center">
                <Navigation className="w-8 h-8 animate-pulse text-[#FF5A2D]" />
              </div>

              <div>
                <h2 className="text-xl font-extrabold text-white">Trouve ton chez-toi autour de toi</h2>
                <p className="text-sm text-gray-400 mt-2 px-2 leading-relaxed">
                  Activez votre géolocalisation pour afficher les logements disponibles à quelques minutes à pied ou en voiture de votre position actuelle.
                </p>
              </div>

              <div className="p-3.5 bg-white/5 border border-white/10 rounded-2xl text-xs text-gray-400 text-left">
                🔒 <strong className="text-white">Confidentialité garantie</strong> : Votre position exacte n’est jamais exposée ni partagée publiquement.
              </div>

              <div className="space-y-2.5 pt-2">
                <button
                  type="button"
                  onClick={handleEnableGeolocation}
                  disabled={isLocating}
                  className="w-full py-4 rounded-2xl bg-[#FF5A2D] hover:bg-[#FF5A2D]/90 text-white font-bold text-sm shadow-[0_0_20px_rgba(255,90,45,0.4)] transition active:scale-98 flex items-center justify-center gap-2"
                >
                  <MapPin className="w-4 h-4" />
                  <span>{isLocating ? 'Détection de position...' : 'Utiliser ma position'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => finishOnboarding()}
                  className="w-full py-2.5 rounded-xl text-gray-400 hover:text-white font-medium text-xs transition"
                >
                  Continuer avec la recherche manuelle
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer Navigation Buttons (Steps 1 to 5) */}
        {step < 6 && (
          <div className="p-4 bg-[#0F1115] border-t border-white/10 flex items-center justify-between">
            {step > 1 ? (
              <button
                type="button"
                onClick={() => setStep(step - 1)}
                className="px-4 py-2 text-gray-400 hover:text-white font-medium text-xs transition"
              >
                Retour
              </button>
            ) : (
              <div />
            )}

            <button
              type="button"
              onClick={() => setStep(step + 1)}
              className="px-6 py-2.5 rounded-xl bg-[#FF5A2D] hover:bg-[#FF5A2D]/90 text-white font-semibold text-xs flex items-center gap-1.5 shadow-[0_0_15px_rgba(255,90,45,0.4)] active:scale-95 transition"
            >
              <span>Continuer</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};