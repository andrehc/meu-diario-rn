import React from 'react';
import { StyleSheet, Switch, View } from 'react-native';
import { ThemedText } from './ThemedText';
import { ThemedView } from './ThemedView';
import { useThemeColor } from '@/src/hooks';

interface PinToggleProps {
  enabled?: boolean;
  value?: boolean; // Para compatibilidade
  onToggle: (enabled: boolean) => void;
  onPinSet?: (pin: string) => Promise<void>; // Callback quando PIN é definido
  title?: string;
  description?: string;
}

export function PinToggle({ 
  enabled, 
  value,
  onToggle, 
  onPinSet,
  title = "Habilitar PIN",
  description = "Use um PIN de 4 dígitos para proteger sua conta"
}: PinToggleProps) {
  // Usa value se fornecido, senão enabled
  const isEnabled = value !== undefined ? value : enabled;
  const iconColor = useThemeColor({}, 'icon');
  const cardBackgroundColor = useThemeColor({}, 'cardBackground');

  return (
    <ThemedView style={[styles.container, { backgroundColor: cardBackgroundColor }]}>
      <View style={styles.content}>
        <View style={styles.textContainer}>
          <ThemedText style={styles.title}>{title}</ThemedText>
          <ThemedText style={[styles.description, { color: iconColor }]}>
            {description}
          </ThemedText>
        </View>
        <Switch
          value={isEnabled}
          onValueChange={onToggle}
          thumbColor={isEnabled ? '#4c6ef5' : '#f4f3f4'}
          trackColor={{ false: iconColor, true: '#4c6ef5' }}
        />
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  textContainer: {
    flex: 1,
    marginRight: 16,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  description: {
    fontSize: 14,
    opacity: 0.7,
  },
});