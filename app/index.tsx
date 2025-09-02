import { Redirect } from 'expo-router';
import { useAuth } from '../context/AuthContext';
import { ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

export default function StartPage() {
  const { session, loading } = useAuth();

  if (loading) {
    return (
      <LinearGradient colors={['#1a1a2e', '#16213e', '#0f3460']} style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#FFD700" />
      </LinearGradient>
    );
  }

  if (session && session.user) {
    return <Redirect href="/(app)" />;
  }
  
  return <Redirect href="/(auth)/login" />;
}
