import React, { useState, useEffect } from 'react';
import { Home, Eye, CreditCard, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useProfessionalProperties } from '../../hooks/useProfessionalProperties';
import PlanStatus from '../PlanStatus';
import { usePlanStatus } from '../../hooks/usePlanStatus';
import { usePlans } from '../../hooks/usePlans';

const ProfessionalOverview: React.FC = () => {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState([
    {
      title: 'Meus Imóveis',
      value: 0,
      icon: <Home className="w-8 h-8 text-green-500" />,
      path: '/corretor/imoveis',
      color: 'green'
    }
  ]);
  
  const { properties: propertiesData, loading: propertiesLoading, error: propertiesError } = useProfessionalProperties();
  const { hasActivePlan, planName, planStatus } = usePlanStatus();
  const { plans } = usePlans();
  
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(propertiesLoading);
        setProperties(propertiesData || []);
        
        // Atualizar estatísticas com dados reais
        const totalProperties = propertiesData?.length || 0;
        const featuredCount = propertiesData?.filter(p => p.isFeatured)?.length || 0;
        
        setStats([
          {
            title: 'Meus Imóveis',
            value: totalProperties,
            icon: <Home className="w-8 h-8 text-green-500" />,
            path: '/corretor/imoveis',
            color: 'green'
          }
        ]);
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, [propertiesData, propertiesLoading]);
  
  const featuredProperties = properties.filter(p => p.isFeatured).slice(0, 3);

  // Verificar se o plano atual não é o mais caro
  const isNotMostExpensivePlan = () => {
    if (!planStatus?.plan || !plans || plans.length === 0) return false;
    
    const currentPlanPrice = planStatus.plan.price;
    const maxPrice = Math.max(...plans.map(p => p.price));
    
    return currentPlanPrice < maxPrice;
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  if (loading) {
    return (
      <div>
        <h1 className="text-2xl font-semibold text-gray-800 mb-6">Dashboard Corretor</h1>
        <div className="flex justify-center items-center h-64">
          <div className="text-gray-500">Carregando dados...</div>
        </div>
      </div>
    );
  }
  
  return (
    <div>
      <h1 className="text-2xl font-semibold text-gray-800 mb-6">Dashboard Corretor</h1>

      {/* Plan Status */}
      <div className="mb-6">
        <PlanStatus showDetails={true} compact={false} className="" />
        {!hasActivePlan && (
          <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <CreditCard className="h-5 w-5 text-yellow-600 mr-2" />
                <p className="text-sm text-yellow-800">
                  Você ainda não possui um plano ativo. Selecione um plano para começar a publicar imóveis.
                </p>
              </div>
              <Link
                to="/plans"
                className="ml-4 px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 transition-colors text-sm font-medium"
              >
                Selecionar Plano
              </Link>
            </div>
          </div>
        )}
        {hasActivePlan && !planName && (
          <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <CreditCard className="h-5 w-5 text-blue-600 mr-2" />
                <p className="text-sm text-blue-800">
                  Deseja trocar ou fazer upgrade do seu plano?
                </p>
              </div>
              <Link
                to="/plans"
                className="ml-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm font-medium"
              >
                Ver Planos
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-1 gap-6 mb-8 max-w-md">
        {stats.map((stat, index) => (
          <div 
            key={index}
            className={`bg-white rounded-lg shadow-md p-6 border-t-4 border-${stat.color}-500`}
          >
            <Link 
              to={stat.path}
              className="hover:opacity-80 transition-opacity"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm font-medium">{stat.title}</p>
                  <p className="text-3xl font-bold text-gray-800 mt-1">{stat.value}</p>
                </div>
                {stat.icon}
              </div>
            </Link>
            
            {/* Botão de Upgrade se não tiver o plano mais caro */}
            {stat.title === 'Meus Imóveis' && isNotMostExpensivePlan() && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <Link
                  to="/plans"
                  className="inline-flex items-center justify-center w-full px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-md hover:from-green-600 hover:to-green-700 transition-all duration-200 text-sm font-medium shadow-sm"
                >
                  <TrendingUp className="w-4 h-4 mr-2" />
                  Fazer Upgrade do Plano
                </Link>
                <p className="text-xs text-gray-500 text-center mt-2">
                  Aumente seu limite de imóveis
                </p>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Properties */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-800">Imóveis em Destaque</h2>
            <Link to="/corretor/imoveis" className="text-green-600 text-sm hover:text-green-800">
              Ver todos
            </Link>
          </div>

          <div className="space-y-4">
            {featuredProperties.length > 0 ? featuredProperties.map((property) => (
              <div key={property.id || property._id} className="border-b border-gray-100 pb-4">
                <Link to={`/corretor/imoveis/${property.id || property._id}`} className="text-gray-800 hover:text-green-700">
                  <h3 className="font-medium">{property.title}</h3>
                </Link>
                <div className="flex items-center justify-between mt-1">
                  <div>
                    <p className="text-sm text-gray-500">
                      {property.address ? 
                        `${property.address.neighborhood}, ${property.address.city}` : 
                        'Endereço não informado'
                      }
                    </p>
                    <div className="flex items-center text-sm mt-1">
                      <span className="text-gray-600 text-xs bg-green-100 px-2 py-1 rounded">
                        {property.category || 'Categoria não informada'}
                      </span>
                    </div>
                  </div>
                  <div>
                    <p className="font-bold text-green-600">
                      {property.price > 10000
                        ? formatPrice(property.price)
                        : `${formatPrice(property.price)}/mês`}
                    </p>
                  </div>
                </div>
              </div>
            )) : (
              <div className="text-center py-8 text-gray-500">
                <Home className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>Nenhum imóvel em destaque</p>
                <p className="text-sm">Marque seus melhores imóveis como destaque</p>
              </div>
            )}
          </div>
        </div>


      </div>


    </div>
  );
};

export default ProfessionalOverview;