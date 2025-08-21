import { useState, useEffect, useCallback } from 'react';
import { Property } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { API_CONFIG } from '../config/api';

const API_URL = API_CONFIG.BASE_URL;

export const useProfessionalProperties = () => {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  // Buscar propriedades do corretor logado
  const fetchMyProperties = useCallback(async () => {
    if (!user?.token) {
      setError('Usuário não autenticado');
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${API_URL}/properties/my-properties`, {
        headers: {
          'Authorization': `Bearer ${user.token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error('Erro ao buscar propriedades');
      }
      
      const data = await response.json();
      const propertiesArray = data.properties || [];
      setProperties(propertiesArray.map((p: any) => ({ ...p, id: p._id })));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Criar propriedade
  const createProperty = useCallback(async (propertyData: Omit<Property, '_id' | 'ownerId' | 'createdAt'>) => {
    if (!user?.token) {
      setError('Usuário não autenticado');
      return false;
    }
    
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/properties`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${user.token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(propertyData)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro ao criar propriedade');
      }
      
      await fetchMyProperties();
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
      return false;
    } finally {
      setLoading(false);
    }
  }, [user, fetchMyProperties]);

  // Atualizar propriedade
  const updateProperty = useCallback(async (propertyId: string, propertyData: Partial<Property>) => {
    if (!user?.token) {
      setError('Usuário não autenticado');
      return false;
    }
    
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/properties/${propertyId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${user.token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(propertyData)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro ao atualizar propriedade');
      }
      
      await fetchMyProperties();
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
      return false;
    } finally {
      setLoading(false);
    }
  }, [user, fetchMyProperties]);

  // Deletar propriedade
  const deleteProperty = useCallback(async (propertyId: string) => {
    if (!user?.token) {
      setError('Usuário não autenticado');
      return false;
    }
    
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/properties/${propertyId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${user.token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro ao deletar propriedade');
      }
      
      await fetchMyProperties();
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
      return false;
    } finally {
      setLoading(false);
    }
  }, [user, fetchMyProperties]);

  useEffect(() => {
    if (user?.token) {
      fetchMyProperties();
    }
  }, [fetchMyProperties, user]);

  return {
    properties,
    loading,
    error,
    fetchMyProperties,
    createProperty,
    updateProperty,
    deleteProperty
  };
};