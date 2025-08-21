import { useState, useEffect } from 'react';
import { Property } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { API_CONFIG } from '../config/api';

const API_URL = API_CONFIG.BASE_URL;

export const useAdminProperties = () => {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const fetchProperties = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Para admin, buscar todas as propriedades (ativas e inativas) com limite maior
      const headers: HeadersInit = {
        'Content-Type': 'application/json'
      };
      
      // Adicionar token de autenticação se disponível
      if (user?.token) {
        headers.Authorization = `Bearer ${user.token}`;
      }
      
      const response = await fetch(`${API_URL}/properties?limit=1000`, {
        headers
      });
      
      if (!response.ok) {
        throw new Error('Erro ao buscar propriedades');
      }
      
      const data = await response.json();
      // A API retorna um objeto com properties array, não um array direto
      const propertiesArray = data.properties || data;
      setProperties(Array.isArray(propertiesArray) ? propertiesArray.map((p: any) => ({ ...p, id: p._id })) : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  };

  const toggleFeatured = async (propertyId: string) => {
    if (!user?.token) return false;
    
    try {
      const response = await fetch(`${API_URL}/properties/${propertyId}/feature`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${user.token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error('Erro ao alterar destaque da propriedade');
      }
      
      await fetchProperties();
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
      return false;
    }
  };

  const updateProperty = async (propertyId: string, propertyData: Partial<Property>) => {
    if (!user?.token) return false;
    
    try {
      const response = await fetch(`${API_URL}/properties/${propertyId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${user.token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(propertyData)
      });
      
      if (!response.ok) {
        throw new Error('Erro ao atualizar propriedade');
      }
      
      await fetchProperties();
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
      return false;
    }
  };

  const deleteProperty = async (propertyId: string) => {
    if (!user?.token) return false;
    
    try {
      const response = await fetch(`${API_URL}/properties/${propertyId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${user.token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error('Erro ao deletar propriedade');
      }
      
      await fetchProperties();
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
      return false;
    }
  };

  const createProperty = async (propertyData: Omit<Property, '_id' | 'ownerId' | 'createdAt'>) => {
    if (!user?.token) return false;
    
    try {
      const response = await fetch(`${API_URL}/properties`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${user.token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(propertyData)
      });
      
      if (!response.ok) {
        throw new Error('Erro ao criar propriedade');
      }
      
      await fetchProperties();
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
      return false;
    }
  };

  useEffect(() => {
    fetchProperties();
  }, []);

  return {
    properties,
    loading,
    error,
    fetchProperties,
    toggleFeatured,
    updateProperty,
    deleteProperty,
    createProperty
  };
};