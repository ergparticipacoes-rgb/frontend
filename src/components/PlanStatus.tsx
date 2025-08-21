import React, { useState, useEffect } from 'react';
import { usePlanStatus } from '../hooks/usePlanStatus';
import { AlertTriangle, CheckCircle, Clock, Home, AlertCircle, TrendingUp, MessageCircle } from 'lucide-react';
import { API_CONFIG } from '../config/api';

interface PlanStatusProps {
  showDetails?: boolean;
  compact?: boolean;
  className?: string;
}

const PlanStatus: React.FC<PlanStatusProps> = ({ 
  showDetails = true, 
  compact = false, 
  className = '' 
}) => {
  const {
    planStatus,
    loading,
    error,
    hasActivePlan,
    planName,
    propertiesUsed,
    propertiesLimit,
    propertiesRemaining,
    daysRemaining,
    hasWarnings,
    getCriticalWarnings,
    getAttentionWarnings,
    isPlanExpiringSoon,
    isNearPropertyLimit,
    getUsagePercentage,
    formatDaysRemaining,
    canPublishProperty
  } = usePlanStatus();

  const [adminWhatsApp, setAdminWhatsApp] = useState<string>('');

  useEffect(() => {
    fetchAdminWhatsApp();
  }, []);

  const fetchAdminWhatsApp = async () => {
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}/settings`);
      if (response.ok) {
        const data = await response.json();
        setAdminWhatsApp(data.adminWhatsApp || '');
      }
    } catch (error) {
      console.error('Erro ao buscar WhatsApp do admin:', error);
    }
  };

  const handleUpgradeClick = () => {
    if (!adminWhatsApp) {
      alert('WhatsApp do administrador não configurado. Entre em contato com o suporte.');
      return;
    }

    const cleanNumber = adminWhatsApp.replace(/\D/g, '');
    const message = encodeURIComponent(
      `Olá! Gostaria de fazer upgrade do meu plano.\n\n` +
      `Plano atual: ${planName || 'Sem plano'}\n` +
      `Imóveis utilizados: ${propertiesUsed}/${propertiesLimit}\n` +
      `Gostaria de mais informações sobre os planos disponíveis.`
    );
    
    window.open(`https://wa.me/55${cleanNumber}?text=${message}`, '_blank');
  };

  const isMaxPlan = planName === 'Empresarial' || planName === 'Premium';

  if (loading) {
    return (
      <div className={`bg-gray-50 border border-gray-200 rounded-lg p-4 ${className}`}>
        <div className="flex items-center space-x-2">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
          <span className="text-sm text-gray-600">Carregando status do plano...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`bg-red-50 border border-red-200 rounded-lg p-4 ${className}`}>
        <div className="flex items-center space-x-2">
          <AlertCircle className="h-4 w-4 text-red-500" />
          <span className="text-sm text-red-700">Erro: {error}</span>
        </div>
      </div>
    );
  }

  if (!planStatus) {
    return (
      <div className={`bg-gray-50 border border-gray-200 rounded-lg p-4 ${className}`}>
        <div className="flex items-center space-x-2">
          <AlertTriangle className="h-4 w-4 text-gray-500" />
          <span className="text-sm text-gray-600">Status do plano não disponível</span>
        </div>
      </div>
    );
  }

  const criticalWarnings = getCriticalWarnings();
  const attentionWarnings = getAttentionWarnings();
  const usagePercentage = getUsagePercentage();
  const publishStatus = canPublishProperty();

  // Versão compacta
  if (compact) {
    return (
      <div className={`bg-white border rounded-lg p-3 ${className}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {hasActivePlan ? (
              <CheckCircle className="h-4 w-4 text-green-500" />
            ) : (
              <AlertTriangle className="h-4 w-4 text-red-500" />
            )}
            <span className="text-sm font-medium">
              {planName || 'Sem plano'}
            </span>
          </div>
          
          {hasActivePlan && (
            <div className="flex items-center space-x-3 text-xs text-gray-600">
              <span className="flex items-center space-x-1">
                <Home className="h-3 w-3" />
                <span>{propertiesUsed}/{propertiesLimit}</span>
              </span>
              <span className="flex items-center space-x-1">
                <Clock className="h-3 w-3" />
                <span>{daysRemaining}d</span>
              </span>
              {!isMaxPlan && adminWhatsApp && (
                <button
                  onClick={handleUpgradeClick}
                  className="flex items-center space-x-1 px-2 py-0.5 bg-gradient-to-r from-green-500 to-green-600 text-white rounded text-xs font-medium hover:from-green-600 hover:to-green-700 transition-all"
                  title="Fazer upgrade do plano"
                >
                  <TrendingUp className="h-3 w-3" />
                  <span>Upgrade</span>
                </button>
              )}
            </div>
          )}
        </div>
        
        {criticalWarnings.length > 0 && (
          <div className="mt-2 text-xs text-red-600">
            {criticalWarnings[0].message}
          </div>
        )}
      </div>
    );
  }

  // Versão completa
  return (
    <div className={`bg-white border rounded-lg shadow-sm ${className}`}>
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {hasActivePlan ? (
              <CheckCircle className="h-6 w-6 text-green-500" />
            ) : (
              <AlertTriangle className="h-6 w-6 text-red-500" />
            )}
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                {planName || 'Sem Plano Ativo'}
              </h3>
              <p className="text-sm text-gray-600">
                {hasActivePlan ? formatDaysRemaining() : 'Nenhum plano ativo'}
              </p>
            </div>
          </div>
          
          {hasActivePlan && (
            <div className="text-right">
              <div className="text-2xl font-bold text-gray-900">
                {usagePercentage}%
              </div>
              <div className="text-xs text-gray-500">Utilizado</div>
            </div>
          )}
        </div>
      </div>

      {/* Avisos Críticos */}
      {criticalWarnings.length > 0 && (
        <div className="p-4 bg-red-50 border-b border-red-200">
          <div className="flex items-start space-x-2">
            <AlertTriangle className="h-5 w-5 text-red-500 mt-0.5" />
            <div>
              <h4 className="text-sm font-medium text-red-800">Atenção Necessária</h4>
              <ul className="mt-1 text-sm text-red-700 space-y-1">
                {criticalWarnings.map((warning, index) => (
                  <li key={index}>• {warning.message}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Avisos de Atenção */}
      {attentionWarnings.length > 0 && (
        <div className="p-4 bg-yellow-50 border-b border-yellow-200">
          <div className="flex items-start space-x-2">
            <AlertCircle className="h-5 w-5 text-yellow-500 mt-0.5" />
            <div>
              <h4 className="text-sm font-medium text-yellow-800">Avisos</h4>
              <ul className="mt-1 text-sm text-yellow-700 space-y-1">
                {attentionWarnings.map((warning, index) => (
                  <li key={index}>• {warning.message}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Detalhes do Plano */}
      {showDetails && hasActivePlan && (
        <div className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Uso de Propriedades */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Propriedades</span>
                <span className="text-sm text-gray-600">
                  {propertiesUsed} de {propertiesLimit}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full transition-all duration-300 ${
                    usagePercentage >= 90 ? 'bg-red-500' :
                    usagePercentage >= 70 ? 'bg-yellow-500' : 'bg-green-500'
                  }`}
                  style={{ width: `${Math.min(usagePercentage, 100)}%` }}
                ></div>
              </div>
              <div className="text-xs text-gray-500">
                {propertiesRemaining} propriedades restantes
              </div>
            </div>

            {/* Status de Publicação */}
            <div className="space-y-2">
              <span className="text-sm font-medium text-gray-700">Status de Publicação</span>
              <div className={`flex items-center space-x-2 p-2 rounded-md ${
                publishStatus.allowed 
                  ? 'bg-green-50 text-green-700' 
                  : 'bg-red-50 text-red-700'
              }`}>
                {publishStatus.allowed ? (
                  <CheckCircle className="h-4 w-4" />
                ) : (
                  <AlertTriangle className="h-4 w-4" />
                )}
                <span className="text-sm">
                  {publishStatus.allowed 
                    ? 'Pode publicar propriedades' 
                    : publishStatus.reason || 'Não pode publicar'
                  }
                </span>
              </div>
            </div>
          </div>

          {/* Botão de Upgrade */}
          {!isMaxPlan && adminWhatsApp && (
            <div className="mt-4 flex justify-center">
              <button
                onClick={handleUpgradeClick}
                className="flex items-center space-x-2 px-6 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg font-medium hover:from-green-600 hover:to-green-700 transition-all shadow-md"
              >
                <TrendingUp className="h-5 w-5" />
                <span>Fazer Upgrade do Plano</span>
                <MessageCircle className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>
      )}

      {/* Sem Plano Ativo */}
      {!hasActivePlan && (
        <div className="p-4 text-center">
          <div className="text-gray-500 mb-4">
            <Home className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Você não possui um plano ativo</p>
            <p className="text-xs mt-1">Entre em contato com o administrador para ativar um plano</p>
          </div>
          {adminWhatsApp && (
            <button
              onClick={handleUpgradeClick}
              className="flex items-center space-x-2 px-6 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg font-medium hover:from-green-600 hover:to-green-700 transition-all shadow-md mx-auto"
            >
              <MessageCircle className="h-5 w-5" />
              <span>Solicitar Plano</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default PlanStatus;