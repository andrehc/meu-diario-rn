import { useAuth } from '@/src/contexts/AuthContext';
import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface DebugInfo {
  timestamp: string;
  level: 'info' | 'warn' | 'error';
  message: string;
}

export const DebugPanel = () => {
  const [isVisible, setIsVisible] = useState(__DEV__); // Só aparece em desenvolvimento
  const [logs, setLogs] = useState<DebugInfo[]>([]);
  const { user } = useAuth();

  // Intercepta console.log para mostrar no painel
  useEffect(() => {
    if (!__DEV__) return;

    const originalConsole = {
      log: console.log,
      warn: console.warn,
      error: console.error,
    };

    console.log = (...args) => {
      originalConsole.log(...args);
      addLog('info', args.join(' '));
    };

    console.warn = (...args) => {
      originalConsole.warn(...args);
      addLog('warn', args.join(' '));
    };

    console.error = (...args) => {
      originalConsole.error(...args);
      addLog('error', args.join(' '));
    };

    return () => {
      console.log = originalConsole.log;
      console.warn = originalConsole.warn;
      console.error = originalConsole.error;
    };
  }, []);

  const addLog = (level: 'info' | 'warn' | 'error', message: string) => {
    setLogs(prev => [
      {
        timestamp: new Date().toLocaleTimeString(),
        level,
        message: message.slice(0, 100), // Limita o tamanho
      },
      ...prev.slice(0, 19), // Mantém apenas os últimos 20 logs
    ]);
  };

  const clearLogs = () => setLogs([]);

  if (!__DEV__ || !isVisible) return null;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>🐛 Debug Panel</Text>
        <View style={styles.buttons}>
          <TouchableOpacity onPress={clearLogs} style={styles.button}>
            <Text style={styles.buttonText}>Clear</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setIsVisible(false)} style={styles.button}>
            <Text style={styles.buttonText}>Hide</Text>
          </TouchableOpacity>
        </View>
      </View>
      
      <View style={styles.userInfo}>
        <Text style={styles.userText}>
          👤 User: {user ? `${user.name} (${user.email})` : 'Not logged in'}
        </Text>
      </View>

      <ScrollView style={styles.logContainer}>
        {logs.map((log, index) => (
          <View key={index} style={[styles.logItem, styles[log.level]]}>
            <Text style={styles.timestamp}>{log.timestamp}</Text>
            <Text style={styles.logMessage}>{log.message}</Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

// Componente para ativar o debug
export const DebugToggle = () => {
  const [showPanel, setShowPanel] = useState(false);

  if (!__DEV__) return null;

  return (
    <>
      <TouchableOpacity 
        style={styles.debugToggle} 
        onPress={() => setShowPanel(!showPanel)}
      >
        <Text style={styles.debugToggleText}>🐛</Text>
      </TouchableOpacity>
      {showPanel && <DebugPanel />}
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 100,
    left: 10,
    right: 10,
    height: 300,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    borderRadius: 8,
    zIndex: 1000,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  title: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  buttons: {
    flexDirection: 'row',
  },
  button: {
    backgroundColor: '#333',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 4,
    marginLeft: 5,
  },
  buttonText: {
    color: '#fff',
    fontSize: 12,
  },
  userInfo: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  userText: {
    color: '#fff',
    fontSize: 12,
  },
  logContainer: {
    flex: 1,
    padding: 5,
  },
  logItem: {
    padding: 5,
    marginVertical: 1,
    borderRadius: 3,
  },
  info: {
    backgroundColor: 'rgba(0, 100, 255, 0.2)',
  },
  warn: {
    backgroundColor: 'rgba(255, 165, 0, 0.2)',
  },
  error: {
    backgroundColor: 'rgba(255, 0, 0, 0.2)',
  },
  timestamp: {
    color: '#aaa',
    fontSize: 10,
  },
  logMessage: {
    color: '#fff',
    fontSize: 11,
    marginTop: 2,
  },
  debugToggle: {
    position: 'absolute',
    top: 50,
    right: 10,
    width: 40,
    height: 40,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 999,
  },
  debugToggleText: {
    fontSize: 20,
  },
});