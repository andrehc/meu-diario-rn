import React from 'react';
import { View, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemedText, StatusBarBackground } from '../../src/components';
import { useTheme } from '../../src/hooks';

export default function CalendarScreen() {
  const { colors } = useTheme();

  return (
    <>
      <StatusBarBackground />
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.header}>
          <ThemedText variant="h1">Registros de Emoções</ThemedText>
          <ThemedText color="secondary">Visualize suas emoções por data</ThemedText>
        </View>
        
        <View style={styles.content}>
          <ThemedText color="secondary">
            📅 Aqui você verá um calendário com seus registros emocionais organizados por data.
          </ThemedText>
          <ThemedText color="secondary" style={styles.developmentText}>
            🚧 Funcionalidade em desenvolvimento...
          </ThemedText>
        </View>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 20,
    alignItems: 'center',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    paddingBottom: 160,
    gap: 16,
  },
  developmentText: {
    marginTop: 20,
    fontStyle: 'italic',
  },
});