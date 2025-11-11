import { useAuth } from '@/src/contexts/AuthContext';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useEffect } from 'react';
import {
    ActivityIndicator,
    Dimensions,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withDelay,
    withTiming
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width, height } = Dimensions.get('window');

export default function SplashScreen() {
  const router = useRouter();
  const { isLoading, isAuthenticated } = useAuth();
  
  // Animações
  const logoScale = useSharedValue(0);
  const logoOpacity = useSharedValue(0);
  const titleOpacity = useSharedValue(0);
  const titleTranslateY = useSharedValue(50);

  useEffect(() => {
    // Inicia as animações
    logoScale.value = withTiming(1, { duration: 800 });
    logoOpacity.value = withTiming(1, { duration: 800 });
    
    titleOpacity.value = withDelay(400, withTiming(1, { duration: 600 }));
    titleTranslateY.value = withDelay(400, withTiming(0, { duration: 600 }));
  }, []);

  useEffect(() => {
    // Navega após verificar autenticação
    if (!isLoading) {
      setTimeout(() => {
        if (isAuthenticated) {
          router.replace('/(tabs)');
        } else {
          router.replace('/auth/login');
        }
      }, 2000); // Aguarda 2 segundos para mostrar a splash
    }
  }, [isLoading, isAuthenticated, router]);

  const logoAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: logoScale.value }],
    opacity: logoOpacity.value,
  }));

  const titleAnimatedStyle = useAnimatedStyle(() => ({
    opacity: titleOpacity.value,
    transform: [{ translateY: titleTranslateY.value }],
  }));

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={styles.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.content}>
          {/* Logo */}
          <Animated.View style={[styles.logoContainer, logoAnimatedStyle]}>
            <View style={styles.logo}>
              <Text style={styles.logoEmoji}>📖</Text>
            </View>
          </Animated.View>

          {/* Título */}
          <Animated.View style={[styles.titleContainer, titleAnimatedStyle]}>
            <Text style={styles.title}>Meu Diário</Text>
            <Text style={styles.subtitle}>
              Seu espaço pessoal de reflexões
            </Text>
          </Animated.View>

          {/* Loading */}
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#ffffff" />
            <Text style={styles.loadingText}>Carregando...</Text>
          </View>
        </View>
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
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  logoContainer: {
    marginBottom: 40,
  },
  logo: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 15,
  },
  logoEmoji: {
    fontSize: 50,
  },
  titleContainer: {
    alignItems: 'center',
    marginBottom: 60,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 8,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    fontWeight: '300',
  },
  loadingContainer: {
    position: 'absolute',
    bottom: 100,
    alignItems: 'center',
  },
  loadingText: {
    color: '#ffffff',
    marginTop: 12,
    fontSize: 16,
    fontWeight: '300',
  },
});