import { Ionicons } from '@expo/vector-icons';
import Slider from '@react-native-community/slider';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { ScrollView, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBarBackground, ThemedText, Toast } from '../../../src/components';
import { MOOD_OPTIONS } from '../../../src/constants/moodOptions';
import { useAuth, useTheme, useToast } from '../../../src/hooks';
import { DiaryService } from '../../../src/services/diaryService';

interface PreselectedMood {
  id: string;
  label: string;
  emoji: string;
}

export default function AddEntryScreen() {
  const { colors , styles: themeStyles } = useTheme();
  const { user } = useAuth();
  const router = useRouter();
  const toast = useToast();
  const { preselectedMoods } = useLocalSearchParams<{ preselectedMoods?: string }>();
  
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [title, setTitle] = useState('');
  const [event, setEvent] = useState(''); // O que aconteceu hoje
  const [thoughts, setThoughts] = useState(''); // Pensamentos principais
  const [reactions, setReactions] = useState(''); // Como você reagiu
  const [alternative, setAlternative] = useState(''); // O que poderia fazer diferente
  const [selectedMoods, setSelectedMoods] = useState<string[]>([]);
  const [intensity, setIntensity] = useState<number>(5); // Intensidade da emoção (1-10)
  const [isLoading, setIsLoading] = useState(false);
  const hasProcessedPreselected = useRef(false);

  // Processa emoções pré-selecionadas quando o componente monta
  useEffect(() => {
    if (preselectedMoods && !hasProcessedPreselected.current) {
      try {
        const moods: PreselectedMood[] = JSON.parse(decodeURIComponent(preselectedMoods));
        const moodIds = moods.map(mood => mood.id);
        console.log('🎯 [ADD_ENTRY] Emoções pré-selecionadas:', moods);
        
        setSelectedMoods(moodIds);
        hasProcessedPreselected.current = true;
        
        // Mostra toast informativo após um delay para garantir que o componente está totalmente montado
        const timeoutId = setTimeout(() => {
          const moodLabels = moods.map(m => m.label).join(', ');
          toast.showInfo(
            'Emoções pré-selecionadas', 
            `${moods.length === 1 ? 'Emoção' : 'Emoções'} selecionadas: ${moodLabels}`
          );
        }, 500);
        
        // Cleanup do timeout se o componente for desmontado
        return () => clearTimeout(timeoutId);
      } catch (error) {
        console.error('❌ [ADD_ENTRY] Erro ao processar emoções pré-selecionadas:', error);
      }
    }
  }, [preselectedMoods, toast.showInfo]); // Usando apenas showInfo para evitar recriação desnecessária

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('pt-BR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const toggleMood = (moodId: string) => {
    setSelectedMoods(prev => {
      if (prev.includes(moodId)) {
        // Remove se já estiver selecionado
        return prev.filter(id => id !== moodId);
      } else {
        // Adiciona se não estiver selecionado
        return [...prev, moodId];
      }
    });
  };

  const handleSave = async () => {
    if (!user?.id) {
      toast.showError('Erro', 'Usuário não encontrado. Faça login novamente.');
      return;
    }

    if (!title.trim()) {
      toast.showWarning('Título obrigatório', 'Por favor, adicione um título para sua memória.');
      return;
    }
    
    if (!thoughts.trim()) {
      toast.showWarning('Pensamentos obrigatórios', 'Por favor, escreva seus pensamentos sobre hoje.');
      return;
    }
    
    if (selectedMoods.length === 0) {
      toast.showWarning('Emoção obrigatória', 'Por favor, selecione pelo menos uma emoção.');
      return;
    }

    setIsLoading(true);
    
    try {
      // Pega os labels dos moods selecionados
      const selectedMoodLabels = selectedMoods.map(moodId => {
        const moodData = MOOD_OPTIONS.find(mood => mood.id === moodId);
        return moodData?.label || moodId;
      });
      
      const diaryEntryData = {
        profile_id: user.id,
        title: title.trim(),
        event: event.trim() || undefined,
        feelings: selectedMoodLabels, // Array de sentimentos selecionados
        intensity: intensity,
        thoughts: thoughts.trim(),
        reactions: reactions.trim() || undefined,
        alternative: alternative.trim() || undefined,
        current_mood: selectedMoodLabels[0], // Primeiro mood como principal
      } as any; // Temporário até ajustar os tipos

      
      const entryId = await DiaryService.createDiaryEntry(diaryEntryData);
      
      console.log('✅ [ADD_ENTRY] Entrada salva com ID:', entryId);
      
      // WebSocket automaticamente notificará todos os componentes sobre a nova entrada
      toast.showSuccess('Memória salva!', 'Sua memória foi salva com sucesso.');
      
      // Aguarda um pouco para mostrar o toast antes de voltar
      setTimeout(() => {
        router.back();
      }, 1500);
    } catch (error) {
      console.error('❌ [ADD_ENTRY] Erro ao salvar:', error);
      toast.showError('Erro ao salvar', 'Não foi possível salvar sua memória. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const goToPreviousDay = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() - 1);
    setSelectedDate(newDate);
  };

  const goToNextDay = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + 1);
    setSelectedDate(newDate);
  };

  return (
    <>
      <StatusBarBackground />
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        {/* Header */}
        <View style={[themeStyles.header, { backgroundColor: colors.surface }]}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
          </TouchableOpacity>
          <ThemedText variant="h2">Registro de Emoção</ThemedText>
          <View style={styles.headerActions}>
            {/* <TouchableOpacity>
              <Ionicons name="share-outline" size={24} color={colors.text.primary} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.favoriteButton}>
              <Ionicons name="star-outline" size={24} color={colors.text.primary} />
            </TouchableOpacity> */}
          </View>
        </View>

        <ScrollView 
          style={styles.content}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Date Selector */}
          <View style={[styles.dateSelector, { backgroundColor: colors.surface }]}>
            <TouchableOpacity onPress={goToPreviousDay}>
              <Ionicons name="chevron-back" size={20} color={colors.text.secondary} />
            </TouchableOpacity>
            <View style={styles.dateContent}>
              <Ionicons name="calendar" size={16} color={colors.text.secondary} />
              <ThemedText variant="body" style={styles.dateText}>
                {formatDate(selectedDate)}
              </ThemedText>
            </View>
            <TouchableOpacity onPress={goToNextDay}>
              <Ionicons name="chevron-forward" size={20} color={colors.text.secondary} />
            </TouchableOpacity>
          </View>

          {/* Title Input */}
          <View style={[styles.inputContainer, { backgroundColor: colors.surface }]}>
            <TextInput
              style={[styles.titleInput, { color: colors.text.primary }]}
              placeholder="Título"
              placeholderTextColor={colors.text.tertiary}
              value={title}
              onChangeText={setTitle}
              maxLength={100}
            />
          </View>

          {/* Event Input (optional) */}
          <View style={[styles.inputContainer, { backgroundColor: colors.surface }]}>
            <TextInput
              style={[styles.contentInput, { color: colors.text.primary }]}
              placeholder="O que aconteceu? (opcional)"
              placeholderTextColor={colors.text.tertiary}
              value={event}
              onChangeText={setEvent}
              multiline
              textAlignVertical="top"
              maxLength={500}
            />
          </View>

          {/* Thoughts Input */}
          <View style={[styles.inputContainer, styles.contentContainer, { backgroundColor: colors.surface }]}>
            <TextInput
              style={[styles.contentInput, { color: colors.text.primary }]}
              placeholder="Quais foram seus pensamentos?"
              placeholderTextColor={colors.text.tertiary}
              value={thoughts}
              onChangeText={setThoughts}
              multiline
              textAlignVertical="top"
              maxLength={1000}
            />
          </View>

          {/* Reactions Input (optional) */}
          <View style={[styles.inputContainer, { backgroundColor: colors.surface }]}>
            <TextInput
              style={[styles.contentInput, { color: colors.text.primary }]}
              placeholder="Como você reagiu? (opcional)"
              placeholderTextColor={colors.text.tertiary}
              value={reactions}
              onChangeText={setReactions}
              multiline
              textAlignVertical="top"
              maxLength={500}
            />
          </View>

          {/* Alternative Input (optional) */}
          <View style={[styles.inputContainer, { backgroundColor: colors.surface }]}>
            <TextInput
              style={[styles.contentInput, { color: colors.text.primary }]}
              placeholder="O que você poderia fazer diferente? (opcional)"
              placeholderTextColor={colors.text.tertiary}
              value={alternative}
              onChangeText={setAlternative}
              multiline
              textAlignVertical="top"
              maxLength={500}
            />
          </View>

          {/* Intensity Slider */}
          <View style={[styles.inputContainer, { backgroundColor: colors.surface }]}>
            <ThemedText variant="body" style={[styles.intensityLabel, { color: colors.text.secondary }]}>
              Intensidade da emoção: {intensity}/10
            </ThemedText>
            <View style={styles.sliderContainer}>
              <ThemedText style={{ color: colors.text.tertiary }}>1</ThemedText>
              <Slider
                style={styles.slider}
                minimumValue={1}
                maximumValue={10}
                step={1}
                value={intensity}
                onValueChange={setIntensity}
                minimumTrackTintColor={colors.text.primary}
                maximumTrackTintColor={colors.text.tertiary}
              />
              <ThemedText style={{ color: colors.text.tertiary }}>10</ThemedText>
            </View>
          </View>

          {/* Mood Selector */}
          <View style={styles.moodContainer}>
            <ThemedText variant="body" style={[styles.moodLabel, { color: colors.text.secondary }]}>
              Como você está se sentindo? (Selecione uma ou mais emoções)
            </ThemedText>
            {preselectedMoods && (
              <ThemedText variant="caption" style={[styles.preselectedNote, { color: colors.primary }]}>
                ✨ Emoções pré-selecionadas da tela inicial
              </ThemedText>
            )}
            {selectedMoods.length > 0 && (
              <ThemedText variant="caption" style={[styles.selectedCount, { color: colors.text.primary }]}>
                {selectedMoods.length} emoção{selectedMoods.length > 1 ? 'ões' : ''} selecionada{selectedMoods.length > 1 ? 's' : ''}
              </ThemedText>
            )}
            <View style={styles.moodGrid}>
              {MOOD_OPTIONS.map((mood) => (
                <TouchableOpacity
                  key={mood.id}
                  style={[
                    styles.moodButton,
                    { backgroundColor: mood.color },
                    selectedMoods.includes(mood.id) && styles.selectedMood
                  ]}
                  onPress={() => toggleMood(mood.id)}
                >
                  <ThemedText style={styles.moodEmoji}>{mood.emoji}</ThemedText>
                  <ThemedText style={styles.moodItemLabel}>{mood.label}</ThemedText>
                  {selectedMoods.includes(mood.id) && (
                    <View style={styles.selectedIndicator}>
                      <ThemedText style={styles.checkmark}>✓</ThemedText>
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Save Button */}
          <TouchableOpacity 
            style={[styles.saveButton, { backgroundColor: colors.text.primary }]}
            onPress={handleSave}
          >
            <ThemedText style={[styles.saveButtonText, { color: colors.background }]}>
              Salvar
            </ThemedText>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
      
      {/* Toast Component */}
      {toast.toastConfig && (
        <Toast
          visible={toast.visible}
          type={toast.toastConfig.type}
          title={toast.toastConfig.title}
          message={toast.toastConfig.message}
          duration={toast.toastConfig.duration}
          onHide={toast.hideToast}
          actionText={toast.toastConfig.actionText}
          onActionPress={toast.toastConfig.onActionPress}
        />
      )}
    </>
  );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    backButton: {
        padding: 8,
    },
    headerActions: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    favoriteButton: {
        marginLeft: 4,
    },
    content: {
        flex: 1,
        paddingHorizontal: 16,
    },
    scrollContent: {
        paddingBottom: 160,
        paddingTop: 16,
    },
    dateSelector: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderRadius: 12,
        marginBottom: 16,
    },
    dateContent: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    dateText: {
        fontSize: 16,
        fontWeight: '500',
        textTransform: 'capitalize',
    },
    inputContainer: {
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
    },
    contentContainer: {
        minHeight: 200,
    },
    titleInput: {
        fontSize: 18,
        fontWeight: '600',
        padding: 0,
    },
    contentInput: {
        fontSize: 16,
        lineHeight: 24,
        padding: 0,
        minHeight: 160,
    },
    moodContainer: {
        marginBottom: 24,
    },
    moodLabel: {
        fontSize: 16,
        fontWeight: '500',
        marginBottom: 8,
        textAlign: 'center',
    },
    selectedCount: {
        fontSize: 14,
        fontWeight: '500',
        textAlign: 'center',
        marginBottom: 16,
        opacity: 0.8,
    },
    moodGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-around',
        paddingHorizontal: 8,
        gap: 8,
    },
    moodButton: {
        width: '30%',
        minHeight: 80,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
        paddingVertical: 8,
    },
    selectedMood: {
        borderWidth: 3,
        borderColor: '#FFFFFF',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
    },
    moodEmoji: {
        fontSize: 20,
        marginBottom: 4,
    },
    moodItemLabel: {
        fontSize: 10,
        fontWeight: '500',
        textAlign: 'center',
        color: '#333',
        textShadowColor: 'rgba(255, 255, 255, 0.8)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 1,
    },
    selectedIndicator: {
        position: 'absolute',
        top: -2,
        right: -2,
        width: 20,
        height: 20,
        borderRadius: 10,
        backgroundColor: '#4CAF50',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#FFFFFF',
    },
    checkmark: {
        fontSize: 12,
        color: '#FFFFFF',
        fontWeight: 'bold',
    },
    saveButton: {
        borderRadius: 12,
        paddingVertical: 16,
        paddingHorizontal: 32,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 20,
    },
    saveButtonText: {
        fontSize: 16,
        fontWeight: '600',
    },
    intensityLabel: {
        fontSize: 16,
        fontWeight: '500',
        marginBottom: 12,
    },
    sliderContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
    },
    slider: {
        flex: 1,
        height: 40,
    },
    preselectedNote: {
        fontSize: 12,
        fontWeight: '500',
        textAlign: 'center',
        marginBottom: 8,
        fontStyle: 'italic',
    },
});