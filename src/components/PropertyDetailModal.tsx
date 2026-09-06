'use client';

import React, { useState } from 'react';
import {
  X,
  Heart,
  Share2,
  Phone,
  MessageCircle,
  Calendar,
  AlertTriangle,
  MapPin,
  ShieldCheck,
  Sparkles,
  Bed,
  Bath,
  Maximize,
  Coins,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Clock,
  User,
  Info
} from 'lucide-react';
import { Property, UserPreferences, VisitRequest } from '@/types';
import { formatFCFA, assessBudgetSuitability } from '@/services/budgetService';
import { calculateBabiScore } from '@/services/babiScoreService';
import { formatDistance } from '@/services/geoService';
import { PROPERTY_FEATURES_LIST } from '@/lib/constants';

interface PropertyDetailModalProps {
  property: Property | null;
  onClose: () => void;
  userPreferences: UserPreferences;
  isFavorite: boolean;
  onToggleFavorite: (id: string) => void;
  onRequestVisit: (visit: VisitRequest) => void;
  onReportProperty: (propertyId: string, reason: string, description: string) => void;
}

export const PropertyDetailModal: React.FC<PropertyDetailModalProps> = ({
  property,
  onClose,
  userPreferences,
  isFavorite,
  onToggleFavorite,
  onRequestVisit,
  onReportProperty
}) => {
  const [currentImgIndex, setCurrentImgIndex] = useState(0);
  const [showVisitModal, setShowVisitModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [visitDate, setVisitDate] = useState('');
  const [visitSlot, setVisitSlot] = useState('10h00 - 12h00');
  const [userName, setUserName] = useState('');
  const [userPhone, setUserPhone] = useState('');
  const [visitSent, setVisitSent] = useState(false);

  // Report state
  const [reportReason, setReportReason] = useState<string>('arnaque');
  const [reportText, setReportText] = useState('');
  const [reportSent, setReportSent] = useState(false);

  if (!property) return null;

  const babiScore = calculateBabiScore(property, userPreferences, property.distanceKm);
  const budgetAssessment = assessBudgetSuitability(
    property.entryCost,
    userPreferences.budgetMax ? userPreferences.budgetMax * 5 : undefined,
    userPreferences.userIncome
  );

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: property.title,
          text: `Découvre ce bien à ${property.commune} sur BABI SWIPE IMMO : ${formatFCFA(property.price)}`,
          url: window.location.href
        });
      } catch {
        // user cancelled
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Lien copié dans le presse-papier !');
    }
  };

  const handleWhatsApp = () => {
    const text = encodeURIComponent(
      `Bonjour, j'ai vu votre annonce "${property.title}" à ${property.commune} sur l'application BABI SWIPE IMMO. Est-elle toujours disponible pour une visite ?`
    );
    window.open(`https://wa.me/${property.advertiser.whatsapp}?text=${text}`, '_blank');
  };

  const handleCall = () => {
    window.open(`tel:${property.advertiser.phone}`, '_self');
  };

  const submitVisit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!visitDate || !userPhone) return;

    onRequestVisit({
      id: `vis-${Date.now()}`,
      propertyId: property.id,
      propertyTitle: property.title,
      propertyImage: property.images[0]?.url || '',
      userName: userName || 'Utilisateur BABI',
      userPhone,
      requestedDate: visitDate,
      requestedTimeSlot: visitSlot,
      status: 'demandee',
      advertiserId: property.advertiser.id,
      createdAt: new Date().toISOString()
    });

    setVisitSent(true);
    setTimeout(() => {
      setVisitSent(false);
      setShowVisitModal(false);
    }, 2000);
  };

  const submitReport = (e: React.FormEvent) => {
    e.preventDefault();
    onReportProperty(property.id, reportReason, reportText || 'Signalement envoyé par utilisateur');
    setReportSent(true);
    setTimeout(() => {
      setReportSent(false);
      setShowReportModal(false);
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-sm p-0 sm:p-4">
      <div
        id="property-detail-sheet"
        className="w-full sm:max-w-xl bg-[#16181D] rounded-t-[32px] sm:rounded-[32px] border border-white/10 shadow-2xl overflow-hidden flex flex-col max-h-[94vh] animate-in slide-in-from-bottom duration-300 text-white"
      >
        {/* Sticky Header with Close & Action buttons */}
        <div className="relative w-full h-72 sm:h-80 bg-stone-950 flex-shrink-0">
          <img
            src={property.images[currentImgIndex]?.url || property.images[0]?.url}
            alt={property.title}
            className="w-full h-full object-cover"
          />

          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#16181D] via-black/20 to-black/60 pointer-events-none" />

          {/* Top Bar Floating Controls */}
          <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-10">
            <button
              onClick={onClose}
              className="p-2.5 rounded-full bg-[#0F1115]/70 text-white backdrop-blur-md border border-white/10 hover:bg-[#0F1115] transition active:scale-95"
              aria-label="Fermer la fiche"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2">
              <button
                onClick={handleShare}
                className="p-2.5 rounded-full bg-[#0F1115]/70 text-white backdrop-blur-md border border-white/10 hover:bg-[#0F1115] transition active:scale-95"
                title="Partager"
              >
                <Share2 className="w-5 h-5" />
              </button>
              <button
                onClick={() => onToggleFavorite(property.id)}
                className={`p-2.5 rounded-full backdrop-blur-md border border-white/10 transition active:scale-95 ${
                  isFavorite
                    ? 'bg-[#FF5A2D] text-white shadow-[0_0_15px_rgba(255,90,45,0.6)]'
                    : 'bg-[#0F1115]/70 text-white hover:bg-[#0F1115]'
                }`}
                title="Ajouter aux favoris"
              >
                <Heart className={`w-5 h-5 ${isFavorite ? 'fill-white' : ''}`} />
              </button>
            </div>
          </div>

          {/* Photo Pagination Arrows */}
          {property.images.length > 1 && (
            <>
              <button
                onClick={() =>
                  setCurrentImgIndex(
                    (prev) => (prev - 1 + property.images.length) % property.images.length
                  )
                }
                className="absolute left-3 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-black/60 text-white backdrop-blur-sm border border-white/10 hover:bg-black/80 transition"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={() =>
                  setCurrentImgIndex((prev) => (prev + 1) % property.images.length)
                }
                className="absolute right-3 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-black/60 text-white backdrop-blur-sm border border-white/10 hover:bg-black/80 transition"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </>
          )}

          {/* Photo Dots */}
          <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5">
            {property.images.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentImgIndex(idx)}
                className={`h-1.5 rounded-full transition-all ${
                  idx === currentImgIndex ? 'w-6 bg-[#FF5A2D]' : 'w-2 bg-white/40'
                }`}
              />
            ))}
          </div>

          {/* Bottom title & price in image */}
          <div className="absolute bottom-6 left-5 right-5 text-white pointer-events-none">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-black tracking-tight text-white drop-shadow-md">
                {formatFCFA(property.price)}
              </span>
              {property.transaction === 'location' && (
                <span className="text-xs text-gray-300 font-normal">/ mois</span>
              )}
            </div>
          </div>
        </div>

        {/* Scrollable Body Content */}
        <div className="overflow-y-auto flex-1 p-5 space-y-6">
          {/* Title & Badges */}
          <div>
            <div className="flex items-center gap-2 flex-wrap mb-2">
              <span className="px-2.5 py-1 rounded-md bg-[#FF5A2D]/15 text-[#FF5A2D] border border-[#FF5A2D]/30 text-xs font-bold uppercase tracking-wider">
                {property.transaction === 'location' ? 'Location' : 'Vente'} • {property.type}
              </span>
              {property.isBoosted && (
                <span className="px-2.5 py-1 rounded-md bg-amber-500/15 text-[#FFD700] border border-amber-500/30 text-xs font-bold">
                  ⚡ Boosté
                </span>
              )}
              <span className="text-xs text-gray-400">
                Dispo : <strong className="text-gray-200">{property.availableFrom}</strong>
              </span>
            </div>

            <h1 className="text-xl font-extrabold text-white leading-tight">
              {property.title}
            </h1>

            <div className="flex items-center gap-2 text-xs text-gray-300 mt-2">
              <MapPin className="w-4 h-4 text-[#FF5A2D] flex-shrink-0" />
              <span>
                {property.city}, {property.commune} — {property.neighborhood}
              </span>
              <span>•</span>
              <span className="font-semibold text-gray-300">
                {formatDistance(property.distanceKm)} de vous
              </span>
            </div>

            {property.landmark && (
              <div className="mt-2.5 p-3 rounded-2xl bg-[#0F1115] border border-white/5 text-xs text-gray-300 flex items-start gap-2.5">
                <Info className="w-4 h-4 text-[#FF5A2D] flex-shrink-0 mt-0.5" />
                <div>
                  <strong className="text-white">Repère local :</strong> {property.landmark}
                </div>
              </div>
            )}
          </div>

          {/* Quick Specs Grid */}
          <div className="grid grid-cols-3 gap-3 p-3 rounded-2xl bg-[#0F1115] border border-white/10 text-center">
            <div>
              <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider block">Chambres</span>
              <div className="flex items-center justify-center gap-1.5 mt-1 text-white font-bold text-base">
                <Bed className="w-4 h-4 text-[#FF5A2D]" />
                <span>{property.bedrooms}</span>
              </div>
            </div>
            <div>
              <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider block">Salles d'eau</span>
              <div className="flex items-center justify-center gap-1.5 mt-1 text-white font-bold text-base">
                <Bath className="w-4 h-4 text-gray-400" />
                <span>{property.bathrooms}</span>
              </div>
            </div>
            <div>
              <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider block">Superficie</span>
              <div className="flex items-center justify-center gap-1.5 mt-1 text-white font-bold text-base">
                <Maximize className="w-4 h-4 text-gray-400" />
                <span>{property.areaSqm} m²</span>
              </div>
            </div>
          </div>

          {/* Babi Score Section */}
          <div className="p-4 rounded-3xl bg-[#4CAF50]/10 border border-[#4CAF50]/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#4CAF50] text-white flex items-center justify-center shadow-[0_0_15px_rgba(76,175,80,0.4)]">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm text-white">
                    BABI SCORE : {babiScore.total}%
                  </h3>
                  <p className="text-[11px] text-gray-400">
                    Score de compatibilité avec vos critères
                  </p>
                </div>
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-black bg-[#4CAF50] text-white">
                {babiScore.total >= 80 ? 'Idéal pour vous' : 'Bonne compatibilité'}
              </span>
            </div>

            <div className="mt-3 flex flex-wrap gap-1.5">
              {babiScore.reasons.map((reason, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-white/5 border border-white/10 text-[11px] font-semibold text-gray-200"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#4CAF50]" />
                  <span>{reason}</span>
                </span>
              ))}
            </div>
          </div>

          {/* Babi Budget Section (Sleek Calculator) */}
          {property.transaction === 'location' && (
            <div className="bg-[#0F1115] rounded-3xl p-5 border border-white/10 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Coins className="w-4 h-4 text-[#FFD700]" />
                  <h3 className="text-[#FF5A2D] text-xs font-bold uppercase tracking-widest">
                    Babi Budget Calculator
                  </h3>
                </div>
              </div>

              <div className="space-y-2 text-xs pt-1">
                <div className="flex justify-between p-2 rounded-xl bg-white/5 text-gray-300">
                  <span className="text-gray-400">Loyer Mensuel :</span>
                  <span className="font-mono text-white font-semibold">{formatFCFA(property.price)}</span>
                </div>
                <div className="flex justify-between p-2 rounded-xl bg-white/5 text-gray-300">
                  <span className="text-gray-400">Caution ({property.entryCost.cautionMois} mois) :</span>
                  <span className="font-mono text-white font-semibold">{formatFCFA(property.price * property.entryCost.cautionMois)}</span>
                </div>
                <div className="flex justify-between p-2 rounded-xl bg-white/5 text-gray-300">
                  <span className="text-gray-400">Avance ({property.entryCost.avanceMois} mois) :</span>
                  <span className="font-mono text-white font-semibold">{formatFCFA(property.price * property.entryCost.avanceMois)}</span>
                </div>
                <div className="flex justify-between p-2 rounded-xl bg-white/5 text-gray-300">
                  <span className="text-gray-400">Frais d'agence :</span>
                  <span className="font-mono text-white font-semibold">
                    {property.entryCost.fraisAgence > 0 ? formatFCFA(property.entryCost.fraisAgence) : '0 FCFA (Direct)'}
                  </span>
                </div>
                <div className="flex justify-between p-2 rounded-xl bg-white/5 text-gray-300">
                  <span className="text-gray-400">Frais de dossier :</span>
                  <span className="font-mono text-white font-semibold">{formatFCFA(property.entryCost.fraisDossier)}</span>
                </div>
                
                <div className="h-px bg-white/10 my-2"></div>
                <div className="flex justify-between text-base font-bold items-center pt-1">
                  <span className="text-white text-xs tracking-wider uppercase font-bold">COÛT D'ENTRÉE</span>
                  <span className="text-[#FF5A2D] text-lg font-black">{formatFCFA(property.entryCost.total)}</span>
                </div>
              </div>

              {/* Budget Assessment Verdict */}
              <div className={`p-3 rounded-2xl text-xs font-semibold flex items-center gap-2 border ${
                budgetAssessment.isCompatible
                  ? 'bg-[#4CAF50]/15 text-[#4CAF50] border-[#4CAF50]/30'
                  : 'bg-rose-500/15 text-rose-300 border-rose-500/30'
              }`}>
                <span>{budgetAssessment.isCompatible ? '✅' : '⚠️'}</span>
                <span>{budgetAssessment.message}</span>
              </div>
            </div>
          )}

          {/* Description */}
          <div>
            <h3 className="font-bold text-sm text-white mb-2 uppercase tracking-wider text-xs">
              Description du logement
            </h3>
            <p className="text-sm text-gray-300 leading-relaxed whitespace-pre-line">
              {property.description}
            </p>
          </div>

          {/* Amenities & Equipments */}
          <div>
            <h3 className="font-bold text-sm text-white mb-2.5 uppercase tracking-wider text-xs">
              Équipements & Prestations
            </h3>
            <div className="grid grid-cols-2 gap-2">
              {PROPERTY_FEATURES_LIST.map((feat) => {
                const hasFeature = property.features.includes(feat.id);
                return (
                  <div
                    key={feat.id}
                    className={`p-2.5 rounded-xl border text-xs flex items-center justify-between transition ${
                      hasFeature
                        ? 'border-white/10 bg-white/5 text-white font-medium'
                        : 'border-white/5 bg-transparent text-gray-600 opacity-40'
                    }`}
                  >
                    <span>{feat.label}</span>
                    {hasFeature && <CheckCircle2 className="w-3.5 h-3.5 text-[#4CAF50]" />}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Advertiser Profile Card & Verifications */}
          <div className="p-4 rounded-3xl bg-[#0F1115] border border-white/10 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img
                  src={property.advertiser.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'}
                  alt={property.advertiser.name}
                  className="w-11 h-11 rounded-full object-cover border-2 border-[#FF5A2D]"
                />
                <div>
                  <h4 className="font-bold text-sm text-white">
                    {property.advertiser.name}
                  </h4>
                  <span className="text-xs text-gray-400">
                    {property.advertiser.type === 'agence'
                      ? `Agence • ${property.advertiser.agencyName}`
                      : 'Propriétaire particulier'}
                  </span>
                </div>
              </div>

              {property.advertiser.rating && (
                <div className="text-right">
                  <span className="text-xs font-bold text-[#FFD700]">★ {property.advertiser.rating}</span>
                  <span className="block text-[10px] text-gray-500">
                    ({property.advertiser.reviewCount} avis)
                  </span>
                </div>
              )}
            </div>

            {/* Badges vérifiés BABI IMMO */}
            <div className="flex flex-wrap gap-1.5 pt-1">
              {property.advertiser.verifications.map((v) => {
                let label = 'Vérifié';
                if (v === 'phone_verified') label = 'Téléphone vérifié';
                if (v === 'id_verified') label = 'Identité CNI vérifiée';
                if (v === 'agency_verified') label = 'Agence immatriculée RCCM';
                if (v === 'owner_verified') label = 'Titre de propriété vérifié';
                if (v === 'listing_verified') label = 'Annonce inspectée sur place';
                if (v === 'visit_verified') label = 'Visite certifiée';
                return (
                  <span
                    key={v}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-gray-300 text-[10px] font-bold"
                  >
                    <ShieldCheck className="w-3 h-3 text-[#FFD700]" />
                    <span>{label}</span>
                  </span>
                );
              })}
            </div>
          </div>

          {/* Report Button */}
          <div className="pt-2 text-center">
            <button
              onClick={() => setShowReportModal(true)}
              className="text-xs text-gray-500 hover:text-rose-400 font-semibold inline-flex items-center gap-1 transition"
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Signaler un problème ou une arnaque</span>
            </button>
          </div>
        </div>

        {/* Action Sticky Footer */}
        <div className="p-4 bg-[#0F1115] border-t border-white/10 grid grid-cols-3 gap-2">
          {/* Planifier visite */}
          <button
            onClick={() => setShowVisitModal(true)}
            className="py-3 px-2 rounded-2xl bg-[#2A2A2A] hover:bg-[#333] border border-white/10 text-white font-bold text-xs flex flex-col items-center justify-center gap-1 transition active:scale-95"
          >
            <Calendar className="w-4 h-4 text-[#FFD700]" />
            <span>Visiter</span>
          </button>

          {/* WhatsApp Direct */}
          <button
            onClick={handleWhatsApp}
            className="py-3 px-2 rounded-2xl bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold text-xs flex flex-col items-center justify-center gap-1 shadow-md transition active:scale-95"
          >
            <MessageCircle className="w-4 h-4 fill-white stroke-none" />
            <span>WhatsApp</span>
          </button>

          {/* Appeler */}
          <button
            onClick={handleCall}
            className="py-3 px-2 rounded-2xl bg-[#FF5A2D] hover:bg-[#FF5A2D]/90 text-white font-bold text-xs flex flex-col items-center justify-center gap-1 shadow-[0_0_20px_rgba(255,90,45,0.4)] transition active:scale-95"
          >
            <Phone className="w-4 h-4" />
            <span>Appeler</span>
          </button>
        </div>

        {/* Modal Planifier une visite */}
        {showVisitModal && (
          <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="w-full max-w-sm rounded-3xl bg-[#1A1C22] border border-white/10 p-5 shadow-2xl text-white space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-white/10">
                <h3 className="font-bold text-base flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-[#FF5A2D]" />
                  <span>Planifier une visite</span>
                </h3>
                <button
                  onClick={() => setShowVisitModal(false)}
                  className="p-1 rounded-full text-gray-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {visitSent ? (
                <div className="py-6 text-center space-y-2">
                  <CheckCircle2 className="w-12 h-12 text-[#4CAF50] mx-auto animate-bounce" />
                  <h4 className="font-bold text-base">Demande envoyée !</h4>
                  <p className="text-xs text-gray-400">
                    L'annonceur vous répondra sous peu par SMS ou WhatsApp.
                  </p>
                </div>
              ) : (
                <form onSubmit={submitVisit} className="space-y-3 text-xs">
                  <div>
                    <label className="font-semibold block mb-1 text-gray-300">Votre Nom & Prénom</label>
                    <input
                      type="text"
                      required
                      placeholder="Ex: Kouamé Jean"
                      value={userName}
                      onChange={(e) => setUserName(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-white/10 bg-[#0F1115] text-white focus:outline-none focus:border-[#FF5A2D]"
                    />
                  </div>

                  <div>
                    <label className="font-semibold block mb-1 text-gray-300">Téléphone (WhatsApp)</label>
                    <input
                      type="tel"
                      required
                      placeholder="+225 07..."
                      value={userPhone}
                      onChange={(e) => setUserPhone(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-white/10 bg-[#0F1115] text-white focus:outline-none focus:border-[#FF5A2D]"
                    />
                  </div>

                  <div>
                    <label className="font-semibold block mb-1 text-gray-300">Date souhaitée</label>
                    <input
                      type="date"
                      required
                      value={visitDate}
                      onChange={(e) => setVisitDate(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-white/10 bg-[#0F1115] text-white focus:outline-none focus:border-[#FF5A2D]"
                    />
                  </div>

                  <div>
                    <label className="font-semibold block mb-1 text-gray-300">Créneau horaire</label>
                    <select
                      value={visitSlot}
                      onChange={(e) => setVisitSlot(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-white/10 bg-[#0F1115] text-white focus:outline-none focus:border-[#FF5A2D]"
                    >
                      <option value="09h00 - 11h00">Matinée (09h00 - 11h00)</option>
                      <option value="11h00 - 13h00">Midi (11h00 - 13h00)</option>
                      <option value="14h00 - 16h00">Après-midi (14h00 - 16h00)</option>
                      <option value="16h00 - 18h00">Fin de journée (16h00 - 18h00)</option>
                    </select>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 rounded-xl bg-[#FF5A2D] hover:bg-[#FF5A2D]/90 text-white font-bold text-xs mt-2 transition shadow-[0_0_15px_rgba(255,90,45,0.4)]"
                  >
                    Confirmer la demande de visite
                  </button>
                </form>
              )}
            </div>
          </div>
        )}

        {/* Modal Signaler (Anti-fraude) */}
        {showReportModal && (
          <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="w-full max-w-sm rounded-3xl bg-[#1A1C22] border border-white/10 p-5 shadow-2xl text-white space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-white/10">
                <h3 className="font-bold text-base flex items-center gap-2 text-rose-500">
                  <AlertTriangle className="w-4 h-4" />
                  <span>Signaler cette annonce</span>
                </h3>
                <button
                  onClick={() => setShowReportModal(false)}
                  className="p-1 rounded-full text-gray-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {reportSent ? (
                <div className="py-6 text-center space-y-2">
                  <CheckCircle2 className="w-12 h-12 text-[#4CAF50] mx-auto" />
                  <h4 className="font-bold text-base">Signalement enregistré</h4>
                  <p className="text-xs text-gray-400">
                    Merci pour votre vigilance. L'équipe d'administration examine le dossier.
                  </p>
                </div>
              ) : (
                <form onSubmit={submitReport} className="space-y-3 text-xs">
                  <div>
                    <label className="font-semibold block mb-1 text-gray-300">Motif du signalement</label>
                    <select
                      value={reportReason}
                      onChange={(e) => setReportReason(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-white/10 bg-[#0F1115] text-white focus:outline-none focus:border-rose-500"
                    >
                      <option value="arnaque">Soupçon d'arnaque / faux bailleur</option>
                      <option value="faux_prix">Faux prix ou surcoût caché</option>
                      <option value="fausse_photo">Photos volées / non représentatives</option>
                      <option value="indisponible">Logement déjà loué / indisponible</option>
                      <option value="mauvaise_localisation">Mauvaise localisation indiquée</option>
                      <option value="autre">Autre motif</option>
                    </select>
                  </div>

                  <div>
                    <label className="font-semibold block mb-1 text-gray-300">Précisions utiles</label>
                    <textarea
                      rows={3}
                      placeholder="Expliquez brièvement ce qui vous semble suspect..."
                      value={reportText}
                      onChange={(e) => setReportText(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-white/10 bg-[#0F1115] text-white focus:outline-none focus:border-rose-500"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs mt-2 transition"
                  >
                    Envoyer à l'équipe sécurité
                  </button>
                </form>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};