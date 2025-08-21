import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { WebSocketProvider } from './contexts/WebSocketContext';
import { Toaster } from 'react-hot-toast';
import Header from './components/Header';
import HeroBanner from './components/HeroBanner';
import FeaturedProperties from './components/FeaturedProperties';
import RegistrationSections from './components/RegistrationSections';
import NewsSection from './components/NewsSection';
import Footer from './components/Footer';
import ProfessionalRegister from './components/ProfessionalRegister';
import ParticularRegister from './components/ParticularRegister';
import AdminDashboard from './components/admin/AdminDashboard';
import ProfessionalDashboard from './components/professional/ProfessionalDashboard';
import ProtectedRoute from './components/ProtectedRoute';
import PropertiesPage from './pages/PropertiesPage';
import NewsPage from './pages/NewsPage';
import NewsDetailPage from './pages/NewsDetailPage';
import PropertyViewPage from './pages/PropertyViewPage';
import PlanSelection from './pages/PlanSelection';

function App() {
  return (
    <Router>
      <AuthProvider>
        <WebSocketProvider>
          <div className="min-h-screen flex flex-col">
            <Toaster position="top-right" />
            <Header />
            <main className="flex-grow">
              <Routes>
              <Route path="/" element={
                <>
                  <HeroBanner />
                  <FeaturedProperties />
                  <RegistrationSections />
                  <NewsSection />
                </>
              } />
              <Route path="/cadastro-profissional" element={<ProfessionalRegister />} />
              <Route path="/cadastro-particular" element={<ParticularRegister />} />
              
              {/* Dashboard routes */}
              <Route path="/admin/*" element={
                <ProtectedRoute userType="admin">
                  <AdminDashboard />
                </ProtectedRoute>
              } />
              <Route path="/corretor/*" element={
                <ProtectedRoute userType="corretoria">
                  <ProfessionalDashboard />
                </ProtectedRoute>
              } />
              
              {/* Properties listing */}
              <Route path="/properties" element={
                <PropertiesPage />
              } />
              
              {/* News page */}
              <Route path="/news" element={
                <NewsPage />
              } />
              
              {/* News detail page */}
              <Route path="/news/:id" element={
                <NewsDetailPage />
              } />

              {/* Property detail page */}
              <Route path="/property/:identifier" element={
                <PropertyViewPage />
              } />

              {/* Plan selection page */}
              <Route path="/plans" element={
                <ProtectedRoute userType="corretoria">
                  <PlanSelection />
                </ProtectedRoute>
              } />
            </Routes>
          </main>
          <Footer />
        </div>
        </WebSocketProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;