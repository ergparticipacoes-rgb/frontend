import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { usePropertyLimit } from '../hooks/usePropertyLimit';

interface NotificationSettings {
  enabled: boolean;
  showNearLimit: boolean;
  showAtLimit: boolean;
  showExpiredPlan: boolean;
  showNoPlan: boolean;
  frequency: 'always' | 'once-per-session' | 'daily' | 'weekly';
  position: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center';
}

interface PropertyLimitNotificationContextType {
  settings: NotificationSettings;
  updateSettings: (settings: Partial<NotificationSettings>) => void;
  dismissedNotifications: string[];
  dismissNotification: (key: string) => void;
  shouldShowNotification: (type: 'near-limit' | 'at-limit' | 'expired-plan' | 'no-plan') => boolean;
  resetDismissedNotifications: () => void;
}

const defaultSettings: NotificationSettings = {
  enabled: true,
  showNearLimit: true,
  showAtLimit: true,
  showExpiredPlan: true,
  showNoPlan: true,
  frequency: 'once-per-session',
  position: 'top-right'
};

const PropertyLimitNotificationContext = createContext<PropertyLimitNotificationContextType | undefined>(undefined);

interface PropertyLimitNotificationProviderProps {
  children: React.ReactNode;
}

export const PropertyLimitNotificationProvider: React.FC<PropertyLimitNotificationProviderProps> = ({ children }) => {
  const { user } = useAuth();
  const { limitStats } = usePropertyLimit();
  const [settings, setSettings] = useState<NotificationSettings>(() => {
    const saved = localStorage.getItem('propertyLimitNotificationSettings');
    return saved ? { ...defaultSettings, ...JSON.parse(saved) } : defaultSettings;
  });
  
  const [dismissedNotifications, setDismissedNotifications] = useState<string[]>(() => {
    const saved = localStorage.getItem('dismissedPropertyLimitNotifications');
    return saved ? JSON.parse(saved) : [];
  });

  // Salvar configurações no localStorage
  useEffect(() => {
    localStorage.setItem('propertyLimitNotificationSettings', JSON.stringify(settings));
  }, [settings]);

  // Salvar notificações dispensadas no localStorage
  useEffect(() => {
    localStorage.setItem('dismissedPropertyLimitNotifications', JSON.stringify(dismissedNotifications));
  }, [dismissedNotifications]);

  // Limpar notificações dispensadas quando mudar de usuário
  useEffect(() => {
    if (user) {
      const userKey = `dismissed_${user._id}`;
      const saved = localStorage.getItem(userKey);
      setDismissedNotifications(saved ? JSON.parse(saved) : []);
    }
  }, [user]);

  // Salvar por usuário
  useEffect(() => {
    if (user && dismissedNotifications.length > 0) {
      const userKey = `dismissed_${user._id}`;
      localStorage.setItem(userKey, JSON.stringify(dismissedNotifications));
    }
  }, [user, dismissedNotifications]);

  const updateSettings = (newSettings: Partial<NotificationSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  };

  const dismissNotification = (key: string) => {
    const now = new Date().getTime();
    const dismissalKey = `${key}_${now}`;
    
    setDismissedNotifications(prev => {
      const newDismissed = [...prev, dismissalKey];
      
      // Limpar dispensas antigas baseado na frequência
      if (settings.frequency === 'daily') {
        const oneDayAgo = now - 24 * 60 * 60 * 1000;
        return newDismissed.filter(item => {
          const timestamp = parseInt(item.split('_').pop() || '0');
          return timestamp > oneDayAgo;
        });
      } else if (settings.frequency === 'weekly') {
        const oneWeekAgo = now - 7 * 24 * 60 * 60 * 1000;
        return newDismissed.filter(item => {
          const timestamp = parseInt(item.split('_').pop() || '0');
          return timestamp > oneWeekAgo;
        });
      }
      
      return newDismissed;
    });
  };

  const shouldShowNotification = (type: 'near-limit' | 'at-limit' | 'expired-plan' | 'no-plan'): boolean => {
    if (!settings.enabled || !user || user.userType === 'admin' || !limitStats) {
      return false;
    }

    // Verificar se o tipo específico está habilitado
    switch (type) {
      case 'near-limit':
        if (!settings.showNearLimit || !limitStats.isNearLimit) return false;
        break;
      case 'at-limit':
        if (!settings.showAtLimit || !limitStats.isAtLimit) return false;
        break;
      case 'expired-plan':
        if (!settings.showExpiredPlan || !limitStats.planExpired) return false;
        break;
      case 'no-plan':
        if (!settings.showNoPlan || limitStats.isActive) return false;
        break;
    }

    // Verificar frequência de dispensas
    const now = new Date().getTime();
    const baseKey = `${type}_${limitStats.currentUsage}_${limitStats.maxProperties}`;
    
    switch (settings.frequency) {
      case 'always':
        return true;
      
      case 'once-per-session':
        return !dismissedNotifications.some(item => item.startsWith(baseKey));
      
      case 'daily':
        const oneDayAgo = now - 24 * 60 * 60 * 1000;
        return !dismissedNotifications.some(item => {
          if (!item.startsWith(baseKey)) return false;
          const timestamp = parseInt(item.split('_').pop() || '0');
          return timestamp > oneDayAgo;
        });
      
      case 'weekly':
        const oneWeekAgo = now - 7 * 24 * 60 * 60 * 1000;
        return !dismissedNotifications.some(item => {
          if (!item.startsWith(baseKey)) return false;
          const timestamp = parseInt(item.split('_').pop() || '0');
          return timestamp > oneWeekAgo;
        });
      
      default:
        return true;
    }
  };

  const resetDismissedNotifications = () => {
    setDismissedNotifications([]);
    if (user) {
      const userKey = `dismissed_${user._id}`;
      localStorage.removeItem(userKey);
    }
  };

  const value: PropertyLimitNotificationContextType = {
    settings,
    updateSettings,
    dismissedNotifications,
    dismissNotification,
    shouldShowNotification,
    resetDismissedNotifications
  };

  return (
    <PropertyLimitNotificationContext.Provider value={value}>
      {children}
    </PropertyLimitNotificationContext.Provider>
  );
};

export const usePropertyLimitNotification = () => {
  const context = useContext(PropertyLimitNotificationContext);
  if (context === undefined) {
    throw new Error('usePropertyLimitNotification must be used within a PropertyLimitNotificationProvider');
  }
  return context;
};

export default PropertyLimitNotificationContext;