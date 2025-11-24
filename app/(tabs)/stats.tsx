import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBarBackground, ThemedText } from '../../src/components';
import { useTheme } from '../../src/hooks';

export default function StatsScreen() {
  const router = useRouter();
  const { colors, styles: themeStyles } = useTheme();

  return (
    <>
      <StatusBarBackground />
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={[themeStyles.header, { backgroundColor: colors.surface }]}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
          </TouchableOpacity>
            <ThemedText variant="h2">Estatísticas</ThemedText>
          <View style={styles.placeholder} />
        </View>
        <View style={styles.content}>        
          <ThemedText color="secondary">Visualize seus registros emocionais</ThemedText>          
          <ThemedText color="secondary">
            📊 Aqui você verá gráficos e estatísticas dos seus registros de humor e emoções.
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
  backButton: {
    padding: 8,
  },
  placeholder: {
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