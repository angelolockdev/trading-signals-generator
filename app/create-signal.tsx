import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert, Clipboard } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { ArrowLeft, Copy, Send, TrendingUp, TrendingDown, Calculator, LocationEdit as Edit3 } from 'lucide-react-native';

interface SignalData {
  symbol: string;
  action: 'BUY' | 'SELL';
  entryFrom: string;
  entryTo: string;
  stopLoss: string;
  takeProfit1: string;
  takeProfit2: string;
  takeProfit3: string;
  notes: string;
}

interface AutoCalculation {
  slPercentage: string;
  tp1Pips: string;
  tp2Pips: string;
  tp3Pips: string;
}

export default function CreateSignalScreen() {
  const [signalData, setSignalData] = useState<SignalData>({
    symbol: 'XAUUSD',
    action: 'BUY',
    entryFrom: '',
    entryTo: '',
    stopLoss: '',
    takeProfit1: '',
    takeProfit2: '',
    takeProfit3: '',
    notes: ''
  });

  const [isAutoMode, setIsAutoMode] = useState(false);
  const [autoCalc, setAutoCalc] = useState<AutoCalculation>({
    slPercentage: '2',
    tp1Pips: '50',
    tp2Pips: '100',
    tp3Pips: '200'
  });

  // XAU/USD pip value (typically 0.01)
  const getPipValue = (): number => {
    return 0.01;
  };

  // Format number input to ensure proper decimal formatting
  const formatPrice = (value: string): string => {
    // Remove any non-numeric characters except decimal point
    const cleaned = value.replace(/[^0-9.]/g, '');
    
    // Split by decimal point
    const parts = cleaned.split('.');
    
    // If more than one decimal point, keep only the first one
    if (parts.length > 2) {
      return parts[0] + '.' + parts.slice(1).join('');
    }
    
    // Limit decimal places to 2 for XAU/USD
    if (parts.length === 2 && parts[1].length > 2) {
      return parts[0] + '.' + parts[1].substring(0, 2);
    }
    
    return cleaned;
  };

  // Get average price for calculations (middle of entry zone)
  const getAverageEntryPrice = (): number => {
    const fromPrice = parseFloat(signalData.entryFrom);
    const toPrice = parseFloat(signalData.entryTo);
    
    if (isNaN(fromPrice) || isNaN(toPrice)) return 0;
    
    return (fromPrice + toPrice) / 2;
  };

  // Calculate dynamic prices when auto mode is enabled
  useEffect(() => {
    if (isAutoMode && signalData.entryFrom && signalData.entryTo) {
      const averagePrice = getAverageEntryPrice();
      if (averagePrice === 0) return;

      const pipValue = getPipValue();
      const slPercent = parseFloat(autoCalc.slPercentage) / 100;
      
      // Calculate Stop Loss based on percentage
      let stopLoss: number;
      if (signalData.action === 'BUY') {
        stopLoss = averagePrice * (1 - slPercent);
      } else {
        stopLoss = averagePrice * (1 + slPercent);
      }

      // Calculate Take Profit levels based on pips
      let tp1: number, tp2: number, tp3: number;
      const tp1Pips = parseFloat(autoCalc.tp1Pips);
      const tp2Pips = parseFloat(autoCalc.tp2Pips);
      const tp3Pips = parseFloat(autoCalc.tp3Pips);

      if (signalData.action === 'BUY') {
        tp1 = averagePrice + (tp1Pips * pipValue);
        tp2 = averagePrice + (tp2Pips * pipValue);
        tp3 = averagePrice + (tp3Pips * pipValue);
      } else {
        tp1 = averagePrice - (tp1Pips * pipValue);
        tp2 = averagePrice - (tp2Pips * pipValue);
        tp3 = averagePrice - (tp3Pips * pipValue);
      }

      // Update signal data with calculated values
      setSignalData(prev => ({
        ...prev,
        stopLoss: stopLoss.toFixed(2),
        takeProfit1: tp1.toFixed(2),
        takeProfit2: tp2.toFixed(2),
        takeProfit3: tp3.toFixed(2)
      }));
    }
  }, [isAutoMode, signalData.entryFrom, signalData.entryTo, signalData.action, autoCalc]);

  const generateTelegramFormat = (): string => {
    const { symbol, action, entryFrom, entryTo, stopLoss, takeProfit1, takeProfit2, takeProfit3, notes } = signalData;
    
    const emoji = action === 'BUY' ? '🟢' : '🔴';
    const trend = action === 'BUY' ? '📈' : '📉';
    const entryLabel = action === 'BUY' ? 'Buy Entry Zone' : 'Sell Entry Zone';
    
    return `${emoji} ${action} SIGNAL ${trend}

📊 Pair: ${symbol}
💰 ${entryLabel}: $${entryFrom} - $${entryTo}
🛑 Stop Loss: $${stopLoss}

🎯 Take Profit Targets:
TP1: $${takeProfit1} ${isAutoMode ? `(${autoCalc.tp1Pips} pips)` : ''}
TP2: $${takeProfit2} ${isAutoMode ? `(${autoCalc.tp2Pips} pips)` : ''}
TP3: $${takeProfit3} ${isAutoMode ? `(${autoCalc.tp3Pips} pips)` : ''}

${isAutoMode ? `📐 SL: ${autoCalc.slPercentage}% | Risk Management\n` : ''}${notes ? `📝 Notes: ${notes}\n` : ''}
⚠️ Always use proper risk management
💡 Trade at your own risk

#XAUUSD #Gold #Trading #Signals`;
  };

  const handleCopyToClipboard = () => {
    const formattedSignal = generateTelegramFormat();
    Clipboard.setString(formattedSignal);
    Alert.alert('Success', 'Signal copied to clipboard!');
  };

  const handleSendSignal = () => {
    Alert.alert('Signal Created', 'Gold signal has been formatted and ready to share!');
  };

  const isFormValid = () => {
    return signalData.symbol && signalData.entryFrom && signalData.entryTo && signalData.stopLoss && signalData.takeProfit1;
  };

  const handlePriceInput = (field: keyof SignalData, value: string) => {
    const formattedValue = formatPrice(value);
    setSignalData({ ...signalData, [field]: formattedValue });
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
          <Text style={styles.title}>XAU/USD Signal</Text>
          <View style={styles.placeholder} />
        </View>

        <ScrollView showsVerticalScrollIndicator={false} style={styles.content}>
          {/* Action Toggle */}
          <View style={styles.section}>
            <Text style={styles.label}>Signal Type</Text>
            <View style={styles.actionToggle}>
              <TouchableOpacity
                style={[styles.actionButton, signalData.action === 'BUY' && styles.actionButtonActive]}
                onPress={() => setSignalData({ ...signalData, action: 'BUY' })}
              >
                <TrendingUp size={20} color={signalData.action === 'BUY' ? 'white' : '#94a3b8'} />
                <Text style={[styles.actionText, signalData.action === 'BUY' && styles.actionTextActive]}>
                  BUY
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionButton, signalData.action === 'SELL' && styles.actionButtonActive]}
                onPress={() => setSignalData({ ...signalData, action: 'SELL' })}
              >
                <TrendingDown size={20} color={signalData.action === 'SELL' ? 'white' : '#94a3b8'} />
                <Text style={[styles.actionText, signalData.action === 'SELL' && styles.actionTextActive]}>
                  SELL
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Symbol Display */}
          <View style={styles.section}>
            <Text style={styles.label}>Trading Pair</Text>
            <View style={styles.symbolDisplay}>
              <Text style={styles.symbolText}>XAU/USD (Gold)</Text>
              <View style={styles.goldBadge}>
                <Text style={styles.goldBadgeText}>🥇 GOLD</Text>
              </View>
            </View>
          </View>

          {/* Entry Zone */}
          <View style={styles.section}>
            <Text style={styles.label}>
              {signalData.action === 'BUY' ? 'Buy Entry Zone ($)' : 'Sell Entry Zone ($)'}
            </Text>
            <View style={styles.zoneContainer}>
              <View style={styles.zoneInput}>
                <Text style={styles.zoneLabel}>From</Text>
                <View style={styles.priceInputContainer}>
                  <Text style={styles.currencySymbol}>$</Text>
                  <TextInput
                    style={styles.priceInput}
                    placeholder="2045.00"
                    placeholderTextColor="#64748b"
                    value={signalData.entryFrom}
                    onChangeText={(text) => handlePriceInput('entryFrom', text)}
                    keyboardType="decimal-pad"
                    autoCorrect={false}
                    autoCapitalize="none"
                  />
                </View>
              </View>
              
              <View style={styles.zoneInput}>
                <Text style={styles.zoneLabel}>To</Text>
                <View style={styles.priceInputContainer}>
                  <Text style={styles.currencySymbol}>$</Text>
                  <TextInput
                    style={styles.priceInput}
                    placeholder="2055.00"
                    placeholderTextColor="#64748b"
                    value={signalData.entryTo}
                    onChangeText={(text) => handlePriceInput('entryTo', text)}
                    keyboardType="decimal-pad"
                    autoCorrect={false}
                    autoCapitalize="none"
                  />
                </View>
              </View>
            </View>
            {signalData.entryFrom && signalData.entryTo && (
              <Text style={styles.helperText}>
                Average Entry: ${getAverageEntryPrice().toFixed(2)}
              </Text>
            )}
          </View>

          {/* Calculation Mode Toggle */}
          <View style={styles.section}>
            <Text style={styles.label}>Calculation Mode</Text>
            <View style={styles.modeToggle}>
              <TouchableOpacity
                style={[styles.modeButton, !isAutoMode && styles.modeButtonActive]}
                onPress={() => setIsAutoMode(false)}
              >
                <Edit3 size={16} color={!isAutoMode ? 'white' : '#94a3b8'} />
                <Text style={[styles.modeText, !isAutoMode && styles.modeTextActive]}>Manual</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modeButton, isAutoMode && styles.modeButtonActive]}
                onPress={() => setIsAutoMode(true)}
              >
                <Calculator size={16} color={isAutoMode ? 'white' : '#94a3b8'} />
                <Text style={[styles.modeText, isAutoMode && styles.modeTextActive]}>Auto</Text>
              </TouchableOpacity>
            </View>
          </View>

          {isAutoMode ? (
            /* Auto Calculation Mode */
            <>
              {/* Stop Loss Percentage */}
              <View style={styles.section}>
                <Text style={styles.label}>Stop Loss (%)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="2.0"
                  placeholderTextColor="#64748b"
                  value={autoCalc.slPercentage}
                  onChangeText={(text) => setAutoCalc({ ...autoCalc, slPercentage: text })}
                  keyboardType="decimal-pad"
                  autoCorrect={false}
                />
                <Text style={styles.helperText}>
                  Calculated SL: ${signalData.stopLoss || 'Enter entry zone'}
                </Text>
              </View>

              {/* Take Profit Pips */}
              <View style={styles.section}>
                <Text style={styles.label}>Take Profit (Pips)</Text>
                <View style={styles.pipsContainer}>
                  <View style={styles.pipInput}>
                    <Text style={styles.pipLabel}>TP1</Text>
                    <TextInput
                      style={styles.pipInputField}
                      placeholder="50"
                      placeholderTextColor="#64748b"
                      value={autoCalc.tp1Pips}
                      onChangeText={(text) => setAutoCalc({ ...autoCalc, tp1Pips: text })}
                      keyboardType="number-pad"
                      autoCorrect={false}
                    />
                  </View>
                  <View style={styles.pipInput}>
                    <Text style={styles.pipLabel}>TP2</Text>
                    <TextInput
                      style={styles.pipInputField}
                      placeholder="100"
                      placeholderTextColor="#64748b"
                      value={autoCalc.tp2Pips}
                      onChangeText={(text) => setAutoCalc({ ...autoCalc, tp2Pips: text })}
                      keyboardType="number-pad"
                      autoCorrect={false}
                    />
                  </View>
                  <View style={styles.pipInput}>
                    <Text style={styles.pipLabel}>TP3</Text>
                    <TextInput
                      style={styles.pipInputField}
                      placeholder="200"
                      placeholderTextColor="#64748b"
                      value={autoCalc.tp3Pips}
                      onChangeText={(text) => setAutoCalc({ ...autoCalc, tp3Pips: text })}
                      keyboardType="number-pad"
                      autoCorrect={false}
                    />
                  </View>
                </View>
                <Text style={styles.helperText}>
                  Pip value: $0.01 | Calculated from average entry price
                </Text>
              </View>

              {/* Calculated Values Display */}
              <View style={styles.section}>
                <Text style={styles.label}>Calculated Levels</Text>
                <View style={styles.calculatedContainer}>
                  <View style={styles.calculatedRow}>
                    <Text style={styles.calculatedLabel}>Stop Loss:</Text>
                    <Text style={styles.calculatedValue}>${signalData.stopLoss || '-'}</Text>
                  </View>
                  <View style={styles.calculatedRow}>
                    <Text style={styles.calculatedLabel}>TP1:</Text>
                    <Text style={styles.calculatedValue}>${signalData.takeProfit1 || '-'}</Text>
                  </View>
                  <View style={styles.calculatedRow}>
                    <Text style={styles.calculatedLabel}>TP2:</Text>
                    <Text style={styles.calculatedValue}>${signalData.takeProfit2 || '-'}</Text>
                  </View>
                  <View style={styles.calculatedRow}>
                    <Text style={styles.calculatedLabel}>TP3:</Text>
                    <Text style={styles.calculatedValue}>${signalData.takeProfit3 || '-'}</Text>
                  </View>
                </View>
              </View>
            </>
          ) : (
            /* Manual Input Mode */
            <>
              {/* Stop Loss */}
              <View style={styles.section}>
                <Text style={styles.label}>Stop Loss ($)</Text>
                <View style={styles.priceInputContainer}>
                  <Text style={styles.currencySymbol}>$</Text>
                  <TextInput
                    style={styles.priceInput}
                    placeholder="2030.00"
                    placeholderTextColor="#64748b"
                    value={signalData.stopLoss}
                    onChangeText={(text) => handlePriceInput('stopLoss', text)}
                    keyboardType="decimal-pad"
                    autoCorrect={false}
                    autoCapitalize="none"
                  />
                </View>
              </View>

              {/* Take Profit Targets */}
              <View style={styles.section}>
                <Text style={styles.label}>Take Profit Targets ($)</Text>
                <View style={styles.tpManualContainer}>
                  <View style={styles.tpManualItem}>
                    <Text style={styles.tpLabel}>TP1</Text>
                    <View style={styles.priceInputContainer}>
                      <Text style={styles.currencySymbol}>$</Text>
                      <TextInput
                        style={styles.priceInput}
                        placeholder="2070.00"
                        placeholderTextColor="#64748b"
                        value={signalData.takeProfit1}
                        onChangeText={(text) => handlePriceInput('takeProfit1', text)}
                        keyboardType="decimal-pad"
                        autoCorrect={false}
                        autoCapitalize="none"
                      />
                    </View>
                  </View>
                  
                  <View style={styles.tpManualItem}>
                    <Text style={styles.tpLabel}>TP2</Text>
                    <View style={styles.priceInputContainer}>
                      <Text style={styles.currencySymbol}>$</Text>
                      <TextInput
                        style={styles.priceInput}
                        placeholder="2090.00"
                        placeholderTextColor="#64748b"
                        value={signalData.takeProfit2}
                        onChangeText={(text) => handlePriceInput('takeProfit2', text)}
                        keyboardType="decimal-pad"
                        autoCorrect={false}
                        autoCapitalize="none"
                      />
                    </View>
                  </View>
                  
                  <View style={styles.tpManualItem}>
                    <Text style={styles.tpLabel}>TP3</Text>
                    <View style={styles.priceInputContainer}>
                      <Text style={styles.currencySymbol}>$</Text>
                      <TextInput
                        style={styles.priceInput}
                        placeholder="2110.00"
                        placeholderTextColor="#64748b"
                        value={signalData.takeProfit3}
                        onChangeText={(text) => handlePriceInput('takeProfit3', text)}
                        keyboardType="decimal-pad"
                        autoCorrect={false}
                        autoCapitalize="none"
                      />
                    </View>
                  </View>
                </View>
              </View>
            </>
          )}

          {/* Notes */}
          <View style={styles.section}>
            <Text style={styles.label}>Notes (Optional)</Text>
            <TextInput
              style={[styles.input, styles.notesInput]}
              placeholder="Gold analysis, news impact, resistance levels..."
              placeholderTextColor="#64748b"
              value={signalData.notes}
              onChangeText={(text) => setSignalData({ ...signalData, notes: text })}
              multiline
              numberOfLines={3}
              autoCorrect={false}
              autoCapitalize="sentences"
            />
          </View>

          {/* Preview */}
          {isFormValid() && (
            <View style={styles.section}>
              <Text style={styles.label}>Telegram Preview</Text>
              <View style={styles.previewContainer}>
                <Text style={styles.previewText}>{generateTelegramFormat()}</Text>
              </View>
            </View>
          )}

          {/* Action Buttons */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.actionButtonLarge, !isFormValid() && styles.disabledButton]}
              onPress={handleCopyToClipboard}
              disabled={!isFormValid()}
            >
              <Copy size={20} color="white" />
              <Text style={styles.actionButtonText}>Copy to Clipboard</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.primaryButtonLarge, !isFormValid() && styles.disabledButton]}
              onPress={handleSendSignal}
              disabled={!isFormValid()}
            >
              <LinearGradient
                colors={isFormValid() ? ['#22c55e', '#16a34a'] : ['#374151', '#374151']}
                style={styles.buttonGradient}
              >
                <Send size={20} color="white" />
                <Text style={styles.primaryButtonText}>Create Signal</Text>
              </LinearGradient>
            </TouchableOpacity>
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
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  section: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontFamily: 'Inter_500Medium',
    color: 'white',
    marginBottom: 8,
  },
  input: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    fontFamily: 'Inter_400Regular',
    color: 'white',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  symbolDisplay: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  symbolText: {
    fontSize: 16,
    fontFamily: 'Inter_500Medium',
    color: 'white',
  },
  goldBadge: {
    backgroundColor: 'rgba(255, 215, 0, 0.2)',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  goldBadgeText: {
    fontSize: 12,
    fontFamily: 'Inter_500Medium',
    color: '#FFD700',
  },
  zoneContainer: {
    flexDirection: 'row',
  },
  zoneInput: {
    flex: 1,
    marginRight: 12,
  },
  zoneInputLast: {
    flex: 1,
  },
  zoneLabel: {
    fontSize: 14,
    fontFamily: 'Inter_500Medium',
    color: '#94a3b8',
    marginBottom: 8,
  },
  priceInputContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  currencySymbol: {
    fontSize: 16,
    fontFamily: 'Inter_500Medium',
    color: '#22c55e',
    marginRight: 8,
  },
  priceInput: {
    flex: 1,
    padding: 16,
    fontSize: 16,
    fontFamily: 'Inter_400Regular',
    color: 'white',
  },
  notesInput: {
    height: 80,
    textAlignVertical: 'top',
  },
  actionToggle: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 4,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  actionButtonActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  actionText: {
    fontSize: 16,
    fontFamily: 'Inter_500Medium',
    color: '#94a3b8',
  },
  actionTextActive: {
    color: 'white',
  },
  modeToggle: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 4,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  modeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 8,
    gap: 6,
  },
  modeButtonActive: {
    backgroundColor: 'rgba(59, 130, 246, 0.2)',
  },
  modeText: {
    fontSize: 14,
    fontFamily: 'Inter_500Medium',
    color: '#94a3b8',
  },
  modeTextActive: {
    color: 'white',
  },
  helperText: {
    fontSize: 12,
    fontFamily: 'Inter_400Regular',
    color: '#64748b',
    marginTop: 4,
  },
  pipsContainer: {
    flexDirection: 'row',
  },
  pipInput: {
    flex: 1,
    alignItems: 'center',
    marginRight: 12,
  },
  pipInputLast: {
    flex: 1,
    alignItems: 'center',
  },
  pipLabel: {
    fontSize: 12,
    fontFamily: 'Inter_500Medium',
    color: '#94a3b8',
    marginBottom: 4,
  },
  pipInputField: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    color: 'white',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    textAlign: 'center',
    width: '100%',
  },
  calculatedContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  calculatedRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  calculatedLabel: {
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    color: '#94a3b8',
  },
  calculatedValue: {
    fontSize: 14,
    fontFamily: 'Inter_500Medium',
    color: '#22c55e',
  },
  tpManualContainer: {
    gap: 16,
  },
  tpManualItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  tpLabel: {
    fontSize: 16,
    fontFamily: 'Inter_500Medium',
    color: '#94a3b8',
    width: 40,
  },
  previewContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  previewText: {
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    color: '#94a3b8',
    lineHeight: 20,
  },
  buttonContainer: {
    paddingBottom: 40,
  },
  actionButtonLarge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  primaryButtonLarge: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  buttonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 18,
  },
  actionButtonText: {
    fontSize: 16,
    fontFamily: 'Inter_500Medium',
    color: 'white',
    marginLeft: 12,
  },
  primaryButtonText: {
    fontSize: 16,
    fontFamily: 'Inter_600SemiBold',
    color: 'white',
    marginLeft: 12,
  },
  disabledButton: {
    opacity: 0.5,
  },
});
