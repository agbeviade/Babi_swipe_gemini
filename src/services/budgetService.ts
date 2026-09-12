import { EntryCost } from '@/types';

export const UNKNOWN_LABEL = 'Non renseigné';

export function formatFCFA(amount: number): string {
  return `${amount.toLocaleString('fr-FR')} FCFA`;
}

/** Affiche un montant, ou « Non renseigné » quand l'annonceur ne l'a pas déclaré. */
export function formatFCFAOrUnknown(amount: number | null | undefined): string {
  return amount === null || amount === undefined ? UNKNOWN_LABEL : formatFCFA(amount);
}

export interface EntryCostInput {
  loyer: number;
  cautionMois?: number | null;
  avanceMois?: number | null;
  fraisAgence?: number | null;
  fraisDossier?: number | null;
}

/**
 * Construit le coût d'entrée à partir des seuls montants déclarés.
 * Aucun frais n'est inventé : si la caution ou l'avance est inconnue,
 * le total reste `null` et l'écran affiche « Non renseigné ».
 */
export function buildEntryCost(input: EntryCostInput): EntryCost {
  const cautionMois = input.cautionMois ?? null;
  const avanceMois = input.avanceMois ?? null;
  const fraisAgence = input.fraisAgence ?? null;
  const fraisDossier = input.fraisDossier ?? null;

  const total =
    cautionMois === null || avanceMois === null
      ? null
      : input.loyer * (cautionMois + avanceMois) + (fraisAgence ?? 0) + (fraisDossier ?? 0);

  return { loyer: input.loyer, cautionMois, avanceMois, fraisAgence, fraisDossier, total };
}

export interface BudgetAssessment {
  /** Null quand le coût d'entrée est incomplet : aucune conclusion n'est tirée. */
  isCompatible: boolean | null;
  message: string;
  diffAmount: number | null;
  entryCostTotal: number | null;
  /** Loyer / revenu mensuel, en %. Null si le revenu n'est pas renseigné. */
  monthlyComfortRatio: number | null;
}

export function assessBudgetSuitability(
  entryCost: EntryCost,
  userAvailableBudget?: number,
  userMonthlyIncome?: number
): BudgetAssessment {
  const total = entryCost.total;
  const monthlyComfortRatio =
    userMonthlyIncome && userMonthlyIncome > 0
      ? Number(((entryCost.loyer / userMonthlyIncome) * 100).toFixed(1))
      : null;

  if (total === null) {
    return {
      isCompatible: null,
      message: "Coût d'entrée incomplet : l'annonceur n'a pas déclaré tous les montants.",
      diffAmount: null,
      entryCostTotal: null,
      monthlyComfortRatio
    };
  }

  if (!userAvailableBudget || userAvailableBudget <= 0) {
    return {
      isCompatible: null,
      message: "Renseignez votre budget d'entrée pour comparer.",
      diffAmount: null,
      entryCostTotal: total,
      monthlyComfortRatio
    };
  }

  const isCompatible = total <= userAvailableBudget;
  const diffAmount = Math.abs(userAvailableBudget - total);

  return {
    isCompatible,
    message: isCompatible
      ? `Ce logement respecte votre budget d'entrée (économie de ${formatFCFA(diffAmount)}).`
      : `Ce logement dépasse votre budget d'entrée de ${formatFCFA(diffAmount)}.`,
    diffAmount,
    entryCostTotal: total,
    monthlyComfortRatio
  };
}
