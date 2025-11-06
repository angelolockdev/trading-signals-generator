import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { ArrowLeft, Bell, Plus, Trash2 } from 'lucide-react-native';
import { NotificationService, PriceAlert } from '../../utils/notifications';
import { useAuth } from '../../context/AuthContext';
import { useSignals } from '../../context/SignalContext';

export default function AlertsScreen() {
  const { user } = useAuth();
  const { currentGoldPrice } = useSignals();
  const [alerts, setAlerts] = useState<PriceAlert[]>(
    user ? NotificationService.getAlerts(user.id) : []
  );
  const [newAlertPrice, setNewAlertPrice] = useState('');
  const [newAlertCondition, setNewAlertCondition] = useState<'above' | 'below'>('above');

  const handleAddAlert = () => {
    if (!user) return;

    const price = parseFloat(newAlertPrice);
    if (isNaN(price) || price <= 0) {
      Alert.alert('Invalid Price', 'Please enter a valid price');
      return;
    }

    const alert = NotificationService.addAlert({
      userId: user.id,
      targetPrice: price,
      condition: newAlertCondition,
      isActive: true,
    });

    setAlerts([...alerts, alert]);
    setNewAlertPrice('');
    Alert.alert('Alert Created', `You will be notified when gold price goes ${newAlertCondition} $${price.toFixed(2)}`);
  };

  const handleDeleteAlert = (alertId: string) => {
    Alert.alert('Delete Alert', 'Are you sure you want to delete this alert?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          NotificationService.removeAlert(alertId);
          setAlerts(alerts.filter(a => a.id !== alertId));
        },
      },
    ]);
  };

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
          <Text style={styles.title}>Price Alerts</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={styles.currentPriceCard}>
            <Bell size={24} color="#FFD700" />
            <View style={styles.currentPriceInfo}>
              <Text style={styles.currentPriceLabel}>Current Gold Price</Text>
              <Text style={styles.currentPriceValue}>${currentGoldPrice.toFixed(2)}</Text>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Create New Alert</Text>
            <View style={styles.createCard}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Target Price</Text>
                <View style={styles.priceInputContainer}>
                  <Text style={styles.currencySymbol}>$</Text>
                  <TextInput
                    style={styles.priceInput}
                    placeholder="2100.00"
                    placeholderTextColor="#64748b"
                    value={newAlertPrice}
                    onChangeText={setNewAlertPrice}
                    keyboardType="decimal-pad"
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Condition</Text>
                <View style={styles.conditionToggle}>
                  <TouchableOpacity
                    style={[styles.conditionButton, newAlertCondition === 'above' && styles.conditionButtonActive]}
                    onPress={() => setNewAlertCondition('above')}
                  >
                    <Text style={[styles.conditionText, newAlertCondition === 'above' && styles.conditionTextActive]}>
                      Above
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.conditionButton, newAlertCondition === 'below' && styles.conditionButtonActive]}
                    onPress={() => setNewAlertCondition('below')}
                  >
                    <Text style={[styles.conditionText, newAlertCondition === 'below' && styles.conditionTextActive]}>
                      Below
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              <TouchableOpacity style={styles.createButton} onPress={handleAddAlert}>
                <Plus size={20} color="white" />
                <Text style={styles.createButtonText}>Create Alert</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Active Alerts ({alerts.length})</Text>
            {alerts.length > 0 ? (
              alerts.map((alert) => (
                <View key={alert.id} style={styles.alertCard}>
                  <View style={styles.alertInfo}>
                    <View style={styles.alertHeader}>
                      <Bell size={20} color="#3b82f6" />
                      <Text style={styles.alertPrice}>${alert.targetPrice.toFixed(2)}</Text>
                    </View>
                    <Text style={styles.alertCondition}>
                      Notify when price goes {alert.condition} this value
                    </Text>
                    <Text style={styles.alertDate}>
                      Created: {new Date(alert.createdAt).toLocaleString()}
                    </Text>
                  </View>
                  <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={() => handleDeleteAlert(alert.id)}
                  >
                    <Trash2 size={20} color="#ef4444" />
                  </TouchableOpacity>
                </View>
              ))
            ) : (
              <View style={styles.emptyState}>
                <Bell size={48} color="#64748b" />
                <Text style={styles.emptyText}>No active alerts</Text>
                <Text style={styles.emptySubtext}>Create an alert to get notified when gold reaches your target price</Text>
              </View>
            )}
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
  currentPriceCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255, 215, 0, 0.1)', borderRadius: 16, padding: 20, marginHorizontal: 24, marginBottom: 24, borderWidth: 1, borderColor: 'rgba(255, 215, 0, 0.2)' },
  currentPriceInfo: { marginLeft: 16, flex: 1 },
  currentPriceLabel: { fontSize: 14, fontFamily: 'Inter_400Regular', color: '#94a3b8', marginBottom: 4 },
  currentPriceValue: { fontSize: 24, fontFamily: 'Inter_700Bold', color: '#FFD700' },
  section: { paddingHorizontal: 24, marginBottom: 32 },
  sectionTitle: { fontSize: 18, fontFamily: 'Inter_600SemiBold', color: 'white', marginBottom: 16 },
  createCard: { backgroundColor: 'rgba(255, 255, 255, 0.05)', borderRadius: 16, padding: 20, borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.1)' },
  inputGroup: { marginBottom: 20 },
  inputLabel: { fontSize: 14, fontFamily: 'Inter_500Medium', color: 'white', marginBottom: 8 },
  priceInputContainer: { backgroundColor: 'rgba(255, 255, 255, 0.05)', borderRadius: 12, borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.1)', flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16 },
  currencySymbol: { fontSize: 16, fontFamily: 'Inter_500Medium', color: '#22c55e', marginRight: 8 },
  priceInput: { flex: 1, paddingVertical: 16, fontSize: 16, fontFamily: 'Inter_400Regular', color: 'white' },
  conditionToggle: { flexDirection: 'row', backgroundColor: 'rgba(255, 255, 255, 0.05)', borderRadius: 12, padding: 4, borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.1)' },
  conditionButton: { flex: 1, paddingVertical: 12, alignItems: 'center', borderRadius: 8 },
  conditionButtonActive: { backgroundColor: 'rgba(59, 130, 246, 0.2)' },
  conditionText: { fontSize: 14, fontFamily: 'Inter_500Medium', color: '#94a3b8' },
  conditionTextActive: { color: 'white' },
  createButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#22c55e', borderRadius: 12, paddingVertical: 16, gap: 8 },
  createButtonText: { fontSize: 16, fontFamily: 'Inter_600SemiBold', color: 'white' },
  alertCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255, 255, 255, 0.05)', borderRadius: 12, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.1)' },
  alertInfo: { flex: 1 },
  alertHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  alertPrice: { fontSize: 18, fontFamily: 'Inter_600SemiBold', color: 'white' },
  alertCondition: { fontSize: 14, fontFamily: 'Inter_400Regular', color: '#94a3b8', marginBottom: 4 },
  alertDate: { fontSize: 12, fontFamily: 'Inter_400Regular', color: '#64748b' },
  deleteButton: { padding: 8 },
  emptyState: { alignItems: 'center', paddingVertical: 40 },
  emptyText: { fontSize: 16, fontFamily: 'Inter_600SemiBold', color: 'white', marginTop: 16, marginBottom: 8 },
  emptySubtext: { fontSize: 14, fontFamily: 'Inter_400Regular', color: '#94a3b8', textAlign: 'center', paddingHorizontal: 32 },
});
