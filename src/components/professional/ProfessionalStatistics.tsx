import React, { useState, useEffect } from 'react';
import { Calendar, Eye, MessageCircle, Clock, Filter, Home, TrendingUp, UserCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useProfessionalProperties } from '../../hooks/useProfessionalProperties';

const ProfessionalStatistics: React.FC = () => {
  const [dateRange, setDateRange] = useState('30');
  const [propertyFilter, setPropertyFilter] = useState('all');
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalViews: 0,
    totalContacts: 0,
    totalVisits: 0,
    conversionRate: 0,
    avgResponseTime: 'N/A',
    topPerformingProperty: 'N/A'
  });
  
  const { properties: propertiesData, loading: propertiesLoading, error: propertiesError } = useProfessionalProperties();
  
  useEffect(() => {
    const loadProperties = async () => {
      try {
        setLoading(propertiesLoading);
        setProperties(propertiesData || []);
        
        // Calcular estatísticas básicas (sem dados de visualizações/contatos reais)
        const totalProperties = propertiesData?.length || 0;
        setStats({
          totalViews: 0, // Seria necessário implementar tracking de visualizações
          totalContacts: 0, // Seria necessário implementar sistema de contatos
          totalVisits: 0, // Seria necessário implementar sistema de visitas
          conversionRate: 0,
          avgResponseTime: 'N/A',
          topPerformingProperty: totalProperties > 0 ? propertiesData[0]?.title || 'N/A' : 'N/A'
        });
      } catch (error) {
        console.error('Erro ao carregar propriedades:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadProperties();
  }, [propertiesData, propertiesLoading]);
  
  const [recentContacts] = useState([]); // Seria necessário implementar sistema de contatos
  
  const filteredProperties = propertyFilter === 'all' 
    ? properties 
    : properties.filter(property => property.category === propertyFilter);
    
  if (loading) {
    return (
      <div className="space-y-8">
        <h1 className="text-2xl font-semibold text-gray-800 mb-6">Estatísticas de Desempenho</h1>
        <div className="flex justify-center items-center h-64">
          <div className="text-gray-500">Carregando estatísticas...</div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-semibold text-gray-800 mb-6">Estatísticas de Desempenho</h1>
      
      {/* Filtro de período e propriedade */}
      <div className="bg-white p-4 rounded-lg shadow-md">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <div className="flex items-center">
              <Calendar className="h-5 w-5 text-gray-400 mr-2" />
              <label htmlFor="dateRange" className="text-sm text-gray-500 mr-2">Período:</label>
              <select
                id="dateRange"
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="focus:ring-green-500 focus:border-green-500 border border-gray-300 rounded-md text-sm"
              >
                <option value="7">Últimos 7 dias</option>
                <option value="30">Últimos 30 dias</option>
                <option value="90">Últimos 90 dias</option>
                <option value="365">Último ano</option>
              </select>
            </div>
          </div>
          
          <div>
            <div className="flex items-center justify-end">
              <Filter className="h-5 w-5 text-gray-400 mr-2" />
              <label htmlFor="propertyFilter" className="text-sm text-gray-500 mr-2">Filtrar por tipo:</label>
              <select
                id="propertyFilter"
                value={propertyFilter}
                onChange={(e) => setPropertyFilter(e.target.value)}
                className="focus:ring-green-500 focus:border-green-500 border border-gray-300 rounded-md text-sm"
              >
                <option value="all">Todos os imóveis</option>
                <option value="apartamento">Apartamentos</option>
                <option value="casa">Casas</option>
                <option value="comercial">Comercial</option>
                <option value="terreno">Terrenos</option>
              </select>
            </div>
          </div>
        </div>
      </div>
      
      {/* Cards de estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6 border-t-4 border-blue-500">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm font-medium text-gray-500">Total de Visualizações</p>
              <p className="mt-1 text-3xl font-semibold text-gray-900">{stats.totalViews}</p>
            </div>
            <div className="bg-blue-100 rounded-full p-3">
              <Eye className="h-8 w-8 text-blue-500" />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6 border-t-4 border-purple-500">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm font-medium text-gray-500">Total de Contatos</p>
              <p className="mt-1 text-3xl font-semibold text-gray-900">{stats.totalContacts}</p>
            </div>
            <div className="bg-purple-100 rounded-full p-3">
              <MessageCircle className="h-8 w-8 text-purple-500" />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6 border-t-4 border-green-500">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm font-medium text-gray-500">Visitas Agendadas</p>
              <p className="mt-1 text-3xl font-semibold text-gray-900">{stats.totalVisits}</p>
            </div>
            <div className="bg-green-100 rounded-full p-3">
              <UserCheck className="h-8 w-8 text-green-500" />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm font-medium text-gray-500">Taxa de Conversão</p>
              <p className="mt-1 text-3xl font-semibold text-gray-900">{stats.conversionRate}%</p>
              <p className="text-xs text-gray-500 mt-1">Contatos/Visualizações</p>
            </div>
            <div className="bg-yellow-100 rounded-full p-3">
              <TrendingUp className="h-8 w-8 text-yellow-500" />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm font-medium text-gray-500">Tempo Médio de Resposta</p>
              <p className="mt-1 text-3xl font-semibold text-gray-900">{stats.avgResponseTime}</p>
            </div>
            <div className="bg-red-100 rounded-full p-3">
              <Clock className="h-8 w-8 text-red-500" />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm font-medium text-gray-500">Imóvel com Melhor Desempenho</p>
              <p className="mt-1 text-xl font-semibold text-gray-900 truncate">{stats.topPerformingProperty}</p>
            </div>
            <div className="bg-indigo-100 rounded-full p-3">
              <Home className="h-8 w-8 text-indigo-500" />
            </div>
          </div>
        </div>
      </div>
      
      {/* Gráfico */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-medium text-gray-800">Desempenho ao Longo do Tempo</h2>
          <select className="focus:ring-green-500 focus:border-green-500 border border-gray-300 rounded-md text-sm">
            <option>Visualizações</option>
            <option>Contatos</option>
            <option>Visitas</option>
          </select>
        </div>
        
        <div className="h-64 flex items-center justify-center text-gray-400 border border-dashed border-gray-300 rounded-md">
          <div className="flex flex-col items-center">
            <TrendingUp className="w-12 h-12 mb-4" />
            <p>Gráfico de estatísticas seria exibido aqui</p>
            <p className="text-sm">Visualizações ao longo do tempo</p>
          </div>
        </div>
      </div>
      
      {/* Desempenho por imóvel */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-medium text-gray-800">Desempenho por Imóvel</h2>
          <Link to="/corretor/imoveis" className="text-green-600 text-sm hover:text-green-800">
            Ver todos os imóveis
          </Link>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Imóvel
                </th>
                <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Visualizações
                </th>
                <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contatos
                </th>
                <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Visitas
                </th>
                <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Taxa de Conversão
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredProperties.length > 0 ? filteredProperties.map((property) => (
                <tr key={property.id || property._id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <img className="h-10 w-10 rounded object-cover" src={property.photos?.[0] || 'https://images.pexels.com/photos/1396132/pexels-photo-1396132.jpeg'} alt="" />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{property.title}</div>
                        <div className="text-xs text-gray-500">
                          {property.category === 'apartamento' ? 'Apartamento' : 
                            property.category === 'casa' ? 'Casa' : 
                            property.category === 'comercial' ? 'Comercial' : 'Terreno'}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <div className="text-sm text-gray-900">0</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <div className="text-sm text-gray-900">0</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <div className="text-sm text-gray-900">0</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <div className="text-sm text-gray-900">0%</div>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                    Nenhuma propriedade encontrada
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Contatos Recentes */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-medium text-gray-800">Contatos Recentes</h2>
          <Link to="/corretor/contatos" className="text-green-600 text-sm hover:text-green-800">
            Ver todos os contatos
          </Link>
        </div>
        
        <div className="space-y-6">
          {recentContacts.length > 0 ? recentContacts.map((contact) => (
            <div key={contact.id} className="border-b border-gray-100 pb-6">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-md font-medium text-gray-800">{contact.name}</h3>
                  <div className="flex items-center mt-1 text-sm text-gray-500">
                    <Clock className="w-4 h-4 mr-1" />
                    <span>{contact.date}</span>
                  </div>
                </div>
                <span 
                  className={`px-2 py-1 text-xs rounded-full font-medium
                    ${contact.status === 'Não respondido' ? 'bg-red-100 text-red-800' : 
                      contact.status === 'Respondido' ? 'bg-blue-100 text-blue-800' : 
                      'bg-green-100 text-green-800'}`}
                >
                  {contact.status}
                </span>
              </div>
              
              <div className="mt-2">
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Imóvel:</span> {contact.property}
                </p>
                <p className="mt-2 text-sm text-gray-600">{contact.message}</p>
              </div>
              
              <div className="mt-4 flex space-x-2">
                <button className="px-3 py-1 bg-green-600 text-white text-sm rounded-md hover:bg-green-700">
                  Responder
                </button>
                {contact.status !== 'Visita agendada' && (
                  <button className="px-3 py-1 border border-green-600 text-green-600 text-sm rounded-md hover:bg-green-50">
                    Agendar Visita
                  </button>
                )}
              </div>
            </div>
          )) : (
            <div className="text-center py-8 text-gray-500">
              <MessageCircle className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>Nenhum contato recente</p>
              <p className="text-sm">Os contatos dos interessados aparecerão aqui</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfessionalStatistics;