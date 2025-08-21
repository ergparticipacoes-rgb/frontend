import React, { useState, useEffect } from 'react';
import { Lock, Mail, Loader2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { API_CONFIG } from '../config/api';

interface LoginFormProps {
  onClose?: () => void;
}

const LoginForm: React.FC<LoginFormProps> = ({ onClose }) => {
  const { login, isLoading, error } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [successMessage, setSuccessMessage] = useState('');
  const [adminWhatsApp, setAdminWhatsApp] = useState('');

  useEffect(() => {
    // Buscar configurações para obter o WhatsApp do admin
    const fetchSettings = async () => {
      try {
        const response = await fetch(`${API_CONFIG.BASE_URL}/settings`);
        if (response.ok) {
          const data = await response.json();
          setAdminWhatsApp(data.adminWhatsApp || '');
        }
      } catch (error) {
        console.error('Erro ao buscar configurações:', error);
      }
    };
    fetchSettings();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleForgotPassword = (e: React.MouseEvent) => {
    e.preventDefault();
    if (adminWhatsApp) {
      // Formatar número para WhatsApp (remover caracteres especiais)
      const whatsappNumber = adminWhatsApp.replace(/\D/g, '');
      // Mensagem pré-definida
      const message = encodeURIComponent('Olá! Gostaria de solicitar a recuperação da minha senha de acesso ao sistema.');
      // Abrir WhatsApp com a mensagem
      window.open(`https://wa.me/55${whatsappNumber}?text=${message}`, '_blank');
    } else {
      alert('WhatsApp de suporte não configurado. Entre em contato com o administrador.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { email, password } = formData;

    const success = await login(email, password);
    
    if (success) {
      setSuccessMessage('Login realizado com sucesso!');
      setTimeout(() => {
        if (onClose) onClose();
      }, 1500);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
      <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
        Login
      </h2>
      
      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-md mb-4">
          {error}
        </div>
      )}
      
      {successMessage && (
        <div className="bg-green-50 text-green-600 p-4 rounded-md mb-4">
          {successMessage}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            E-mail
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
            <input
              type="email"
              name="email"
              required
              value={formData.email}
              onChange={handleChange}
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="seu@email.com"
            />
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Senha
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
            <input
              type="password"
              name="password"
              required
              value={formData.password}
              onChange={handleChange}
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Sua senha"
            />
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <input
              id="remember_me"
              type="checkbox"
              className="h-4 w-4 text-blue-600 border-gray-300 rounded"
            />
            <label htmlFor="remember_me" className="ml-2 block text-sm text-gray-700">
              Lembrar-me
            </label>
          </div>
          
          <a 
            href="#"
            onClick={handleForgotPassword}
            className="text-sm text-blue-600 hover:text-blue-500"
          >
            Esqueceu a senha?
          </a>
        </div>
        
        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-md transition-colors flex justify-center items-center"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-5 w-5 mr-2 animate-spin" />
              Entrando...
            </>
          ) : (
            'Entrar'
          )}
        </button>
      </form>
    </div>
  );
};

export default LoginForm; 