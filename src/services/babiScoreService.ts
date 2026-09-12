import { Property, UserPreferences } from '@/types';

export interface BabiScoreResult {
  total: number; // 0 - 100
  reasons: string[];
  colorClass: string;
}

/**
 * Computes a deterministic, explainable compatibility score (0 to 100%)
 * based on user preferences and property characteristics.
 */
export function calculateBabiScore(
  property: Property,
  prefs?: UserPreferences,
  distanceKm?: number
): BabiScoreResult {
  if (!prefs) {
    // Default score if no preferences set yet
    const hasVerif = property.advertiser.verifications.length >= 2;
    const base = hasVerif ? 85 : 75;
    const reasons: string[] = ['Bien disponible immédiatement'];
    if (hasVerif) reasons.push('Annonceur vérifié par BABI IMMO');
    if (property.features.includes('parking')) reasons.push('Parking sécurisé');
    return {
      total: base,
      reasons,
      colorClass: 'text-teal-600 bg-teal-50 border-teal-200'
    };
  }

  let score = 0;
  const reasons: string[] = [];

  // 1. Transaction Type (Must match)
  if (property.transaction === prefs.transaction) {
    score += 15;
  }

  // 2. Property Type
  if (prefs.propertyTypes && prefs.propertyTypes.length > 0) {
    if (prefs.propertyTypes.includes(property.type)) {
      score += 20;
      reasons.push(`Type de bien correspondant (${property.type})`);
    }
  } else {
    score += 15;
  }

  // 3. Budget
  if (prefs.budgetMax && prefs.budgetMax > 0) {
    if (property.price <= prefs.budgetMax) {
      score += 25;
      reasons.push('Dans votre budget');
    } else if (property.price <= prefs.budgetMax * 1.15) {
      score += 12;
      reasons.push('Légèrement au-dessus de votre budget (+15% max)');
    }
  } else {
    score += 20;
  }

  // 4. Distance
  const effectiveDistance = distanceKm ?? property.distanceKm;
  if (effectiveDistance !== undefined) {
    if (effectiveDistance <= 2) {
      score += 20;
      reasons.push(`Très proche : à ${(effectiveDistance * 1000).toFixed(0)} m`);
    } else if (effectiveDistance <= prefs.radiusKm) {
      score += 15;
      reasons.push(`À ${effectiveDistance.toFixed(1)} km (dans votre rayon)`);
    } else if (effectiveDistance <= prefs.radiusKm * 1.5) {
      score += 8;
    }
  } else {
    score += 10;
  }

  // 5. Bedrooms
  if (prefs.bedrooms) {
    if (property.bedrooms >= prefs.bedrooms) {
      score += 10;
      reasons.push(`${property.bedrooms} chambre${property.bedrooms > 1 ? 's' : ''}`);
    }
  } else {
    score += 10;
  }

  // 6. Amenities
  if (prefs.features && prefs.features.length > 0) {
    const matchingFeatures = prefs.features.filter((f) => property.features.includes(f));
    if (matchingFeatures.length > 0) {
      score += 10;
      const firstFeature = matchingFeatures[0];
      const featName = firstFeature === 'clim' ? 'Climatisation' : firstFeature === 'parking' ? 'Parking' : 'Équipements demandés';
      reasons.push(`${featName} inclus`);
    }
  }

  // 7. Verified Badge Bonus
  if (property.advertiser.verifications.length >= 2) {
    score += 5;
    reasons.push('Annonceur vérifié');
  }

  // Clamp to 0 - 100
  const total = Math.min(100, Math.max(15, score));

  let colorClass = 'text-emerald-700 bg-emerald-50 border-emerald-200';
  if (total < 60) {
    colorClass = 'text-amber-700 bg-amber-50 border-amber-200';
  } else if (total < 75) {
    colorClass = 'text-teal-700 bg-teal-50 border-teal-200';
  }

  return {
    total,
    reasons: reasons.slice(0, 5), // top 5 clear reasons
    colorClass
  };
}
