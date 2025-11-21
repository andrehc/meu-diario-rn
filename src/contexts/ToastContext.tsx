import React, { createContext, useContext } from 'react';
import { Toast } from '../components/ui/Toast';
import { useToast } from '../hooks/useToast';

interface ToastContextType {
  showSuccess: (title: string, message?: string, duration?: number) => void;
  showError: (title: string, message?: string, duration?: number) => void;
  showInfo: (title: string, message?: string, duration?: number) => void;
  showWarning: (title: string, message?: string, duration?: number) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const toast = useToast();

  const contextValue: ToastContextType = {
    showSuccess: toast.showSuccess,
    showError: toast.showError,
    showInfo: toast.showInfo,
    showWarning: toast.showWarning,
  };

  return (
    <ToastContext.Provider value={contextValue}>
      {children}
      
      {/* Toast Component Global */}
      {toast.toastConfig && (
        <Toast
          visible={toast.visible}
          type={toast.toastConfig.type}
          title={toast.toastConfig.title}
          message={toast.toastConfig.message}
          duration={toast.toastConfig.duration}
          onHide={toast.hideToast}
          actionText={toast.toastConfig.actionText}
          onActionPress={toast.toastConfig.onActionPress}
        />
      )}
    </ToastContext.Provider>
  );
}

export function useGlobalToast() {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error('useGlobalToast must be used within a ToastProvider');
  }
  return context;
}