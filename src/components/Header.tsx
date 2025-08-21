import React, { useState, useEffect } from 'react';
import { Menu, X, User, LogOut, Home, Building, Settings, TrendingUp, Search, ClipboardList } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import LoginForm from './LoginForm';
import PlanStatus from './PlanStatus';
import { usePlanStatus } from '../hooks/usePlanStatus';
import { usePlans } from '../hooks/usePlans';
import { API_CONFIG } from '../config/api';


const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [adminWhatsApp, setAdminWhatsApp] = useState('');
  const navigate = useNavigate();

  const { user, logout } = useAuth();
  const { planStatus } = usePlanStatus();
  const { plans } = usePlans();

  const navigation = [
    { name: 'Início', href: '/', icon: Home },
    { name: 'Venda ou Alugue', href: '#registration', icon: ClipboardList, isAction: true },
    { name: 'Imóveis', href: '/properties', icon: Building },
  ];

  useEffect(() => {
    // Buscar configurações do admin
    const fetchSettings = async () => {
      try {
        const response = await fetch(`${API_CONFIG.BASE_URL}/settings`);
        if (response.ok) {
          const data = await response.json();
          setAdminWhatsApp(data.adminWhatsApp);
        }
      } catch (error) {
        console.error('Erro ao buscar configurações:', error);
      }
    };
    
    if (user?.userType === 'corretoria') {
      fetchSettings();
    }
  }, [user]);

  // Verificar se o plano atual não é o mais caro
  const isNotMostExpensivePlan = () => {
    if (!planStatus?.plan || !plans || plans.length === 0) {
      return false;
    }
    
    const currentPlanPrice = planStatus.plan.price;
    const maxPrice = Math.max(...plans.map(p => p.price));
    
    return currentPlanPrice < maxPrice;
  };

  const handleUpgradeClick = () => {
    if (!adminWhatsApp) {
      window.open('https://wa.me/5511999999999?text=Olá, gostaria de fazer upgrade do meu plano', '_blank');
      return;
    }
    
    // Formatar número do WhatsApp (remover caracteres especiais)
    const cleanNumber = adminWhatsApp.replace(/\D/g, '');
    const whatsappNumber = cleanNumber.startsWith('55') ? cleanNumber : `55${cleanNumber}`;
    
    const message = encodeURIComponent(
      `Olá! Sou ${user?.name} e gostaria de fazer upgrade do meu plano atual (${planStatus?.plan?.name}). Poderia me ajudar?`
    );
    
    window.open(`https://wa.me/${whatsappNumber}?text=${message}`, '_blank');
  };

  const openLoginModal = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsLoginModalOpen(true);
  };

  const handleNavigationClick = (item: any) => {
    if (item.isAction && item.href === '#registration') {
      // Se estiver na home, faz scroll suave
      if (window.location.pathname === '/') {
        const element = document.getElementById('registration-section');
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      } else {
        // Se não estiver na home, navega para home e depois faz scroll
        navigate('/#registration');
        setTimeout(() => {
          const element = document.getElementById('registration-section');
          if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
          }
        }, 100);
      }
    }
  };

  return (
    <>
      <header className="bg-white shadow-lg sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            {/* Logo */}
            <div className="flex items-center">
              <Link to="/" className="flex-shrink-0 flex items-center space-x-3">
                <div className="relative h-10 w-10 bg-gradient-to-br from-blue-500 to-blue-700 rounded-lg flex items-center justify-center shadow-md">
                  <Home className="h-6 w-6 text-white" />
                  <Search className="h-4 w-4 text-white absolute -bottom-1 -right-1 bg-blue-600 rounded-full p-0.5" />
                </div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
                  Busca Imóveis 013
                </h1>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex space-x-8">
              {navigation.map((item) => (
                item.isAction ? (
                  <button
                    key={item.name}
                    onClick={() => handleNavigationClick(item)}
                    className="flex items-center space-x-1 text-gray-600 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                  >
                    <item.icon className="h-4 w-4" />
                    <span>{item.name}</span>
                  </button>
                ) : item.href.startsWith('#') ? (
                  <a
                    key={item.name}
                    href={item.href}
                    className="flex items-center space-x-1 text-gray-600 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                  >
                    <item.icon className="h-4 w-4" />
                    <span>{item.name}</span>
                  </a>
                ) : (
                  <Link
                    key={item.name}
                    to={item.href}
                    className="flex items-center space-x-1 text-gray-600 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                  >
                    <item.icon className="h-4 w-4" />
                    <span>{item.name}</span>
                  </Link>
                )
              ))}
            </nav>

            {/* User Menu / Auth */}
            <div className="hidden md:flex items-center space-x-4">
              {user ? (
                <div className="flex items-center space-x-4">
                  {/* Plan Status for Corretoria users */}
                  {user.userType === 'corretoria' && (
                    <div className="mr-2">
                      <PlanStatus compact={true} showDetails={false} className="" />
                    </div>
                  )}
                  
                  {/* Botão de Upgrade para corretores que não têm o plano mais caro */}
                  {user.userType === 'corretoria' && isNotMostExpensivePlan() && (
                    <button
                      onClick={handleUpgradeClick}
                      className="flex items-center space-x-1 bg-gradient-to-r from-green-500 to-green-600 text-white px-3 py-2 rounded-md text-sm font-medium hover:from-green-600 hover:to-green-700 transition-all duration-200 shadow-sm"
                    >
                      <TrendingUp className="h-4 w-4" />
                      <span>Fazer Upgrade</span>
                    </button>
                  )}
                  
                  <div className="flex items-center space-x-2">
                    <div className="h-8 w-8 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                      <User className="h-4 w-4 text-white" />
                    </div>
                    <span className="text-sm font-medium text-gray-700">
                      {user.name}
                    </span>
                  </div>
                  {user.userType === 'admin' && (
                    <Link
                      to="/admin"
                      className="flex items-center space-x-1 text-gray-600 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                    >
                      <Settings className="h-4 w-4" />
                      <span>Dashboard Admin</span>
                    </Link>
                  )}
                  {user.userType === 'corretoria' && (
                    <Link
                      to="/corretor"
                      className="flex items-center space-x-1 text-gray-600 hover:text-green-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                    >
                      <Settings className="h-4 w-4" />
                      <span>Dashboard Corretor</span>
                    </Link>
                  )}
                  <button
                    onClick={logout}
                    className="flex items-center space-x-1 text-gray-600 hover:text-red-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Sair</span>
                  </button>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <a
                    href="#login"
                    onClick={openLoginModal}
                    className="text-gray-600 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                  >
                    Entrar
                  </a>
                </div>
              )}

            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="bg-gray-50 p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {isMenuOpen ? (
                  <X className="h-6 w-6" />
                ) : (
                  <Menu className="h-6 w-6" />
                )}
              </button>
            </div>
          </div>

          {/* Mobile menu */}
          {isMenuOpen && (
            <div className="md:hidden">
              <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 border-t">
                {navigation.map((item) => (
                  item.isAction ? (
                    <button
                      key={item.name}
                      onClick={() => {
                        handleNavigationClick(item);
                        setIsMenuOpen(false);
                      }}
                      className="flex items-center space-x-2 text-gray-600 hover:text-blue-600 w-full text-left px-3 py-2 rounded-md text-base font-medium transition-colors"
                    >
                      <item.icon className="h-4 w-4" />
                      <span>{item.name}</span>
                    </button>
                  ) : item.href.startsWith('#') ? (
                    <a
                      key={item.name}
                      href={item.href}
                      className="flex items-center space-x-2 text-gray-600 hover:text-blue-600 block px-3 py-2 rounded-md text-base font-medium transition-colors"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <item.icon className="h-4 w-4" />
                      <span>{item.name}</span>
                    </a>
                  ) : (
                    <Link
                      key={item.name}
                      to={item.href}
                      className="flex items-center space-x-2 text-gray-600 hover:text-blue-600 block px-3 py-2 rounded-md text-base font-medium transition-colors"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <item.icon className="h-4 w-4" />
                      <span>{item.name}</span>
                    </Link>
                  )
                ))}
                
                {user ? (
                  <div className="border-t pt-4 mt-4">
                    <div className="flex items-center space-x-2 px-3 py-2">
                      <div className="h-8 w-8 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                        <User className="h-4 w-4 text-white" />
                      </div>
                      <span className="text-sm font-medium text-gray-700">
                        {user.name}
                      </span>
                    </div>
                    
                    {/* Botão de Upgrade Mobile para corretores */}
                    {user.userType === 'corretoria' && isNotMostExpensivePlan() && (
                      <button
                        onClick={() => {
                          handleUpgradeClick();
                          setIsMenuOpen(false);
                        }}
                        className="flex items-center space-x-2 bg-gradient-to-r from-green-500 to-green-600 text-white px-3 py-2 rounded-md text-base font-medium w-full mx-3 mb-2"
                      >
                        <TrendingUp className="h-4 w-4" />
                        <span>Fazer Upgrade</span>
                      </button>
                    )}
                    {user.userType === 'admin' && (
                      <Link
                        to="/admin"
                        className="flex items-center space-x-2 text-gray-600 hover:text-blue-600 block px-3 py-2 rounded-md text-base font-medium transition-colors"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <Settings className="h-4 w-4" />
                        <span>Dashboard Admin</span>
                      </Link>
                    )}
                    {user.userType === 'corretoria' && (
                      <Link
                        to="/corretor"
                        className="flex items-center space-x-2 text-gray-600 hover:text-green-600 block px-3 py-2 rounded-md text-base font-medium transition-colors"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <Settings className="h-4 w-4" />
                        <span>Dashboard Corretor</span>
                      </Link>
                    )}
                    <button
                      onClick={() => {
                        logout();
                        setIsMenuOpen(false);
                      }}
                      className="flex items-center space-x-2 text-red-600 block px-3 py-2 rounded-md text-base font-medium w-full text-left"
                    >
                      <LogOut className="h-4 w-4" />
                      <span>Sair</span>
                    </button>
                  </div>
                ) : (
                  <div className="border-t pt-4 mt-4 space-y-1">
                    <a
                      href="#login"
                      className="text-gray-600 hover:text-blue-600 block px-3 py-2 rounded-md text-base font-medium"
                      onClick={(e) => {
                        setIsMenuOpen(false);
                        openLoginModal(e);
                      }}
                    >
                      Entrar
                    </a>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Login Modal */}
      {isLoginModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="animate-fadeIn">
            <div className="relative">
              <button
                onClick={() => setIsLoginModalOpen(false)}
                className="absolute right-4 top-4 text-gray-500 hover:text-gray-700 focus:outline-none"
              >
                <X className="h-6 w-6" />
              </button>
              <LoginForm onClose={() => setIsLoginModalOpen(false)} />
            </div>
          </div>
        </div>
      )}

      <style jsx="true">{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
    </>
  );
};

export default Header;