export interface MoodOption {
  id: string;
  emoji: string;
  color: string;
  label: string;
}

export const MOOD_OPTIONS: MoodOption[] = [
  { id: 'loved', emoji: '🥰', color: '#FFCDD2', label: 'Amor' },
  { id: 'happy', emoji: '🙂', color: '#4DD0E1', label: 'Alegria' },
  { id: 'relaxed', emoji: '😌', color: '#81C784', label: 'Calma' },
  { id: 'grateful', emoji: '🤩', color: '#BA68C8', label: 'Gratidão' },
  { id: 'sad', emoji: '😭', color: '#FFB6B6', label: 'Tristeza' },
  { id: 'anxious', emoji: '😬', color: '#FFCC80', label: 'Ansiedade' },
  { id: 'guilty', emoji: '🥺', color: '#F5957E', label: 'Culpa' },
  { id: 'fear', emoji: '😱', color: '#FF8A80', label: 'Medo' },
  { id: 'angry', emoji: '🤬', color: '#FF5252', label: 'Raiva' },
];

/**
 * Função para obter o emoji baseado no valor salvo no diário
 * @param savedValue - Valor salvo no campo current_mood ou em feelings array
 * @returns Emoji correspondente ou um emoji neutro como fallback
 */
export function getMoodEmoji(savedValue: string): string {
  // Busca por label (português)
  const moodByLabel = MOOD_OPTIONS.find(mood => mood.label === savedValue);
  if (moodByLabel) {
    return moodByLabel.emoji;
  }
  
  // Busca por ID
  const moodById = MOOD_OPTIONS.find(mood => mood.id === savedValue);
  if (moodById) {
    return moodById.emoji;
  }
  
  // Fallback para emoji neutro
  return '😐';
}

/**
 * Função para obter múltiplos emojis de um array de feelings
 * @param feelingsArray - Array de strings com os sentimentos salvos
 * @returns Array de emojis correspondentes
 */
export function getMoodEmojis(feelingsArray: string[]): string[] {
  if (!Array.isArray(feelingsArray)) {
    return ['😐'];
  }
  
  return feelingsArray.map(feeling => getMoodEmoji(feeling));
}

/**
 * Função para obter o MoodOption completo baseado no valor salvo
 * @param savedValue - Valor salvo no campo current_mood ou em feelings array
 * @returns MoodOption correspondente ou null se não encontrado
 */
export function getMoodOption(savedValue: string): MoodOption | null {
  // Busca por label (português)
  const moodByLabel = MOOD_OPTIONS.find(mood => mood.label === savedValue);
  if (moodByLabel) {
    return moodByLabel;
  }
  
  // Busca por ID
  const moodById = MOOD_OPTIONS.find(mood => mood.id === savedValue);
  if (moodById) {
    return moodById;
  }
  
  return null;
}