import { Signal } from '../services/signalService';

export interface AnalyticsData {
  totalSignals: number;
  winRate: number;
  avgPnl: number;
  bestTrade: Signal | null;
  worstTrade: Signal | null;
  profitFactor: number;
  totalProfit: number;
  totalLoss: number;
  avgWinSize: number;
  avgLossSize: number;
  consecutiveWins: number;
  consecutiveLosses: number;
  byAction: {
    buy: { count: number; winRate: number; avgPnl: number };
    sell: { count: number; winRate: number; avgPnl: number };
  };
  monthlyStats: Array<{
    month: string;
    pnl: number;
    trades: number;
    winRate: number;
  }>;
}

export class AnalyticsService {
  static calculateAnalytics(signals: Signal[]): AnalyticsData {
    const closedSignals = signals.filter(s => !s.is_draft && s.status !== 'active');
    const profitableSignals = closedSignals.filter(s => (s.pnl || 0) > 0);
    const losingSignals = closedSignals.filter(s => (s.pnl || 0) < 0);

    const totalProfit = profitableSignals.reduce((sum, s) => sum + (s.pnl || 0), 0);
    const totalLoss = Math.abs(losingSignals.reduce((sum, s) => sum + (s.pnl || 0), 0));
    const profitFactor = totalLoss > 0 ? totalProfit / totalLoss : totalProfit > 0 ? Infinity : 0;

    const bestTrade = closedSignals.length > 0
      ? closedSignals.reduce((best, curr) => ((curr.pnl || 0) > (best.pnl || 0) ? curr : best))
      : null;

    const worstTrade = closedSignals.length > 0
      ? closedSignals.reduce((worst, curr) => ((curr.pnl || 0) < (worst.pnl || 0) ? curr : worst))
      : null;

    const buySignals = closedSignals.filter(s => s.action === 'BUY');
    const sellSignals = closedSignals.filter(s => s.action === 'SELL');

    const monthlyMap = new Map<string, { pnl: number; trades: number; wins: number }>();
    closedSignals.forEach(signal => {
      const date = new Date(signal.created_at);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const existing = monthlyMap.get(monthKey) || { pnl: 0, trades: 0, wins: 0 };
      existing.pnl += signal.pnl || 0;
      existing.trades += 1;
      if ((signal.pnl || 0) > 0) existing.wins += 1;
      monthlyMap.set(monthKey, existing);
    });

    const monthlyStats = Array.from(monthlyMap.entries())
      .map(([month, data]) => ({
        month,
        pnl: data.pnl,
        trades: data.trades,
        winRate: data.trades > 0 ? (data.wins / data.trades) * 100 : 0,
      }))
      .sort((a, b) => a.month.localeCompare(b.month));

    let consecutiveWins = 0;
    let consecutiveLosses = 0;
    let currentWins = 0;
    let currentLosses = 0;

    const sortedByDate = [...closedSignals].sort((a, b) =>
      new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    );

    sortedByDate.forEach(signal => {
      if ((signal.pnl || 0) > 0) {
        currentWins++;
        currentLosses = 0;
        consecutiveWins = Math.max(consecutiveWins, currentWins);
      } else if ((signal.pnl || 0) < 0) {
        currentLosses++;
        currentWins = 0;
        consecutiveLosses = Math.max(consecutiveLosses, currentLosses);
      }
    });

    return {
      totalSignals: closedSignals.length,
      winRate: closedSignals.length > 0 ? (profitableSignals.length / closedSignals.length) * 100 : 0,
      avgPnl: closedSignals.length > 0 ? closedSignals.reduce((sum, s) => sum + (s.pnl || 0), 0) / closedSignals.length : 0,
      bestTrade,
      worstTrade,
      profitFactor,
      totalProfit,
      totalLoss,
      avgWinSize: profitableSignals.length > 0 ? totalProfit / profitableSignals.length : 0,
      avgLossSize: losingSignals.length > 0 ? totalLoss / losingSignals.length : 0,
      consecutiveWins,
      consecutiveLosses,
      byAction: {
        buy: {
          count: buySignals.length,
          winRate: buySignals.length > 0 ? (buySignals.filter(s => (s.pnl || 0) > 0).length / buySignals.length) * 100 : 0,
          avgPnl: buySignals.length > 0 ? buySignals.reduce((sum, s) => sum + (s.pnl || 0), 0) / buySignals.length : 0,
        },
        sell: {
          count: sellSignals.length,
          winRate: sellSignals.length > 0 ? (sellSignals.filter(s => (s.pnl || 0) > 0).length / sellSignals.length) * 100 : 0,
          avgPnl: sellSignals.length > 0 ? sellSignals.reduce((sum, s) => sum + (s.pnl || 0), 0) / sellSignals.length : 0,
        },
      },
      monthlyStats,
    };
  }

  static exportToCSV(signals: Signal[]): string {
    const headers = ['Date', 'Symbol', 'Action', 'Entry From', 'Entry To', 'Stop Loss', 'TP1', 'TP2', 'TP3', 'Status', 'Current Price', 'PnL', 'PnL %', 'Notes'];
    const rows = signals.map(s => [
      new Date(s.created_at).toLocaleString(),
      s.symbol,
      s.action,
      s.entry_from || '',
      s.entry_to || '',
      s.stop_loss || '',
      s.take_profit_1 || '',
      s.take_profit_2 || '',
      s.take_profit_3 || '',
      s.status,
      s.current_price || '',
      s.pnl || 0,
      s.pnl_percentage || 0,
      s.notes || '',
    ]);

    return [headers, ...rows].map(row => row.join(',')).join('\n');
  }
}
