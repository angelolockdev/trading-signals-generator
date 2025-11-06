import { Signal } from '../services/signalService';

export interface PriceAlert {
  id: string;
  userId: string;
  targetPrice: number;
  condition: 'above' | 'below';
  isActive: boolean;
  createdAt: string;
}

export class NotificationService {
  private static alerts: PriceAlert[] = [];

  static addAlert(alert: Omit<PriceAlert, 'id' | 'createdAt'>): PriceAlert {
    const newAlert: PriceAlert = {
      ...alert,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    };
    this.alerts.push(newAlert);
    return newAlert;
  }

  static removeAlert(alertId: string): void {
    this.alerts = this.alerts.filter(a => a.id !== alertId);
  }

  static getAlerts(userId: string): PriceAlert[] {
    return this.alerts.filter(a => a.userId === userId && a.isActive);
  }

  static checkAlerts(userId: string, currentPrice: number): PriceAlert[] {
    const triggeredAlerts: PriceAlert[] = [];

    this.alerts.forEach(alert => {
      if (alert.userId === userId && alert.isActive) {
        const triggered =
          (alert.condition === 'above' && currentPrice >= alert.targetPrice) ||
          (alert.condition === 'below' && currentPrice <= alert.targetPrice);

        if (triggered) {
          alert.isActive = false;
          triggeredAlerts.push(alert);
        }
      }
    });

    return triggeredAlerts;
  }

  static generateSignalNotification(signal: Signal): string {
    const emoji = signal.action === 'BUY' ? '📈' : '📉';
    return `${emoji} Signal ${signal.status.toUpperCase()}: ${signal.symbol} ${signal.action} - PnL: $${(signal.pnl || 0).toFixed(2)}`;
  }

  static shouldNotifySignalUpdate(oldSignal: Signal, newSignal: Signal): boolean {
    return oldSignal.status !== newSignal.status;
  }
}
