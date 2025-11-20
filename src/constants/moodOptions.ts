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