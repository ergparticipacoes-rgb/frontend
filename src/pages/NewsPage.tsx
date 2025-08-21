import React from 'react';
import { Calendar, ArrowLeft, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useNews } from '../hooks/useNews';

const NewsPage: React.FC = () => {
  const { news, loading, error } = useNews();

  // Exibir indicador de carregamento
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-300 rounded w-64 mx-auto mb-4"></div>
              <div className="h-4 bg-gray-300 rounded w-96 mx-auto mb-8"></div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="bg-white rounded-lg shadow-md h-96">
                    <div className="h-48 bg-gray-300 rounded-t-lg"></div>
                    <div className="p-6">
                      <div className="h-4 bg-gray-300 rounded w-24 mb-3"></div>
                      <div className="h-6 bg-gray-300 rounded w-full mb-3"></div>
                      <div className="h-4 bg-gray-300 rounded w-full mb-2"></div>
                      <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Exibir mensagem de erro
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="bg-red-50 border border-red-200 rounded-lg p-8">
              <TrendingUp className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-red-800 mb-2">Erro ao Carregar Notícias</h2>
              <p className="text-red-600 mb-6">{error}</p>
              <Link
                to="/"
                className="inline-flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors"
              >
                <ArrowLeft className="h-5 w-5" />
                <span>Voltar ao Início</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Se não houver notícias
  if (!news || news.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="bg-white rounded-lg shadow-md p-12">
              <TrendingUp className="h-16 w-16 text-gray-400 mx-auto mb-6" />
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Nenhuma Notícia Disponível</h2>
              <p className="text-lg text-gray-600 mb-8">Não há notícias publicadas no momento.</p>
              <Link
                to="/"
                className="inline-flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors"
              >
                <ArrowLeft className="h-5 w-5" />
                <span>Voltar ao Início</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            to="/"
            className="inline-flex items-center space-x-2 text-blue-600 hover:text-blue-700 mb-6 transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
            <span>Voltar ao Início</span>
          </Link>
          
          <div className="text-center">
            <div className="flex items-center justify-center space-x-3 mb-4">
              <TrendingUp className="h-10 w-10 text-blue-600" />
              <h1 className="text-4xl font-bold text-gray-900">
                Todas as Notícias
              </h1>
            </div>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Fique por dentro das últimas tendências e novidades do mercado imobiliário
            </p>
          </div>
        </div>

        {/* News Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {news.map((article) => (
            <Link key={article.id} to={`/news/${article.id}`}>
              <article className="bg-white rounded-lg shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden group cursor-pointer transform hover:-translate-y-1">
              <div className="relative overflow-hidden">
                <img
                  src={article.imageUrl || 'https://images.pexels.com/photos/1370704/pexels-photo-1370704.jpeg'}
                  alt={article.title}
                  className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>
                <div className="absolute bottom-4 left-4 right-4">
                  <div className="flex items-center space-x-2 text-white text-sm">
                    <Calendar className="h-4 w-4" />
                    <span>
                      {new Date(article.publishedAt).toLocaleDateString('pt-BR', {
                        day: '2-digit',
                        month: 'long',
                        year: 'numeric'
                      })}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors line-clamp-2">
                  {article.title}
                </h3>
                
                <p className="text-gray-600 mb-4 line-clamp-4">
                  {article.content.length > 200 
                    ? `${article.content.substring(0, 200)}...` 
                    : article.content
                  }
                </p>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">
                    {new Date(article.publishedAt).toLocaleDateString('pt-BR')}
                  </span>
                  <span className="text-blue-600 hover:text-blue-700 font-medium transition-colors">
                    Ler mais
                  </span>
                </div>
              </div>
            </article>
            </Link>
          ))}
        </div>

        {/* Footer */}
        <div className="text-center mt-12">
          <div className="bg-white rounded-lg shadow-md p-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Quer ficar sempre atualizado?
            </h3>
            <p className="text-gray-600 mb-6">
              Acompanhe as últimas novidades do mercado imobiliário e não perca nenhuma oportunidade.
            </p>
            <Link
              to="/properties"
              className="inline-flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg transition-colors font-medium"
            >
              <span>Ver Imóveis Disponíveis</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewsPage;