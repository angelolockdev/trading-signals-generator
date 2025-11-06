import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { ArrowLeft, TrendingUp, TrendingDown, Award, Target, Activity, BarChart3, Calendar } from 'lucide-react-native';
import { useSignals } from '../../context/SignalContext';
import { AnalyticsService } from '../../utils/analytics';

const { width } = Dimensions.get('window');

export default function AnalyticsScreen() {
  const { signals } = useSignals();

  const analytics = useMemo(() => {
    return AnalyticsService.calculateAnalytics(signals);
  }, [signals]);

  const StatCard = ({ icon: Icon, label, value, color, subtitle }: any) => (
    <View style={styles.statCard}>
      <View style={[styles.statIcon, { backgroundColor: `${color}20` }]}>
        <Icon size={24} color={color} />
      </View>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
      {subtitle && <Text style={styles.statSubtitle}>{subtitle}</Text>}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={['#1a1a2e', '#16213e', '#0f3460']} style={styles.gradient}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => {
              if (router.canGoBack()) {
                router.back();
              } else {
                router.push('/');
              }
            }}
            style={styles.backButton}
          >
            <ArrowLeft size={24} color="white" />
          </TouchableOpacity>
          <Text style={styles.title}>Analytics</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Performance Overview</Text>
            <View style={styles.cardsRow}>
              <StatCard
                icon={Award}
                label="Win Rate"
                value={`${analytics.winRate.toFixed(1)}%`}
                color="#22c55e"
              />
              <StatCard
                icon={Target}
                label="Profit Factor"
                value={analytics.profitFactor === Infinity ? '∞' : analytics.profitFactor.toFixed(2)}
                color="#3b82f6"
              />
            </View>
            <View style={styles.cardsRow}>
              <StatCard
                icon={TrendingUp}
                label="Avg Win"
                value={`$${analytics.avgWinSize.toFixed(2)}`}
                color="#22c55e"
              />
              <StatCard
                icon={TrendingDown}
                label="Avg Loss"
                value={`$${analytics.avgLossSize.toFixed(2)}`}
                color="#ef4444"
              />
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Best & Worst Trades</Text>
            {analytics.bestTrade && (
              <View style={[styles.tradeCard, { borderColor: '#22c55e' }]}>
                <Text style={styles.tradeLabel}>Best Trade</Text>
                <View style={styles.tradeInfo}>
                  <Text style={styles.tradeSymbol}>{analytics.bestTrade.symbol} {analytics.bestTrade.action}</Text>
                  <Text style={[styles.tradePnl, { color: '#22c55e' }]}>+${(analytics.bestTrade.pnl || 0).toFixed(2)}</Text>
                </View>
                <Text style={styles.tradeDate}>
                  {new Date(analytics.bestTrade.created_at).toLocaleDateString()}
                </Text>
              </View>
            )}
            {analytics.worstTrade && (
              <View style={[styles.tradeCard, { borderColor: '#ef4444' }]}>
                <Text style={styles.tradeLabel}>Worst Trade</Text>
                <View style={styles.tradeInfo}>
                  <Text style={styles.tradeSymbol}>{analytics.worstTrade.symbol} {analytics.worstTrade.action}</Text>
                  <Text style={[styles.tradePnl, { color: '#ef4444' }]}>${(analytics.worstTrade.pnl || 0).toFixed(2)}</Text>
                </View>
                <Text style={styles.tradeDate}>
                  {new Date(analytics.worstTrade.created_at).toLocaleDateString()}
                </Text>
              </View>
            )}
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Streaks</Text>
            <View style={styles.cardsRow}>
              <StatCard
                icon={Activity}
                label="Best Streak"
                value={analytics.consecutiveWins}
                color="#22c55e"
                subtitle="consecutive wins"
              />
              <StatCard
                icon={Activity}
                label="Worst Streak"
                value={analytics.consecutiveLosses}
                color="#ef4444"
                subtitle="consecutive losses"
              />
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>By Action Type</Text>
            <View style={styles.actionCard}>
              <View style={styles.actionHeader}>
                <TrendingUp size={20} color="#22c55e" />
                <Text style={styles.actionTitle}>BUY Signals</Text>
              </View>
              <View style={styles.actionStats}>
                <View style={styles.actionStat}>
                  <Text style={styles.actionStatLabel}>Count</Text>
                  <Text style={styles.actionStatValue}>{analytics.byAction.buy.count}</Text>
                </View>
                <View style={styles.actionStat}>
                  <Text style={styles.actionStatLabel}>Win Rate</Text>
                  <Text style={styles.actionStatValue}>{analytics.byAction.buy.winRate.toFixed(1)}%</Text>
                </View>
                <View style={styles.actionStat}>
                  <Text style={styles.actionStatLabel}>Avg PnL</Text>
                  <Text style={[styles.actionStatValue, { color: analytics.byAction.buy.avgPnl >= 0 ? '#22c55e' : '#ef4444' }]}>
                    ${analytics.byAction.buy.avgPnl.toFixed(2)}
                  </Text>
                </View>
              </View>
            </View>

            <View style={styles.actionCard}>
              <View style={styles.actionHeader}>
                <TrendingDown size={20} color="#ef4444" />
                <Text style={styles.actionTitle}>SELL Signals</Text>
              </View>
              <View style={styles.actionStats}>
                <View style={styles.actionStat}>
                  <Text style={styles.actionStatLabel}>Count</Text>
                  <Text style={styles.actionStatValue}>{analytics.byAction.sell.count}</Text>
                </View>
                <View style={styles.actionStat}>
                  <Text style={styles.actionStatLabel}>Win Rate</Text>
                  <Text style={styles.actionStatValue}>{analytics.byAction.sell.winRate.toFixed(1)}%</Text>
                </View>
                <View style={styles.actionStat}>
                  <Text style={styles.actionStatLabel}>Avg PnL</Text>
                  <Text style={[styles.actionStatValue, { color: analytics.byAction.sell.avgPnl >= 0 ? '#22c55e' : '#ef4444' }]}>
                    ${analytics.byAction.sell.avgPnl.toFixed(2)}
                  </Text>
                </View>
              </View>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Monthly Performance</Text>
            {analytics.monthlyStats.map((month, index) => (
              <View key={index} style={styles.monthCard}>
                <View style={styles.monthHeader}>
                  <Calendar size={16} color="#94a3b8" />
                  <Text style={styles.monthTitle}>{month.month}</Text>
                </View>
                <View style={styles.monthStats}>
                  <View style={styles.monthStat}>
                    <Text style={styles.monthStatLabel}>Trades</Text>
                    <Text style={styles.monthStatValue}>{month.trades}</Text>
                  </View>
                  <View style={styles.monthStat}>
                    <Text style={styles.monthStatLabel}>Win Rate</Text>
                    <Text style={styles.monthStatValue}>{month.winRate.toFixed(1)}%</Text>
                  </View>
                  <View style={styles.monthStat}>
                    <Text style={styles.monthStatLabel}>PnL</Text>
                    <Text style={[styles.monthStatValue, { color: month.pnl >= 0 ? '#22c55e' : '#ef4444' }]}>
                      {month.pnl >= 0 ? '+' : ''}${month.pnl.toFixed(2)}
                    </Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
        </ScrollView>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  gradient: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 24, paddingTop: 16, paddingBottom: 24 },
  backButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255, 255, 255, 0.1)', alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 20, fontFamily: 'Inter_600SemiBold', color: 'white' },
  section: { paddingHorizontal: 24, marginBottom: 32 },
  sectionTitle: { fontSize: 18, fontFamily: 'Inter_600SemiBold', color: 'white', marginBottom: 16 },
  cardsRow: { flexDirection: 'row', gap: 12, marginBottom: 12 },
  statCard: { flex: 1, backgroundColor: 'rgba(255, 255, 255, 0.05)', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.1)', alignItems: 'center' },
  statIcon: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  statValue: { fontSize: 24, fontFamily: 'Inter_700Bold', color: 'white', marginBottom: 4 },
  statLabel: { fontSize: 12, fontFamily: 'Inter_400Regular', color: '#94a3b8', textAlign: 'center' },
  statSubtitle: { fontSize: 10, fontFamily: 'Inter_400Regular', color: '#64748b', marginTop: 2 },
  tradeCard: { backgroundColor: 'rgba(255, 255, 255, 0.05)', borderRadius: 12, padding: 16, borderWidth: 2, marginBottom: 12 },
  tradeLabel: { fontSize: 12, fontFamily: 'Inter_500Medium', color: '#94a3b8', marginBottom: 8 },
  tradeInfo: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  tradeSymbol: { fontSize: 16, fontFamily: 'Inter_600SemiBold', color: 'white' },
  tradePnl: { fontSize: 20, fontFamily: 'Inter_700Bold' },
  tradeDate: { fontSize: 12, fontFamily: 'Inter_400Regular', color: '#64748b' },
  actionCard: { backgroundColor: 'rgba(255, 255, 255, 0.05)', borderRadius: 12, padding: 16, borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.1)', marginBottom: 12 },
  actionHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  actionTitle: { fontSize: 16, fontFamily: 'Inter_600SemiBold', color: 'white' },
  actionStats: { flexDirection: 'row', justifyContent: 'space-around' },
  actionStat: { alignItems: 'center' },
  actionStatLabel: { fontSize: 12, fontFamily: 'Inter_400Regular', color: '#94a3b8', marginBottom: 4 },
  actionStatValue: { fontSize: 16, fontFamily: 'Inter_600SemiBold', color: 'white' },
  monthCard: { backgroundColor: 'rgba(255, 255, 255, 0.05)', borderRadius: 12, padding: 16, borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.1)', marginBottom: 12 },
  monthHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  monthTitle: { fontSize: 14, fontFamily: 'Inter_600SemiBold', color: 'white' },
  monthStats: { flexDirection: 'row', justifyContent: 'space-around' },
  monthStat: { alignItems: 'center' },
  monthStatLabel: { fontSize: 12, fontFamily: 'Inter_400Regular', color: '#94a3b8', marginBottom: 4 },
  monthStatValue: { fontSize: 14, fontFamily: 'Inter_600SemiBold', color: 'white' },
});
