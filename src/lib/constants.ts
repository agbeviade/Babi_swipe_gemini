/**
 * Référentiel provisoire (communes d'Abidjan, équipements).
 * Sera remplacé par les tables `cities/communes/neighborhoods` et `features`
 * de la base Supabase (phase 2) — voir MIGRATION_PLAN.md.
 */

export const ABIDJAN_COMMUNES = [
  'Cocody',
  'Marcory',
  'Plateau',
  'Yopougon',
  'Deux Plateaux',
  'Riviera Palmeraie',
  'Riviera 3',
  'Angré',
  'Treichville',
  'Koumassi',
  'Port-Bouët',
  'Bingerville',
  'Abobo',
  'Attécoubé'
];

export const PROPERTY_FEATURES_LIST = [
  { id: 'clim', label: 'Climatisation', icon: 'snowflake' },
  { id: 'parking', label: 'Parking fermé', icon: 'car' },
  { id: 'gardien', label: 'Sécurité 24/7', icon: 'shield-check' },
  { id: 'forage_eau', label: 'Forage / Eau continue', icon: 'droplet' },
  { id: 'groupe_electrogene', label: 'Groupe électrogène', icon: 'zap' },
  { id: 'balcon', label: 'Balcon / Terrasse', icon: 'sun' },
  { id: 'piscine', label: 'Piscine', icon: 'waves' },
  { id: 'jardin', label: 'Jardin arboré', icon: 'trees' },
  { id: 'fibre_optique', label: 'Fibre optique installée', icon: 'wifi' }
];
