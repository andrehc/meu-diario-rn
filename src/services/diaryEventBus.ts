import { EventEmitter } from 'events';

export type DiaryEventType = 'diary_entry_created' | 'diary_entry_updated' | 'diary_entry_deleted';

export interface DiaryEvent {
  type: DiaryEventType;
  payload: {
    userId: number;
    entryId?: number;
    entry?: any;
  };
}

class DiaryEventBus extends EventEmitter {
  private static instance: DiaryEventBus;

  private constructor() {
    super();
    this.setMaxListeners(50); // Permite muitos listeners
  }

  static getInstance(): DiaryEventBus {
    if (!DiaryEventBus.instance) {
      DiaryEventBus.instance = new DiaryEventBus();
    }
    return DiaryEventBus.instance;
  }

  // Emitir evento para todos os listeners
  emitDiaryEvent(event: DiaryEvent) {
    console.log('📡 [EventBus] Emitindo evento:', event.type, event.payload);
    this.emit(event.type, event.payload);
    
    // Evento global para debug
    this.emit('diary_event', event);
  }

  // Subscrever a um tipo específico de evento
  subscribeToDiaryEvent(eventType: DiaryEventType, callback: (payload: any) => void): () => void {
    console.log('👂 [EventBus] Listener adicionado para:', eventType);
    this.on(eventType, callback);
    
    // Retorna função para unsubscribe
    return () => {
      console.log('🔇 [EventBus] Listener removido para:', eventType);
      this.off(eventType, callback);
    };
  }

  // Subscrever a todos os eventos (para debug)
  subscribeToAllEvents(callback: (event: DiaryEvent) => void): () => void {
    this.on('diary_event', callback);
    return () => this.off('diary_event', callback);
  }

  // Limpar todos os listeners (para testes ou cleanup)
  clearAllListeners() {
    this.removeAllListeners();
    console.log('🧹 [EventBus] Todos os listeners removidos');
  }

  // Status do event bus
  getListenerCount(eventType?: DiaryEventType): number {
    if (eventType) {
      return this.listenerCount(eventType);
    }
    return this.eventNames().reduce((total, event) => {
      return total + this.listenerCount(event as string);
    }, 0);
  }
}

// Hook para usar o EventBus em componentes React
import { useRef } from 'react';

export function useDiaryEvents(userId: number | null) {
  const eventBus = useRef(DiaryEventBus.getInstance());

  return {
    // Emitir evento
    emit: (event: DiaryEvent) => {
      eventBus.current.emitDiaryEvent(event);
    },

    // Subscrever a evento específico
    subscribe: (eventType: DiaryEventType, callback: (payload: any) => void) => {
      return eventBus.current.subscribeToDiaryEvent(eventType, callback);
    },

    // Subscrever a todos os eventos (debug)
    subscribeToAll: (callback: (event: DiaryEvent) => void) => {
      return eventBus.current.subscribeToAllEvents(callback);
    },

    // Status
    isActive: true, // Sempre ativo localmente
    listenerCount: (eventType?: DiaryEventType) => {
      return eventBus.current.getListenerCount(eventType);
    }
  };
}

export { DiaryEventBus };
