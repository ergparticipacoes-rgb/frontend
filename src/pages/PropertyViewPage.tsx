import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Share2, 
  Heart, 
  MapPin, 
  Ruler, 
  Bed, 
  Bath, 
  Car, 
  Calendar, 
  User, 
  Phone, 
  Mail, 
  Home, 
  Building, 
  Layers, 
  Eye,
  ChevronLeft,
  ChevronRight,
  X,
  DollarSign,
  Tag,
  Clock,
  CheckCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { API_CONFIG } from '../config/api';
import { Property } from '../types';
import { useFavorites } from '../hooks/useFavorites';
import { getPropertyPhone, maskPhoneNumber } from '../utils/phoneUtils';
import PhonePopup from '../components/PhonePopup';

function PropertyViewPage() {
  const { identifier } = useParams();
  const navigate = useNavigate();
  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showImageModal, setShowImageModal] = useState(false);
  const [showContactForm, setShowContactForm] = useState(false);
  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    phone: '',
    message: ''
  });
  const [showPhonePopup, setShowPhonePopup] = useState(false);
  
  const { favorites, toggleFavorite } = useFavorites();
  const isFavorite = property ? favorites.includes(property.id || property._id || '') : false;

  useEffect(() => {
    const fetchProperty = async () => {
      console.log('Fetching property with identifier:', identifier);
      try {
        const response = await fetch(`${API_CONFIG.BASE_URL}/properties/${identifier}`);
        if (!response.ok) throw new Error('Erro ao buscar imóvel');
        const data = await response.json();
        setProperty(data);
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    };
    fetchProperty();
  }, [identifier]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const getAvailabilityText = (availability: string) => {
    switch (availability) {
      case 'sale': return 'Venda';
      case 'rent': return 'Locação';
      case 'both': return 'Venda/Locação';
      default: return availability;
    }
  };

  const getCategoryText = (category: string) => {
    const categories = {
      apartment: 'Apartamento',
      house: 'Casa',
      chacara: 'Chácara',
      terrain: 'Terreno',
      salon: 'Salão',
      sobrado: 'Sobrado'
    };
    return categories[category as keyof typeof categories] || category;
  };

  const getSolarPositionText = (position: string) => {
    const positions = {
      morning: 'Nascente',
      afternoon: 'Poente',
      both: 'Nascente e Poente'
    };
    return positions[position as keyof typeof positions] || position;
  };

  const getAddressVisibilityText = (visibility: string) => {
    const options = {
      full_address: 'Endereço Completo',
      street_neighborhood: 'Rua e Bairro',
      neighborhood_only: 'Apenas Bairro',
      no_address: 'Sem Endereço'
    };
    return options[visibility as keyof typeof options] || visibility;
  };

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Aqui você pode implementar o envio do formulário
    console.log('Contact form submitted:', contactForm);
    setShowContactForm(false);
    // Reset form
    setContactForm({ name: '', email: '', phone: '', message: '' });
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: property?.title,
        text: property?.description,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Link copiado para a área de transferência!');
    }
  };

  const nextImage = () => {
    if (property && property.photos.length > 0) {
      setCurrentImageIndex((prev) => (prev + 1) % property.photos.length);
    }
  };

  const prevImage = () => {
    if (property && property.photos.length > 0) {
      setCurrentImageIndex((prev) => (prev - 1 + property.photos.length) % property.photos.length);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <div className="text-xl text-gray-600">Carregando detalhes do imóvel...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="text-xl text-red-600 mb-4">Erro: {error}</div>
          <button 
            onClick={() => navigate(-1)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Voltar
          </button>
        </div>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="text-xl text-gray-600 mb-4">Imóvel não encontrado</div>
          <button 
            onClick={() => navigate(-1)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Voltar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <button 
              onClick={() => navigate(-1)} 
              className="flex items-center text-blue-600 hover:text-blue-800 transition-colors"
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              Voltar
            </button>
            

          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Image Gallery */}
            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
              <div className="relative">
                <img
                  src={property.photos[currentImageIndex] || 'https://images.pexels.com/photos/1643384/pexels-photo-1643384.jpeg'}
                  alt={property.title}
                  className="w-full h-96 object-cover cursor-pointer"
                  onClick={() => setShowImageModal(true)}
                />
                
                {property.photos.length > 1 && (
                  <>
                    <button
                      onClick={prevImage}
                      className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70 transition-all"
                    >
                      <ChevronLeft className="h-5 w-5" />
                    </button>
                    <button
                      onClick={nextImage}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70 transition-all"
                    >
                      <ChevronRight className="h-5 w-5" />
                    </button>
                  </>
                )}
                
                <div className="absolute top-4 left-4 flex space-x-2">
                  <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                    {getAvailabilityText(property.availability)}
                  </span>
                  {property.isFeatured && (
                    <span className="bg-orange-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                      Destaque
                    </span>
                  )}
                </div>
                
                {property.photos.length > 1 && (
                  <div className="absolute bottom-4 right-4 bg-black bg-opacity-50 text-white px-3 py-1 rounded-full text-sm">
                    {currentImageIndex + 1} / {property.photos.length}
                  </div>
                )}
              </div>
              
              {/* Thumbnail Gallery */}
              {property.photos.length > 1 && (
                <div className="p-4">
                  <div className="flex space-x-2 overflow-x-auto">
                    {property.photos.map((photo, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentImageIndex(index)}
                        className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                          index === currentImageIndex ? 'border-blue-500' : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <img
                          src={photo}
                          alt={`${property.title} - ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Property Details */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="mb-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">{property.title}</h1>
                    {property.reference && (
                      <p className="text-sm text-gray-500 mb-2">Ref: {property.reference}</p>
                    )}
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold text-green-600 mb-1">
                      {formatPrice(property.price)}
                    </div>
                    {property.condominiumPrice && (
                      <p className="text-sm text-gray-600">
                        + Condomínio: {formatPrice(property.condominiumPrice)}
                      </p>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center space-x-1 text-gray-600 mb-4">
                  <MapPin className="h-5 w-5" />
                  <span>
                    {property.addressVisibility === 'no_address' 
                      ? 'Endereço não divulgado'
                      : property.addressVisibility === 'neighborhood_only'
                      ? `${property.address.neighborhood}, ${property.address.city} - ${property.address.state}`
                      : property.addressVisibility === 'street_neighborhood'
                      ? `${property.address.street} - ${property.address.neighborhood}, ${property.address.city} - ${property.address.state}`
                      : `${property.address.street}, ${property.address.number} - ${property.address.neighborhood}, ${property.address.city} - ${property.address.state}, CEP: ${property.address.cep}`
                    }
                  </span>
                </div>
              </div>

              {/* Property Features */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg">
                  <Bed className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="text-sm text-gray-600">Quartos</p>
                    <p className="font-semibold">{property.bedrooms}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg">
                  <Bath className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="text-sm text-gray-600">Banheiros</p>
                    <p className="font-semibold">{property.bathrooms}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg">
                  <Ruler className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="text-sm text-gray-600">Área Total</p>
                    <p className="font-semibold">{property.totalArea}m²</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg">
                  <Home className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="text-sm text-gray-600">Tipo</p>
                    <p className="font-semibold">{getCategoryText(property.category)}</p>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="mb-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Descrição</h3>
                <p className="text-gray-700 leading-relaxed whitespace-pre-line">{property.description}</p>
              </div>

              {/* Video */}
              {property.videoLink && (
                <div className="mb-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">Vídeo do Imóvel</h3>
                  <div className="relative rounded-lg overflow-hidden bg-black" style={{ paddingBottom: '56.25%' }}>
                    <iframe 
                      src={property.videoLink}
                      className="absolute top-0 left-0 w-full h-full"
                      allowFullScreen
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      title="Vídeo do imóvel"
                    />
                  </div>
                </div>
              )}

              {/* Features */}
              {(property.generalFeatures?.length || property.condominiumFeatures?.length || property.proximityFeatures?.length) && (
                <div className="space-y-6">
                  {property.generalFeatures && property.generalFeatures.length > 0 && (
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-3">Características Gerais</h3>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                        {property.generalFeatures.map((feature, index) => (
                          <div key={index} className="flex items-center space-x-2 text-gray-700">
                            <CheckCircle className="h-4 w-4 text-green-500" />
                            <span className="text-sm">{feature}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {property.condominiumFeatures && property.condominiumFeatures.length > 0 && (
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-3">Características do Condomínio</h3>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                        {property.condominiumFeatures.map((feature, index) => (
                          <div key={index} className="flex items-center space-x-2 text-gray-700">
                            <CheckCircle className="h-4 w-4 text-green-500" />
                            <span className="text-sm">{feature}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {property.proximityFeatures && property.proximityFeatures.length > 0 && (
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-3">Proximidades</h3>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                        {property.proximityFeatures.map((feature, index) => (
                          <div key={index} className="flex items-center space-x-2 text-gray-700">
                            <CheckCircle className="h-4 w-4 text-green-500" />
                            <span className="text-sm">{feature}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Contact Card */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Interessado?</h3>
              <p className="text-gray-600 mb-6">Entre em contato para mais informações sobre este imóvel.</p>
              
              
              <div className="space-y-3">
                {/* Exibir número mascarado */}
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Telefone para contato:</p>
                  <p className="font-medium text-gray-900">
                    {maskPhoneNumber(property.telefoneContato || property.ownerId?.phone || '')}
                  </p>
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setShowPhonePopup(true)}
                    className="flex items-center justify-center space-x-2 bg-blue-600 text-white py-2 px-3 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                  >
                    <Phone className="h-4 w-4" />
                    <span>Ver telefone</span>
                  </button>
                  <a
                    href={`https://wa.me/55${(property.telefoneContato || property.ownerId?.phone || '').replace(/\D/g, '')}?text=Olá! Vi o anúncio do imóvel ${property.title} no Busca Imóveis 013. ${property.reference ? `Referência: ${property.reference}. ` : ''}Gostaria de mais informações.`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center space-x-2 bg-green-500 text-white py-2 px-3 rounded-lg hover:bg-green-600 transition-colors text-sm"
                  >
                    <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.963-.94 1.16-.173.199-.347.221-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.795-1.484-1.77-1.66-2.07-.174-.297-.018-.458.13-.606.136-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.508-.172-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.87.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.345m-5.446 7.443h-.004a9.87 9.87 0 01-5.031-1.378l-.36-.214-3.741.982.998-3.648-.235-.375a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.549 4.142 1.595 5.945L0 24l6.335-1.652a11.882 11.882 0 005.723 1.467h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                    </svg>
                    <span>WhatsApp</span>
                  </a>
                </div>
              </div>
            </div>

            {/* Property Info */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Informações Completas</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Código:</span>
                  <span className="font-medium">{property.reference || property.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Tipo:</span>
                  <span className="font-medium">{getCategoryText(property.category)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Disponibilidade:</span>
                  <span className="font-medium">{getAvailabilityText(property.availability)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Quartos:</span>
                  <span className="font-medium">{property.bedrooms}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Banheiros:</span>
                  <span className="font-medium">{property.bathrooms}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Salas:</span>
                  <span className="font-medium">{property.livingRooms}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Área Total:</span>
                  <span className="font-medium">{property.totalArea}m²</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Área Útil:</span>
                  <span className="font-medium">{property.usefulArea}m²</span>
                </div>
                {property.solarPosition && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Posição Solar:</span>
                    <span className="font-medium">{getSolarPositionText(property.solarPosition)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-600">Valor:</span>
                  <span className="font-medium text-green-600">{formatPrice(property.price)}</span>
                </div>
                {property.condominiumPrice && property.condominiumPrice > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Condomínio:</span>
                    <span className="font-medium">{formatPrice(property.condominiumPrice)}</span>
                  </div>
                )}
                {property.tags && property.tags.length > 0 && (
                  <div className="pt-3 border-t">
                    <span className="text-gray-600 block mb-2">Tags:</span>
                    <div className="flex flex-wrap gap-1">
                      {property.tags.map((tag, index) => (
                        <span key={index} className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">{tag}</span>
                      ))}
                    </div>
                  </div>
                )}
                <div className="pt-3 border-t">
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-600">Publicado:</span>
                    <span className="font-medium text-sm">{new Date(property.createdAt).toLocaleDateString('pt-BR')}</span>
                  </div>
                  {property.updatedAt && property.updatedAt !== property.createdAt && (
                    <div className="flex justify-between mb-2">
                      <span className="text-gray-600">Atualizado:</span>
                      <span className="font-medium text-sm">{new Date(property.updatedAt).toLocaleDateString('pt-BR')}</span>
                    </div>
                  )}
                </div>
                {property.isFeatured && (
                  <div className="pt-3 border-t">
                    <div className="flex items-center justify-center bg-orange-50 p-2 rounded">
                      <span className="text-orange-600 font-medium">⭐ Imóvel em Destaque</span>
                    </div>
                  </div>
                )}
                <div className="pt-3 border-t">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Visibilidade do Endereço:</span>
                    <span className="font-medium text-sm">{getAddressVisibilityText(property.addressVisibility)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Owner Info */}
            {property.ownerId && typeof property.ownerId === 'object' && (
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Anunciante</h3>
                <div className="space-y-3">
                  {property.ownerId.name && (
                    <div className="flex items-center space-x-2">
                      <User className="h-4 w-4 text-gray-500" />
                      <span className="text-gray-700">{property.ownerId.name}</span>
                    </div>
                  )}
                  {property.ownerId.email && (
                    <div className="flex items-center space-x-2">
                      <Mail className="h-4 w-4 text-gray-500" />
                      <span className="text-gray-700">{property.ownerId.email}</span>
                    </div>
                  )}
                  {property.ownerId.userType && (
                    <div className="flex items-center space-x-2">
                      <Building className="h-4 w-4 text-gray-500" />
                      <span className="text-gray-700 capitalize">{property.ownerId.userType === 'corretoria' ? 'Corretor' : property.ownerId.userType}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Tags */}
            {property.tags && property.tags.length > 0 && (
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {property.tags.map((tag, index) => (
                    <span key={index} className="flex items-center space-x-1 text-xs bg-blue-100 text-blue-800 px-3 py-1 rounded-full">
                      <Tag className="h-3 w-3" />
                      <span>{tag}</span>
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Image Modal */}
      <AnimatePresence>
        {showImageModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4"
            onClick={() => setShowImageModal(false)}
          >
            <div className="relative max-w-4xl max-h-full">
              <button
                onClick={() => setShowImageModal(false)}
                className="absolute top-4 right-4 text-white hover:text-gray-300 z-10"
              >
                <X className="h-8 w-8" />
              </button>
              
              <img
                src={property.photos[currentImageIndex]}
                alt={property.title}
                className="max-w-full max-h-full object-contain"
                onClick={(e) => e.stopPropagation()}
              />
              
              {property.photos.length > 1 && (
                <>
                  <button
                    onClick={(e) => { e.stopPropagation(); prevImage(); }}
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white hover:text-gray-300"
                  >
                    <ChevronLeft className="h-8 w-8" />
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); nextImage(); }}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white hover:text-gray-300"
                  >
                    <ChevronRight className="h-8 w-8" />
                  </button>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Contact Form Modal */}
      <AnimatePresence>
        {showContactForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
            onClick={() => setShowContactForm(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-lg shadow-xl max-w-md w-full p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-gray-900">Entrar em Contato</h3>
                <button
                  onClick={() => setShowContactForm(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
              
              <form onSubmit={handleContactSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nome</label>
                  <input
                    type="text"
                    required
                    value={contactForm.name}
                    onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    required
                    value={contactForm.email}
                    onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Telefone</label>
                  <input
                    type="tel"
                    required
                    value={contactForm.phone}
                    onChange={(e) => setContactForm({ ...contactForm, phone: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Mensagem</label>
                  <textarea
                    rows={4}
                    required
                    value={contactForm.message}
                    onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                    placeholder={`Olá! Tenho interesse no imóvel: ${property.title}`}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                
                <div className="flex space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowContactForm(false)}
                    className="flex-1 px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Enviar
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Phone Popup */}
      {property && (
        <PhonePopup
          isOpen={showPhonePopup}
          onClose={() => setShowPhonePopup(false)}
          phone={getPropertyPhone(property)}
          propertyTitle={property.title}
          propertyReference={property.reference || property.id}
          propertyPrice={property.price}
        />
      )}
    </div>
  );
}

export default PropertyViewPage;