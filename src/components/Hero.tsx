import React, { useState } from 'react';
import { Search, MapPin, DollarSign, Home, Filter } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Hero: React.FC = () => {
  const navigate = useNavigate();
  const [filters, setFilters] = useState({
    location: '',
    priceRange: '',
    propertyType: '',
    availability: ''
  });

  const handleSearch = () => {
    const queryParams = new URLSearchParams();
    if (filters.location) queryParams.append('location', filters.location);
    if (filters.priceRange) {
      const [min, max] = filters.priceRange.split('-').map(p => p.replace(/\D/g, ''));
      if (min) queryParams.append('minPrice', min);
      if (max) queryParams.append('maxPrice', max);
    }
    if (filters.propertyType) queryParams.append('category', filters.propertyType);
    if (filters.availability) queryParams.append('availability', filters.availability);
    
    navigate(`/properties?${queryParams.toString()}`);
  };

  return (
    <section className="relative bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800 py-20">
      <div className="absolute inset-0 bg-black opacity-10"></div>
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
            Você está na melhor plataforma de<br />
            <span className="text-blue-200">anúncios imobiliários do Litoral!</span>
          </h1>
          <p className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto">
            Feito para imobiliárias, corretores, construtoras e proprietários de imóveis!
          </p>
          
          {/* Quick Search */}
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-4xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
              <div className="relative">
                <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Localização"
                  value={filters.location}
                  onChange={(e) => setFilters({...filters, location: e.target.value})}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div className="relative">
                <DollarSign className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <select 
                  value={filters.priceRange}
                  onChange={(e) => setFilters({...filters, priceRange: e.target.value})}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none">
                  <option value="">Faixa de preço</option>
                  <option value="0-300000">Até R$ 300.000</option>
                  <option value="300000-500000">R$ 300.000 - R$ 500.000</option>
                  <option value="500000-1000000">R$ 500.000 - R$ 1.000.000</option>
                  <option value="1000000-">Acima de R$ 1.000.000</option>
                </select>
              </div>
              
              <div className="relative">
                <Home className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <select 
                  value={filters.propertyType}
                  onChange={(e) => setFilters({...filters, propertyType: e.target.value})}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none">
                  <option value="">Tipo de imóvel</option>
                  <option value="apartment">Apartamento</option>
                  <option value="house">Casa</option>
                  <option value="farm">Chácara</option>
                  <option value="land">Terreno</option>
                  <option value="commercial">Salão</option>
                  <option value="townhouse">Sobrado</option>
                </select>
              </div>
              
              <div className="relative">
                <Filter className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <select 
                  value={filters.availability}
                  onChange={(e) => setFilters({...filters, availability: e.target.value})}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none">
                  <option value="">Disponibilidade</option>
                  <option value="sale">Venda</option>
                  <option value="rent">Locação</option>
                  <option value="temporada">Temporada</option>
                  <option value="both">Ambos</option>
                </select>
              </div>
            </div>
            
            <button 
              onClick={handleSearch}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-md transition-colors flex items-center justify-center space-x-2">
              <Search className="h-5 w-5" />
              <span>Buscar Imóveis</span>
            </button>
          </div>
          
          {/* CTA Buttons */}
          <div className="mt-12 flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="#professional"
              className="bg-green-500 hover:bg-green-600 text-white font-bold py-4 px-8 rounded-lg text-lg transition-colors shadow-lg hover:shadow-xl transform hover:-translate-y-1"
            >
              PROFISSIONAL
            </a>
            <a
              href="#particular"
              className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-4 px-8 rounded-lg text-lg transition-colors shadow-lg hover:shadow-xl transform hover:-translate-y-1"
            >
              PARTICULAR
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;