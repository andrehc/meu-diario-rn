import { Stack } from 'expo-router';
import React from 'react';
import { BottomNavigation } from '../../src/components';

export default function TabLayout() {
  return (
    <>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="stats" />
        <Stack.Screen name="add-entry" />
        <Stack.Screen name="calendar" />
        <Stack.Screen name="settings" />
      </Stack>
      <BottomNavigation />
    </>
  );
}