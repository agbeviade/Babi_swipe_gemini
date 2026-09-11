import { describe, expect, it } from 'vitest';
import {
  assessBudgetSuitability,
  buildEntryCost,
  formatFCFAOrUnknown,
  UNKNOWN_LABEL,
} from '@/services/budgetService';

describe("coût d'entrée", () => {
  it("n'invente aucun frais : total null tant que caution ou avance manque", () => {
    const cost = buildEntryCost({ loyer: 200_000 });
    expect(cost.cautionMois).toBeNull();
    expect(cost.fraisAgence).toBeNull();
    expect(cost.total).toBeNull();
    expect(formatFCFAOrUnknown(cost.total)).toBe(UNKNOWN_LABEL);
  });

  it('additionne uniquement les montants déclarés', () => {
    const cost = buildEntryCost({
      loyer: 200_000,
      cautionMois: 2,
      avanceMois: 1,
      fraisAgence: 150_000,
    });
    expect(cost.total).toBe(200_000 * 3 + 150_000);
    expect(cost.fraisDossier).toBeNull();
  });

  it('distingue un frais nul déclaré d\'un frais inconnu', () => {
    expect(buildEntryCost({ loyer: 1, cautionMois: 0, avanceMois: 0, fraisAgence: 0 }).total).toBe(0);
    expect(formatFCFAOrUnknown(0)).toBe('0 FCFA');
  });
});

describe('verdict budget', () => {
  it('ne conclut pas quand le coût d\'entrée est incomplet', () => {
    const verdict = assessBudgetSuitability(buildEntryCost({ loyer: 200_000 }), 1_000_000);
    expect(verdict.isCompatible).toBeNull();
    expect(verdict.entryCostTotal).toBeNull();
  });

  it('ne conclut pas sans budget utilisateur', () => {
    const cost = buildEntryCost({ loyer: 100_000, cautionMois: 2, avanceMois: 2 });
    expect(assessBudgetSuitability(cost).isCompatible).toBeNull();
  });

  it('compare quand tout est connu', () => {
    const cost = buildEntryCost({ loyer: 100_000, cautionMois: 2, avanceMois: 2 });
    expect(assessBudgetSuitability(cost, 500_000).isCompatible).toBe(true);
    expect(assessBudgetSuitability(cost, 300_000).isCompatible).toBe(false);
  });

  it('laisse le ratio de confort null sans revenu déclaré', () => {
    const cost = buildEntryCost({ loyer: 100_000, cautionMois: 1, avanceMois: 1 });
    expect(assessBudgetSuitability(cost, 500_000).monthlyComfortRatio).toBeNull();
    expect(assessBudgetSuitability(cost, 500_000, 400_000).monthlyComfortRatio).toBe(25);
  });
});
