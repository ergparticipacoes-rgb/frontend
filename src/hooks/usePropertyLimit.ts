import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import apiClient from '../utils/apiClient';
import { PropertyEventDispatcher, PropertyEventDetail } from '../utils/eventDispatcher';

interface LimitStats {
  planName: string;
  isUnlimited?: boolean;
  isActive: boolean;
  planExpired?: boolean;
  currentUsage: number;
  maxProperties: number;
  usagePercentage: number;
  remainingSlots: number;
  planStartDate?: string;
  planEndDate?: string;
  isNearLimit: boolean;
  isAtLimit: boolean;
  error?: string;
}

interface PublicationValidation {
  canPublish: boolean;
  reason?: string;
  details?: {
    currentCount: number;
    maxProperties: number;
    planName?: string;
    remainingSlots?: number;
  };
  suggestions?: string[];
}

export const usePropertyLimit = () => {
  const { user } = useAuth();
  const [limitStats, setLimitStats] = useState<LimitStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchLimitStats = useCallback(async () => {
    if (!user?.token || user.userType === 'admin') {
      setLimitStats(null);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const data = await apiClient.get('/properties/limit-stats');
      setLimitStats(data);
    } catch (err) {
      console.error('Erro ao buscar estatísticas de limite:', err);
      setError('Erro ao carregar informações do plano');
      setLimitStats(null);
    } finally {
      setLoading(false);
    }
  }, [user]);

  const checkCanPublish = useCallback(async (): Promise<PublicationValidation> => {
    if (!user?.token) {
      return {
        canPublish: false,
        reason: 'Usuário não autenticado'
      };
    }

    if (user.userType === 'admin') {
      return {
        canPublish: true,
        reason: 'Administrador - publicações ilimitadas'
      };
    }

    // Se já temos os dados em cache, usar eles primeiro
    if (limitStats) {
      if (!limitStats.isActive || limitStats.planExpired) {
        return {
          canPublish: false,
          reason: limitStats.planExpired ? 'Plano expirado' : 'Nenhum plano ativo',
          suggestions: [
            limitStats.planExpired 
              ? 'Renove seu plano para continuar publicando'
              : 'Contrate um plano para começar a publicar propriedades'
          ]
        };
      }

      if (limitStats.isAtLimit) {
        return {
          canPublish: false,
          reason: 'Limite de propriedades atingido',
          details: {
            currentCount: limitStats.currentUsage,
            maxProperties: limitStats.maxProperties,
            planName: limitStats.planName,
            remainingSlots: 0
          },
          suggestions: [
            'Desative propriedades antigas para liberar espaço',
            'Faça upgrade do seu plano para mais propriedades'
          ]
        };
      }

      return {
        canPublish: true,
        reason: 'Limite disponível',
        details: {
          currentCount: limitStats.currentUsage,
          maxProperties: limitStats.maxProperties,
          planName: limitStats.planName,
          remainingSlots: limitStats.remainingSlots
        }
      };
    }

    // Se não temos dados em cache, buscar do servidor
    try {
      const stats = await apiClient.get('/properties/limit-stats');
      
      if (!stats.isActive || stats.planExpired) {
        return {
          canPublish: false,
          reason: stats.planExpired ? 'Plano expirado' : 'Nenhum plano ativo',
          suggestions: [
            stats.planExpired 
              ? 'Renove seu plano para continuar publicando'
              : 'Contrate um plano para começar a publicar propriedades'
          ]
        };
      }

      if (stats.isAtLimit) {
        return {
          canPublish: false,
          reason: 'Limite de propriedades atingido',
          details: {
            currentCount: stats.currentUsage,
            maxProperties: stats.maxProperties,
            planName: stats.planName,
            remainingSlots: 0
          },
          suggestions: [
            'Desative propriedades antigas para liberar espaço',
            'Faça upgrade do seu plano para mais propriedades'
          ]
        };
      }

      return {
        canPublish: true,
        reason: 'Limite disponível',
        details: {
          currentCount: stats.currentUsage,
          maxProperties: stats.maxProperties,
          planName: stats.planName,
          remainingSlots: stats.remainingSlots
        }
      };

    } catch (err) {
      return {
        canPublish: false,
        reason: 'Erro ao verificar limite',
        suggestions: ['Tente novamente em alguns instantes']
      };
    }
  }, [user, limitStats]);

  const togglePropertyActive = useCallback(async (propertyId: string) => {
    try {
      const result = await apiClient.put(`/properties/${propertyId}/toggle-active`);
      
      // Atualizar stats após mudança
      if (result.limitInfo) {
        setLimitStats(result.limitInfo);
      } else {
        await fetchLimitStats();
      }
      
      return {
        success: true,
        message: result.message,
        property: result.property
      };
    } catch (err: any) {
      return {
        success: false,
        error: err?.response?.data?.error || 'Erro ao alterar status da propriedade',
        details: err?.response?.data?.details
      };
    }
  }, [fetchLimitStats]);

  const refreshStats = useCallback(() => {
    fetchLimitStats();
  }, [fetchLimitStats]);

  const syncPropertyCount = useCallback(async () => {
    if (!user?.token || user.userType === 'admin') {
      return { success: false, error: 'Não disponível para administradores' };
    }

    try {
      setLoading(true);
      const result = await apiClient.post('/properties/sync-count');
      
      // Atualizar stats com os dados retornados
      if (result.stats) {
        setLimitStats(result.stats);
      }
      
      // Usar o PropertyEventDispatcher
      PropertyEventDispatcher.propertyCountSynced({
        syncResult: result.syncResult,
        limitInfo: result.stats,
        userId: user._id
      });
      
      console.log('[SYNC] Contador sincronizado:', result.syncResult);
      
      return {
        success: true,
        message: result.message,
        syncResult: result.syncResult
      };
    } catch (err: any) {
      console.error('Erro ao sincronizar contador:', err);
      return {
        success: false,
        error: err?.response?.data?.error || 'Erro ao sincronizar contador'
      };
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Auto-fetch stats quando o user muda
  useEffect(() => {
    fetchLimitStats();
  }, [fetchLimitStats]);

  // Auto-refresh com frequência adaptativa e listeners de eventos
  useEffect(() => {
    if (!user?.token || user.userType === 'admin') return;

    // Determinar frequência de refresh baseada na atividade
    const getRefreshInterval = () => {
      if (!limitStats) return 5 * 60 * 1000; // 5 minutos se não há dados
      
      const { currentUsage, maxProperties, usagePercentage } = limitStats;
      
      // Refresh mais frequente se:
      // - Usuário está próximo do limite (>80%)
      // - Usuário atingiu o limite
      // - Usuário tem poucas propriedades (primeiros usos)
      if (usagePercentage >= 80 || currentUsage >= maxProperties || currentUsage <= 3) {
        return 30 * 1000; // 30 segundos
      }
      
      return 5 * 60 * 1000; // 5 minutos
    };

    const interval = setInterval(() => {
      console.log('[AUTO_REFRESH] Atualizando estatísticas de limite');
      fetchLimitStats();
    }, getRefreshInterval());

    // Usar PropertyEventDispatcher para gerenciar eventos
    const removeEventListeners = PropertyEventDispatcher.addPropertyEventListeners({
      onPropertyCountSynced: (detail: PropertyEventDetail) => {
        console.log('[EVENT] Recebido evento propertyCountSynced:', detail);
        if (detail.limitInfo) {
          setLimitStats(detail.limitInfo);
        } else {
          fetchLimitStats();
        }
      },
      onPropertyCreated: (detail: PropertyEventDetail) => {
        console.log('[EVENT] Recebido evento propertyCreated:', detail);
        if (detail.limitInfo) {
          setLimitStats(detail.limitInfo);
        } else {
          fetchLimitStats();
        }
      },
      onPropertyToggled: (detail: PropertyEventDetail) => {
        console.log('[EVENT] Recebido evento propertyToggled:', detail);
        if (detail.limitInfo) {
          setLimitStats(detail.limitInfo);
        } else {
          fetchLimitStats();
        }
      },
      onPropertyDeleted: (detail: PropertyEventDetail) => {
        console.log('[EVENT] Recebido evento propertyDeleted:', detail);
        if (detail.limitInfo) {
          setLimitStats(detail.limitInfo);
        } else {
          fetchLimitStats();
        }
      }
    });

    return () => {
      clearInterval(interval);
      removeEventListeners();
    };
  }, [user, fetchLimitStats, limitStats]);

  return {
    limitStats,
    loading,
    error,
    fetchLimitStats,
    checkCanPublish,
    togglePropertyActive,
    refreshStats,
    syncPropertyCount,
    
    // Computed values para facilitar o uso
    canPublish: limitStats ? (
      limitStats.isUnlimited || 
      (limitStats.isActive && !limitStats.planExpired && !limitStats.isAtLimit)
    ) : false,
    
    isNearLimit: limitStats?.isNearLimit || false,
    isAtLimit: limitStats?.isAtLimit || false,
    hasActivePlan: limitStats?.isActive && !limitStats?.planExpired,
    
    // Status messages
    getStatusMessage: () => {
      if (!limitStats) return 'Carregando informações do plano...';
      if (limitStats.error) return limitStats.error;
      if (limitStats.planExpired) return 'Plano expirado';
      if (!limitStats.isActive) return 'Nenhum plano ativo';
      if (limitStats.isUnlimited) return 'Publicações ilimitadas';
      if (limitStats.isAtLimit) return 'Limite atingido';
      if (limitStats.isNearLimit) return 'Próximo ao limite';
      return 'Limite em dia';
    },
    
    getUsageText: () => {
      if (!limitStats || limitStats.isUnlimited) return '';
      return `${limitStats.currentUsage}/${limitStats.maxProperties}`;
    },
    
    getRemainingText: () => {
      if (!limitStats || limitStats.isUnlimited) return '';
      return `${limitStats.remainingSlots} restantes`;
    }
  };
};