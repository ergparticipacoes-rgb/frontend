import React, { useState } from 'react';
import { Search, MapPin, DollarSign, Home, Filter, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { SearchFilters } from '../types';
import LocationAutocomplete from './LocationAutocomplete';

interface PropertySearchProps {
  onSearch: (filters: SearchFilters) => void;
  loading?: boolean;
}

const PropertySearch: React.FC<PropertySearchProps> = ({ onSearch, loading = false }) => {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    category: '',
    minPrice: '',
    maxPrice: '',
    bedrooms: '',
    availability: '',
    bathrooms: '',
    minArea: '',
    hasGarage: false,
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    const checked = (e.target as HTMLInputElement).checked;
    
    setFilters(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const searchFilters: SearchFilters = {
      location: searchTerm || undefined,
      category: filters.category || undefined,
      availability: (filters.availability as 'sale' | 'rent' | 'temporada' | 'both') || undefined,
      minPrice: filters.minPrice ? parseInt(filters.minPrice) : undefined,
      maxPrice: filters.maxPrice ? parseInt(filters.maxPrice) : undefined,
      bedrooms: filters.bedrooms ? parseInt(filters.bedrooms) : undefined,
    };
    
    onSearch(searchFilters);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setFilters({
      category: '',
      minPrice: '',
      maxPrice: '',
      bedrooms: '',
      availability: '',
      bathrooms: '',
      minArea: '',
      hasGarage: false,
    });
    onSearch({});
  };

  return (
    <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mb-12">
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Encontre seu imóvel dos sonhos</h2>
        
        {/* Main Search */}
        <form onSubmit={handleSubmit} className="mb-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-grow">
              <LocationAutocomplete
                value={searchTerm}
                onChange={setSearchTerm}
                placeholder="Digite o bairro, cidade ou referência..."
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-colors flex items-center justify-center min-w-[120px] disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Buscando...
                </>
              ) : (
                <>
                  <Search className="h-4 w-4 mr-2" />
                  Buscar
                </>
              )}
            </button>
            <button
              type="button"
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className="border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center whitespace-nowrap"
            >
              <Filter className="h-4 w-4 mr-2" />
              Filtros
            </button>
          </div>
        </form>

        {/* Advanced Filters */}
        <AnimatePresence>
          {isFilterOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0, overflow: 'hidden' }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0, overflow: 'hidden' }}
              transition={{ duration: 0.3 }}
              className="bg-gray-50 rounded-lg p-4 mt-4"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Imóvel</label>
                  <select
                    name="category"
                    value={filters.category}
                    onChange={handleInputChange}
                    className="w-full pl-3 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Todos</option>
                    <option value="house">Casa</option>
                    <option value="apartment">Apartamento</option>
                    <option value="terrain">Terreno</option>
                    <option value="chacara">Chácara</option>
                    <option value="salon">Salão</option>
                    <option value="sobrado">Sobrado</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Preço Mínimo</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <DollarSign className="h-4 w-4 text-gray-400" />
                    </div>
                    <input
                      type="number"
                      name="minPrice"
                      value={filters.minPrice}
                      onChange={handleInputChange}
                      placeholder="Qualquer valor"
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Preço Máximo</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <DollarSign className="h-4 w-4 text-gray-400" />
                    </div>
                    <input
                      type="number"
                      name="maxPrice"
                      value={filters.maxPrice}
                      onChange={handleInputChange}
                      placeholder="Qualquer valor"
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Dormitórios</label>
                  <select
                    name="bedrooms"
                    value={filters.bedrooms}
                    onChange={handleInputChange}
                    className="w-full pl-3 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Qualquer</option>
                    <option value="1">1+</option>
                    <option value="2">2+</option>
                    <option value="3">3+</option>
                    <option value="4">4+</option>
                    <option value="5">5+</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Banheiros</label>
                  <select
                    name="bathrooms"
                    value={filters.bathrooms}
                    onChange={handleInputChange}
                    className="w-full pl-3 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Qualquer</option>
                    <option value="1">1+</option>
                    <option value="2">2+</option>
                    <option value="3">3+</option>
                    <option value="4">4+</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Área Mínima (m²)</label>
                  <div className="relative">
                    <input
                      type="number"
                      name="minArea"
                      value={filters.minArea}
                      onChange={handleInputChange}
                      placeholder="Qualquer"
                      className="w-full pl-3 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Disponibilidade</label>
                  <select
                    name="availability"
                    value={filters.availability}
                    onChange={handleInputChange}
                    className="w-full pl-3 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Qualquer</option>
                    <option value="sale">Venda</option>
                    <option value="rent">Locação</option>
                    <option value="temporada">Temporada</option>
                    <option value="both">Ambos</option>
                  </select>
                </div>

                <div className="flex items-end">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      name="hasGarage"
                      checked={filters.hasGarage}
                      onChange={handleInputChange}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-700">Com vaga de garagem</span>
                  </label>
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-4">
                <button
                  type="button"
                  onClick={clearFilters}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Limpar filtros
                </button>
                <button
                  type="button"
                  onClick={() => {
                    handleSubmit({ preventDefault: () => {} } as React.FormEvent);
                    setIsFilterOpen(false);
                  }}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
                >
                  Aplicar filtros
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default PropertySearch;
