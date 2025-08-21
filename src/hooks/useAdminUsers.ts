import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import apiClient from '../utils/apiClient';

interface User {
  _id: string;
  name: string;
  email: string;
  userType: 'admin' | 'corretoria' | 'particular';
  isApproved: boolean;
  createdAt: string;
  phone?: string;
  city?: string;
  creci?: string;
  activePlan?: {
    _id: string;
    name: string;
    maxProperties: number;
    price: number;
  };
  planStartDate?: string;
  planEndDate?: string;
  publishedProperties?: number;
}

interface RegistrationRequest {
  _id: string;
  name: string;
  email: string;
  userType: 'corretoria' | 'particular';
  phone: string;
  city: string;
  creci?: string;
  stockSize?: string;
  isApproved: boolean;
  createdAt: string;
}

export const useAdminUsers = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [registrationRequests, setRegistrationRequests] = useState<RegistrationRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const fetchUsers = async (showLoading = true) => {
    if (!user?.token) return;
    
    if (showLoading) {
      setLoading(true);
    }
    setError(null);
    
    try {
      const data = await apiClient.get(`/users?refresh=true&t=${Date.now()}`);
      setUsers(data.map((u: any) => ({ ...u, id: u._id })));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
      console.error('Erro ao buscar usuários:', err);
    } finally {
      if (showLoading) {
        setLoading(false);
      }
    }
  };

  const fetchRegistrationRequests = async (showLoading = true) => {
    if (!user?.token) return;
    
    if (showLoading) {
      setLoading(true);
    }
    setError(null);
    
    try {
      const data = await apiClient.get('/users/registration-requests');
      setRegistrationRequests(data.map((r: any) => ({ ...r, id: r._id })));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
      console.error('Erro ao buscar solicitações:', err);
    } finally {
      if (showLoading) {
        setLoading(false);
      }
    }
  };

  const approveUser = async (userId: string, password?: string) => {
    if (!user?.token) return false;
    
    try {
      const body = password ? { password } : {};
      
      await apiClient.put(`/users/approve-request/${userId}`, body);
      
      // Atualizar listas locais imediatamente
      await Promise.all([
        fetchUsers(false),
        fetchRegistrationRequests(false)
      ]);
      
      // Forçar uma segunda atualização após um pequeno delay para garantir sincronização
      setTimeout(async () => {
        await Promise.all([
          fetchUsers(false),
          fetchRegistrationRequests(false)
        ]);
      }, 500);
      
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
      return false;
    }
  };

  const rejectUser = async (userId: string) => {
    if (!user?.token) return false;
    
    try {
      await apiClient.put(`/users/reject-request/${userId}`);
      
      // Atualizar listas locais imediatamente
      await Promise.all([
        fetchUsers(false),
        fetchRegistrationRequests(false)
      ]);
      
      // Forçar uma segunda atualização após um pequeno delay para garantir sincronização
      setTimeout(async () => {
        await Promise.all([
          fetchUsers(false),
          fetchRegistrationRequests(false)
        ]);
      }, 500);
      
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
      return false;
    }
  };

  const updateUser = async (userId: string, userData: Partial<User>) => {
    if (!user?.token) return false;
    
    try {
      await apiClient.put(`/users/${userId}`, userData);
      
      await fetchUsers(false);
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
      return false;
    }
  };

  const deleteUser = async (userId: string) => {
    if (!user?.token) return false;
    
    try {
      await apiClient.delete(`/users/${userId}`);
      
      await fetchUsers(false);
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
      return false;
    }
  };

  useEffect(() => {
    if (user?.token && user?.userType === 'admin') {
      // Primeira carga com loading
      fetchUsers(true);
      fetchRegistrationRequests(true);
      
      // Configurar polling para atualizações em tempo real
      const interval = setInterval(() => {
        // Atualizações automáticas sem loading
        fetchUsers(false);
        fetchRegistrationRequests(false);
      }, 1000); // Atualizar a cada 1 segundo para máxima responsividade
      
      return () => clearInterval(interval);
    }
  }, [user]);

  const assignPlanToUser = async (userId: string, planId: string) => {
    if (!user?.token) return false;
    
    try {
      await apiClient.put(`/plans/assign/${userId}`, { planId });
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
      return false;
    }
  };

  const removePlanFromUser = async (userId: string) => {
    if (!user?.token) return false;
    
    try {
      await apiClient.delete(`/plans/remove/${userId}`);
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
      return false;
    }
  };

  return {
    users,
    registrationRequests,
    loading,
    error,
    fetchUsers,
    fetchRegistrationRequests,
    approveUser,
    rejectUser,
    updateUser,
    deleteUser,
    assignPlanToUser,
    removePlanFromUser
  };
};