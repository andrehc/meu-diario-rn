import { useColorScheme as useRNColorScheme } from 'react-native';

/**
 * Hook para usar esquema de cores com fallback para 'light'
 */
export function useColorScheme(): 'light' | 'dark' {
  const colorScheme = useRNColorScheme();
  return colorScheme ?? 'light';
}