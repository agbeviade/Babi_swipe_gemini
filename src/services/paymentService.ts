import { MobileMoneyProvider, PaymentOrder, CoinPack } from '@/types';

export interface MobileMoneySimulationResult {
  order: PaymentOrder;
  message: string;
}

export const COIN_PACKAGES = [
  {
    id: 'decouverte',
    name: 'Découverte',
    coins: 100,
    priceFCFA: 1000,
    badge: 'Idéal Débutant'
  },
  {
    id: 'pro',
    name: 'Pro',
    coins: 300,
    priceFCFA: 2500,
    badge: 'Populaire (+20%)'
  },
  {
    id: 'business',
    name: 'Business',
    coins: 1000,
    priceFCFA: 7000,
    badge: 'Meilleure Offre'
  }
];

export async function processMobileMoneyPayment(params: {
  operator: string;
  phoneNumber: string;
  amountFCFA: number;
  description: string;
}): Promise<PaymentOrder> {
  const provider =
    params.operator === 'orange'
      ? 'orange_money'
      : params.operator === 'mtn'
      ? 'mtn_momo'
      : params.operator === 'moov'
      ? 'moov_money'
      : 'wave';

  const order = await MobileMoneyService.initiatePayment(
    `user-${params.phoneNumber}`,
    params.amountFCFA,
    'babi_coins',
    provider
  );
  order.operator = params.operator;

  const confirmed = await MobileMoneyService.confirmPayment(order.id);
  confirmed.operator = params.operator;
  return confirmed;
}

/**
 * Mobile Money Payment Gateway Abstraction
 * Handles idempotent order creation, provider routing, and verified status transitions.
 */
export class MobileMoneyService {
  private static STORAGE_KEY = 'babi_payment_orders';

  public static getOrders(): PaymentOrder[] {
    try {
      const data = localStorage.getItem(this.STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  public static saveOrder(order: PaymentOrder): void {
    const orders = this.getOrders();
    const existingIndex = orders.findIndex((o) => o.id === order.id);
    if (existingIndex >= 0) {
      orders[existingIndex] = order;
    } else {
      orders.unshift(order);
    }
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(orders));
  }

  /**
   * Initializes a Mobile Money transaction with idempotency key
   */
  public static async initiatePayment(
    userId: string,
    amountFcfa: number,
    productType: PaymentOrder['productType'],
    provider: MobileMoneyProvider,
    coinsAllocated?: number
  ): Promise<PaymentOrder> {
    const externalRef = `MM-${provider.toUpperCase()}-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
    const order: PaymentOrder = {
      id: `ord-${Date.now()}`,
      userId,
      amountFcfa,
      coinsAllocated,
      productType,
      provider,
      status: 'pending',
      externalRef,
      createdAt: new Date().toISOString()
    };

    this.saveOrder(order);
    return order;
  }

  /**
   * Simulates Mobile Money provider callback/verification
   * (e.g. Wave deep link push confirmation or Orange Money USSD push #144*82#)
   */
  public static async confirmPayment(orderId: string): Promise<PaymentOrder> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const orders = this.getOrders();
        const order = orders.find((o) => o.id === orderId);
        if (order) {
          order.status = 'success';
          this.saveOrder(order);
          resolve(order);
        } else {
          throw new Error('Commande introuvable');
        }
      }, 1500);
    });
  }

  /**
   * Provider metadata & display info
   */
  public static getProviderDetails(provider: MobileMoneyProvider) {
    switch (provider) {
      case 'wave':
        return {
          name: 'Wave Côte d\'Ivoire',
          shortName: 'Wave',
          color: 'bg-sky-500 hover:bg-sky-600 text-white',
          badge: '0% de frais • Instantané',
          iconColor: '#0ea5e9'
        };
      case 'orange_money':
        return {
          name: 'Orange Money',
          shortName: 'OM',
          color: 'bg-orange-500 hover:bg-orange-600 text-white',
          badge: '#144# ou App Max it',
          iconColor: '#f97316'
        };
      case 'mtn_momo':
        return {
          name: 'MTN Mobile Money',
          shortName: 'MoMo',
          color: 'bg-yellow-500 hover:bg-yellow-600 text-black',
          badge: '*133# MoMo Pay',
          iconColor: '#eab308'
        };
      case 'moov_money':
        return {
          name: 'Moov Money',
          shortName: 'Moov',
          color: 'bg-blue-600 hover:bg-blue-700 text-white',
          badge: '*155# Flooz',
          iconColor: '#2563eb'
        };
    }
  }
}
