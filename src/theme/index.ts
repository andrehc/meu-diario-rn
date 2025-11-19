import { StyleSheet } from 'react-native';
export { Colors, Theme, MoodColors, DraculaColors, LightColors } from './colors';
export { typography, fontFamily, fontSize, Typography } from './typography';
export { spacing, borders, shadows, Spacing, Borders, Shadows } from './spacing';

// Re-export principais para compatibilidade
import { Colors } from './colors';
import { typography, fontFamily, fontSize } from './typography';
import { spacing, borders, shadows } from './spacing';

// Themes para o novo sistema
export const lightTheme = Colors.light;
export const darkTheme = Colors.dark;
export const theme = {
  light: lightTheme,
  dark: darkTheme,
  spacing,
  typography,
  shadows,
  borders,
};

// Estilos globais reutilizáveis (mantendo compatibilidade)
const GlobalStyles = {
  colors: Colors.light, // Padrão para compatibilidade
  fonts: {
    regular: fontFamily.regular,
    bold: fontFamily.bold,
    sizes: fontSize,
  },
  spacing,
  borders,
  shadow: shadows.base,
  typography,
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