import React, { useState } from 'react';
import { MapPin, Bed, Bath, Square, DollarSign, Eye, Tag, Phone } from 'lucide-react';
import FavoriteButton from './FavoriteButton';
import PhonePopup from './PhonePopup';
import { Property } from '../types';
import { getPropertyPhone } from '../utils/phoneUtils';

interface PropertyCardProps {
  property: Property;
  viewMode?: 'grid' | 'list';
  onClick?: () => void;
}

const PropertyCard: React.FC<PropertyCardProps> = ({ property, viewMode = 'grid', onClick }) => {
  const [showPhonePopup, setShowPhonePopup] = useState(false);
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

  if (viewMode === 'list') {
    return (
      <>
        <div 
        className="bg-white rounded-lg shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer overflow-hidden flex"
        onClick={(e) => {
          // Only trigger the onClick handler if the click wasn't on the favorite button
          const target = e.target as HTMLElement;
          if (!target.closest('.favorite-button')) {
            onClick?.();
          }
        }}
      >
        {/* Image */}
        <div className="relative w-80 flex-shrink-0">
          <img
            src={property.photos[0] || 'https://images.pexels.com/photos/1643384/pexels-photo-1643384.jpeg'}
            alt={property.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute top-3 left-3 bg-blue-600 text-white px-2 py-1 rounded text-xs font-medium">
            {getAvailabilityText(property.availability)}
          </div>
          <div className="favorite-button">
            <FavoriteButton property={property} />
          </div>
          {property.isFeatured && (
            <div className="absolute bottom-3 left-3 bg-orange-500 text-white px-2 py-1 rounded text-xs font-medium">
              Destaque
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 p-6 flex flex-col justify-between">
          <div>
            {/* Price */}
            <div className="mb-3">
              <div className="flex items-center space-x-1">
                <DollarSign className="h-5 w-5 text-green-600" />
                <span className="text-2xl font-bold text-green-600">
                  {formatPrice(property.price)}
                </span>
              </div>
              {property.condominiumPrice && (
                <p className="text-sm text-gray-600">
                  + Condomínio: {formatPrice(property.condominiumPrice)}
                </p>
              )}
            </div>

            {/* Title */}
            <h3 className="text-xl font-semibold text-gray-800 mb-3 line-clamp-2">
              {property.title}
            </h3>
            {/* Reference */}
            {property.reference && <p className="text-sm text-gray-500 mb-3">Ref: {property.reference}</p>}

            {/* Description */}
            <p className="text-gray-600 mb-4 line-clamp-2">
              {property.description}
            </p>

            {/* Location */}
            <div className="flex items-center space-x-1 text-gray-600 mb-4">
              <MapPin className="h-4 w-4" />
              <span className="text-sm">
                {property.addressVisibility === 'hidden' 
                  ? property.address.city 
                  : `${property.address.neighborhood}, ${property.address.city}`
                }
              </span>
            </div>
          </div>

          <div>
            {/* Features */}
            <div className="flex items-center space-x-6 text-gray-600 mb-4">
              <div className="flex items-center space-x-1">
                <Bed className="h-4 w-4" />
                <span className="text-sm">{property.bedrooms} quartos</span>
              </div>
              <div className="flex items-center space-x-1">
                <Bath className="h-4 w-4" />
                <span className="text-sm">{property.bathrooms} banheiros</span>
              </div>
              <div className="flex items-center space-x-1">
                <Square className="h-4 w-4" />
                <span className="text-sm">{property.totalArea}m²</span>
              </div>
            </div>

            {/* Tags */}
            {property.tags && property.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {property.tags.slice(0, 3).map(tag => (
                  <span key={tag} className="flex items-center space-x-1 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                    <Tag className="h-3 w-3" />
                    <span>{tag}</span>
                  </span>
                ))}
              </div>
            )}

            {/* Footer */}
            <div className="flex justify-between items-center">
              <span className="text-sm bg-gray-100 text-gray-700 px-3 py-1 rounded-full">
                {getCategoryText(property.category)}
              </span>
              <div className="flex items-center space-x-2">
                {getPropertyPhone(property) && (
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowPhonePopup(true);
                    }}
                    className="flex items-center space-x-1 text-green-600 hover:text-green-700 text-sm font-medium"
                  >
                    <Phone className="h-4 w-4" />
                    <span>Ver telefone</span>
                  </button>
                )}
                <button className="flex items-center space-x-1 text-blue-600 hover:text-blue-700 text-sm font-medium">
                  <Eye className="h-4 w-4" />
                  <span>Ver detalhes</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        </div>

        {/* Phone Popup */}
        <PhonePopup
          isOpen={showPhonePopup}
          onClose={() => setShowPhonePopup(false)}
          phone={getPropertyPhone(property)}
          propertyTitle={property.title}
          propertyReference={property.reference || property.id}
          propertyPrice={property.price}
        />
      </>
    );
  }

  return (
    <>
      <div 
        className="bg-white rounded-lg shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer transform hover:-translate-y-1 overflow-hidden"
        onClick={(e) => {
          // Only trigger the onClick handler if the click wasn't on the favorite button
          const target = e.target as HTMLElement;
          if (!target.closest('.favorite-button')) {
            onClick?.();
          }
        }}
      >
        {/* Image */}
        <div className="relative">
          <img
            src={property.photos[0] || 'https://images.pexels.com/photos/1643384/pexels-photo-1643384.jpeg'}
            alt={property.title}
            className="w-full h-48 object-cover"
          />
          <div className="absolute top-3 left-3 bg-blue-600 text-white px-2 py-1 rounded text-xs font-medium">
            {getAvailabilityText(property.availability)}
          </div>
          <div className="favorite-button">
            <FavoriteButton property={property} />
          </div>
          {property.isFeatured && (
            <div className="absolute bottom-3 left-3 bg-orange-500 text-white px-2 py-1 rounded text-xs font-medium">
              Destaque
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-4">
          {/* Price */}
          <div className="mb-2">
            <div className="flex items-center space-x-1">
              <DollarSign className="h-4 w-4 text-green-600" />
              <span className="text-2xl font-bold text-green-600">
                {formatPrice(property.price)}
              </span>
            </div>
            {property.condominiumPrice && (
              <p className="text-sm text-gray-600">
                + Condomínio: {formatPrice(property.condominiumPrice)}
              </p>
            )}
          </div>

          {/* Title */}
          <h3 className="text-lg font-semibold text-gray-800 mb-2 line-clamp-2">
            {property.title}
          </h3>
          {/* Reference */}
          {property.reference && <p className="text-sm text-gray-500 mb-2">Ref: {property.reference}</p>}

          {/* Location */}
          <div className="flex items-center space-x-1 text-gray-600 mb-3">
            <MapPin className="h-4 w-4" />
            <span className="text-sm">
              {property.addressVisibility === 'hidden' 
                ? property.address.city 
                : `${property.address.neighborhood}, ${property.address.city}`
              }
            </span>
          </div>

          {/* Features */}
          <div className="flex items-center space-x-4 text-gray-600 mb-3">
            <div className="flex items-center space-x-1">
              <Bed className="h-4 w-4" />
              <span className="text-sm">{property.bedrooms}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Bath className="h-4 w-4" />
              <span className="text-sm">{property.bathrooms}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Square className="h-4 w-4" />
              <span className="text-sm">{property.totalArea}m²</span>
            </div>
          </div>

          {/* Category */}
          <div className="flex justify-between items-center">
            <span className="text-sm bg-gray-100 text-gray-700 px-2 py-1 rounded">
              {getCategoryText(property.category)}
            </span>
            <button className="flex items-center space-x-1 text-blue-600 hover:text-blue-700 text-sm font-medium">
              <Eye className="h-4 w-4" />
              <span>Ver detalhes</span>
            </button>
          </div>
        </div>
      </div>

      {/* Phone Popup */}
      <PhonePopup
        isOpen={showPhonePopup}
        onClose={() => setShowPhonePopup(false)}
        phone={getPropertyPhone(property)}
        propertyTitle={property.title}
        propertyReference={property.reference || property.id}
        propertyPrice={property.price}
      />
    </>
  );
};

export default PropertyCard;