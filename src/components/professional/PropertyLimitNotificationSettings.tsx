import React, { useState } from 'react';
import { Settings, Bell, BellOff, Info, Save, RotateCcw } from 'lucide-react';
import { usePropertyLimitNotification } from '../../contexts/PropertyLimitNotificationContext';

interface PropertyLimitNotificationSettingsProps {
  onClose?: () => void;
  className?: string;
}

const PropertyLimitNotificationSettings: React.FC<PropertyLimitNotificationSettingsProps> = ({
  onClose,
  className = ''
}) => {
  const {
    settings,
    updateSettings,
    resetDismissedNotifications
  } = usePropertyLimitNotification();

  const [localSettings, setLocalSettings] = useState(settings);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const handleSettingChange = (key: keyof typeof settings, value: any) => {
    setLocalSettings(prev => ({ ...prev, [key]: value }));
    setHasUnsavedChanges(true);
  };

  const handleSave = () => {
    updateSettings(localSettings);
    setHasUnsavedChanges(false);
    if (onClose) {
      onClose();
    }
  };

  const handleCancel = () => {
    setLocalSettings(settings);
    setHasUnsavedChanges(false);
    if (onClose) {
      onClose();
    }
  };

  const handleResetDismissed = () => {
    resetDismissedNotifications();
    // Feedback visual de que foi resetado
    const button = document.getElementById('reset-dismissed-button');
    if (button) {
      const originalText = button.textContent;
      button.textContent = 'Resetado!';
      setTimeout(() => {
        button.textContent = originalText;
      }, 2000);
    }
  };

  const positions = [
    { value: 'top-right', label: 'Superior Direito' },
    { value: 'top-left', label: 'Superior Esquerdo' },
    { value: 'top-center', label: 'Superior Centro' },
    { value: 'bottom-right', label: 'Inferior Direito' },
    { value: 'bottom-left', label: 'Inferior Esquerdo' }
  ];

  const frequencies = [
    { value: 'always', label: 'Sempre mostrar' },
    { value: 'once-per-session', label: 'Uma vez por sessão' },
    { value: 'daily', label: 'Uma vez por dia' },
    { value: 'weekly', label: 'Uma vez por semana' }
  ];

  return (
    <div className={`bg-white rounded-lg shadow-lg border ${className}`}>
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Settings className="w-5 h-5 text-gray-600" />
            <h3 className="text-lg font-semibold text-gray-900">
              Configurações de Notificações
            </h3>
          </div>
          
          {onClose && (
            <button
              onClick={handleCancel}
              className="text-gray-400 hover:text-gray-600"
            >
              ×
            </button>
          )}
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* Toggle geral */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {localSettings.enabled ? (
              <Bell className="w-5 h-5 text-green-600" />
            ) : (
              <BellOff className="w-5 h-5 text-gray-400" />
            )}
            <div>
              <label className="text-sm font-medium text-gray-900">
                Notificações Ativas
              </label>
              <p className="text-xs text-gray-500">
                Receber alertas sobre limites do plano
              </p>
            </div>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              className="sr-only peer"
              checked={localSettings.enabled}
              onChange={(e) => handleSettingChange('enabled', e.target.checked)}
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
        </div>

        {localSettings.enabled && (
          <>
            {/* Tipos de notificação */}
            <div className="space-y-4">
              <h4 className="text-sm font-medium text-gray-900">
                Tipos de Notificação
              </h4>
              
              <div className="space-y-3">
                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    checked={localSettings.showNearLimit}
                    onChange={(e) => handleSettingChange('showNearLimit', e.target.checked)}
                  />
                  <div>
                    <span className="text-sm text-gray-900">Próximo ao limite</span>
                    <p className="text-xs text-gray-500">Avisar quando estiver usando mais de 80% do limite</p>
                  </div>
                </label>

                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    checked={localSettings.showAtLimit}
                    onChange={(e) => handleSettingChange('showAtLimit', e.target.checked)}
                  />
                  <div>
                    <span className="text-sm text-gray-900">Limite atingido</span>
                    <p className="text-xs text-gray-500">Avisar quando não puder mais publicar</p>
                  </div>
                </label>

                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    checked={localSettings.showExpiredPlan}
                    onChange={(e) => handleSettingChange('showExpiredPlan', e.target.checked)}
                  />
                  <div>
                    <span className="text-sm text-gray-900">Plano expirado</span>
                    <p className="text-xs text-gray-500">Avisar quando o plano expirar</p>
                  </div>
                </label>

                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    checked={localSettings.showNoPlan}
                    onChange={(e) => handleSettingChange('showNoPlan', e.target.checked)}
                  />
                  <div>
                    <span className="text-sm text-gray-900">Sem plano ativo</span>
                    <p className="text-xs text-gray-500">Avisar quando não tiver plano contratado</p>
                  </div>
                </label>
              </div>
            </div>

            {/* Frequência */}
            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-900">
                Frequência das Notificações
              </label>
              <select
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={localSettings.frequency}
                onChange={(e) => handleSettingChange('frequency', e.target.value)}
              >
                {frequencies.map(freq => (
                  <option key={freq.value} value={freq.value}>
                    {freq.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Posição */}
            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-900">
                Posição na Tela
              </label>
              <select
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={localSettings.position}
                onChange={(e) => handleSettingChange('position', e.target.value)}
              >
                {positions.map(pos => (
                  <option key={pos.value} value={pos.value}>
                    {pos.label}
                  </option>
                ))}
              </select>
            </div>
          </>
        )}

        {/* Reset notificações dispensadas */}
        <div className="pt-4 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-gray-900">
                Notificações Dispensadas
              </label>
              <p className="text-xs text-gray-500">
                Limpar histórico de notificações que foram dispensadas
              </p>
            </div>
            <button
              id="reset-dismissed-button"
              onClick={handleResetDismissed}
              className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500"
            >
              <RotateCcw className="w-3 h-3 mr-1" />
              Resetar
            </button>
          </div>
        </div>

        {/* Informação */}
        <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
          <div className="flex items-start space-x-2">
            <Info className="w-4 h-4 text-blue-600 mt-0.5" />
            <div className="text-xs text-blue-800">
              <p className="font-medium">Dica:</p>
              <p>
                As notificações ajudam você a controlar melhor o uso do seu plano e evitar 
                surpresas quando atingir o limite de propriedades.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Botões de ação */}
      <div className="px-4 py-3 bg-gray-50 border-t border-gray-200 flex justify-end space-x-3">
        {onClose && (
          <button
            onClick={handleCancel}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500"
          >
            Cancelar
          </button>
        )}
        
        <button
          onClick={handleSave}
          disabled={!hasUnsavedChanges}
          className={`inline-flex items-center px-4 py-2 text-sm font-medium text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            hasUnsavedChanges
              ? 'bg-blue-600 hover:bg-blue-700'
              : 'bg-gray-400 cursor-not-allowed'
          }`}
        >
          <Save className="w-4 h-4 mr-1" />
          Salvar
        </button>
      </div>
    </div>
  );
};

export default PropertyLimitNotificationSettings;