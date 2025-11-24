import { useAuth, useTheme } from '@/src/hooks';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { Image, Platform, StatusBar, StyleSheet, TouchableOpacity, View } from 'react-native';

export function AppHeader() {
  const { colors, isDark } = useTheme();
  const { logout } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.replace('/auth/login');
  };

  return (
    <>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={colors.background}
      />
      <View style={[styles.container, { 
        backgroundColor: colors.background,
        borderBottomColor: colors.border 
      }]}>
        <Image
          source={
            isDark 
              ? require('@/src/public/assets/images/cover-transparent-text.png')
              : require('@/src/public/assets/images/cover-transparent-tint.png')
          }
          style={styles.logo}
          resizeMode="contain"
        />
        <TouchableOpacity
          onPress={handleLogout}
          style={styles.logoutButton}
        >
          <Ionicons name="log-out-outline" size={24} color={colors.text.primary} />
        </TouchableOpacity>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 50 : 10,
    paddingBottom: 10,
    borderBottomWidth: 1,
    overflow: 'hidden',
  },
  logo: {
    height: 40,
    width: 200,
    transform: [{ scale: 4 }],
  },
  logoutButton: {
    padding: 8,
  },
});
