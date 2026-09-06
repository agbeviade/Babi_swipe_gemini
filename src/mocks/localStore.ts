'use client';

import {
  Property,
  UserPreferences,
  SwipeAction,
  VisitRequest,
  SavedAlert,
  ReportItem,
  CoinTransaction,
  CrmLead,
  ReportReason
} from '@/types';
import { INITIAL_PROPERTIES } from '@/mocks/mockData';
import { assertMocksAllowed } from '@/mocks/guard';

const KEYS = {
  PREFS: 'babi_user_prefs',
  PROPERTIES: 'babi_properties',
  FAVORITES: 'babi_favorites',
  SWIPES: 'babi_swipes',
  VISITS: 'babi_visits',
  ALERTS: 'babi_alerts',
  REPORTS: 'babi_reports',
  COIN_BALANCE: 'babi_coin_balance',
  COIN_TX: 'babi_coin_transactions',
  PRIORITY_ACTIVE: 'babi_priority_active',
  USER_ROLE: 'babi_user_role',
  CRM_LEADS: 'babi_crm_leads'
};

export const DEFAULT_PREFS: UserPreferences = {
  transaction: 'location',
  propertyTypes: ['appartement', 'studio', 'villa'],
  budgetMin: 50000,
  budgetMax: 500000,
  city: 'Abidjan',
  communes: ['Cocody', 'Marcory', 'Deux Plateaux'],
  bedrooms: 1,
  features: ['clim', 'parking'],
  userLat: 5.3485,
  userLng: -4.0040,
  radiusKm: 10,
  userIncome: 650000
};

export class StorageService {
  public static getUserPreferences(): UserPreferences {
    try {
      const data = localStorage.getItem(KEYS.PREFS);
      return data ? { ...DEFAULT_PREFS, ...JSON.parse(data) } : DEFAULT_PREFS;
    } catch {
      return DEFAULT_PREFS;
    }
  }

  public static saveUserPreferences(prefs: UserPreferences): void {
    localStorage.setItem(KEYS.PREFS, JSON.stringify(prefs));
  }

  public static getProperties(): Property[] {
    try {
      const data = localStorage.getItem(KEYS.PROPERTIES);
      if (data) {
        const parsed = JSON.parse(data);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
      // Seed with demo listings — development only.
      assertMocksAllowed('localStore.getProperties');
      this.saveProperties(INITIAL_PROPERTIES);
      return INITIAL_PROPERTIES;
    } catch {
      assertMocksAllowed('localStore.getProperties');
      return INITIAL_PROPERTIES;
    }
  }

  public static saveProperties(properties: Property[]): void {
    localStorage.setItem(KEYS.PROPERTIES, JSON.stringify(properties));
  }

  public static addProperty(property: Property): void {
    const properties = this.getProperties();
    properties.unshift(property);
    this.saveProperties(properties);
  }

  public static updateProperty(property: Property): void {
    const properties = this.getProperties();
    const idx = properties.findIndex((p) => p.id === property.id);
    if (idx >= 0) {
      properties[idx] = property;
      this.saveProperties(properties);
    }
  }

  public static updatePropertyById(id: string, updates: Partial<Property>): void {
    const properties = this.getProperties();
    const idx = properties.findIndex((p) => p.id === id);
    if (idx >= 0) {
      properties[idx] = { ...properties[idx], ...updates };
      this.saveProperties(properties);
    }
  }

  public static deleteProperty(id: string): void {
    const properties = this.getProperties().filter((p) => p.id !== id);
    this.saveProperties(properties);
  }

  public static getFavorites(): string[] {
    try {
      const data = localStorage.getItem(KEYS.FAVORITES);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  public static toggleFavorite(propertyId: string): boolean {
    const favs = this.getFavorites();
    const idx = favs.indexOf(propertyId);
    let isFav = false;
    if (idx >= 0) {
      favs.splice(idx, 1);
      isFav = false;
    } else {
      favs.push(propertyId);
      isFav = true;
    }
    localStorage.setItem(KEYS.FAVORITES, JSON.stringify(favs));
    return isFav;
  }

  public static getSwipes(): SwipeAction[] {
    try {
      const data = localStorage.getItem(KEYS.SWIPES);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  public static recordSwipe(propertyId: string, direction: 'left' | 'right' | 'super'): void {
    const swipes = this.getSwipes();
    // avoid duplicates
    const filtered = swipes.filter((s) => s.propertyId !== propertyId);
    filtered.push({
      id: `swp-${Date.now()}`,
      propertyId,
      direction,
      timestamp: new Date().toISOString()
    });
    localStorage.setItem(KEYS.SWIPES, JSON.stringify(filtered));

    // Also increment likesCount on property if right or super
    if (direction === 'right' || direction === 'super') {
      const properties = this.getProperties();
      const p = properties.find((item) => item.id === propertyId);
      if (p) {
        p.likesCount += 1;
        this.saveProperties(properties);
      }
    }
  }

  public static undoLastSwipe(): SwipeAction | null {
    const swipes = this.getSwipes();
    if (swipes.length === 0) return null;
    const last = swipes.pop()!;
    localStorage.setItem(KEYS.SWIPES, JSON.stringify(swipes));
    return last;
  }

  public static resetSwipes(): void {
    localStorage.setItem(KEYS.SWIPES, JSON.stringify([]));
  }

  // Coin Wallet
  public static getCoinBalance(): number {
    try {
      const data = localStorage.getItem(KEYS.COIN_BALANCE);
      return data ? parseInt(data, 10) : 250; // Start user with 250 free starter coins to test
    } catch {
      return 250;
    }
  }

  public static addCoins(amount: number, reason: string, ref?: string): number {
    const current = this.getCoinBalance();
    const updated = current + amount;
    localStorage.setItem(KEYS.COIN_BALANCE, updated.toString());

    const txs = this.getCoinTransactions();
    txs.unshift({
      id: `tx-${Date.now()}`,
      type: 'credit',
      amount,
      reason,
      timestamp: new Date().toISOString(),
      referenceId: ref
    });
    localStorage.setItem(KEYS.COIN_TX, JSON.stringify(txs));

    return updated;
  }

  public static deductCoins(amount: number, reason: string): boolean {
    const current = this.getCoinBalance();
    if (current < amount) return false;
    const updated = current - amount;
    localStorage.setItem(KEYS.COIN_BALANCE, updated.toString());

    const txs = this.getCoinTransactions();
    txs.unshift({
      id: `tx-${Date.now()}`,
      type: 'debit',
      amount,
      reason,
      timestamp: new Date().toISOString()
    });
    localStorage.setItem(KEYS.COIN_TX, JSON.stringify(txs));

    return true;
  }

  public static getCoinTransactions(): CoinTransaction[] {
    try {
      const data = localStorage.getItem(KEYS.COIN_TX);
      return data ? JSON.parse(data) : [
        {
          id: 'tx-welcome',
          type: 'credit',
          amount: 250,
          reason: 'Cadeau de bienvenue BABI SWIPE IMMO',
          timestamp: new Date().toISOString()
        }
      ];
    } catch {
      return [];
    }
  }

  public static isPriorityActive(): boolean {
    try {
      const val = localStorage.getItem(KEYS.PRIORITY_ACTIVE);
      if (!val) return false;
      const expiry = parseInt(val, 10);
      return Date.now() < expiry;
    } catch {
      return false;
    }
  }

  public static activatePriority(durationHours = 48): void {
    const expiry = Date.now() + durationHours * 3600 * 1000;
    localStorage.setItem(KEYS.PRIORITY_ACTIVE, expiry.toString());
  }

  // Visits
  public static getVisits(): VisitRequest[] {
    try {
      const data = localStorage.getItem(KEYS.VISITS);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  public static addVisit(visit: VisitRequest): void {
    const visits = this.getVisits();
    visits.unshift(visit);
    localStorage.setItem(KEYS.VISITS, JSON.stringify(visits));
  }

  public static updateVisitStatus(visitId: string, status: VisitRequest['status']): void {
    const visits = this.getVisits();
    const v = visits.find((item) => item.id === visitId);
    if (v) {
      v.status = status;
      localStorage.setItem(KEYS.VISITS, JSON.stringify(visits));
    }
  }

  // Alerts
  public static getAlerts(): SavedAlert[] {
    try {
      const data = localStorage.getItem(KEYS.ALERTS);
      return data ? JSON.parse(data) : [
        {
          id: 'alt-default',
          title: '2 Pièces Cocody ≤ 250 000 FCFA',
          transaction: 'location',
          commune: 'Cocody',
          type: 'appartement',
          maxBudget: 250000,
          notifyInstant: true,
          createdAt: new Date().toISOString()
        }
      ];
    } catch {
      return [];
    }
  }

  public static addAlert(alert: SavedAlert): void {
    const alerts = this.getAlerts();
    alerts.unshift(alert);
    localStorage.setItem(KEYS.ALERTS, JSON.stringify(alerts));
  }

  public static deleteAlert(id: string): void {
    const alerts = this.getAlerts().filter((a) => a.id !== id);
    localStorage.setItem(KEYS.ALERTS, JSON.stringify(alerts));
  }

  // Reports
  public static getReports(): ReportItem[] {
    try {
      const data = localStorage.getItem(KEYS.REPORTS);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  public static addReport(report: ReportItem): void {
    const reports = this.getReports();
    reports.unshift(report);
    localStorage.setItem(KEYS.REPORTS, JSON.stringify(reports));

    // Increase fraud risk score on reported property
    const props = this.getProperties();
    const p = props.find((item) => item.id === report.propertyId);
    if (p) {
      p.fraudRiskScore = Math.min(100, (p.fraudRiskScore || 0) + 25);
      this.saveProperties(props);
    }
  }

  public static resolveReport(id: string, status: 'resolved' | 'dismissed'): void {
    const reports = this.getReports();
    const r = reports.find((item) => item.id === id);
    if (r) {
      r.status = status;
      localStorage.setItem(KEYS.REPORTS, JSON.stringify(reports));
    }
  }

  // CRM Leads
  public static getLeads(): CrmLead[] {
    try {
      const data = localStorage.getItem(KEYS.CRM_LEADS);
      return data ? JSON.parse(data) : [
        {
          id: 'lead-1',
          propertyId: 'prop-1',
          userName: 'Yao N’Goran Franck',
          userPhone: '+225 0708091011',
          userEmail: 'franck.yao@gmail.com',
          status: 'visite_programmee',
          budget: 350000,
          createdAt: '2026-09-04T14:20:00Z',
          notes: 'Visite ce samedi à 11h. Très intéressé.'
        },
        {
          id: 'lead-2',
          propertyId: 'prop-2',
          userName: 'Awa Diarra',
          userPhone: '+225 0506070809',
          status: 'nouveau',
          budget: 220000,
          createdAt: '2026-09-05T09:15:00Z',
          notes: 'A aimé le studio via Babi Swipe, demande si le groupe électrogène est automatique.'
        }
      ];
    } catch {
      return [];
    }
  }

  public static updateLeadStatus(leadId: string, status: CrmLead['status']): void {
    const leads = this.getLeads();
    const lead = leads.find((l) => l.id === leadId);
    if (lead) {
      lead.status = status;
      localStorage.setItem(KEYS.CRM_LEADS, JSON.stringify(leads));
    }
  }
}

export const localStore = {
  getPreferences: () => StorageService.getUserPreferences(),
  savePreferences: (p: UserPreferences) => StorageService.saveUserPreferences(p),
  resetPreferences: () => {
    StorageService.saveUserPreferences(DEFAULT_PREFS);
    return DEFAULT_PREFS;
  },
  getProperties: () => StorageService.getProperties(),
  saveProperties: (props: Property[]) => StorageService.saveProperties(props),
  addProperty: (p: Property) => StorageService.addProperty(p),
  updateProperty: (id: string, updates: Partial<Property>) => StorageService.updatePropertyById(id, updates),
  deleteProperty: (id: string) => StorageService.deleteProperty(id),
  getSwipes: () => StorageService.getSwipes().map((s) => s.propertyId),
  recordSwipe: (propertyId: string, direction: 'left' | 'right' | 'super') =>
    StorageService.recordSwipe(propertyId, direction),
  undoSwipe: () => StorageService.undoLastSwipe(),
  canUndo: () => StorageService.getSwipes().length > 0,
  resetSwipes: () => StorageService.resetSwipes(),
  getFavorites: () => StorageService.getFavorites(),
  toggleFavorite: (id: string) => StorageService.toggleFavorite(id),
  getAlerts: () => StorageService.getAlerts(),
  saveAlert: (a: SavedAlert) => StorageService.addAlert(a),
  deleteAlert: (id: string) => StorageService.deleteAlert(id),
  getCoins: () => StorageService.getCoinBalance(),
  addCoins: (c: number) => StorageService.addCoins(c, 'Recharge Mobile Money'),
  deductCoins: (c: number) => StorageService.deductCoins(c, 'Consommation'),
  getVisits: () => StorageService.getVisits(),
  recordVisit: (v: VisitRequest) => StorageService.addVisit(v),
  updateVisitStatus: (id: string, st: VisitRequest['status']) => StorageService.updateVisitStatus(id, st),
  getReports: () => StorageService.getReports(),
  addReport: (r: { propertyId: string; reason: ReportReason; description: string }) =>
    StorageService.addReport({
      id: `rep-${Date.now()}`,
      propertyId: r.propertyId,
      reporterId: 'usr-current',
      reason: r.reason,
      description: r.description,
      status: 'pending',
      createdAt: new Date().toISOString()
    }),
  updateReportStatus: (id: string, st: 'resolved' | 'dismissed' | 'banned') =>
    StorageService.resolveReport(id, st === 'banned' ? 'resolved' : 'dismissed'),
  isFirstVisit: () => {
    try {
      return !localStorage.getItem('babi_onboarding_done');
    } catch {
      return false;
    }
  },
  setFirstVisitDone: () => {
    try {
      localStorage.setItem('babi_onboarding_done', 'true');
    } catch {
      // storage unavailable (private mode): onboarding will show again
    }
  }
};

