'use client';

import React, { useState } from 'react';
import {
  X,
  Coins,
  Zap,
  CheckCircle2,
  Sparkles,
  Smartphone,
  ShieldCheck,
  Flame,
  ArrowRight,
  AlertCircle
} from 'lucide-react';
import { MobileMoneyOperator, PaymentOrder } from '@/types';
import { COIN_PACKAGES, processMobileMoneyPayment } from '@/services/paymentService';
import { formatFCFA } from '@/services/budgetService';

interface CoinsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentBalance: number;
  onPurchaseComplete: (addedCoins: number, order: PaymentOrder) => void;
  onActivatePriorityPass: () => void;
  isPriorityActive: boolean;
}

export const CoinsModal: React.FC<CoinsModalProps> = ({
  isOpen,
  onClose,
  currentBalance,
  onPurchaseComplete,
  onActivatePriorityPass,
  isPriorityActive
}) => {
  const [selectedPackId, setSelectedPackId] = useState<string>('pro');
  const [selectedOperator, setSelectedOperator] = useState<MobileMoneyOperator>('wave');
  const [phoneNumber, setPhoneNumber] = useState<string>('0707123456');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [paymentSuccess, setPaymentSuccess] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const selectedPack = COIN_PACKAGES.find((p) => p.id === selectedPackId) || COIN_PACKAGES[1];

  const handlePay = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsProcessing(true);

    try {
      const order = await processMobileMoneyPayment({
        operator: selectedOperator,
        phoneNumber,
        amountFCFA: selectedPack.priceFCFA,
        description: `Achat Pack ${selectedPack.name} - ${selectedPack.coins} Babi Coins`
      });

      if (order.status === 'success') {
        setPaymentSuccess(true);
        onPurchaseComplete(selectedPack.coins, order);
        setTimeout(() => {
          setPaymentSuccess(false);
          onClose();
        }, 2200);
      } else {
        setErrorMessage(order.errorMessage || 'Paiement non finalisé');
      }
    } catch {
      setErrorMessage('Erreur de communication avec la passerelle de paiement.');
    } finally {
      setIsProcessing(false);
    }
  };

  const operators: { id: MobileMoneyOperator; name: string; color: string; bg: string }[] = [
    { id: 'wave', name: 'Wave (Sans frais)', color: 'text-sky-400', bg: 'bg-sky-500/10 border-sky-500/40 text-sky-300' },
    { id: 'orange', name: 'Orange Money CI', color: 'text-orange-400', bg: 'bg-orange-500/10 border-orange-500/40 text-orange-300' },
    { id: 'mtn', name: 'MTN MoMo CI', color: 'text-yellow-400', bg: 'bg-yellow-500/10 border-yellow-500/40 text-yellow-300' },
    { id: 'moov', name: 'Moov Money CI', color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/40 text-blue-300' }
  ];

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/80 backdrop-blur-sm p-3 sm:p-4">
      <div
        id="coins-modal"
        className="w-full max-w-md bg-[#16181D] rounded-3xl border border-white/10 shadow-2xl overflow-hidden flex flex-col text-white animate-in zoom-in-95 duration-200"
      >
        {/* Header with Coin Theme */}
        <div className="p-5 bg-gradient-to-r from-[#FF5A2D] via-amber-600 to-[#FFD700] text-white relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-black/30 hover:bg-black/50 text-white transition active:scale-95"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-black/30 backdrop-blur-md flex items-center justify-center text-[#FFD700] shadow-lg border border-white/20">
              <Coins className="w-7 h-7" />
            </div>
            <div>
              <span className="text-xs uppercase font-extrabold tracking-wider text-amber-100 block">
                Solde Actuel
              </span>
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl font-black text-white drop-shadow-xs">
                  {currentBalance}
                </span>
                <span className="text-sm font-bold text-amber-100">Babi Coins</span>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Content */}
        <div className="p-5 overflow-y-auto max-h-[75vh] space-y-5 text-xs">
          {paymentSuccess ? (
            <div className="py-8 text-center space-y-3">
              <CheckCircle2 className="w-14 h-14 text-[#4CAF50] mx-auto animate-bounce" />
              <h3 className="text-lg font-bold text-white">
                Paiement Mobile Money réussi !
              </h3>
              <p className="text-xs text-gray-400">
                +{selectedPack.coins} Babi Coins ont été crédités sur votre compte.
              </p>
            </div>
          ) : (
            <>
              {/* Feature Perks Unlockable with Coins */}
              <div className="p-3.5 rounded-2xl bg-[#0F1115] border border-white/10 space-y-2">
                <span className="font-bold text-[11px] text-gray-400 uppercase tracking-wider block">
                  Avantages disponibles avec vos Coins :
                </span>
                <div className="space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-gray-200">
                      <Zap className="w-3.5 h-3.5 text-[#FFD700]" />
                      <span>Boost Annonce (Top du Swipe 48h)</span>
                    </span>
                    <span className="font-bold text-[#FFD700]">50 Coins</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-gray-200">
                      <Sparkles className="w-3.5 h-3.5 text-[#FF5A2D]" />
                      <span>Pass Contact Prioritaire Direct</span>
                    </span>
                    <button
                      onClick={onActivatePriorityPass}
                      disabled={currentBalance < 30 || isPriorityActive}
                      className="px-2.5 py-1 rounded-xl bg-[#FF5A2D] hover:bg-[#FF5A2D]/90 text-white font-bold disabled:opacity-40 shadow-[0_0_10px_rgba(255,90,45,0.4)] transition"
                    >
                      {isPriorityActive ? 'Actif' : 'Activer (30 Coins)'}
                    </button>
                  </div>
                </div>
              </div>

              {/* Coin Packs Selection */}
              <div>
                <label className="font-bold uppercase text-[11px] text-gray-400 block mb-2 tracking-wider">
                  1. Choisissez votre pack de Coins
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {COIN_PACKAGES.map((pack) => {
                    const isSelected = selectedPackId === pack.id;
                    return (
                      <button
                        key={pack.id}
                        type="button"
                        onClick={() => setSelectedPackId(pack.id)}
                        className={`p-3 rounded-2xl border text-center relative transition ${
                          isSelected
                            ? 'border-[#FF5A2D] bg-[#FF5A2D]/15 shadow-[0_0_15px_rgba(255,90,45,0.3)]'
                            : 'border-white/10 bg-[#0F1115] hover:border-white/20'
                        }`}
                      >
                        {pack.badge && (
                          <span className="absolute -top-2 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full bg-[#FF5A2D] text-white text-[9px] font-black uppercase whitespace-nowrap shadow-sm">
                            {pack.badge}
                          </span>
                        )}
                        <span className="text-base font-black text-white block">
                          {pack.coins}
                        </span>
                        <span className="text-[10px] text-gray-400 block">Coins</span>
                        <span className="text-xs font-bold text-[#FFD700] block mt-1">
                          {formatFCFA(pack.priceFCFA)}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Payment Operator Selection */}
              <div>
                <label className="font-bold uppercase text-[11px] text-gray-400 block mb-2 tracking-wider">
                  2. Moyen de paiement (Mobile Money CI)
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {operators.map((op) => (
                    <button
                      key={op.id}
                      type="button"
                      onClick={() => setSelectedOperator(op.id)}
                      className={`p-2.5 rounded-2xl border text-left font-bold transition flex items-center justify-between ${
                        selectedOperator === op.id
                          ? `${op.bg} border-2`
                          : 'border-white/10 bg-[#0F1115] text-gray-300 hover:border-white/20'
                      }`}
                    >
                      <span className="text-xs">{op.name}</span>
                      {selectedOperator === op.id && (
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#4CAF50] flex-shrink-0" />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Phone number for Push validation */}
              <form onSubmit={handlePay} className="space-y-3 pt-1">
                <div>
                  <label className="font-semibold block mb-1 text-gray-300">
                    Numéro de débit Mobile Money (+225)
                  </label>
                  <div className="relative">
                    <Smartphone className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="tel"
                      required
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      placeholder="07 00 00 00 00"
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-white/10 bg-[#0F1115] text-white text-xs font-semibold focus:outline-none focus:border-[#FF5A2D]"
                    />
                  </div>
                  <span className="text-[10px] text-gray-400 block mt-1">
                    Un prompt de confirmation USSD / Push s'affichera sur votre téléphone.
                  </span>
                </div>

                {errorMessage && (
                  <div className="p-2.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-1.5">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    <span>{errorMessage}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isProcessing}
                  className="w-full py-3.5 rounded-2xl bg-[#FF5A2D] hover:bg-[#FF5A2D]/90 text-white font-black text-xs shadow-[0_0_20px_rgba(255,90,45,0.4)] transition active:scale-98 flex items-center justify-center gap-2"
                >
                  <Coins className="w-4 h-4 text-[#FFD700]" />
                  <span>
                    {isProcessing
                      ? 'Paiement en cours...'
                      : `Payer ${formatFCFA(selectedPack.priceFCFA)} par ${selectedOperator.toUpperCase()}`}
                  </span>
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
};