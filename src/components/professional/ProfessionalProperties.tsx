import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Filter, Plus, Eye, Edit, Trash2, Star, MoreVertical } from 'lucide-react';
import { useProfessionalProperties } from '../../hooks/useProfessionalProperties';
import { Property } from '../../types';
import toast from 'react-hot-toast';

const ProfessionalProperties: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterAvailability, setFilterAvailability] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [propertyToDelete, setPropertyToDelete] = useState<{id: string, title: string} | null>(null);
  const navigate = useNavigate();
  
  const { properties, loading, error, deleteProperty, fetchMyProperties } = useProfessionalProperties();
  
  // Funções para manipular propriedades
  const handleEdit = (propertyReference: string) => {
    navigate(`/corretor/editar-imovel/${propertyReference}`);
  };

  const handleDeleteClick = (propertyId: string, propertyTitle: string) => {
    setPropertyToDelete({ id: propertyId, title: propertyTitle });
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!propertyToDelete) return;
    
    try {
      const success = await deleteProperty(propertyToDelete.id);
      if (success) {
        toast.success('Imóvel excluído com sucesso!');
        await fetchMyProperties();
        setShowDeleteModal(false);
        setPropertyToDelete(null);
      } else {
        toast.error('Erro ao excluir imóvel');
      }
    } catch (error) {
      console.error('Erro ao excluir propriedade:', error);
      toast.error('Erro ao excluir imóvel');
    }
  };

  const handleCancelDelete = () => {
    setShowDeleteModal(false);
    setPropertyToDelete(null);
  };
  


  // Filtrar e ordenar propriedades
  const filteredProperties = properties
    .filter(property => {
      const matchesSearch = property.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           property.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           property.address?.city?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           property.address?.neighborhood?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesAvailability = filterAvailability === 'all' || property.availability === filterAvailability;
      const matchesCategory = filterCategory === 'all' || property.category === filterCategory;
      
      return matchesSearch && matchesAvailability && matchesCategory;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
        case 'oldest':
          return new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime();
        case 'price_high':
          return (b.price || 0) - (a.price || 0);
        case 'price_low':
          return (a.price || 0) - (b.price || 0);
        case 'views':
          return (b.views || 0) - (a.views || 0);
        default:
          return 0;
      }
    });

  const formatPrice = (price: number, availability: string) => {
    const formatted = new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
    
    return availability === 'rent' ? `${formatted}/mês` : formatted;
  };

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'apartment': return 'Apartamento';
      case 'house': return 'Casa';
      case 'commercial': return 'Comercial';
      case 'land': return 'Terreno';
      default: return 'Outro';
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-800">Meus Imóveis</h1>
        <Link
          to="/corretor/adicionar-imovel"
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700"
        >
          <Plus className="w-4 h-4 mr-2" /> Adicionar Imóvel
        </Link>
      </div>
      
      {/* Filtros e busca */}
      <div className="bg-white p-4 rounded-lg shadow-md mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-2">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                className="focus:ring-green-500 focus:border-green-500 block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md"
                placeholder="Buscar imóveis..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          
          <div>
            <div className="flex">
              <div className="relative flex-grow">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Filter className="h-4 w-4 text-gray-400" />
                </div>
                <select
                  className="focus:ring-green-500 focus:border-green-500 block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md"
                  value={filterAvailability}
                  onChange={(e) => setFilterAvailability(e.target.value)}
                >
                  <option value="all">Disponibilidade</option>
                  <option value="sale">Venda</option>
                  <option value="rent">Aluguel</option>
                  <option value="both">Ambos</option>
                </select>
              </div>
            </div>
          </div>
          
          <div>
            <div className="flex">
              <div className="relative flex-grow">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Filter className="h-4 w-4 text-gray-400" />
                </div>
                <select
                  className="focus:ring-green-500 focus:border-green-500 block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md"
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                >
                  <option value="all">Tipo de Imóvel</option>
                  <option value="apartment">Apartamento</option>
                  <option value="house">Casa</option>
                  <option value="commercial">Comercial</option>
                  <option value="land">Terreno</option>
                </select>
              </div>
            </div>
          </div>
        </div>
        
        <div className="mt-4 flex justify-between items-center">
          <div className="text-sm text-gray-500">
            {filteredProperties.length} {filteredProperties.length === 1 ? 'imóvel encontrado' : 'imóveis encontrados'}
          </div>
          
          <div className="flex items-center">
            <label htmlFor="sort" className="mr-2 text-sm text-gray-500">Ordenar por:</label>
            <select
              id="sort"
              className="focus:ring-green-500 focus:border-green-500 border border-gray-300 rounded-md text-sm"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="newest">Mais recentes</option>
              <option value="oldest">Mais antigos</option>
              <option value="price_high">Maior preço</option>
              <option value="price_low">Menor preço</option>
              <option value="views">Mais visualizações</option>
            </select>
          </div>
        </div>
      </div>
      
      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {/* Loading */}
      {loading ? (
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-green-600 border-r-transparent"></div>
          <p className="mt-4 text-gray-600">Carregando propriedades...</p>
        </div>
      ) : (
        /* Lista de Propriedades */
        <div className="bg-white overflow-hidden shadow-md rounded-lg">
          <ul className="divide-y divide-gray-200">
            {filteredProperties.map((property) => (
              <li key={property.id || property._id} className={`p-4 ${!property.isActive ? 'bg-gray-50' : ''}`}>
                <div className="flex flex-col sm:flex-row">
                <div className="flex-shrink-0 w-full sm:w-48 h-32 mb-4 sm:mb-0">
                  <img 
                    src={property.photos?.[0] || 'https://images.pexels.com/photos/1396132/pexels-photo-1396132.jpeg'} 
                    alt={property.title}
                    className="h-full w-full object-cover rounded-md"
                  />
                </div>
                <div className="ml-0 sm:ml-4 flex-grow">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 flex items-center">
                        {property.title}
                        {property.isFeatured && (
                          <Star className="w-4 h-4 ml-2 text-yellow-500" fill="currentColor" />
                        )}
                      </h3>
                      <p className="text-sm text-gray-500 mt-1">
                        {property.address ? 
                          `${property.address.neighborhood}, ${property.address.city}` : 
                          'Endereço não informado'
                        }
                      </p>
                    </div>
                    <p className="text-lg font-bold text-green-600">
                      {formatPrice(property.price, property.availability)}
                    </p>
                  </div>
                  
                  <div className="flex flex-wrap gap-x-4 mt-2">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      {property.availability === 'sale' ? 'Venda' : 'Aluguel'}
                    </span>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {getCategoryLabel(property.category)}
                    </span>
                    {property.bedrooms > 0 && (
                      <span className="text-xs text-gray-500">
                        {property.bedrooms} {property.bedrooms === 1 ? 'quarto' : 'quartos'}
                      </span>
                    )}
                    {property.bathrooms > 0 && (
                      <span className="text-xs text-gray-500">
                        {property.bathrooms} {property.bathrooms === 1 ? 'banheiro' : 'banheiros'}
                      </span>
                    )}
                    <span className="text-xs text-gray-500">{property.totalArea || property.usefulArea || 0} m²</span>
                    {!property.isActive && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        Inativo
                      </span>
                    )}

                  </div>
                  
                  <div className="mt-4 flex space-x-2">
                    <Link
                      to={`/property/${property.reference || property.id || property._id}`}
                      className="inline-flex items-center px-2.5 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50"
                      target="_blank"
                    >
                      <Eye className="w-4 h-4 mr-1" /> Ver Anúncio
                    </Link>
                    <button
                      onClick={() => handleEdit(property.reference || property.id || property._id)}
                      className="inline-flex items-center px-2.5 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50"
                    >
                      <Edit className="w-4 h-4 mr-1" /> Editar
                    </button>

                    <button
                      onClick={() => handleDeleteClick(property.id || property._id, property.title)}
                      className="inline-flex items-center px-2.5 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded text-red-700 bg-white hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4 mr-1" /> Excluir
                    </button>
                  </div>
                </div>
              </div>
              </li>
            ))}
          </ul>
        </div>
      )}
      
      {filteredProperties.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">Nenhum imóvel encontrado com os filtros aplicados.</p>
        </div>
      )}

      {/* Modal de Confirmação de Exclusão */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6 shadow-xl">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mr-4">
                <Trash2 className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Confirmar Exclusão
                </h3>
                <p className="text-sm text-gray-500">
                  Esta ação não pode ser desfeita
                </p>
              </div>
            </div>
            
            <div className="mb-6">
              <p className="text-gray-700">
                Tem certeza que deseja excluir o imóvel:
              </p>
              <p className="font-semibold text-gray-900 mt-2">
                "{propertyToDelete?.title}"
              </p>
              <p className="text-sm text-gray-600 mt-3">
                Esta ação removerá permanentemente este imóvel e todas as suas informações do sistema.
              </p>
            </div>
            
            <div className="flex justify-end space-x-3">
              <button
                onClick={handleCancelDelete}
                className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Excluir Imóvel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfessionalProperties;