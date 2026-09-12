'use client';

import React, { useState } from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  TrendingUp,
  Flame,
  Users,
  Building,
  Coins,
  Ban
} from 'lucide-react';
import { Property, ReportCase } from '@/types';
import { formatFCFA } from '@/services/budgetService';

interface AdminViewProps {
  properties: Property[];
  reports: ReportCase[];
  onModerateProperty: (propertyId: string, action: 'approve' | 'reject' | 'delete') => void;
  onResolveReport: (reportId: string, resolution: 'banned' | 'dismissed') => void;
  onVerifyAdvertiser: (propertyId: string) => void;
}

export const AdminView: React.FC<AdminViewProps> = ({
  properties,
  reports,
  onModerateProperty,
  onResolveReport,
  onVerifyAdvertiser
}) => {
  const [filterType, setFilterType] = useState<'all' | 'reports' | 'stats'>('reports');

  return (
    <div id="admin-view" className="w-full max-w-md mx-auto px-4 py-4 space-y-4 pb-24 text-white">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-[#FF5A2D]" />
            <h2 className="text-xl font-extrabold text-white">
              Back-Office BABI IMMO
            </h2>
          </div>
          <p className="text-xs text-gray-400">
            Modération, lutte anti-fraude & métriques Côte d'Ivoire
          </p>
        </div>
      </div>

      {/* KPI Stats overview */}
      <div className="grid grid-cols-3 gap-2">
        <div className="p-3.5 rounded-2xl bg-[#16181D] border border-white/10 text-center shadow-md">
          <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Annonces</span>
          <span className="text-lg font-black text-white font-mono">
            {properties.length}
          </span>
        </div>
        <div className="p-3.5 rounded-2xl bg-[#16181D] border border-white/10 text-center shadow-md">
          <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Signalements</span>
          <span className="text-lg font-black text-rose-500 font-mono">
            {reports.filter((r) => r.status === 'pending').length}
          </span>
        </div>
        <div className="p-3.5 rounded-2xl bg-[#16181D] border border-white/10 text-center shadow-md">
          <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Revenus MoMo</span>
          <span className="text-xs font-black text-[#FFD700] font-mono">
            285 000 F
          </span>
        </div>
      </div>

      {/* Sub tabs */}
      <div className="flex rounded-2xl bg-[#16181D] border border-white/10 p-1.5 text-xs font-bold">
        <button
          onClick={() => setFilterType('reports')}
          className={`flex-1 py-2 rounded-xl transition ${
            filterType === 'reports'
              ? 'bg-[#FF5A2D] text-white shadow-[0_0_15px_rgba(255,90,45,0.4)]'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          Signalements ({reports.filter((r) => r.status === 'pending').length})
        </button>
        <button
          onClick={() => setFilterType('all')}
          className={`flex-1 py-2 rounded-xl transition ${
            filterType === 'all'
              ? 'bg-[#FF5A2D] text-white shadow-[0_0_15px_rgba(255,90,45,0.4)]'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          Toutes les annonces
        </button>
      </div>

      {/* Content */}
      {filterType === 'reports' ? (
        <div className="space-y-3">
          {reports.filter((r) => r.status === 'pending').length === 0 ? (
            <div className="py-12 text-center text-xs text-gray-400">
              Aucun signalement en attente. Toutes les annonces sont saines !
            </div>
          ) : (
            reports
              .filter((r) => r.status === 'pending')
              .map((rep) => {
                const targetProp = properties.find((p) => p.id === rep.propertyId);
                return (
                  <div
                    key={rep.id}
                    className="p-4 rounded-2xl bg-rose-950/20 border border-rose-900/50 space-y-2.5 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-extrabold text-rose-400 uppercase tracking-wider text-[10px] flex items-center gap-1.5">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        <span>Motif : {rep.reason}</span>
                      </span>
                      <span className="text-[10px] text-gray-400">
                        {new Date(rep.createdAt).toLocaleDateString('fr-FR')}
                      </span>
                    </div>

                    <div className="font-bold text-white">
                      Bien incriminé : {targetProp?.title || rep.propertyId}
                    </div>

                    <p className="text-gray-300 italic bg-black/40 border border-white/5 p-2.5 rounded-xl">
                      "{rep.description}"
                    </p>

                    <div className="flex gap-2 pt-2 border-t border-white/10">
                      <button
                        onClick={() => {
                          onModerateProperty(rep.propertyId, 'delete');
                          onResolveReport(rep.id, 'banned');
                        }}
                        className="flex-1 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs flex items-center justify-center gap-1 transition shadow-sm"
                      >
                        <Ban className="w-3.5 h-3.5" />
                        <span>Supprimer & Bannir</span>
                      </button>

                      <button
                        onClick={() => onResolveReport(rep.id, 'dismissed')}
                        className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-gray-300 font-semibold text-xs transition"
                      >
                        Classer sans suite
                      </button>
                    </div>
                  </div>
                );
              })
          )}
        </div>
      ) : (
        /* Toutes les annonces */
        <div className="space-y-3">
          {properties.map((p) => (
            <div
              key={p.id}
              className="p-4 rounded-2xl bg-[#16181D] border border-white/10 shadow-lg space-y-2 text-xs text-white"
            >
              <div className="flex items-center justify-between">
                <span className="font-bold line-clamp-1 text-gray-200">{p.title}</span>
                <span className="font-black text-white font-mono">
                  {formatFCFA(p.price)}
                </span>
              </div>

              <div className="flex items-center justify-between text-gray-400 text-[11px]">
                <span>
                  Bailleur : <strong className="text-gray-200">{p.advertiser.name}</strong>
                </span>
                <span>{p.commune}</span>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-white/10">
                <button
                  onClick={() => onVerifyAdvertiser(p.id)}
                  className="flex items-center gap-1.5 text-[11px] font-bold text-[#4CAF50] hover:underline"
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>
                    {p.advertiser.verifications.length >= 3
                      ? 'Déjà certifié CNI/RCCM'
                      : 'Attribuer badge certifié'}
                  </span>
                </button>

                <button
                  onClick={() => onModerateProperty(p.id, 'delete')}
                  className="text-[11px] text-rose-400 font-bold hover:underline"
                >
                  Supprimer l'annonce
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};