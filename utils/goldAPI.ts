import { Signal } from '../services/signalService';
// Gold price API integration
export interface GoldPrice {
  symbol: string;
  price: number;
  timestamp: number;
  change: number;
  changePercent: number;
}

export interface SignalStatus {
  id: string;
  currentPrice: number;
  status: 'active' | 'tp1_hit' | 'tp2_hit' | 'tp3_hit' | 'sl_hit' | 'closed';
  pnl: number;
  pnlPercentage: number;
  updatedAt: number;
}

// Gold API endpoint for XAU/USD
const GOLD_API_ENDPOINT = 'https://www.goldapi.io/api/XAU/USD';

export class GoldPriceService {
  private static instance: GoldPriceService;
  private currentPrice: number = 0; // Start with 0
  private lastUpdate: number = 0;

  static getInstance(): GoldPriceService {
    if (!GoldPriceService.instance) {
      GoldPriceService.instance = new GoldPriceService();
    }
    return GoldPriceService.instance;
  }

  async getCurrentGoldPrice(): Promise<GoldPrice> {
    const now = Date.now();
    
    // Cache for 25 seconds to avoid too many API calls
    if (now - this.lastUpdate < 25000 && this.currentPrice > 0) {
      return {
        symbol: 'XAUUSD',
        price: this.currentPrice,
        timestamp: this.lastUpdate,
        change: 0,
        changePercent: 0
      };
    }

    try {
      const apiKey = process.env.EXPO_PUBLIC_GOLD_API_KEY;
      if (!apiKey || apiKey.includes('YOUR_API_KEY')) {
        throw new Error('Gold API key is not configured in .env file.');
      }

      const response = await fetch(GOLD_API_ENDPOINT, {
        method: 'GET',
        headers: {
          'x-access-token': apiKey,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data && data.price) {
            this.currentPrice = data.price;
            // goldapi.io timestamp is in seconds, convert to milliseconds
            this.lastUpdate = data.timestamp * 1000; 
        } else {
            throw new Error('Invalid API response structure from goldapi.io');
        }
      } else {
        if (response.status === 401) {
            console.error('Gold API request failed: Invalid API key.');
        }
        throw new Error(`Gold API request failed with status: ${response.status}`);
      }
    } catch (error) {
      console.error('Gold API fetch error:', error);
      if (this.currentPrice === 0) { // Only simulate if we have no price at all
        console.log('Using realistic price simulation as fallback.');
        this.currentPrice = this.generateRealisticPrice();
      }
      this.lastUpdate = now;
    }

    return {
      symbol: 'XAUUSD',
      price: this.currentPrice,
      timestamp: this.lastUpdate,
      change: 0, // Not available on free plan
      changePercent: 0 // Not available on free plan
    };
  }

  private generateRealisticPrice(): number {
    const basePrice = 2050;
    const variation = (Math.random() - 0.5) * 100;
    const timeVariation = Math.sin(Date.now() / 1000000) * 20;
    return Math.round((basePrice + variation + timeVariation) * 100) / 100;
  }

  async checkSignalStatus(signal: Signal, currentPrice: number): Promise<SignalStatus> {
    if (signal.status !== 'active') {
      return {
        id: signal.id,
        currentPrice: signal.current_price || currentPrice,
        status: signal.status as any,
        pnl: signal.pnl || 0,
        pnlPercentage: signal.pnl_percentage || 0,
        updatedAt: new Date(signal.updated_at).getTime(),
      };
    }
    
    const entryPrice = ((signal.entry_from || 0) + (signal.entry_to || signal.entry_from || 0)) / 2;
    const stopLoss = signal.stop_loss || 0;
    const tp1 = signal.take_profit_1 || 0;
    const tp2 = signal.take_profit_2 || 0;
    const tp3 = signal.take_profit_3 || 0;

    let status: 'active' | 'tp1_hit' | 'tp2_hit' | 'tp3_hit' | 'sl_hit' | 'closed' = 'active';
    let pnl = 0;
    let pnlPercentage = 0;
    let exitPrice = currentPrice;

    if (signal.action === 'BUY') {
      if (currentPrice <= stopLoss) {
        status = 'sl_hit';
        exitPrice = stopLoss;
      }
      else if (tp3 > 0 && currentPrice >= tp3) status = 'tp3_hit';
      else if (tp2 > 0 && currentPrice >= tp2) status = 'tp2_hit';
      else if (tp1 > 0 && currentPrice >= tp1) status = 'tp1_hit';
    } else { // SELL logic
      if (currentPrice >= stopLoss) {
        status = 'sl_hit';
        exitPrice = stopLoss;
      }
      else if (tp3 > 0 && currentPrice <= tp3) status = 'tp3_hit';
      else if (tp2 > 0 && currentPrice <= tp2) status = 'tp2_hit';
      else if (tp1 > 0 && currentPrice <= tp1) status = 'tp1_hit';
    }

    if (status !== 'active' && status !== 'sl_hit') {
      exitPrice = status === 'tp3_hit' ? tp3 : status === 'tp2_hit' ? tp2 : tp1;
    }

    if (entryPrice > 0) {
      if (signal.action === 'BUY') {
        pnl = (exitPrice - entryPrice) * 100;
      } else {
        pnl = (entryPrice - exitPrice) * 100;
      }
      pnlPercentage = (pnl / (entryPrice * 100)) * 100;
    }

    return {
      id: signal.id,
      currentPrice,
      status,
      pnl: Math.round(pnl * 100) / 100,
      pnlPercentage: Math.round(pnlPercentage * 100) / 100,
      updatedAt: Date.now()
    };
  }
}
