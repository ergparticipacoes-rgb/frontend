import React from 'react';
import { Plus, TrendingUp, Users, Shield } from 'lucide-react';

const AdvertiseBanner: React.FC = () => {
  return (
    <section className="py-16 bg-gradient-to-r from-green-600 to-green-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center text-white">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Anuncie seu imóvel
          </h2>
          <p className="text-xl text-green-100 mb-8 max-w-3xl mx-auto">
            Conecte-se com milhares de compradores e locatários interessados. 
            Maximize a visibilidade do seu imóvel!
          </p>

          {/* Features */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10">
            <div className="text-center">
              <div className="bg-white bg-opacity-20 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Maior Visibilidade</h3>
              <p className="text-green-100">
                Seu imóvel será visto por milhares de pessoas interessadas
              </p>
            </div>
            
            <div className="text-center">
              <div className="bg-white bg-opacity-20 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Leads Qualificados</h3>
              <p className="text-green-100">
                Receba contatos de pessoas realmente interessadas
              </p>
            </div>
            
            <div className="text-center">
              <div className="bg-white bg-opacity-20 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Shield className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Processo Seguro</h3>
              <p className="text-green-100">
                Plataforma confiável e segura para suas negociações
              </p>
            </div>
          </div>

          <a
            href="#advertise"
            className="inline-flex items-center space-x-2 bg-orange-500 hover:bg-orange-600 text-white font-bold py-4 px-8 rounded-lg text-lg transition-colors shadow-lg hover:shadow-xl transform hover:-translate-y-1"
          >
            <Plus className="h-6 w-6" />
            <span>Anunciar Agora</span>
          </a>
        </div>
      </div>
    </section>
  );
};

export default AdvertiseBanner;