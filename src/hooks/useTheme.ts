import { useColorScheme } from 'react-native';

/**
 * Hook para usar cores do tema com base no esquema de cores (light/dark)
 */
export function useThemeColor(
  props: { light?: string; dark?: string },
  colorName?: keyof typeof Colors.light & keyof typeof Colors.dark,
): string {
  const theme = useCustomColorScheme();
  const colorFromProps = props[theme];

  if (colorFromProps) {
    return colorFromProps;
  } else {
    return Colors[theme][colorName ?? 'text'];
  }
}

/**
 * Hook customizado para esquema de cores com fallback
 */
export function useCustomColorScheme(): 'light' | 'dark' {
  const colorScheme = useColorScheme();
  return colorScheme ?? 'light';
}

/**
 * Definição das cores do tema
 */
const Colors = {
  light: {
    // Cores principais (suas cores originais)
    text: '#11181C',
    background: '#EEE4CE',
    tint: '#934730',
    icon: '#687076',
    tabIconDefault: '#687076',
    tabIconSelected: '#934730',
    
    // Cores específicas do app
    baseColor: '#EEE4CE',
    primary: '#934730',
    secondary: '#D4A574',
    textSecondary: '#6B7280',
    cardBackground: '#F9F7F4',
    surface: '#FFFFFF',
    
    // Cores de estado
    success: '#22c55e',
    warning: '#f59e0b',
    error: '#ef4444',
    info: '#3b82f6',
  },
  dark: {
    // Cores Dracula
    text: '#f8f8f2',
    background: '#282a36',
    tint: '#bd93f9',
    icon: '#6272a4',
    tabIconDefault: '#6272a4',
    tabIconSelected: '#bd93f9',
    
    // Cores específicas do app (Dracula theme)
    baseColor: '#282a36',
    primary: '#bd93f9',
    secondary: '#ff79c6',
    textSecondary: '#6272a4',
    cardBackground: '#44475a',
    surface: '#44475a',
    
    // Cores de estado (Dracula)
    success: '#50fa7b',
    warning: '#ffb86c',
    error: '#ff5555',
    info: '#8be9fd',
  },
};

/**
 * Hook para usar tema completo
 */
export function useTheme() {
  const colorScheme = useCustomColorScheme();
  const themeColors = Colors[colorScheme];
  
    return {
    colors: {
      ...themeColors,
      text: {
        primary: themeColors.text,
        secondary: themeColors.textSecondary || themeColors.icon,
        tertiary: themeColors.icon,
        inverse: colorScheme === 'dark' ? '#f8f8f2' : '#ffffff',
      },
      border: themeColors.icon, // Usando icon como border color
      error: themeColors.error,
    },
    isDark: colorScheme === 'dark',
    isLight: colorScheme === 'light',
  };
}

export type ColorName = keyof typeof Colors.light;