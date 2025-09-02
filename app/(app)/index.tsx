import React, { useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Dimensions, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { TrendingUp, MessageCircle, BarChart3, Plus, Clock, Star, DollarSign } from 'lucide-react-native';
import { useSignals } from '../../context/SignalContext';
import { Signal } from '../../services/signalService';

const { width } = Dimensions.get('window');

export default function HomeScreen() {
  const { signals, stats, loading, currentGoldPrice } = useSignals();

  const recentSignals = useMemo(() => {
    return signals
      .filter(s => !s.is_draft)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 2);
  }, [signals]);

  const features = [
    {
      icon: TrendingUp,
      title: 'Create Signals',
      description: 'Generate XAU/USD trading signals',
      route: '/(app)/create-signal',
      color: '#22c55e'
    },
    {
      icon: Clock,
      title: 'Signal History',
      description: 'View and track signal performance',
      route: '/(app)/signal-history',
      color: '#3b82f6'
    },
    {
      icon: MessageCircle,
      title: 'Telegram Format',
      description: 'Professional signal formatting',
      route: '/(app)/create-signal',
      color: '#8b5cf6'
    },
    {
      icon: BarChart3,
      title: 'Auto Tracking',
      description: 'Real-time gold price monitoring',
      route: '/(app)/signal-history',
      color: '#f59e0b'
    }
  ];

  const formatTimeAgo = (timestamp: string) => {
    const now = Date.now();
    const diff = now - new Date(timestamp).getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return 'Just now';
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return 'Active';
      case 'tp1_hit': return 'TP1 Hit';
      case 'tp2_hit': return 'TP2 Hit';
      case 'tp3_hit': return 'TP3 Hit';
      case 'sl_hit': return 'SL Hit';
      default: return 'Closed';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return '#22c55e';
      case 'tp1_hit':
      case 'tp2_hit':
      case 'tp3_hit': return '#3b82f6';
      case 'sl_hit': return '#ef4444';
      default: return '#6b7280';
    }
  };

  if (loading) {
    return (
      <LinearGradient colors={['#1a1a2e', '#16213e', '#0f3460']} style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FFD700" />
        <Text style={styles.loadingText}>Loading Dashboard...</Text>
      </LinearGradient>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#1a1a2e', '#16213e', '#0f3460']}
        style={styles.gradient}
      >
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Dashboard</Text>
          </View>
          
          {currentGoldPrice > 0 && (
            <View style={styles.goldPriceContainer}>
              <Text style={styles.goldPriceLabel}>Current Gold Price</Text>
              <Text style={styles.goldPriceValue}>${currentGoldPrice.toFixed(2)}</Text>
            </View>
          )}

          {/* Stats Cards */}
          <View style={styles.statsContainer}>
            <View style={styles.statCard}>
              <TrendingUp size={20} color="#22c55e" />
              <Text style={styles.statValue}>{stats.total}</Text>
              <Text style={styles.statLabel}>Total Signals</Text>
            </View>
            <View style={styles.statCard}>
              <Clock size={20} color="#3b82f6" />
              <Text style={styles.statValue}>{stats.active}</Text>
              <Text style={styles.statLabel}>Active</Text>
            </View>
            <View style={styles.statCard}>
              <Star size={20} color="#22c55e" />
              <Text style={[styles.statValue, { color: '#22c55e' }]}>{stats.winRate}%</Text>
              <Text style={styles.statLabel}>Win Rate</Text>
            </View>
            <View style={styles.statCard}>
              <DollarSign size={20} color={(stats.totalPnl || 0) >= 0 ? '#22c55e' : '#ef4444'} />
              <Text style={[styles.statValue, { color: (stats.totalPnl || 0) >= 0 ? '#22c55e' : '#ef4444' }]}>
                ${(stats.totalPnl || 0).toFixed(0)}
              </Text>
              <Text style={styles.statLabel}>Total P&L</Text>
            </View>
          </View>

          {/* Quick Actions */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Quick Actions</Text>
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={() => router.push('/(app)/create-signal')}
            >
              <LinearGradient
                colors={['#22c55e', '#16a34a']}
                style={styles.buttonGradient}
              >
                <Plus size={24} color="white" />
                <Text style={styles.primaryButtonText}>Create New Gold Signal</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>

          {/* Features Grid */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Features</Text>
            <View style={styles.featuresGrid}>
              {features.map((feature, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.featureCard}
                  onPress={() => router.push(feature.route as any)}
                >
                  <View style={[styles.featureIcon, { backgroundColor: `${feature.color}20` }]}>
                    <feature.icon size={24} color={feature.color} />
                  </View>
                  <Text style={styles.featureTitle}>{feature.title}</Text>
                  <Text style={styles.featureDescription}>{feature.description}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Recent Activity */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Recent Activity</Text>
              <TouchableOpacity onPress={() => router.push('/(app)/signal-history')}>
                <Text style={styles.viewAllText}>View All</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.activityCard}>
              {recentSignals.length > 0 ? (
                recentSignals.map((signal: Signal, index: number) => (
                  <View key={signal.id} style={[styles.activityItem, index === recentSignals.length - 1 && { marginBottom: 0 }]}>
                    <View style={[styles.activityDot, { backgroundColor: getStatusColor(signal.status) }]} />
                    <View style={styles.activityContent}>
                      <Text style={styles.activityTitle}>
                        XAUUSD {signal.action} Signal {getStatusText(signal.status)}
                      </Text>
                      <Text style={styles.activityTime}>{formatTimeAgo(signal.created_at)}</Text>
                    </View>
                    <View style={[styles.activityStatus, { 
                      backgroundColor: (signal.pnl || 0) > 0 ? '#22c55e20' : (signal.pnl || 0) < 0 ? '#ef444420' : '#64748b20' 
                    }]}>
                      <Text style={[styles.activityStatusText, { 
                        color: (signal.pnl || 0) > 0 ? '#22c55e' : (signal.pnl || 0) < 0 ? '#ef4444' : '#64748b' 
                      }]}>
                        {(signal.pnl || 0) > 0 ? '+' : ''}${(signal.pnl || 0).toFixed(0)}
                      </Text>
                    </View>
                  </View>
                ))
              ) : (
                <View style={styles.emptyActivity}>
                  <Text style={styles.emptyActivityText}>No signals created yet</Text>
                  <Text style={styles.emptyActivitySubtext}>Create your first signal to start tracking</Text>
                </View>
              )}
            </View>
          </View>
        </ScrollView>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: 'white',
    marginTop: 10,
    fontFamily: 'Inter_500Medium',
  },
  header: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 16,
  },
  title: {
    fontSize: 22,
    fontFamily: 'Inter_700Bold',
    color: 'white',
  },
  goldPriceContainer: {
    backgroundColor: 'rgba(255, 215, 0, 0.1)',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 215, 0, 0.2)',
    alignItems: 'center',
    marginHorizontal: 24,
    marginBottom: 24,
  },
  goldPriceLabel: {
    fontSize: 12,
    fontFamily: 'Inter_400Regular',
    color: '#94a3b8',
    marginBottom: 4,
  },
  goldPriceValue: {
    fontSize: 24,
    fontFamily: 'Inter_700Bold',
    color: '#FFD700',
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    marginBottom: 32,
    gap: 8,
  },
  statCard: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  statValue: {
    fontSize: 18,
    fontFamily: 'Inter_700Bold',
    color: 'white',
    marginTop: 6,
  },
  statLabel: {
    fontSize: 10,
    fontFamily: 'Inter_400Regular',
    color: '#94a3b8',
    marginTop: 2,
    textAlign: 'center',
  },
  section: {
    paddingHorizontal: 24,
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontFamily: 'Inter_600SemiBold',
    color: 'white',
    marginBottom: 8,
  },
  viewAllText: {
    fontSize: 14,
    fontFamily: 'Inter_500Medium',
    color: '#22c55e',
  },
  primaryButton: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  buttonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    gap: 12,
  },
  primaryButtonText: {
    fontSize: 18,
    fontFamily: 'Inter_600SemiBold',
    color: 'white',
  },
  featuresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  featureCard: {
    width: (width - 64) / 2,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  featureIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  featureTitle: {
    fontSize: 16,
    fontFamily: 'Inter_600SemiBold',
    color: 'white',
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    color: '#94a3b8',
    lineHeight: 20,
  },
  activityCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  activityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 12,
  },
  activityContent: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 14,
    fontFamily: 'Inter_500Medium',
    color: 'white',
    marginBottom: 2,
  },
  activityTime: {
    fontSize: 12,
    fontFamily: 'Inter_400Regular',
    color: '#94a3b8',
  },
  activityStatus: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  activityStatusText: {
    fontSize: 12,
    fontFamily: 'Inter_500Medium',
  },
  emptyActivity: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  emptyActivityText: {
    fontSize: 16,
    fontFamily: 'Inter_500Medium',
    color: 'white',
    marginBottom: 4,
  },
  emptyActivitySubtext: {
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    color: '#94a3b8',
    textAlign: 'center',
  },
});
