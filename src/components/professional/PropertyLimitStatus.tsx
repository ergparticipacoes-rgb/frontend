import React, { useState, useEffect } from 'react';
import { AlertCircle, CheckCircle, XCircle, TrendingUp, Info } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import apiClient from '../../utils/apiClient';

interface LimitStats {
  planName: string;
  isUnlimited?: boolean;
  isActive: boolean;
  planExpired?: boolean;
  currentUsage: number;
  maxProperties: number;
  usagePercentage: number;
  remainingSlots: number;
  planStartDate?: string;
  planEndDate?: string;
  isNearLimit: boolean;
  isAtLimit: boolean;
  error?: string;
}

interface PropertyLimitStatusProps {
  compact?: boolean;
  showUpgradeButton?: boolean;
  className?: string;
}

const PropertyLimitStatus: React.FC<PropertyLimitStatusProps> = ({ 
  compact = false, 
  showUpgradeButton = true, 
  className = '' 
}) => {
  const { user } = useAuth();
  const [limitStats, setLimitStats] = useState<LimitStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchLimitStats();
  }, [user]);

  const fetchLimitStats = async () => {
    if (!user?.token || user.userType === 'admin') {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const data = await apiClient.get('/properties/limit-stats');
      setLimitStats(data);
    } catch (err) {
      console.error('Erro ao buscar estatísticas de limite:', err);
      setError('Erro ao carregar informações do plano');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = () => {
    if (!limitStats || limitStats.error) return 'text-gray-500';
    if (!limitStats.isActive || limitStats.planExpired) return 'text-red-600';
    if (limitStats.isAtLimit) return 'text-red-600';
    if (limitStats.isNearLimit) return 'text-yellow-600';
    return 'text-green-600';
  };

  const getStatusIcon = () => {
    if (!limitStats || limitStats.error) return <Info className="w-5 h-5" />;
    if (!limitStats.isActive || limitStats.planExpired) return <XCircle className="w-5 h-5" />;
    if (limitStats.isAtLimit) return <AlertCircle className="w-5 h-5" />;
    if (limitStats.isNearLimit) return <AlertCircle className="w-5 h-5" />;
    return <CheckCircle className="w-5 h-5" />;
  };

  const getStatusMessage = () => {
    if (!limitStats || limitStats.error) return limitStats?.error || 'Informações não disponíveis';
    if (limitStats.planExpired) return 'Plano expirado - renove para continuar publicando';
    if (!limitStats.isActive) return 'Nenhum plano ativo';
    if (limitStats.isAtLimit) return 'Limite de propriedades atingido';
    if (limitStats.isNearLimit) return 'Próximo ao limite de propriedades';
    return 'Limite de propriedades em dia';
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  // Não exibir para admins
  if (!user || user.userType === 'admin') {
    return null;
  }

  if (loading) {
    return (
      <div className={`bg-white rounded-lg border p-4 ${className}`}>
        <div className="animate-pulse">
          <div className="flex items-center space-x-3">
            <div className="w-5 h-5 bg-gray-300 rounded"></div>
            <div className="h-4 bg-gray-300 rounded w-32"></div>
          </div>
          <div className="mt-3 h-3 bg-gray-300 rounded w-full"></div>
          <div className="mt-2 h-3 bg-gray-300 rounded w-3/4"></div>
        </div>
      </div>
    );
  }

  if (compact) {
    return (
      <div className={`bg-white rounded-lg border px-3 py-2 ${className}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className={getStatusColor()}>{getStatusIcon()}</span>
            <div className="text-sm">
              <span className="font-medium">
                {limitStats?.currentUsage || 0}
              </span>
              {limitStats?.maxProperties !== -1 && (
                <span className="text-gray-600">
                  /{limitStats?.maxProperties || 0}
                </span>
              )}
            </div>
          </div>
          {limitStats && !limitStats.isUnlimited && (
            <div className="text-xs text-gray-500">
              {limitStats.remainingSlots} restantes
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg border shadow-sm ${className}`}>
      <div className="p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-gray-900">Status do Plano</h3>
          <button 
            onClick={fetchLimitStats}
            className="text-gray-400 hover:text-gray-600"
            title="Atualizar"
          >
            <TrendingUp className="w-4 h-4" />
          </button>
        </div>

        {error ? (
          <div className="flex items-center space-x-2 text-red-600">
            <XCircle className="w-5 h-5" />
            <span className="text-sm">{error}</span>
          </div>
        ) : limitStats ? (
          <>
            <div className="flex items-center space-x-3 mb-4">
              <span className={getStatusColor()}>{getStatusIcon()}</span>
              <div>
                <h4 className="font-medium text-gray-900">{limitStats.planName}</h4>
                <p className={`text-sm ${getStatusColor()}`}>
                  {getStatusMessage()}
                </p>
              </div>
            </div>

            {limitStats.isActive && !limitStats.isUnlimited && (
              <>
                <div className="mb-4">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">Propriedades publicadas</span>
                    <span className="font-medium">
                      {limitStats.currentUsage}/{limitStats.maxProperties}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all duration-300 ${
                        limitStats.isAtLimit
                          ? 'bg-red-500'
                          : limitStats.isNearLimit
                          ? 'bg-yellow-500'
                          : 'bg-green-500'
                      }`}
                      style={{ width: `${Math.min(limitStats.usagePercentage, 100)}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>{limitStats.usagePercentage}% utilizado</span>
                    <span>{limitStats.remainingSlots} disponíveis</span>
                  </div>
                </div>

                {limitStats.planEndDate && (
                  <div className="text-xs text-gray-600 mb-4">
                    <div className="flex justify-between">
                      <span>Válido até:</span>
                      <span className="font-medium">{formatDate(limitStats.planEndDate)}</span>
                    </div>
                  </div>
                )}
              </>
            )}

            {limitStats.isUnlimited && (
              <div className="mb-4">
                <div className="flex items-center space-x-2 text-green-600">
                  <CheckCircle className="w-4 h-4" />
                  <span className="text-sm">Publicações ilimitadas</span>
                </div>
              </div>
            )}

            {showUpgradeButton && (limitStats.isNearLimit || limitStats.isAtLimit || !limitStats.isActive) && (
              <div className="pt-3 border-t border-gray-200">
                <button className="w-full bg-blue-600 text-white py-2 px-4 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors">
                  {!limitStats.isActive ? 'Contratar Plano' : 'Fazer Upgrade'}
                </button>
              </div>
            )}

            {/* Alertas e dicas */}
            {limitStats.isNearLimit && !limitStats.isAtLimit && (
              <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                <div className="flex items-start space-x-2">
                  <AlertCircle className="w-4 h-4 text-yellow-600 mt-0.5" />
                  <div className="text-sm">
                    <p className="text-yellow-800 font-medium">Atenção!</p>
                    <p className="text-yellow-700">
                      Você está próximo do limite do seu plano. Considere fazer um upgrade ou desativar propriedades antigas.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {limitStats.isAtLimit && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
                <div className="flex items-start space-x-2">
                  <XCircle className="w-4 h-4 text-red-600 mt-0.5" />
                  <div className="text-sm">
                    <p className="text-red-800 font-medium">Limite atingido</p>
                    <p className="text-red-700">
                      Você não pode publicar mais propriedades. Desative algumas propriedades ou faça upgrade do seu plano.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </>
        ) : null}
      </div>
    </div>
  );
};

export default PropertyLimitStatus;