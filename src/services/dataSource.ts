'use client';

import type {
  Property,
  ReportCase,
  ReportReason,
  SavedAlert,
  UserPreferences,
  VisitRequest,
} from '@/types';
import { localStore, DEFAULT_PREFS } from '@/mocks/localStore';
import { mocksAllowed } from '@/mocks/guard';
import { isSupabaseConfigured } from '@/lib/env';

/**
 * Seam entre l'UI Gemini et la couche de données.
 *
 * Implémentation courante : magasin local de développement (`@/mocks/localStore`).
 * Les phases 4 à 9 du MIGRATION_PLAN remplacent chaque méthode par un appel
 * serveur (Server Action / Route Handler) adossé à Supabase + RLS ; la
 * signature ci-dessous ne change pas, les écrans non plus.
 */
export interface AppDataSource {
  getProperties(): Promise<Property[]>;
  /** Faux tant qu'aucune mutation serveur n'existe : l'UI masque alors ces actions. */
  canMutateProperties(): boolean;
  addProperty(property: Property): void;
  updateProperty(id: string, updates: Partial<Property>): void;
  deleteProperty(id: string): void;

  getPreferences(): UserPreferences;
  savePreferences(prefs: UserPreferences): void;
  resetPreferences(): UserPreferences;

  getSwipes(): string[];
  recordSwipe(propertyId: string, direction: 'left' | 'right' | 'super'): void;
  undoSwipe(): unknown;
  canUndo(): boolean;
  resetSwipes(): void;

  getFavorites(): string[];
  toggleFavorite(id: string): void;

  getAlerts(): SavedAlert[];
  saveAlert(alert: SavedAlert): void;
  deleteAlert(id: string): void;

  getVisits(): VisitRequest[];
  recordVisit(visit: VisitRequest): void;
  updateVisitStatus(id: string, status: VisitRequest['status']): void;

  getReports(): ReportCase[];
  addReport(report: { propertyId: string; reason: ReportReason; description: string }): void;
  updateReportStatus(id: string, status: 'resolved' | 'dismissed' | 'banned'): void;

  isFirstVisit(): boolean;
  setFirstVisitDone(): void;
}

const localDataSource: AppDataSource = {
  // Hors développement, aucune annonce de démonstration n'est servie :
  // la liste reste vide tant que la lecture Supabase (phase 4) n'est pas branchée.
  getProperties: async () => (mocksAllowed() ? localStore.getProperties() : []),
  // Les mutations d'annonces n'ont pas encore d'\u00e9quivalent serveur : hors
  // d\u00e9veloppement elles sont refus\u00e9es plut\u00f4t que d'\u00e9crire dans le navigateur,
  // ce qui laisserait l'utilisateur croire \u00e0 une modification persist\u00e9e.
  canMutateProperties: () => mocksAllowed(),
  addProperty: (property) => {
    if (!mocksAllowed()) return;
    localStore.addProperty(property);
  },
  updateProperty: (id, updates) => {
    if (!mocksAllowed()) return;
    localStore.updateProperty(id, updates);
  },
  deleteProperty: (id) => {
    if (!mocksAllowed()) return;
    localStore.deleteProperty(id);
  },

  getPreferences: () => localStore.getPreferences(),
  savePreferences: (prefs) => localStore.savePreferences(prefs),
  resetPreferences: () => localStore.resetPreferences(),

  getSwipes: () => localStore.getSwipes(),
  recordSwipe: (propertyId, direction) => localStore.recordSwipe(propertyId, direction),
  undoSwipe: () => localStore.undoSwipe(),
  canUndo: () => localStore.canUndo(),
  resetSwipes: () => localStore.resetSwipes(),

  getFavorites: () => localStore.getFavorites(),
  toggleFavorite: (id) => {
    localStore.toggleFavorite(id);
  },

  getAlerts: () => localStore.getAlerts(),
  saveAlert: (alert) => localStore.saveAlert(alert),
  deleteAlert: (id) => localStore.deleteAlert(id),

  getVisits: () => localStore.getVisits(),
  recordVisit: (visit) => localStore.recordVisit(visit),
  updateVisitStatus: (id, status) => localStore.updateVisitStatus(id, status),

  getReports: () => localStore.getReports(),
  addReport: (report) => localStore.addReport(report),
  updateReportStatus: (id, status) => localStore.updateReportStatus(id, status),

  isFirstVisit: () => localStore.isFirstVisit(),
  setFirstVisitDone: () => localStore.setFirstVisitDone(),
};

export function getDataSource(): AppDataSource {
  return localDataSource;
}

/** Vrai tant que les écrans lisent le magasin local et non la base. */
export function isUsingLocalData(): boolean {
  return !isSupabaseConfigured();
}

export { DEFAULT_PREFS };
