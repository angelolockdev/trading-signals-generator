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
// Allorigins proxy wrapper to bypass CORS for Investing.com XAU/USD page
const INVESTING_PROXY_URL = 'https://api.allorigins.win/raw?url=https://fr.investing.com/currencies/xau-usd';

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
  
    // Cache pour éviter trop d'appels
    if (now - this.lastUpdate < 25000 && this.currentPrice > 0) {
      return {
        symbol: 'XAUUSD',
        price: this.currentPrice,
        timestamp: this.lastUpdate,
        change: 0,
        changePercent: 0
      };
    }
  
    // Helper pour parser les nombres ex: "3.504,92" "3 504,92" "3,504.92" "3504.92"
    const parseLocaleNumber = (raw: string): number => {
      const s = (raw || '').trim();
      const only = s.replace(/[^\d\.,\s]/g, '');
      const hasDot = only.indexOf('.') !== -1;
      const hasComma = only.indexOf(',') !== -1;
      let normalized = only;
  
      if (hasDot && hasComma) {
        const decimalSep = only.lastIndexOf(',') > only.lastIndexOf('.') ? ',' : '.';
        const thousandsSep = decimalSep === ',' ? '.' : ',';
        normalized = only.split(thousandsSep).join('');
        normalized = normalized.replace(decimalSep, '.');
      } else if (hasComma && !hasDot) {
        const parts = only.split(',');
        if (parts[1] && parts[1].length <= 2) {
          normalized = only.replace(/\s+/g, '').replace(',', '.');
        } else {
          normalized = only.replace(/,/g, '');
        }
      } else {
        normalized = only.replace(/\s+/g, '').replace(/,/g, '');
      }
  
      const num = parseFloat(normalized);
      return Number.isFinite(num) ? num : NaN;
    };
  
    // Tentative principale: goldapi.io
    try {
      const apiKey = process.env.EXPO_PUBLIC_GOLD_API_KEY;
      if (!apiKey || apiKey.includes('YOUR_API_KEY')) {
        throw new Error('Gold API key not configured');
      }
  
      const response = await fetch(GOLD_API_ENDPOINT, {
        method: 'GET',
        headers: {
          'x-access-token': apiKey,
          'Content-Type': 'application/json',
        },
      });
  
      // On essaye de parser le JSON même si response.ok est false (pour récupérer le message d'erreur)
      let apiData: any = null;
      try {
        apiData = await response.json();
      } catch (e) {
        apiData = null;
      }
  
      // Cas succès avec price
      if (response.ok && apiData && typeof apiData.price === 'number') {
        this.currentPrice = apiData.price;
        // timestamp peut être en secondes : on convertit si nécessaire
        this.lastUpdate = apiData.timestamp && apiData.timestamp < 1e12 ? apiData.timestamp * 1000 : (apiData.timestamp || now);
        return {
          symbol: 'XAUUSD',
          price: this.currentPrice,
          timestamp: this.lastUpdate,
          change: 0,
          changePercent: 0
        };
      }
  
      // SI goldapi renvoie l'erreur de quota -> on lance scraping
      const quotaMsg = 'Monthly API quota exceeded';
      const apiErrorMessage = apiData && apiData.error ? String(apiData.error) : '';
      if (apiErrorMessage.includes(quotaMsg)) {
        console.warn('GoldAPI quota exceeded — fallback to scraping Investing.com');
        // Scraping Investing.com via proxy (seulement ici)
        try {
          const htmlRes = await fetch(INVESTING_PROXY_URL);
          if (!htmlRes.ok) throw new Error(`Investing proxy returned ${htmlRes.status}`);
          const html = await htmlRes.text();
  
          const regexes = [
            /data-test="instrument-price-last"[^>]*>([0-9\.,\s]+)<\/?/i,
            /id=["']last_last["'][^>]*>([0-9\.,\s]+)<\/?/i,
            /"last"\s*:\s*"([0-9\.,\s]+)"/i,
            /<span[^>]*class[^>]*>([0-9]{1,3}(?:[ \.,][0-9]{3})*(?:[.,][0-9]+)?)<\/span>/i
          ];
  
          let foundPrice: number | null = null;
          for (const r of regexes) {
            const m = html.match(r);
            if (m && m[1]) {
              const parsed = parseLocaleNumber(m[1]);
              if (!isNaN(parsed)) {
                foundPrice = parsed;
                break;
              }
            }
          }
  
          if (foundPrice === null) {
            const idx = html.indexOf('XAU/USD');
            if (idx !== -1) {
              const snippet = html.slice(idx, idx + 800);
              const m = snippet.match(/([0-9\.,\s]{4,20})/);
              if (m && m[1]) {
                const parsed = parseLocaleNumber(m[1]);
                if (!isNaN(parsed)) foundPrice = parsed;
              }
            }
          }
  
          if (foundPrice !== null) {
            this.currentPrice = foundPrice;
            this.lastUpdate = now;
          } else {
            throw new Error('Investing.com price not found by regex');
          }
        } catch (scrapeErr) {
          console.error('Scraping failed after quota error:', scrapeErr);
          // fallback to previous price or simulation
          if (this.currentPrice === 0 || isNaN(this.currentPrice)) {
            this.currentPrice = this.generateRealisticPrice();
          }
          this.lastUpdate = now;
        }
  
        return {
          symbol: 'XAUUSD',
          price: this.currentPrice,
          timestamp: this.lastUpdate,
          change: 0,
          changePercent: 0
        };
      }
  
      // Pour toutes les autres erreurs de goldapi (401, network, format unexpected, etc.)
      // On n'exécute PAS le scraping (conformément à ta demande) : on log et fallback.
      console.error('GoldAPI returned an error (no scraping):', response.status, apiErrorMessage);
      if (this.currentPrice === 0 || isNaN(this.currentPrice)) {
        this.currentPrice = this.generateRealisticPrice();
      }
      this.lastUpdate = now;
      return {
        symbol: 'XAUUSD',
        price: this.currentPrice,
        timestamp: this.lastUpdate,
        change: 0,
        changePercent: 0
      };
  
    } catch (err) {
      // Erreur réseau / exception inattendue - on ne lance PAS le scraping (volonté explicite)
      console.error('GoldAPI fetch exception (no scraping):', err);
      if (this.currentPrice === 0 || isNaN(this.currentPrice)) {
        this.currentPrice = this.generateRealisticPrice();
      }
      this.lastUpdate = now;
      return {
        symbol: 'XAUUSD',
        price: this.currentPrice,
        timestamp: this.lastUpdate,
        change: 0,
        changePercent: 0
      };
    }
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
