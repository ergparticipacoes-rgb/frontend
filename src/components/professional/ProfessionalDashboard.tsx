import React, { useState } from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
  LayoutDashboard,
  Home,
  PlusCircle,
  LogOut,
  ChevronRight,
  Menu,
  X
} from 'lucide-react';
import ProfessionalOverview from './ProfessionalOverview';
import ProfessionalProperties from './ProfessionalProperties';
import ProfessionalAddProperty from './ProfessionalAddProperty';

const ProfessionalDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const menuItems = [
    {
      title: 'Visão Geral',
      path: '/corretor',
      icon: <LayoutDashboard className="w-5 h-5" />
    },
    {
      title: 'Meus Imóveis',
      path: '/corretor/imoveis',
      icon: <Home className="w-5 h-5" />
    },
    {
      title: 'Adicionar Imóvel',
      path: '/corretor/adicionar-imovel',
      icon: <PlusCircle className="w-5 h-5" />
    }
  ];

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Mobile sidebar toggle */}
      <button
        onClick={toggleSidebar}
        className="fixed p-2 bg-green-600 text-white rounded-r-lg top-20 left-0 md:hidden z-50"
      >
        {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {/* Sidebar */}
      <div
        className={`bg-green-700 text-white w-64 min-h-screen fixed md:static z-40 transform transition-transform duration-300 ease-in-out ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div className="p-4">
          <h2 className="text-xl font-semibold mb-1">Dashboard Corretor</h2>
          <p className="text-sm text-green-200 mb-6">
            Bem-vindo, {user?.name || 'Corretor'}
          </p>
        </div>

        <nav className="mt-2">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center px-4 py-3 text-sm ${
                location.pathname === item.path
                  ? 'bg-green-800 text-white'
                  : 'text-green-100 hover:bg-green-600'
              }`}
              onClick={() => {
                if (window.innerWidth < 768) {
                  setSidebarOpen(false);
                }
              }}
            >
              <span className="mr-3">{item.icon}</span>
              <span>{item.title}</span>
              {location.pathname === item.path && (
                <ChevronRight className="w-4 h-4 ml-auto" />
              )}
            </Link>
          ))}

          <button
            onClick={handleLogout}
            className="flex items-center px-4 py-3 text-sm text-green-100 hover:bg-green-600 w-full"
          >
            <LogOut className="w-5 h-5 mr-3" />
            <span>Sair</span>
          </button>
        </nav>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 p-6">
          <Routes>
            <Route path="/" element={<ProfessionalOverview />} />
            <Route path="/imoveis" element={<ProfessionalProperties />} />
            <Route path="/adicionar-imovel" element={<ProfessionalAddProperty />} />
          </Routes>
        </main>
      </div>

      {/* Backdrop for mobile sidebar */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-30 md:hidden z-30"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default ProfessionalDashboard;