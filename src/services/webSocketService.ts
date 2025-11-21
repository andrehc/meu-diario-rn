import { useEffect, useRef } from 'react';

export type WebSocketEventType = 'diary_entry_created' | 'diary_entry_updated' | 'diary_entry_deleted';

export interface WebSocketMessage {
  type: WebSocketEventType;
  payload: {
    userId: number;
    entryId?: number;
    entry?: any;
  };
}

export class DiaryWebSocketService {
  private static instance: DiaryWebSocketService;
  private ws: WebSocket | null = null;
  private listeners: Map<string, Set<(data: any) => void>> = new Map();
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private isConnecting = false;

  private constructor() {}

  static getInstance(): DiaryWebSocketService {
    if (!DiaryWebSocketService.instance) {
      DiaryWebSocketService.instance = new DiaryWebSocketService();
    }
    return DiaryWebSocketService.instance;
  }

  connect(userId: number): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.ws?.readyState === WebSocket.OPEN) {
        resolve();
        return;
      }

      if (this.isConnecting) {
        setTimeout(() => resolve(), 100);
        return;
      }

      this.isConnecting = true;

      try {
        // Para desenvolvimento local - substitua pela URL do seu servidor
        const wsUrl = `ws://localhost:8080/diary?userId=${userId}`;
        
        this.ws = new WebSocket(wsUrl);

        this.ws.onopen = () => {
          console.log('✅ [WebSocket] Conectado ao servidor');
          this.reconnectAttempts = 0;
          this.isConnecting = false;
          resolve();
        };

        this.ws.onmessage = (event) => {
          try {
            const message: WebSocketMessage = JSON.parse(event.data);
            console.log('📨 [WebSocket] Mensagem recebida:', message);
            this.notifyListeners(message.type, message.payload);
          } catch (error) {
            console.error('❌ [WebSocket] Erro ao parsear mensagem:', error);
          }
        };

        this.ws.onclose = (event) => {
          console.log('🔌 [WebSocket] Conexão fechada:', event.code, event.reason);
          this.isConnecting = false;
          this.handleReconnect(userId);
        };

        this.ws.onerror = (error) => {
          console.error('❌ [WebSocket] Erro na conexão:', error);
          this.isConnecting = false;
          reject(error);
        };

      } catch (error) {
        this.isConnecting = false;
        reject(error);
      }
    });
  }

  private handleReconnect(userId: number) {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);
      
      console.log(`🔄 [WebSocket] Tentativa de reconexão ${this.reconnectAttempts}/${this.maxReconnectAttempts} em ${delay}ms`);
      
      setTimeout(() => {
        this.connect(userId).catch(console.error);
      }, delay);
    } else {
      console.error('❌ [WebSocket] Máximo de tentativas de reconexão atingido');
    }
  }

  subscribe(eventType: WebSocketEventType, callback: (data: any) => void): () => void {
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, new Set());
    }
    
    this.listeners.get(eventType)!.add(callback);
    
    // Retorna função para unsubscribe
    return () => {
      this.listeners.get(eventType)?.delete(callback);
    };
  }

  private notifyListeners(eventType: WebSocketEventType, data: any) {
    const callbacks = this.listeners.get(eventType);
    if (callbacks) {
      callbacks.forEach(callback => callback(data));
    }
  }

  send(message: WebSocketMessage) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    } else {
      console.warn('⚠️ [WebSocket] Tentativa de envio com conexão fechada');
    }
  }

  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.listeners.clear();
    this.reconnectAttempts = 0;
  }

  isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }
}

// Hook para usar WebSocket em componentes React
export function useWebSocket(userId: number | null) {
  const wsService = useRef(DiaryWebSocketService.getInstance());
  
  useEffect(() => {
    if (userId) {
      wsService.current.connect(userId).catch(console.error);
    }

    return () => {
      // Não desconecta automaticamente para manter conexão entre navegações
      // wsService.current.disconnect();
    };
  }, [userId]);

  return {
    subscribe: wsService.current.subscribe.bind(wsService.current),
    send: wsService.current.send.bind(wsService.current),
    isConnected: wsService.current.isConnected.bind(wsService.current),
    disconnect: wsService.current.disconnect.bind(wsService.current),
  };
}