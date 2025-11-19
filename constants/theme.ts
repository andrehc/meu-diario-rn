// GlobalStyles.ts
import { StyleSheet } from 'react-native';

// Definição de tipos para os estilos globais
export interface MoodColors {
  happy: string;
  veryHappy: string;
  neutral: string;
  sad: string;
  angry: string;
  fearful: string;
  ansious: string;
  excited: string;
  relaxed: string;
  bored: string;
  other: string
}

export interface Colors {
  primary: string;
  secondary: string;
  background: string;
  cardBackground: string;
  textPrimary: string;
  textSecondary: string;
  textTertiary: string;
  moodColors: MoodColors;
  baseColor?: string;
}

// Colors para o sistema de tema do Expo
export const Colors = {
  light: {
    text: '#11181C',
    background: '#EEE4CE',
    tint: '#4CAF50',
    icon: '#687076',
    tabIconDefault: '#687076',
    tabIconSelected: '#4CAF50',
    cardBackground: '#E6E3D9',
    textPrimary: '#000',
    textSecondary: '#888',
    textTertiary: '#666',
    primary: '#4CAF50',
    secondary: '#66BB6A',
    baseColor: '#934730',
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
    text: '#f8f8f2',           // Dracula foreground
    background: '#282a36',      // Dracula background
    tint: '#bd93f9',           // Dracula purple
    icon: '#6272a4',           // Dracula comment
    tabIconDefault: '#6272a4', // Dracula comment
    tabIconSelected: '#bd93f9', // Dracula purple
    cardBackground: '#44475a',  // Dracula current line
    textPrimary: '#f8f8f2',    // Dracula foreground
    textSecondary: '#a6accd',  // Lighter variant
    textTertiary: '#6272a4',   // Dracula comment
    primary: '#bd93f9',        // Dracula purple
    secondary: '#ff79c6',      // Dracula pink
    baseColor: '#1a1b26',      // Dark variant for navigation
    moodColors: {
      happy: '#50fa7b',        // Dracula green
      veryHappy: '#f1fa8c',    // Dracula yellow
      neutral: '#8be9fd',      // Dracula cyan
      sad: '#6272a4',          // Dracula comment
      fearful: '#ffb86c',      // Dracula orange
      ansious: '#ff79c6',      // Dracula pink
      excited: '#bd93f9',      // Dracula purple
      relaxed: '#50fa7b',      // Dracula green
      bored: '#6272a4',        // Dracula comment
      angry: '#ff5555',        // Dracula red
      other: '#f8f8f2',        // Dracula foreground
    },
  },
};

export interface Fonts {
  regular: string;
  bold: string;
  sizes: {
    xxs: number;
    xs: number;
    small: number;
    medium: number;
    large: number;
    xl: number;
    xxl: number;
  };
}

export interface Spacing {
  xs: number;
  s: number;
  m: number;
  l: number;
  xl: number;
  xxl: number;
}

export interface Borders {
  radius: number;
  radiusSmall: number;
  radiusCircle: number;
}

export interface Shadow {
  elevation: number;
  shadowColor: string;
  shadowOffset: { width: number; height: number };
  shadowOpacity: number;
  shadowRadius: number;
}

export interface Typography {
  h1: { fontSize: number; fontWeight: 'bold'; color: string };
  h2: { fontSize: number; fontWeight: 'bold'; color: string };
  body: { fontSize: number; color: string };
  caption: { fontSize: number; color: string };
}

// Estilos globais reutilizáveis
const GlobalStyles: {
  colors: Colors;
  fonts: Fonts;
  spacing: Spacing;
  borders: Borders;
  shadow: Shadow;
  typography: Typography;
} = {
  // Cores (usando o tema light como padrão)
  colors: {
    primary: Colors.light.primary,
    secondary: Colors.light.secondary,
    background: Colors.light.background,
    cardBackground: Colors.light.cardBackground,
    textPrimary: Colors.light.textPrimary,
    textSecondary: Colors.light.textSecondary,
    textTertiary: Colors.light.textTertiary,
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
  // Fontes
  fonts: {
    regular: 'System',
    bold: 'System',
    sizes: {
      xxs: 12,
      xs: 14,
      small: 16,
      medium: 18,
      large: 20,
      xl: 24,
      xxl: 28,
    },
  },
  // Espaçamentos
  spacing: {
    xs: 5,
    s: 10,
    m: 15,
    l: 20,
    xl: 25,
    xxl: 30,
  },
  // Bordas e cantos
  borders: {
    radius: 12,
    radiusSmall: 10,
    radiusCircle: 50,
  },
  // Sombras
  shadow: {
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  // Tipografia
  typography: {
    h1: {
      fontSize: 28,
      fontWeight: 'bold',
      color: '#000',
    },
    h2: {
      fontSize: 24,
      fontWeight: 'bold',
      color: '#000',
    },
    body: {
      fontSize: 16,
      color: '#000',
    },
    caption: {
      fontSize: 12,
      color: '#888',
    },
  },
};

// Estilos comuns que podem ser usados diretamente em componentes
export const CommonStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: GlobalStyles.colors.background,
  },
  card: {
    backgroundColor: GlobalStyles.colors.cardBackground,
    borderRadius: GlobalStyles.borders.radius,
    padding: GlobalStyles.spacing.l,
    marginBottom: GlobalStyles.spacing.l,
  },
  fab: {
    position: 'absolute',
    bottom: 30,
    // right: GlobalStyles.spacing.l,
    width: 60,
    height: 60,
    borderRadius: GlobalStyles.borders.radiusCircle,
    backgroundColor: GlobalStyles.colors.secondary,
    justifyContent: 'center',
    alignItems: 'center',
    ...GlobalStyles.shadow,
  },
  fabText: {
    fontSize: 32,
    color: GlobalStyles.colors.cardBackground,
    fontWeight: 'bold',
  },
  moodSelector: {
    flexDirection: 'row',
    paddingHorizontal: GlobalStyles.spacing.xs,
    gap: GlobalStyles.spacing.s,
  },
  moodButton: {
    width: 60,
    height: 60,
    borderRadius: GlobalStyles.borders.radiusSmall,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: GlobalStyles.colors.cardBackground,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  emoji: {
    fontSize: 24,
  },
});

export default GlobalStyles;