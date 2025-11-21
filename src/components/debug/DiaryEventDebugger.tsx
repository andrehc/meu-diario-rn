import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useDebug } from '../../contexts/DebugContext';
import { useTheme } from '../../hooks';
import { DiaryEventBus } from '../../services/diaryEventBus';
import { ThemedText, ThemedView } from '../ui';

interface EventLogEntry {
  id: string;
  type: string;
  timestamp: number;
  payload: any;
}

export function DiaryEventDebugger() {
  const { colors } = useTheme();
  const { isEventBusDebugEnabled } = useDebug();
  const [events, setEvents] = useState<EventLogEntry[]>([]);
  const [isVisible, setIsVisible] = useState(false);
  const [listenerCount, setListenerCount] = useState(0);

  useEffect(() => {
    if (!isEventBusDebugEnabled) return;

    const eventBus = DiaryEventBus.getInstance();
    
    console.log('🐛 [Debugger] Iniciando monitoramento de eventos...');
    
    // Monitor de todos os eventos
    const unsubscribe = eventBus.subscribeToAllEvents((event) => {
      console.log('🐛 [Debugger] Evento capturado:', event);
      const logEntry: EventLogEntry = {
        id: `${Date.now()}-${Math.random()}`,
        type: event.type,
        timestamp: Date.now(),
        payload: event.payload
      };
      
      setEvents(prev => [logEntry, ...prev.slice(0, 19)]); // Manter apenas 20 eventos
    });

    // Update listener count periodically
    const interval = setInterval(() => {
      const count = eventBus.getListenerCount();
      setListenerCount(count);
    }, 2000);

    return () => {
      console.log('🐛 [Debugger] Parando monitoramento de eventos...');
      unsubscribe();
      clearInterval(interval);
    };
  }, [isEventBusDebugEnabled]);

  const clearEvents = () => {
    setEvents([]);
  };

  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString('pt-BR');
  };

  const getEventTypeColor = (type: string) => {
    switch (type) {
      case 'diary_entry_created': return '#4CAF50';
      case 'diary_entry_updated': return '#FF9800';
      case 'diary_entry_deleted': return '#F44336';
      default: return colors.text.secondary;
    }
  };

  if (!__DEV__ || !isEventBusDebugEnabled) {
    return null; // Só mostra em desenvolvimento e quando habilitado
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity 
        style={[styles.toggleButton, { backgroundColor: colors.primary }]}
        onPress={() => setIsVisible(!isVisible)}
      >
        <Text style={[styles.toggleButtonText, { color: colors.text.inverse }]}>
          🐛 {listenerCount}
        </Text>
      </TouchableOpacity>

      {isVisible && (
        <ThemedView variant="card" style={styles.debugPanel}>
          <View style={styles.header}>
            <ThemedText variant="h3">Event Bus Monitor</ThemedText>
            <TouchableOpacity onPress={clearEvents}>
              <ThemedText color="secondary">Limpar</ThemedText>
            </TouchableOpacity>
          </View>

          <View style={styles.stats}>
            <ThemedText color="secondary" style={styles.stat}>
              Listeners ativos: {listenerCount}
            </ThemedText>
            <ThemedText color="secondary" style={styles.stat}>
              Eventos capturados: {events.length}
            </ThemedText>
          </View>

          <ScrollView style={styles.eventList} showsVerticalScrollIndicator={false}>
            {events.length === 0 ? (
              <ThemedText color="tertiary" style={styles.noEvents}>
                Aguardando eventos...
              </ThemedText>
            ) : (
              events.map((event) => (
                <View key={event.id} style={styles.eventItem}>
                  <View style={styles.eventHeader}>
                    <View style={[styles.eventTypeDot, { 
                      backgroundColor: getEventTypeColor(event.type) 
                    }]} />
                    <Text style={[styles.eventType, { color: colors.text.primary }]}>
                      {event.type.replace('diary_entry_', '')}
                    </Text>
                    <Text style={[styles.eventTime, { color: colors.text.tertiary }]}>
                      {formatTimestamp(event.timestamp)}
                    </Text>
                  </View>
                  <Text style={[styles.eventPayload, { color: colors.text.secondary }]}>
                    User: {event.payload.userId}, Entry: {event.payload.entryId || 'N/A'}
                  </Text>
                  {event.payload.entry?.title && (
                    <Text style={[styles.eventTitle, { color: colors.text.tertiary }]}>
                      "{event.payload.entry.title}"
                    </Text>
                  )}
                </View>
              ))
            )}
          </ScrollView>
        </ThemedView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  toggleButton: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    minWidth: 40,
    alignItems: 'center',
  },
  toggleButtonText: {
    fontSize: 11,
    fontWeight: '600',
  },
  debugPanel: {
    position: 'absolute',
    top: 50,
    right: 0,
    width: 280,
    maxHeight: 350,
    padding: 12,
    borderRadius: 8,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    zIndex: 10000,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  stats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  stat: {
    fontSize: 11,
  },
  eventList: {
    maxHeight: 250,
  },
  noEvents: {
    textAlign: 'center',
    fontStyle: 'italic',
    marginTop: 20,
  },
  eventItem: {
    marginBottom: 12,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  eventHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  eventTypeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  eventType: {
    flex: 1,
    fontSize: 12,
    fontWeight: '600',
  },
  eventTime: {
    fontSize: 10,
  },
  eventPayload: {
    fontSize: 10,
    marginLeft: 16,
  },
  eventTitle: {
    fontSize: 9,
    marginLeft: 16,
    fontStyle: 'italic',
    marginTop: 2,
  },
});