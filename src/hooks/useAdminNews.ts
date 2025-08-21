import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { API_CONFIG } from '../config/api';

interface News {
  _id: string;
  title: string;
  content: string;
  imageUrl?: string;
  authorId: string;
  authorName?: string;
  isActive: boolean;
  publishedAt: string;
  createdAt: string;
  views?: number;
}

const API_URL = API_CONFIG.BASE_URL;

export const useAdminNews = () => {
  const [news, setNews] = useState<News[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const fetchNews = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Para admin, buscar todas as notícias com limite maior
      const headers: HeadersInit = {
        'Content-Type': 'application/json'
      };
      
      // Adicionar token de autenticação se disponível
      if (user?.token) {
        headers.Authorization = `Bearer ${user.token}`;
      }
      
      const response = await fetch(`${API_URL}/news?limit=1000`, {
        headers
      });
      
      if (!response.ok) {
        throw new Error('Erro ao buscar notícias');
      }
      
      const data = await response.json();
      // A API retorna um objeto com news array, não um array direto
      const newsArray = data.news || data;
      
      // Buscar informações dos autores para cada notícia
      const newsWithAuthors = await Promise.all(
        (Array.isArray(newsArray) ? newsArray : []).map(async (article: any) => {
          let authorName = 'Admin';
          
          // Tentar buscar o nome do autor se tiver authorId
          if (article.authorId && user?.token) {
            try {
              const authorResponse = await fetch(`${API_URL}/users/${article.authorId}`, {
                headers: {
                  'Authorization': `Bearer ${user.token}`,
                  'Content-Type': 'application/json'
                }
              });
              
              if (authorResponse.ok) {
                const authorData = await authorResponse.json();
                authorName = authorData.name || 'Admin';
              }
            } catch (err) {
              console.warn('Erro ao buscar autor:', err);
            }
          }
          
          return {
            ...article,
            id: article._id,
            authorName
          };
        })
      );
      
      setNews(newsWithAuthors);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  };

  const uploadImage = async (file: File): Promise<string | null> => {
    if (!user?.token) return null;
    
    try {
      const formData = new FormData();
      formData.append('image', file);
      
      const response = await fetch(`${API_URL}/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${user.token}`
        },
        body: formData
      });
      
      if (!response.ok) {
        throw new Error('Erro ao fazer upload da imagem');
      }
      
      const data = await response.json();
      return data.url || data.imageUrl;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro no upload da imagem');
      return null;
    }
  };

  const createNews = async (newsData: { title: string; content: string; imageUrl?: string }, imageFile?: File) => {
    if (!user?.token) return false;
    
    try {
      let finalNewsData = { ...newsData };
      
      // Se há um arquivo de imagem, fazer upload primeiro
      if (imageFile) {
        const uploadedImageUrl = await uploadImage(imageFile);
        if (uploadedImageUrl) {
          finalNewsData.imageUrl = uploadedImageUrl;
        }
      }
      
      const response = await fetch(`${API_URL}/news`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${user.token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(finalNewsData)
      });
      
      if (!response.ok) {
        throw new Error('Erro ao criar notícia');
      }
      
      await fetchNews();
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
      return false;
    }
  };

  const updateNews = async (newsId: string, newsData: Partial<News>, imageFile?: File) => {
    if (!user?.token) return false;
    
    try {
      let finalNewsData = { ...newsData };
      
      // Se há um arquivo de imagem, fazer upload primeiro
      if (imageFile) {
        const uploadedImageUrl = await uploadImage(imageFile);
        if (uploadedImageUrl) {
          finalNewsData.imageUrl = uploadedImageUrl;
        }
      }
      
      const response = await fetch(`${API_URL}/news/${newsId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${user.token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(finalNewsData)
      });
      
      if (!response.ok) {
        throw new Error('Erro ao atualizar notícia');
      }
      
      await fetchNews();
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
      return false;
    }
  };

  const deleteNews = async (newsId: string) => {
    if (!user?.token) return false;
    
    try {
      const response = await fetch(`${API_URL}/news/${newsId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${user.token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error('Erro ao deletar notícia');
      }
      
      await fetchNews();
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
      return false;
    }
  };

  const toggleActive = async (newsId: string) => {
    if (!user?.token) return false;
    
    const newsItem = news.find(n => n._id === newsId);
    if (!newsItem) return false;
    
    return await updateNews(newsId, { isActive: !newsItem.isActive });
  };

  useEffect(() => {
    fetchNews();
  }, []);

  return {
    news,
    loading,
    error,
    fetchNews,
    createNews,
    updateNews,
    deleteNews,
    toggleActive,
    uploadImage
  };
};