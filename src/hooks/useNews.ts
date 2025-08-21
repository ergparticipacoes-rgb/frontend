import { useState, useEffect } from 'react';
import { News } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { API_CONFIG } from '../config/api';

// Definindo a URL base da API
const API_URL = API_CONFIG.BASE_URL;

export const useNews = () => {
  const [news, setNews] = useState<News[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    // Carregar notícias da API
    const fetchNews = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${API_URL}/news`);
        
        if (!response.ok) {
          throw new Error('Erro ao carregar notícias');
        }
        
        const data = await response.json();
        // Mapear _id para id para compatibilidade
        const mappedNews = data.news.map((article: any) => ({
          ...article,
          id: article._id || article.id
        }));
        setNews(mappedNews);
        setError(null);
      } catch (err) {
        setError('Falha ao carregar notícias');
        console.error('Erro ao buscar notícias:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
  }, []);

  const addNews = async (newsData: Omit<News, 'id' | 'publishedAt' | 'authorId'>) => {
    if (!user || !user.token) {
      setError('Usuário não autenticado');
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/news`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`
        },
        body: JSON.stringify(newsData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro ao criar notícia');
      }

      const createdNews = await response.json();
      setNews(prev => [createdNews, ...prev]);
      setError(null);
      return createdNews;
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Erro ao criar notícia');
      }
      console.error('Erro ao criar notícia:', err);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const updateNews = async (id: string, updates: Partial<News>) => {
    if (!user || !user.token) {
      setError('Usuário não autenticado');
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/news/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`
        },
        body: JSON.stringify(updates)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro ao atualizar notícia');
      }

      const updatedNews = await response.json();
      setNews(prev => 
        prev.map(item => 
          item.id === id ? { ...item, ...updatedNews } : item
        )
      );
      setError(null);
      return updatedNews;
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Erro ao atualizar notícia');
      }
      console.error('Erro ao atualizar notícia:', err);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const deleteNews = async (id: string) => {
    if (!user || !user.token) {
      setError('Usuário não autenticado');
      return false;
    }

    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/news/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${user.token}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro ao deletar notícia');
      }

      setNews(prev => prev.filter(item => item.id !== id));
      setError(null);
      return true;
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Erro ao deletar notícia');
      }
      console.error('Erro ao deletar notícia:', err);
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    news,
    loading,
    error,
    addNews,
    updateNews,
    deleteNews
  };
};