import { Property, CoinPack } from '@/types';
/**
 * DONNÉES DE DÉMONSTRATION — développement local uniquement.
 * Consommées via `@/mocks/localStore`, qui refuse de les servir hors dev.
 */
export const INITIAL_PROPERTIES: Property[] = [
  {
    id: 'prop-1',
    title: 'Superbe 3 Pièces Meublé avec Balcon et Vue Dégagée',
    description: 'Magnifique appartement situé dans un quartier sécurisé et paisible de Cocody Angré 8ème Tranche. Salon lumineux avec baie vitrée, cuisine américaine aménagée, climatisation split dans toutes les pièces, forage d\'eau pour zéro coupure et gardiennage 24/7.',
    transaction: 'location',
    type: 'appartement',
    price: 350000,
    currency: 'XOF',
    city: 'Abidjan',
    commune: 'Cocody',
    neighborhood: 'Angré 8ème Tranche',
    landmark: 'Non loin de la Pharmacie 8ème Tranche, rue calme',
    latitude: 5.3845,
    longitude: -3.9835,
    bedrooms: 2,
    bathrooms: 2,
    areaSqm: 95,
    features: ['clim', 'parking', 'gardien', 'balcon', 'forage_eau', 'fibre_optique'],
    images: [
      {
        id: 'img-1-1',
        url: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1000&q=80',
        isMain: true,
        caption: 'Grand salon baigné de lumière'
      },
      {
        id: 'img-1-2',
        url: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1000&q=80',
        isMain: false,
        caption: 'Chambre principale climatisée'
      },
      {
        id: 'img-1-3',
        url: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=1000&q=80',
        isMain: false,
        caption: 'Cuisine moderne équipée'
      }
    ],
    advertiser: {
      id: 'adv-1',
      name: 'Cabinet Immobilier Ivoire Horizon',
      type: 'agence',
      agencyName: 'Ivoire Horizon SARL',
      phone: '+225 0707010203',
      whatsapp: '2250707010203',
      avatarUrl: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=256&q=80',
      verifications: ['phone_verified', 'id_verified', 'agency_verified', 'listing_verified'],
      rating: 4.8,
      reviewCount: 34,
      joinedDate: 'Mars 2024',
      isPro: true
    },
    entryCost: {
      loyer: 350000,
      cautionMois: 2,
      avanceMois: 2,
      fraisAgence: 350000,
      fraisDossier: 50000,
      total: 350000 * 2 + 350000 * 2 + 350000 + 50000 // 1,800,000 FCFA
    },
    availableFrom: 'Immédiatement',
    isAvailable: true,
    isBoosted: true,
    isFeatured: true,
    fraudRiskScore: 4,
    createdAt: '2026-09-01T10:00:00Z',
    viewsCount: 640,
    likesCount: 142
  },
  {
    id: 'prop-2',
    title: 'Studio Cosy Neuf Haut Standing avec Parking Privé',
    description: 'Idéal pour jeune cadre ou consultant, ce studio moderne est situé au cœur de Marcory Zone 4. Accès immédiat aux restaurants et supermarchés, groupe électrogène automatique, ascenseur et sécurité avec digicode.',
    transaction: 'location',
    type: 'studio',
    price: 220000,
    currency: 'XOF',
    city: 'Abidjan',
    commune: 'Marcory',
    neighborhood: 'Zone 4C',
    landmark: 'À 200m de Prima Center, Rue Paul Langevin',
    latitude: 5.2958,
    longitude: -3.9922,
    bedrooms: 1,
    bathrooms: 1,
    areaSqm: 45,
    features: ['clim', 'parking', 'gardien', 'groupe_electrogene', 'fibre_optique'],
    images: [
      {
        id: 'img-2-1',
        url: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1000&q=80',
        isMain: true,
        caption: 'Espace de vie design et optimisé'
      },
      {
        id: 'img-2-2',
        url: 'https://images.unsplash.com/photo-1507089947368-19c1da9775ae?auto=format&fit=crop&w=1000&q=80',
        isMain: false,
        caption: 'Kitchenette tout équipée'
      }
    ],
    advertiser: {
      id: 'adv-2',
      name: 'Kouassi Michel',
      type: 'particulier',
      phone: '+225 0505123456',
      whatsapp: '2250505123456',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80',
      verifications: ['phone_verified', 'id_verified', 'owner_verified'],
      rating: 4.9,
      reviewCount: 12,
      joinedDate: 'Janvier 2025',
      isPro: false
    },
    entryCost: {
      loyer: 220000,
      cautionMois: 2,
      avanceMois: 2,
      fraisAgence: 0,
      fraisDossier: 20000,
      total: 220000 * 2 + 220000 * 2 + 0 + 20000 // 900,000 FCFA (Direct propriétaire!)
    },
    availableFrom: '15 Septembre 2026',
    isAvailable: true,
    isBoosted: false,
    isFeatured: true,
    fraudRiskScore: 2,
    createdAt: '2026-09-03T14:30:00Z',
    viewsCount: 420,
    likesCount: 98
  },
  {
    id: 'prop-3',
    title: 'Villa Duplex 5 Pièces avec Jardin Arboré et Piscine',
    description: 'Exceptionnelle villa contemporaine dans une cité fermée haut de gamme à Cocody Riviera Palmeraie. Grand séjour avec hauts plafonds, 4 chambres autonomes, dépendance servante, piscine privée et garage pour 3 voitures.',
    transaction: 'location',
    type: 'villa',
    price: 850000,
    currency: 'XOF',
    city: 'Abidjan',
    commune: 'Cocody',
    neighborhood: 'Riviera Palmeraie',
    landmark: 'Cité Maraîchère, barrière sécurisée',
    latitude: 5.3615,
    longitude: -3.9540,
    bedrooms: 4,
    bathrooms: 4,
    areaSqm: 320,
    features: ['clim', 'parking', 'gardien', 'piscine', 'jardin', 'groupe_electrogene', 'forage_eau', 'balcon'],
    images: [
      {
        id: 'img-3-1',
        url: 'https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=1000&q=80',
        isMain: true,
        caption: 'Façade contemporaine et piscine'
      },
      {
        id: 'img-3-2',
        url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1000&q=80',
        isMain: false,
        caption: 'Vue sur le jardin privatif'
      },
      {
        id: 'img-3-3',
        url: 'https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?auto=format&fit=crop&w=1000&q=80',
        isMain: false,
        caption: 'Séjour d\'honneur spacieux'
      }
    ],
    advertiser: {
      id: 'adv-3',
      name: 'Prestige Babi Luxury Estate',
      type: 'agence',
      agencyName: 'Prestige Babi',
      phone: '+225 0140223344',
      whatsapp: '2250140223344',
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=256&q=80',
      verifications: ['phone_verified', 'id_verified', 'agency_verified', 'listing_verified', 'visit_verified'],
      rating: 5.0,
      reviewCount: 48,
      joinedDate: '2023',
      isPro: true
    },
    entryCost: {
      loyer: 850000,
      cautionMois: 3,
      avanceMois: 2,
      fraisAgence: 850000,
      fraisDossier: 100000,
      total: 850000 * 3 + 850000 * 2 + 850000 + 100000 // 5,200,000 FCFA
    },
    availableFrom: '1er Octobre 2026',
    isAvailable: true,
    isBoosted: true,
    isFeatured: true,
    fraudRiskScore: 1,
    createdAt: '2026-09-02T08:00:00Z',
    viewsCount: 1120,
    likesCount: 310
  },
  {
    id: 'prop-4',
    title: 'Appartement 2 Pièces Moderne Proche Métro / Boulevard',
    description: 'Chouette 2 pièces au 2ème étage d\'un immeuble récent avec interphone à Yopougon Maroc. Compteur CIE et SODECI individuels, grand balcon aéré, cuisine séparée avec rangements.',
    transaction: 'location',
    type: 'appartement',
    price: 130000,
    currency: 'XOF',
    city: 'Abidjan',
    commune: 'Yopougon',
    neighborhood: 'Maroc',
    landmark: 'Carrefour Oasis, voie bitumée',
    latitude: 5.3425,
    longitude: -4.0815,
    bedrooms: 1,
    bathrooms: 1,
    areaSqm: 55,
    features: ['balcon', 'gardien', 'parking'],
    images: [
      {
        id: 'img-4-1',
        url: 'https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&w=1000&q=80',
        isMain: true,
        caption: 'Salon avec carrelage grès cérame'
      },
      {
        id: 'img-4-2',
        url: 'https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?auto=format&fit=crop&w=1000&q=80',
        isMain: false,
        caption: 'Chambre spacieuse avec placard'
      }
    ],
    advertiser: {
      id: 'adv-4',
      name: 'Touré Adama',
      type: 'particulier',
      phone: '+225 0777889900',
      whatsapp: '2250777889900',
      avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=256&q=80',
      verifications: ['phone_verified', 'id_verified'],
      rating: 4.6,
      reviewCount: 7,
      joinedDate: 'Mai 2025',
      isPro: false
    },
    entryCost: {
      loyer: 130000,
      cautionMois: 2,
      avanceMois: 2,
      fraisAgence: 65000, // Demi-mois
      fraisDossier: 15000,
      total: 130000 * 2 + 130000 * 2 + 65000 + 15000 // 600,000 FCFA
    },
    availableFrom: 'Immédiatement',
    isAvailable: true,
    isBoosted: false,
    isFeatured: false,
    fraudRiskScore: 3,
    createdAt: '2026-09-04T11:15:00Z',
    viewsCount: 280,
    likesCount: 65
  },
  {
    id: 'prop-5',
    title: 'Plateau d\'Affaires / Bureau 4 Pièces Clé en Main',
    description: 'Bureau de standing au Plateau, idéal pour siège d\'entreprise ou cabinet de conseil. Câblage réseau haute vitesse, salle de réunion vitrée, sanitaires hommes/femmes, vue dégagée sur la lagune Ébrié.',
    transaction: 'location',
    type: 'bureau',
    price: 950000,
    currency: 'XOF',
    city: 'Abidjan',
    commune: 'Plateau',
    neighborhood: 'Centre des Affaires',
    landmark: 'Avenue Chardy, face Banque Atlantique',
    latitude: 5.3240,
    longitude: -4.0190,
    bedrooms: 0,
    bathrooms: 2,
    areaSqm: 140,
    features: ['clim', 'parking', 'gardien', 'groupe_electrogene', 'fibre_optique'],
    images: [
      {
        id: 'img-5-1',
        url: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1000&q=80',
        isMain: true,
        caption: 'Espace open-space et vue panoramique'
      },
      {
        id: 'img-5-2',
        url: 'https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&w=1000&q=80',
        isMain: false,
        caption: 'Salle de réunion exécutive'
      }
    ],
    advertiser: {
      id: 'adv-5',
      name: 'Abidjan Business Real Estate',
      type: 'agence',
      agencyName: 'ABRE Conseil',
      phone: '+225 0504030201',
      whatsapp: '2250504030201',
      avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=256&q=80',
      verifications: ['phone_verified', 'id_verified', 'agency_verified', 'listing_verified'],
      rating: 4.9,
      reviewCount: 22,
      joinedDate: 'Février 2024',
      isPro: true
    },
    entryCost: {
      loyer: 950000,
      cautionMois: 3,
      avanceMois: 3,
      fraisAgence: 950000,
      fraisDossier: 150000,
      total: 950000 * 3 + 950000 * 3 + 950000 + 150000 // 6,800,000 FCFA
    },
    availableFrom: 'Immédiatement',
    isAvailable: true,
    isBoosted: false,
    isFeatured: true,
    fraudRiskScore: 0,
    createdAt: '2026-08-28T09:00:00Z',
    viewsCount: 510,
    likesCount: 84
  },
  {
    id: 'prop-6',
    title: 'Villa Basse 4 Pièces avec Cour Avant & Arrière',
    description: 'Charmante villa familiale à Bingerville Akouai Santai, cadre verdoyant avec air frais marin. 3 chambres avec placards, séjour traversant, cuisine avec cellier, cour dallée pouvant accueillir 2 véhicules.',
    transaction: 'location',
    type: 'maison',
    price: 280000,
    currency: 'XOF',
    city: 'Abidjan',
    commune: 'Bingerville',
    neighborhood: 'Akouai Santai',
    landmark: 'Proche École Militaire Préparatoire Technique (EMPT)',
    latitude: 5.3570,
    longitude: -3.8895,
    bedrooms: 3,
    bathrooms: 2,
    areaSqm: 180,
    features: ['parking', 'gardien', 'jardin', 'forage_eau', 'balcon'],
    images: [
      {
        id: 'img-6-1',
        url: 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=1000&q=80',
        isMain: true,
        caption: 'Villa basse avec entrée fleurie'
      },
      {
        id: 'img-6-2',
        url: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1000&q=80',
        isMain: false,
        caption: 'Séjour chaleureux et aéré'
      }
    ],
    advertiser: {
      id: 'adv-6',
      name: 'Mme Bamba Fatou',
      type: 'particulier',
      phone: '+225 0102030405',
      whatsapp: '2250102030405',
      avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=256&q=80',
      verifications: ['phone_verified', 'id_verified', 'owner_verified', 'listing_verified'],
      rating: 4.7,
      reviewCount: 16,
      joinedDate: 'Avril 2024',
      isPro: false
    },
    entryCost: {
      loyer: 280000,
      cautionMois: 2,
      avanceMois: 2,
      fraisAgence: 0,
      fraisDossier: 30000,
      total: 280000 * 2 + 280000 * 2 + 0 + 30000 // 1,150,000 FCFA
    },
    availableFrom: 'Immédiatement',
    isAvailable: true,
    isBoosted: false,
    isFeatured: false,
    fraudRiskScore: 2,
    createdAt: '2026-09-02T16:40:00Z',
    viewsCount: 390,
    likesCount: 115
  },
  {
    id: 'prop-7',
    title: 'Magnifique Triplex Contemporain avec Rooftop Privatif',
    description: 'Vente exclusive : Triplex d\'architecte à Cocody Deux Plateaux Vallons. Prestations hors normes : ascenseur privé, terrasse panoramique avec jacuzzi, cuisine italienne Smeg, suite parentale de 60m², finitions marbre et domotique intégrée.',
    transaction: 'vente',
    type: 'villa',
    price: 420000000,
    currency: 'XOF',
    city: 'Abidjan',
    commune: 'Cocody',
    neighborhood: 'Deux Plateaux Vallons',
    landmark: 'Rue des Jardins, quartier résidentiel diplomatique',
    latitude: 5.3590,
    longitude: -3.9980,
    bedrooms: 5,
    bathrooms: 6,
    areaSqm: 550,
    features: ['clim', 'parking', 'gardien', 'piscine', 'jardin', 'groupe_electrogene', 'fibre_optique', 'balcon'],
    images: [
      {
        id: 'img-7-1',
        url: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1000&q=80',
        isMain: true,
        caption: 'Architecture moderne et façade vitrée'
      },
      {
        id: 'img-7-2',
        url: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1000&q=80',
        isMain: false,
        caption: 'Rooftop avec vue sur Cocody'
      }
    ],
    advertiser: {
      id: 'adv-3',
      name: 'Prestige Babi Luxury Estate',
      type: 'agence',
      agencyName: 'Prestige Babi',
      phone: '+225 0140223344',
      whatsapp: '2250140223344',
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=256&q=80',
      verifications: ['phone_verified', 'id_verified', 'agency_verified', 'listing_verified', 'visit_verified'],
      rating: 5.0,
      reviewCount: 48,
      joinedDate: '2023',
      isPro: true
    },
    entryCost: {
      loyer: 420000000,
      cautionMois: 0,
      avanceMois: 0,
      fraisAgence: 21000000, // 5% commission vente
      fraisDossier: 3500000, // frais notariés / formalités
      total: 444500000
    },
    availableFrom: 'Immédiatement',
    isAvailable: true,
    isBoosted: true,
    isFeatured: true,
    fraudRiskScore: 0,
    createdAt: '2026-08-20T12:00:00Z',
    viewsCount: 2450,
    likesCount: 680
  }
];

export const COIN_PACKS: CoinPack[] = [
  {
    id: 'pack-100',
    coins: 100,
    bonusCoins: 0,
    priceFcfa: 100,
    popular: false
  },
  {
    id: 'pack-250',
    coins: 250,
    bonusCoins: 25, // +10%
    priceFcfa: 250,
    popular: true
  },
  {
    id: 'pack-500',
    coins: 500,
    bonusCoins: 100, // +20%
    priceFcfa: 500,
    popular: false
  },
  {
    id: 'pack-1000',
    coins: 1000,
    bonusCoins: 300, // +30%
    priceFcfa: 1000,
    popular: false
  }
];
