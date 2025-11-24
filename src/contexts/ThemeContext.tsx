import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useColorScheme } from 'react-native';
import { ProfileService } from '../services/profileService';
import { useAuth } from '../hooks/useAuth';

type ThemeContextType = {
  theme: 'light' | 'dark';
  setTheme: (theme: 'light' | 'dark') => Promise<void>;
  isDark: boolean;
  isLight: boolean;
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const systemColorScheme = useColorScheme();
  const { user } = useAuth();
  const [theme, setThemeState] = useState<'light' | 'dark'>('light');
  const [isLoading, setIsLoading] = useState(true);

  // Carregar tema do usuário do banco
  useEffect(() => {
    async function loadUserTheme() {
      if (user?.id) {
        try {
          const userTheme = await ProfileService.getTheme(user.id);
          setThemeState(userTheme);
        } catch (error) {
          console.error('Erro ao carregar tema do usuário:', error);
          setThemeState(systemColorScheme || 'light');
        }
      } else {
        setThemeState(systemColorScheme || 'light');
      }
      setIsLoading(false);
    }
    loadUserTheme();
  }, [user?.id, systemColorScheme]);

  const setTheme = async (newTheme: 'light' | 'dark') => {
    if (user?.id) {
      try {
        await ProfileService.updateTheme(user.id, newTheme);
        setThemeState(newTheme);
      } catch (error) {
        console.error('Erro ao salvar tema:', error);
      }
    }
  };

  if (isLoading) {
    return null; // ou um loading spinner
  }

  return (
    <ThemeContext.Provider
      value={{
        theme,
        setTheme,
        isDark: theme === 'dark',
        isLight: theme === 'light',
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useThemeContext() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useThemeContext must be used within a ThemeProvider');
  }
  return context;
}
