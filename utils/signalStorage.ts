import AsyncStorage from '@react-native-async-storage/async-storage';

export interface StoredSignal {
  id: string;
  symbol: string;
  action: 'BUY' | 'SELL';
  entryFrom: string;
  entryTo: string;
  stopLoss: string;
  takeProfit1: string;
  takeProfit2: string;
  takeProfit3: string;
  notes: string;
  createdAt: number;
  status: 'active' | 'tp1_hit' | 'tp2_hit' | 'tp3_hit' | 'sl_hit' | 'closed';
  currentPrice?: number;
  pnl?: number;
  pnlPercentage?: number;
  lastUpdate?: number;
}

const SIGNALS_STORAGE_KEY = 'trading_signals';

export class SignalStorage {
  static async saveSignal(signal: Omit<StoredSignal, 'id' | 'createdAt' | 'status'>): Promise<string> {
    try {
      const signals = await this.getAllSignals();
      const newSignal: StoredSignal = {
        ...signal,
        id: Date.now().toString(),
        createdAt: Date.now(),
        status: 'active'
      };
      
      signals.push(newSignal);
      await AsyncStorage.setItem(SIGNALS_STORAGE_KEY, JSON.stringify(signals));
      return newSignal.id;
    } catch (error) {
      console.error('Error saving signal:', error);
      throw error;
    }
  }

  static async getAllSignals(): Promise<StoredSignal[]> {
    try {
      const signalsData = await AsyncStorage.getItem(SIGNALS_STORAGE_KEY);
      return signalsData ? JSON.parse(signalsData) : [];
    } catch (error) {
      console.error('Error getting signals:', error);
      return [];
    }
  }

  static async updateSignalStatus(signalId: string, updates: Partial<StoredSignal>): Promise<void> {
    try {
      const signals = await this.getAllSignals();
      const signalIndex = signals.findIndex(s => s.id === signalId);
      
      if (signalIndex !== -1) {
        signals[signalIndex] = { ...signals[signalIndex], ...updates, lastUpdate: Date.now() };
        await AsyncStorage.setItem(SIGNALS_STORAGE_KEY, JSON.stringify(signals));
      }
    } catch (error) {
      console.error('Error updating signal:', error);
      throw error;
    }
  }

  static async deleteSignal(signalId: string): Promise<void> {
    try {
      const signals = await this.getAllSignals();
      const filteredSignals = signals.filter(s => s.id !== signalId);
      await AsyncStorage.setItem(SIGNALS_STORAGE_KEY, JSON.stringify(filteredSignals));
    } catch (error) {
      console.error('Error deleting signal:', error);
      throw error;
    }
  }

  static async clearAllSignals(): Promise<void> {
    try {
      await AsyncStorage.removeItem(SIGNALS_STORAGE_KEY);
    } catch (error) {
      console.error('Error clearing signals:', error);
      throw error;
    }
  }
}
