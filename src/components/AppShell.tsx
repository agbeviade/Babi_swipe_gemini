'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Navbar } from '@/components/Navbar';
import { MobileTabBar, AppTab } from '@/components/MobileTabBar';
import { SwipeView } from '@/components/SwipeView';
import { MapView } from '@/components/MapView';
import { FavoritesView } from '@/components/FavoritesView';
import { AlertsView } from '@/components/AlertsView';
import { OwnerView } from '@/components/OwnerView';
import { AdminView } from '@/components/AdminView';
import { PropertyDetailModal } from '@/components/PropertyDetailModal';
import { OnboardingModal } from '@/components/OnboardingModal';
import { BabiAiModal } from '@/components/BabiAiModal';
import { FilterModal } from '@/components/FilterModal';
import { CoinsModal } from '@/components/CoinsModal';
import { OfflineIndicator } from '@/components/OfflineIndicator';
import { getDataSource, DEFAULT_PREFS } from '@/services/dataSource';
import {
  Property,
  UserPreferences,
  SavedAlert,
  VisitRequest,
  ReportCase,
  ReportReason,
  PaymentOrder
} from '@/types';
import { calculateBabiScore } from '@/services/babiScoreService';
import { getCurrentPosition } from '@/services/geoService';
import { Bell, X } from 'lucide-react';

const data = getDataSource();

export interface AppShellProps {
  /** Rôle vérifié côté serveur — jamais fourni par le client. */
  canAccessAdmin: boolean;
  /** Annonces publiées lues sous RLS côté serveur. */
  initialProperties: Property[];
}

export default function AppShell({ canAccessAdmin, initialProperties }: AppShellProps) {
  // Navigation tab state
  const [activeTab, setActiveTab] = useState<AppTab>('swipe');

  // Core domain state
  const [properties, setProperties] = useState<Property[]>(initialProperties);
  const [userPreferences, setUserPreferences] = useState<UserPreferences>(DEFAULT_PREFS);
  const [swipedIds, setSwipedIds] = useState<string[]>([]);
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
  const [alerts, setAlerts] = useState<SavedAlert[]>([]);
  const [visits, setVisits] = useState<VisitRequest[]>([]);
  const [reports, setReports] = useState<ReportCase[]>([]);
  const [canUndo, setCanUndo] = useState<boolean>(false);
  // Solde et entitlements deviennent autoritatifs côté serveur en phase 9.
  const [babiCoins] = useState<number>(0);
  const [isPriorityActive] = useState<boolean>(false);

  // Modals state
  const [showOnboarding, setShowOnboarding] = useState<boolean>(false);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [showAiSearch, setShowAiSearch] = useState<boolean>(false);
  const [showFilters, setShowFilters] = useState<boolean>(false);
  const [showCoinsModal, setShowCoinsModal] = useState<boolean>(false);

  // In-app Push Notification banner
  const [notification, setNotification] = useState<{
    id: string;
    title: string;
    message: string;
  } | null>(null);

  // Hydratation depuis la source de données (client uniquement)
  useEffect(() => {
    if (initialProperties.length === 0) {
      void data.getProperties().then(setProperties);
    }
    setUserPreferences(data.getPreferences());
    setSwipedIds(data.getSwipes());
    setFavoriteIds(data.getFavorites());
    setAlerts(data.getAlerts());
    setVisits(data.getVisits());
    setReports(data.getReports());
    setCanUndo(data.canUndo());
    setShowOnboarding(data.isFirstVisit());
  }, []);

  // Filter & sort properties based on preferences
  const filteredProperties = useMemo(() => {
    const result = properties.filter((p) => {
      // Exclude already swiped cards in swipe mode
      if (activeTab === 'swipe' && swipedIds.includes(p.id)) {
        return false;
      }

      // Filter transaction
      if (userPreferences.transaction && p.transaction !== userPreferences.transaction) {
        return false;
      }

      // Filter property type
      if (
        userPreferences.propertyTypes &&
        userPreferences.propertyTypes.length > 0 &&
        !userPreferences.propertyTypes.includes(p.type)
      ) {
        return false;
      }

      // Filter commune
      if (
        userPreferences.communes &&
        userPreferences.communes.length > 0 &&
        !userPreferences.communes.includes(p.commune)
      ) {
        return false;
      }

      // Filter budget max
      if (userPreferences.budgetMax && p.price > userPreferences.budgetMax) {
        return false;
      }

      // Filter verified
      if (userPreferences.onlyVerified && p.advertiser.verifications.length < 2) {
        return false;
      }

      return true;
    });

    // Sort result
    result.sort((a, b) => {
      // Boosted ads get priority
      if (a.isBoosted && !b.isBoosted) return -1;
      if (!a.isBoosted && b.isBoosted) return 1;

      if (userPreferences.sortBy === 'price_asc') return a.price - b.price;
      if (userPreferences.sortBy === 'price_desc') return b.price - a.price;
      if (userPreferences.sortBy === 'distance') return (a.distanceKm || 99) - (b.distanceKm || 99);

      // Default: Babi Score descending
      const scoreA = calculateBabiScore(a, userPreferences, a.distanceKm).total;
      const scoreB = calculateBabiScore(b, userPreferences, b.distanceKm).total;
      return scoreB - scoreA;
    });

    return result;
  }, [properties, swipedIds, userPreferences, activeTab]);

  // Favorites list
  const favoriteProperties = useMemo(() => {
    return properties.filter((p) => favoriteIds.includes(p.id));
  }, [properties, favoriteIds]);

  // Swipe action handlers
  const handleSwipe = (propertyId: string, direction: 'left' | 'right' | 'super') => {
    data.recordSwipe(propertyId, direction);
    setSwipedIds([...swipedIds, propertyId]);
    setCanUndo(data.canUndo());

    if (direction === 'right' || direction === 'super') {
      if (!favoriteIds.includes(propertyId)) {
        data.toggleFavorite(propertyId);
        setFavoriteIds([...favoriteIds, propertyId]);
      }
    }
  };

  const handleUndo = () => {
    const unswiped = data.undoSwipe();
    if (unswiped) {
      setSwipedIds(data.getSwipes());
    }
    setCanUndo(data.canUndo());
  };

  const handleResetSwipes = () => {
    data.resetSwipes();
    setSwipedIds([]);
    setCanUndo(false);
  };

  const handleToggleFavorite = (id: string) => {
    data.toggleFavorite(id);
    setFavoriteIds(data.getFavorites());
  };

  // Onboarding completion
  const handleOnboardingComplete = (newPrefs: UserPreferences) => {
    setUserPreferences(newPrefs);
    data.savePreferences(newPrefs);
    data.setFirstVisitDone();
    setShowOnboarding(false);
  };

  // Re-detect GPS location
  const handleRefreshLocation = async () => {
    const pos = await getCurrentPosition();
    const updated = {
      ...userPreferences,
      userLat: pos.latitude,
      userLng: pos.longitude
    };
    setUserPreferences(updated);
    data.savePreferences(updated);

    // trigger feedback notification
    triggerNotification(
      '📍 Position mise à jour',
      'Calcul des distances réactualisé autour de votre position à Abidjan.'
    );
  };

  // Notification helper
  const triggerNotification = (title: string, message: string) => {
    setNotification({ id: `notif-${Date.now()}`, title, message });
    setTimeout(() => {
      setNotification(null);
    }, 4000);
  };

  // Add customized alert
  const handleAddAlert = (alert: SavedAlert) => {
    data.saveAlert(alert);
    setAlerts(data.getAlerts());
    triggerNotification('🔔 Alerte enregistrée', `Recherche surveillée : ${alert.title}`);
  };

  const handleDeleteAlert = (id: string) => {
    data.deleteAlert(id);
    setAlerts(data.getAlerts());
  };

  // Visit request
  const handleRequestVisit = (visit: VisitRequest) => {
    data.recordVisit(visit);
    setVisits(data.getVisits());
    triggerNotification('📅 Demande transmise', `Rendez-vous demandé pour ${visit.propertyTitle}`);
  };

  // Report property
  const handleReportProperty = (propertyId: string, reason: string, description: string) => {
    data.addReport({
      propertyId,
      reason: reason as ReportReason,
      description
    });
    setReports(data.getReports());
  };

  // Monetization — les soldes et entitlements deviennent serveur en phase 9.
  const handleCoinPurchase = (added: number, order: PaymentOrder) => {
    triggerNotification(
      '🪙 Paiement en attente de confirmation',
      `Commande ${order.operator?.toUpperCase() ?? ''} enregistrée : ${added} Coins seront crédités après confirmation de l'opérateur.`
    );
  };

  const handleActivatePriority = () => {
    triggerNotification(
      '⚡ Pass Prioritaire',
      "L'activation sera disponible dès la mise en service du paiement serveur."
    );
  };

  // Owner listing addition
  const handleAddProperty = (newProp: Property) => {
    data.addProperty(newProp);
    void data.getProperties().then(setProperties);
    triggerNotification('🏡 Annonce en ligne', `${newProp.title} a été diffusée.`);
  };

  const handleBoostProperty = () => {
    triggerNotification(
      '⚡ Boost indisponible',
      'Le boost sera accordé par le serveur après confirmation du paiement.'
    );
  };

  const handleUpdateVisitStatus = (visitId: string, status: VisitRequest['status']) => {
    data.updateVisitStatus(visitId, status);
    setVisits(data.getVisits());
  };

  // Admin moderation
  const handleModerateProperty = (propertyId: string, action: 'approve' | 'reject' | 'delete') => {
    if (action === 'delete') {
      data.deleteProperty(propertyId);
      void data.getProperties().then(setProperties);
      triggerNotification('🛡️ Modération', 'Annonce supprimée de la plateforme.');
    }
  };

  const handleResolveReport = (reportId: string, resolution: 'banned' | 'dismissed') => {
    data.updateReportStatus(reportId, resolution);
    setReports(data.getReports());
  };

  const handleVerifyAdvertiser = () => {
    triggerNotification(
      '✅ Certification',
      "Le badge sera délivré par le back-office de vérification (phase 6)."
    );
  };

  return (
    <div className="min-h-screen bg-[#0F1115] flex flex-col font-sans antialiased text-white selection:bg-[#FF5A2D]/30">
      {/* Top Navbar */}
      <Navbar
        coinBalance={babiCoins}
        onOpenCoins={() => setShowCoinsModal(true)}
        onOpenAiSearch={() => setShowAiSearch(true)}
        onOpenFilters={() => setShowFilters(true)}
        isPriorityActive={isPriorityActive}
        activeTab={activeTab}
      />

      {/* Floating In-App Push Notification */}
      {notification && (
        <div className="fixed top-16 left-4 right-4 z-50 max-w-md mx-auto p-3.5 rounded-2xl bg-[#1A1D24]/95 backdrop-blur-md text-white shadow-[0_10px_40px_rgba(0,0,0,0.8)] flex items-start justify-between border border-[#FF5A2D]/40 animate-in slide-in-from-top duration-200">
          <div className="flex items-start gap-2.5">
            <Bell className="w-5 h-5 text-[#FF5A2D] flex-shrink-0 mt-0.5 animate-bounce" />
            <div>
              <h5 className="font-extrabold text-xs text-white">{notification.title}</h5>
              <p className="text-[11px] text-gray-300 mt-0.5">{notification.message}</p>
            </div>
          </div>
          <button
            onClick={() => setNotification(null)}
            aria-label="Fermer la notification"
            className="p-1 rounded-full text-gray-400 hover:text-white transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Main View Display */}
      <main className="flex-1 w-full max-w-md mx-auto relative overflow-x-hidden">
        {activeTab === 'swipe' && (
          <SwipeView
            properties={filteredProperties}
            userPreferences={userPreferences}
            onSwipe={handleSwipe}
            onUndo={handleUndo}
            canUndo={canUndo}
            onSelectProperty={(prop) => setSelectedProperty(prop)}
            onResetSwipes={handleResetSwipes}
            onOpenPreferences={() => setShowFilters(true)}
          />
        )}

        {activeTab === 'map' && (
          <MapView
            properties={filteredProperties}
            userPreferences={userPreferences}
            onSelectProperty={(prop) => setSelectedProperty(prop)}
            onRefreshLocation={handleRefreshLocation}
          />
        )}

        {activeTab === 'favorites' && (
          <FavoritesView
            favoriteProperties={favoriteProperties}
            onRemoveFavorite={handleToggleFavorite}
            onSelectProperty={(prop) => setSelectedProperty(prop)}
            userPreferences={userPreferences}
          />
        )}

        {activeTab === 'alerts' && (
          <AlertsView
            alerts={alerts}
            onAddAlert={handleAddAlert}
            onDeleteAlert={handleDeleteAlert}
            onSimulateNotification={(title, msg) => triggerNotification(title, msg)}
          />
        )}

        {activeTab === 'owner' && (
          <OwnerView
            ownerProperties={properties}
            visitRequests={visits}
            onAddProperty={handleAddProperty}
            onBoostProperty={handleBoostProperty}
            onUpdateVisitStatus={handleUpdateVisitStatus}
            babiCoins={babiCoins}
            onOpenCoins={() => setShowCoinsModal(true)}
          />
        )}

        {activeTab === 'admin' && canAccessAdmin && (
          <AdminView
            properties={properties}
            reports={reports}
            onModerateProperty={handleModerateProperty}
            onResolveReport={handleResolveReport}
            onVerifyAdvertiser={handleVerifyAdvertiser}
          />
        )}
      </main>

      {/* Bottom Safe Area & Tab Bar */}
      <MobileTabBar
        activeTab={activeTab}
        onTabChange={(tab) => setActiveTab(tab)}
        favoritesCount={favoriteIds.length}
        unreadAlertsCount={alerts.length}
        canAccessAdmin={canAccessAdmin}
      />

      {/* Offline Status Bar for Ivorian network stability */}
      <OfflineIndicator />

      {/* Property Detail Sheet */}
      {selectedProperty && (
        <PropertyDetailModal
          property={selectedProperty}
          onClose={() => setSelectedProperty(null)}
          userPreferences={userPreferences}
          isFavorite={favoriteIds.includes(selectedProperty.id)}
          onToggleFavorite={handleToggleFavorite}
          onRequestVisit={handleRequestVisit}
          onReportProperty={handleReportProperty}
        />
      )}

      {/* 6-Step Onboarding Modal */}
      <OnboardingModal
        isOpen={showOnboarding}
        initialPrefs={userPreferences}
        onComplete={handleOnboardingComplete}
      />

      {/* Natural Language Babi AI Modal */}
      <BabiAiModal
        isOpen={showAiSearch}
        onClose={() => setShowAiSearch(false)}
        propertiesCount={properties.length}
        onApplyAiFilter={(updates, summary) => {
          const updated = { ...userPreferences, ...updates };
          setUserPreferences(updated);
          data.savePreferences(updated);
          triggerNotification('✨ Babi AI Appliqué', `Filtres adaptés : "${summary}"`);
        }}
      />

      {/* Advanced Filters Modal */}
      <FilterModal
        isOpen={showFilters}
        onClose={() => setShowFilters(false)}
        preferences={userPreferences}
        onApply={(newPrefs) => {
          setUserPreferences(newPrefs);
          data.savePreferences(newPrefs);
        }}
        onReset={() => {
          const defaults = data.resetPreferences();
          setUserPreferences(defaults);
        }}
        totalResultsCount={filteredProperties.length}
      />

      {/* Babi Coins & Mobile Money Checkout Modal */}
      <CoinsModal
        isOpen={showCoinsModal}
        onClose={() => setShowCoinsModal(false)}
        currentBalance={babiCoins}
        onPurchaseComplete={handleCoinPurchase}
        onActivatePriorityPass={handleActivatePriority}
        isPriorityActive={isPriorityActive}
      />
    </div>
  );
}
