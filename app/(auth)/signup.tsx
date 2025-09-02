import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { supabase } from '../../utils/supabase';
import { Link } from 'expo-router';
import { AtSign, Lock, MailCheck } from 'lucide-react-native';

export default function SignUpScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  const handleSignUp = async () => {
    setLoading(true);
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      Alert.alert('Sign Up Failed', error.message);
    } else {
      // If sign up is successful but requires confirmation, show the success message.
      // If email confirmation is disabled, the onAuthStateChange listener will trigger a redirect.
      if (data.user && data.user.identities && data.user.identities.length === 0) {
        setShowSuccessMessage(true);
      }
    }
    setLoading(false);
  };

  if (showSuccessMessage) {
    return (
      <SafeAreaView style={styles.container}>
        <LinearGradient colors={['#1a1a2e', '#16213e', '#0f3460']} style={styles.gradient}>
          <View style={styles.content}>
            <View style={styles.successContainer}>
              <MailCheck size={64} color="#22c55e" />
              <Text style={styles.title}>Confirm Your Email</Text>
              <Text style={styles.subtitle}>
                We've sent a confirmation link to <Text style={{ color: '#22c55e', fontFamily: 'Inter_600SemiBold' }}>{email}</Text>. Please check your inbox to complete the registration.
              </Text>
              <Link href="/(auth)/login" asChild>
                <TouchableOpacity style={styles.button}>
                  <Text style={styles.buttonText}>Back to Sign In</Text>
                </TouchableOpacity>
              </Link>
            </View>
          </View>
        </LinearGradient>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={['#1a1a2e', '#16213e', '#0f3460']} style={styles.gradient}>
        <View style={styles.content}>
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>Start tracking your signals today</Text>

          <View style={styles.inputContainer}>
            <AtSign color="#94a3b8" size={20} style={styles.icon} />
            <TextInput
              style={styles.input}
              placeholder="Email"
              placeholderTextColor="#94a3b8"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
            />
          </View>

          <View style={styles.inputContainer}>
            <Lock color="#94a3b8" size={20} style={styles.icon} />
            <TextInput
              style={styles.input}
              placeholder="Password (min. 6 characters)"
              placeholderTextColor="#94a3b8"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
          </View>

          <TouchableOpacity style={styles.button} onPress={handleSignUp} disabled={loading}>
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text style={styles.buttonText}>Sign Up</Text>
            )}
          </TouchableOpacity>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Already have an account? </Text>
            <Link href="/(auth)/login" asChild>
              <TouchableOpacity>
                <Text style={styles.linkText}>Sign In</Text>
              </TouchableOpacity>
            </Link>
          </View>
        </View>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  gradient: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  content: { width: '85%', maxWidth: 400 },
  title: { fontSize: 32, fontFamily: 'Inter_700Bold', color: 'white', textAlign: 'center', marginBottom: 8 },
  subtitle: { fontSize: 16, fontFamily: 'Inter_400Regular', color: '#94a3b8', textAlign: 'center', marginBottom: 32, lineHeight: 24 },
  inputContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255, 255, 255, 0.05)', borderRadius: 12, marginBottom: 16, borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.1)' },
  icon: { marginHorizontal: 16 },
  input: { flex: 1, paddingVertical: 16, fontSize: 16, fontFamily: 'Inter_400Regular', color: 'white' },
  button: { backgroundColor: '#22c55e', padding: 18, borderRadius: 12, alignItems: 'center', marginTop: 16 },
  buttonText: { color: 'white', fontSize: 16, fontFamily: 'Inter_600SemiBold' },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 24 },
  footerText: { color: '#94a3b8', fontSize: 14 },
  linkText: { color: '#22c55e', fontSize: 14, fontFamily: 'Inter_600SemiBold' },
  successContainer: { alignItems: 'center', padding: 16 },
});
