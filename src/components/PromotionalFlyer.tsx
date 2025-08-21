import React from 'react';
import { Plus, TrendingUp, Users, Shield, Star, ArrowRight } from 'lucide-react';

const PromotionalFlyer: React.FC = () => {
  return (
    <section className="py-16 bg-gradient-to-br from-orange-500 via-orange-600 to-red-600 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-10 left-10 w-20 h-20 bg-white rounded-full"></div>
        <div className="absolute top-32 right-20 w-16 h-16 bg-white rounded-full"></div>
        <div className="absolute bottom-20 left-1/4 w-12 h-12 bg-white rounded-full"></div>
        <div className="absolute bottom-32 right-1/3 w-24 h-24 bg-white rounded-full"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center text-white mb-12">
          <div className="inline-flex items-center space-x-2 bg-white/20 backdrop-blur-sm rounded-full px-6 py-2 mb-6">
            <Star className="h-5 w-5 text-yellow-300" />
            <span className="text-sm font-medium">Flyer Promocional</span>
          </div>
          
          <h2 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
            Anuncie seu imóvel
          </h2>
          
          <p className="text-xl md:text-2xl text-orange-100 mb-8 max-w-4xl mx-auto leading-relaxed">
            Conecte-se com milhares de compradores e locatários interessados.<br />
            <span className="font-semibold">Maximize a visibilidade do seu imóvel!</span>
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          <div className="text-center group">
            <div className="bg-white/20 backdrop-blur-sm rounded-2xl w-20 h-20 flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
              <TrendingUp className="h-10 w-10 text-white" />
            </div>
            <h3 className="text-xl font-bold mb-3">Maior Visibilidade</h3>
            <p className="text-orange-100 leading-relaxed">
              Seu imóvel será visto por milhares de pessoas interessadas em toda a região do litoral
            </p>
          </div>
          
          <div className="text-center group">
            <div className="bg-white/20 backdrop-blur-sm rounded-2xl w-20 h-20 flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
              <Users className="h-10 w-10 text-white" />
            </div>
            <h3 className="text-xl font-bold mb-3">Leads Qualificados</h3>
            <p className="text-orange-100 leading-relaxed">
              Receba contatos de pessoas realmente interessadas e com perfil adequado
            </p>
          </div>
          
          <div className="text-center group">
            <div className="bg-white/20 backdrop-blur-sm rounded-2xl w-20 h-20 flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
              <Shield className="h-10 w-10 text-white" />
            </div>
            <h3 className="text-xl font-bold mb-3">Processo Seguro</h3>
            <p className="text-orange-100 leading-relaxed">
              Plataforma confiável e segura para todas as suas negociações imobiliárias
            </p>
          </div>
        </div>

        {/* Statistics */}
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 mb-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold mb-2">10.000+</div>
              <div className="text-orange-100">Visitantes mensais</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">500+</div>
              <div className="text-orange-100">Imóveis anunciados</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">95%</div>
              <div className="text-orange-100">Taxa de satisfação</div>
            </div>
          </div>
        </div>

        {/* CTA Buttons */}
        <div className="text-center">
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
            <a
              href="#professional"
              className="group bg-white hover:bg-gray-100 text-orange-600 font-bold py-4 px-8 rounded-xl text-lg transition-all duration-300 shadow-2xl hover:shadow-3xl transform hover:-translate-y-2 flex items-center space-x-3"
            >
              <Plus className="h-6 w-6 group-hover:rotate-90 transition-transform duration-300" />
              <span>ANUNCIAR COMO PROFISSIONAL</span>
              <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform duration-300" />
            </a>
            
            <a
              href="#particular"
              className="group bg-transparent border-2 border-white hover:bg-white hover:text-orange-600 text-white font-bold py-4 px-8 rounded-xl text-lg transition-all duration-300 shadow-2xl hover:shadow-3xl transform hover:-translate-y-2 flex items-center space-x-3"
            >
              <Plus className="h-6 w-6 group-hover:rotate-90 transition-transform duration-300" />
              <span>ANUNCIAR COMO PARTICULAR</span>
              <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform duration-300" />
            </a>
          </div>
          
          <p className="text-orange-100 mt-6 text-sm">
            * Cadastro gratuito • Suporte especializado • Resultados garantidos
          </p>
        </div>
      </div>
    </section>
  );
};

export default PromotionalFlyer;