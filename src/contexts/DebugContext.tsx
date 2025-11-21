import React, { createContext, useContext, useState } from 'react';

interface DebugContextType {
  isEventBusDebugEnabled: boolean;
  toggleEventBusDebug: () => void;
}

const DebugContext = createContext<DebugContextType | undefined>(undefined);

export function DebugProvider({ children }: { children: React.ReactNode }) {
  const [isEventBusDebugEnabled, setIsEventBusDebugEnabled] = useState(false);

  const toggleEventBusDebug = () => {
    setIsEventBusDebugEnabled(prev => !prev);
    console.log('🐛 [Debug] EventBus Debug:', !isEventBusDebugEnabled ? 'HABILITADO' : 'DESABILITADO');
  };

  return (
    <DebugContext.Provider value={{
      isEventBusDebugEnabled,
      toggleEventBusDebug,
    }}>
      {children}
    </DebugContext.Provider>
  );
}

export function useDebug() {
  const context = useContext(DebugContext);
  if (context === undefined) {
    throw new Error('useDebug must be used within a DebugProvider');
  }
  return context;
}