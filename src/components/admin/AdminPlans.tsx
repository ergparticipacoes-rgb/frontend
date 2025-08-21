import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Users, DollarSign, Calendar, CheckCircle, XCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { API_CONFIG } from '../../config/api';

interface Plan {
  _id: string;
  name: string;
  description: string;
  maxProperties: number;
  price: number;
  duration: number;
  features: string[];
  isActive: boolean;
  priority: number;
  createdAt: string;
  updatedAt: string;
}

interface User {
  _id: string;
  name: string;
  email: string;
  userType: string;
  activePlan?: Plan;
  planStartDate?: string;
  planEndDate?: string;
  publishedProperties: number;
}

const AdminPlans: React.FC = () => {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showPlanModal, setShowPlanModal] = useState(false);
  const [showUserPlanModal, setShowUserPlanModal] = useState(false);
  const [editingPlan, setEditingPlan] = useState<Plan | null>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState<'plans' | 'users'>('plans');

  const [planForm, setPlanForm] = useState({
    name: '',
    description: '',
    maxProperties: 0,
    price: 0,
    duration: 30,
    features: [''],
    isActive: true,
    priority: 1
  });

  useEffect(() => {
    fetchPlans();
    fetchUsers();
  }, []);

  const fetchPlans = async () => {
    try {
      const userStr = localStorage.getItem('user');
      const user = userStr ? JSON.parse(userStr) : null;
      const token = user?.token;
      
      if (!token) {
        console.error('Token não encontrado');
        return;
      }
      
      const response = await fetch(`${API_CONFIG.BASE_URL}/plans/admin/all`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setPlans(data);
      }
    } catch (error) {
      console.error('Erro ao buscar planos:', error);
      toast.error('Erro ao carregar planos');
    }
  };

  const fetchUsers = async () => {
    try {
      const userStr = localStorage.getItem('user');
      const user = userStr ? JSON.parse(userStr) : null;
      const token = user?.token;
      
      if (!token) {
        console.error('Token não encontrado');
        setLoading(false);
        return;
      }
      
      const response = await fetch(`${API_CONFIG.BASE_URL}/users`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setUsers(data.filter((user: User) => user.userType !== 'admin'));
      }
    } catch (error) {
      console.error('Erro ao buscar usuários:', error);
      toast.error('Erro ao carregar usuários');
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const userStr = localStorage.getItem('user');
      const user = userStr ? JSON.parse(userStr) : null;
      const token = user?.token;
      const method = editingPlan ? 'PUT' : 'POST';
      const url = editingPlan ? `${API_CONFIG.BASE_URL}/plans/${editingPlan._id}` : `${API_CONFIG.BASE_URL}/plans`;
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...planForm,
          features: planForm.features.filter(f => f.trim() !== '')
        })
      });
      
      if (response.ok) {
        toast.success(editingPlan ? 'Plano atualizado!' : 'Plano criado!');
        setShowPlanModal(false);
        setEditingPlan(null);
        resetPlanForm();
        fetchPlans();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Erro ao salvar plano');
      }
    } catch (error) {
      console.error('Erro ao salvar plano:', error);
      toast.error('Erro ao salvar plano');
    }
  };

  const handleDeletePlan = async (planId: string) => {
    try {
      const userStr = localStorage.getItem('user');
      const user = userStr ? JSON.parse(userStr) : null;
      const token = user?.token;
      const response = await fetch(`${API_CONFIG.BASE_URL}/plans/${planId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        toast.success('Plano deletado!');
        fetchPlans();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Erro ao deletar plano');
      }
    } catch (error) {
      console.error('Erro ao deletar plano:', error);
      toast.error('Erro ao deletar plano');
    }
  };

  const handleAssignPlan = async (userId: string, planId: string) => {
    try {
      const userStr = localStorage.getItem('user');
      const user = userStr ? JSON.parse(userStr) : null;
      const token = user?.token;
      const response = await fetch(`${API_CONFIG.BASE_URL}/plans/assign/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ planId })
      });
      
      if (response.ok) {
        toast.success('Plano atribuído com sucesso!');
        setShowUserPlanModal(false);
        setSelectedUser(null);
        fetchUsers();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Erro ao atribuir plano');
      }
    } catch (error) {
      console.error('Erro ao atribuir plano:', error);
      toast.error('Erro ao atribuir plano');
    }
  };

  const handleRemovePlan = async (userId: string) => {
    try {
      const userStr = localStorage.getItem('user');
      const user = userStr ? JSON.parse(userStr) : null;
      const token = user?.token;
      const response = await fetch(`${API_CONFIG.BASE_URL}/plans/remove/${userId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        toast.success('Plano removido!');
        fetchUsers();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Erro ao remover plano');
      }
    } catch (error) {
      console.error('Erro ao remover plano:', error);
      toast.error('Erro ao remover plano');
    }
  };

  const resetPlanForm = () => {
    setPlanForm({
      name: '',
      description: '',
      maxProperties: 0,
      price: 0,
      duration: 30,
      features: [''],
      isActive: true,
      priority: 1
    });
  };

  const openEditPlan = (plan: Plan) => {
    setEditingPlan(plan);
    setPlanForm({
      name: plan.name,
      description: plan.description,
      maxProperties: plan.maxProperties,
      price: plan.price,
      duration: plan.duration,
      features: plan.features.length > 0 ? plan.features : [''],
      isActive: plan.isActive,
      priority: plan.priority
    });
    setShowPlanModal(true);
  };

  const addFeature = () => {
    setPlanForm(prev => ({
      ...prev,
      features: [...prev.features, '']
    }));
  };

  const removeFeature = (index: number) => {
    setPlanForm(prev => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== index)
    }));
  };

  const updateFeature = (index: number, value: string) => {
    setPlanForm(prev => ({
      ...prev,
      features: prev.features.map((f, i) => i === index ? value : f)
    }));
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const isPlanExpired = (endDate: string) => {
    return new Date(endDate) < new Date();
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Gerenciar Planos</h1>
        <div className="flex space-x-4">
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setActiveTab('plans')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'plans'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Planos
            </button>
            <button
              onClick={() => setActiveTab('users')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'users'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Usuários
            </button>
          </div>
          {activeTab === 'plans' && (
            <button
              onClick={() => {
                resetPlanForm();
                setEditingPlan(null);
                setShowPlanModal(true);
              }}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2"
            >
              <Plus className="h-4 w-4" />
              <span>Novo Plano</span>
            </button>
          )}
        </div>
      </div>

      {activeTab === 'plans' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {plans.map((plan) => (
            <div key={plan._id} className="bg-white rounded-lg shadow-md p-6 border">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{plan.name}</h3>
                  <p className="text-gray-600 text-sm mt-1">{plan.description}</p>
                </div>
                <div className="flex items-center space-x-2">
                  {plan.isActive ? (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-500" />
                  )}
                  <div className="flex space-x-1">
                    <button
                      onClick={() => openEditPlan(plan)}
                      className="p-1 text-gray-400 hover:text-blue-600"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDeletePlan(plan._id)}
                      className="p-1 text-gray-400 hover:text-red-600"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Preço:</span>
                  <span className="font-semibold text-green-600">{formatCurrency(plan.price)}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Imóveis:</span>
                  <span className="font-semibold">{plan.maxProperties}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Duração:</span>
                  <span className="font-semibold">{plan.duration} dias</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Prioridade:</span>
                  <span className="font-semibold">{plan.priority}</span>
                </div>
              </div>
              
              {plan.features.length > 0 && (
                <div className="mt-4">
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Recursos:</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-center">
                        <CheckCircle className="h-3 w-3 text-green-500 mr-2 flex-shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Usuário
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Plano Atual
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Imóveis
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.map((user) => (
                  <tr key={user._id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{user.name}</div>
                        <div className="text-sm text-gray-500">{user.email}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {user.activePlan ? (
                        <div>
                          <div className="text-sm font-medium text-gray-900">{user.activePlan.name}</div>
                          <div className="text-sm text-gray-500">
                            {formatCurrency(user.activePlan.price)} - {user.activePlan.duration} dias
                          </div>
                        </div>
                      ) : (
                        <span className="text-sm text-gray-500">Nenhum plano</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {user.activePlan && user.planEndDate ? (
                        <div>
                          {isPlanExpired(user.planEndDate) ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                              Expirado
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              Ativo
                            </span>
                          )}
                          <div className="text-xs text-gray-500 mt-1">
                            Expira: {formatDate(user.planEndDate)}
                          </div>
                        </div>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          Sem plano
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {user.publishedProperties || 0}
                        {user.activePlan && ` / ${user.activePlan.maxProperties}`}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => {
                            setSelectedUser(user);
                            setShowUserPlanModal(true);
                          }}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          Alterar Plano
                        </button>
                        {user.activePlan && (
                          <button
                            onClick={() => handleRemovePlan(user._id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            Remover
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
      )}

      {/* Modal de Criação/Edição de Plano */}
      {showPlanModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-xl font-bold mb-4">
                {editingPlan ? 'Editar Plano' : 'Novo Plano'}
              </h2>
              
              <form onSubmit={handleCreatePlan} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nome do Plano
                    </label>
                    <input
                      type="text"
                      value={planForm.name}
                      onChange={(e) => setPlanForm(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Preço (R$)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={planForm.price}
                      onChange={(e) => setPlanForm(prev => ({ ...prev, price: parseFloat(e.target.value) || 0 }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Descrição
                  </label>
                  <textarea
                    value={planForm.description}
                    onChange={(e) => setPlanForm(prev => ({ ...prev, description: e.target.value }))}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Máximo de Imóveis
                    </label>
                    <input
                      type="number"
                      value={planForm.maxProperties}
                      onChange={(e) => setPlanForm(prev => ({ ...prev, maxProperties: parseInt(e.target.value) || 0 }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Duração (dias)
                    </label>
                    <input
                      type="number"
                      value={planForm.duration}
                      onChange={(e) => setPlanForm(prev => ({ ...prev, duration: parseInt(e.target.value) || 30 }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Prioridade
                    </label>
                    <input
                      type="number"
                      value={planForm.priority}
                      onChange={(e) => setPlanForm(prev => ({ ...prev, priority: parseInt(e.target.value) || 1 }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Recursos do Plano
                  </label>
                  {planForm.features.map((feature, index) => (
                    <div key={index} className="flex items-center space-x-2 mb-2">
                      <input
                        type="text"
                        value={feature}
                        onChange={(e) => updateFeature(index, e.target.value)}
                        placeholder="Descreva um recurso do plano"
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      {planForm.features.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeFeature(index)}
                          className="p-2 text-red-600 hover:text-red-800"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={addFeature}
                    className="text-blue-600 hover:text-blue-800 text-sm flex items-center space-x-1"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Adicionar recurso</span>
                  </button>
                </div>
                
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={planForm.isActive}
                    onChange={(e) => setPlanForm(prev => ({ ...prev, isActive: e.target.checked }))}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="isActive" className="ml-2 block text-sm text-gray-900">
                    Plano ativo
                  </label>
                </div>
                
                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowPlanModal(false);
                      setEditingPlan(null);
                      resetPlanForm();
                    }}
                    className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    {editingPlan ? 'Atualizar' : 'Criar'} Plano
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Atribuição de Plano */}
      {showUserPlanModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="p-6">
              <h2 className="text-xl font-bold mb-4">
                Alterar Plano - {selectedUser.name}
              </h2>
              
              <div className="space-y-4">
                <div className="text-sm text-gray-600">
                  <p><strong>Email:</strong> {selectedUser.email}</p>
                  <p><strong>Plano atual:</strong> {selectedUser.activePlan?.name || 'Nenhum'}</p>
                  <p><strong>Imóveis publicados:</strong> {selectedUser.publishedProperties || 0}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Selecionar novo plano:
                  </label>
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {plans.filter(plan => plan.isActive).map((plan) => (
                      <button
                        key={plan._id}
                        onClick={() => handleAssignPlan(selectedUser._id, plan._id)}
                        className="w-full text-left p-3 border border-gray-200 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <div className="font-medium">{plan.name}</div>
                        <div className="text-sm text-gray-600">
                          {formatCurrency(plan.price)} - {plan.maxProperties} imóveis - {plan.duration} dias
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
                
                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    onClick={() => {
                      setShowUserPlanModal(false);
                      setSelectedUser(null);
                    }}
                    className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPlans;