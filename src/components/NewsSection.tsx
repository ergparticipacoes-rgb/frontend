import React from 'react';
import { Calendar, ArrowRight, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useNews } from '../hooks/useNews';

const NewsSection: React.FC = () => {
  const { news, loading, error } = useNews();

  // Exibir indicador de carregamento
  if (loading) {
    return (
      <section className="py-16 bg-white" id="news">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p>Carregando notícias...</p>
        </div>
      </section>
    );
  }

  // Exibir mensagem de erro
  if (error) {
    return (
      <section className="py-16 bg-white" id="news">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-red-500">Erro ao carregar notícias: {error}</p>
        </div>
      </section>
    );
  }

  // Se não houver notícias
  if (!news || news.length === 0) {
    return (
      <section className="py-16 bg-white" id="news">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <TrendingUp className="h-8 w-8 text-blue-600" />
            <h2 className="text-3xl font-bold text-gray-900">
              Notícias do Mercado
            </h2>
          </div>
          <p className="text-lg text-gray-600">Nenhuma notícia disponível no momento.</p>
        </div>
      </section>
    );
  }

  // Limitar a 3 notícias para exibição
  const displayedNews = news.slice(0, 3);

  return (
    <section className="py-16 bg-white" id="news">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <TrendingUp className="h-8 w-8 text-blue-600" />
            <h2 className="text-3xl font-bold text-gray-900">
              Notícias do Mercado
            </h2>
          </div>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Fique por dentro das últimas tendências e novidades do mercado imobiliário
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {displayedNews.map((article) => (
            <Link key={article.id} to={`/news/${article.id}`}>
              <article className="bg-white rounded-lg shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden group cursor-pointer">
              <div className="relative overflow-hidden">
                <img
                  src={article.imageUrl || 'https://images.pexels.com/photos/1370704/pexels-photo-1370704.jpeg'}
                  alt={article.title}
                  className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
              </div>
              
              <div className="p-6">
                <div className="flex items-center space-x-2 text-gray-500 text-sm mb-3">
                  <Calendar className="h-4 w-4" />
                  <span>
                    {new Date(article.publishedAt).toLocaleDateString('pt-BR', {
                      day: '2-digit',
                      month: 'long',
                      year: 'numeric'
                    })}
                  </span>
                </div>
                
                <h3 className="text-xl font-semibold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors">
                  {article.title}
                </h3>
                
                <p className="text-gray-600 mb-4 line-clamp-3">
                  {article.content.substring(0, 150)}...
                </p>
                
                <div className="flex items-center text-blue-600 font-medium group-hover:text-blue-700 transition-colors">
                  <span>Ler mais</span>
                  <ArrowRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </article>
            </Link>
          ))}
        </div>

        <div className="text-center mt-12">
          <Link
            to="/news"
            className="inline-flex items-center space-x-2 text-blue-600 hover:text-blue-700 font-medium"
          >
            <span>Ver todas as notícias</span>
            <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default NewsSection;