import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SplashScreen } from '../src/components';

export default function Splash() {
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <SplashScreen />
    </SafeAreaView>
  );
}