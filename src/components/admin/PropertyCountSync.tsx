import React, { useState } from 'react';
import { RefreshCw, AlertCircle, CheckCircle, User, FileText } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import apiClient from '../../utils/apiClient';

interface SyncResult {
  success: boolean;
  message?: string;
  processed?: number;
  errors?: Array<{
    userId: string;
    userName: string;
    error: string;
  }>;
}

interface UserReport {
  userId: string;
  name: string;
  email: string;
  userType: string;
  planName: string;
  planActive: boolean;
  storedCount: number;
  actualActiveCount: number;
  totalCount: number;
  hasInconsistency: boolean;
  difference: number;
}

interface PropertyReport {
  totalUsers: number;
  inconsistencies: number;
  users: UserReport[];
  summary: {
    totalInconsistencies: number;
    usersWithPlans: number;
    totalProperties: number;
  };
}

const PropertyCountSync: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState<PropertyReport | null>(null);
  const [syncResult, setSyncResult] = useState<SyncResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Não renderizar se não for admin
  if (!user || user.userType !== 'admin') {
    return null;
  }

  const fetchReport = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiClient.get('/admin/property-report');
      setReport(data);
    } catch (err: any) {
      setError(err?.response?.data?.error || 'Erro ao carregar relatório');
    } finally {
      setLoading(false);
    }
  };

  const syncAllCounts = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await apiClient.post('/admin/sync-property-counts');
      setSyncResult(result);
      
      // Recarregar relatório após sincronização
      if (result.success) {
        await fetchReport();
      }
    } catch (err: any) {
      setError(err?.response?.data?.error || 'Erro ao sincronizar contadores');
      setSyncResult({
        success: false,
        message: err?.response?.data?.error || 'Erro ao sincronizar contadores'
      });
    } finally {
      setLoading(false);
    }
  };

  const fixUserCount = async (userId: string) => {
    try {
      setError(null);
      const result = await apiClient.post(`/admin/fix-user-count/${userId}`);
      
      if (result.success) {
        // Recarregar relatório
        await fetchReport();
      } else {
        setError(`Erro ao corrigir usuário: ${result.error}`);
      }
    } catch (err: any) {
      setError(err?.response?.data?.error || 'Erro ao corrigir contador do usuário');
    }
  };

  // Carregar relatório automaticamente
  React.useEffect(() => {
    fetchReport();
  }, []);

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-md">
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <FileText className="w-5 h-5 text-blue-600" />
              <h2 className="text-lg font-semibold text-gray-900">
                Sincronização de Contadores de Propriedades
              </h2>
            </div>
            
            <div className="flex space-x-2">
              <button
                onClick={fetchReport}
                disabled={loading}
                className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Atualizar
              </button>
              
              <button
                onClick={syncAllCounts}
                disabled={loading}
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Sincronizar Todos
              </button>
            </div>
          </div>
        </div>

        <div className="p-4">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
              <div className="flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 text-red-600" />
                <span className="text-sm text-red-800">{error}</span>
              </div>
            </div>
          )}

          {syncResult && (
            <div className={`mb-4 p-3 border rounded-md ${
              syncResult.success 
                ? 'bg-green-50 border-green-200' 
                : 'bg-red-50 border-red-200'
            }`}>
              <div className="flex items-center space-x-2">
                {syncResult.success ? (
                  <CheckCircle className="w-4 h-4 text-green-600" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-red-600" />
                )}
                <span className={`text-sm ${
                  syncResult.success ? 'text-green-800' : 'text-red-800'
                }`}>
                  {syncResult.message}
                </span>
              </div>
              {syncResult.processed && (
                <p className="text-xs text-gray-600 mt-1">
                  {syncResult.processed} usuários processados
                </p>
              )}
              {syncResult.errors && syncResult.errors.length > 0 && (
                <div className="mt-2">
                  <p className="text-xs font-medium text-red-800">Erros encontrados:</p>
                  <ul className="text-xs text-red-700 ml-4 list-disc">
                    {syncResult.errors.map((error, index) => (
                      <li key={index}>
                        {error.userName}: {error.error}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {loading && !report && (
            <div className="text-center py-8">
              <RefreshCw className="w-8 h-8 animate-spin mx-auto text-blue-600" />
              <p className="text-sm text-gray-600 mt-2">Carregando relatório...</p>
            </div>
          )}

          {report && (
            <>
              {/* Resumo */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="flex items-center">
                    <User className="w-6 h-6 text-blue-600" />
                    <div className="ml-3">
                      <p className="text-sm font-medium text-blue-900">
                        Total de Usuários
                      </p>
                      <p className="text-lg font-semibold text-blue-600">
                        {report.totalUsers}
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-yellow-50 p-4 rounded-lg">
                  <div className="flex items-center">
                    <AlertCircle className="w-6 h-6 text-yellow-600" />
                    <div className="ml-3">
                      <p className="text-sm font-medium text-yellow-900">
                        Inconsistências
                      </p>
                      <p className="text-lg font-semibold text-yellow-600">
                        {report.inconsistencies}
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="flex items-center">
                    <CheckCircle className="w-6 h-6 text-green-600" />
                    <div className="ml-3">
                      <p className="text-sm font-medium text-green-900">
                        Com Planos
                      </p>
                      <p className="text-lg font-semibold text-green-600">
                        {report.summary.usersWithPlans}
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center">
                    <FileText className="w-6 h-6 text-gray-600" />
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-900">
                        Total Propriedades
                      </p>
                      <p className="text-lg font-semibold text-gray-600">
                        {report.summary.totalProperties}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Lista de usuários com inconsistências */}
              {report.inconsistencies > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-3">
                    Usuários com Inconsistências ({report.inconsistencies})
                  </h3>
                  <div className="bg-red-50 border border-red-200 rounded-lg overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-red-200">
                        <thead className="bg-red-100">
                          <tr>
                            <th className="px-4 py-3 text-left text-xs font-medium text-red-900 uppercase">
                              Usuário
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-red-900 uppercase">
                              Plano
                            </th>
                            <th className="px-4 py-3 text-center text-xs font-medium text-red-900 uppercase">
                              Contador
                            </th>
                            <th className="px-4 py-3 text-center text-xs font-medium text-red-900 uppercase">
                              Real
                            </th>
                            <th className="px-4 py-3 text-center text-xs font-medium text-red-900 uppercase">
                              Diferença
                            </th>
                            <th className="px-4 py-3 text-center text-xs font-medium text-red-900 uppercase">
                              Ação
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-red-200">
                          {report.users
                            .filter(user => user.hasInconsistency)
                            .map((user) => (
                            <tr key={user.userId}>
                              <td className="px-4 py-3">
                                <div>
                                  <div className="text-sm font-medium text-gray-900">
                                    {user.name}
                                  </div>
                                  <div className="text-sm text-gray-500">
                                    {user.email}
                                  </div>
                                </div>
                              </td>
                              <td className="px-4 py-3">
                                <span className={`inline-flex px-2 text-xs font-semibold rounded-full ${
                                  user.planActive 
                                    ? 'bg-green-100 text-green-800'
                                    : 'bg-gray-100 text-gray-800'
                                }`}>
                                  {user.planName}
                                </span>
                              </td>
                              <td className="px-4 py-3 text-center text-sm text-gray-900">
                                {user.storedCount}
                              </td>
                              <td className="px-4 py-3 text-center text-sm text-gray-900">
                                {user.actualActiveCount}
                              </td>
                              <td className="px-4 py-3 text-center">
                                <span className={`text-sm font-medium ${
                                  user.difference > 0 ? 'text-green-600' : 'text-red-600'
                                }`}>
                                  {user.difference > 0 ? '+' : ''}{user.difference}
                                </span>
                              </td>
                              <td className="px-4 py-3 text-center">
                                <button
                                  onClick={() => fixUserCount(user.userId)}
                                  className="inline-flex items-center px-2 py-1 border border-transparent text-xs leading-4 font-medium rounded text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                >
                                  Corrigir
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {report.inconsistencies === 0 && (
                <div className="text-center py-8">
                  <CheckCircle className="w-12 h-12 mx-auto text-green-500" />
                  <p className="text-lg font-medium text-gray-900 mt-2">
                    Tudo Sincronizado!
                  </p>
                  <p className="text-sm text-gray-600">
                    Todos os contadores estão consistentes
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default PropertyCountSync;