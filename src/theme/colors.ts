// Paleta Dracula oficial
export const DraculaColors = {
  background: '#282a36',
  currentLine: '#44475a',
  foreground: '#f8f8f2',
  comment: '#6272a4',
  cyan: '#8be9fd',
  green: '#50fa7b',
  orange: '#ffb86c',
  pink: '#ff79c6',
  purple: '#bd93f9',
  red: '#ff5555',
  yellow: '#f1fa8c',
} as const;

// Paleta para tema claro (baseada nas cores do projeto)
export const LightColors = {
  cream: '#EEE4CE',      // Cor base
  darkBrown: '#934730',   // Cor secundária
  lightBrown: '#B8835A',  // Tom médio
  warmBeige: '#E6E3D9',   // Variação do cream
  softBrown: '#A67C52',   // Tom suave
  darkText: '#2C1810',    // Texto escuro
  mediumText: '#6B4423',  // Texto médio
  lightText: '#8B6F4C',   // Texto claro
} as const;

// Colors para o sistema de tema do Expo
export const Colors = {
  light: {
    text: '#2C1810',
    background: LightColors.cream,
    tint: LightColors.darkBrown,
    icon: '#6B4423',
    tabIconDefault: '#8B6F4C',
    tabIconSelected: LightColors.darkBrown,
    cardBackground: LightColors.warmBeige,
    surface: '#F5F3F0',
    textPrimary: LightColors.darkText,
    textSecondary: LightColors.mediumText,
    textTertiary: LightColors.lightText,
    primary: LightColors.darkBrown,
    secondary: LightColors.lightBrown,
    baseColor: LightColors.darkBrown,
    error: '#D32F2F',
    warning: '#F57C00',
    success: '#388E3C',
    info: '#1976D2',
    moodColors: {
      happy: '#4DD0E1',
      veryHappy: '#66BB6A',
      neutral: '#FFEB3B',
      sad: '#FFB6B6',
      fearful: '#FF8A80',
      ansious: '#FFCC80',
      excited: '#BA68C8',
      relaxed: '#81C784',
      bored: '#90A4AE',
      angry: '#FF5252',
      other: '#A1887F',
    },
  },
  dark: {
    text: DraculaColors.foreground,
    background: DraculaColors.background,
    tint: DraculaColors.purple,
    icon: DraculaColors.comment,
    tabIconDefault: DraculaColors.comment,
    tabIconSelected: DraculaColors.purple,
    cardBackground: DraculaColors.currentLine,
    surface: '#383a59',
    textPrimary: DraculaColors.foreground,
    textSecondary: '#a6accd',
    textTertiary: DraculaColors.comment,
    primary: DraculaColors.purple,
    secondary: DraculaColors.pink,
    baseColor: '#1a1b26',
    error: DraculaColors.red,
    warning: DraculaColors.orange,
    success: DraculaColors.green,
    info: DraculaColors.cyan,
    moodColors: {
      happy: DraculaColors.green,
      veryHappy: DraculaColors.yellow,
      neutral: DraculaColors.cyan,
      sad: DraculaColors.comment,
      fearful: DraculaColors.orange,
      ansious: DraculaColors.pink,
      excited: DraculaColors.purple,
      relaxed: DraculaColors.green,
      bored: DraculaColors.comment,
      angry: DraculaColors.red,
      other: DraculaColors.foreground,
    },
  },
};

export type Theme = typeof Colors.light;
export type MoodColors = typeof Colors.light.moodColors;