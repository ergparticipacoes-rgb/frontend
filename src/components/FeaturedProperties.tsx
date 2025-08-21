import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import PropertyCard from './PropertyCard';
import { useProperties } from '../hooks/useProperties';
import { Property } from '../types';

const FeaturedProperties: React.FC = () => {
  const { getFeaturedProperties } = useProperties({ autoLoad: false });
  const [featuredProperties, setFeaturedProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handlePropertyClick = (property: Property) => {
    const identifier = property.reference || property.id || property._id;
    navigate(`/property/${identifier}`);
  };

  useEffect(() => {
    const loadFeaturedProperties = async () => {
      try {
        setLoading(true);
        setError(null);
        const properties = await getFeaturedProperties();
        setFeaturedProperties(properties);
      } catch (err) {
        console.error('Erro ao carregar propriedades em destaque:', err);
        setError('Erro ao carregar propriedades em destaque');
      } finally {
        setLoading(false);
      }
    };

    loadFeaturedProperties();
  }, [getFeaturedProperties]);

  if (loading) {
    return (
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Imóveis em Destaque
            </h2>
            <div className="animate-pulse grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="bg-white rounded-lg shadow-md h-96"></div>
              ))}
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Imóveis em Destaque
            </h2>
            <p className="text-red-600">{error}</p>
          </div>
        </div>
      </section>
    );
  }

  if (featuredProperties.length === 0) {
    return (
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Imóveis em Destaque
            </h2>
            <p className="text-gray-600">Nenhum imóvel em destaque encontrado.</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 bg-gray-50" id="featured">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Imóveis em Destaque
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Confira os melhores imóveis selecionados especialmente para você
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {featuredProperties.slice(0, 6).map((property) => (
            <PropertyCard
              key={property.id}
              property={property}
              onClick={() => handlePropertyClick(property)}
            />
          ))}
        </div>

        <div className="text-center">
          <Link
            to="/properties"
            className="inline-flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-colors"
          >
            <span>Ver todos os imóveis</span>
            <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default FeaturedProperties;