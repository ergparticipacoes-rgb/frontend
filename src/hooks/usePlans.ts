import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import apiClient from '../utils/apiClient';

export interface Plan {
  _id: string;
  name: string;
  description: string;
  maxProperties: number;
  price: number;
  duration: number;
  features: string[];
  isActive: boolean;
  createdAt: string;
}

export const usePlans = () => {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const fetchPlans = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Tentar buscar planos - se for admin usa rota admin, senão usa rota pública
      const endpoint = user?.userType === 'admin' ? '/plans/admin/all' : '/plans';
      const data = user?.token 
        ? await apiClient.get(endpoint)
        : await apiClient.get('/plans', { skipAuth: true });
      
      // Verificar se data é um objeto com propriedade plans ou um array direto
      const plansArray = Array.isArray(data) ? data : (data.plans || []);
      setPlans(plansArray);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  };

  const assignPlanToUser = async (userId: string, planId: string) => {
    if (!user?.token) return false;
    
    try {
      await apiClient.put(`/plans/assign/${userId}`, { planId });
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao atribuir plano');
      return false;
    }
  };

  const removePlanFromUser = async (userId: string) => {
    if (!user?.token) return false;
    
    try {
      await apiClient.delete(`/plans/remove/${userId}`);
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao remover plano');
      return false;
    }
  };

  useEffect(() => {
    fetchPlans();
  }, [user?.userType]);

  return {
    plans,
    loading,
    error,
    fetchPlans,
    assignPlanToUser,
    removePlanFromUser,
  };
};