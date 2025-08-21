import React, { useState } from 'react';
import { Search, Filter, UserCheck, UserX, Edit, MoreHorizontal, Trash2, X, CreditCard } from 'lucide-react';
import { useAdminUsers } from '../../hooks/useAdminUsers';
import { usePlans } from '../../hooks/usePlans';

const AdminUsers: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [editingUser, setEditingUser] = useState<any>(null);
  const [editForm, setEditForm] = useState({
    name: '',
    email: '',
    phone: '',
    city: '',
    creci: '',
    userType: 'particular' as 'admin' | 'corretoria' | 'particular'
  });
  const [approvingUser, setApprovingUser] = useState<any>(null);
  const [passwordForm, setPasswordForm] = useState({
    password: '',
    confirmPassword: ''
  });
  const [planModalUser, setPlanModalUser] = useState<any>(null);
  const [selectedPlanId, setSelectedPlanId] = useState('');
  const [isUpdatingPlan, setIsUpdatingPlan] = useState(false);
  
  const { 
    users, 
    registrationRequests, 
    loading, 
    error, 
    fetchUsers,
    approveUser, 
    rejectUser, 
    updateUser,
    deleteUser,
    assignPlanToUser,
    removePlanFromUser
  } = useAdminUsers();
  
  const { plans } = usePlans();
  
  // Combinar usuários e solicitações para exibição
  const allUsersData = [
    ...users.map(user => ({
      id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone || 'Não informado',
      city: user.city || 'Não informado',
      creci: user.creci || 'N/A',
      userType: user.userType,
      status: user.isApproved ? 'approved' : 'pending',
      dateJoined: user.createdAt,
      initials: user.name.charAt(0).toUpperCase(),
      isRequest: false,
      // Incluir dados do plano
      activePlan: user.activePlan,
      planStartDate: user.planStartDate,
      planEndDate: user.planEndDate,
      publishedProperties: user.publishedProperties
    })),
    ...registrationRequests.map(request => ({
      id: request._id,
      name: request.name,
      email: request.email,
      phone: request.phone || 'Não informado',
      city: request.city || 'Não informado',
      creci: request.creci || 'N/A',
      userType: request.userType,
      status: 'pending',
      dateJoined: request.createdAt,
      initials: request.name.charAt(0).toUpperCase(),
      isRequest: true
    }))
  ];

  // Filtrar usuários
  const filteredUsers = allUsersData.filter(user => {
    // Filtrar por termo de busca
    if (searchTerm && !user.name.toLowerCase().includes(searchTerm.toLowerCase()) && !user.email.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }
    
    // Filtrar por tipo de usuário
    if (filterRole !== 'all' && user.userType !== filterRole) {
      return false;
    }
    
    // Filtrar por status
    if (filterStatus !== 'all' && user.status !== filterStatus) {
      return false;
    }
    
    return true;
  });

  const handleApprove = (user: any) => {
    setApprovingUser(user);
    setPasswordForm({
      password: '',
      confirmPassword: ''
    });
  };

  const handleReject = async (userId: string) => {
    const success = await rejectUser(userId);
    if (!success && error) {
      alert(`Erro ao rejeitar usuário: ${error}`);
    }
  };

  const handleDelete = async (userId: string) => {
    if (window.confirm('Tem certeza que deseja deletar este usuário?')) {
      const success = await deleteUser(userId);
      if (!success && error) {
        alert(`Erro ao deletar usuário: ${error}`);
      }
    }
  };

  const handleEditUser = (user: any) => {
    setEditingUser(user);
    setEditForm({
      name: user.name || '',
      email: user.email || '',
      phone: user.phone || '',
      city: user.city || '',
      creci: user.creci || '',
      userType: user.userType || 'particular'
    });
  };

  const handleCloseModal = () => {
    setEditingUser(null);
    setEditForm({
      name: '',
      email: '',
      phone: '',
      city: '',
      creci: '',
      userType: 'particular'
    });
  };

  const handleSaveUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;

    const success = await updateUser(editingUser.id, {
      name: editForm.name,
      email: editForm.email,
      phone: editForm.phone,
      city: editForm.city,
      creci: editForm.creci,
      userType: editForm.userType
    });

    if (success) {
      handleCloseModal();
    } else if (error) {
      alert(`Erro ao atualizar usuário: ${error}`);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setEditForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleClosePasswordModal = () => {
    setApprovingUser(null);
    setPasswordForm({
      password: '',
      confirmPassword: ''
    });
  };

  const handleConfirmApproval = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!approvingUser) return;

    if (passwordForm.password !== passwordForm.confirmPassword) {
      alert('As senhas não coincidem!');
      return;
    }

    if (passwordForm.password.length < 6) {
      alert('A senha deve ter pelo menos 6 caracteres!');
      return;
    }

    const success = await approveUser(approvingUser.id, passwordForm.password);
    if (success) {
      handleClosePasswordModal();
    } else if (error) {
      alert(`Erro ao aprovar usuário: ${error}`);
    }
  };

  const handleManagePlan = (user: any) => {
    setPlanModalUser(user);
    setSelectedPlanId(user.activePlan?._id || '');
  };

  const handleClosePlanModal = () => {
    setPlanModalUser(null);
    setSelectedPlanId('');
    setIsUpdatingPlan(false);
  };

  const handleAssignPlan = async () => {
    if (!planModalUser || !selectedPlanId) return;

    setIsUpdatingPlan(true);
    
    try {
      const success = await assignPlanToUser(planModalUser.id, selectedPlanId);
      if (success) {
        // Forçar atualização imediata dos dados
        await fetchUsers();
        // Fechar modal imediatamente após sucesso
        handleClosePlanModal();
      } else {
        if (error) {
          alert(`Erro ao atribuir plano: ${error}`);
        }
      }
    } catch (err) {
      console.error('Erro ao atribuir plano:', err);
      alert(`Erro ao atribuir plano: ${err}`);
    } finally {
      setIsUpdatingPlan(false);
    }
  };

  const handleRemovePlan = async () => {
    if (!planModalUser) return;

    if (window.confirm('Tem certeza que deseja remover o plano deste usuário?')) {
      setIsUpdatingPlan(true);
      
      try {
        const success = await removePlanFromUser(planModalUser.id);
        if (success) {
          // Forçar atualização imediata dos dados
          await fetchUsers();
          // Fechar modal imediatamente após sucesso
          handleClosePlanModal();
        } else {
          if (error) {
            alert(`Erro ao remover plano: ${error}`);
          }
        }
      } catch (err) {
        console.error('Erro ao remover plano:', err);
        alert(`Erro ao remover plano: ${err}`);
      } finally {
        setIsUpdatingPlan(false);
      }
    }
  };

  const formatPlanInfo = (user: any) => {
    if (!user.activePlan) {
      return 'Sem plano';
    }
    
    const planEndDate = user.planEndDate ? new Date(user.planEndDate) : null;
    const isExpired = planEndDate && planEndDate < new Date();
    
    return {
      name: user.activePlan.name,
      isExpired,
      usage: `${user.publishedProperties || 0}/${user.activePlan.maxProperties}`,
      endDate: planEndDate
    };
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const getUserTypeLabel = (userType: string) => {
    switch (userType) {
      case 'admin': return 'Administrador';
      case 'corretoria': return 'Corretor';
      case 'particular': return 'Usuário';
      default: return userType;
    }
  };

  const getUserStatusLabel = (status: string) => {
    switch (status) {
      case 'approved': return 'Aprovado';
      case 'pending': return 'Pendente';
      default: return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getUserTypeColor = (userType: string) => {
    switch (userType) {
      case 'admin': return 'bg-purple-100 text-purple-800';
      case 'corretoria': return 'bg-blue-100 text-blue-800';
      case 'particular': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('pt-BR').format(date);
  };

  return (
    <div>
      <h1 className="text-2xl font-semibold text-gray-800 mb-6">Gerenciamento de Usuários</h1>
      
      {/* Filtros e busca */}
      <div className="bg-white p-4 rounded-lg shadow-md mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md"
                placeholder="Buscar usuários..."
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
                  value={filterRole}
                  onChange={(e) => setFilterRole(e.target.value)}
                >
                  <option value="all">Todos os tipos</option>
                  <option value="admin">Administradores</option>
                  <option value="corretoria">Corretores</option>
                  <option value="particular">Usuários</option>
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
                  <option value="approved">Aprovados</option>
                  <option value="pending">Pendentes</option>
                </select>
              </div>
            </div>
          </div>
        </div>
        
        <div className="mt-4">
          <div className="text-sm text-gray-500">
            {filteredUsers.length} {filteredUsers.length === 1 ? 'usuário encontrado' : 'usuários encontrados'}
          </div>
        </div>
      </div>
      
      {/* Tabela de Usuários */}
      <div className="bg-white overflow-hidden shadow-md rounded-lg">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Usuário
                </th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contato
                </th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tipo
                </th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Plano
                </th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Data de Cadastro
                </th>
                <th scope="col" className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredUsers.map((user) => (
                <tr key={user.id}>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-medium">
                          {user.initials}
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{user.name}</div>
                        <div className="text-sm text-gray-500">{user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      <div className="font-medium">{user.phone}</div>
                      <div className="text-gray-500">{user.city}</div>
                      {user.creci !== 'N/A' && (
                        <div className="text-xs text-blue-600">CRECI: {user.creci}</div>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getUserTypeColor(user.userType)}`}>
                      {getUserTypeLabel(user.userType)}
                    </span>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    {(() => {
                      const planInfo = formatPlanInfo(user);
                      if (planInfo === 'Sem plano') {
                        return (
                          <span className="text-sm text-gray-500">
                            {planInfo}
                          </span>
                        );
                      }
                      return (
                        <div className="text-sm">
                          <div className={`font-medium ${planInfo.isExpired ? 'text-red-600' : 'text-gray-900'}`}>
                            {planInfo.name}
                            {planInfo.isExpired && ' (Expirado)'}
                          </div>
                          <div className="text-xs text-gray-500">
                            {planInfo.usage} imóveis
                          </div>
                        </div>
                      );
                    })()}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(user.status)}`}>
                      {getUserStatusLabel(user.status)}
                    </span>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(user.dateJoined)}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-center text-sm font-medium">
                    <div className="flex justify-center space-x-2">
                      {user.status === 'pending' && (
                        <>
                          <button 
                            onClick={() => handleApprove(user)}
                            className="text-green-600 hover:text-green-900"
                            title="Aprovar usuário"
                          >
                            <UserCheck className="w-5 h-5" />
                          </button>
                          <button 
                            onClick={() => handleReject(user.id)}
                            className="text-red-600 hover:text-red-900"
                            title="Rejeitar usuário"
                          >
                            <UserX className="w-5 h-5" />
                          </button>
                        </>
                      )}
                      <button 
                        onClick={() => handleEditUser(user)}
                        className="text-blue-600 hover:text-blue-900"
                        title="Editar usuário"
                      >
                        <Edit className="w-5 h-5" />
                      </button>
                      {user.status === 'approved' && user.userType !== 'admin' && (
                        <button 
                          onClick={() => handleManagePlan(user)}
                          className="text-purple-600 hover:text-purple-900"
                          title="Gerenciar plano"
                        >
                          <CreditCard className="w-5 h-5" />
                        </button>
                      )}
                      {!user.isRequest && (
                        <button 
                          onClick={() => handleDelete(user.id)}
                          className="text-red-600 hover:text-red-900"
                          title="Deletar usuário"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      {filteredUsers.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">Nenhum usuário encontrado com os filtros aplicados.</p>
        </div>
      )}
      
      <div className="bg-white mt-6 px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6 rounded-lg shadow-md">
        <div className="flex-1 flex justify-between items-center">
          <div>
            <p className="text-sm text-gray-700">
              Mostrando <span className="font-medium">1</span> a <span className="font-medium">{filteredUsers.length}</span> de <span className="font-medium">{allUsersData.length}</span> usuários
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

      {/* Modal de Edição */}
      {editingUser && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">Editar Usuário</h3>
              <button
                onClick={handleCloseModal}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <form onSubmit={handleSaveUser}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nome
                </label>
                <input
                  type="text"
                  name="name"
                  value={editForm.name}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={editForm.email}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Telefone
                </label>
                <input
                  type="text"
                  name="phone"
                  value={editForm.phone}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cidade
                </label>
                <input
                  type="text"
                  name="city"
                  value={editForm.city}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  CRECI
                </label>
                <input
                  type="text"
                  name="creci"
                  value={editForm.creci}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tipo de Usuário
                </label>
                <select
                  name="userType"
                  value={editForm.userType}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="particular">Usuário</option>
                  <option value="corretoria">Corretor</option>
                  <option value="admin">Administrador</option>
                </select>
              </div>
              

              
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  Salvar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Definição de Senha para Aprovação */}
      {approvingUser && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">Definir Senha para Aprovação</h3>
              <button
                onClick={handleClosePasswordModal}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="mb-4">
              <p className="text-sm text-gray-600">
                Aprovando usuário: <strong>{approvingUser.name}</strong>
              </p>
              <p className="text-sm text-gray-600">
                Email: <strong>{approvingUser.email}</strong>
              </p>
            </div>
            
            <form onSubmit={handleConfirmApproval}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nova Senha
                </label>
                <input
                  type="password"
                  name="password"
                  value={passwordForm.password}
                  onChange={handlePasswordChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Digite a senha (mínimo 6 caracteres)"
                  required
                  minLength={6}
                />
              </div>
              
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Confirmar Senha
                </label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={passwordForm.confirmPassword}
                  onChange={handlePasswordChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Confirme a senha"
                  required
                  minLength={6}
                />
              </div>
              
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={handleClosePasswordModal}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  Aprovar e Definir Senha
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Gerenciamento de Planos */}
      {planModalUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Gerenciar Plano
              </h3>
              <button
                onClick={handleClosePlanModal}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="mb-4">
              <p className="text-sm text-gray-600">
                Usuário: <strong>{planModalUser.name}</strong>
              </p>
              <p className="text-sm text-gray-600">
                Email: <strong>{planModalUser.email}</strong>
              </p>
              {planModalUser.activePlan && (
                <div className="mt-2 p-2 bg-gray-50 rounded">
                  <p className="text-sm text-gray-600">
                    Plano atual: <strong>{planModalUser.activePlan.name}</strong>
                  </p>
                  <p className="text-xs text-gray-500">
                    {planModalUser.publishedProperties || 0}/{planModalUser.activePlan.maxProperties} imóveis publicados
                  </p>
                </div>
              )}
            </div>
            
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Selecionar Plano
              </label>
              <select
                value={selectedPlanId}
                onChange={(e) => setSelectedPlanId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Selecione um plano</option>
                {plans.filter(plan => plan.isActive).map(plan => (
                  <option key={plan._id} value={plan._id}>
                    {plan.name} - {plan.maxProperties} imóveis
                  </option>
                ))}
              </select>
            </div>
            
            <div className="flex justify-end space-x-3">
              {planModalUser.activePlan && (
                <button
                  onClick={handleRemovePlan}
                  disabled={isUpdatingPlan}
                  className="px-4 py-2 text-sm font-medium text-red-700 bg-red-100 border border-red-300 rounded-md hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isUpdatingPlan ? 'Removendo...' : 'Remover Plano'}
                </button>
              )}
              <button
                onClick={handleClosePlanModal}
                disabled={isUpdatingPlan}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancelar
              </button>
              <button
                onClick={handleAssignPlan}
                disabled={!selectedPlanId || isUpdatingPlan}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isUpdatingPlan ? 'Atualizando...' : (planModalUser.activePlan ? 'Alterar Plano' : 'Atribuir Plano')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUsers;