import { PropertyEventDispatcher } from './eventDispatcher';

/**
 * Interceptor para processar respostas da API e disparar eventos automaticamente
 */
export const setupApiInterceptors = (apiClient: any) => {
  // Interceptor de resposta
  apiClient.interceptors.response.use(
    (response: any) => {
      // Processar eventos automáticos se a resposta contém eventType
      if (response.data && response.data.eventType) {
        console.log('[API_INTERCEPTOR] Processando evento da API:', response.data.eventType);
        PropertyEventDispatcher.processApiResponse(response.data);
      }
      
      return response;
    },
    (error: any) => {
      // Manter comportamento padrão de erro
      return Promise.reject(error);
    }
  );

  console.log('[API_INTERCEPTOR] Interceptors configurados para eventos automáticos');
};

export default setupApiInterceptors;