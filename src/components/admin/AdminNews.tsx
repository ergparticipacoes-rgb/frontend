import React, { useState } from 'react';
import { Search, Plus, Edit, Trash2, ExternalLink, Eye, Calendar, User, ToggleLeft, ToggleRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAdminNews } from '../../hooks/useAdminNews';
import NewsForm from './NewsForm';

const AdminNews: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [showForm, setShowForm] = useState(false);
  const [editingNewsId, setEditingNewsId] = useState<string | null>(null);
  
  const { 
    news, 
    loading, 
    error, 
    deleteNews,
    toggleActive 
  } = useAdminNews();
  
  // Mapear notícias para o formato esperado
  const newsData = news.map(article => ({
    id: article._id,
    title: article.title,
    content: article.content,
    author: article.authorName || 'Admin',
    category: 'Geral',
    publishedAt: article.publishedAt,
    image: article.imageUrl || 'https://images.pexels.com/photos/280229/pexels-photo-280229.jpeg',
    views: article.views || 0,
    isPublished: article.isActive
  }));

  // Filtrar e ordenar notícias
  const filteredNews = newsData
    .filter(news => {
      // Filtrar por termo de busca
      if (searchTerm && !news.title.toLowerCase().includes(searchTerm.toLowerCase()) && !news.content.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false;
      }
      
      return true;
    })
    .sort((a, b) => {
      // Ordenar por data ou visualizações
      if (sortBy === 'newest') {
        return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
      } else if (sortBy === 'oldest') {
        return new Date(a.publishedAt).getTime() - new Date(b.publishedAt).getTime();
      } else if (sortBy === 'views') {
        return b.views - a.views;
      }
      return 0;
    });

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('pt-BR').format(date);
  };

  const truncateContent = (content: string, maxLength: number = 100) => {
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength) + '...';
  };

  const handleDelete = async (newsId: string) => {
    if (window.confirm('Tem certeza que deseja excluir esta notícia?')) {
      try {
        await deleteNews(newsId);
      } catch (error) {
        console.error('Erro ao excluir notícia:', error);
      }
    }
  };

  const handleToggleActive = async (newsId: string) => {
    try {
      await toggleActive(newsId);
    } catch (error) {
      console.error('Erro ao alterar status da notícia:', error);
    }
  };

  const handleNewNews = () => {
    setEditingNewsId(null);
    setShowForm(true);
  };

  const handleEditNews = (newsId: string) => {
    setEditingNewsId(newsId);
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingNewsId(null);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-600">Erro ao carregar notícias: {error}</p>
      </div>
    );
  }

  if (showForm) {
    return (
      <NewsForm 
        onClose={handleCloseForm}
        newsId={editingNewsId || undefined}
      />
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-800">Gerenciamento de Notícias</h1>
        <button 
          onClick={handleNewNews}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
        >
          <Plus className="w-4 h-4 mr-2" /> Nova Notícia
        </button>
      </div>
      
      {/* Filtros e busca */}
      <div className="bg-white p-4 rounded-lg shadow-md mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md"
                placeholder="Buscar notícias..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          
          <div className="flex justify-end items-center">
            <label htmlFor="sort" className="mr-2 text-sm text-gray-500">Ordenar por:</label>
            <select
              id="sort"
              className="focus:ring-blue-500 focus:border-blue-500 border border-gray-300 rounded-md text-sm"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="newest">Mais recentes</option>
              <option value="oldest">Mais antigas</option>
              <option value="views">Mais visualizadas</option>
            </select>
          </div>
        </div>
        
        <div className="mt-4">
          <div className="text-sm text-gray-500">
            {filteredNews.length} {filteredNews.length === 1 ? 'notícia encontrada' : 'notícias encontradas'}
          </div>
        </div>
      </div>
      
      {/* Lista de Notícias */}
      <div className="grid grid-cols-1 gap-6">
        {filteredNews.map((news) => (
          <div key={news.id} className="bg-white overflow-hidden shadow-md rounded-lg">
            <div className="flex flex-col md:flex-row">
              <div className="md:w-1/4">
                <img 
                  src={news.image} 
                  alt={news.title}
                  className="h-48 md:h-full w-full object-cover"
                />
              </div>
              <div className="p-6 flex-1">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-800">{news.title}</h2>
                    <div className="flex items-center mt-1">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 mr-2">
                        {news.category}
                      </span>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        news.isPublished ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {news.isPublished ? 'Publicado' : 'Rascunho'}
                      </span>
                    </div>
                  </div>
                </div>
                
                <p className="text-gray-600 mb-4">{truncateContent(news.content, 200)}</p>
                
                <div className="flex items-center text-sm text-gray-500">
                  <span className="mr-4">Por: {news.author}</span>
                  <span className="mr-4">Data: {formatDate(news.publishedAt)}</span>
                  <span className="flex items-center">
                    <Eye className="w-4 h-4 mr-1" /> {news.views} visualizações
                  </span>
                </div>
                
                <div className="mt-4 flex space-x-2">
                  <Link
                    to={`/noticias/${news.id}`}
                    className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                    target="_blank"
                  >
                    <ExternalLink className="w-4 h-4 mr-1" /> Visualizar
                  </Link>
                  <button
                    onClick={() => handleEditNews(news.id)}
                    className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                  >
                    <Edit className="w-4 h-4 mr-1" /> Editar
                  </button>
                  <button
                    onClick={() => handleToggleActive(news.id)}
                    className={`inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded-md bg-white hover:bg-gray-50 ${
                      news.isPublished ? 'text-green-700' : 'text-gray-700'
                    }`}
                  >
                    {news.isPublished ? (
                      <><ToggleRight className="w-4 h-4 mr-1" /> Ativo</>
                    ) : (
                      <><ToggleLeft className="w-4 h-4 mr-1" /> Inativo</>
                    )}
                  </button>
                  <button
                    onClick={() => handleDelete(news.id)}
                    className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded-md text-red-700 bg-white hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4 mr-1" /> Excluir
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {filteredNews.length === 0 && (
        <div className="text-center py-12 bg-white rounded-lg shadow-md">
          <p className="text-gray-500">Nenhuma notícia encontrada com os filtros aplicados.</p>
        </div>
      )}
      
      {/* Paginação */}
      <div className="bg-white mt-6 px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6 rounded-lg shadow-md">
        <div className="flex-1 flex justify-between items-center">
          <div>
            <p className="text-sm text-gray-700">
              Mostrando <span className="font-medium">1</span> a <span className="font-medium">{filteredNews.length}</span> de <span className="font-medium">{newsData.length}</span> notícias
            </p>
          </div>
          <div>
            <nav className="relative z-0 inline-flex shadow-sm -space-x-px" aria-label="Paginação">
              <button className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
                Anterior
              </button>
              <button className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50">
                1
              </button>
              <button className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
                Próxima
              </button>
            </nav>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminNews;