import { useState, useEffect } from 'react';
import { API_CONFIG } from '../config/api';
import { useWebSocket } from '../contexts/WebSocketContext';

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

const defaultSettings: FooterSettings = {
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
};

export const useFooterSettings = () => {
  const [settings, setSettings] = useState<FooterSettings>(defaultSettings);
  const [loading, setLoading] = useState(true);
  const { socket } = useWebSocket();

  useEffect(() => {
    fetchSettings();
  }, []);
  
  // Escutar atualizações via WebSocket
  useEffect(() => {
    if (!socket) return;
    
    const handleFooterUpdate = (data: any) => {
      console.log('📨 Recebido evento de atualização do footer:', data);
      // Recarregar configurações quando receber evento de atualização
      fetchSettings();
    };
    
    socket.on('footer-updated', handleFooterUpdate);
    
    return () => {
      socket.off('footer-updated', handleFooterUpdate);
    };
  }, [socket]);

  const fetchSettings = async () => {
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}/settings`);
      
      if (response.ok) {
        const data = await response.json();
        console.log('Dados recebidos da API:', data);
        if (data.footer) {
          // Usar exatamente o que vem do banco, sem forçar valores
          setSettings(data.footer);
        } else {
          // Se não houver footer, usar estrutura vazia
          setSettings(defaultSettings);
        }
      }
    } catch (error) {
      console.error('Erro ao buscar configurações do footer:', error);
      // Em caso de erro, usar estrutura vazia
      setSettings(defaultSettings);
    } finally {
      setLoading(false);
    }
  };

  return { settings, loading };
};