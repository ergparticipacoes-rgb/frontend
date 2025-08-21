import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, X, Loader2, CreditCard, AlertCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { API_CONFIG } from '../config/api';

interface Plan {
  id: string;
  name: string;
  description: string;
  maxProperties: number;
  price: number;
  duration: number;
  features: string[];
  isActive: boolean;
  priority: number;
}

const PlanSelection: React.FC = () => {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_CONFIG.BASE_URL}/plans`);
      
      if (!response.ok) {
        throw new Error('Erro ao carregar planos');
      }
      
      const data = await response.json();
      setPlans(data.plans || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectPlan = async (planId: string) => {
    if (!user?.token) {
      setError('Você precisa estar logado para selecionar um plano');
      return;
    }

    try {
      setProcessing(true);
      setSelectedPlan(planId);
      
      const response = await fetch(`${API_CONFIG.BASE_URL}/plans/select/${planId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${user.token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro ao selecionar plano');
      }

      const result = await response.json();
      
      // Update user context with new plan data
      if (result.user) {
        // Update the auth context with new user data
        updateUser({
          activePlan: result.user.activePlan,
          planStartDate: result.user.planStartDate,
          planEndDate: result.user.planEndDate,
          publishedProperties: result.user.publishedProperties
        });
      }
      
      // Show success message
      alert(`${result.message}\n\nVocê será redirecionado para o dashboard.`);
      
      // Navigate to dashboard (React Router way, preserves SPA experience)
      setTimeout(() => {
        navigate('/corretor');
      }, 500);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao selecionar plano');
      setSelectedPlan(null);
    } finally {
      setProcessing(false);
    }
  };

  const getPlanRecommendation = (plan: Plan) => {
    if (plan.name === 'Básico') return 'Ideal para iniciantes';
    if (plan.name === 'Profissional') return 'Mais popular';
    if (plan.name === 'Premium') return 'Melhor custo-benefício';
    if (plan.name === 'Empresarial') return 'Para grandes equipes';
    return null;
  };

  const getPlanColor = (plan: Plan) => {
    if (plan.name === 'Básico') return 'border-gray-300';
    if (plan.name === 'Bronze') return 'border-amber-600';
    if (plan.name === 'Silver' || plan.name === 'Profissional') return 'border-gray-400';
    if (plan.name === 'Gold' || plan.name === 'Premium') return 'border-yellow-500';
    if (plan.name === 'Empresarial') return 'border-purple-600';
    return 'border-blue-500';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto" />
          <p className="mt-4 text-gray-600">Carregando planos disponíveis...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto" />
            <h2 className="mt-4 text-xl font-semibold text-gray-900">Erro ao carregar planos</h2>
            <p className="mt-2 text-gray-600">{error}</p>
            <button
              onClick={fetchPlans}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Tentar novamente
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Escolha seu Plano
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Selecione o plano ideal para suas necessidades e comece a publicar seus imóveis hoje mesmo
          </p>
        </div>

        {/* Plans Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {plans
            .sort((a, b) => a.priority - b.priority)
            .map((plan) => {
              const recommendation = getPlanRecommendation(plan);
              const isSelecting = selectedPlan === plan.id && processing;
              
              return (
                <div
                  key={plan.id}
                  className={`relative bg-white rounded-lg shadow-lg border-2 ${getPlanColor(plan)} hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1`}
                >
                  {/* Recommendation Badge */}
                  {recommendation && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                      <span className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-1 rounded-full text-xs font-semibold">
                        {recommendation}
                      </span>
                    </div>
                  )}

                  <div className="p-6">
                    {/* Plan Name */}
                    <h3 className="text-2xl font-bold text-gray-900 text-center mb-2">
                      {plan.name}
                    </h3>
                    
                    {/* Plan Description */}
                    <p className="text-gray-600 text-center text-sm mb-4">
                      {plan.description}
                    </p>

                    {/* Price */}
                    <div className="text-center mb-6">
                      <span className="text-4xl font-bold text-gray-900">
                        R$ {plan.price.toFixed(2).replace('.', ',')}
                      </span>
                      <span className="text-gray-600 ml-2">/{plan.duration} dias</span>
                    </div>

                    {/* Properties Limit */}
                    <div className="bg-blue-50 rounded-lg p-3 mb-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-700">Imóveis</span>
                        <span className="text-lg font-bold text-blue-600">
                          {plan.maxProperties}
                        </span>
                      </div>
                    </div>

                    {/* Features */}
                    <div className="space-y-3 mb-6">
                      {plan.features.slice(0, 4).map((feature, index) => (
                        <div key={index} className="flex items-start">
                          <Check className="h-5 w-5 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                          <span className="text-sm text-gray-600">{feature}</span>
                        </div>
                      ))}
                      {plan.features.length > 4 && (
                        <div className="text-sm text-blue-600 font-medium">
                          + {plan.features.length - 4} recursos adicionais
                        </div>
                      )}
                    </div>

                    {/* Select Button */}
                    <button
                      onClick={() => handleSelectPlan(plan.id)}
                      disabled={processing}
                      className={`w-full py-3 px-4 rounded-lg font-semibold transition-all duration-200 flex items-center justify-center ${
                        isSelecting
                          ? 'bg-gray-400 text-white cursor-not-allowed'
                          : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700'
                      }`}
                    >
                      {isSelecting ? (
                        <>
                          <Loader2 className="h-5 w-5 animate-spin mr-2" />
                          Processando...
                        </>
                      ) : (
                        <>
                          <CreditCard className="h-5 w-5 mr-2" />
                          Selecionar Plano
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
        </div>

        {/* No Plans Available */}
        {plans.length === 0 && (
          <div className="text-center py-12">
            <div className="bg-white rounded-lg shadow-lg p-8 max-w-md mx-auto">
              <AlertCircle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Nenhum plano disponível
              </h3>
              <p className="text-gray-600">
                Entre em contato com o administrador para mais informações.
              </p>
            </div>
          </div>
        )}

        {/* Footer Info */}
        <div className="mt-12 text-center">
          <p className="text-gray-600">
            Precisa de ajuda para escolher? 
            <a href="#" className="text-blue-600 hover:underline ml-1">
              Fale com nosso suporte
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default PlanSelection;