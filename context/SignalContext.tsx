import React, { createContext, useState, useEffect, useContext, useCallback, useMemo } from 'react';
import { supabase } from '../utils/supabase';
import { signalService, Signal } from '../services/signalService';
import { GoldPriceService, SignalStatus } from '../utils/goldAPI';
import { useAuth } from './AuthContext';
import { RealtimeChannel } from '@supabase/supabase-js';

type SignalStats = {
  total: number;
  active: number;
  winRate: string;
  totalPnl: number;
};

type SignalContextType = {
  signals: Signal[];
  stats: SignalStats;
  currentGoldPrice: number;
  loading: boolean;
  initialLoad: boolean;
};

const SignalContext = createContext<SignalContextType>({
  signals: [],
  stats: { total: 0, active: 0, winRate: '0', totalPnl: 0 },
  currentGoldPrice: 0,
  loading: true,
  initialLoad: true,
});

export const useSignals = () => useContext(SignalContext);

export const SignalProvider = ({ children }: { children: React.ReactNode }) => {
  const { session } = useAuth();
  const [signals, setSignals] = useState<Signal[]>([]);
  const [currentGoldPrice, setCurrentGoldPrice] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [initialLoad, setInitialLoad] = useState(true);

  const goldService = GoldPriceService.getInstance();

  const updateAndFetchPrice = useCallback(async () => {
    try {
      const priceData = await goldService.getCurrentGoldPrice();
      setCurrentGoldPrice(priceData.price);
      return priceData.price;
    } catch (error) {
      console.error("Failed to fetch gold price", error);
      return currentGoldPrice;
    }
  }, [goldService, currentGoldPrice]);

  const updateSignalStatuses = useCallback(async (currentPrice: number, signalsToUpdate: Signal[]) => {
    const activeSignals = signalsToUpdate.filter(s => s.status === 'active');
    if (activeSignals.length === 0) return;

    const updates: Promise<void>[] = activeSignals.map(async (signal) => {
      const signalStatus: SignalStatus = await goldService.checkSignalStatus(signal, currentPrice);
      // Only update if status or PNL has changed significantly
      if (signal.status !== signalStatus.status || Math.abs((signal.pnl || 0) - signalStatus.pnl) > 0.01) {
        await signalService.updateSignal(signal.id, {
          status: signalStatus.status,
          current_price: signalStatus.currentPrice,
          pnl: signalStatus.pnl,
          pnl_percentage: signalStatus.pnlPercentage,
        });
      }
    });
    
    await Promise.all(updates).catch(err => console.error("Error batch updating signals:", err));
  }, [goldService]);

  const loadInitialData = useCallback(async () => {
    setLoading(true);
    const price = await updateAndFetchPrice();
    const initialSignals = await signalService.getAllSignals();
    setSignals(initialSignals.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()));
    await updateSignalStatuses(price, initialSignals);
    setLoading(false);
    setInitialLoad(false);
  }, [updateAndFetchPrice, updateSignalStatuses]);

  useEffect(() => {
    if (session) {
      loadInitialData();

      const channel: RealtimeChannel = supabase
        .channel('signals')
        .on<Signal>(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'signals' },
          (payload) => {
            setSignals(currentSignals => {
              if (payload.eventType === 'INSERT') {
                return [payload.new, ...currentSignals];
              }
              if (payload.eventType === 'UPDATE') {
                return currentSignals.map(s => s.id === payload.new.id ? payload.new : s);
              }
              if (payload.eventType === 'DELETE') {
                return currentSignals.filter(s => s.id !== (payload.old as Signal).id);
              }
              return currentSignals;
            });
          }
        )
        .subscribe();

      const priceInterval = setInterval(async () => {
        const price = await updateAndFetchPrice();
        setSignals(currentSignals => {
          updateSignalStatuses(price, currentSignals);
          return currentSignals;
        });
      }, 30000); // every 30 seconds

      return () => {
        supabase.removeChannel(channel);
        clearInterval(priceInterval);
      };
    }
  }, [session, loadInitialData]);

  const stats = useMemo<SignalStats>(() => {
    const publishedSignals = signals.filter(s => !s.is_draft);
    const activeSignals = publishedSignals.filter(s => s.status === 'active');
    const closedSignals = publishedSignals.filter(s => s.status !== 'active');
    const profitableSignals = closedSignals.filter(s => (s.pnl || 0) > 0);
    const totalPnl = publishedSignals.reduce((sum, signal) => sum + (signal.pnl || 0), 0);
    const winRate = closedSignals.length > 0 ? ((profitableSignals.length / closedSignals.length) * 100).toFixed(1) : '0';

    return {
      total: publishedSignals.length,
      active: activeSignals.length,
      winRate,
      totalPnl,
    };
  }, [signals]);

  const value = {
    signals,
    stats,
    currentGoldPrice,
    loading: loading && initialLoad,
    initialLoad,
  };

  return <SignalContext.Provider value={value}>{children}</SignalContext.Provider>;
};
