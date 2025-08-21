import React, { useState } from 'react';
import { Home, Clock, Shield, CheckCircle, Loader2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const ParticularRegister: React.FC = () => {
  const { registerParticular, isLoading, error } = useAuth();
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    city: '',
  });

  const [isSubmitted, setIsSubmitted] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const result = await registerParticular(formData);
    
    if (result.success) {
      setSuccessMessage(result.message);
      setIsSubmitted(true);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  if (isSubmitted) {
    return (
      <section className="py-16 bg-gradient-to-br from-orange-50 to-orange-100" id="particular">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="bg-white rounded-2xl shadow-xl p-12">
            <CheckCircle className="h-16 w-16 text-orange-500 mx-auto mb-6" />
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Cadastro realizado!
            </h2>
            <p className="text-lg text-gray-600 mb-8">
              {successMessage || 'Nossa equipe entrará em contato para dar continuidade na publicação do seu anúncio.'}
            </p>
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-6 mb-8">
              <p className="text-sm text-orange-800">
                <strong>Observação:</strong> Todos os dados preenchidos foram recebidos pelo nosso administrador. 
                O contato via WhatsApp será realizado manualmente em breve.
              </p>
            </div>
            <button
              onClick={() => setIsSubmitted(false)}
              className="bg-orange-600 hover:bg-orange-700 text-white font-bold py-3 px-8 rounded-lg transition-colors"
            >
              Fazer Novo Cadastro
            </button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 bg-gradient-to-br from-orange-50 to-orange-100" id="particular">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Home className="h-10 w-10 text-orange-600" />
            <h2 className="text-4xl font-bold text-gray-900">
              Área Particular
            </h2>
          </div>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Venda ou alugue seus imóveis de forma rápida e descomplicada!<br />
            <span className="text-lg">Feito para proprietários de imóveis que querem facilidade para vender/alugar.</span>
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Benefits */}
          <div className="space-y-8">
            <div className="flex items-start space-x-4">
              <div className="bg-orange-100 rounded-full p-3">
                <Clock className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Processo Rápido
                </h3>
                <p className="text-gray-600">
                  Cadastro simples e rápido. Nossa equipe cuida de toda a publicação para você.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="bg-orange-100 rounded-full p-3">
                <Shield className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Segurança e Confiança
                </h3>
                <p className="text-gray-600">
                  Plataforma segura com verificação manual de todos os anúncios.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="bg-orange-100 rounded-full p-3">
                <Home className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Máxima Exposição
                </h3>
                <p className="text-gray-600">
                  Seu imóvel será visto por milhares de pessoas interessadas na região.
                </p>
              </div>
            </div>
          </div>

          {/* Form */}
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">
              Cadastro Particular
            </h3>
            
            {error && (
              <div className="bg-red-50 text-red-600 p-4 rounded-md mb-4">
                {error}
              </div>
            )}
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nome *
                </label>
                <input
                  type="text"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="Digite seu nome completo"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  E-mail
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="seu@email.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Telefone / WhatsApp *
                </label>
                <input
                  type="tel"
                  name="phone"
                  required
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="(47) 99999-9999"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Cidade *
                </label>
                <input
                  type="text"
                  name="city"
                  required
                  value={formData.city}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="Digite sua cidade"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold py-3 px-6 rounded-md transition-colors flex justify-center items-center"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                    Processando...
                  </>
                ) : (
                  'AVANÇAR'
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ParticularRegister;