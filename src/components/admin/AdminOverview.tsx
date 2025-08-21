import React from 'react';
import { Users, Home, FileText, UserCheck, UserX, Clock, Building } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAdminUsers } from '../../hooks/useAdminUsers';
import { useAdminProperties } from '../../hooks/useAdminProperties';
import { useAdminNews } from '../../hooks/useAdminNews';
import { useAdminPropertyRequests } from '../../hooks/useAdminPropertyRequests';

const AdminOverview: React.FC = () => {
  const { users, registrationRequests, approveUser, rejectUser, loading: usersLoading, error: usersError } = useAdminUsers();
  const { properties, loading: propertiesLoading, error: propertiesError } = useAdminProperties();
  const { news, loading: newsLoading, error: newsError } = useAdminNews();
  const { propertyRequests, approvePropertyRequest, rejectPropertyRequest, loading: propertyRequestsLoading, error: propertyRequestsError } = useAdminPropertyRequests();
  // Estatísticas baseadas nos dados reais
  const stats = [
    {
      title: 'Total de Usuários',
      value: users.length,
      change: '+12%',
      changeType: 'positive',
      icon: <Users className="w-8 h-8 text-blue-500" />,
      path: '/admin/usuarios',
      color: 'blue'
    },
    {
      title: 'Imóveis Cadastrados',
      value: properties.length,
      change: '+8%',
      changeType: 'positive',
      icon: <Home className="w-8 h-8 text-green-500" />,
      path: '/admin/propriedades',
      color: 'green'
    },
    {
      title: 'Notícias Publicadas',
      value: news.length,
      change: '+15%',
      changeType: 'positive',
      icon: <FileText className="w-8 h-8 text-yellow-500" />,
      path: '/admin/noticias',
      color: 'yellow'
    },
    {
      title: 'Solicitações Pendentes',
      value: registrationRequests.length + propertyRequests.filter(req => req.status === 'pending').length,
      change: (registrationRequests.length + propertyRequests.filter(req => req.status === 'pending').length) > 0 ? 'Ação necessária' : 'Tudo em dia',
      changeType: (registrationRequests.length + propertyRequests.filter(req => req.status === 'pending').length) > 0 ? 'negative' : 'positive',
      icon: <Clock className="w-8 h-8 text-orange-500" />,
      path: '/admin/usuarios',
      color: 'orange'
    }
  ];

  // Funções de manipulação
  const handleApprove = async (userId: string) => {
    try {
      await approveUser(userId);
    } catch (error) {
      console.error('Erro ao aprovar usuário:', error);
    }
  };

  const handleReject = async (userId: string) => {
    try {
      await rejectUser(userId);
    } catch (error) {
      console.error('Erro ao rejeitar usuário:', error);
    }
  };

  const handleApprovePropertyRequest = async (requestId: string) => {
    const success = await approvePropertyRequest(requestId);
    if (success) {
      // Dados serão atualizados automaticamente pelos hooks
    }
  };

  const handleRejectPropertyRequest = async (requestId: string) => {
    const success = await rejectPropertyRequest(requestId);
    if (success) {
      // Dados serão atualizados automaticamente pelos hooks
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  // TODO: Implementar sistema de logs de atividades
  const recentActivities: any[] = [];

  // Verificar se há erros
  const hasErrors = usersError || propertiesError || newsError || propertyRequestsError;
  const isLoading = usersLoading || propertiesLoading || newsLoading || propertyRequestsLoading;

  return (
    <div>
      <h1 className="text-2xl font-semibold text-gray-800 mb-6">Visão Geral do Sistema</h1>
      
      {/* Exibir erros se houver */}
      {hasErrors && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <h3 className="text-red-800 font-medium mb-2">Erro ao carregar dados:</h3>
          <ul className="text-red-700 text-sm space-y-1">
            {usersError && <li>• Usuários: {usersError}</li>}
            {propertiesError && <li>• Propriedades: {propertiesError}</li>}
            {newsError && <li>• Notícias: {newsError}</li>}
            {propertyRequestsError && <li>• Solicitações de Propriedades: {propertyRequestsError}</li>}
          </ul>
        </div>
      )}
      
      {/* Indicador de carregamento */}
      {isLoading && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex items-center">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-3"></div>
            <span className="text-blue-800">Carregando dados do sistema...</span>
          </div>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {stats.map((stat, index) => (
          <Link 
            key={index}
            to={stat.path}
            className={`bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow duration-300 border-t-4 ${
              stat.color === 'blue' ? 'border-blue-500' :
              stat.color === 'green' ? 'border-green-500' :
              stat.color === 'yellow' ? 'border-yellow-500' :
              stat.color === 'orange' ? 'border-orange-500' :
              'border-gray-500'
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium">{stat.title}</p>
                <p className="text-3xl font-bold text-gray-800 mt-1">{stat.value}</p>
              </div>
              {stat.icon}
            </div>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Registration Requests */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-800">Solicitações de Cadastro</h2>
            <Link to="/admin/usuarios" className="text-blue-600 text-sm hover:text-blue-800">
              Ver todos
            </Link>
          </div>

          <div className="space-y-2">
            {registrationRequests.slice(0, 5).map((request) => (
              <div key={request._id} className="border border-gray-200 rounded-lg p-3 bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-gray-900 truncate">{request.name}</div>
                    <div className="text-xs text-gray-500 truncate">{request.email}</div>
                  </div>
                  <div className="flex items-center space-x-2 ml-2">
                    <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                      {request.userType === 'corretoria' ? 'Corretor' : 'Particular'}
                    </span>
                    <div className="text-xs text-gray-500">
                      {formatDate(request.createdAt)}
                    </div>
                    <div className="flex space-x-1">
                      <button 
                        onClick={() => handleApprove(request._id)}
                        className="text-green-600 hover:text-green-900"
                        title="Aprovar usuário"
                      >
                        <UserCheck className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleReject(request._id)}
                        className="text-red-600 hover:text-red-900"
                        title="Rejeitar usuário"
                      >
                        <UserX className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            {registrationRequests.length === 0 && (
              <div className="text-center py-6 text-gray-500">
                Nenhuma solicitação pendente
              </div>
            )}
          </div>
        </div>

        {/* Property Requests */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-800">Solicitações de Imóveis</h2>
            <Link to="/admin/solicitacoes-imoveis" className="text-blue-600 text-sm hover:text-blue-800">
              Ver todos
            </Link>
          </div>

          <div className="space-y-2">
            {propertyRequests.filter(req => req.status === 'pending').slice(0, 5).map((request) => (
              <div key={request._id} className="border border-gray-200 rounded-lg p-3 bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-gray-900 truncate">{request.name}</div>
                    <div className="text-xs text-gray-500 truncate">{request.email}</div>
                  </div>
                  <div className="flex items-center space-x-2 ml-2">
                    <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                      {request.propertyType || 'Imóvel'}
                    </span>
                    <div className="text-xs text-gray-500">
                      {formatDate(request.createdAt)}
                    </div>
                    <div className="flex space-x-1">
                      <button 
                        onClick={() => handleApprovePropertyRequest(request._id)}
                        className="text-green-600 hover:text-green-900"
                        title="Aprovar solicitação"
                      >
                        <UserCheck className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleRejectPropertyRequest(request._id)}
                        className="text-red-600 hover:text-red-900"
                        title="Rejeitar solicitação"
                      >
                        <UserX className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            {propertyRequests.filter(req => req.status === 'pending').length === 0 && (
              <div className="text-center py-6 text-gray-500">
                Nenhuma solicitação pendente
              </div>
            )}
          </div>
        </div>

        {/* Recent Activities */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Atividades Recentes</h2>
          <div className="space-y-4">
            {recentActivities.length > 0 ? (
              recentActivities.map((activity) => (
                <div key={activity.id} className="flex items-start">
                  <div className="flex-shrink-0 mt-1">
                    <Clock className="w-5 h-5 text-gray-400" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-800">{activity.action}</p>
                    <div className="flex space-x-2 text-xs text-gray-500">
                      <span>{activity.user?.name || activity.user}</span>
                      <span>•</span>
                      <span>{activity.date}</span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <Clock className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">Nenhuma atividade recente</p>
                <p className="text-sm text-gray-400 mt-1">Sistema de logs será implementado em breve</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminOverview;