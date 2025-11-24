import { useAuth, useTheme } from '@/src/hooks';
import { useRouter } from 'expo-router';
import React, { useEffect } from 'react';
import { ActivityIndicator, ImageBackground, StyleSheet, View } from 'react-native';

export function SplashScreen() {
  const router = useRouter();
  const  { colors }= useTheme();
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
    }, 3000);

    return () => clearTimeout(timer);
  }, [isLoading, isAuthenticated]);

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      width: '100%',
      height: '100%',
      backgroundColor: colors.cover,
      justifyContent: 'center',
      alignItems: 'center',
    },
    imageBackground: {
      flex: 1,
      width: '100%',
      height: '100%',
    },
    loaderContainer: {
      position: 'absolute',
      bottom: 60,
      left: 0,
      right: 0,
      alignItems: 'center',
    },
  });

  return (
    <View style={styles.container}>
      <ImageBackground
        source={require('@/src/public/assets/images/cover-transparent.png')}
        style={styles.imageBackground}
        resizeMode="contain"
      >
        <View style={styles.loaderContainer}>
          <ActivityIndicator
            size="large"
            color="#000000"
          />
        </View>
      </ImageBackground>
    </View>
  );
}

