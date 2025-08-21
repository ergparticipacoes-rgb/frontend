import React, { useState, useCallback, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, ChevronLeft, ChevronRight } from 'lucide-react';
import PropertyCard from '../components/PropertyCard';
import PropertySearch from '../components/PropertySearch';
import { useProperties } from '../hooks/useProperties';
import { SearchFilters } from '../types';

const PropertiesPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState<SearchFilters>({});
  
  const { 
    properties, 
    loading, 
    error, 
    pagination, 
    searchProperties 
  } = useProperties({ 
    pageSize: 12, 
    autoLoad: false 
  });

  // Sincronizar com URL params
  useEffect(() => {
    const page = parseInt(searchParams.get('page') || '1');
    const urlFilters: SearchFilters = {
      location: searchParams.get('location') || undefined,
      category: searchParams.get('category') || undefined,
      availability: (searchParams.get('availability') as 'sale' | 'rent' | 'temporada' | 'both' | undefined) || undefined,
      minPrice: searchParams.get('minPrice') ? Number(searchParams.get('minPrice')) : undefined,
      maxPrice: searchParams.get('maxPrice') ? Number(searchParams.get('maxPrice')) : undefined,
      bedrooms: searchParams.get('bedrooms') ? Number(searchParams.get('bedrooms')) : undefined,
    };
    
    setCurrentPage(page);
    setFilters(urlFilters);
    searchProperties(urlFilters, page);
  }, [searchParams, searchProperties]);

  // Atualizar URL quando mudar página
  const handlePageChange = useCallback((newPage: number) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set('page', newPage.toString());
    setSearchParams(newParams);
  }, [searchParams, setSearchParams]);

  // Lidar com nova busca
  const handleSearch = useCallback((newFilters: SearchFilters) => {
    const newParams = new URLSearchParams();
    
    Object.entries(newFilters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        newParams.set(key, value.toString());
      }
    });
    
    // Resetar para página 1 em nova busca
    newParams.set('page', '1');
    setSearchParams(newParams);
  }, [setSearchParams]);

  // Componente de paginação
  const PaginationControls = () => {
    if (!pagination || pagination.totalPages <= 1) return null;

    const { currentPage, totalPages, hasPrevPage, hasNextPage } = pagination;
    
    // Calcular páginas visíveis
    const getVisiblePages = () => {
      const delta = 2;
      const range = [];
      const rangeWithDots = [];
      
      for (let i = Math.max(2, currentPage - delta); 
           i <= Math.min(totalPages - 1, currentPage + delta); 
           i++) {
        range.push(i);
      }
      
      if (currentPage - delta > 2) {
        rangeWithDots.push(1, '...');
      } else {
        rangeWithDots.push(1);
      }
      
      rangeWithDots.push(...range);
      
      if (currentPage + delta < totalPages - 1) {
        rangeWithDots.push('...', totalPages);
      } else {
        rangeWithDots.push(totalPages);
      }
      
      return rangeWithDots;
    };

    return (
      <div className="flex items-center justify-center space-x-2 mt-8">
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={!hasPrevPage}
          className="flex items-center px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          Anterior
        </button>
        
        <div className="flex space-x-1">
          {getVisiblePages().map((page, index) => (
            <button
              key={index}
              onClick={() => typeof page === 'number' ? handlePageChange(page) : null}
              disabled={page === '...'}
              className={`px-3 py-2 text-sm font-medium rounded-md ${
                page === currentPage
                  ? 'bg-blue-600 text-white'
                  : page === '...'
                  ? 'text-gray-400 cursor-default'
                  : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
              }`}
            >
              {page}
            </button>
          ))}
        </div>
        
        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={!hasNextPage}
          className="flex items-center px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Próxima
          <ChevronRight className="h-4 w-4 ml-1" />
        </button>
      </div>
    );
  };

  if (loading && properties.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-blue-600 hover:text-blue-800 mb-8"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Voltar
          </button>
          
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Carregando Imóveis...</h1>
          
          <div className="animate-pulse grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(12)].map((_, i) => (
              <div key={i} className="bg-white rounded-lg shadow-md h-96"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-blue-600 hover:text-blue-800"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Voltar
          </button>
        </div>
        
        {/* Search Component - Sempre na mesma posição */}
        <PropertySearch onSearch={handleSearch} loading={loading} />
        
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            {pagination ? `${pagination.totalItems} Imóveis Encontrados` : 'Imóveis'}
          </h1>
          
          {pagination && (
            <p className="text-sm text-gray-600">
              Página {pagination.currentPage} de {pagination.totalPages}
            </p>
          )}
        </div>
        
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
            <p className="text-red-800">{error}</p>
          </div>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {properties.map(property => (
            <PropertyCard
              key={property._id}
              property={property}
              onClick={() => {
                const identifier = property.reference || property.id || property._id;
                console.log('Attempting to navigate to:', `/property/${identifier}`);
                navigate(`/property/${identifier}`);
              }}
            />
          ))}
        </div>
        
        {properties.length === 0 && !loading && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">Nenhum imóvel encontrado.</p>
          </div>
        )}
        
        <PaginationControls />
      </div>
    </div>
  );
};

export default PropertiesPage;
