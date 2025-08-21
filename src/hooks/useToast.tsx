import { useState, useCallback } from 'react';
import { ToastType } from '../components/Toast';

export interface ToastData {
  id: string;
  message: string;
  type: ToastType;
}

export const useToast = () => {
  const [toasts, setToasts] = useState<ToastData[]>([]);

  const showToast = useCallback((message: string, type: ToastType = 'info') => {
    const id = Date.now().toString();
    const newToast: ToastData = { id, message, type };
    
    setToasts(prev => [...prev, newToast]);
    
    return id;
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  const success = useCallback((message: string) => {
    return showToast(message, 'success');
  }, [showToast]);

  const error = useCallback((message: string) => {
    return showToast(message, 'error');
  }, [showToast]);

  const info = useCallback((message: string) => {
    return showToast(message, 'info');
  }, [showToast]);

  const warning = useCallback((message: string) => {
    return showToast(message, 'warning');
  }, [showToast]);

  return {
    toasts,
    showToast,
    removeToast,
    success,
    error,
    info,
    warning
  };
};