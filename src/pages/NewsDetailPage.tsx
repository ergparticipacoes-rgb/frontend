import React from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import { ArrowLeft, Calendar, User, Clock } from 'lucide-react';
import { useNewsDetail } from '../hooks/useNewsDetail';

const NewsDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  
  // Se não há ID, redirecionar para a página de notícias
  if (!id) {
    return <Navigate to="/news" replace />;
  }
  
  const { news: article, loading, error } = useNewsDetail(id);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Carregando notícia...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !article) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-red-600 mb-4">Erro ao Carregar Notícia</h1>
            <p className="text-gray-600 mb-8">{error}</p>
            <Link
              to="/news"
              className="inline-flex items-center space-x-2 text-blue-600 hover:text-blue-700 font-medium"
            >
              <ArrowLeft className="h-5 w-5" />
              <span>Voltar para notícias</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <div className="mb-8">
          <Link
            to="/news"
            className="inline-flex items-center space-x-2 text-blue-600 hover:text-blue-700 font-medium"
          >
            <ArrowLeft className="h-5 w-5" />
            <span>Voltar para notícias</span>
          </Link>
        </div>

        {/* Article */}
        <article className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Hero Image */}
          <div className="relative h-64 md:h-96">
            <img
              src={article.imageUrl || 'https://images.pexels.com/photos/1370704/pexels-photo-1370704.jpeg'}
              alt={article.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
          </div>

          {/* Content */}
          <div className="p-8">
            {/* Meta Info */}
            <div className="flex items-center space-x-4 text-gray-500 text-sm mb-6">
              <div className="flex items-center space-x-2">
                <Calendar className="h-4 w-4" />
                <span>
                  {new Date(article.publishedAt).toLocaleDateString('pt-BR', {
                    day: '2-digit',
                    month: 'long',
                    year: 'numeric'
                  })}
                </span>
              </div>
              {article.authorId && (
                <div className="flex items-center space-x-2">
                  <User className="h-4 w-4" />
                  <span>Admin Litoral</span>
                </div>
              )}
            </div>

            {/* Title */}
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
              {article.title}
            </h1>

            {/* Content */}
            <div className="prose prose-lg max-w-none">
              <div className="text-gray-700 leading-relaxed whitespace-pre-line">
                {article.content}
              </div>
            </div>

            {/* Tags or Categories could go here */}
            <div className="mt-8 pt-8 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-500">
                  Publicado em {new Date(article.publishedAt).toLocaleDateString('pt-BR')}
                </div>
                <Link
                  to="/news"
                  className="text-blue-600 hover:text-blue-700 font-medium"
                >
                  Ver mais notícias
                </Link>
              </div>
            </div>
          </div>
        </article>

        {/* Related News or Call to Action */}
        <div className="mt-12 text-center">
          <Link
            to="/"
            className="inline-flex items-center space-x-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <span>Explorar Imóveis</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NewsDetailPage;