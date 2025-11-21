// Exemplo de como usar as funções de mood em componentes

import { getMoodEmoji, getMoodEmojis, getMoodOption } from '../constants/moodOptions';
import { DiaryService } from '../services/diaryService';

// Exemplo 1: Exibir emoji de uma entrada específica
export const ExampleUsage = {
  
  // Função para mostrar emoji do current_mood
  displayCurrentMoodEmoji: (diaryEntry: any) => {
    if (diaryEntry.current_mood) {
      const emoji = getMoodEmoji(diaryEntry.current_mood);
      console.log('Emoji do humor principal:', emoji);
      return emoji;
    }
    return '😐'; // fallback
  },

  // Função para mostrar todos os emojis dos feelings
  displayAllFeelingsEmojis: (diaryEntry: any) => {
    if (diaryEntry.feelings && Array.isArray(diaryEntry.feelings)) {
      const emojis = getMoodEmojis(diaryEntry.feelings);
      console.log('Emojis de todos os sentimentos:', emojis);
      return emojis;
    }
    return ['😐']; // fallback
  },

  // Função para obter dados completos do mood
  getMoodData: (savedValue: string) => {
    const moodOption = getMoodOption(savedValue);
    if (moodOption) {
      console.log('Dados completos do mood:', {
        emoji: moodOption.emoji,
        label: moodOption.label,
        color: moodOption.color,
        id: moodOption.id
      });
      return moodOption;
    }
    return null;
  },

  // Exemplo prático: Buscar última entrada e mostrar emoji
  loadLastEntryMood: async (profileId: number) => {
    try {
      const entries = await DiaryService.getDiaryEntriesForProfile(profileId);
      if (entries.length > 0) {
        const lastEntry = entries[0];
        
        // Emoji do humor principal
        const mainEmoji = getMoodEmoji(lastEntry.current_mood || '');
        
        // Emojis de todos os sentimentos
        const allEmojis = getMoodEmojis(Array.isArray(lastEntry.feelings) ? lastEntry.feelings : [lastEntry.feelings || '']);
        
        return {
          mainEmoji,
          allEmojis,
          entry: lastEntry
        };
      }
    } catch (error) {
      console.error('Erro ao carregar última entrada:', error);
    }
    return null;
  }
};

// Como usar nos componentes React:

/*
// No seu componente React:
import { getMoodEmoji, getMoodEmojis } from '@/src/constants/moodOptions';

const MyComponent = () => {
  const [diaryEntry, setDiaryEntry] = useState(null);

  // Exemplo: Mostrar emoji no card de entrada
  const renderEntryCard = () => {
    if (!diaryEntry) return null;

    // Emoji principal
    const mainEmoji = getMoodEmoji(diaryEntry.current_mood);
    
    // Todos os emojis dos sentimentos
    const allEmojis = getMoodEmojis(diaryEntry.feelings);

    return (
      <View>
        <Text style={{ fontSize: 32 }}>{mainEmoji}</Text>
        <View style={{ flexDirection: 'row' }}>
          {allEmojis.map((emoji, index) => (
            <Text key={index} style={{ fontSize: 20, marginRight: 4 }}>
              {emoji}
            </Text>
          ))}
        </View>
      </View>
    );
  };

  return (
    <View>
      {renderEntryCard()}
    </View>
  );
};
*/