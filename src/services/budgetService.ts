import { EntryCost } from '@/types';

export function formatFCFA(amount: number): string {
  return `${amount.toLocaleString('fr-FR')} FCFA`;
}

export function calculateDetailedEntryCost(
  loyer: number,
  cautionMois = 2,
  avanceMois = 2,
  fraisAgence?: number,
  fraisDossier = 25000
): EntryCost {
  const agence = fraisAgence !== undefined ? fraisAgence : loyer; // 1 month is standard in CI
  const cautionTotal = loyer * cautionMois;
  const avanceTotal = loyer * avanceMois;
  const total = cautionTotal + avanceTotal + agence + fraisDossier;

  return {
    loyer,
    cautionMois,
    avanceMois,
    fraisAgence: agence,
    fraisDossier,
    total
  };
}

export const calculateEntryCost = calculateDetailedEntryCost;

export interface BudgetAssessment {
  isCompatible: boolean;
  message: string;
  diffAmount: number;
  entryCostTotal: number;
  monthlyComfortRatio: number; // monthly rent / monthly income
}

export function assessBudgetSuitability(
  entryCost: EntryCost,
  userAvailableBudget?: number,
  userMonthlyIncome?: number
): BudgetAssessment {
  const total = entryCost.total;
  let isCompatible = true;
  let diffAmount = 0;
  let message = 'Coût d’entrée standard pour le marché abidjanais.';

  if (userAvailableBudget && userAvailableBudget > 0) {
    if (total <= userAvailableBudget) {
      diffAmount = userAvailableBudget - total;
      message = `Ce logement respecte votre budget d'entrée (Économie de ${formatFCFA(diffAmount)}).`;
    } else {
      isCompatible = false;
      diffAmount = total - userAvailableBudget;
      message = `Ce logement dépasse votre budget d'entrée de ${formatFCFA(diffAmount)}.`;
    }
  }

  const monthlyComfortRatio = userMonthlyIncome && userMonthlyIncome > 0
    ? Number(((entryCost.loyer / userMonthlyIncome) * 100).toFixed(1))
    : 0;

  return {
    isCompatible,
    message,
    diffAmount,
    entryCostTotal: total,
    monthlyComfortRatio
  };
}
