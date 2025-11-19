import React, { useEffect } from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { ThemedText, ThemedView } from '@/src/components';
import { useTheme, useAuth } from '@/src/hooks';

export function SplashScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    const timer = setTimeout(() => {
      if (!isLoading) {
        if (isAuthenticated) {
          router.replace('/');
        } else {
          router.replace('/auth/login');
        }
      }
    }, 2000);

    return () => clearTimeout(timer);
  }, [isLoading, isAuthenticated]);

  return (
    <ThemedView style={[styles.container, { backgroundColor: colors.primary }]}>
      <View style={styles.content}>
        <View style={styles.logoContainer}>
          <View style={[styles.logoDot, { backgroundColor: colors.text.inverse }]} />
          <ThemedText 
            variant="h1" 
            style={[styles.logoText, { color: colors.text.inverse }]}
          >
            diary
          </ThemedText>
        </View>
        
        <ThemedText 
          style={[styles.subtitle, { color: colors.text.inverse }]}
        >
          Seu diário pessoal
        </ThemedText>
        
        <ActivityIndicator 
          size="large" 
          color={colors.text.inverse} 
          style={styles.loader}
        />
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  logoDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginRight: 12,
  },
  logoText: {
    fontSize: 36,
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 16,
    opacity: 0.8,
    marginBottom: 40,
  },
  loader: {
    marginTop: 20,
  },
});