import React, { useState, useEffect } from 'react';
import { ArrowLeft, Share2, Heart, MapPin, Ruler, Bed, Bath, Car, Calendar, User, Phone, Mail, Home, Building, Layers, Car as CarIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import PhonePopup from './PhonePopup';
import { getPropertyPhone } from '../utils/phoneUtils';

interface PropertyDetailsProps {
  property: {
    id: string;
    reference?: string;
    title: string;
    description: string;
    price: number;
    address: {
  cep: string;
  street: string;
  number: string;
  complement?: string;
  neighborhood: string;
  city: string;
  state: string;
};
    neighborhood: string;
    city: string;
    state: string;
    area: number;
    bedrooms: number;
    bathrooms: number;
    garageSpots: number;
    type: string;
    status: 'for-sale' | 'for-rent' | 'sold' | 'rented';
    photos: string[];
    videos: string[];
    features?: string[];
    yearBuilt: number;
    floor: number;
    condoFee?: number;
    iptu?: number;
    contact: {
      name: string;
      phone: string;
      email: string;
      creci: string;
    };
  };
  onClose: () => void;
  onFavoriteToggle: (id: string) => void;
  isFavorite: boolean;
}

const PropertyDetails: React.FC<PropertyDetailsProps> = ({
  property,
  onClose,
  onFavoriteToggle,
  isFavorite,
}) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showContactForm, setShowContactForm] = useState(false);
  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
  });
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [showPhonePopup, setShowPhonePopup] = useState(false);
  const [lat, setLat] = useState<string | null>(null);
  const [lng, setLng] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  useEffect(() => {
    const fetchCoordinates = async () => {
      try {
        const cep = property.address.cep.replace(/\D/g, '');
        const response = await fetch(`https://cep.awesomeapi.com.br/json/${cep}`);
        const data = await response.json();
        if (data.lat && data.lng) {
          setLat(data.lat);
          setLng(data.lng);
        }
      } catch (error) {
        console.error('Error fetching coordinates:', error);
      }
    };
    fetchCoordinates();
  }, [property.address.cep]);

  const formatPrice = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      maximumFractionDigits: 0,
    }).format(value);
  };

  const handlePrevImage = () => {
    setCurrentImageIndex(prev => 
      prev === 0 ? property.photos.length - 1 : prev - 1
    );
  };

  const handleNextImage = () => {
    setCurrentImageIndex(prev => 
      prev === property.photos.length - 1 ? 0 : prev + 1
    );
  };

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Here you would typically send the form data to your backend
    console.log('Contact form submitted:', contactForm);
    setFormSubmitted(true);
    // Reset form after submission
    setContactForm({
      name: '',
      email: '',
      phone: '',
      message: `Olá, tenho interesse no imóvel ${property.title} (${property.reference || property.id}). Poderia me fornecer mais informações?`
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setContactForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const shareProperty = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: property.title,
          text: `Confira este imóvel: ${property.title}`,
          url: window.location.href,
        });
      } else {
        // Fallback for browsers that don't support Web Share API
        await navigator.clipboard.writeText(window.location.href);
        alert('Link copiado para a área de transferência!');
      }
    } catch (error) {
      console.error('Erro ao compartilhar:', error);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-white">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-100"
            aria-label="Voltar"
          >
            <ArrowLeft className="h-5 w-5 text-gray-700" />
          </button>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => onFavoriteToggle(property.id)}
              className="p-2 rounded-full hover:bg-gray-100"
              aria-label={isFavorite ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
            >
              <Heart 
                className={`h-5 w-5 ${isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-700'}`} 
                strokeWidth={2}
              />
            </button>
            
            <button
              onClick={shareProperty}
              className="p-2 rounded-full hover:bg-gray-100"
              aria-label="Compartilhar"
            >
              <Share2 className="h-5 w-5 text-gray-700" />
            </button>
            
            <button
              onClick={() => {
                setShowContactForm(!showContactForm);
                if (!showContactForm) {
                  // Scroll to contact form
                  setTimeout(() => {
                    document.getElementById('contact-section')?.scrollIntoView({ behavior: 'smooth' });
                  }, 100);
                }
              }}
              className="ml-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              Entrar em contato
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6">
        {/* Image Gallery */}
        <div className="relative mb-8 rounded-xl overflow-hidden bg-gray-100 aspect-[16/9]">
          {property.photos.length > 0 ? (
            <>
              <img
                src={property.photos[currentImageIndex]}
                alt={`${property.title} - Imagem ${currentImageIndex + 1}`}
                className="w-full h-full object-cover"
              />
              
              {property.photos.length > 1 && (
                <>
                  <button
                    onClick={handlePrevImage}
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full shadow-lg transition-all"
                    aria-label="Imagem anterior"
                  >
                    <svg className="h-6 w-6 text-gray-800" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  
                  <button
                    onClick={handleNextImage}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full shadow-lg transition-all"
                    aria-label="Próxima imagem"
                  >
                    <svg className="h-6 w-6 text-gray-800" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </>
              )}
              
              <div className="absolute bottom-4 left-0 right-0 flex justify-center space-x-2">
                {property.photos.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`h-2 w-2 rounded-full transition-all ${
                      index === currentImageIndex ? 'bg-white w-6' : 'bg-white/50 w-2'
                    }`}
                    aria-label={`Ir para imagem ${index + 1}`}
                  />
                ))}
              </div>
              
              <div className="absolute top-4 right-4">
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                  property.status === 'for-sale' 
                    ? 'bg-green-100 text-green-800' 
                    : property.status === 'for-rent'
                    ? 'bg-blue-100 text-blue-800'
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {property.status === 'for-sale' ? 'À Venda' : 
                   property.status === 'for-rent' ? 'Para Alugar' : 
                   property.status === 'sold' ? 'Vendido' : 'Alugado'}
                </span>
              </div>
            </>
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-200">
              <Home className="h-16 w-16 text-gray-400" />
            </div>
          )}
        </div>

        {/* Videos Section */}
        {property.videos && property.videos.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-4">Vídeos do Imóvel</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {property.videos.map((video, index) => (
                <div key={index} className="aspect-video rounded-xl overflow-hidden">
                  <iframe
                    width="100%"
                    height="100%"
                    src={video.replace('watch?v=', 'embed/')}
                    title={`Vídeo ${index + 1}`}
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 max-w-3xl">
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{property.title}</h1>
              {property.reference && (
                <p className="text-sm text-gray-500 mb-2">Referência: {property.reference}</p>
              )}
              <div className="flex items-center text-gray-600 mb-4">
                <MapPin className="h-5 w-5 mr-1" />
                <span>{`${property.address.street} ${property.address.number}${property.address.complement ? `, ${property.address.complement}` : ''}, ${property.address.neighborhood} - ${property.address.city}/${property.address.state}`}</span>
              </div>
              
              <div className="flex items-center space-x-6 mb-6">
                <div className="flex items-center">
                  <Bed className="h-5 w-5 text-gray-500 mr-2" />
                  <span className="text-gray-700">{property.bedrooms} {property.bedrooms === 1 ? 'quarto' : 'quartos'}</span>
                </div>
                <div className="flex items-center">
                  <Bath className="h-5 w-5 text-gray-500 mr-2" />
                  <span className="text-gray-700">{property.bathrooms} {property.bathrooms === 1 ? 'banheiro' : 'banheiros'}</span>
                </div>
                <div className="flex items-center">
                  <Ruler className="h-5 w-5 text-gray-500 mr-2" />
                  <span className="text-gray-700">{property.area} m²</span>
                </div>
                {property.garageSpots > 0 && (
                  <div className="flex items-center">
                    <Car className="h-5 w-5 text-gray-500 mr-2" />
                    <span className="text-gray-700">{property.garageSpots} {property.garageSpots === 1 ? 'vaga' : 'vagas'}</span>
                  </div>
                )}
              </div>
              
              <div className="bg-blue-50 p-4 rounded-lg mb-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Valor</p>
                    <p className="text-2xl font-bold text-blue-700">{formatPrice(property.price)}</p>
                    {property.type === 'apartamento' && property.condoFee && (
                      <p className="text-sm text-gray-600">Condomínio: {formatPrice(property.condoFee)}/mês</p>
                    )}
                    {property.iptu && (
                      <p className="text-sm text-gray-600">IPTU: {formatPrice(property.iptu)}/ano</p>
                    )}
                  </div>
                  <button
                    onClick={() => setShowContactForm(true)}
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
                  >
                    Agendar Visita
                  </button>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="mb-8 max-w-3xl">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Descrição</h2>
              <p className="text-gray-700 whitespace-pre-line">{property.description}</p>
            </div>

            {/* Features */}
            <div className="mb-8 max-w-3xl">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Características</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex items-center">
                  <Building className="h-5 w-5 text-blue-600 mr-2" />
                  <span className="text-gray-700">{property.type === 'casa' ? 'Casa' : 
                    property.type === 'apartamento' ? 'Apartamento' : 
                    property.type === 'terreno' ? 'Terreno' : 'Comercial'}</span>
                </div>
                <div className="flex items-center">
                  <Ruler className="h-5 w-5 text-blue-600 mr-2" />
                  <span className="text-gray-700">{property.area} m² de área útil</span>
                </div>
                {property.type === 'apartamento' && property.floor && (
                  <div className="flex items-center">
                    <Layers className="h-5 w-5 text-blue-600 mr-2" />
                    <span className="text-gray-700">{property.floor}º andar</span>
                  </div>
                )}
                {property.yearBuilt && (
                  <div className="flex items-center">
                    <Calendar className="h-5 w-5 text-blue-600 mr-2" />
                    <span className="text-gray-700">Ano {property.yearBuilt}</span>
                  </div>
                )}
                {property.features?.map((feature, index) => (
                  <div key={index} className="flex items-center">
                    <div className="h-2 w-2 rounded-full bg-blue-600 mr-2"></div>
                    <span className="text-gray-700">{feature}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Location */}
            

            {/* Contact Form */}
            <div id="contact-section" className={`mb-8 transition-all duration-300 ${showContactForm ? 'block' : 'hidden'}`}>
              <div className="max-w-lg mx-auto bg-white p-6 rounded-xl shadow-md border border-gray-100">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Entre em contato</h2>
                
                {formSubmitted ? (
                  <div className="text-center py-8">
                    <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
                      <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <h3 className="mt-3 text-lg font-medium text-gray-900">Mensagem enviada!</h3>
                    <p className="mt-2 text-sm text-gray-500">
                      Entraremos em contato o mais breve possível.
                    </p>
                    <button
                      onClick={() => setFormSubmitted(false)}
                      className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      Enviar nova mensagem
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleContactSubmit} className="space-y-4">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                        Nome completo <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={contactForm.name}
                        onChange={handleInputChange}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                          E-mail <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="email"
                          id="email"
                          name="email"
                          value={contactForm.email}
                          onChange={handleInputChange}
                          required
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      
                      <div>
                        <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                          Telefone <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="tel"
                          id="phone"
                          name="phone"
                          value={contactForm.phone}
                          onChange={handleInputChange}
                          required
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                        Mensagem
                      </label>
                      <textarea
                        id="message"
                        name="message"
                        rows={4}
                        value={contactForm.message}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Olá, gostaria de mais informações sobre este imóvel..."
                      ></textarea>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <p className="text-xs text-gray-500">
                        Ao enviar, você concorda com nossa Política de Privacidade
                      </p>
                      <button
                        type="submit"
                        className="px-6 py-2 bg-blue-600 text-white rounded-md font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        Enviar mensagem
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 lg:sticky lg:top-20 lg:w-80">
            <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Contato</h2>
              
              <div className="flex items-start space-x-4 mb-6">
                <div className="flex-shrink-0">
                  <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                    <User className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">{property.contact?.name}</h3>
                  <p className="text-sm text-gray-500">Corretor de Imóveis</p>
                  <p className="text-xs text-gray-400">CRECI: {property.contact?.creci}</p>
                </div>
              </div>
              
              <div className="space-y-3">
                
                <a
                  href={`mailto:${property.contact?.email}`}
                  className="flex items-center px-4 py-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <Mail className="h-5 w-5 text-blue-600 mr-3" />
                  <span className="text-gray-700">{property.contact?.email}</span>
                </a>
                
                <button
                  onClick={() => setShowContactForm(true)}
                  className="w-full mt-4 px-4 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center"
                >
                  <Mail className="h-5 w-5 mr-2" />
                  Enviar mensagem
                </button>
                
                <button 
                  onClick={() => setShowPhonePopup(true)}
                  className="w-full mt-2 px-4 py-3 border border-blue-600 text-blue-600 rounded-lg font-medium hover:bg-blue-50 transition-colors flex items-center justify-center"
                >
                  <Phone className="h-5 w-5 mr-2" />
                  Ver telefone
                </button>
                
                <a
                  href={`https://wa.me/${(property.contact?.phone || '').replace(/\D/g, '')}?text=Olá! Vi o anúncio do imóvel ${property.title} no valor de ${formatPrice(property.price)}. Gostaria de mais informações.`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full mt-2 px-4 py-3 border border-green-600 text-green-600 rounded-lg font-medium hover:bg-green-50 transition-colors flex items-center justify-center"
                >
                  <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.963-.94 1.16-.173.199-.347.221-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.795-1.484-1.77-1.66-2.07-.174-.297-.018-.458.13-.606.136-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.508-.172-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.87.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.345m-5.446 7.443h-.004a9.87 9.87 0 01-5.031-1.378l-.36-.214-3.741.982.998-3.648-.235-.375a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.549 4.142 1.595 5.945L0 24l6.335-1.652a11.882 11.882 0 005.723 1.467h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                  WhatsApp
                </a>
              </div>
              
              
            </div>
            
            
          </div>
        </div>
      </main>

      {/* Phone Popup */}
      <PhonePopup
        isOpen={showPhonePopup}
        onClose={() => setShowPhonePopup(false)}
        phone={getPropertyPhone(property)}
        propertyTitle={property.title}
        propertyReference={property.reference || property.id}
        propertyPrice={property.price}
      />
    </div>
  );
};

export default PropertyDetails;
