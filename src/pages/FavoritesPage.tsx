import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFavorites } from '../hooks/useFavorites';
import { useProperties } from '../hooks/useProperties';
import PropertyCardEnhanced from '../components/common/PropertyCardEnhanced';
import { motion } from 'framer-motion';
import { HeartOff } from 'lucide-react';
import { Property } from '../types/property';

const FavoritesPage: React.FC = () => {
  const navigate = useNavigate();
  const { favorites, isLoaded, clearFavorites } = useFavorites();
  const { getPropertyById } = useProperties();
  const [favoriteProperties, setFavoriteProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Buscar propriedades favoritas da API
  useEffect(() => {
    const loadFavoriteProperties = async () => {
      if (!isLoaded || favorites.length === 0) {
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        const properties = await Promise.all(
          favorites.map(async (id) => {
            try {
              return await getPropertyById(id);
            } catch (error) {
              console.error(`Erro ao carregar propriedade ${id}:`, error);
              return null;
            }
          })
        );
        
        // Filtrar propriedades que foram carregadas com sucesso
        const validProperties = properties.filter((property): property is Property => property !== null);
        setFavoriteProperties(validProperties);
      } catch (error) {
        console.error('Erro ao carregar propriedades favoritas:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadFavoriteProperties();
  }, [favorites, isLoaded, getPropertyById]);

  if (!isLoaded || loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-12">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
            <p className="mt-4 text-gray-600">Carregando seus favoritos...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Seus Imóveis Favoritos</h1>
          <p className="text-gray-600">Aqui estão os imóveis que você salvou</p>
        </div>

        {favoriteProperties.length === 0 ? (
          <motion.div 
            className="text-center py-16 bg-white rounded-xl shadow-sm"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex justify-center mb-4">
              <div className="p-4 bg-red-50 rounded-full">
                <HeartOff className="h-10 w-10 text-red-400" />
              </div>
            </div>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Nenhum imóvel favoritado</h2>
            <p className="text-gray-500 max-w-md mx-auto mb-6">
              Você ainda não adicionou nenhum imóvel aos seus favoritos. Explore nossa lista de imóveis e clique no ícone de coração para salvar os seus preferidos.
            </p>
            <a
              href="/imoveis"
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Ver imóveis disponíveis
            </a>
          </motion.div>
        ) : (
          <>
            <div className="flex justify-between items-center mb-6">
              <p className="text-gray-600">
                {favoriteProperties.length} {favoriteProperties.length === 1 ? 'imóvel' : 'imóveis'} favoritado{favoriteProperties.length !== 1 ? 's' : ''}
              </p>
              <button
                onClick={clearFavorites}
                className="text-sm text-red-600 hover:text-red-700 font-medium"
              >
                Limpar todos
              </button>
            </div>
            
            <motion.div 
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              initial="hidden"
              animate="show"
              variants={{
                hidden: { opacity: 0 },
                show: {
                  opacity: 1,
                  transition: {
                    staggerChildren: 0.1
                  }
                }
              }}
            >
              {favoriteProperties.map((property) => (
                <motion.div
                  key={property.id}
                  variants={{
                    hidden: { opacity: 0, y: 20 },
                    show: { opacity: 1, y: 0 }
                  }}
                  transition={{ duration: 0.3 }}
                  className="h-full"
                >
                  <PropertyCardEnhanced
                    property={property}
                    onClick={() => navigate(`/property/${property.reference || property.id || property._id}`)}
                    onFavoriteChange={(property: Property, isFavorite: boolean) => {
                      console.log(`Property ${property.id} ${isFavorite ? 'added to' : 'removed from'} favorites`);
                    }}
                  />
                </motion.div>
              ))}
            </motion.div>
          </>
        )}
      </div>
    </div>
  );
};

export default FavoritesPage;
