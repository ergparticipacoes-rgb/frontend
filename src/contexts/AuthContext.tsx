import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User } from '../types';
import { API_CONFIG } from '../config/api';
import apiClient from '../utils/apiClient';
import toast from 'react-hot-toast';

// Definindo a URL base da API
const API_URL = API_CONFIG.BASE_URL;

interface AuthUser extends User {
  token: string;
}

interface AuthContextType {
  user: AuthUser | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  registerProfessional: (data: ProfessionalRegisterData) => Promise<{ success: boolean; message: string }>;
  registerParticular: (data: ParticularRegisterData) => Promise<{ success: boolean; message: string }>;
  updateUser: (userData: Partial<AuthUser>) => void;
  refreshUser: () => Promise<void>;
  isLoading: boolean;
  error: string | null;
}

interface ProfessionalRegisterData {
  name: string;
  email: string;
  phone: string;
  city: string;
  stockSize: string;
}

interface ParticularRegisterData {
  name: string;
  email: string;
  phone: string;
  city: string;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Verificar se existe um usuário no localStorage
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);

    // Registra handler para erros 401
    const unsubscribe = apiClient.onAuthError(() => {
      // Limpa o usuário
      setUser(null);
      localStorage.removeItem('user');
      
      // Mostra mensagem de erro
      toast.error('Sessão expirada. Por favor, faça login novamente.');
      
      // Redireciona para login
      navigate('/');
    });

    // Cleanup
    return unsubscribe;
  }, [navigate]);

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Falha no login');
      }

      const userData = await response.json();
      
      // Validar que o token existe antes de salvar
      if (!userData.token || userData.token === 'undefined' || userData.token === 'null') {
        throw new Error('Token inválido recebido do servidor');
      }
      
      const authUser: AuthUser = {
        ...userData,
        createdAt: new Date(userData.createdAt),
      };
      
      setUser(authUser);
      localStorage.setItem('user', JSON.stringify(authUser));
      setError(null);
      setIsLoading(false);
      return true;
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Erro ao fazer login');
      }
      setIsLoading(false);
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    // Limpar qualquer dado corrompido
    localStorage.removeItem('token');
  };

  const registerProfessional = async (data: ProfessionalRegisterData): Promise<{ success: boolean; message: string }> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${API_URL}/auth/register-professional`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });

      const responseData = await response.json();
      
      if (!response.ok) {
        throw new Error(responseData.error || 'Falha ao registrar');
      }

      setIsLoading(false);
      setError(null);
      return { 
        success: true, 
        message: responseData.message || 'Cadastro realizado! Nossa equipe entrará em contato para dar continuidade na publicação do seu anúncio.' 
      };
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Erro ao registrar');
      }
      setIsLoading(false);
      return { success: false, message: error || 'Erro ao processar solicitação' };
    }
  };

  const registerParticular = async (data: ParticularRegisterData): Promise<{ success: boolean; message: string }> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${API_URL}/auth/register-particular`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });

      const responseData = await response.json();
      
      if (!response.ok) {
        throw new Error(responseData.error || 'Falha ao registrar');
      }

      setIsLoading(false);
      setError(null);
      return { 
        success: true, 
        message: responseData.message || 'Cadastro realizado! Nossa equipe entrará em contato para dar continuidade na publicação do seu anúncio.' 
      };
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Erro ao registrar');
      }
      setIsLoading(false);
      return { success: false, message: error || 'Erro ao processar solicitação' };
    }
  };

  // Função para atualizar dados do usuário (útil quando plano é alterado)
  const updateUser = (userData: Partial<AuthUser>) => {
    if (user) {
      // Garantir que o token não seja sobrescrito com valor inválido
      if (userData.token && (userData.token === 'undefined' || userData.token === 'null')) {
        console.error('Tentativa de atualizar usuário com token inválido');
        return;
      }
      const updatedUser = { ...user, ...userData };
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
      
      // Disparar evento customizado para notificar outros componentes
      window.dispatchEvent(new Event('planUpdated'));
    }
  };

  // Função para buscar dados atualizados do usuário no backend
  const refreshUser = async () => {
    if (!user?.token) return;
    
    try {
      const userData = await apiClient.get('/auth/me');
      const updatedUser = { ...user, ...userData, token: user.token };
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
      
      // Disparar evento customizado
      window.dispatchEvent(new Event('planUpdated'));
    } catch (err) {
      console.error('Erro ao atualizar dados do usuário:', err);
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      login, 
      logout, 
      registerProfessional, 
      registerParticular, 
      updateUser,
      refreshUser,
      isLoading, 
      error 
    }}>
      {children}
    </AuthContext.Provider>
  );
};