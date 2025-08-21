import React, { useState } from 'react';
import { UserCheck, UserX, Clock, Mail, Phone, MapPin, Home, Filter, Search } from 'lucide-react';
import { useAdminPropertyRequests } from '../../hooks/useAdminPropertyRequests';

const PropertyRequestsPage: React.FC = () => {
  const { 
    propertyRequests, 
    loading, 
    error, 
    approvePropertyRequest, 
    rejectPropertyRequest 
  } = useAdminPropertyRequests();
  
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Pendente';
      case 'approved':
        return 'Aprovada';
      case 'rejected':
        return 'Rejeitada';
      default:
        return status;
    }
  };

  const getPropertyTypeText = (type: string) => {
    const types: { [key: string]: string } = {
      'casa': 'Casa',
      'apartamento': 'Apartamento',
      'terreno': 'Terreno',
      'comercial': 'Comercial',
      'rural': 'Rural'
    };
    return types[type] || type;
  };

  const handleApprove = async (requestId: string) => {
    const success = await approvePropertyRequest(requestId);
    if (success) {
      // Feedback visual pode ser adicionado aqui
    }
  };

  const handleReject = async (requestId: string) => {
    const success = await rejectPropertyRequest(requestId);
    if (success) {
      // Feedback visual pode ser adicionado aqui
    }
  };

  // Filtrar solicitações
  const filteredRequests = propertyRequests.filter(request => {
    const matchesStatus = statusFilter === 'all' || request.status === statusFilter;
    const matchesSearch = searchTerm === '' || 
      request.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.city.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesStatus && matchesSearch;
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">Carregando solicitações...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <h3 className="text-red-800 font-medium mb-2">Erro ao carregar solicitações</h3>
        <p className="text-red-700">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-800">Solicitações de Imóveis</h1>
        <div className="text-sm text-gray-500">
          Total: {propertyRequests.length} solicitações
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Busca */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Buscar por nome, email ou cidade..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          
          {/* Filtro de Status */}
          <div className="flex items-center space-x-2">
            <Filter className="text-gray-400 w-5 h-5" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Todos os status</option>
              <option value="pending">Pendentes</option>
              <option value="approved">Aprovadas</option>
              <option value="rejected">Rejeitadas</option>
            </select>
          </div>
        </div>
      </div>

      {/* Lista de Solicitações */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {filteredRequests.length === 0 ? (
          <div className="text-center py-12">
            <Home className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhuma solicitação encontrada</h3>
            <p className="text-gray-500">
              {searchTerm || statusFilter !== 'all' 
                ? 'Tente ajustar os filtros de busca'
                : 'Ainda não há solicitações de imóveis'
              }
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredRequests.map((request) => (
              <div key={request._id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-3 mb-3">
                      <h3 className="text-lg font-medium text-gray-900 truncate">
                        {request.name}
                      </h3>
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(request.status)}`}>
                        {getStatusText(request.status)}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm text-gray-600">
                      <div className="flex items-center space-x-2">
                        <Mail className="w-4 h-4 text-gray-400" />
                        <span className="truncate">{request.email}</span>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Phone className="w-4 h-4 text-gray-400" />
                        <span>{request.phone}</span>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <MapPin className="w-4 h-4 text-gray-400" />
                        <span>{request.city}</span>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Home className="w-4 h-4 text-gray-400" />
                        <span>{getPropertyTypeText(request.propertyType)}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-4 mt-3 text-xs text-gray-500">
                      <div className="flex items-center space-x-1">
                        <Clock className="w-3 h-3" />
                        <span>Criada em {formatDate(request.createdAt)}</span>
                      </div>
                      
                      {request.processedAt && (
                        <div className="flex items-center space-x-1">
                          <Clock className="w-3 h-3" />
                          <span>Processada em {formatDate(request.processedAt)}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Ações */}
                  {request.status === 'pending' && (
                    <div className="flex items-center space-x-2 ml-4">
                      <button
                        onClick={() => handleApprove(request._id)}
                        className="flex items-center space-x-1 px-3 py-1 text-sm bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors"
                        title="Aprovar solicitação"
                      >
                        <UserCheck className="w-4 h-4" />
                        <span>Aprovar</span>
                      </button>
                      
                      <button
                        onClick={() => handleReject(request._id)}
                        className="flex items-center space-x-1 px-3 py-1 text-sm bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
                        title="Rejeitar solicitação"
                      >
                        <UserX className="w-4 h-4" />
                        <span>Rejeitar</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="text-2xl font-bold text-yellow-600">
            {propertyRequests.filter(r => r.status === 'pending').length}
          </div>
          <div className="text-sm text-gray-600">Pendentes</div>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="text-2xl font-bold text-green-600">
            {propertyRequests.filter(r => r.status === 'approved').length}
          </div>
          <div className="text-sm text-gray-600">Aprovadas</div>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="text-2xl font-bold text-red-600">
            {propertyRequests.filter(r => r.status === 'rejected').length}
          </div>
          <div className="text-sm text-gray-600">Rejeitadas</div>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="text-2xl font-bold text-blue-600">
            {propertyRequests.length}
          </div>
          <div className="text-sm text-gray-600">Total</div>
        </div>
      </div>
    </div>
  );
};

export default PropertyRequestsPage;