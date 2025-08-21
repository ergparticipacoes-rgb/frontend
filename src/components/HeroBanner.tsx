import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Search, MapPin, DollarSign, Home, Filter, Loader2 } from 'lucide-react';
import { Property, SearchFilters } from '../types';
import { useProperties } from '../hooks/useProperties';
import LocationAutocomplete from './LocationAutocomplete';
import { usePerformanceMonitor } from '../utils/performanceMonitor';

// Propriedade padrão para usar como fallback
const defaultProperty: Property = {
  id: 'fallback',
  title: 'Imóvel de Destaque',
  description: 'Carregando detalhes do imóvel...',
  bedrooms: 0,
  bathrooms: 0,
  livingRooms: 0,
  totalArea: 0,
  usefulArea: 0,
  price: 0,
  category: 'house',
  availability: 'both',
  address: {
    city: 'Carregando...',
    neighborhood: 'Carregando...',
    street: 'Carregando...',
    number: '',
    cep: '',
    state: ''
  },
  photos: ['https://images.pexels.com/photos/1643384/pexels-photo-1643384.jpeg'],
  isActive: true,
  isFeatured: true,
  ownerId: '',
  createdAt: new Date().toISOString(),
  tags: []
};

const HeroBanner: React.FC = () => {
  const navigate = useNavigate();
  const { getFeaturedProperties, loading, error } = useProperties();
  const { createTimer, clearTimer } = usePerformanceMonitor();
  const [featuredProperties, setFeaturedProperties] = useState<Property[]>([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [searchFilters, setSearchFilters] = useState<SearchFilters>({
    location: '',
    minPrice: undefined,
    maxPrice: undefined,
    bedrooms: undefined,
    availability: undefined,
    category: undefined,
  });
  const [isSearching, setIsSearching] = useState(false);
  const [loadingStatus, setLoadingStatus] = useState<string>('Iniciando carregamento...');
  const [loadAttempts, setLoadAttempts] = useState(0);
  const [localError, setLocalError] = useState<string | null>(null);
  
  // Novos estados para controlar estabilidade da UI
  const [isLoading, setIsLoading] = useState(true);
  const attemptingRef = useRef(false);

  // Limpar flags ao desmontar componente
  useEffect(() => {
    return () => {
      attemptingRef.current = false;
    };
  }, []);
  
  // Buscar as propriedades em destaque diretamente da API
  useEffect(() => {
    // Evitar múltiplas tentativas simultâneas
    if (attemptingRef.current) {
      return;
    }
    
    const loadFeaturedProperties = async () => {
      try {
      attemptingRef.current = true;
      setIsLoading(true);
      setLocalError(null);
      setLoadingStatus('Buscando propriedades em destaque...');
      console.log('Buscando propriedades em destaque...');
      
      // Buscar da API
      const data = await getFeaturedProperties();
      console.log('Resultado da busca:', data);
      
      if (data && Array.isArray(data) && data.length > 0) {
        // Processar e garantir que todos os campos necessários estão presentes
        const processedData = data.map((property: any) => {
          return {
            // Garantir que todos os campos necessários existem
            ...defaultProperty,
            // Sobrescrever com os dados recebidos da API
            ...property,
            // Garantir ID correto (backend usa _id, frontend usa id)
            id: property.id || property._id,
            // Garantir que endereço tem todos os campos necessários
            address: {
              ...defaultProperty.address,
              ...(property.address || {})
            },
            // Garantir que há pelo menos uma foto
            photos: (property.photos && property.photos.length > 0)
              ? property.photos
              : defaultProperty.photos
          };
        });
        
        setFeaturedProperties(processedData);
        setLoadingStatus('Propriedades carregadas: ' + processedData.length);
        console.log('Propriedades em destaque processadas:', processedData.length);
        setIsLoading(false);
        attemptingRef.current = false;
      } else {
        setLoadingStatus('Nenhum imóvel em destaque encontrado.');
        console.log('API não retornou propriedades em destaque');
        setIsLoading(false);
        attemptingRef.current = false;
        if (loadAttempts < 3) {
          const delay = Math.pow(2, loadAttempts) * 1000;
          console.log(`Tentando novamente em ${delay/1000} segundos...`);
          setLoadingStatus(`Tentando novamente em ${delay/1000} segundos...`);
          setTimeout(() => {
            setLoadAttempts(prev => prev + 1);
          }, delay);
        }
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      setLoadingStatus('Erro: ' + errorMessage);
      setLocalError(errorMessage);
      console.error('Erro ao buscar propriedades em destaque:', err);
      setIsLoading(false);
      attemptingRef.current = false;
      if (loadAttempts < 3) {
        const delay = Math.pow(2, loadAttempts) * 1000;
        setTimeout(() => {
          setLoadAttempts(prev => prev + 1);
        }, delay);
      }
    }
  };

    loadFeaturedProperties();
    
  }, [getFeaturedProperties, loadAttempts]);

  // Auto-rotate slides
  useEffect(() => {
    if (featuredProperties.length > 0) {
      const timer = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % featuredProperties.length);
      }, 5000);
      return () => clearInterval(timer);
    }
  }, [featuredProperties.length]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % featuredProperties.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + featuredProperties.length) % featuredProperties.length);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setIsSearching(true);
    
    try {
      // Converter os valores de preço de string para número
      let filters = { ...searchFilters };
      
      if ((searchFilters as any).priceRange) {
        const [min, max] = (searchFilters as any).priceRange.split('-');
        if (min) filters.minPrice = parseInt(min);
        if (max && max !== '+') filters.maxPrice = parseInt(max);
      }
      
      // Remover o campo priceRange que não faz parte da interface SearchFilters
      const { priceRange, ...finalFilters } = filters as any;
      
      // Criar parâmetros de URL para a busca
      const searchParams = new URLSearchParams();
      
      Object.entries(finalFilters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          searchParams.set(key, value.toString());
        }
      });
      
      // Navegar para a página de propriedades com os filtros
      const queryString = searchParams.toString();
      navigate(`/properties${queryString ? `?${queryString}` : ''}`);
      
    } catch (err) {
      console.error('Erro na busca:', err);
    } finally {
      setIsSearching(false);
    }
  };

  // Botão de tentativa manual
  const handleManualRetry = () => {
    if (attemptingRef.current) return; // Evitar múltiplos cliques
    
    setIsLoading(true);
    setLoadAttempts(prev => prev + 1);
  };

  // Se estiver carregando ou tiver erro, mostrar um estado alternativo
  if (isLoading) {
    return (
      <section className="relative h-[600px] bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800 flex items-center justify-center">
        <div className="text-center text-white">
          <div className="flex flex-col items-center justify-center">
            <Loader2 className="h-12 w-12 animate-spin mb-4" />
            <h2 className="text-xl">Carregando imóveis em destaque...</h2>
            <p className="text-sm mt-2">{loadingStatus}</p>
            {loadAttempts > 0 && (
              <p className="text-sm mt-1">Tentativa {loadAttempts + 1} de 4</p>
            )}
          </div>
        </div>
      </section>
    );
  }

  if (localError) {
    return (
      <section className="relative h-[600px] bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800 flex items-center justify-center">
        <div className="text-center text-white">
          <h2 className="text-2xl font-bold mb-2">Oops! Algo deu errado.</h2>
          <p>Não foi possível carregar as propriedades em destaque.</p>
          <p className="text-sm mt-2">Erro: {localError}</p>
          <button 
            onClick={handleManualRetry}
            className="mt-4 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md"
          >
            Tentar Novamente
          </button>
        </div>
      </section>
    );
  }

  if (featuredProperties.length === 0) {
    return (
      <section className="relative h-[600px] bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800 flex items-center justify-center">
        <div className="text-center text-white">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Você está na melhor plataforma de<br />
            <span className="text-blue-200">anúncios imobiliários do Litoral!</span>
          </h1>
          <p className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto">
            Feito para imobiliárias, corretores, construtoras e proprietários de imóveis!
          </p>
          <p className="text-sm mt-4">Nenhum imóvel em destaque encontrado.</p>
          <button 
            onClick={handleManualRetry}
            className="mt-4 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md"
          >
            Tentar Novamente ({loadAttempts}/3)
          </button>
        </div>
      </section>
    );
  }

  const currentProperty = featuredProperties[currentSlide];
  
  // Verificar se todos os dados necessários existem, ou usar fallbacks
  const propertyTitle = currentProperty?.title || defaultProperty.title;
  const propertyDescription = currentProperty?.description || defaultProperty.description;
  const propertyPrice = currentProperty?.price || defaultProperty.price;
  const propertyBedrooms = currentProperty?.bedrooms || defaultProperty.bedrooms;
  const propertyCity = currentProperty?.address?.city || defaultProperty.address.city;
  const propertyPhoto = 
    (currentProperty?.photos && currentProperty.photos.length > 0) 
      ? currentProperty.photos[0] 
      : defaultProperty.photos[0];
  const propertyCondominiumPrice = currentProperty?.condominiumPrice;

  return (
    <>
      {/* Hero minimalista em mobile com filtro centralizado */}
      <section className="md:hidden bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800 py-6">
        <div className="px-4">
          <h1 className="text-2xl font-bold text-white text-center mb-2">
            Busca Imóveis 013
          </h1>
          <p className="text-sm text-blue-100 text-center mb-6">
            Litoral Paulista
          </p>
          
          {/* Filtro centralizado em mobile */}
          <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-xl p-4">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 text-center">
              Encontre seu imóvel
            </h2>
            
            <form onSubmit={handleSearch} className="space-y-3">
              <LocationAutocomplete
                value={searchFilters.location || ''}
                onChange={(value) => setSearchFilters(prev => ({ ...prev, location: value }))}
                placeholder="Localização (cidade, bairro)"
              />
              
              <div className="grid grid-cols-2 gap-2">
                <select
                  value={(searchFilters as any).priceRange || ''}
                  onChange={(e) => setSearchFilters(prev => ({ ...prev, priceRange: e.target.value }))}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Preço</option>
                  <option value="0-300000">Até 300k</option>
                  <option value="300000-500000">300k-500k</option>
                  <option value="500000-1000000">500k-1M</option>
                  <option value="1000000+">+1M</option>
                </select>
                
                <select
                  value={searchFilters.category || ''}
                  onChange={(e) => setSearchFilters(prev => ({ ...prev, category: e.target.value }))}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Tipo</option>
                  <option value="apartment">Apto</option>
                  <option value="house">Casa</option>
                  <option value="chacara">Chácara</option>
                  <option value="terrain">Terreno</option>
                </select>
              </div>
              
              <select
                value={searchFilters.availability || ''}
                onChange={(e) => setSearchFilters(prev => ({ ...prev, availability: e.target.value as any }))}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Disponibilidade</option>
                <option value="sale">Venda</option>
                <option value="rent">Locação</option>
                <option value="temporada">Temporada</option>
              </select>
              
              <button
                type="submit"
                disabled={isSearching}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition-colors flex items-center justify-center"
              >
                {isSearching ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    <span>Buscando...</span>
                  </>
                ) : (
                  <>
                    <Search className="h-4 w-4 mr-2" />
                    <span>Buscar Imóveis</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* Hero completo em desktop */}
      <section className="hidden md:block relative h-[600px] overflow-hidden">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0">
        <img
          src={propertyPhoto}
          alt={propertyTitle}
          className="w-full h-full object-cover transition-all duration-1000"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-black/30"></div>
      </div>

      {/* Navigation Arrows */}
      {featuredProperties.length > 1 && (
        <>
          <button
            onClick={prevSlide}
            className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-4 rounded-full transition-all duration-300 backdrop-blur-sm z-20 shadow-lg border-2 border-white/20 hover:border-white/40"
            aria-label="Imóvel anterior"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
          <button
            onClick={nextSlide}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-4 rounded-full transition-all duration-300 backdrop-blur-sm z-20 shadow-lg border-2 border-white/20 hover:border-white/40"
            aria-label="Próximo imóvel"
          >
            <ChevronRight className="h-6 w-6" />
          </button>
        </>
      )}

      {/* Slide Indicators */}
      {featuredProperties.length > 1 && (
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex space-x-3 z-20">
          {featuredProperties.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`w-4 h-4 rounded-full transition-all duration-300 border-2 hover:scale-110 ${
                index === currentSlide 
                  ? 'bg-white border-white shadow-lg' 
                  : 'bg-transparent border-white/60 hover:border-white'
              }`}
              aria-label={`Ir para imóvel ${index + 1}`}
            />
          ))}
        </div>
      )}

      {/* Content */}
      <div className="relative z-10 h-full flex items-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            {/* Left Side - Property Info */}
            <div className="text-white">
              <div className="mb-4">
                <span className="inline-block bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-medium mb-2">
                  Imóvel em Destaque
                </span>
              </div>
              
              <h1 className="text-3xl md:text-5xl font-bold mb-4 leading-tight">
                {propertyTitle}
              </h1>
              
              <p className="text-xl text-gray-200 mb-6 line-clamp-3">
                {propertyDescription}
              </p>

              <div className="flex items-center space-x-6 mb-6">
                <div className="flex items-center space-x-2">
                  <Home className="h-5 w-5 text-blue-300" />
                  <span className="text-lg">{propertyBedrooms} quartos</span>
                </div>
                <div className="flex items-center space-x-2">
                  <MapPin className="h-5 w-5 text-blue-300" />
                  <span className="text-lg">{propertyCity}</span>
                </div>
              </div>

              <div className="mb-8">
                <div className="flex items-center space-x-2">
                  <DollarSign className="h-6 w-6 text-green-400" />
                  <span className="text-3xl font-bold text-green-400">
                    {formatPrice(propertyPrice)}
                  </span>
                </div>
                {propertyCondominiumPrice && (
                  <p className="text-gray-300 mt-1">
                    + Condomínio: {formatPrice(propertyCondominiumPrice)}
                  </p>
                )}
              </div>

              <button className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg transition-colors transform hover:scale-105">
                Ver Detalhes
              </button>
            </div>

            {/* Right Side - Quick Search */}
            <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
                Filtro de Pesquisa Rápida
              </h2>
              
              <form onSubmit={handleSearch} className="space-y-4">
                <LocationAutocomplete
                  value={searchFilters.location || ''}
                  onChange={(value) => setSearchFilters(prev => ({ ...prev, location: value }))}
                  placeholder="Localização (cidade, bairro)"
                />
                
                <div className="relative">
                  <DollarSign className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <select
                    value={(searchFilters as any).priceRange || ''}
                    onChange={(e) => setSearchFilters(prev => ({ ...prev, priceRange: e.target.value }))}
                    className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
                  >
                    <option value="">Faixa de preço</option>
                    <option value="0-300000">Até R$ 300.000</option>
                    <option value="300000-500000">R$ 300.000 - R$ 500.000</option>
                    <option value="500000-1000000">R$ 500.000 - R$ 1.000.000</option>
                    <option value="1000000+">Acima de R$ 1.000.000</option>
                  </select>
                </div>
                
                <div className="relative">
                  <Home className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <select
                    value={searchFilters.category || ''}
                    onChange={(e) => setSearchFilters(prev => ({ ...prev, category: e.target.value }))}
                    className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
                  >
                    <option value="">Tipo de imóvel</option>
                    <option value="apartment">Apartamento</option>
                    <option value="house">Casa</option>
                    <option value="chacara">Chácara</option>
                    <option value="terrain">Terreno</option>
                    <option value="salon">Salão</option>
                    <option value="sobrado">Sobrado</option>
                  </select>
                </div>
                
                <div className="relative">
                  <Filter className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <select
                    value={searchFilters.availability || ''}
                    onChange={(e) => setSearchFilters(prev => ({ ...prev, availability: e.target.value as any }))}
                    className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
                  >
                    <option value="">Disponibilidade</option>
                    <option value="sale">Venda</option>
                    <option value="rent">Locação</option>
                    <option value="temporada">Temporada</option>
                    <option value="both">Ambos</option>
                  </select>
                </div>
                
                <button
                  type="submit"
                  disabled={isSearching}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition-colors flex items-center justify-center space-x-2 transform hover:scale-105"
                >
                  {isSearching ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      <span>Buscando...</span>
                    </>
                  ) : (
                    <>
                      <Search className="h-5 w-5" />
                      <span>Buscar Imóveis</span>
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
      </section>
    </>
  );
};

export default HeroBanner;