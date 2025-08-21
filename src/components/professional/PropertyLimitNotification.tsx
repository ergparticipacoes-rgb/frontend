import React, { useState, useEffect } from 'react';
import { X, AlertTriangle, Info, TrendingUp, CreditCard } from 'lucide-react';
import { usePropertyLimit } from '../../hooks/usePropertyLimit';

interface NotificationConfig {
  showNearLimit: boolean;
  showAtLimit: boolean;
  showExpiredPlan: boolean;
  showNoPlan: boolean;
  autoDismiss: boolean;
  dismissAfter: number; // em segundos
}

const defaultConfig: NotificationConfig = {
  showNearLimit: true,
  showAtLimit: true,
  showExpiredPlan: true,
  showNoPlan: true,
  autoDismiss: true,
  dismissAfter: 10
};

interface PropertyLimitNotificationProps {
  config?: Partial<NotificationConfig>;
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center';
  className?: string;
}

const PropertyLimitNotification: React.FC<PropertyLimitNotificationProps> = ({
  config = {},
  position = 'top-right',
  className = ''
}) => {
  const finalConfig = { ...defaultConfig, ...config };
  const { limitStats, hasActivePlan } = usePropertyLimit();
  const [dismissed, setDismissed] = useState<string[]>([]);
  const [isVisible, setIsVisible] = useState(false);

  // Gerar chave única para a notificação atual
  const getNotificationKey = () => {
    if (!limitStats) return null;
    
    if (!limitStats.isActive || limitStats.planExpired) {
      return `no-plan-${limitStats.planExpired ? 'expired' : 'none'}`;
    }
    
    if (limitStats.isAtLimit) {
      return `at-limit-${limitStats.currentUsage}-${limitStats.maxProperties}`;
    }
    
    if (limitStats.isNearLimit) {
      return `near-limit-${limitStats.currentUsage}-${limitStats.maxProperties}`;
    }
    
    return null;
  };

  const notificationKey = getNotificationKey();
  const isDismissed = notificationKey ? dismissed.includes(notificationKey) : true;

  // Determinar se deve mostrar notificação
  const shouldShow = () => {
    if (!limitStats || isDismissed) return false;

    if (!limitStats.isActive || limitStats.planExpired) {
      return finalConfig.showNoPlan || finalConfig.showExpiredPlan;
    }

    if (limitStats.isAtLimit && finalConfig.showAtLimit) {
      return true;
    }

    if (limitStats.isNearLimit && finalConfig.showNearLimit) {
      return true;
    }

    return false;
  };

  // Auto-dismiss
  useEffect(() => {
    if (!shouldShow() || !finalConfig.autoDismiss) return;

    const timer = setTimeout(() => {
      if (notificationKey) {
        setDismissed(prev => [...prev, notificationKey]);
      }
    }, finalConfig.dismissAfter * 1000);

    return () => clearTimeout(timer);
  }, [notificationKey, finalConfig.autoDismiss, finalConfig.dismissAfter, shouldShow]);

  // Show/hide animation
  useEffect(() => {
    if (shouldShow()) {
      setIsVisible(true);
    } else {
      setIsVisible(false);
    }
  }, [shouldShow()]);

  const handleDismiss = () => {
    if (notificationKey) {
      setDismissed(prev => [...prev, notificationKey]);
    }
  };

  const getPositionClasses = () => {
    const base = 'fixed z-50';
    switch (position) {
      case 'top-right':
        return `${base} top-4 right-4`;
      case 'top-left':
        return `${base} top-4 left-4`;
      case 'bottom-right':
        return `${base} bottom-4 right-4`;
      case 'bottom-left':
        return `${base} bottom-4 left-4`;
      case 'top-center':
        return `${base} top-4 left-1/2 transform -translate-x-1/2`;
      default:
        return `${base} top-4 right-4`;
    }
  };

  const getNotificationContent = () => {
    if (!limitStats) return null;

    // Sem plano ativo
    if (!limitStats.isActive || limitStats.planExpired) {
      const isExpired = limitStats.planExpired;
      return {
        type: 'error' as const,
        icon: <AlertTriangle className="w-5 h-5" />,
        title: isExpired ? 'Plano Expirado' : 'Sem Plano Ativo',
        message: isExpired 
          ? 'Seu plano expirou. Renove para continuar publicando propriedades.'
          : 'Você precisa contratar um plano para publicar propriedades.',
        action: {
          text: isExpired ? 'Renovar Plano' : 'Ver Planos',
          onClick: () => {
            // Navegar para página de planos
            window.location.href = '/plans';
          }
        }
      };
    }

    // Limite atingido
    if (limitStats.isAtLimit) {
      return {
        type: 'error' as const,
        icon: <AlertTriangle className="w-5 h-5" />,
        title: 'Limite Atingido',
        message: `Você atingiu o limite de ${limitStats.maxProperties} propriedades do seu plano ${limitStats.planName}.`,
        subMessage: 'Desative propriedades antigas ou faça upgrade do seu plano.',
        action: {
          text: 'Fazer Upgrade',
          onClick: () => {
            window.location.href = '/plans';
          }
        }
      };
    }

    // Próximo do limite
    if (limitStats.isNearLimit) {
      return {
        type: 'warning' as const,
        icon: <Info className="w-5 h-5" />,
        title: 'Próximo do Limite',
        message: `Você está usando ${limitStats.currentUsage}/${limitStats.maxProperties} propriedades do seu plano ${limitStats.planName}.`,
        subMessage: `Restam apenas ${limitStats.remainingSlots} publicações disponíveis.`,
        action: {
          text: 'Ver Planos',
          onClick: () => {
            window.location.href = '/plans';
          }
        }
      };
    }

    return null;
  };

  const content = getNotificationContent();

  if (!shouldShow() || !content || !isVisible) {
    return null;
  }

  const bgColor = content.type === 'error' ? 'bg-red-50 border-red-200' : 'bg-yellow-50 border-yellow-200';
  const textColor = content.type === 'error' ? 'text-red-800' : 'text-yellow-800';
  const iconColor = content.type === 'error' ? 'text-red-600' : 'text-yellow-600';
  const buttonColor = content.type === 'error' ? 'bg-red-600 hover:bg-red-700' : 'bg-yellow-600 hover:bg-yellow-700';

  return (
    <div className={`${getPositionClasses()} max-w-sm w-full ${className}`}>
      <div className={`${bgColor} border rounded-lg shadow-lg p-4 transition-all duration-300 ${
        isVisible ? 'transform translate-y-0 opacity-100' : 'transform -translate-y-2 opacity-0'
      }`}>
        <div className="flex items-start space-x-3">
          <div className={`flex-shrink-0 ${iconColor}`}>
            {content.icon}
          </div>
          
          <div className="flex-1 min-w-0">
            <h4 className={`text-sm font-medium ${textColor}`}>
              {content.title}
            </h4>
            <p className={`text-sm ${textColor} mt-1`}>
              {content.message}
            </p>
            {content.subMessage && (
              <p className={`text-xs ${textColor} mt-1 opacity-90`}>
                {content.subMessage}
              </p>
            )}
          </div>
          
          <button
            onClick={handleDismiss}
            className={`flex-shrink-0 ${textColor} hover:opacity-75`}
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        
        {content.action && (
          <div className="mt-3 flex justify-end">
            <button
              onClick={content.action.onClick}
              className={`inline-flex items-center px-3 py-1.5 text-xs font-medium text-white ${buttonColor} rounded-md transition-colors`}
            >
              <CreditCard className="w-3 h-3 mr-1" />
              {content.action.text}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default PropertyLimitNotification;