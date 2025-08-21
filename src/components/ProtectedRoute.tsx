import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  userType: 'admin' | 'corretoria' | 'particular';
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, userType }) => {
  const { user, isLoading } = useAuth();
  
  // Se estiver carregando, mostrar um indicador de carregamento
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  // Se não estiver autenticado, redirecionar para a página inicial
  if (!user) {
    return <Navigate to="/" replace />;
  }
  
  // Se o tipo de usuário não corresponder ao necessário, redirecionar
  if (userType && user.userType !== userType) {
    // Redirecionar o usuário para sua página correspondente
    if (user.userType === 'admin') {
      return <Navigate to="/admin" replace />;
    } else if (user.userType === 'corretoria') {
      return <Navigate to="/corretor" replace />;
    } else {
      return <Navigate to="/" replace />;
    }
  }
  
  // Se o usuário tiver acesso, renderizar o componente filho
  return <>{children}</>;
};

export default ProtectedRoute;