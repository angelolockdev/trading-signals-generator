import { Link, Stack } from 'expo-router';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Home } from 'lucide-react-native';

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: 'Oops!', headerBackVisible: false }} />
      <SafeAreaView style={styles.container}>
        <LinearGradient
          colors={['#1a1a2e', '#16213e', '#0f3460']}
          style={styles.gradient}
        >
          <View style={styles.content}>
            <Text style={styles.title}>404</Text>
            <Text style={styles.subtitle}>Page Not Found</Text>
            <Text style={styles.description}>
              Sorry, the page you are looking for does not exist or has been moved.
            </Text>
            <Link href="/" asChild>
              <TouchableOpacity style={styles.link}>
                <Home size={18} color="white" />
                <Text style={styles.linkText}>Go to Home Screen</Text>
              </TouchableOpacity>
            </Link>
          </View>
        </LinearGradient>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
  },
  gradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  title: {
    fontSize: 80,
    fontFamily: 'Inter_700Bold',
    color: 'white',
    opacity: 0.3,
  },
  subtitle: {
    fontSize: 24,
    fontFamily: 'Inter_600SemiBold',
    color: 'white',
    marginTop: -10,
    marginBottom: 16,
  },
  description: {
    fontSize: 16,
    fontFamily: 'Inter_400Regular',
    color: '#94a3b8',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
  },
  link: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#22c55e',
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 100,
    gap: 8,
  },
  linkText: {
    fontSize: 16,
    fontFamily: 'Inter_600SemiBold',
    color: 'white',
  },
});
