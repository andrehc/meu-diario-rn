import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import {
    Modal,
    StyleSheet,
    Text,
    TouchableOpacity,
    TouchableWithoutFeedback,
    View
} from 'react-native';
import { useTheme } from '../../hooks';
import { ThemedText, ThemedView } from './index';

interface QuickEmotionModalProps {
  visible: boolean;
  selectedEmojis: string[];
  selectedMoodLabels: string[];
  onConfirm: () => void;
  onCancel: () => void;
}

export function QuickEmotionModal({
  visible,
  selectedEmojis,
  selectedMoodLabels,
  onConfirm,
  onCancel,
}: QuickEmotionModalProps) {
  const { colors } = useTheme();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
    >
      <TouchableWithoutFeedback onPress={onCancel}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback onPress={(e) => e.stopPropagation()}>
            <ThemedView variant="card" style={[styles.modalContainer, { shadowColor: colors.text.primary }]}>
              {/* Header */}
              <View style={styles.header}>
                <View style={styles.iconContainer}>
                  <Ionicons name="heart" size={24} color={colors.primary} />
                </View>
                <ThemedText variant="h3" style={styles.title}>
                  Registrar emoção?
                </ThemedText>
              </View>

              {/* Selected Emotions */}
              <View style={styles.emotionsContainer}>
                <ThemedText color="secondary" style={styles.subtitle}>
                  {selectedMoodLabels.length === 1 
                    ? 'Você selecionou esta emoção:' 
                    : `Você selecionou ${selectedMoodLabels.length} emoções:`
                  }
                </ThemedText>
                
                <View style={styles.selectedEmotions}>
                  {selectedEmojis.map((emoji, index) => (
                    <View key={index} style={styles.emojiContainer}>
                      <Text style={styles.emoji}>{emoji}</Text>
                      <ThemedText style={styles.emojiLabel}>
                        {selectedMoodLabels[index]}
                      </ThemedText>
                    </View>
                  ))}
                </View>
              </View>

              {/* Message */}
              <ThemedText color="tertiary" style={styles.message}>
                Gostaria de criar uma entrada no diário para registrar seus pensamentos sobre {selectedMoodLabels.length === 1 ? 'esta emoção' : 'estas emoções'}?
              </ThemedText>

              {/* Actions */}
              <View style={styles.actions}>
                <TouchableOpacity
                  style={[styles.button, styles.cancelButton, { borderColor: colors.border }]}
                  onPress={onCancel}
                >
                  <ThemedText color="secondary" style={styles.buttonText}>
                    Agora não
                  </ThemedText>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[styles.button, styles.confirmButton, { backgroundColor: colors.primary }]}
                  onPress={onConfirm}
                >
                  <Ionicons name="add" size={18} color={colors.text.inverse} />
                  <ThemedText style={[styles.buttonText, { color: colors.text.inverse }]}>
                    Criar entrada
                  </ThemedText>
                </TouchableOpacity>
              </View>
            </ThemedView>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  modalContainer: {
    width: '100%',
    maxWidth: 340,
    borderRadius: 16,
    padding: 24,
    elevation: 8,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    textAlign: 'center',
    fontWeight: '600',
  },
  emotionsContainer: {
    marginBottom: 20,
  },
  subtitle: {
    textAlign: 'center',
    marginBottom: 16,
    fontSize: 14,
  },
  selectedEmotions: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 16,
  },
  emojiContainer: {
    alignItems: 'center',
    minWidth: 60,
  },
  emoji: {
    fontSize: 32,
    marginBottom: 4,
  },
  emojiLabel: {
    fontSize: 12,
    fontWeight: '500',
    textAlign: 'center',
  },
  message: {
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
    fontSize: 14,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
  },
  button: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    gap: 6,
  },
  cancelButton: {
    borderWidth: 1,
  },
  confirmButton: {
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  buttonText: {
    fontSize: 14,
    fontWeight: '600',
  },
});