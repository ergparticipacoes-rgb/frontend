import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { API_CONFIG } from '../config/api';

interface PropertyRequest {
  _id: string;
  name: string;
  email: string;
  phone: string;
  city: string;
  propertyType: string;
  requestType: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  processedBy?: string;
  processedAt?: string;
}

export const useAdminPropertyRequests = () => {
  const [propertyRequests, setPropertyRequests] = useState<PropertyRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const fetchPropertyRequests = async () => {
    if (!user?.token) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}/property-requests`, {
        headers: {
          'Authorization': `Bearer ${user.token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Erro ao carregar solicitações de propriedades');
      }

      const data = await response.json();
      setPropertyRequests(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  };

  const approvePropertyRequest = async (requestId: string) => {
    if (!user?.token) return false;
    
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}/property-requests/${requestId}/approve`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${user.token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Erro ao aprovar solicitação');
      }

      // Atualizar a lista local
      setPropertyRequests(prev => 
        prev.map(request => 
          request._id === requestId 
            ? { ...request, status: 'approved' as const, processedAt: new Date().toISOString() }
            : request
        )
      );
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao aprovar solicitação');
      return false;
    }
  };

  const rejectPropertyRequest = async (requestId: string) => {
    if (!user?.token) return false;
    
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}/property-requests/${requestId}/reject`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${user.token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Erro ao rejeitar solicitação');
      }

      // Atualizar a lista local
      setPropertyRequests(prev => 
        prev.map(request => 
          request._id === requestId 
            ? { ...request, status: 'rejected' as const, processedAt: new Date().toISOString() }
            : request
        )
      );
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao rejeitar solicitação');
      return false;
    }
  };

  useEffect(() => {
    if (user?.token && user?.userType === 'admin') {
      fetchPropertyRequests();
    }
  }, [user]);

  return {
    propertyRequests,
    loading,
    error,
    refetch: fetchPropertyRequests,
    approvePropertyRequest,
    rejectPropertyRequest,
  };
};