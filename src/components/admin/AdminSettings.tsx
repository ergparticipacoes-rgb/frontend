import React, { useState, useEffect } from 'react';
import { Settings, Save, Phone, Mail, AlertCircle, CheckCircle, Globe, Layout } from 'lucide-react';
import { API_CONFIG } from '../../config/api';
import AdminFooterSettings from './AdminFooterSettings';

const AdminSettings: React.FC = () => {
  const [activeTab, setActiveTab] = useState('general');
  const [settings, setSettings] = useState({
    adminWhatsApp: '',
    supportEmail: '',
    welcomeMessage: '',
    maxPhotosPerProperty: 20
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  useEffect(() => {
    if (activeTab === 'general') {
      fetchSettings();
    }
  }, [activeTab]);

  const fetchSettings = async () => {
    try {
      const userStr = localStorage.getItem('user');
      const user = userStr ? JSON.parse(userStr) : null;
      const token = user?.token;
      
      if (!token) {
        console.error('Token não encontrado');
        return;
      }
      
      const response = await fetch(`${API_CONFIG.BASE_URL}/settings`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setSettings(data);
      }
    } catch (error) {
      console.error('Erro ao buscar configurações:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const userStr = localStorage.getItem('user');
      const user = userStr ? JSON.parse(userStr) : null;
      const token = user?.token;
      
      if (!token) {
        setMessage({ type: 'error', text: 'Token não encontrado. Faça login novamente.' });
        setLoading(false);
        return;
      }
      
      const response = await fetch(`${API_CONFIG.BASE_URL}/settings`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(settings)
      });

      if (response.ok) {
        setMessage({ type: 'success', text: 'Configurações atualizadas com sucesso!' });
      } else {
        setMessage({ type: 'error', text: 'Erro ao atualizar configurações' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Erro ao atualizar configurações' });
    } finally {
      setLoading(false);
    }
  };

  const formatWhatsApp = (value: string) => {
    // Remove tudo que não é número
    const numbers = value.replace(/\D/g, '');
    
    // Formata como (XX) XXXXX-XXXX
    if (numbers.length <= 11) {
      const match = numbers.match(/^(\d{0,2})(\d{0,5})(\d{0,4})$/);
      if (match) {
        return !match[2] ? match[1] : `(${match[1]}) ${match[2]}${match[3] ? `-${match[3]}` : ''}`;
      }
    }
    return value;
  };

  const handleWhatsAppChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatWhatsApp(e.target.value);
    setSettings({ ...settings, adminWhatsApp: formatted });
  };

  const tabs = [
    { id: 'general', label: 'Configurações Gerais', icon: Settings },
    { id: 'footer', label: 'Configurações do Rodapé', icon: Layout }
  ];

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center">
          <Settings className="mr-2" />
          Configurações do Sistema
        </h2>
        <p className="text-gray-600 mt-1">Gerencie as configurações gerais do sistema</p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2
                  ${activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }
                `}
              >
                <Icon className="h-5 w-5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'general' ? (
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6">
          {message && (
            <div className={`mb-4 p-4 rounded-lg flex items-center ${
              message.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
            }`}>
              {message.type === 'success' ? (
                <CheckCircle className="w-5 h-5 mr-2" />
              ) : (
                <AlertCircle className="w-5 h-5 mr-2" />
              )}
              {message.text}
            </div>
          )}

          <div className="space-y-6">
            {/* Contato */}
            <div className="border-b pb-6">
              <h3 className="text-lg font-semibold text-gray-700 mb-4">Informações de Contato</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="adminWhatsApp" className="block text-sm font-medium text-gray-700 mb-1">
                    <Phone className="inline w-4 h-4 mr-1" />
                    WhatsApp do Admin
                  </label>
                  <input
                    type="text"
                    id="adminWhatsApp"
                    value={settings.adminWhatsApp}
                    onChange={handleWhatsAppChange}
                    placeholder="(00) 00000-0000"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    WhatsApp para suporte, recuperação de senha e upgrade de planos
                  </p>
                </div>

                <div>
                  <label htmlFor="supportEmail" className="block text-sm font-medium text-gray-700 mb-1">
                    <Mail className="inline w-4 h-4 mr-1" />
                    Email de Suporte
                  </label>
                  <input
                    type="email"
                    id="supportEmail"
                    value={settings.supportEmail}
                    onChange={(e) => setSettings({ ...settings, supportEmail: e.target.value })}
                    placeholder="suporte@exemplo.com"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
              </div>
            </div>

            {/* Configurações Gerais */}
            <div className="border-b pb-6">
              <h3 className="text-lg font-semibold text-gray-700 mb-4">Configurações Gerais</h3>
              
              <div className="space-y-4">
                <div>
                  <label htmlFor="welcomeMessage" className="block text-sm font-medium text-gray-700 mb-1">
                    Mensagem de Boas-vindas
                  </label>
                  <textarea
                    id="welcomeMessage"
                    value={settings.welcomeMessage}
                    onChange={(e) => setSettings({ ...settings, welcomeMessage: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>

                <div>
                  <label htmlFor="maxPhotosPerProperty" className="block text-sm font-medium text-gray-700 mb-1">
                    Máximo de Fotos por Imóvel
                  </label>
                  <input
                    type="number"
                    id="maxPhotosPerProperty"
                    value={settings.maxPhotosPerProperty}
                    onChange={(e) => setSettings({ ...settings, maxPhotosPerProperty: parseInt(e.target.value) })}
                    min="1"
                    max="50"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
              </div>
            </div>

            {/* Botões */}
            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={fetchSettings}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center"
              >
                <Save className="w-4 h-4 mr-2" />
                {loading ? 'Salvando...' : 'Salvar Configurações'}
              </button>
            </div>
          </div>
        </form>
      ) : (
        <AdminFooterSettings />
      )}
    </div>
  );
};

export default AdminSettings;