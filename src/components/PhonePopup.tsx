import React from 'react';
import { X, Phone, MessageCircle } from 'lucide-react';
import { formatPhoneNumber } from '../utils/phoneUtils';

interface PhonePopupProps {
  isOpen: boolean;
  onClose: () => void;
  phone: string;
  propertyTitle: string;
  propertyReference?: string;
  propertyPrice: number;
}

const PhonePopup: React.FC<PhonePopupProps> = ({
  isOpen,
  onClose,
  phone,
  propertyTitle,
  propertyReference,
  propertyPrice
}) => {
  if (!isOpen) return null;

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const formattedPhone = formatPhoneNumber(phone);
  const cleanPhone = phone.replace(/\D/g, '');
  const whatsappMessage = `Olá! Vi o anúncio do imóvel ${propertyTitle} no valor de ${formatPrice(propertyPrice)} no Busca Imóveis 013. ${propertyReference ? `Referência: ${propertyReference}. ` : ''}Gostaria de mais informações.`;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 z-50 transition-opacity"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 relative animate-fadeIn">
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1 rounded-full hover:bg-gray-100 transition-colors"
            aria-label="Fechar"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>

          {/* Header */}
          <h2 className="text-xl font-bold text-gray-900 mb-2">Entre em contato</h2>
          
          {/* Phone number display */}
          <div className="bg-gray-50 rounded-lg p-4 mb-4">
            <p className="text-2xl font-bold text-center text-gray-900 mb-2">
              {formattedPhone}
            </p>
          </div>

          {/* Action buttons */}
          <div className="space-y-3">
            {/* Call button */}
            <a
              href={`tel:${cleanPhone}`}
              className="w-full flex items-center justify-center space-x-2 bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              <Phone className="h-5 w-5" />
              <span>Ligar agora</span>
            </a>

            {/* WhatsApp section */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="bg-white px-3 text-gray-500">ou</span>
              </div>
            </div>

            <div className="text-center">
              <p className="text-sm text-gray-600 mb-3">
                Se preferir, fale agora mesmo no WhatsApp
              </p>
              
              <a
                href={`https://wa.me/55${cleanPhone}?text=${encodeURIComponent(whatsappMessage)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center space-x-2 bg-green-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-green-700 transition-colors"
              >
                <MessageCircle className="h-5 w-5" />
                <span>Conversar no WhatsApp</span>
              </a>
            </div>
          </div>

          {/* Reference message */}
          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <p className="text-xs text-blue-800 text-center">
              Para facilitar o atendimento, fale que viu o anúncio no Busca Imóveis 013.
              {propertyReference && (
                <>
                  <br />
                  <span className="font-semibold">Referência: {propertyReference}</span>
                </>
              )}
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default PhonePopup;