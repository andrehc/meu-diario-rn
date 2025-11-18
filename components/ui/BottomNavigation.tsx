import React from 'react';
import { Alert, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import GlobalStyles, { CommonStyles } from '@/constants/theme';

interface BottomNavigationProps {
  currentScreen?: 'home' | 'stats' | 'calendar' | 'settings';
}
export default function BottomNavigation({ currentScreen = 'home' }: BottomNavigationProps) {
  const router = useRouter();

  const handleAddEntry = () => {
    // TODO: Navegar para tela de adicionar entrada
    Alert.alert('Adicionar Entrada', 'Funcionalidade em desenvolvimento');
  };

  const handleHomePress = () => {
    if (currentScreen !== 'home') {
      router.replace('/');
    }
  };

  const handleStatsPress = () => {
    // TODO: Navegar para estatísticas
    Alert.alert('Estatísticas', 'Funcionalidade em desenvolvimento');
  };

  const handleCalendarPress = () => {
    // TODO: Navegar para calendário
    Alert.alert('Registros de emoções', 'Funcionalidade em desenvolvimento');
  };

  const handleSettingsPress = () => {
    router.replace('/settings');
  };

  return (
    <>
      {/* Floating Action Button - Centered */}
      <TouchableOpacity style={styles.fab} onPress={handleAddEntry}>
        <Ionicons name="add" size={28} color="white" />
      </TouchableOpacity>

      {/* Bottom Navigation Bar */}
      <View style={styles.bottomNav}>
        {/* Left Side Items */}
        <View style={styles.navSide}>
          <TouchableOpacity style={styles.navItem} onPress={handleHomePress}>
            <Ionicons
              name="home"
              size={24}
              color={
                currentScreen === 'home'
                  ? GlobalStyles.colors.primary
                  : GlobalStyles.colors.textSecondary
              }
            />
          </TouchableOpacity>
          <TouchableOpacity style={styles.navItem} onPress={handleStatsPress}>
            <Ionicons
              name="stats-chart"
              size={24}
              color={
                currentScreen === 'stats'
                  ? GlobalStyles.colors.primary
                  : GlobalStyles.colors.textSecondary
              }
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
              color={
                currentScreen === 'calendar'
                  ? GlobalStyles.colors.primary
                  : GlobalStyles.colors.textSecondary
              }
            />
          </TouchableOpacity>
          <TouchableOpacity style={styles.navItem} onPress={handleSettingsPress}>
            <Ionicons
              name="settings"
              size={24}
              color={
                currentScreen === 'settings'
                  ? GlobalStyles.colors.primary
                  : GlobalStyles.colors.textSecondary
              }
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
    bottom: 45, // Positioned to overlap the nav bar
    left: '50%',
    marginLeft: -30, // Half of width to center
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: GlobalStyles.colors.secondary,
    justifyContent: 'center',
    alignItems: 'center',
    ...GlobalStyles.shadow,
    elevation: 8,
    zIndex: 10,
    borderWidth: 4,
    borderColor: GlobalStyles.colors.background,
  },
  bottomNav: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    backgroundColor: GlobalStyles.colors.baseColor,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
    paddingVertical: GlobalStyles.spacing.s,
    paddingBottom: 20,
    paddingHorizontal: GlobalStyles.spacing.l,
  },
  navSide: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  centerSpace: {
    width: 80, // Space for the FAB
  },
  navItem: {
    padding: GlobalStyles.spacing.s,
    alignItems: 'center',
    justifyContent: 'center',
  },
});