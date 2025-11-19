import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import BottomNavigation from '@/components/ui/BottomNavigation';
import StatusBarBackground from '@/components/ui/StatusBarBackground';
import GlobalStyles, { CommonStyles } from '@/constants/theme';
import { useAuth } from '@/src/contexts/AuthContext';
import { useLogout } from '@/hooks/useLogout';
import { AntDesign, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

export default function HomeScreen() {
  const { user } = useAuth();
  const { handleLogout } = useLogout();

  console.log('🏠 [INDEX] Dados do usuário:', user);

  return (
    <>
      <StatusBarBackground />
      <SafeAreaView style={CommonStyles.container}>
        <View style={styles.header}>
        <View style={styles.logoContainer}>
          <View style={styles.logoDot} />
          <Text style={styles.logoText}>diary</Text>
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.notificationButton}>
            <Ionicons name="notifications-outline" size={24} color={GlobalStyles.colors.textPrimary} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Ionicons name="log-out-outline" size={20} color="#ff4757" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Main Content */}
      <ScrollView style={styles.content}>
        {/* Greeting Section */}
        <View style={[CommonStyles.card, styles.greetingCard]}>
          <Text style={styles.greeting}>
            Olá, {user?.name || 'Usuário'}! 👋
          </Text>
          <Text style={styles.question}>Como você está se sentindo hoje?</Text>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={CommonStyles.moodSelector}
          >
            {[
              { emoji: '😔', color: GlobalStyles.colors.moodColors.sad, label: 'Triste' },
              { emoji: '😰', color: GlobalStyles.colors.moodColors.fearful, label: 'Medo' },
              { emoji: '😟', color: GlobalStyles.colors.moodColors.ansious, label: 'Ansioso' },
              { emoji: '😲', color: GlobalStyles.colors.moodColors.excited, label: 'Animado' },
              { emoji: '😌', color: GlobalStyles.colors.moodColors.relaxed, label: 'Relaxado' },
              { emoji: '😒', color: GlobalStyles.colors.moodColors.bored, label: 'Entediado' },
              { emoji: '😠', color: GlobalStyles.colors.moodColors.angry, label: 'Bravo' },
              { emoji: '🤔', color: GlobalStyles.colors.moodColors.other, label: 'Pensativo' },
              { emoji: '😐', color: GlobalStyles.colors.moodColors.neutral, label: 'Neutro' },
              { emoji: '🙂', color: GlobalStyles.colors.moodColors.happy, label: 'Feliz' },
              { emoji: '😊', color: GlobalStyles.colors.moodColors.veryHappy, label: 'Muito Feliz' },
            ].map((mood, index) => (
              <TouchableOpacity
                key={index}
                style={[CommonStyles.moodButton, { backgroundColor: mood.color }]}
              >
                <Text style={CommonStyles.emoji}>{mood.emoji}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Recently Added Section */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recém adicionado</Text>
          <TouchableOpacity>
            <Text style={styles.viewAll}>Ver tudo</Text>
          </TouchableOpacity>
        </View>

        {/* Entry Card */}
        <View style={CommonStyles.card}>
          <View style={styles.entryHeader}>
            <Text style={styles.smiley}>😊</Text>
            <TouchableOpacity style={styles.moreIcon}>
              <MaterialCommunityIcons name="dots-vertical" size={24} color="#888" />
            </TouchableOpacity>
          </View>
          <View style={styles.dateBadge}>
            <AntDesign name="calendar" size={14} color="#fff" />
            <Text style={styles.dateText}>28 May 21</Text>
          </View>
          <Text style={styles.entryTitle}>First day in work</Text>
          <Text style={styles.entryContent}>
            TODO: buscar o ultimo registro do diario;
            titulo, data, humor e conteúdo

          </Text>
        </View>
      </ScrollView>

        {/* Bottom Navigation with Centered Add Button */}
        <BottomNavigation currentScreen="home" />
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: GlobalStyles.spacing.l,
    paddingTop: 40,
    paddingBottom: GlobalStyles.spacing.s,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: GlobalStyles.colors.primary,
    marginRight: GlobalStyles.spacing.s,
  },
  logoText: {
    fontSize: GlobalStyles.fonts.sizes.xl,
    fontWeight: 'bold',
    color: GlobalStyles.colors.textPrimary,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  notificationButton: {
    padding: 8,
  },
  content: {
    paddingHorizontal: GlobalStyles.spacing.l,
    paddingTop: GlobalStyles.spacing.l,
  },
  greetingCard: {
    alignItems: 'center',
  },
  greeting: {
    fontSize: GlobalStyles.fonts.sizes.small,
    color: GlobalStyles.colors.textSecondary,
    marginBottom: GlobalStyles.spacing.xs,
  },
  question: {
    fontSize: GlobalStyles.fonts.sizes.xxl,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: GlobalStyles.spacing.l,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: GlobalStyles.spacing.s,
  },
  sectionTitle: {
    fontSize: GlobalStyles.fonts.sizes.large,
    fontWeight: 'bold',
  },
  viewAll: {
    fontSize: GlobalStyles.fonts.sizes.small,
    color: GlobalStyles.colors.textSecondary,
  },
  entryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: GlobalStyles.spacing.s,
  },
  smiley: {
    fontSize: 28,
  },
  moreIcon: {
    padding: GlobalStyles.spacing.xs,
  },
  dateBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: GlobalStyles.colors.primary,
    paddingHorizontal: GlobalStyles.spacing.s,
    paddingVertical: GlobalStyles.spacing.xs,
    borderRadius: 15,
    alignSelf: 'flex-start',
    marginBottom: GlobalStyles.spacing.s,
  },
  dateText: {
    color: GlobalStyles.colors.cardBackground,
    fontSize: GlobalStyles.fonts.sizes.xs,
    marginLeft: GlobalStyles.spacing.xs,
  },
  entryTitle: {
    fontSize: GlobalStyles.fonts.sizes.large,
    fontWeight: 'bold',
    marginBottom: GlobalStyles.spacing.xs,
  },
  entryContent: {
    fontSize: GlobalStyles.fonts.sizes.small,
    color: GlobalStyles.colors.textTertiary,
    lineHeight: 20,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  stepContainer: {
    gap: 8,
    marginBottom: 8,
  },
  reactLogo: {
    height: 178,
    width: 290,
    bottom: 0,
    left: 0,
    position: 'absolute',
  },
  userInfo: {
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    padding: 16,
    borderRadius: 8,
    gap: 4,
  },
  logoutButton: {
    padding: 8,
    borderRadius: 6,
    backgroundColor: 'rgba(255, 71, 87, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 71, 87, 0.3)',
  },
});
