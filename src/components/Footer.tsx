import React from 'react';
import { Facebook, Instagram, Linkedin, Mail, Phone, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useFooterSettings } from '../hooks/useFooterSettings';

const Footer: React.FC = () => {
  const { settings, loading } = useFooterSettings();
  

  if (loading) {
    return null; // Ou um skeleton loader se preferir
  }

  // Ordenar e filtrar links rápidos habilitados
  const activeQuickLinks = settings.quickLinks
    ?.filter(link => link.enabled)
    ?.sort((a, b) => a.order - b.order) || [];

  // Gerar ano atual dinamicamente
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Logo and Description */}
          <div className="lg:col-span-2">
            {settings.brandName && (
              <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent mb-4">
                {settings.brandName}
              </h3>
            )}
            {settings.description && (
              <p className="text-gray-300 mb-6 max-w-md">
                {settings.description}
              </p>
            )}
            <div className="flex space-x-4">
              {settings.socialLinks.facebook.enabled && settings.socialLinks.facebook.url && (
                <a 
                  href={settings.socialLinks.facebook.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-blue-400 transition-colors"
                >
                  <Facebook className="h-6 w-6" />
                </a>
              )}
              {settings.socialLinks.instagram.enabled && settings.socialLinks.instagram.url && (
                <a 
                  href={settings.socialLinks.instagram.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-blue-400 transition-colors"
                >
                  <Instagram className="h-6 w-6" />
                </a>
              )}
              {settings.socialLinks.linkedin.enabled && settings.socialLinks.linkedin.url && (
                <a 
                  href={settings.socialLinks.linkedin.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-blue-400 transition-colors"
                >
                  <Linkedin className="h-6 w-6" />
                </a>
              )}
            </div>
          </div>

          {/* Quick Links - Dinâmico */}
          {activeQuickLinks.length > 0 && (
            <div>
              <h4 className="text-lg font-semibold mb-4">Links Rápidos</h4>
              <ul className="space-y-2">
                {activeQuickLinks.map((link, index) => (
                  <li key={index}>
                    {link.url.startsWith('http') ? (
                      <a 
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-300 hover:text-white transition-colors"
                      >
                        {link.label}
                      </a>
                    ) : (
                      <Link 
                        to={link.url} 
                        className="text-gray-300 hover:text-white transition-colors"
                      >
                        {link.label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Contact */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Contato</h4>
            <div className="space-y-3">
              {settings.contact.phone && (
                <div className="flex items-center space-x-2">
                  <Phone className="h-4 w-4 text-blue-400" />
                  <span className="text-gray-300">{settings.contact.phone}</span>
                </div>
              )}
              {settings.contact.whatsapp && (
                <div className="flex items-center space-x-2">
                  <Phone className="h-4 w-4 text-green-400" />
                  <a 
                    href={`https://wa.me/55${settings.contact.whatsapp.replace(/\D/g, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-300 hover:text-green-400 transition-colors"
                  >
                    WhatsApp: {settings.contact.whatsapp}
                  </a>
                </div>
              )}
              {settings.contact.email && (
                <div className="flex items-center space-x-2">
                  <Mail className="h-4 w-4 text-blue-400" />
                  <a 
                    href={`mailto:${settings.contact.email}`}
                    className="text-gray-300 hover:text-blue-400 transition-colors"
                  >
                    {settings.contact.email}
                  </a>
                </div>
              )}
              {(settings.address.city || settings.address.region) && (
                <div className="flex items-start space-x-2">
                  <MapPin className="h-4 w-4 text-blue-400 mt-1" />
                  <span className="text-gray-300">
                    {settings.address.city}
                    {settings.address.city && settings.address.region && <br />}
                    {settings.address.region}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-8 mt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm">
              {settings.copyright?.showYear && `© ${currentYear}`} {settings.brandName || 'Busca Imóveis'}{settings.copyright?.customText && `. ${settings.copyright.customText}`}
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              {settings.legalLinks?.privacyPolicy?.enabled && (
                settings.legalLinks.privacyPolicy.url.startsWith('http') ? (
                  <a 
                    href={settings.legalLinks.privacyPolicy.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-400 hover:text-white text-sm transition-colors"
                  >
                    {settings.legalLinks.privacyPolicy.label || 'Política de Privacidade'}
                  </a>
                ) : (
                  <Link 
                    to={settings.legalLinks.privacyPolicy.url}
                    className="text-gray-400 hover:text-white text-sm transition-colors"
                  >
                    {settings.legalLinks.privacyPolicy.label || 'Política de Privacidade'}
                  </Link>
                )
              )}
              {settings.legalLinks?.termsOfUse?.enabled && (
                settings.legalLinks.termsOfUse.url.startsWith('http') ? (
                  <a 
                    href={settings.legalLinks.termsOfUse.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-400 hover:text-white text-sm transition-colors"
                  >
                    {settings.legalLinks.termsOfUse.label || 'Termos de Uso'}
                  </a>
                ) : (
                  <Link 
                    to={settings.legalLinks.termsOfUse.url}
                    className="text-gray-400 hover:text-white text-sm transition-colors"
                  >
                    {settings.legalLinks.termsOfUse.label || 'Termos de Uso'}
                  </Link>
                )
              )}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;