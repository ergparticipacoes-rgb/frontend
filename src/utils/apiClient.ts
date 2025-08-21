import { API_CONFIG } from '../config/api';
import { PropertyEventDispatcher } from './eventDispatcher';

interface RequestOptions extends RequestInit {
  skipAuth?: boolean;
}

class ApiClient {
  private baseURL: string;
  private authErrorHandlers: Set<() => void> = new Set();

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  // Registra handler para erros de autenticação
  onAuthError(handler: () => void) {
    this.authErrorHandlers.add(handler);
    return () => this.authErrorHandlers.delete(handler);
  }

  private handleAuthError() {
    this.authErrorHandlers.forEach(handler => handler());
  }

  private getAuthToken(): string | null {
    const userStr = localStorage.getItem('user');
    if (userStr && userStr !== 'undefined' && userStr !== 'null') {
      try {
        const user = JSON.parse(userStr);
        // Validar que o token existe e não é undefined/null como string
        if (user.token && user.token !== 'undefined' && user.token !== 'null') {
          return user.token;
        }
      } catch (error) {
        console.error('Erro ao parsear dados do usuário:', error);
        return null;
      }
    }
    return null;
  }

  async request<T = any>(endpoint: string, options: RequestOptions = {}): Promise<T> {
    const { skipAuth = false, headers = {}, ...restOptions } = options;
    
    const token = this.getAuthToken();
    
    const finalHeaders: HeadersInit = {
      'Content-Type': 'application/json',
      ...headers,
    };

    // Adiciona token se disponível e não for para pular auth
    if (token && !skipAuth) {
      finalHeaders['Authorization'] = `Bearer ${token}`;
    }

    const url = endpoint.startsWith('http') ? endpoint : `${this.baseURL}${endpoint}`;

    try {
      const response = await fetch(url, {
        ...restOptions,
        headers: finalHeaders,
      });

      // Se for 401, dispara handlers de erro de autenticação
      if (response.status === 401) {
        this.handleAuthError();
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Sessão expirada. Faça login novamente.');
      }

      // Para outros erros, lança exceção com mensagem
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Erro HTTP: ${response.status}`);
      }

      // Tenta fazer parse do JSON, se falhar retorna response como está
      const data = await response.json().catch(() => response);
      
      // Processar eventos automáticos se a resposta contém eventType
      if (data && data.eventType) {
        console.log('[API_CLIENT] Processando evento da API:', data.eventType);
        PropertyEventDispatcher.processApiResponse(data);
      }
      
      return data;
    } catch (error) {
      // Re-lança o erro para ser tratado pelo chamador
      throw error;
    }
  }

  // Métodos de conveniência
  async get<T = any>(endpoint: string, options?: RequestOptions): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'GET' });
  }

  async post<T = any>(endpoint: string, body?: any, options?: RequestOptions): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  async put<T = any>(endpoint: string, body?: any, options?: RequestOptions): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  async delete<T = any>(endpoint: string, options?: RequestOptions): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'DELETE' });
  }
}

// Instância singleton do cliente
export const apiClient = new ApiClient(API_CONFIG.BASE_URL);

// Export para uso direto
export default apiClient;