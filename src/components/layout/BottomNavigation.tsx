import React from 'react';
import { Alert, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useThemeColor } from '@/src/hooks';
import { spacing, shadows } from '@/src/theme';

interface BottomNavigationProps {
  currentScreen?: 'home' | 'stats' | 'calendar' | 'settings';
}

export function BottomNavigation({ currentScreen = 'home' }: BottomNavigationProps) {
  const router = useRouter();
  
  // Cores temáticas
  const backgroundColor = useThemeColor({}, 'baseColor');
  const primaryColor = useThemeColor({}, 'primary');
  const secondaryColor = useThemeColor({}, 'secondary');
  const inactiveColor = useThemeColor({}, 'textSecondary');
  const surfaceColor = useThemeColor({}, 'background');

  const handleAddEntry = () => {
    Alert.alert('Adicionar Entrada', 'Funcionalidade em desenvolvimento');
  };

  const handleHomePress = () => {
    if (currentScreen !== 'home') {
      router.replace('/');
    }
  };

  const handleStatsPress = () => {
    Alert.alert('Estatísticas', 'Funcionalidade em desenvolvimento');
  };

  const handleCalendarPress = () => {
    Alert.alert('Registros de emoções', 'Funcionalidade em desenvolvimento');
  };

  const handleSettingsPress = () => {
    router.replace('/settings');
  };

  return (
    <>
      {/* Floating Action Button */}
      <TouchableOpacity 
        style={[
          styles.fab, 
          { 
            backgroundColor: secondaryColor,
            borderColor: surfaceColor,
          }
        ]} 
        onPress={handleAddEntry}
      >
        <Ionicons name="add" size={28} color="#ffffff" />
      </TouchableOpacity>

      {/* Bottom Navigation Bar */}
      <View style={[styles.bottomNav, { backgroundColor }]}>
        {/* Left Side Items */}
        <View style={styles.navSide}>
          <TouchableOpacity style={styles.navItem} onPress={handleHomePress}>
            <Ionicons
              name="home"
              size={24}
              color={currentScreen === 'home' ? primaryColor : inactiveColor}
            />
          </TouchableOpacity>
          <TouchableOpacity style={styles.navItem} onPress={handleStatsPress}>
            <Ionicons
              name="stats-chart"
              size={24}
              color={currentScreen === 'stats' ? primaryColor : inactiveColor}
            />
          </TouchableOpacity>
        </View>

        {/* Center Space for FAB */}
        <View style={styles.centerSpace} />

        {/* Right Side Items */}
        <View style={styles.navSide}>
          <TouchableOpacity style={styles.navItem} onPress={handleCalendarPress}>
            <Ionicons
              name="calendar"
              size={24}
              color={currentScreen === 'calendar' ? primaryColor : inactiveColor}
            />
          </TouchableOpacity>
          <TouchableOpacity style={styles.navItem} onPress={handleSettingsPress}>
            <Ionicons
              name="settings"
              size={24}
              color={currentScreen === 'settings' ? primaryColor : inactiveColor}
            />
          </TouchableOpacity>
        </View>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    bottom: 45,
    left: '50%',
    marginLeft: -30,
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.lg,
    elevation: 8,
    zIndex: 10,
    borderWidth: 4,
  },
  bottomNav: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
    paddingVertical: spacing.s,
    paddingBottom: 20,
    paddingHorizontal: spacing.l,
  },
  navSide: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  centerSpace: {
    width: 80,
  },
  navItem: {
    padding: spacing.s,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default BottomNavigation;