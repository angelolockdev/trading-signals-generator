import React, { useState, useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { ArrowLeft, TrendingUp, TrendingDown, Clock, CheckCircle, XCircle, DollarSign, Trash2, Edit } from 'lucide-react-native';
import { signalService, Signal } from '../../services/signalService';
import { useSignals } from '../../context/SignalContext';

export default function SignalHistoryScreen() {
  const [filter, setFilter] = useState<'all' | 'active' | 'closed' | 'drafts'>('all');
  const { signals, stats, loading, currentGoldPrice } = useSignals();

  const handleDeleteSignal = (signalId: string) => {
    Alert.alert('Delete Signal', 'Are you sure you want to delete this signal?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await signalService.deleteSignal(signalId);
            // UI will update automatically via Supabase subscription
          } catch (error) {
            Alert.alert('Error', 'Failed to delete signal');
          }
        }
      }
    ]);
  };

  const filteredSignals = useMemo(() => {
    return signals.filter(signal => {
      if (filter === 'all') return !signal.is_draft;
      if (filter === 'active') return signal.status === 'active' && !signal.is_draft;
      if (filter === 'closed') return signal.status !== 'active' && signal.status !== 'draft';
      if (filter === 'drafts') return signal.is_draft;
      return true;
    });
  }, [signals, filter]);

  const getStatusColor = (status: string) => {
    if (status === 'draft') return '#64748b';
    switch (status) {
      case 'active': return '#22c55e';
      case 'tp1_hit': case 'tp2_hit': case 'tp3_hit': return '#3b82f6';
      case 'sl_hit': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const getStatusIcon = (status: string) => {
    if (status === 'draft') return Edit;
    switch (status) {
      case 'active': return Clock;
      case 'tp1_hit': case 'tp2_hit': case 'tp3_hit': return CheckCircle;
      case 'sl_hit': return XCircle;
      default: return Clock;
    }
  };

  const getStatusText = (status: string) => {
    if (status === 'draft') return 'DRAFT';
    return status.replace(/_/g, ' ').toUpperCase();
  };

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

  const renderSignalCard = ({ item }: { item: Signal }) => {
    const StatusIcon = getStatusIcon(item.status);
    const isProfit = (item.pnl || 0) > 0;
    
    return (
      <View style={styles.signalCard}>
        <View style={styles.signalHeader}>
          <View style={styles.signalInfo}>
            <View style={styles.symbolContainer}>
              {item.action === 'BUY' ? <TrendingUp size={16} color="#22c55e" /> : <TrendingDown size={16} color="#ef4444" />}
              <Text style={styles.symbol}>{item.symbol}</Text>
              <View style={[styles.actionBadge, { backgroundColor: item.action === 'BUY' ? '#22c55e20' : '#ef444420' }]}>
                <Text style={[styles.actionText, { color: item.action === 'BUY' ? '#22c55e' : '#ef4444' }]}>{item.action}</Text>
              </View>
            </View>
            <Text style={styles.timestamp}>{formatTimeAgo(item.created_at)}</Text>
          </View>
          <View style={[styles.statusContainer, { backgroundColor: `${getStatusColor(item.status)}20` }]}>
            <StatusIcon size={14} color={getStatusColor(item.status)} />
            <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>{getStatusText(item.status)}</Text>
          </View>
        </View>

        <View style={styles.priceContainer}>
          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>Entry Zone:</Text>
            <Text style={styles.priceValue}>{item.entry_from === item.entry_to ? `$${item.entry_from}` : `$${item.entry_from} - $${item.entry_to}`}</Text>
          </View>
          {!item.is_draft && (
            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>Current:</Text>
              <Text style={styles.priceValue}>${item.current_price?.toFixed(2) || '...'}</Text>
            </View>
          )}
          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>Stop Loss:</Text>
            <Text style={styles.priceValue}>${item.stop_loss}</Text>
          </View>
        </View>

        {!item.is_draft ? (
          <View style={styles.pnlContainer}>
            <View style={styles.pnlRow}>
              <DollarSign size={16} color={isProfit ? '#22c55e' : '#ef4444'} />
              <Text style={[styles.pnlValue, { color: isProfit ? '#22c55e' : '#ef4444' }]}>{isProfit ? '+' : ''}${(item.pnl || 0).toFixed(2)}</Text>
              <Text style={[styles.pnlPercentage, { color: isProfit ? '#22c55e' : '#ef4444' }]}>({isProfit ? '+' : ''}{(item.pnl_percentage || 0).toFixed(2)}%)</Text>
              <TouchableOpacity style={styles.deleteButton} onPress={() => handleDeleteSignal(item.id)}><Trash2 size={16} color="#ef4444" /></TouchableOpacity>
            </View>
            {item.notes && <Text style={styles.notesText}>📝 {item.notes}</Text>}
          </View>
        ) : (
          <View style={styles.draftActionsContainer}>
            <TouchableOpacity style={styles.deleteButton} onPress={() => handleDeleteSignal(item.id)}><Trash2 size={16} color="#ef4444" /></TouchableOpacity>
            <TouchableOpacity style={styles.editButton} onPress={() => router.push({ pathname: '/(app)/create-signal', params: { draftId: item.id } })}>
              <Edit size={16} color="white" />
              <Text style={styles.editButtonText}>Edit Draft</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={['#1a1a2e', '#16213e', '#0f3460']} style={styles.gradient}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}><ArrowLeft size={24} color="white" /></TouchableOpacity>
          <Text style={styles.title}>Signal History</Text>
          <View style={{ width: 40 }} />
        </View>

        {currentGoldPrice > 0 && (
          <View style={styles.priceHeader}>
            <Text style={styles.currentPriceLabel}>Current Gold Price</Text>
            <Text style={styles.currentPriceValue}>${currentGoldPrice.toFixed(2)}</Text>
          </View>
        )}

        <View style={styles.statsContainer}>
          <View style={styles.statCard}><Text style={styles.statValue}>{stats.total}</Text><Text style={styles.statLabel}>Total</Text></View>
          <View style={styles.statCard}><Text style={styles.statValue}>{stats.active}</Text><Text style={styles.statLabel}>Active</Text></View>
          <View style={styles.statCard}><Text style={[styles.statValue, { color: '#22c55e' }]}>{stats.winRate}%</Text><Text style={styles.statLabel}>Win Rate</Text></View>
          <View style={styles.statCard}><Text style={[styles.statValue, { color: stats.totalPnl >= 0 ? '#22c55e' : '#ef4444' }]}>${stats.totalPnl.toFixed(0)}</Text><Text style={styles.statLabel}>Total P&L</Text></View>
        </View>

        <View style={styles.filterContainer}>
          {['all', 'active', 'closed', 'drafts'].map((filterType) => (
            <TouchableOpacity key={filterType} style={[styles.filterButton, filter === filterType && styles.filterButtonActive]} onPress={() => setFilter(filterType as any)}>
              <Text style={[styles.filterText, filter === filterType && styles.filterTextActive]}>{filterType.charAt(0).toUpperCase() + filterType.slice(1)}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {loading ? (
          <ActivityIndicator color="#FFD700" style={{ flex: 1 }} />
        ) : filteredSignals.length > 0 ? (
          <FlatList
            data={filteredSignals}
            renderItem={renderSignalCard}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContainer}
            showsVerticalScrollIndicator={false}
          />
        ) : (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No signals found</Text>
            <Text style={styles.emptySubtext}>{filter === 'all' ? 'Create your first signal to start tracking' : `No ${filter} signals available`}</Text>
            <TouchableOpacity style={styles.createButton} onPress={() => router.push('/(app)/create-signal')}><Text style={styles.createButtonText}>Create Signal</Text></TouchableOpacity>
          </View>
        )}
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  gradient: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 24, paddingTop: 16, paddingBottom: 16 },
  backButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255, 255, 255, 0.1)', alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 20, fontFamily: 'Inter_600SemiBold', color: 'white' },
  priceHeader: { alignItems: 'center', paddingHorizontal: 24, paddingBottom: 16 },
  currentPriceLabel: { fontSize: 12, fontFamily: 'Inter_400Regular', color: '#94a3b8', marginBottom: 4 },
  currentPriceValue: { fontSize: 24, fontFamily: 'Inter_700Bold', color: '#FFD700' },
  statsContainer: { flexDirection: 'row', paddingHorizontal: 24, marginBottom: 24, gap: 12 },
  statCard: { flex: 1, backgroundColor: 'rgba(255, 255, 255, 0.05)', borderRadius: 12, padding: 12, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.1)' },
  statValue: { fontSize: 18, fontFamily: 'Inter_700Bold', color: 'white' },
  statLabel: { fontSize: 11, fontFamily: 'Inter_400Regular', color: '#94a3b8', marginTop: 2 },
  filterContainer: { flexDirection: 'row', paddingHorizontal: 24, marginBottom: 16, gap: 8 },
  filterButton: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: 'rgba(255, 255, 255, 0.05)', borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.1)' },
  filterButtonActive: { backgroundColor: 'rgba(34, 197, 94, 0.2)', borderColor: '#22c55e' },
  filterText: { fontSize: 14, fontFamily: 'Inter_500Medium', color: '#94a3b8' },
  filterTextActive: { color: '#22c55e' },
  listContainer: { paddingHorizontal: 24, paddingBottom: 40 },
  signalCard: { backgroundColor: 'rgba(255, 255, 255, 0.05)', borderRadius: 16, padding: 20, marginBottom: 16, borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.1)' },
  signalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 },
  signalInfo: { flex: 1 },
  symbolContainer: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 },
  symbol: { fontSize: 18, fontFamily: 'Inter_600SemiBold', color: 'white' },
  actionBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 },
  actionText: { fontSize: 12, fontFamily: 'Inter_500Medium' },
  timestamp: { fontSize: 12, fontFamily: 'Inter_400Regular', color: '#94a3b8' },
  statusContainer: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  statusText: { fontSize: 12, fontFamily: 'Inter_500Medium' },
  priceContainer: { marginBottom: 16 },
  priceRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  priceLabel: { fontSize: 14, fontFamily: 'Inter_400Regular', color: '#94a3b8' },
  priceValue: { fontSize: 14, fontFamily: 'Inter_500Medium', color: 'white', textAlign: 'right', flex: 1, marginLeft: 8 },
  pnlContainer: { borderTopWidth: 1, borderTopColor: 'rgba(255, 255, 255, 0.1)', paddingTop: 12 },
  pnlRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  pnlValue: { fontSize: 16, fontFamily: 'Inter_600SemiBold' },
  pnlPercentage: { fontSize: 14, fontFamily: 'Inter_500Medium' },
  deleteButton: { marginLeft: 'auto', padding: 4 },
  notesText: { fontSize: 12, fontFamily: 'Inter_400Regular', color: '#94a3b8', marginTop: 8, fontStyle: 'italic' },
  draftActionsContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', borderTopWidth: 1, borderTopColor: 'rgba(255, 255, 255, 0.1)', paddingTop: 12 },
  editButton: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#3b82f6', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8, marginLeft: 16 },
  editButtonText: { color: 'white', fontFamily: 'Inter_500Medium' },
  emptyContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24 },
  emptyText: { fontSize: 18, fontFamily: 'Inter_600SemiBold', color: 'white', marginBottom: 8 },
  emptySubtext: { fontSize: 14, fontFamily: 'Inter_400Regular', color: '#94a3b8', textAlign: 'center', marginBottom: 24 },
  createButton: { backgroundColor: '#22c55e', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12 },
  createButtonText: { fontSize: 16, fontFamily: 'Inter_600SemiBold', color: 'white' },
});
