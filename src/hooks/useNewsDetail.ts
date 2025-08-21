import { useState, useEffect } from 'react';
import { News } from '../types';
import { API_CONFIG } from '../config/api';

// Definindo a URL base da API
const API_URL = API_CONFIG.BASE_URL;

export const useNewsDetail = (id: string) => {
  const [news, setNews] = useState<News | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchNewsDetail = async () => {
      if (!id || id.trim() === '') {
        setError('ID da notícia não fornecido');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await fetch(`${API_URL}/news/${id}`);
        
        if (!response.ok) {
          if (response.status === 404) {
            throw new Error('Notícia não encontrada');
          }
          throw new Error('Erro ao carregar notícia');
        }
        
        const data = await response.json();
        // Mapear _id para id para compatibilidade
        const mappedNews = {
          ...data,
          id: data._id || data.id
        };
        setNews(mappedNews);
        setError(null);
      } catch (err) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError('Falha ao carregar notícia');
        }
        console.error('Erro ao buscar notícia:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchNewsDetail();
  }, [id]);

  return {
    news,
    loading,
    error
  };
};