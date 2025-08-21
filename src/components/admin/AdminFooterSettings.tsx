import React, { useState, useEffect } from 'react';
import { Save, Facebook, Instagram, Linkedin, Phone, Mail, MapPin, Globe, Plus, Trash2, Link, FileText, Copyright, GripVertical } from 'lucide-react';
import { useToast } from '../../hooks/useToast';
import { API_CONFIG } from '../../config/api';

interface QuickLink {
  label: string;
  url: string;
  enabled: boolean;
  order: number;
}

interface FooterSettings {
  brandName: string;
  description: string;
  socialLinks: {
    facebook: { enabled: boolean; url: string };
    instagram: { enabled: boolean; url: string };
    linkedin: { enabled: boolean; url: string };
  };
  contact: {
    phone: string;
    whatsapp: string;
    email: string;
  };
  address: {
    city: string;
    region: string;
  };
  quickLinks: QuickLink[];
  legalLinks: {
    privacyPolicy: { label: string; url: string; enabled: boolean };
    termsOfUse: { label: string; url: string; enabled: boolean };
  };
  copyright: {
    showYear: boolean;
    customText: string;
  };
}

const AdminFooterSettings: React.FC = () => {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState<FooterSettings>({
    brandName: '',
    description: '',
    socialLinks: {
      facebook: { enabled: false, url: '' },
      instagram: { enabled: false, url: '' },
      linkedin: { enabled: false, url: '' }
    },
    contact: {
      phone: '',
      whatsapp: '',
      email: ''
    },
    address: {
      city: '',
      region: ''
    },
    quickLinks: [],
    legalLinks: {
      privacyPolicy: { label: '', url: '', enabled: false },
      termsOfUse: { label: '', url: '', enabled: false }
    },
    copyright: {
      showYear: true,
      customText: ''
    }
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const userStr = localStorage.getItem('user');
      const user = userStr ? JSON.parse(userStr) : null;
      const token = user?.token;
      
      if (!token) {
        console.error('Token não encontrado');
        showToast('Erro de autenticação. Faça login novamente.', 'error');
        setLoading(false);
        return;
      }
      
      const response = await fetch(`${API_CONFIG.BASE_URL}/settings`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.footer) {
          setSettings(data.footer);
        }
      }
    } catch (error) {
      console.error('Erro ao buscar configurações:', error);
      showToast('Erro ao carregar configurações', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const userStr = localStorage.getItem('user');
      const user = userStr ? JSON.parse(userStr) : null;
      const token = user?.token;
      
      if (!token) {
        console.error('Token não encontrado');
        showToast('Erro de autenticação. Faça login novamente.', 'error');
        setSaving(false);
        return;
      }
      
      const response = await fetch(`${API_CONFIG.BASE_URL}/settings`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ footer: settings })
      });

      if (response.ok) {
        showToast('Configurações do rodapé salvas com sucesso!', 'success');
      } else {
        throw new Error('Erro ao salvar configurações');
      }
    } catch (error) {
      console.error('Erro ao salvar:', error);
      showToast('Erro ao salvar configurações', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (path: string, value: any) => {
    const keys = path.split('.');
    setSettings(prev => {
      const newSettings = { ...prev };
      let current: any = newSettings;
      
      for (let i = 0; i < keys.length - 1; i++) {
        current[keys[i]] = { ...current[keys[i]] };
        current = current[keys[i]];
      }
      
      current[keys[keys.length - 1]] = value;
      return newSettings;
    });
  };

  const addQuickLink = () => {
    const newLink: QuickLink = {
      label: '',
      url: '',
      enabled: true,
      order: settings.quickLinks.length + 1
    };
    setSettings(prev => ({
      ...prev,
      quickLinks: [...prev.quickLinks, newLink]
    }));
  };

  const updateQuickLink = (index: number, field: keyof QuickLink, value: any) => {
    setSettings(prev => ({
      ...prev,
      quickLinks: prev.quickLinks.map((link, i) => 
        i === index ? { ...link, [field]: value } : link
      )
    }));
  };

  const removeQuickLink = (index: number) => {
    setSettings(prev => ({
      ...prev,
      quickLinks: prev.quickLinks.filter((_, i) => i !== index)
    }));
  };

  const moveQuickLink = (index: number, direction: 'up' | 'down') => {
    const newLinks = [...settings.quickLinks];
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    
    if (newIndex >= 0 && newIndex < newLinks.length) {
      [newLinks[index], newLinks[newIndex]] = [newLinks[newIndex], newLinks[index]];
      
      // Atualizar ordem
      newLinks.forEach((link, i) => {
        link.order = i + 1;
      });
      
      setSettings(prev => ({ ...prev, quickLinks: newLinks }));
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Configurações do Rodapé</h2>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
        >
          <Save className="h-5 w-5" />
          <span>{saving ? 'Salvando...' : 'Salvar Alterações'}</span>
        </button>
      </div>

      <div className="space-y-6">
        {/* Informações Básicas */}
        <div className="border-b pb-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <Globe className="h-5 w-5 mr-2 text-blue-600" />
            Informações Básicas
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nome da Marca
              </label>
              <input
                type="text"
                value={settings.brandName}
                onChange={(e) => handleInputChange('brandName', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Descrição
              </label>
              <textarea
                value={settings.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Links Rápidos */}
        <div className="border-b pb-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <Link className="h-5 w-5 mr-2 text-blue-600" />
            Links Rápidos
          </h3>
          <div className="space-y-3">
            {settings.quickLinks && settings.quickLinks.map((link, index) => (
              <div key={index} className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg">
                <GripVertical className="h-5 w-5 text-gray-400 cursor-move" />
                <input
                  type="checkbox"
                  checked={link.enabled}
                  onChange={(e) => updateQuickLink(index, 'enabled', e.target.checked)}
                  className="mr-2"
                />
                <input
                  type="text"
                  placeholder="Label"
                  value={link.label}
                  onChange={(e) => updateQuickLink(index, 'label', e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="text"
                  placeholder="URL"
                  value={link.url}
                  onChange={(e) => updateQuickLink(index, 'url', e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={() => moveQuickLink(index, 'up')}
                  disabled={index === 0}
                  className="p-2 text-gray-600 hover:text-blue-600 disabled:text-gray-300"
                >
                  ↑
                </button>
                <button
                  onClick={() => moveQuickLink(index, 'down')}
                  disabled={index === settings.quickLinks.length - 1}
                  className="p-2 text-gray-600 hover:text-blue-600 disabled:text-gray-300"
                >
                  ↓
                </button>
                <button
                  onClick={() => removeQuickLink(index)}
                  className="p-2 text-red-600 hover:text-red-800"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
            <button
              onClick={addQuickLink}
              className="flex items-center space-x-2 text-blue-600 hover:text-blue-800"
            >
              <Plus className="h-4 w-4" />
              <span>Adicionar Link</span>
            </button>
          </div>
        </div>

        {/* Redes Sociais */}
        <div className="border-b pb-6">
          <h3 className="text-lg font-semibold mb-4">Redes Sociais</h3>
          <div className="space-y-4">
            {/* Facebook */}
            <div className="flex items-center space-x-4">
              <Facebook className="h-5 w-5 text-blue-600" />
              <div className="flex-1 flex items-center space-x-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={settings.socialLinks.facebook.enabled}
                    onChange={(e) => handleInputChange('socialLinks.facebook.enabled', e.target.checked)}
                    className="mr-2"
                  />
                  <span className="text-sm">Habilitar</span>
                </label>
                <input
                  type="url"
                  placeholder="https://facebook.com/suapagina"
                  value={settings.socialLinks.facebook.url}
                  onChange={(e) => handleInputChange('socialLinks.facebook.url', e.target.value)}
                  disabled={!settings.socialLinks.facebook.enabled}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                />
              </div>
            </div>

            {/* Instagram */}
            <div className="flex items-center space-x-4">
              <Instagram className="h-5 w-5 text-pink-600" />
              <div className="flex-1 flex items-center space-x-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={settings.socialLinks.instagram.enabled}
                    onChange={(e) => handleInputChange('socialLinks.instagram.enabled', e.target.checked)}
                    className="mr-2"
                  />
                  <span className="text-sm">Habilitar</span>
                </label>
                <input
                  type="url"
                  placeholder="https://instagram.com/seuusuario"
                  value={settings.socialLinks.instagram.url}
                  onChange={(e) => handleInputChange('socialLinks.instagram.url', e.target.value)}
                  disabled={!settings.socialLinks.instagram.enabled}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                />
              </div>
            </div>

            {/* LinkedIn */}
            <div className="flex items-center space-x-4">
              <Linkedin className="h-5 w-5 text-blue-700" />
              <div className="flex-1 flex items-center space-x-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={settings.socialLinks.linkedin.enabled}
                    onChange={(e) => handleInputChange('socialLinks.linkedin.enabled', e.target.checked)}
                    className="mr-2"
                  />
                  <span className="text-sm">Habilitar</span>
                </label>
                <input
                  type="url"
                  placeholder="https://linkedin.com/company/suaempresa"
                  value={settings.socialLinks.linkedin.url}
                  onChange={(e) => handleInputChange('socialLinks.linkedin.url', e.target.value)}
                  disabled={!settings.socialLinks.linkedin.enabled}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Informações de Contato */}
        <div className="border-b pb-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <Phone className="h-5 w-5 mr-2 text-blue-600" />
            Informações de Contato
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Telefone Comercial
              </label>
              <input
                type="tel"
                placeholder="(11) 0000-0000"
                value={settings.contact.phone}
                onChange={(e) => handleInputChange('contact.phone', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                WhatsApp
              </label>
              <input
                type="tel"
                placeholder="(11) 90000-0000"
                value={settings.contact.whatsapp}
                onChange={(e) => handleInputChange('contact.whatsapp', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                E-mail Comercial
              </label>
              <input
                type="email"
                placeholder="contato@exemplo.com.br"
                value={settings.contact.email}
                onChange={(e) => handleInputChange('contact.email', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Endereço */}
        <div className="border-b pb-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <MapPin className="h-5 w-5 mr-2 text-blue-600" />
            Endereço
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Cidade
              </label>
              <input
                type="text"
                value={settings.address.city}
                onChange={(e) => handleInputChange('address.city', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Região
              </label>
              <input
                type="text"
                value={settings.address.region}
                onChange={(e) => handleInputChange('address.region', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Links Legais */}
        <div className="border-b pb-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <FileText className="h-5 w-5 mr-2 text-blue-600" />
            Links Legais
          </h3>
          <div className="space-y-4">
            {/* Política de Privacidade */}
            <div>
              <label className="flex items-center mb-2">
                <input
                  type="checkbox"
                  checked={settings.legalLinks?.privacyPolicy?.enabled ?? false}
                  onChange={(e) => handleInputChange('legalLinks.privacyPolicy.enabled', e.target.checked)}
                  className="mr-2"
                />
                <span className="text-sm font-medium">Política de Privacidade</span>
              </label>
              <div className="flex space-x-2">
                <input
                  type="text"
                  placeholder="Ex: Política de Privacidade"
                  value={settings.legalLinks?.privacyPolicy?.label ?? ''}
                  onChange={(e) => handleInputChange('legalLinks.privacyPolicy.label', e.target.value)}
                  disabled={!settings.legalLinks?.privacyPolicy?.enabled}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                />
                <input
                  type="text"
                  placeholder="Ex: /privacy ou https://..."
                  value={settings.legalLinks?.privacyPolicy?.url ?? ''}
                  onChange={(e) => handleInputChange('legalLinks.privacyPolicy.url', e.target.value)}
                  disabled={!settings.legalLinks?.privacyPolicy?.enabled}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                />
              </div>
            </div>

            {/* Termos de Uso */}
            <div>
              <label className="flex items-center mb-2">
                <input
                  type="checkbox"
                  checked={settings.legalLinks?.termsOfUse?.enabled ?? false}
                  onChange={(e) => handleInputChange('legalLinks.termsOfUse.enabled', e.target.checked)}
                  className="mr-2"
                />
                <span className="text-sm font-medium">Termos de Uso</span>
              </label>
              <div className="flex space-x-2">
                <input
                  type="text"
                  placeholder="Ex: Termos de Uso"
                  value={settings.legalLinks?.termsOfUse?.label ?? ''}
                  onChange={(e) => handleInputChange('legalLinks.termsOfUse.label', e.target.value)}
                  disabled={!settings.legalLinks?.termsOfUse?.enabled}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                />
                <input
                  type="text"
                  placeholder="Ex: /terms ou https://..."
                  value={settings.legalLinks?.termsOfUse?.url ?? ''}
                  onChange={(e) => handleInputChange('legalLinks.termsOfUse.url', e.target.value)}
                  disabled={!settings.legalLinks?.termsOfUse?.enabled}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div>
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <Copyright className="h-5 w-5 mr-2 text-blue-600" />
            Copyright
          </h3>
          <div className="space-y-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={settings.copyright?.showYear ?? true}
                onChange={(e) => handleInputChange('copyright.showYear', e.target.checked)}
                className="mr-2"
              />
              <span className="text-sm">Mostrar ano atual</span>
            </label>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Texto adicional do copyright
              </label>
              <input
                type="text"
                placeholder="Ex: Todos os direitos reservados."
                value={settings.copyright?.customText ?? ''}
                onChange={(e) => handleInputChange('copyright.customText', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminFooterSettings;