'use client';

import React, { useState } from 'react';
import {
  Plus,
  Building2,
  Zap,
  TrendingUp,
  Eye,
  Heart,
  MessageCircle,
  Calendar,
  CheckCircle2,
  Clock,
  Sparkles,
  DollarSign,
  MapPin,
  Image as ImageIcon
} from 'lucide-react';
import { Property, VisitRequest, PropertyType, TransactionType } from '@/types';
import { ABIDJAN_COMMUNES, PROPERTY_FEATURES_LIST } from '@/lib/constants';
import { formatFCFA, formatFCFAOrUnknown, buildEntryCost } from '@/services/budgetService';

interface OwnerViewProps {
  ownerProperties: Property[];
  visitRequests: VisitRequest[];
  onAddProperty: (property: Property) => void;
  onBoostProperty: (propertyId: string) => void;
  onUpdateVisitStatus: (visitId: string, status: VisitRequest['status']) => void;
  babiCoins: number;
  onOpenCoins: () => void;
}

export const OwnerView: React.FC<OwnerViewProps> = ({
  ownerProperties,
  visitRequests,
  onAddProperty,
  onBoostProperty,
  onUpdateVisitStatus,
  babiCoins,
  onOpenCoins
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'listings' | 'visits' | 'publish'>('listings');

  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<PropertyType>('appartement');
  const [transaction, setTransaction] = useState<TransactionType>('location');
  const [price, setPrice] = useState<number>(200000);
  const [commune, setCommune] = useState('Cocody');
  const [neighborhood, setNeighborhood] = useState('Angré 8ème Tranche');
  const [landmark, setLandmark] = useState('Carrefour Pétro Ivoire');
  const [bedrooms, setBedrooms] = useState<number>(2);
  const [bathrooms, setBathrooms] = useState<number>(2);
  const [areaSqm, setAreaSqm] = useState<number>(85);
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>(['parking', 'clim', 'securite']);
  const [imageUrl, setImageUrl] = useState(
    'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1000&q=80'
  );
  // Postes du coût d'entrée : vides tant que l'annonceur ne les déclare pas.
  const [cautionMois, setCautionMois] = useState<string>('');
  const [avanceMois, setAvanceMois] = useState<string>('');
  const [fraisAgence, setFraisAgence] = useState<string>('');
  const [fraisDossier, setFraisDossier] = useState<string>('');
  const [publishedSuccess, setPublishedSuccess] = useState(false);

  const toggleFeature = (id: string) => {
    if (selectedFeatures.includes(id)) {
      setSelectedFeatures(selectedFeatures.filter((f) => f !== id));
    } else {
      setSelectedFeatures([...selectedFeatures, id]);
    }
  };

  const toDeclared = (value: string): number | null => (value.trim() === '' ? null : Number(value));

  const calculatedCost = buildEntryCost({
    loyer: price,
    cautionMois: toDeclared(cautionMois),
    avanceMois: toDeclared(avanceMois),
    fraisAgence: toDeclared(fraisAgence),
    fraisDossier: toDeclared(fraisDossier)
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newProp: Property = {
      id: `prop-custom-${Date.now()}`,
      title,
      description,
      type,
      transaction,
      price,
      currency: 'XOF',
      city: 'Abidjan',
      commune,
      neighborhood,
      landmark,
      latitude: 5.37,
      longitude: -3.98,
      bedrooms,
      bathrooms,
      areaSqm,
      images: [
        {
          id: 'img-1',
          url: imageUrl || 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1000&q=80',
          isMain: true,
          isPrimary: true
        }
      ],
      features: selectedFeatures,
      entryCost: calculatedCost,
      advertiser: {
        id: 'adv-me',
        name: 'Mon Agence / Bailleur',
        type: 'agence',
        phone: '+225 07 00 11 22',
        whatsapp: '22507001122',
        agencyName: 'BABI Immo Pro Partner',
        isVerified: false,
        verifications: [],
        rating: 4.9,
        reviewCount: 14
      },
      // Le badge « vérifié » est accordé par la modération, jamais par l'annonceur.
      isVerified: false,
      isBoosted: false,
      isAvailable: true,
      availableFrom: 'Immédiatement',
      viewsCount: 0,
      likesCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    onAddProperty(newProp);
    setPublishedSuccess(true);
    setTimeout(() => {
      setPublishedSuccess(false);
      setActiveSubTab('listings');
    }, 1800);
  };

  return (
    <div id="owner-dashboard" className="w-full max-w-md mx-auto px-4 py-4 space-y-4 pb-24 text-white">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-extrabold text-white">
            Espace Bailleur & Pro
          </h2>
          <p className="text-xs text-gray-400">
            Gérez vos annonces et contacts à Abidjan
          </p>
        </div>

        <button
          onClick={() => setActiveSubTab('publish')}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-[#FF5A2D] hover:bg-[#FF5A2D]/90 text-white text-xs font-bold shadow-[0_0_15px_rgba(255,90,45,0.4)] transition active:scale-95"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Déposer une annonce</span>
        </button>
      </div>

      {/* Sub-tabs switcher */}
      <div className="flex rounded-2xl bg-[#16181D] border border-white/10 p-1.5 text-xs font-bold">
        <button
          onClick={() => setActiveSubTab('listings')}
          className={`flex-1 py-2 rounded-xl transition ${
            activeSubTab === 'listings'
              ? 'bg-[#FF5A2D] text-white shadow-[0_0_15px_rgba(255,90,45,0.4)]'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          Mes Biens ({ownerProperties.length})
        </button>
        <button
          onClick={() => setActiveSubTab('visits')}
          className={`flex-1 py-2 rounded-xl transition relative ${
            activeSubTab === 'visits'
              ? 'bg-[#FF5A2D] text-white shadow-[0_0_15px_rgba(255,90,45,0.4)]'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          Visites ({visitRequests.length})
          {visitRequests.filter((v) => v.status === 'demandee').length > 0 && (
            <span className="w-2 h-2 rounded-full bg-[#FFD700] inline-block ml-1" />
          )}
        </button>
        <button
          onClick={() => setActiveSubTab('publish')}
          className={`flex-1 py-2 rounded-xl transition ${
            activeSubTab === 'publish'
              ? 'bg-[#FF5A2D] text-white shadow-[0_0_15px_rgba(255,90,45,0.4)]'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          + Publier
        </button>
      </div>

      {/* SUBTAB 1: Mes Biens */}
      {activeSubTab === 'listings' && (
        <div className="space-y-3">
          {ownerProperties.map((prop) => (
            <div
              key={prop.id}
              className="p-4 rounded-2xl bg-[#16181D] border border-white/10 shadow-lg space-y-3"
            >
              <div className="flex gap-3">
                <img
                  src={prop.images[0]?.url}
                  alt={prop.title}
                  className="w-20 h-20 rounded-xl object-cover border border-white/10"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-sm text-white font-mono">
                      {formatFCFA(prop.price)}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        prop.isBoosted
                          ? 'bg-[#FFD700] text-black font-black'
                          : 'bg-[#4CAF50]/20 text-[#4CAF50] border border-[#4CAF50]/30'
                      }`}
                    >
                      {prop.isBoosted ? '⚡ En Boost' : 'En ligne'}
                    </span>
                  </div>
                  <h4 className="font-bold text-xs line-clamp-1 mt-1 text-gray-200">{prop.title}</h4>
                  <div className="text-[11px] text-gray-400 mt-1">
                    {prop.commune} — {prop.neighborhood}
                  </div>
                </div>
              </div>

              {/* Performance Stats */}
              <div className="grid grid-cols-3 gap-2 py-2.5 px-3 rounded-xl bg-white/5 border border-white/10 text-center text-xs">
                <div>
                  <span className="text-[10px] text-gray-400 font-bold block">VUES</span>
                  <span className="font-extrabold text-white">148</span>
                </div>
                <div>
                  <span className="text-[10px] text-gray-400 font-bold block">LIKES</span>
                  <span className="font-extrabold text-[#4CAF50]">32</span>
                </div>
                <div>
                  <span className="text-[10px] text-gray-400 font-bold block">CONTACTS</span>
                  <span className="font-extrabold text-[#FF5A2D]">9</span>
                </div>
              </div>

              {/* Boost CTA */}
              <div className="flex items-center justify-between pt-1">
                <span className="text-xs text-gray-400">Booster au sommet du Swipe</span>
                <button
                  onClick={() => {
                    if (babiCoins < 50) {
                      onOpenCoins();
                    } else {
                      onBoostProperty(prop.id);
                    }
                  }}
                  disabled={prop.isBoosted}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#FFD700] hover:bg-[#FFD700]/90 text-stone-950 font-black text-xs transition disabled:opacity-40 shadow-[0_0_15px_rgba(255,215,0,0.3)]"
                >
                  <Zap className="w-3.5 h-3.5 fill-stone-950" />
                  <span>{prop.isBoosted ? 'Boost Actif' : 'Booster (50 Coins)'}</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* SUBTAB 2: Demandes de visites reçues */}
      {activeSubTab === 'visits' && (
        <div className="space-y-3">
          {visitRequests.length === 0 ? (
            <div className="py-12 text-center text-xs text-gray-400">
              Aucune demande de visite en attente.
            </div>
          ) : (
            visitRequests.map((visit) => (
              <div
                key={visit.id}
                className="p-4 rounded-2xl bg-[#16181D] border border-white/10 shadow-lg space-y-2.5 text-xs text-white"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-white">
                    {visit.userName}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      visit.status === 'demandee'
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        : visit.status === 'confirmee'
                        ? 'bg-[#4CAF50]/20 text-[#4CAF50] border border-[#4CAF50]/30'
                        : 'bg-white/10 text-gray-400'
                    }`}
                  >
                    {visit.status === 'demandee'
                      ? 'À confirmer'
                      : visit.status === 'confirmee'
                      ? 'Confirmée'
                      : visit.status}
                  </span>
                </div>

                <div className="text-gray-300">
                  Bien : <strong className="text-white">{visit.propertyTitle}</strong>
                </div>

                <div className="flex items-center gap-2 text-gray-400">
                  <Calendar className="w-3.5 h-3.5 text-[#FF5A2D]" />
                  <span>
                    Date : <strong className="text-white">{visit.requestedDate}</strong> ({visit.requestedTimeSlot})
                  </span>
                </div>

                <div className="flex items-center gap-2 text-gray-400">
                  <MessageCircle className="w-3.5 h-3.5 text-[#4CAF50]" />
                  <span>
                    Téléphone : <strong className="text-[#FF5A2D]">{visit.userPhone}</strong>
                  </span>
                </div>

                {visit.status === 'demandee' && (
                  <div className="flex gap-2 pt-2 border-t border-white/10">
                    <button
                      onClick={() => onUpdateVisitStatus(visit.id, 'confirmee')}
                      className="flex-1 py-2 rounded-xl bg-[#4CAF50] hover:bg-[#4CAF50]/90 text-white font-bold text-xs shadow-sm transition"
                    >
                      Confirmer la visite
                    </button>
                    <button
                      onClick={() => onUpdateVisitStatus(visit.id, 'annulee')}
                      className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-gray-300 font-semibold text-xs transition"
                    >
                      Décliner
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {/* SUBTAB 3: Formulaire Déposer une annonce (Section 21) */}
      {activeSubTab === 'publish' && (
        <div className="p-5 rounded-3xl bg-[#16181D] border border-white/10 shadow-xl space-y-4 text-white">
          <h3 className="font-extrabold text-base text-white">Déposer une nouvelle annonce</h3>

          {publishedSuccess ? (
            <div className="py-8 text-center space-y-2">
              <CheckCircle2 className="w-12 h-12 text-[#4CAF50] mx-auto" />
              <h4 className="font-bold text-base text-white">Annonce publiée avec succès !</h4>
              <p className="text-xs text-gray-400">
                Elle est désormais visible sur le flux Swipe d'Abidjan.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="font-bold block mb-1.5 text-gray-300">Titre de l'annonce</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ex: Superbe 3 pièces neuf avec ascenseur"
                  className="w-full p-3 rounded-2xl border border-white/10 bg-[#0F1115] text-white placeholder-gray-500 font-medium focus:outline-none focus:border-[#FF5A2D]"
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="font-bold block mb-1.5 text-gray-300">Transaction</label>
                  <select
                    value={transaction}
                    onChange={(e) => setTransaction(e.target.value as TransactionType)}
                    className="w-full p-3 rounded-2xl border border-white/10 bg-[#0F1115] text-white font-medium focus:outline-none focus:border-[#FF5A2D]"
                  >
                    <option value="location">Location</option>
                    <option value="vente">Vente</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold block mb-1.5 text-gray-300">Type de bien</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as PropertyType)}
                    className="w-full p-3 rounded-2xl border border-white/10 bg-[#0F1115] text-white font-medium focus:outline-none focus:border-[#FF5A2D]"
                  >
                    <option value="studio">Studio</option>
                    <option value="appartement">Appartement</option>
                    <option value="maison">Maison</option>
                    <option value="villa">Villa</option>
                    <option value="bureau">Bureau</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold block mb-1.5 text-gray-300">Prix (Loyer mensuel en FCFA)</label>
                <input
                  type="number"
                  required
                  min="25000"
                  step="5000"
                  value={price}
                  onChange={(e) => setPrice(Number(e.target.value))}
                  className="w-full p-3 rounded-2xl border border-white/10 bg-[#0F1115] font-black text-[#FF5A2D] text-sm font-mono focus:outline-none focus:border-[#FF5A2D]"
                />
              </div>

              {/* Coût d'entrée : uniquement ce que l'annonceur déclare */}
              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="font-bold block mb-1.5 text-gray-300">Caution (mois)</label>
                  <input
                    type="number"
                    min="0"
                    placeholder="Non renseigné"
                    value={cautionMois}
                    onChange={(e) => setCautionMois(e.target.value)}
                    className="w-full p-3 rounded-2xl border border-white/10 bg-[#0F1115] text-white placeholder:text-gray-600 focus:outline-none focus:border-[#FF5A2D]"
                  />
                </div>
                <div>
                  <label className="font-bold block mb-1.5 text-gray-300">Avance (mois)</label>
                  <input
                    type="number"
                    min="0"
                    placeholder="Non renseigné"
                    value={avanceMois}
                    onChange={(e) => setAvanceMois(e.target.value)}
                    className="w-full p-3 rounded-2xl border border-white/10 bg-[#0F1115] text-white placeholder:text-gray-600 focus:outline-none focus:border-[#FF5A2D]"
                  />
                </div>
                <div>
                  <label className="font-bold block mb-1.5 text-gray-300">Frais d'agence (FCFA)</label>
                  <input
                    type="number"
                    min="0"
                    step="5000"
                    placeholder="Non renseigné"
                    value={fraisAgence}
                    onChange={(e) => setFraisAgence(e.target.value)}
                    className="w-full p-3 rounded-2xl border border-white/10 bg-[#0F1115] text-white placeholder:text-gray-600 focus:outline-none focus:border-[#FF5A2D]"
                  />
                </div>
                <div>
                  <label className="font-bold block mb-1.5 text-gray-300">Frais de dossier (FCFA)</label>
                  <input
                    type="number"
                    min="0"
                    step="5000"
                    placeholder="Non renseigné"
                    value={fraisDossier}
                    onChange={(e) => setFraisDossier(e.target.value)}
                    className="w-full p-3 rounded-2xl border border-white/10 bg-[#0F1115] text-white placeholder:text-gray-600 focus:outline-none focus:border-[#FF5A2D]"
                  />
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-[#FF5A2D]/10 border border-[#FF5A2D]/30 text-[11px] space-y-1">
                <span className="font-bold text-[#FF5A2D] block">BABI BUDGET :</span>
                <div className="text-gray-300">
                  Coût d'entrée pour le locataire :{' '}
                  <strong className="text-white">{formatFCFAOrUnknown(calculatedCost.total)}</strong>
                  {calculatedCost.total === null
                    ? " — déclarez la caution et l'avance pour l'afficher aux candidats."
                    : ' (caution + avance + frais déclarés).'}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="font-bold block mb-1.5 text-gray-300">Commune</label>
                  <select
                    value={commune}
                    onChange={(e) => setCommune(e.target.value)}
                    className="w-full p-3 rounded-2xl border border-white/10 bg-[#0F1115] text-white font-medium focus:outline-none focus:border-[#FF5A2D]"
                  >
                    {ABIDJAN_COMMUNES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="font-bold block mb-1.5 text-gray-300">Quartier</label>
                  <input
                    type="text"
                    required
                    value={neighborhood}
                    onChange={(e) => setNeighborhood(e.target.value)}
                    placeholder="Ex: Angré 8ème Tranche"
                    className="w-full p-3 rounded-2xl border border-white/10 bg-[#0F1115] text-white placeholder-gray-500 focus:outline-none focus:border-[#FF5A2D]"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold block mb-1.5 text-gray-300">Repère local (facilite la visite)</label>
                <input
                  type="text"
                  value={landmark}
                  onChange={(e) => setLandmark(e.target.value)}
                  placeholder="Ex: Non loin de la Pharmacie des Arcades"
                  className="w-full p-3 rounded-2xl border border-white/10 bg-[#0F1115] text-white placeholder-gray-500 focus:outline-none focus:border-[#FF5A2D]"
                />
              </div>

              <div className="grid grid-cols-3 gap-2.5">
                <div>
                  <label className="font-bold block mb-1.5 text-gray-300">Chambres</label>
                  <input
                    type="number"
                    min="0"
                    value={bedrooms}
                    onChange={(e) => setBedrooms(Number(e.target.value))}
                    className="w-full p-3 rounded-2xl border border-white/10 bg-[#0F1115] text-white focus:outline-none focus:border-[#FF5A2D]"
                  />
                </div>
                <div>
                  <label className="font-bold block mb-1.5 text-gray-300">Salles d'eau</label>
                  <input
                    type="number"
                    min="1"
                    value={bathrooms}
                    onChange={(e) => setBathrooms(Number(e.target.value))}
                    className="w-full p-3 rounded-2xl border border-white/10 bg-[#0F1115] text-white focus:outline-none focus:border-[#FF5A2D]"
                  />
                </div>
                <div>
                  <label className="font-bold block mb-1.5 text-gray-300">Superficie (m²)</label>
                  <input
                    type="number"
                    min="15"
                    value={areaSqm}
                    onChange={(e) => setAreaSqm(Number(e.target.value))}
                    className="w-full p-3 rounded-2xl border border-white/10 bg-[#0F1115] text-white focus:outline-none focus:border-[#FF5A2D]"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold block mb-1.5 text-gray-300">Photo principale (URL)</label>
                <input
                  type="url"
                  required
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  className="w-full p-3 rounded-2xl border border-white/10 bg-[#0F1115] text-white text-xs placeholder-gray-500 focus:outline-none focus:border-[#FF5A2D]"
                />
              </div>

              <div>
                <label className="font-bold block mb-1.5 text-gray-300">Description détaillée</label>
                <textarea
                  rows={3}
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Décrivez les atouts, l'aération, la sécurité, l'accès..."
                  className="w-full p-3 rounded-2xl border border-white/10 bg-[#0F1115] text-white placeholder-gray-500 focus:outline-none focus:border-[#FF5A2D]"
                />
              </div>

              <button
                type="submit"
                className="w-full py-4 rounded-2xl bg-[#FF5A2D] hover:bg-[#FF5A2D]/90 text-white font-black text-xs shadow-[0_0_20px_rgba(255,90,45,0.4)] transition active:scale-98"
              >
                Publier sur BABI SWIPE IMMO
              </button>
            </form>
          )}
        </div>
      )}
    </div>
  );
};