import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  RecentEntryCard,
  StatusBarBackground,
  ThemedText,
  ThemedView
} from '../../src/components';
import { DiaryEventDebugger } from '../../src/components/debug/DiaryEventDebugger';
import { QuickEmotionModal } from '../../src/components/ui/QuickEmotionModal';
import { MOOD_OPTIONS } from '../../src/constants/moodOptions';
import { useAuth, useLogout, useTheme } from '../../src/hooks';

export default function HomeScreen() {
  const appName = require('../../app.json').expo.name;
  const { user } = useAuth();
  const { handleLogout } = useLogout();
  const { colors } = useTheme();
  const router = useRouter();

  const [selectedMoods, setSelectedMoods] = useState<string[]>([]);
  const [showModal, setShowModal] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Limpa o timer ao desmontar o componente
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  const handleMoodSelect = useCallback((moodId: string) => {
    setSelectedMoods(prev => {
      let newSelectedMoods: string[];
      
      if (prev.includes(moodId)) {
        // Remove se já estiver selecionado
        newSelectedMoods = prev.filter(id => id !== moodId);
      } else {
        // Adiciona se não estiver selecionado
        newSelectedMoods = [...prev, moodId];
      }

      // Limpa timer anterior
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }

      // Se há seleções, inicia novo timer
      if (newSelectedMoods.length > 0) {
        console.log('🕐 [HOME] Timer iniciado para', newSelectedMoods.length, 'emoções');
        timerRef.current = setTimeout(() => {
          console.log('⏰ [HOME] Timer disparado - mostrando modal');
          setShowModal(true);
        }, 5000);
      }

      return newSelectedMoods;
    });
  }, []);

  const handleModalConfirm = useCallback(() => {
    // Usa o estado atual de selectedMoods via função callback
    setSelectedMoods(currentMoods => {
      console.log('✅ [HOME] Confirmando criação de entrada com emoções:', currentMoods);
      
      // Prepara os parâmetros para a tela de add-entry
      const selectedMoodData = currentMoods.map(moodId => {
        const mood = MOOD_OPTIONS.find(m => m.id === moodId);
        return {
          id: moodId,
          label: mood?.label || moodId,
          emoji: mood?.emoji || '😐'
        };
      });

      // Navega para add-entry com os moods pré-selecionados
      const params = new URLSearchParams({
        preselectedMoods: JSON.stringify(selectedMoodData)
      });
      
      router.push(`/(tabs)/entries/add-entry?${params.toString()}` as any);
      
      // Retorna array vazio para limpar as seleções
      return [];
    });
    
    // Limpa o modal
    setShowModal(false);
  }, [router]);

  const handleModalCancel = useCallback(() => {
    console.log('❌ [HOME] Cancelando modal');
    setShowModal(false);
    setSelectedMoods([]);
    
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  // Dados para o modal - memoizados para evitar recriações desnecessárias
  const modalData = useMemo(() => {
    const selectedEmojis = selectedMoods.map(moodId => {
      const mood = MOOD_OPTIONS.find(m => m.id === moodId);
      return mood?.emoji || '😐';
    });
    
    const selectedMoodLabels = selectedMoods.map(moodId => {
      const mood = MOOD_OPTIONS.find(m => m.id === moodId);
      return mood?.label || moodId;
    });
    
    return { selectedEmojis, selectedMoodLabels };
  }, [selectedMoods]);

  return (
    <>
      <StatusBarBackground />
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <ScrollView 
          style={styles.content} 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Greeting Section */}
          <ThemedView variant="card" style={styles.greetingCard}>
            <ThemedText color="secondary" style={styles.greeting}>
              Olá, {user?.name || 'Usuário'}! 👋
            </ThemedText>
            <ThemedText variant="h2" style={styles.question}>
              Como você está se sentindo agora?
            </ThemedText>
            
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.moodSelector}
            >
              {MOOD_OPTIONS.map((mood) => {
                const isSelected = selectedMoods.includes(mood.id);
                return (
                  <TouchableOpacity
                    key={mood.id}
                    style={[
                      styles.moodButton, 
                      { backgroundColor: mood.color },
                      isSelected && styles.selectedMoodButton
                    ]}
                    onPress={() => handleMoodSelect(mood.id)}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.emoji}>{mood.emoji}</Text>
                    {isSelected && (
                      <View style={styles.selectedIndicator}>
                        <Ionicons name="checkmark" size={12} color="#fff" />
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </ThemedView>

          {/* Recently Added Section */}
          <RecentEntryCard />
        </ScrollView>
        
        {/* Quick Emotion Modal */}
        <QuickEmotionModal
          visible={showModal}
          selectedEmojis={modalData.selectedEmojis}
          selectedMoodLabels={modalData.selectedMoodLabels}
          onConfirm={handleModalConfirm}
          onCancel={handleModalCancel}
        />
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
  scrollContent: {
    paddingBottom: 160, // Espaço para o BottomNavigation + FAB
  },
  greetingCard: {
    padding: 20,
    borderRadius: 12,
    marginBottom: 16,
    marginTop: 16
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
    position: 'relative',
  },
  selectedMoodButton: {
    borderColor: '#fff',
    borderWidth: 3,
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 6,
    transform: [{ scale: 1.05 }],
  },
  emoji: {
    fontSize: 24,
  },
  selectedIndicator: {
    position: 'absolute',
    top: -3,
    right: -3,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
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
