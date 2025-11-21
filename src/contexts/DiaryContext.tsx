import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { useDiaryEvents } from '../services/diaryEventBus';
import { DiaryService } from '../services/diaryService';
import { DiaryEntry } from '../types/database';
import { useAuth } from './AuthContext';

interface DiaryContextType {
  lastEntry: DiaryEntry | null;
  loading: boolean;
  refreshLastEntry: (userId: number) => Promise<void>;
  isActive: boolean;
  notifyEntryCreated: (entry: DiaryEntry) => void;
}

const DiaryContext = createContext<DiaryContextType | undefined>(undefined);

export function DiaryProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [lastEntry, setLastEntry] = useState<DiaryEntry | null>(null);
  const [loading, setLoading] = useState(false);
  
  const { subscribe, isActive } = useDiaryEvents(user?.id || null);

  const refreshLastEntry = useCallback(async (userId: number) => {
    try {
      setLoading(true);
      console.log('🔄 [DiaryContext] Carregando última entrada via EventBus...');
      
      const entry = await DiaryService.getLastDiaryEntryForProfile(userId);
      setLastEntry(entry);
      
      console.log('✅ [DiaryContext] Entrada carregada:', entry?.title);
    } catch (error) {
      console.error('❌ [DiaryContext] Erro ao carregar entrada:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const notifyEntryCreated = useCallback((entry: DiaryEntry) => {
    console.log('📝 [DiaryContext] Nova entrada criada via EventBus:', entry.title);
    setLastEntry(entry);
  }, []);

  // Configurar listeners do WebSocket
  useEffect(() => {
    if (!user?.id) return;

    // Listener para novas entradas
    const unsubscribeCreate = subscribe('diary_entry_created', (payload: any) => {
      if (payload.userId === user.id && payload.entry) {
        console.log('🎉 [EventBus] Nova entrada recebida:', payload.entry.title);
        setLastEntry(payload.entry);
      }
    });

    // Listener para entradas atualizadas
    const unsubscribeUpdate = subscribe('diary_entry_updated', (payload: any) => {
      if (payload.userId === user.id && payload.entry) {
        console.log('🔄 [EventBus] Entrada atualizada:', payload.entry.title);
        setLastEntry(payload.entry);
      }
    });

    // Listener para entradas deletadas
    const unsubscribeDelete = subscribe('diary_entry_deleted', (payload: any) => {
      if (payload.userId === user.id && lastEntry?.id === payload.entryId) {
        console.log('🗑️ [EventBus] Entrada deletada, buscando nova...');
        refreshLastEntry(user.id);
      }
    });

    return () => {
      unsubscribeCreate();
      unsubscribeUpdate();
      unsubscribeDelete();
    };
  }, [user?.id, subscribe, lastEntry?.id, refreshLastEntry]);

  // Carregamento inicial
  useEffect(() => {
    if (user?.id) {
      refreshLastEntry(user.id);
    }
  }, [user?.id, refreshLastEntry]);

  const value: DiaryContextType = {
    lastEntry,
    loading,
    refreshLastEntry,
    isActive,
    notifyEntryCreated,
  };

  return (
    <DiaryContext.Provider value={value}>
      {children}
    </DiaryContext.Provider>
  );
}

export function useDiary() {
  const context = useContext(DiaryContext);
  if (context === undefined) {
    throw new Error('useDiary must be used within a DiaryProvider');
  }
  return context;
}