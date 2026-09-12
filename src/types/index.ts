export type TransactionType = 'location' | 'vente';

export type PropertyType =
  | 'studio'
  | 'appartement'
  | 'maison'
  | 'villa'
  | 'chambre'
  | 'terrain'
  | 'bureau'
  | 'commerce'
  | 'autre';

export type VerificationLevel =
  | 'phone_verified'
  | 'id_verified'
  | 'owner_verified'
  | 'agency_verified'
  | 'listing_verified'
  | 'visit_verified';

export interface PropertyImage {
  id: string;
  url: string;
  isMain: boolean;
  isPrimary?: boolean;
  caption?: string;
}

/**
 * Coût d'entrée déclaré par l'annonceur.
 * Un poste inconnu vaut `null` : il s'affiche « Non renseigné » et rend le
 * total indisponible. Aucun montant n'est extrapolé.
 */
export interface EntryCost {
  loyer: number;
  cautionMois: number | null;
  avanceMois: number | null;
  fraisAgence: number | null;
  fraisDossier: number | null;
  /** Null dès qu'un poste obligatoire (caution, avance) est inconnu. */
  total: number | null;
}

export interface Advertiser {
  id: string;
  name: string;
  type: 'particulier' | 'agence';
  agencyName?: string;
  phone: string;
  whatsapp: string;
  avatarUrl?: string;
  verifications: VerificationLevel[];
  rating?: number;
  reviewCount?: number;
  joinedDate?: string;
  isPro?: boolean;
  isVerified?: boolean;
}

export interface Property {
  id: string;
  title: string;
  description: string;
  transaction: TransactionType;
  type: PropertyType;
  price: number; // FCFA per month or total sale price
  currency: 'XOF';
  city: string; // Abidjan, Yamoussoukro, etc.
  commune: string; // Cocody, Marcory, Plateau, etc.
  neighborhood: string; // Angré, Zone 4, Riviera 3, etc.
  landmark?: string; // Repère (ex: "Carrefour Duncan, à 50m de la pharmacie")
  latitude: number;
  longitude: number;
  distanceKm?: number;
  bedrooms: number;
  bathrooms: number;
  areaSqm: number;
  features: string[]; // ['clim', 'parking', 'gardien', 'balcon', 'piscine', 'eau_continue', 'groupe_electrogene', 'fibre_optique']
  images: PropertyImage[];
  advertiser: Advertiser;
  entryCost: EntryCost;
  availableFrom: string;
  isAvailable: boolean;
  isVerified?: boolean;
  isBoosted?: boolean;
  boostExpiresAt?: string;
  isFeatured?: boolean;
  fraudRiskScore?: number; // Internal: 0 (safe) to 100 (high risk)
  babiScore?: {
    total: number; // 0 - 100%
    reasons: string[];
  };
  createdAt: string;
  updatedAt?: string;
  viewsCount: number;
  likesCount: number;
}

export interface UserPreferences {
  transaction: TransactionType;
  propertyTypes: PropertyType[];
  budgetMin?: number;
  budgetMax?: number;
  city: string;
  communes: string[];
  bedrooms?: number;
  features: string[];
  userLat?: number;
  userLng?: number;
  radiusKm: number; // 1, 3, 5, 10, 20, 50
  userIncome?: number; // Monthly income for Babi Budget
  onlyVerified?: boolean;
  sortBy?: PropertySortBy;
}

export type PropertySortBy = 'score' | 'price_asc' | 'price_desc' | 'distance' | 'recent';

export interface SwipeAction {
  id: string;
  propertyId: string;
  direction: 'left' | 'right' | 'super';
  timestamp: string;
}

export interface VisitRequest {
  id: string;
  propertyId: string;
  propertyTitle: string;
  propertyImage: string;
  userName: string;
  userPhone: string;
  requestedDate: string;
  requestedTimeSlot: string;
  note?: string;
  status: 'demandee' | 'confirmee' | 'refusee' | 'autre_creneau' | 'effectuee' | 'annulee';
  advertiserId: string;
  createdAt: string;
}

export interface CrmLead {
  id: string;
  propertyId: string;
  userName: string;
  userPhone: string;
  userEmail?: string;
  status: 'nouveau' | 'contacte' | 'visite_programmee' | 'visite_effectuee' | 'negociation' | 'conclu';
  budget: number;
  createdAt: string;
  notes?: string;
}

export interface CoinPack {
  id: string;
  coins: number;
  bonusCoins: number;
  priceFcfa: number;
  popular?: boolean;
}

export interface CoinTransaction {
  id: string;
  type: 'credit' | 'debit';
  amount: number;
  reason: string;
  timestamp: string;
  referenceId?: string;
}

export type MobileMoneyProvider = 'wave' | 'orange_money' | 'mtn_momo' | 'moov_money';
export type MobileMoneyOperator = 'wave' | 'orange' | 'mtn' | 'moov';

export interface PaymentOrder {
  id: string;
  userId: string;
  amountFcfa: number;
  coinsAllocated?: number;
  productType: 'babi_coins' | 'babi_priority' | 'listing_boost' | 'pro_subscription';
  provider: MobileMoneyProvider;
  operator?: string;
  status: 'pending' | 'success' | 'failed' | 'cancelled' | 'refunded';
  externalRef: string;
  errorMessage?: string;
  createdAt: string;
}

export interface SavedAlert {
  id: string;
  title: string;
  transaction: TransactionType;
  commune: string;
  type: PropertyType;
  maxBudget: number;
  notifyInstant: boolean;
  createdAt: string;
}

export type ReportReason =
  | 'arnaque'
  | 'faux_prix'
  | 'fausse_photo'
  | 'indisponible'
  | 'mauvaise_localisation'
  | 'inapproprie'
  | 'autre';

export interface ReportItem {
  id: string;
  propertyId: string;
  propertyTitle?: string;
  reporterId?: string;
  reason: ReportReason;
  description: string;
  reporterPhone?: string;
  createdAt: string;
  status: 'pending' | 'resolved' | 'dismissed';
}

export type ReportCase = ReportItem;

