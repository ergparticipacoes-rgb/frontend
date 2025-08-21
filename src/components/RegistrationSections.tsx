import React, { useState } from 'react';
import { User, Mail, Phone, MapPin, Home, CheckCircle, ArrowRight, X } from 'lucide-react';
import { API_CONFIG } from '../config/api';

// Use the image from GitHub
const corretoraImage = 'https://raw.githubusercontent.com/Gabriel-Almeida0/image/refs/heads/main/imagem%20coretora.jpeg';

// Fallback placeholder image using data URL
const placeholderImage = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200"%3E%3Crect width="200" height="200" fill="%23e5e7eb"/%3E%3Cpath d="M100 50c-20.71 0-37.5 16.79-37.5 37.5s16.79 37.5 37.5 37.5 37.5-16.79 37.5-37.5S120.71 50 100 50zm0 60c-12.43 0-22.5-10.07-22.5-22.5S87.57 65 100 65s22.5 10.07 22.5 22.5-10.07 22.5-22.5 22.5zm0 15c-27.61 0-50 10.75-50 24v6h100v-6c0-13.25-22.39-24-50-24z" fill="%239ca3af"/%3E%3C/svg%3E';

const RegistrationSections: React.FC = () => {
  const [individualForm, setIndividualForm] = useState({
    name: '',
    email: '',
    phone: '',
    city: '',
    creci: '',
    propertyType: '',
    interest: 'aluguel' // Default to Particular
  });

  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  const handleIndividualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      let endpoint = '';
      let requestData = {
        name: individualForm.name,
        email: individualForm.email,
        phone: individualForm.phone,
        city: individualForm.city
      };

      if (individualForm.interest === 'venda') {
        // Profissional - Registration Request
        endpoint = `${API_CONFIG.BASE_URL}/auth/register-professional`;
        requestData = {
          ...requestData,
          creci: individualForm.creci,
          userType: 'corretoria',
          stockSize: 'pequeno' // Default value
        };
      } else {
        // Particular - Property Request
        endpoint = `${API_CONFIG.BASE_URL}/property-requests`;
        requestData = {
          ...requestData,
          propertyType: individualForm.propertyType
        };
      }

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      });

      if (response.ok) {
        setShowSuccessMessage(true);
        
        // Reset form
        setIndividualForm({ 
          name: '', 
          email: '', 
          phone: '', 
          city: '',
          creci: '',
          propertyType: '',
          interest: 'aluguel' // Reset to default Particular
        });
      } else {
        const errorData = await response.json();
        alert(`Erro: ${errorData.message || 'Erro ao enviar solicitação'}`);
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      alert('Erro ao enviar solicitação. Tente novamente.');
    }
  };

  return (
    <section id="registration-section" className="min-h-screen bg-gradient-to-br from-emerald-50 to-blue-50 py-12 md:py-20 px-4">
      {/* Success Modal Popup */}
      {showSuccessMessage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm transition-opacity"
            onClick={() => setShowSuccessMessage(false)}
          />
          
          {/* Modal Content */}
          <div className="relative bg-white rounded-3xl shadow-2xl max-w-md w-full transform transition-all animate-[fadeInScale_0.3s_ease-out]">
            {/* Close Button */}
            <button
              onClick={() => setShowSuccessMessage(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
            
            {/* Modal Body */}
            <div className="p-8 text-center">
              {/* Success Icon */}
              <div className="mx-auto w-20 h-20 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-full flex items-center justify-center mb-6 shadow-lg">
                <CheckCircle className="h-12 w-12 text-white" />
              </div>
              
              {/* Title */}
              <h3 className="text-2xl font-bold text-gray-900 mb-3">
                Cadastro Realizado com Sucesso!
              </h3>
              
              {/* Message */}
              <p className="text-gray-600 mb-6">
                Nossa equipe entrará em contato em breve para dar continuidade ao seu cadastro.
              </p>
              
              {/* OK Button */}
              <button
                onClick={() => setShowSuccessMessage(false)}
                className="px-8 py-3 bg-gradient-to-r from-emerald-500 to-blue-500 text-white font-medium rounded-xl hover:opacity-90 transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                Entendido
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes fadeInScale {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
      `}</style>

      <div className="max-w-5xl mx-auto">

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Side - Visual */}
          <div className="hidden lg:flex flex-col justify-center p-8 rounded-2xl bg-white/80 backdrop-blur-sm shadow-xl border border-white/20 relative overflow-hidden">
            {/* Background Image - Fixed path */}
            <div 
              className="absolute inset-0 opacity-20"
              style={{
                backgroundImage: `url(${corretoraImage})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat'
              }}
            />
            
            <div className="relative h-full flex flex-col">
              <div className="relative z-10 flex-1">
                <div className="text-center mb-8">
                  <h2 className="text-4xl font-bold text-gray-800 mb-4">Seu Imóvel,<br/><span className="bg-clip-text text-transparent bg-gradient-to-r from-emerald-600 to-blue-600">Sua História</span></h2>
                  <p className="text-gray-600 mb-8">Transforme a venda ou aluguel do seu imóvel em uma experiência simples e sem complicações.</p>
                  
                  <div className="space-y-4 text-left max-w-md mx-auto">
                    <div className="flex items-start">
                      <div className="flex-shrink-0 mt-1">
                        <div className="flex items-center justify-center h-6 w-6 rounded-full bg-emerald-100 text-emerald-600">
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      </div>
                      <p className="ml-3 text-sm text-gray-600">Avaliação profissional do seu imóvel</p>
                    </div>
                    <div className="flex items-start">
                      <div className="flex-shrink-0 mt-1">
                        <div className="flex items-center justify-center h-6 w-6 rounded-full bg-emerald-100 text-emerald-600">
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      </div>
                      <p className="ml-3 text-sm text-gray-600">Fotos profissionais e divulgação</p>
                    </div>
                    <div className="flex items-start">
                      <div className="flex-shrink-0 mt-1">
                        <div className="flex items-center justify-center h-6 w-6 rounded-full bg-emerald-100 text-emerald-600">
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      </div>
                      <p className="ml-3 text-sm text-gray-600">Acompanhamento personalizado</p>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Agent Image Section */}
              <div className="relative z-10 mt-8">
                <div className="flex items-center justify-center">
                  <div className="relative">
                    <img 
                      src={corretoraImage}
                      alt="Corretora Profissional"
                      className="w-32 h-32 rounded-full object-cover shadow-lg border-4 border-white"
                      onError={(e) => {
                        console.error('Image failed to load, using placeholder');
                        (e.target as HTMLImageElement).src = placeholderImage;
                      }}
                    />
                    <div className="absolute -bottom-2 -right-2 bg-white rounded-lg shadow-md px-2 py-1">
                      <span className="text-xs font-bold text-blue-600">Busca Imóveis 013</span>
                    </div>
                  </div>
                </div>
                <p className="text-center mt-4 text-sm text-gray-600 font-medium">
                  Equipe especializada pronta para ajudar você
                </p>
              </div>
            </div>
          </div>

          {/* Right Side - Form */}
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
            <div className="p-8">
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-xl bg-gradient-to-br from-emerald-500 to-blue-500 text-white mb-4 shadow-lg transform transition-transform hover:scale-105">
                  <User className="h-8 w-8" />
                </div>
                <h2 className="text-3xl font-bold text-gray-800 mb-2">Venda ou Alugue</h2>
                <p className="text-gray-600">Preencha o formulário abaixo e nossa equipe entrará em contato</p>
              </div>

              <form onSubmit={handleIndividualSubmit} className="space-y-5">
                {/* Interest Field - Moved to top and reordered */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Você é: <span className="text-red-500">*</span>
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <label className={`flex items-center p-3 border rounded-xl cursor-pointer transition-colors ${
                      individualForm.interest === 'aluguel' ? 'border-emerald-500 bg-emerald-50' : 'border-gray-200 hover:bg-gray-50'
                    }`}>
                      <input
                        type="radio"
                        name="interest"
                        value="aluguel"
                        checked={individualForm.interest === 'aluguel'}
                        onChange={() => setIndividualForm({...individualForm, interest: 'aluguel'})}
                        className="h-4 w-4 text-emerald-600 focus:ring-emerald-500"
                        required
                      />
                      <span className="ml-3 text-sm font-medium text-gray-700">Particular</span>
                    </label>
                    <label className={`flex items-center p-3 border rounded-xl cursor-pointer transition-colors ${
                      individualForm.interest === 'venda' ? 'border-emerald-500 bg-emerald-50' : 'border-gray-200 hover:bg-gray-50'
                    }`}>
                      <input
                        type="radio"
                        name="interest"
                        value="venda"
                        checked={individualForm.interest === 'venda'}
                        onChange={() => setIndividualForm({...individualForm, interest: 'venda'})}
                        className="h-4 w-4 text-emerald-600 focus:ring-emerald-500"
                        required
                      />
                      <span className="ml-3 text-sm font-medium text-gray-700">Profissional</span>
                    </label>
                  </div>
                </div>

                {/* Name Field */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nome Completo <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center">
                      <User className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      required
                      value={individualForm.name}
                      onChange={(e) => setIndividualForm({...individualForm, name: e.target.value})}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200 placeholder-gray-400"
                      placeholder="Digite seu nome completo"
                    />
                  </div>
                </div>
                
                {/* Email Field */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    E-mail <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center">
                      <Mail className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="email"
                      required
                      value={individualForm.email}
                      onChange={(e) => setIndividualForm({...individualForm, email: e.target.value})}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200 placeholder-gray-400"
                      placeholder="seu@email.com"
                    />
                  </div>
                </div>

                {/* Phone Field */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Telefone <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center">
                      <Phone className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="tel"
                      required
                      value={individualForm.phone}
                      onChange={(e) => setIndividualForm({...individualForm, phone: e.target.value})}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200 placeholder-gray-400"
                      placeholder="(00) 00000-0000"
                    />
                  </div>
                </div>

                {/* City Field */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Cidade <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center">
                      <MapPin className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      required
                      value={individualForm.city}
                      onChange={(e) => setIndividualForm({...individualForm, city: e.target.value})}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200 placeholder-gray-400"
                      placeholder="Sua cidade"
                    />
                  </div>
                </div>

                {/* CRECI Field - Only show for Professional */}
                {individualForm.interest === 'venda' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      CRECI <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center">
                        <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                      <input
                        type="text"
                        required
                        value={individualForm.creci}
                        onChange={(e) => setIndividualForm({...individualForm, creci: e.target.value})}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200 placeholder-gray-400"
                        placeholder="Digite seu número CRECI"
                      />
                    </div>
                  </div>
                )}

                {/* Property Type - Only show for Particular */}
                {individualForm.interest === 'aluguel' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tipo de Imóvel <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center">
                        <Home className="h-5 w-5 text-gray-400" />
                      </div>
                      <select
                        required
                        value={individualForm.propertyType}
                        onChange={(e) => setIndividualForm({...individualForm, propertyType: e.target.value})}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200 appearance-none bg-white bg-no-repeat bg-[right_0.75rem_center]"
                      >
                        <option value="">Selecione o tipo de imóvel</option>
                        <option value="casa">Casa</option>
                        <option value="apartamento">Apartamento</option>
                        <option value="terreno">Terreno</option>
                        <option value="comercial">Comercial</option>
                        <option value="rural">Rural</option>
                      </select>
                    </div>
                  </div>
                )}

                {/* Submit Button */}
                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full flex items-center justify-center px-6 py-4 bg-gradient-to-r from-emerald-500 to-blue-500 text-white font-medium rounded-xl hover:opacity-90 transition-all duration-200 transform hover:-translate-y-0.5 shadow-lg hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
                  >
                    <span>Enviar Cadastro</span>
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </button>
                </div>

                {/* Privacy Note */}
                <p className="mt-4 text-xs text-center text-gray-500">
                  Ao enviar este formulário, você concorda com nossa{' '}
                  <a href="#" className="text-emerald-600 hover:underline font-medium">Política de Privacidade</a>.
                </p>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default RegistrationSections;
