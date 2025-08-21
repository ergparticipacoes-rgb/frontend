import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import apiClient from '../utils/apiClient';

interface PlanStatusUser {
  id: string;
  name: string;
  email: string;
  userType: string;
  publishedProperties: number;
}

interface Plan {
  id: string;
  name: string;
  description: string;
  maxProperties: number;
  features: string[];
  price: number;
  duration: number;
}

interface PlanDates {
  startDate: string | null;
  endDate: string | null;
  isActive: boolean;
  daysRemaining: number;
}

interface PlanLimits {
  canPublishProperty: boolean;
  reason: string | null;
  propertiesUsed: number;
  propertiesLimit: number;
  propertiesRemaining: number;
}

interface PlanWarning {
  type: string;
  message: string;
  severity: 'low' | 'medium' | 'high';
}

interface PlanStatus {
  user: PlanStatusUser;
  plan: Plan | null;
  planDates: PlanDates;
  limits: PlanLimits;
  warnings: PlanWarning[];
}

export const usePlanStatus = () => {
  const [planStatus, setPlanStatus] = useState<PlanStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const fetchPlanStatus = useCallback(async () => {
    if (!user?.token) {
      setError('Usuário não autenticado');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const data = await apiClient.get('/users/plan-status');
      setPlanStatus(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      setError(errorMessage);
      console.error('Erro ao buscar status do plano:', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Buscar status do plano quando o hook é montado ou o usuário muda
  useEffect(() => {
    if (user?.token) {
      fetchPlanStatus();
    }
  }, [fetchPlanStatus, user?.token]);

  // Auto-refresh a cada 30 segundos para manter dados atualizados
  useEffect(() => {
    if (!user?.token) return;

    const interval = setInterval(() => {
      fetchPlanStatus();
    }, 30000); // 30 segundos

    return () => clearInterval(interval);
  }, [fetchPlanStatus, user?.token]);

  // Adicionar listener para mudanças no localStorage (para detectar atualizações de plano)
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'user' && e.newValue) {
        // Quando o user for atualizado no localStorage, refetch o status do plano
        fetchPlanStatus();
      }
    };

    window.addEventListener('storage', handleStorageChange);

    // Também escutar eventos customizados para atualizações de plano
    const handlePlanUpdate = () => {
      fetchPlanStatus();
    };
    
    window.addEventListener('planUpdated', handlePlanUpdate);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('planUpdated', handlePlanUpdate);
    };
  }, [fetchPlanStatus]);

  // Função para verificar se o usuário pode publicar propriedades
  const canPublishProperty = useCallback(() => {
    if (!planStatus) return { allowed: false, reason: 'Status do plano não carregado' };
    return {
      allowed: planStatus.limits.canPublishProperty,
      reason: planStatus.limits.reason
    };
  }, [planStatus]);

  // Função para obter avisos críticos (alta severidade)
  const getCriticalWarnings = useCallback(() => {
    if (!planStatus) return [];
    return planStatus.warnings.filter(warning => warning.severity === 'high');
  }, [planStatus]);

  // Função para obter avisos de atenção (média severidade)
  const getAttentionWarnings = useCallback(() => {
    if (!planStatus) return [];
    return planStatus.warnings.filter(warning => warning.severity === 'medium');
  }, [planStatus]);

  // Função para verificar se o plano está próximo do vencimento
  const isPlanExpiringSoon = useCallback(() => {
    if (!planStatus?.planDates.isActive) return false;
    return planStatus.planDates.daysRemaining <= 7;
  }, [planStatus]);

  // Função para verificar se está próximo do limite de propriedades
  const isNearPropertyLimit = useCallback(() => {
    if (!planStatus?.plan) return false;
    return planStatus.limits.propertiesRemaining <= 2;
  }, [planStatus]);

  // Função para obter porcentagem de uso do plano
  const getUsagePercentage = useCallback(() => {
    if (!planStatus?.plan) return 0;
    const { propertiesUsed, propertiesLimit } = planStatus.limits;
    return propertiesLimit > 0 ? Math.round((propertiesUsed / propertiesLimit) * 100) : 0;
  }, [planStatus]);

  // Função para formatar dias restantes
  const formatDaysRemaining = useCallback(() => {
    if (!planStatus?.planDates.isActive) return 'Plano inativo';
    const days = planStatus.planDates.daysRemaining;
    if (days === 0) return 'Expira hoje';
    if (days === 1) return '1 dia restante';
    return `${days} dias restantes`;
  }, [planStatus]);

  return {
    planStatus,
    loading,
    error,
    fetchPlanStatus,
    
    // Funções utilitárias
    canPublishProperty,
    getCriticalWarnings,
    getAttentionWarnings,
    isPlanExpiringSoon,
    isNearPropertyLimit,
    getUsagePercentage,
    formatDaysRemaining,
    
    // Dados derivados para facilitar o uso
    hasActivePlan: planStatus?.planDates.isActive || false,
    planName: planStatus?.plan?.name || null,
    propertiesUsed: planStatus?.limits.propertiesUsed || 0,
    propertiesLimit: planStatus?.limits.propertiesLimit || 0,
    propertiesRemaining: planStatus?.limits.propertiesRemaining || 0,
    daysRemaining: planStatus?.planDates.daysRemaining || 0,
    hasWarnings: (planStatus?.warnings.length || 0) > 0
  };
};

export default usePlanStatus;