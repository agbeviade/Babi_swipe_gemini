'use client';

import React, { useState } from 'react';
import { Bell, Plus, Trash2, CheckCircle2, Sparkles, Send } from 'lucide-react';
import { SavedAlert, PropertyType, TransactionType } from '@/types';
import { ABIDJAN_COMMUNES } from '@/lib/constants';
import { formatFCFA } from '@/services/budgetService';

interface AlertsViewProps {
  alerts: SavedAlert[];
  onAddAlert: (alert: SavedAlert) => void;
  onDeleteAlert: (id: string) => void;
  onSimulateNotification: (title: string, message: string) => void;
}

export const AlertsView: React.FC<AlertsViewProps> = ({
  alerts,
  onAddAlert,
  onDeleteAlert,
  onSimulateNotification
}) => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [commune, setCommune] = useState('Cocody');
  const [type, setType] = useState<PropertyType>('studio');
  const [transaction, setTransaction] = useState<TransactionType>('location');
  const [maxBudget, setMaxBudget] = useState<number>(200000);
  const [notifyInstant, setNotifyInstant] = useState(true);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    const newAlert: SavedAlert = {
      id: `alt-${Date.now()}`,
      title: `${type.toUpperCase()} à ${commune} ≤ ${formatFCFA(maxBudget)}`,
      transaction,
      commune,
      type,
      maxBudget,
      notifyInstant,
      createdAt: new Date().toISOString()
    };
    onAddAlert(newAlert);
    setShowCreateModal(false);
  };

  return (
    <div id="alerts-view" className="w-full max-w-md mx-auto px-4 py-4 space-y-4 pb-24 text-white">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-extrabold text-white">
            Vos Alertes Immo ({alerts.length})
          </h2>
          <p className="text-xs text-gray-400">
            Soyez averti dès qu'un bien correspondant est publié
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-[#FF5A2D] hover:bg-[#FF5A2D]/90 text-white text-xs font-bold shadow-[0_0_15px_rgba(255,90,45,0.4)] transition active:scale-95"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Nouvelle alerte</span>
        </button>
      </div>

      {/* Simulated Live notification trigger for testing */}
      <div className="p-4 rounded-2xl bg-[#16181D] border border-white/10 flex items-center justify-between shadow-lg">
        <div className="flex items-center gap-2.5">
          <Bell className="w-4 h-4 text-[#FFD700] animate-pulse" />
          <div>
            <span className="text-xs font-bold block text-white">Tester le simulateur push</span>
            <span className="text-[10px] text-gray-400">
              Déclenche une fausse notification instantanée
            </span>
          </div>
        </div>
        <button
          onClick={() =>
            onSimulateNotification(
              '⚡ Nouvelle pépite à Cocody !',
              'Un studio meublé neuf vient d’être posté à 180 000 FCFA / mois.'
            )
          }
          className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold text-[10px] transition"
        >
          Tester
        </button>
      </div>

      {/* Alerts list */}
      <div className="space-y-3">
        {alerts.length === 0 ? (
          <div className="py-12 text-center text-gray-400 text-xs">
            Aucune alerte enregistrée. Créez-en une pour ne manquer aucun logement.
          </div>
        ) : (
          alerts.map((alert) => (
            <div
              key={alert.id}
              className="p-4 rounded-2xl bg-[#16181D] border border-white/10 shadow-lg flex items-center justify-between"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#FF5A2D]" />
                  <h4 className="font-bold text-sm text-white">
                    {alert.title}
                  </h4>
                </div>
                <div className="text-xs text-gray-400 flex items-center gap-2">
                  <span>Commune : {alert.commune}</span>
                  <span>•</span>
                  <span>{alert.transaction === 'location' ? 'Location' : 'Achat'}</span>
                </div>
                {alert.notifyInstant && (
                  <span className="inline-block text-[10px] font-bold text-[#FFD700] bg-[#FFD700]/10 border border-[#FFD700]/20 px-2 py-0.5 rounded-full">
                    ⚡ Alerte prioritaire activée
                  </span>
                )}
              </div>

              <button
                onClick={() => onDeleteAlert(alert.id)}
                className="p-2 rounded-xl text-gray-400 hover:text-rose-400 hover:bg-white/5 transition"
                title="Supprimer cette alerte"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))
        )}
      </div>

      {/* Modal Créer Alerte */}
      {showCreateModal && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4">
          <div className="w-full max-w-sm rounded-3xl bg-[#16181D] border border-white/10 p-5 shadow-2xl text-white space-y-4">
            <h3 className="font-extrabold text-base text-white">Créer une alerte personnalisée</h3>

            <form onSubmit={handleCreate} className="space-y-3.5 text-xs">
              <div>
                <label className="font-semibold block mb-1 text-gray-300">Transaction</label>
                <select
                  value={transaction}
                  onChange={(e) => setTransaction(e.target.value as TransactionType)}
                  className="w-full p-2.5 rounded-xl border border-white/10 bg-[#0F1115] text-white focus:outline-none focus:border-[#FF5A2D]"
                >
                  <option value="location">Location</option>
                  <option value="vente">Achat</option>
                </select>
              </div>

              <div>
                <label className="font-semibold block mb-1 text-gray-300">Commune d'Abidjan</label>
                <select
                  value={commune}
                  onChange={(e) => setCommune(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-white/10 bg-[#0F1115] text-white focus:outline-none focus:border-[#FF5A2D]"
                >
                  {ABIDJAN_COMMUNES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-semibold block mb-1 text-gray-300">Type de bien</label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value as PropertyType)}
                  className="w-full p-2.5 rounded-xl border border-white/10 bg-[#0F1115] text-white focus:outline-none focus:border-[#FF5A2D]"
                >
                  <option value="studio">Studio</option>
                  <option value="appartement">Appartement</option>
                  <option value="maison">Maison</option>
                  <option value="villa">Villa</option>
                  <option value="bureau">Bureau</option>
                </select>
              </div>

              <div>
                <label className="font-semibold block mb-1 text-gray-300">
                  Budget max : <span className="text-[#FF5A2D] font-mono font-bold">{formatFCFA(maxBudget)}</span>
                </label>
                <input
                  type="range"
                  min="50000"
                  max="1000000"
                  step="25000"
                  value={maxBudget}
                  onChange={(e) => setMaxBudget(Number(e.target.value))}
                  className="w-full accent-[#FF5A2D]"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="instant-check"
                  checked={notifyInstant}
                  onChange={(e) => setNotifyInstant(e.target.checked)}
                  className="w-4 h-4 accent-[#FF5A2D]"
                />
                <label htmlFor="instant-check" className="text-[11px] font-medium text-gray-300">
                  Notification instantanée (Push & In-App)
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-xl text-gray-400 hover:text-white font-semibold text-xs transition"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-[#FF5A2D] hover:bg-[#FF5A2D]/90 text-white font-bold text-xs shadow-[0_0_15px_rgba(255,90,45,0.4)] transition"
                >
                  Enregistrer l'alerte
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};