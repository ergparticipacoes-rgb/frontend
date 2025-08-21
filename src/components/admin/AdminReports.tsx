import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { Calendar, Download, Filter, TrendingUp } from 'lucide-react';
import { useAdminUsers } from '../../hooks/useAdminUsers';
import { useAdminProperties } from '../../hooks/useAdminProperties';
import { useAdminNews } from '../../hooks/useAdminNews';

const AdminReports: React.FC = () => {
  const [dateRange, setDateRange] = useState('30');
  const [reportType, setReportType] = useState('overview');
  
  const { users } = useAdminUsers();
  const { properties } = useAdminProperties();
  const { news } = useAdminNews();

  // Dados para gráfico de usuários por tipo
  const userTypeData = [
    {
      name: 'Particulares',
      value: users.filter(user => user.userType === 'particular').length,
      color: '#3B82F6'
    },
    {
      name: 'Corretores',
      value: users.filter(user => user.userType === 'corretoria').length,
      color: '#10B981'
    }
  ];

  // Dados para gráfico de propriedades por categoria
  const propertyTypeData = [
    {
      name: 'Apartamentos',
      value: properties.filter(prop => prop.category === 'apartment').length,
      color: '#8B5CF6'
    },
    {
      name: 'Casas',
      value: properties.filter(prop => prop.category === 'house').length,
      color: '#F59E0B'
    },
    {
      name: 'Comercial',
      value: properties.filter(prop => prop.category === 'commercial').length,
      color: '#EF4444'
    },
    {
      name: 'Terrenos',
      value: properties.filter(prop => prop.category === 'land').length,
      color: '#06B6D4'
    }
  ];

  // Dados para gráfico de propriedades por disponibilidade
  const availabilityData = [
    {
      name: 'Venda',
      Propriedades: properties.filter(prop => prop.availability === 'sale').length
    },
    {
      name: 'Aluguel',
      Propriedades: properties.filter(prop => prop.availability === 'rent').length
    },
    {
      name: 'Ambos',
      Propriedades: properties.filter(prop => prop.availability === 'both').length
    }
  ];

  // TODO: Implementar dados reais de atividade mensal
  const monthlyActivityData = [
    { month: 'Jul', usuarios: users.length, imoveis: properties.length, noticias: news.length }
  ];

  const COLORS = ['#3B82F6', '#10B981', '#8B5CF6', '#F59E0B', '#EF4444', '#06B6D4'];

  const exportReport = () => {
    // Implementação futura: exportar relatório
    console.log('Exportando relatório...');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Relatórios e Análises</h1>
        <div className="flex space-x-3">
          <select
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
          >
            <option value="7">Últimos 7 dias</option>
            <option value="30">Últimos 30 dias</option>
            <option value="90">Últimos 90 dias</option>
            <option value="365">Último ano</option>
          </select>
          <button
            onClick={exportReport}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
          >
            <Download className="w-4 h-4 mr-2" />
            Exportar
          </button>
        </div>
      </div>

      {/* Estatísticas Resumidas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total de Usuários</p>
              <p className="text-2xl font-bold text-gray-900">{users.length}</p>
            </div>
            <TrendingUp className="w-8 h-8 text-blue-500" />
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total de Imóveis</p>
              <p className="text-2xl font-bold text-gray-900">{properties.length}</p>
            </div>
            <TrendingUp className="w-8 h-8 text-green-500" />
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Notícias Ativas</p>
              <p className="text-2xl font-bold text-gray-900">{news.filter(n => n.isActive).length}</p>
            </div>
            <TrendingUp className="w-8 h-8 text-purple-500" />
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Imóveis em Destaque</p>
              <p className="text-2xl font-bold text-gray-900">{properties.filter(p => p.isFeatured).length}</p>
            </div>
            <TrendingUp className="w-8 h-8 text-yellow-500" />
          </div>
        </div>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gráfico de Usuários por Tipo */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Usuários por Tipo</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={userTypeData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {userTypeData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Gráfico de Propriedades por Categoria */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Propriedades por Categoria</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={propertyTypeData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {propertyTypeData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Gráfico de Disponibilidade */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Propriedades por Disponibilidade</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={availabilityData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="Propriedades" fill="#3B82F6" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Gráfico de Atividade Mensal */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Atividade Mensal</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={monthlyActivityData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="usuarios" stroke="#3B82F6" strokeWidth={2} />
              <Line type="monotone" dataKey="imoveis" stroke="#10B981" strokeWidth={2} />
              <Line type="monotone" dataKey="noticias" stroke="#8B5CF6" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Tabela de Resumo */}
      <div className="bg-white rounded-lg shadow-md">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Resumo Detalhado</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Métrica
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ativos
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Pendentes
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  Usuários
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {users.length}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {users.filter(u => u.isApproved).length}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {users.filter(u => !u.isApproved).length}
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  Propriedades
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {properties.length}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {properties.filter(p => p.isActive).length}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {properties.filter(p => !p.isActive).length}
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  Notícias
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {news.length}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {news.filter(n => n.isActive).length}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {news.filter(n => !n.isActive).length}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminReports;