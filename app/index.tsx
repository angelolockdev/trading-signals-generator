import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { TrendingUp, MessageCircle, ChartBar as BarChart3, Plus, Clock, Star } from 'lucide-react-native';

const { width } = Dimensions.get('window');

export default function HomeScreen() {
  const features = [
    {
      icon: TrendingUp,
      title: 'Create Signals',
      description: 'Generate professional trading signals',
      route: '/create-signal',
      color: '#22c55e'
    },
    {
      icon: Clock,
      title: 'Signal History',
      description: 'View and manage past signals',
      route: '/signal-history',
      color: '#3b82f6'
    },
    {
      icon: MessageCircle,
      title: 'Telegram Format',
      description: 'Ready-to-share signal format',
      route: '/create-signal',
      color: '#8b5cf6'
    },
    {
      icon: BarChart3,
      title: 'Performance',
      description: 'Track signal accuracy',
      route: '/signal-history',
      color: '#f59e0b'
    }
  ];

  const stats = [
    { label: 'Total Signals', value: '24', icon: TrendingUp },
    { label: 'Win Rate', value: '73%', icon: Star },
    { label: 'Active', value: '5', icon: MessageCircle }
  ];

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#1a1a2e', '#16213e', '#0f3460']}
        style={styles.gradient}
      >
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Trading Signals</Text>
            <Text style={styles.subtitle}>Professional signal generator for Telegram</Text>
          </View>

          {/* Stats Cards */}
          <View style={styles.statsContainer}>
            {stats.map((stat, index) => (
              <View key={index} style={styles.statCard}>
                <stat.icon size={20} color="#22c55e" />
                <Text style={styles.statValue}>{stat.value}</Text>
                <Text style={styles.statLabel}>{stat.label}</Text>
              </View>
            ))}
          </View>

          {/* Quick Actions */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Quick Actions</Text>
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={() => router.push('/create-signal')}
            >
              <LinearGradient
                colors={['#22c55e', '#16a34a']}
                style={styles.buttonGradient}
              >
                <Plus size={24} color="white" />
                <Text style={styles.primaryButtonText}>Create New Signal</Text>
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
                  onPress={() => router.push(feature.route)}
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
            <Text style={styles.sectionTitle}>Recent Activity</Text>
            <View style={styles.activityCard}>
              <View style={styles.activityItem}>
                <View style={styles.activityDot} />
                <View style={styles.activityContent}>
                  <Text style={styles.activityTitle}>BTCUSDT Signal Created</Text>
                  <Text style={styles.activityTime}>2 hours ago</Text>
                </View>
                <View style={[styles.activityStatus, { backgroundColor: '#22c55e20' }]}>
                  <Text style={[styles.activityStatusText, { color: '#22c55e' }]}>Active</Text>
                </View>
              </View>
              
              <View style={styles.activityItem}>
                <View style={[styles.activityDot, { backgroundColor: '#f59e0b' }]} />
                <View style={styles.activityContent}>
                  <Text style={styles.activityTitle}>ETHUSDT Signal Closed</Text>
                  <Text style={styles.activityTime}>5 hours ago</Text>
                </View>
                <View style={[styles.activityStatus, { backgroundColor: '#22c55e20' }]}>
                  <Text style={[styles.activityStatusText, { color: '#22c55e' }]}>+12.5%</Text>
                </View>
              </View>
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
  header: {
    padding: 24,
    paddingTop: 40,
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontFamily: 'Inter_700Bold',
    color: 'white',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: 'Inter_400Regular',
    color: '#94a3b8',
    textAlign: 'center',
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    marginBottom: 32,
  },
  statCard: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    marginRight: 12,
  },
  statCardLast: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  statValue: {
    fontSize: 24,
    fontFamily: 'Inter_700Bold',
    color: 'white',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    fontFamily: 'Inter_400Regular',
    color: '#94a3b8',
    marginTop: 4,
  },
  section: {
    paddingHorizontal: 24,
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontFamily: 'Inter_600SemiBold',
    color: 'white',
    marginBottom: 16,
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
  },
  primaryButtonText: {
    fontSize: 18,
    fontFamily: 'Inter_600SemiBold',
    color: 'white',
    marginLeft: 12,
  },
  featuresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  featureCard: {
    width: (width - 64) / 2,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    marginRight: 16,
    marginBottom: 16,
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
    backgroundColor: '#3b82f6',
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
});
