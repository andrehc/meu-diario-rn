import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LoginForm, StatusBarBackground } from '../../src/components';
import { useTheme } from '../../src/hooks';

export default function LoginScreen() {
  const { colors } = useTheme();
  
  return (
    <>
      <StatusBarBackground />
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
        <LoginForm />
      </SafeAreaView>
    </>
  );
}