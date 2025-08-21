import { useState, useEffect, useCallback, useMemo } from 'react';
import { Property, SearchFilters, PaginationInfo } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { performanceMonitor } from '../utils/performanceMonitor';
import { API_CONFIG } from '../config/api';

interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

const API_URL = API_CONFIG.BASE_URL;

interface UsePropertiesResult {
  properties: Property[];
  loading: boolean;
  error: string | null;
  pagination: PaginationInfo | null;
  loadMore: () => Promise<void>;
  refresh: () => Promise<void>;
  searchProperties: (filters: SearchFilters, page?: number) => Promise<void>;
  hasMore: boolean;
  addProperty: (property: Omit<Property, 'id' | 'createdAt'>) => Promise<void>;
  updateProperty: (id: string, updates: Partial<Property>) => Promise<void>;
  deleteProperty: (id: string) => Promise<void>;
  featuredProperties: Property[];
  getFeaturedProperties: () => Promise<Property[]>;
}

interface UsePropertiesOptions {
  pageSize?: number;
  autoLoad?: boolean;
  enableInfiniteScroll?: boolean;
}

export const useProperties = (options: UsePropertiesOptions = {}): UsePropertiesResult => {
  const {
    pageSize = 12,
    autoLoad = true,
    enableInfiniteScroll = false
  } = options;

  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);
  const [currentFilters, setCurrentFilters] = useState<SearchFilters>({});
  const [currentPage, setCurrentPage] = useState(1);
  const { user } = useAuth();

  // Função otimizada para buscar propriedades
  const fetchProperties = useCallback(async (
    filters: SearchFilters = {},
    page: number = 1,
    append: boolean = false
  ) => {
    try {
      setLoading(true);
      setError(null);

      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: pageSize.toString(),
        ...Object.fromEntries(
          Object.entries(filters).filter(([_, value]) => 
            value !== undefined && value !== null && value !== ''
          )
        )
      });

      console.log('Buscando propriedades:', `${API_URL}/properties?${queryParams}`);
      
      const response = await fetch(`${API_URL}/properties?${queryParams}`, {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        signal: AbortSignal.timeout(10000) // 10s timeout
      });

      if (!response.ok) {
        throw new Error(`Erro HTTP: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      
      if (append && enableInfiniteScroll) {
        setProperties(prev => [...prev, ...data.properties]);
      } else {
        setProperties(data.properties);
      }
      
      setPagination(data.pagination);
      setCurrentPage(page);
      setCurrentFilters(filters);
      
      console.log(`Carregadas ${data.properties.length} propriedades (página ${page})`);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Falha ao carregar propriedades';
      setError(errorMsg);
      console.error('Erro ao buscar propriedades:', err);
    } finally {
      setLoading(false);
    }
  }, [pageSize, enableInfiniteScroll]);

  // Carregar mais propriedades (para scroll infinito)
  const loadMore = useCallback(async () => {
    if (!pagination?.hasNextPage || loading) return;
    
    await fetchProperties(currentFilters, currentPage + 1, true);
  }, [fetchProperties, currentFilters, currentPage, pagination?.hasNextPage, loading]);

  // Atualizar propriedades
  const refresh = useCallback(async () => {
    await fetchProperties(currentFilters, currentPage, false);
  }, [fetchProperties, currentFilters, currentPage]);

  // Buscar com filtros
  // Dentro da função useProperties:
  const searchProperties = useCallback(async (filters: SearchFilters, page: number = 1) => {
    await fetchProperties(filters, page, false);
  }, [fetchProperties]);

  // Adicionar propriedade
  const addProperty = useCallback(async (property: Omit<Property, 'id' | 'createdAt'>) => {
    if (!user || !user.token) {
      setError('Usuário não autenticado');
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/properties`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`
        },
        body: JSON.stringify(property)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro ao criar propriedade');
      }

      const createdProperty = await response.json();
      setProperties(prev => [createdProperty, ...prev]);
      setError(null);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Erro ao criar propriedade');
      }
      console.error('Erro ao criar propriedade:', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Atualizar propriedade
  const updateProperty = useCallback(async (id: string, updates: Partial<Property>) => {
    if (!user || !user.token) {
      setError('Usuário não autenticado');
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/properties/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`
        },
        body: JSON.stringify(updates)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro ao atualizar propriedade');
      }

      const updatedProperty = await response.json();
      setProperties(prev => 
        prev.map(property => 
          property.id === id ? { ...property, ...updatedProperty } : property
        )
      );
      setError(null);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Erro ao atualizar propriedade');
      }
      console.error('Erro ao atualizar propriedade:', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Deletar propriedade
  const deleteProperty = useCallback(async (id: string) => {
    if (!user || !user.token) {
      setError('Usuário não autenticado');
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/properties/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${user.token}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro ao deletar propriedade');
      }

      setProperties(prev => prev.filter(property => property.id !== id));
      setError(null);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Erro ao deletar propriedade');
      }
      console.error('Erro ao deletar propriedade:', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Buscar propriedades em destaque
  const getFeaturedProperties = useCallback(async (): Promise<Property[]> => {
    const abortController = performanceMonitor.registerRequest();
    
    try {
      console.log('Iniciando busca de imóveis em destaque na URL:', `${API_URL}/properties/featured`);
      // Não afetar o estado global de loading para evitar conflitos
      // setLoading(true);
      // setError(null);
      
      // Tentar várias vezes com intervalo
      let attempts = 0;
      const maxAttempts = 3;
      let lastError: any = null;
      
      while (attempts < maxAttempts) {
        try {
          console.log(`Tentativa ${attempts + 1} de ${maxAttempts}`);
          
          const response = await fetch(`${API_URL}/properties/featured`, {
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json',
            },
            mode: 'cors',
            signal: abortController.signal
          });
          
          console.log('Resposta da API:', {
            status: response.status,
            statusText: response.statusText,
            ok: response.ok
          });
          
          if (!response.ok) {
            throw new Error(`Erro HTTP: ${response.status} ${response.statusText}`);
          }
          
          const text = await response.text();
          console.log('Texto recebido:', text.substring(0, 100) + '...');
          
          // Verificar se o texto JSON é válido antes de parsear
          let data;
          try {
            data = JSON.parse(text);
          } catch (parseError) {
            console.error('Erro ao parsear JSON:', parseError);
            throw new Error('Resposta inválida da API');
          }
          
          // Verificar se temos um array com propriedades
          if (!Array.isArray(data)) {
            console.error('Resposta não é um array:', data);
            
            // Se for um objeto com uma propriedade que tem o array
            if (data && typeof data === 'object') {
              const possibleArrays = Object.values(data).filter(Array.isArray);
              if (possibleArrays.length > 0) {
                data = possibleArrays[0];
                console.log('Usando array encontrado no objeto:', data.length);
              } else {
                throw new Error('Formato de resposta inesperado');
              }
            } else {
              throw new Error('Formato de resposta inesperado');
            }
          }
          
          // Processar o formato dos dados para compatibilizar com a interface Property
          const properties = data.map((property: any) => {
            // Converter _id para id se necessário
            if (property._id && !property.id) {
              property.id = property._id;
            }
            
            // Garantir campos críticos para o componente HeroBanner
            if (!property.photos || !Array.isArray(property.photos) || property.photos.length === 0) {
              property.photos = ['https://images.pexels.com/photos/1643384/pexels-photo-1643384.jpeg'];
            }
            
            return property;
          });
          
          console.log(`${properties.length} propriedades em destaque processadas com sucesso`);
          return properties;
          
        } catch (attemptError) {
          if (abortController.signal.aborted) {
            throw new Error('Requisição cancelada');
          }
          console.warn(`Tentativa ${attempts + 1} falhou:`, attemptError);
          lastError = attemptError;
          attempts++;
          
          if (attempts < maxAttempts) {
            // Aguardar antes da próxima tentativa (tempo exponencial)
            const delay = Math.pow(2, attempts) * 1000;
            console.log(`Aguardando ${delay}ms antes da próxima tentativa...`);
            await new Promise((resolve, reject) => {
              const timeoutId = setTimeout(resolve, delay);
              abortController.signal.addEventListener('abort', () => {
                clearTimeout(timeoutId);
                reject(new Error('Operação cancelada'));
              });
            });
          }
        }
      }
      
      // Se chegou aqui, todas as tentativas falharam
      throw lastError || new Error('Falha ao buscar propriedades em destaque após várias tentativas');
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      console.error('Erro final ao buscar propriedades em destaque:', errorMessage);
      // Não afetar o estado global de erro
      // setError(`Falha ao carregar propriedades em destaque: ${errorMessage}`);
      
      // Retornar um array vazio em caso de falha
      return [];
    } finally {
      // Não afetar o estado global de loading
      // setLoading(false);
    }
  }, []);

  // Carregar propriedades iniciais
  useEffect(() => {
    if (autoLoad) {
      fetchProperties();
    }
  }, [fetchProperties, autoLoad]);

  // Propriedades em destaque (memoizadas)
  const featuredProperties = useMemo(() => 
    properties.filter(p => p.isFeatured && p.isActive),
    [properties]
  );

  const hasMore = pagination?.hasNextPage ?? false;

  return {
    properties,
    loading,
    error,
    pagination,
    loadMore,
    refresh,
    searchProperties,
    hasMore,
    addProperty,
    updateProperty,
    deleteProperty,
    featuredProperties,
    getFeaturedProperties
  };
};

// Hook especializado para scroll infinito
export const useInfiniteProperties = () => {
  return useProperties({
    pageSize: 20,
    enableInfiniteScroll: true,
    autoLoad: true
  });
};