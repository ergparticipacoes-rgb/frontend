import React, { useState, useEffect } from 'react';
import { User, Mail, Phone, Building, MapPin, Save } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { API_CONFIG } from '../../config/api';

const ProfessionalProfile: React.FC = () => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    creci: '',
    bio: '',
    address: {
      street: '',
      number: '',
      complement: '',
      neighborhood: '',
      city: '',
      state: '',
      cep: ''
    },
    socialMedia: {
      instagram: '',
      facebook: '',
      linkedin: '',
      website: ''
    },
    notifications: {
      email: true,
      sms: true,
      newLeads: true,
      visitRequests: true,
      systemUpdates: false
    },
    password: '',
    confirmPassword: ''
  });

  // Carregar dados do usuário quando o componente montar
  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        creci: user.creci || '',
        bio: user.bio || '',
        address: {
          street: user.address?.street || '',
          number: user.address?.number || '',
          complement: user.address?.complement || '',
          neighborhood: user.address?.neighborhood || '',
          city: user.address?.city || '',
          state: user.address?.state || '',
          cep: user.address?.cep || ''
        },
        socialMedia: {
          instagram: user.socialMedia?.instagram || '',
          facebook: user.socialMedia?.facebook || '',
          linkedin: user.socialMedia?.linkedin || '',
          website: user.socialMedia?.website || ''
        }
      }));
    }
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent as keyof typeof prev],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };
  
  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent as keyof typeof prev],
          [child]: checked
        }
      }));
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user?.token) {
      alert('Você precisa estar autenticado para atualizar o perfil');
      return;
    }

    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}/users/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        alert('Perfil atualizado com sucesso!');
      } else {
        const error = await response.json();
        alert(error.message || 'Erro ao atualizar perfil');
      }
    } catch (error) {
      console.error('Erro ao atualizar perfil:', error);
      alert('Erro ao atualizar perfil. Tente novamente.');
    }
  };
  
  const inputStyle = "w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent";
  const labelStyle = "block text-sm font-medium text-gray-700 mb-1";
  const sectionTitle = "text-lg font-medium text-gray-900 mb-4";

  return (
    <div>
      <h1 className="text-2xl font-semibold text-gray-800 mb-6">Meu Perfil</h1>
      
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Informações Pessoais */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className={sectionTitle}>
            <div className="flex items-center">
              <User className="mr-2" size={20} /> Informações Pessoais
            </div>
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="name" className={labelStyle}>Nome Completo*</label>
              <input 
                type="text" 
                id="name" 
                name="name" 
                value={formData.name} 
                onChange={handleChange} 
                className={inputStyle} 
                required
              />
            </div>
            
            <div>
              <label htmlFor="creci" className={labelStyle}>Número do CRECI*</label>
              <input 
                type="text" 
                id="creci" 
                name="creci" 
                value={formData.creci} 
                onChange={handleChange} 
                className={inputStyle} 
                required
              />
            </div>
            
            <div>
              <label htmlFor="email" className={labelStyle}>Email*</label>
              <div className="flex">
                <span className="inline-flex items-center px-3 py-2 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500">
                  <Mail size={16} />
                </span>
                <input 
                  type="email" 
                  id="email" 
                  name="email" 
                  value={formData.email} 
                  onChange={handleChange} 
                  className="flex-grow border border-gray-300 rounded-r-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent" 
                  required
                />
              </div>
            </div>
            
            <div>
              <label htmlFor="phone" className={labelStyle}>Telefone*</label>
              <div className="flex">
                <span className="inline-flex items-center px-3 py-2 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500">
                  <Phone size={16} />
                </span>
                <input 
                  type="text" 
                  id="phone" 
                  name="phone" 
                  value={formData.phone} 
                  onChange={handleChange} 
                  className="flex-grow border border-gray-300 rounded-r-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent" 
                  required
                />
              </div>
            </div>
            
            <div className="md:col-span-2">
              <label htmlFor="bio" className={labelStyle}>Biografia Profissional</label>
              <textarea 
                id="bio" 
                name="bio" 
                value={formData.bio} 
                onChange={handleChange} 
                rows={4}
                className={inputStyle} 
              />
            </div>
          </div>
        </div>
        
        {/* Endereço */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className={sectionTitle}>
            <div className="flex items-center">
              <MapPin className="mr-2" size={20} /> Endereço
            </div>
          </h2>
          
          <div className="grid grid-cols-1 gap-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2">
                <label htmlFor="address.street" className={labelStyle}>Rua/Avenida</label>
                <input 
                  type="text" 
                  id="address.street" 
                  name="address.street" 
                  value={formData.address.street} 
                  onChange={handleChange} 
                  className={inputStyle} 
                />
              </div>
              
              <div>
                <label htmlFor="address.number" className={labelStyle}>Número</label>
                <input 
                  type="text" 
                  id="address.number" 
                  name="address.number" 
                  value={formData.address.number} 
                  onChange={handleChange} 
                  className={inputStyle} 
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="address.complement" className={labelStyle}>Complemento</label>
                <input 
                  type="text" 
                  id="address.complement" 
                  name="address.complement" 
                  value={formData.address.complement} 
                  onChange={handleChange} 
                  className={inputStyle} 
                />
              </div>
              
              <div>
                <label htmlFor="address.neighborhood" className={labelStyle}>Bairro</label>
                <input 
                  type="text" 
                  id="address.neighborhood" 
                  name="address.neighborhood" 
                  value={formData.address.neighborhood} 
                  onChange={handleChange} 
                  className={inputStyle} 
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label htmlFor="address.city" className={labelStyle}>Cidade</label>
                <input 
                  type="text" 
                  id="address.city" 
                  name="address.city" 
                  value={formData.address.city} 
                  onChange={handleChange} 
                  className={inputStyle} 
                />
              </div>
              
              <div>
                <label htmlFor="address.state" className={labelStyle}>Estado</label>
                <select
                  id="address.state"
                  name="address.state"
                  value={formData.address.state}
                  onChange={handleChange}
                  className={inputStyle}
                >
                  <option value="SC">Santa Catarina</option>
                  <option value="PR">Paraná</option>
                  <option value="RS">Rio Grande do Sul</option>
                  <option value="SP">São Paulo</option>
                  <option value="RJ">Rio de Janeiro</option>
                </select>
              </div>
              
              <div>
                <label htmlFor="address.cep" className={labelStyle}>CEP</label>
                <input 
                  type="text" 
                  id="address.cep" 
                  name="address.cep" 
                  value={formData.address.cep} 
                  onChange={handleChange} 
                  className={inputStyle} 
                />
              </div>
            </div>
          </div>
        </div>
        
        {/* Redes Sociais */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className={sectionTitle}>
            <div className="flex items-center">
              <Building className="mr-2" size={20} /> Redes Sociais e Site
            </div>
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="socialMedia.instagram" className={labelStyle}>Instagram</label>
              <input 
                type="text" 
                id="socialMedia.instagram" 
                name="socialMedia.instagram" 
                value={formData.socialMedia.instagram} 
                onChange={handleChange} 
                className={inputStyle} 
                placeholder="@seuusuario"
              />
            </div>
            
            <div>
              <label htmlFor="socialMedia.facebook" className={labelStyle}>Facebook</label>
              <input 
                type="text" 
                id="socialMedia.facebook" 
                name="socialMedia.facebook" 
                value={formData.socialMedia.facebook} 
                onChange={handleChange} 
                className={inputStyle} 
                placeholder="seuusuario"
              />
            </div>
            
            <div>
              <label htmlFor="socialMedia.linkedin" className={labelStyle}>LinkedIn</label>
              <input 
                type="text" 
                id="socialMedia.linkedin" 
                name="socialMedia.linkedin" 
                value={formData.socialMedia.linkedin} 
                onChange={handleChange} 
                className={inputStyle} 
                placeholder="seu-usuario"
              />
            </div>
            
            <div>
              <label htmlFor="socialMedia.website" className={labelStyle}>Website</label>
              <input 
                type="text" 
                id="socialMedia.website" 
                name="socialMedia.website" 
                value={formData.socialMedia.website} 
                onChange={handleChange} 
                className={inputStyle} 
                placeholder="www.seusite.com.br"
              />
            </div>
          </div>
        </div>
        
        {/* Notificações */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className={sectionTitle}>Preferências de Notificação</h2>
          
          <div className="space-y-4">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="notifications.email"
                name="notifications.email"
                checked={formData.notifications.email}
                onChange={handleCheckboxChange}
                className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
              />
              <label htmlFor="notifications.email" className="ml-2 block text-sm text-gray-700">
                Receber notificações por e-mail
              </label>
            </div>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                id="notifications.sms"
                name="notifications.sms"
                checked={formData.notifications.sms}
                onChange={handleCheckboxChange}
                className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
              />
              <label htmlFor="notifications.sms" className="ml-2 block text-sm text-gray-700">
                Receber notificações por SMS
              </label>
            </div>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                id="notifications.newLeads"
                name="notifications.newLeads"
                checked={formData.notifications.newLeads}
                onChange={handleCheckboxChange}
                className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
              />
              <label htmlFor="notifications.newLeads" className="ml-2 block text-sm text-gray-700">
                Novos leads e contatos
              </label>
            </div>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                id="notifications.visitRequests"
                name="notifications.visitRequests"
                checked={formData.notifications.visitRequests}
                onChange={handleCheckboxChange}
                className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
              />
              <label htmlFor="notifications.visitRequests" className="ml-2 block text-sm text-gray-700">
                Solicitações de visita
              </label>
            </div>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                id="notifications.systemUpdates"
                name="notifications.systemUpdates"
                checked={formData.notifications.systemUpdates}
                onChange={handleCheckboxChange}
                className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
              />
              <label htmlFor="notifications.systemUpdates" className="ml-2 block text-sm text-gray-700">
                Atualizações do sistema e novidades
              </label>
            </div>
          </div>
        </div>
        
        {/* Alterar Senha */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className={sectionTitle}>Alterar Senha</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="password" className={labelStyle}>Nova Senha</label>
              <input 
                type="password" 
                id="password" 
                name="password" 
                value={formData.password} 
                onChange={handleChange} 
                className={inputStyle} 
                placeholder="Deixe em branco para manter a senha atual"
              />
            </div>
            
            <div>
              <label htmlFor="confirmPassword" className={labelStyle}>Confirmar Nova Senha</label>
              <input 
                type="password" 
                id="confirmPassword" 
                name="confirmPassword" 
                value={formData.confirmPassword} 
                onChange={handleChange} 
                className={inputStyle} 
                placeholder="Confirme a nova senha"
              />
            </div>
          </div>
          
          <p className="mt-2 text-sm text-gray-500">
            * Deixe os campos em branco se não deseja alterar sua senha.
          </p>
        </div>
        
        {/* Botões de ação */}
        <div className="flex justify-end space-x-4">
          <button
            type="button"
            className="px-6 py-3 border border-gray-300 shadow-sm text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="flex items-center px-6 py-3 border border-transparent shadow-sm text-base font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
          >
            <Save className="w-5 h-5 mr-2" /> Salvar Alterações
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProfessionalProfile; 