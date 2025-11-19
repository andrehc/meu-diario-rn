import React from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { 
  ThemedText, 
  ThemedView, 
  BottomNavigation, 
  StatusBarBackground 
} from '../src/components';
import { useTheme } from '../src/hooks';
import { useAuth, useLogout } from '../src/hooks';

export default function SettingsScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { handleLogout } = useLogout();
  const { colors } = useTheme();

  const settingsOptions = [
    {
      icon: 'person-outline',
      title: 'Perfil',
      subtitle: 'Gerenciar informações pessoais',
      onPress: () => {},
    },
    {
      icon: 'notifications-outline',
      title: 'Notificações',
      subtitle: 'Lembretes e alertas',
      onPress: () => {},
    },
    {
      icon: 'shield-outline',
      title: 'Privacidade',
      subtitle: 'PIN e configurações de segurança',
      onPress: () => {},
    },
    {
      icon: 'color-palette-outline',
      title: 'Tema',
      subtitle: 'Claro, escuro ou automático',
      onPress: () => {},
    },
    {
      icon: 'download-outline',
      title: 'Backup',
      subtitle: 'Fazer backup dos seus dados',
      onPress: () => {},
    },
    {
      icon: 'help-circle-outline',
      title: 'Ajuda',
      subtitle: 'FAQ e suporte',
      onPress: () => {},
    },
  ];

  return (
    <>
      <StatusBarBackground />
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={[styles.header, { backgroundColor: colors.surface }]}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
          </TouchableOpacity>
          <ThemedText variant="h2">Configurações</ThemedText>
          <View style={styles.placeholder} />
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* User Profile Section */}
          <ThemedView variant="card" style={styles.profileCard}>
            <View style={styles.profileHeader}>
              <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
                <ThemedText style={[styles.avatarText, { color: colors.text.inverse }]}>
                  {user?.name?.charAt(0).toUpperCase() || 'U'}
                </ThemedText>
              </View>
              <View style={styles.profileInfo}>
                <ThemedText variant="h3">{user?.name || 'Usuário'}</ThemedText>
                <ThemedText color="secondary">{user?.email || 'email@exemplo.com'}</ThemedText>
              </View>
            </View>
          </ThemedView>

          {/* Settings Options */}
          <ThemedView variant="card" style={styles.settingsCard}>
            {settingsOptions.map((option, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.settingItem,
                  index < settingsOptions.length - 1 && {
                    borderBottomWidth: 1,
                    borderBottomColor: colors.border,
                  },
                ]}
                onPress={option.onPress}
              >
                <Ionicons name={option.icon as any} size={24} color={colors.text.secondary} />
                <View style={styles.settingContent}>
                  <ThemedText variant="body">{option.title}</ThemedText>
                  <ThemedText color="tertiary" style={styles.settingSubtitle}>
                    {option.subtitle}
                  </ThemedText>
                </View>
                <Ionicons name="chevron-forward" size={20} color={colors.text.tertiary} />
              </TouchableOpacity>
            ))}
          </ThemedView>

          {/* Logout Button */}
          <TouchableOpacity
            style={[styles.logoutButton, { backgroundColor: colors.error }]}
            onPress={handleLogout}
          >
            <Ionicons name="log-out-outline" size={20} color="#fff" />
            <ThemedText style={styles.logoutText}>Sair da conta</ThemedText>
          </TouchableOpacity>
        </ScrollView>

        <BottomNavigation currentScreen="settings" />
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 40,
    paddingBottom: 16,
  },
  backButton: {
    padding: 8,
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  profileCard: {
    padding: 20,
    borderRadius: 12,
    marginBottom: 16,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  avatarText: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  profileInfo: {
    flex: 1,
  },
  settingsCard: {
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 20,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  settingContent: {
    flex: 1,
    marginLeft: 16,
  },
  settingSubtitle: {
    fontSize: 14,
    marginTop: 2,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
  },
  logoutText: {
    color: '#fff',
    fontWeight: '600',
    marginLeft: 8,
  },
});