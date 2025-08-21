import React, { useState } from 'react';
import { Search, Filter, Star, X, Check, Trash2, Edit, Eye, Plus } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAdminProperties } from '../../hooks/useAdminProperties';
import { toast } from 'react-hot-toast';

const AdminProperties: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterAvailability, setFilterAvailability] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [propertyToDelete, setPropertyToDelete] = useState<{id: string, title: string} | null>(null);
  const navigate = useNavigate();
  
  const { 
    properties, 
    loading, 
    error, 
    toggleFeatured, 
    deleteProperty 
  } = useAdminProperties();
  
  // Mapear propriedades para o formato esperado
  // Mapear propriedades para o formato esperado
  const propertiesData = properties.map(property => ({
    id: property._id,
    reference: property.reference,
    title: property.title,
    price: property.price,
    owner: property.ownerName || 'Proprietário',
    ownerId: property.ownerId,
    category: property.category,
    availability: property.availability,
    address: `${property.address.neighborhood}, ${property.address.city}`,
    bedrooms: property.bedrooms,
    bathrooms: property.bathrooms,
    area: property.totalArea,
    isFeatured: property.isFeatured,
    isActive: property.isActive,
    createdAt: property.createdAt,
    photo: property.photos[0] || 'https://images.pexels.com/photos/1396132/pexels-photo-1396132.jpeg',
    views: property.views || 0
  }));

  // Funções de manipulação
  const handleToggleFeatured = async (propertyId: string) => {
    try {
      await toggleFeatured(propertyId);
    } catch (error) {
      console.error('Erro ao alterar destaque:', error);
    }
  };

  const handleDeleteClick = (propertyId: string, propertyTitle: string) => {
    setPropertyToDelete({ id: propertyId, title: propertyTitle });
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!propertyToDelete) return;
    
    try {
      await deleteProperty(propertyToDelete.id);
      toast.success('Imóvel excluído com sucesso!');
      setShowDeleteModal(false);
      setPropertyToDelete(null);
    } catch (error) {
      console.error('Erro ao excluir propriedade:', error);
      toast.error('Erro ao excluir imóvel');
    }
  };

  const handleCancelDelete = () => {
    setShowDeleteModal(false);
    setPropertyToDelete(null);
  };

  const handleEdit = (propertyReference: string) => {
    navigate(`/admin/propriedades/editar/${propertyReference}`);
  };

  // Filtrar e ordenar propriedades
  const filteredProperties = propertiesData
    .filter(property => {
      // Filtrar por termo de busca
      if (searchTerm && !property.title.toLowerCase().includes(searchTerm.toLowerCase()) && !property.address.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false;
      }
      
      // Filtrar por categoria
      if (filterCategory !== 'all' && property.category !== filterCategory) {
        return false;
      }
      
      // Filtrar por disponibilidade
      if (filterAvailability !== 'all' && property.availability !== filterAvailability && property.availability !== 'both') {
        return false;
      }
      
      // Filtrar por status
      if (filterStatus === 'active' && !property.isActive) {
        return false;
      } else if (filterStatus === 'inactive' && property.isActive) {
        return false;
      } else if (filterStatus === 'featured' && !property.isFeatured) {
        return false;
      }
      
      return true;
    })
    .sort((a, b) => {
      // Ordenar por data, preço ou visualizações
      if (sortBy === 'newest') {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      } else if (sortBy === 'oldest') {
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      } else if (sortBy === 'price_high') {
        return b.price - a.price;
      } else if (sortBy === 'price_low') {
        return a.price - b.price;
      } else if (sortBy === 'views') {
        return b.views - a.views;
      }
      return 0;
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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('pt-BR').format(date);
  };



  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-600">Erro ao carregar propriedades: {error}</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-800">Gerenciamento de Imóveis</h1>
        <Link
          to="/admin/propriedades/novo"
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <Plus className="w-4 h-4 mr-2" />
          Nova Propriedade
        </Link>
      </div>
      
      {/* Filtros e busca */}
      <div className="bg-white p-4 rounded-lg shadow-md mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md"
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
                  className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md"
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                >
                  <option value="all">Todos os tipos</option>
                  <option value="apartment">Apartamentos</option>
                  <option value="house">Casas</option>
                  <option value="commercial">Comercial</option>
                  <option value="land">Terrenos</option>
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
                  className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md"
                  value={filterAvailability}
                  onChange={(e) => setFilterAvailability(e.target.value)}
                >
                  <option value="all">Todas as disponibilidades</option>
                  <option value="sale">Venda</option>
                  <option value="rent">Aluguel</option>
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
                  className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md"
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                >
                  <option value="all">Todos os status</option>
                  <option value="active">Ativos</option>
                  <option value="inactive">Inativos</option>
                  <option value="featured">Em destaque</option>
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
              className="focus:ring-blue-500 focus:border-blue-500 border border-gray-300 rounded-md text-sm"
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
      
      {/* Tabela de Propriedades */}
      <div className="bg-white overflow-hidden shadow-md rounded-lg">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Imóvel
                </th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Proprietário
                </th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Detalhes
                </th>
                <th scope="col" className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredProperties.map((property) => (
                <tr key={property.id} className={!property.isActive ? 'bg-gray-50' : ''}>
                  <td className="px-4 py-4">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-16 w-16 mr-3">
                        <img className="h-16 w-16 object-cover rounded-md" src={property.photo} alt={property.title} />
                      </div>
                      <div className="truncate max-w-xs">
                        <div className="text-sm font-medium text-gray-900">{property.title}</div>
                        <div className="text-sm text-gray-500">{property.address}</div>
                        <div className="text-sm font-semibold text-green-600">{formatPrice(property.price, property.availability)}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{property.owner}</div>
                    <div className="text-xs text-gray-500">ID: {String(property.ownerId)}</div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{getCategoryLabel(property.category)}</div>
                    <div className="text-sm text-gray-500">{property.area} m²</div>
                    {property.bedrooms > 0 && (
                      <div className="text-sm text-gray-500">
                        {property.bedrooms} {property.bedrooms === 1 ? 'quarto' : 'quartos'}
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-center">
                    <div className="flex flex-col items-center space-y-1">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        property.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {property.isActive ? 'Ativo' : 'Inativo'}
                      </span>
                      {property.isFeatured && (
                        <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                          Destaque
                        </span>
                      )}
                      <div className="text-xs text-gray-500">
                        {formatDate(property.createdAt)}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-right">
                    <div className="flex justify-end space-x-1">
                      <button
                        onClick={() => handleToggleFeatured(property.id)}
                        className={`p-1 rounded-full ${
                          property.isFeatured ? 'bg-yellow-100 text-yellow-600' : 'bg-gray-100 text-gray-600'
                        } hover:bg-yellow-200`}
                        title={property.isFeatured ? "Remover destaque" : "Destacar imóvel"}
                      >
                        <Star className="w-5 h-5" fill={property.isFeatured ? "currentColor" : "none"} />
                      </button>
                      
                      <button
                        className={`p-1 rounded-full ${
                          property.isActive ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-600'
                        } hover:bg-green-200`}
                        title={property.isActive ? "Imóvel ativo" : "Imóvel inativo"}
                        disabled
                      >
                        {property.isActive ? (
                          <Check className="w-5 h-5" />
                        ) : (
                          <X className="w-5 h-5" />
                        )}
                      </button>
                      
                      <button
                        onClick={() => handleEdit(property.reference)}
                        className="p-1 rounded-full bg-blue-100 text-blue-600 hover:bg-blue-200"
                        title="Editar imóvel"
                      >
                        <Edit className="w-5 h-5" />
                      </button>
                      
                      <button
                        onClick={() => handleDeleteClick(property.id, property.title)}
                        className="p-1 rounded-full bg-red-100 text-red-600 hover:bg-red-200"
                        title="Excluir imóvel"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      {filteredProperties.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">Nenhum imóvel encontrado com os filtros aplicados.</p>
        </div>
      )}
      
      <div className="bg-white mt-6 px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6 rounded-lg shadow-md">
        <div className="flex-1 flex justify-between items-center">
          <div>
            <p className="text-sm text-gray-700">
              Mostrando <span className="font-medium">1</span> a <span className="font-medium">{filteredProperties.length}</span> de <span className="font-medium">{propertiesData.length}</span> imóveis
            </p>
          </div>
          <div>
            <nav className="relative z-0 inline-flex shadow-sm -space-x-px" aria-label="Paginação">
              <button className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
                Anterior
              </button>
              <button className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50">
                1
              </button>
              <button className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
                Próxima
              </button>
            </nav>
          </div>
        </div>
      </div>

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

export default AdminProperties;