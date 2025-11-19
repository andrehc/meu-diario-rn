import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RegisterForm, StatusBarBackground } from '../../src/components';
import { useTheme } from '../../src/hooks';

export default function RegisterScreen() {
  const { colors } = useTheme();
  
  return (
    <>
      <StatusBarBackground />
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
        <RegisterForm />
      </SafeAreaView>
    </>
  );
}