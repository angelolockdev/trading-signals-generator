import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { ArrowLeft, TrendingUp, TrendingDown, Clock, CheckCircle, XCircle, DollarSign } from 'lucide-react-native';

interface Signal {
  id: string;
  symbol: string;
  action: 'BUY' | 'SELL';
  entryPrice: number;
  currentPrice: number;
  stopLoss: number;
  takeProfit: number;
  status: 'active' | 'closed' | 'stopped';
  pnl: number;
  pnlPercentage: number;
  createdAt: string;
  leverage: number;
}

export default function SignalHistoryScreen() {
  const [filter, setFilter] = useState<'all' | 'active' | 'closed'>('all');

  const mockSignals: Signal[] = [
    {
      id: '1',
      symbol: 'BTCUSDT',
      action: 'BUY',
      entryPrice: 43250,
      currentPrice: 44100,
      stopLoss: 42800,
      takeProfit: 44500,
      status: 'active',
      pnl: 850,
      pnlPercentage: 1.97,
      createdAt: '2 hours ago',
      leverage: 10
    },
    {
      id: '2',
      symbol: 'ETHUSDT',
      action: 'SELL',
      entryPrice: 2450,
      currentPrice: 2380,
      stopLoss: 2500,
      takeProfit: 2350,
      status: 'closed',
      pnl: 700,
      pnlPercentage: 2.86,
      createdAt: '1 day ago',
      leverage: 5
    },
    {
      id: '3',
      symbol: 'ADAUSDT',
      action: 'BUY',
      entryPrice: 0.485,
      currentPrice: 0.472,
      stopLoss: 0.465,
      takeProfit: 0.520,
      status: 'stopped',
      pnl: -130,
      pnlPercentage: -2.68,
      createdAt: '3 days ago',
      leverage: 10
    },
    {
      id: '4',
      symbol: 'SOLUSDT',
      action: 'BUY',
      entryPrice: 98.50,
      currentPrice: 102.30,
      stopLoss: 95.00,
      takeProfit: 105.00,
      status: 'active',
      pnl: 380,
      pnlPercentage: 3.86,
      createdAt: '5 hours ago',
      leverage: 5
    }
  ];

  const filteredSignals = mockSignals.filter(signal => {
    if (filter === 'all') return true;
    return signal.status === filter;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return '#22c55e';
      case 'closed': return '#3b82f6';
      case 'stopped': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return Clock;
      case 'closed': return CheckCircle;
      case 'stopped': return XCircle;
      default: return Clock;
    }
  };

  const renderSignalCard = ({ item }: { item: Signal }) => {
    const StatusIcon = getStatusIcon(item.status);
    const isProfit = item.pnl > 0;

    return (
      <View style={styles.signalCard}>
        <View style={styles.signalHeader}>
          <View style={styles.signalInfo}>
            <View style={styles.symbolContainer}>
              {item.action === 'BUY' ? (
                <TrendingUp size={16} color="#22c55e" />
              ) : (
                <TrendingDown size={16} color="#ef4444" />
              )}
              <Text style={styles.symbol}>{item.symbol}</Text>
              <View style={[styles.actionBadge, { backgroundColor: item.action === 'BUY' ? '#22c55e20' : '#ef444420' }]}>
                <Text style={[styles.actionText, { color: item.action === 'BUY' ? '#22c55e' : '#ef4444' }]}>
                  {item.action}
                </Text>
              </View>
            </View>
            <Text style={styles.timestamp}>{item.createdAt}</Text>
          </View>
          <View style={styles.statusContainer}>
            <StatusIcon size={16} color={getStatusColor(item.status)} />
            <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
              {item.status.toUpperCase()}
            </Text>
          </View>
        </View>

        <View style={styles.priceContainer}>
          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>Entry:</Text>
            <Text style={styles.priceValue}>${item.entryPrice.toFixed(2)}</Text>
          </View>
          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>Current:</Text>
            <Text style={styles.priceValue}>${item.currentPrice.toFixed(2)}</Text>
          </View>
          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>Leverage:</Text>
            <Text style={styles.priceValue}>{item.leverage}x</Text>
          </View>
        </View>

        <View style={styles.pnlContainer}>
          <View style={styles.pnlRow}>
            <DollarSign size={16} color={isProfit ? '#22c55e' : '#ef4444'} />
            <Text style={[styles.pnlValue, { color: isProfit ? '#22c55e' : '#ef4444' }]}>
              {isProfit ? '+' : ''}${item.pnl.toFixed(0)}
            </Text>
            <Text style={[styles.pnlPercentage, { color: isProfit ? '#22c55e' : '#ef4444' }]}>
              ({isProfit ? '+' : ''}{item.pnlPercentage.toFixed(2)}%)
            </Text>
          </View>
        </View>
      </View>
    );
  };

  const stats = {
    total: mockSignals.length,
    active: mockSignals.filter(s => s.status === 'active').length,
    winRate: ((mockSignals.filter(s => s.pnl > 0).length / mockSignals.length) * 100).toFixed(1),
    totalPnl: mockSignals.reduce((sum, signal) => sum + signal.pnl, 0)
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#1a1a2e', '#16213e', '#0f3460']}
        style={styles.gradient}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <ArrowLeft size={24} color="white" />
          </TouchableOpacity>
          <Text style={styles.title}>Signal History</Text>
          <View style={styles.placeholder} />
        </View>

        {/* Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{stats.total}</Text>
            <Text style={styles.statLabel}>Total</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{stats.active}</Text>
            <Text style={styles.statLabel}>Active</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={[styles.statValue, { color: '#22c55e' }]}>{stats.winRate}%</Text>
            <Text style={styles.statLabel}>Win Rate</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={[styles.statValue, { color: stats.totalPnl > 0 ? '#22c55e' : '#ef4444' }]}>
              ${stats.totalPnl.toFixed(0)}
            </Text>
            <Text style={styles.statLabel}>Total P&L</Text>
          </View>
        </View>

        {/* Filter */}
        <View style={styles.filterContainer}>
          {['all', 'active', 'closed'].map((filterType) => (
            <TouchableOpacity
              key={filterType}
              style={[styles.filterButton, filter === filterType && styles.filterButtonActive]}
              onPress={() => setFilter(filterType as any)}
            >
              <Text style={[styles.filterText, filter === filterType && styles.filterTextActive]}>
                {filterType.charAt(0).toUpperCase() + filterType.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Signals List */}
        <FlatList
          data={filteredSignals}
          renderItem={renderSignalCard}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
        />
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 24,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 20,
    fontFamily: 'Inter_600SemiBold',
    color: 'white',
  },
  placeholder: {
    width: 40,
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    marginBottom: 24,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  statValue: {
    fontSize: 18,
    fontFamily: 'Inter_700Bold',
    color: 'white',
  },
  statLabel: {
    fontSize: 11,
    fontFamily: 'Inter_400Regular',
    color: '#94a3b8',
    marginTop: 2,
  },
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    marginBottom: 16,
    gap: 8,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  filterButtonActive: {
    backgroundColor: 'rgba(34, 197, 94, 0.2)',
    borderColor: '#22c55e',
  },
  filterText: {
    fontSize: 14,
    fontFamily: 'Inter_500Medium',
    color: '#94a3b8',
  },
  filterTextActive: {
    color: '#22c55e',
  },
  listContainer: {
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  signalCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  signalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  signalInfo: {
    flex: 1,
  },
  symbolContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  symbol: {
    fontSize: 18,
    fontFamily: 'Inter_600SemiBold',
    color: 'white',
  },
  actionBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  actionText: {
    fontSize: 12,
    fontFamily: 'Inter_500Medium',
  },
  timestamp: {
    fontSize: 12,
    fontFamily: 'Inter_400Regular',
    color: '#94a3b8',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statusText: {
    fontSize: 12,
    fontFamily: 'Inter_500Medium',
  },
  priceContainer: {
    marginBottom: 16,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  priceLabel: {
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    color: '#94a3b8',
  },
  priceValue: {
    fontSize: 14,
    fontFamily: 'Inter_500Medium',
    color: 'white',
  },
  pnlContainer: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
    paddingTop: 12,
  },
  pnlRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  pnlValue: {
    fontSize: 16,
    fontFamily: 'Inter_600SemiBold',
  },
  pnlPercentage: {
    fontSize: 14,
    fontFamily: 'Inter_500Medium',
  },
});
