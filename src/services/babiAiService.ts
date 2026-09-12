import { UserPreferences, TransactionType, PropertyType } from '@/types';

export interface BabiAiParseResult {
  query: string;
  extracted: {
    transaction: TransactionType;
    budgetMax?: number;
    propertyType?: PropertyType;
    bedrooms?: number;
    commune?: string;
    features?: string[];
    userIncome?: number;
    anchorPoint?: string;
  };
  explanation: string;
}

/**
 * Natural language intent parser for Ivorian real estate queries.
 * Respects strict constraint: Never fabricates fake properties, only extracts parameters.
 */
export function parseBabiAiQuery(query: string): BabiAiParseResult {
  const normalized = query.toLowerCase();
  
  // 1. Transaction
  let transaction: TransactionType = 'location';
  if (normalized.includes('achat') || normalized.includes('acheter') || normalized.includes('vente') || normalized.includes('propriétaire')) {
    transaction = 'vente';
  }

  // 2. Budget extraction (e.g., "200 000", "200000", "150k", "500 000 FCFA")
  let budgetMax: number | undefined;
  let userIncome: number | undefined;

  // Check for income ("gagne 500 000", "salaire de 400 000")
  const incomeMatch = normalized.match(/(?:gagne|salaire|revenu|touche)\s*(?:de\s*)?([0-9\s.,]+)(?:k|fcfa|f)?/i);
  if (incomeMatch) {
    const rawNumber = incomeMatch[1].replace(/[\s.,]/g, '');
    const val = parseInt(rawNumber, 10);
    if (!isNaN(val)) {
      userIncome = val < 1000 ? val * 1000 : val;
    }
  }

  // Check for rent budget ("moins de 200 000", "budget 250000", "max 150 000")
  const budgetMatch = normalized.match(/(?:moins de|max|maximum|budget|loyer|environ|jusqu'à)\s*([0-9\s.,]+)(?:k|fcfa|f)?/i) ||
                      normalized.match(/([0-9\s.,]{3,})\s*(?:fcfa|f)/i);
  if (budgetMatch) {
    const rawNumber = budgetMatch[1].replace(/[\s.,]/g, '');
    const val = parseInt(rawNumber, 10);
    if (!isNaN(val) && val !== userIncome) {
      budgetMax = val < 1000 ? val * 1000 : val;
    }
  }

  // 3. Property Type
  let propertyType: PropertyType | undefined;
  if (normalized.includes('studio')) {
    propertyType = 'studio';
  } else if (normalized.includes('appartement') || normalized.includes('appart')) {
    propertyType = 'appartement';
  } else if (normalized.includes('villa')) {
    propertyType = 'villa';
  } else if (normalized.includes('maison')) {
    propertyType = 'maison';
  } else if (normalized.includes('bureau')) {
    propertyType = 'bureau';
  }

  // 4. Bedrooms / Pièces ("2 pièces", "3 chambres", "studio", "4 pces")
  let bedrooms: number | undefined;
  const piecesMatch = normalized.match(/([1-9])\s*(?:pièces|pieces|pces|chambres|chambre|chs)/i);
  if (piecesMatch) {
    const count = parseInt(piecesMatch[1], 10);
    // In Abidjan terminology: 2 pièces = 1 salon + 1 chambre (1 bedroom)
    bedrooms = count > 1 ? count - 1 : 1;
  } else if (propertyType === 'studio') {
    bedrooms = 1;
  }

  // 5. Communes / Zones
  const communes = [
    'Cocody',
    'Plateau',
    'Marcory',
    'Yopougon',
    'Deux Plateaux',
    'Riviera Palmeraie',
    'Riviera 3',
    'Angré',
    'Treichville',
    'Koumassi',
    'Port-Bouët',
    'Bingerville'
  ];
  let detectedCommune: string | undefined;
  for (const c of communes) {
    if (normalized.includes(c.toLowerCase())) {
      detectedCommune = c;
      break;
    }
  }

  // 6. Anchor points (travail, université, famille)
  let anchorPoint: string | undefined;
  if (normalized.includes('travail') || normalized.includes('bureau') || normalized.includes('job')) {
    anchorPoint = 'Travail / Bureau';
  } else if (normalized.includes('ecole') || normalized.includes('école') || normalized.includes('université')) {
    anchorPoint = 'Éducation / Université';
  }

  // 7. Amenities
  const features: string[] = [];
  if (normalized.includes('clim') || normalized.includes('climatise')) features.push('clim');
  if (normalized.includes('parking') || normalized.includes('garage')) features.push('parking');
  if (normalized.includes('piscine')) features.push('piscine');
  if (normalized.includes('gardien') || normalized.includes('securite')) features.push('gardien');
  if (normalized.includes('eau') || normalized.includes('forage')) features.push('forage_eau');
  if (normalized.includes('balcon')) features.push('balcon');

  // Build natural French explanation
  const parts: string[] = [];
  parts.push(`Transaction : ${transaction === 'location' ? 'Location' : 'Vente'}`);
  if (propertyType) parts.push(`Type : ${propertyType}`);
  if (bedrooms) parts.push(`Chambres : ${bedrooms} (ou ${bedrooms + 1} pièces)`);
  if (detectedCommune) parts.push(`Zone recherchée : ${detectedCommune}`);
  if (budgetMax) parts.push(`Budget max : ${budgetMax.toLocaleString('fr-FR')} FCFA`);
  if (userIncome) parts.push(`Revenu mensuel : ${userIncome.toLocaleString('fr-FR')} FCFA`);
  if (features.length > 0) parts.push(`Équipements : ${features.join(', ')}`);

  return {
    query,
    extracted: {
      transaction,
      budgetMax,
      propertyType,
      bedrooms,
      commune: detectedCommune,
      features,
      userIncome,
      anchorPoint
    },
    explanation: parts.join(' • ')
  };
}

/**
 * Applies parsed criteria to existing search preferences
 */
export const AI_SAMPLE_PROMPTS = [
  'Studio Cocody moins de 150 000 avec balcon',
  'Maison 3 chambres Marcory avec piscine',
  'Deux pièces Yopougon calme',
  'Appartement 3 pièces Riviera Palmeraie climatisé',
  'Bureau professionnel au Plateau'
];

export function applyParsedToPreferences(
  parsed: BabiAiParseResult,
  currentPrefs: UserPreferences
): UserPreferences {
  const ext = parsed.extracted;
  return {
    ...currentPrefs,
    transaction: ext.transaction,
    budgetMax: ext.budgetMax ?? currentPrefs.budgetMax,
    propertyTypes: ext.propertyType ? [ext.propertyType] : currentPrefs.propertyTypes,
    bedrooms: ext.bedrooms ?? currentPrefs.bedrooms,
    communes: ext.commune ? [ext.commune] : currentPrefs.communes,
    features: ext.features && ext.features.length > 0 ? Array.from(new Set([...currentPrefs.features, ...ext.features])) : currentPrefs.features,
    userIncome: ext.userIncome ?? currentPrefs.userIncome
  };
}
