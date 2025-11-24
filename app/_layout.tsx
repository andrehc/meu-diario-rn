import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import 'react-native-reanimated';

import { AuthProvider } from '../src/contexts/AuthContext';
import { DebugProvider } from '../src/contexts/DebugContext';
import { DiaryProvider } from '../src/contexts/DiaryContext';
import { ThemeProvider as CustomThemeProvider } from '../src/contexts/ThemeContext';
import { useColorScheme } from '../src/hooks';

export const unstable_settings = {
  initialRouteName: 'splash',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();

  useEffect(() => {
    // Inicializa o banco de dados usando Drizzle
    const initDatabase = async () => {
      try {
        const databaseModule = await import('../src/db/database');
        await databaseModule.initSQLiteDB();
        console.log('✅ Banco de dados SQLite inicializado com sucesso');
      } catch (error) {
        console.error('❌ Erro ao inicializar banco de dados:', error);
      }
    };

    initDatabase();
  }, []);

  return (
    <AuthProvider>
      <CustomThemeProvider>
        <DebugProvider>
          <DiaryProvider>
            <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
              <Stack screenOptions={{ headerShown: false }}>
                <Stack.Screen name="splash" />
                <Stack.Screen name="auth" />
                <Stack.Screen name="index" />
                <Stack.Screen name="(tabs)" />
              </Stack>
              <StatusBar style="auto" />
            </ThemeProvider>
          </DiaryProvider>
        </DebugProvider>
      </CustomThemeProvider>
    </AuthProvider>
  );
}
