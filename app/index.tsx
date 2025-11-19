import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AntDesign, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { 
  ThemedText, 
  ThemedView, 
  BottomNavigation, 
  StatusBarBackground 
} from '../src/components';
import { useTheme } from '../src/hooks';
import { useAuth, useLogout } from '../src/hooks';

export default function HomeScreen() {
  const { user } = useAuth();
  const { handleLogout } = useLogout();
  const { colors } = useTheme();

  return (
    <>
      <StatusBarBackground />
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={[styles.header, { backgroundColor: colors.surface }]}>
          <View style={styles.logoContainer}>
            <View style={[styles.logoDot, { backgroundColor: colors.primary }]} />
            <ThemedText variant="h2">diary</ThemedText>
          </View>
          <View style={styles.headerActions}>
            <TouchableOpacity style={styles.notificationButton}>
              <Ionicons name="notifications-outline" size={24} color={colors.text.primary} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
              <Ionicons name="log-out-outline" size={20} color={colors.error} />
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Greeting Section */}
          <ThemedView variant="card" style={styles.greetingCard}>
            <ThemedText color="secondary" style={styles.greeting}>
              Olá, {user?.name || 'Usuário'}! 👋
            </ThemedText>
            <ThemedText variant="h2" style={styles.question}>
              Como você está se sentindo hoje?
            </ThemedText>
            
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.moodSelector}
            >
              {[
                { emoji: '😔', color: '#FFB6B6', label: 'Triste' },
                { emoji: '😰', color: '#FF8A80', label: 'Medo' },
                { emoji: '😟', color: '#FFCC80', label: 'Ansioso' },
                { emoji: '😲', color: '#BA68C8', label: 'Animado' },
                { emoji: '😌', color: '#81C784', label: 'Relaxado' },
                { emoji: '😒', color: '#90A4AE', label: 'Entediado' },
                { emoji: '😠', color: '#FF5252', label: 'Bravo' },
                { emoji: '🤔', color: '#A1887F', label: 'Pensativo' },
                { emoji: '😐', color: '#FFEB3B', label: 'Neutro' },
                { emoji: '🙂', color: '#4DD0E1', label: 'Feliz' },
                { emoji: '😊', color: '#66BB6A', label: 'Muito Feliz' },
              ].map((mood, index) => (
                <TouchableOpacity
                  key={index}
                  style={[styles.moodButton, { backgroundColor: mood.color }]}
                >
                  <Text style={styles.emoji}>{mood.emoji}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </ThemedView>

          {/* Recently Added Section */}
          <View style={styles.sectionHeader}>
            <ThemedText variant="h3">Recém adicionado</ThemedText>
            <TouchableOpacity>
              <ThemedText color="secondary">Ver tudo</ThemedText>
            </TouchableOpacity>
          </View>

          {/* Entry Card */}
          <ThemedView variant="card" style={styles.entryCard}>
            <View style={styles.entryHeader}>
              <Text style={styles.smiley}>😊</Text>
              <TouchableOpacity style={styles.moreIcon}>
                <MaterialCommunityIcons 
                  name="dots-vertical" 
                  size={24} 
                  color={colors.text.secondary} 
                />
              </TouchableOpacity>
            </View>
            <View style={[styles.dateBadge, { backgroundColor: colors.primary }]}>
              <AntDesign name="calendar" size={14} color={colors.text.inverse} />
              <ThemedText 
                style={[styles.dateText, { color: colors.text.inverse }]}
              >
                28 May 21
              </ThemedText>
            </View>
            <ThemedText variant="h3" style={styles.entryTitle}>
              First day in work
            </ThemedText>
            <ThemedText color="tertiary" style={styles.entryContent}>
              TODO: buscar o ultimo registro do diario;
              titulo, data, humor e conteúdo
            </ThemedText>
          </ThemedView>
        </ScrollView>

        <BottomNavigation currentScreen="home" />
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
    paddingBottom: 8,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  notificationButton: {
    padding: 8,
  },
  logoutButton: {
    padding: 8,
    borderRadius: 4,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  greetingCard: {
    padding: 20,
    borderRadius: 12,
    marginBottom: 16,
  },
  greeting: {
    marginBottom: 4,
  },
  question: {
    textAlign: 'center',
    marginBottom: 16,
  },
  moodSelector: {
    flexDirection: 'row',
    paddingHorizontal: 4,
    gap: 8,
  },
  moodButton: {
    width: 60,
    height: 60,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  emoji: {
    fontSize: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 8,
  },
  entryCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  entryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  smiley: {
    fontSize: 28,
  },
  moreIcon: {
    padding: 4,
  },
  dateBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 15,
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  dateText: {
    fontSize: 12,
    marginLeft: 4,
  },
  entryTitle: {
    marginBottom: 4,
  },
  entryContent: {
    lineHeight: 20,
  },
});
