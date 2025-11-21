import { Stack } from 'expo-router';
import React from 'react';

export default function EntriesLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="entries" options={{ title: 'Entradas' }} />
      <Stack.Screen name="add-entry" options={{ title: 'Nova Entrada' }} />
      <Stack.Screen name="details" options={{ title: 'Detalhes' }} />
    </Stack>
  );
}