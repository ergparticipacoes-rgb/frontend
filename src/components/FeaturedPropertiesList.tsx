import React, { useState } from 'react';
import { ArrowRight, Filter, Grid, List } from 'lucide-react';
import PropertyCard from './PropertyCard';
import { useProperties } from '../hooks/useProperties';

const FeaturedPropertiesList: React.FC = () => {
  const { featuredProperties, loading } = useProperties();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showAll, setShowAll] = useState(false);

  const displayProperties = showAll ? featuredProperties : featuredProperties.slice(0, 6);

  if (loading) {
    return (
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Lista de Imóveis em Destaque
            </h2>
            <div className="animate-pulse grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-white rounded-lg shadow-md h-96"></div>
              ))}
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 bg-gray-50" id="featured-list">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center space-x-2 bg-blue-100 text-blue-800 rounded-full px-4 py-2 mb-4">
            <Filter className="h-4 w-4" />
            <span className="text-sm font-medium">Selecionados para você</span>
          </div>
          
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Lista de Imóveis em Destaque
          </h2>
          
          <p className="text-lg text-gray-600 max-w-3xl mx-auto mb-8">
            Confira os melhores imóveis selecionados especialmente para você, 
            com as melhores localizações e preços do mercado
          </p>

          {/* View Mode Toggle */}
          <div className="flex items-center justify-center space-x-2 mb-8">
            <button
              onClick={() => setViewMode('grid')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                viewMode === 'grid'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Grid className="h-4 w-4" />
              <span>Grade</span>
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                viewMode === 'list'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-100'
              }`}
            >
              <List className="h-4 w-4" />
              <span>Lista</span>
            </button>
          </div>
        </div>

        {/* Properties Grid/List */}
        {featuredProperties.length === 0 ? (
          <div className="text-center py-12">
            <div className="bg-white rounded-lg shadow-md p-8 max-w-md mx-auto">
              <div className="text-gray-400 mb-4">
                <Filter className="h-12 w-12 mx-auto" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Nenhum imóvel em destaque
              </h3>
              <p className="text-gray-600">
                Novos imóveis em destaque serão adicionados em breve.
              </p>
            </div>
          </div>
        ) : (
          <>
            <div className={`${
              viewMode === 'grid' 
                ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' 
                : 'space-y-6'
            } mb-12`}>
              {displayProperties.map((property, index) => (
                <div
                  key={property.id}
                  className={`transform transition-all duration-300 ${
                    viewMode === 'grid' ? 'hover:-translate-y-2' : ''
                  }`}
                  style={{
                    animationDelay: `${index * 100}ms`,
                    animation: 'fadeInUp 0.6s ease-out forwards'
                  }}
                >
                  <PropertyCard
                    property={property}
                    viewMode={viewMode}
                    onClick={() => console.log('Ver detalhes:', property.id)}
                  />
                </div>
              ))}
            </div>

            {/* Show More/Less Button */}
            {featuredProperties.length > 6 && (
              <div className="text-center">
                <button
                  onClick={() => setShowAll(!showAll)}
                  className="inline-flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-8 rounded-lg transition-colors transform hover:scale-105"
                >
                  <span>{showAll ? 'Ver menos imóveis' : 'Ver todos os imóveis'}</span>
                  <ArrowRight className={`h-5 w-5 transition-transform ${showAll ? 'rotate-180' : ''}`} />
                </button>
              </div>
            )}
          </>
        )}

        {/* Additional CTA */}
        <div className="mt-16 text-center">
          <div className="bg-white rounded-2xl shadow-xl p-8 max-w-2xl mx-auto">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Não encontrou o que procura?
            </h3>
            <p className="text-gray-600 mb-6">
              Use nossos filtros avançados para encontrar o imóvel perfeito para você
            </p>
            <a
              href="#search"
              className="inline-flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-colors"
            >
              <Filter className="h-5 w-5" />
              <span>Busca Avançada</span>
            </a>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </section>
  );
};

export default FeaturedPropertiesList;