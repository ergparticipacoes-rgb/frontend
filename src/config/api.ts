// Configuração centralizada da API
export const API_CONFIG = {
  BASE_URL: 'http://localhost:5000/api',
  ENDPOINTS: {
    AUTH: '/auth',
    USERS: '/users',
    PROPERTIES: '/properties',
    PROPERTY_REQUESTS: '/property-requests',
    NEWS: '/news',
    FAVORITES: '/favorites',
    PLANS: '/plans'
  }
};

// Exporta API_URL para compatibilidade com código existente
export const API_URL = API_CONFIG.BASE_URL;

// Helper para construir URLs completas
export const buildApiUrl = (endpoint: string) => {
  return `${API_CONFIG.BASE_URL}${endpoint}`;
};