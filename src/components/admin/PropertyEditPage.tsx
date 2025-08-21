import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { API_CONFIG } from '../../config/api';
import toast from 'react-hot-toast';
import { Save, ArrowLeft, Home, MapPin, DollarSign, Info } from 'lucide-react';

const PropertyEditPage: React.FC = () => {
  const { id: reference } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [propertyId, setPropertyId] = useState<string>('');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'apartment',
    availability: 'sale',
    price: 0,
    rentPrice: 0,
    condominiumFee: 0,
    iptu: 0,
    totalArea: 0,
    usableArea: 0,
    bedrooms: 0,
    bathrooms: 0,
    parkingSpaces: 0,
    suites: 0,
    livingRooms: 0,
    floor: 0,
    solarPosition: '',
    exclusivity: false,
    acceptsExchange: false,
    acceptsFinancing: false,
    acceptsProposal: false,
    address: {
      street: '',
      number: '',
      complement: '',
      neighborhood: '',
      city: '',
      state: '',
      zipCode: ''
    },
    features: {
      condominium: [] as string[],
      general: [] as string[],
      proximity: [] as string[]
    },
    photos: [] as string[],
    videoLink: '',
    isActive: true,
    isFeatured: false
  });

  useEffect(() => {
    fetchProperty();
  }, [reference]);

  const fetchProperty = async () => {
    try {
      const userStr = localStorage.getItem('user');
      const user = userStr ? JSON.parse(userStr) : null;
      const token = user?.token;

      if (!token) {
        toast.error('Você precisa estar logado');
        navigate('/admin/propriedades');
        return;
      }

      const response = await fetch(`${API_CONFIG.BASE_URL}/properties?limit=1000`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        const properties = data.properties || data;
        const foundProperty = properties.find((p: any) => p.reference === reference);
        
        if (foundProperty) {
          setPropertyId(foundProperty._id);
          setFormData({
            title: foundProperty.title || '',
            description: foundProperty.description || '',
            category: foundProperty.category || 'apartment',
            availability: foundProperty.availability || 'sale',
            price: foundProperty.price || 0,
            rentPrice: foundProperty.rentPrice || 0,
            condominiumFee: foundProperty.condominiumPrice || foundProperty.condominiumFee || 0,
            iptu: foundProperty.iptu || 0,
            totalArea: foundProperty.totalArea || 0,
            usableArea: foundProperty.usefulArea || foundProperty.usableArea || 0,
            bedrooms: foundProperty.bedrooms || 0,
            bathrooms: foundProperty.bathrooms || 0,
            parkingSpaces: foundProperty.parkingSpaces || 0,
            suites: foundProperty.suites || 0,
            livingRooms: foundProperty.livingRooms || 0,
            floor: foundProperty.floor || 0,
            solarPosition: foundProperty.solarPosition || '',
            exclusivity: foundProperty.exclusivity || false,
            acceptsExchange: foundProperty.acceptsExchange || false,
            acceptsFinancing: foundProperty.acceptsFinancing || false,
            acceptsProposal: foundProperty.acceptsProposal || false,
            address: {
              street: foundProperty.address?.street || '',
              number: foundProperty.address?.number || '',
              complement: foundProperty.address?.complement || '',
              neighborhood: foundProperty.address?.neighborhood || '',
              city: foundProperty.address?.city || '',
              state: foundProperty.address?.state || '',
              zipCode: foundProperty.address?.cep || foundProperty.address?.zipCode || ''  // Aceitar tanto cep quanto zipCode
            },
            features: {
              condominium: foundProperty.condominiumFeatures || foundProperty.features?.condominium || [],
              general: foundProperty.generalFeatures || foundProperty.features?.general || [],
              proximity: foundProperty.proximityFeatures || foundProperty.features?.proximity || []
            },
            photos: foundProperty.photos || [],
            videoLink: foundProperty.videoLink || '',
            isActive: foundProperty.isActive !== undefined ? foundProperty.isActive : true,
            isFeatured: foundProperty.isFeatured || false
          });
        } else {
          toast.error('Propriedade não encontrada');
          navigate('/admin/propriedades');
        }
      } else {
        toast.error('Erro ao carregar propriedade');
        navigate('/admin/propriedades');
      }
    } catch (error) {
      console.error('Erro ao buscar propriedade:', error);
      toast.error('Erro ao carregar propriedade');
      navigate('/admin/propriedades');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    
    try {
      const userStr = localStorage.getItem('user');
      const user = userStr ? JSON.parse(userStr) : null;
      const token = user?.token;

      if (!token) {
        toast.error('Você precisa estar logado');
        return;
      }

      // Mapear os dados para o formato esperado pelo backend
      const dataToSend = {
        title: formData.title,
        description: formData.description,
        category: formData.category,
        availability: formData.availability,
        price: formData.price,
        rentPrice: formData.rentPrice,
        condominiumPrice: formData.condominiumFee,
        iptu: formData.iptu,
        totalArea: formData.totalArea,
        usefulArea: formData.usableArea,
        bedrooms: formData.bedrooms,
        bathrooms: formData.bathrooms,
        livingRooms: formData.livingRooms,
        parkingSpaces: formData.parkingSpaces,
        suites: formData.suites,
        floor: formData.floor,
        solarPosition: formData.solarPosition || undefined,
        exclusivity: formData.exclusivity,
        acceptsExchange: formData.acceptsExchange,
        acceptsFinancing: formData.acceptsFinancing,
        acceptsProposal: formData.acceptsProposal,
        address: {
          cep: formData.address.zipCode,  // Mapear zipCode para cep
          street: formData.address.street,
          number: formData.address.number,
          complement: formData.address.complement,
          neighborhood: formData.address.neighborhood,
          city: formData.address.city,
          state: formData.address.state
        },
        condominiumFeatures: formData.features.condominium,
        generalFeatures: formData.features.general,
        proximityFeatures: formData.features.proximity,
        photos: formData.photos.length > 0 ? formData.photos : ['https://images.pexels.com/photos/1396132/pexels-photo-1396132.jpeg'],  // Adicionar foto padrão se não houver fotos
        videoLink: formData.videoLink || undefined,
        isActive: formData.isActive,
        isFeatured: formData.isFeatured
      };

      // Remover campos vazios ou undefined
      if (!dataToSend.solarPosition) delete dataToSend.solarPosition;
      if (!dataToSend.videoLink) delete dataToSend.videoLink;

      const response = await fetch(`${API_CONFIG.BASE_URL}/properties/${propertyId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(dataToSend)
      });

      if (response.ok) {
        toast.success('Imóvel atualizado com sucesso!');
        navigate('/admin/propriedades');
      } else {
        const error = await response.json();
        toast.error(error.error || 'Erro ao atualizar imóvel');
      }
    } catch (error) {
      console.error('Erro ao salvar propriedade:', error);
      toast.error('Erro ao atualizar imóvel');
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...(prev as any)[parent],
          [child]: value
        }
      }));
    } else {
      if (type === 'checkbox') {
        const checked = (e.target as HTMLInputElement).checked;
        setFormData(prev => ({
          ...prev,
          [name]: checked
        }));
      } else if (type === 'number') {
        setFormData(prev => ({
          ...prev,
          [name]: parseFloat(value) || 0
        }));
      } else {
        setFormData(prev => ({
          ...prev,
          [name]: value
        }));
      }
    }
  };

  const handleFeatureToggle = (category: 'condominium' | 'general' | 'proximity', feature: string) => {
    setFormData(prev => {
      const features = prev.features[category];
      const newFeatures = features.includes(feature)
        ? features.filter(f => f !== feature)
        : [...features, feature];
      
      return {
        ...prev,
        features: {
          ...prev.features,
          [category]: newFeatures
        }
      };
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const condominiumFeatures = ['Piscina', 'Academia', 'Playground', 'Salão de Festas', 'Churrasqueira'];
  const generalFeatures = ['Mobiliado', 'Ar Condicionado', 'Armários Embutidos', 'Varanda', 'Lavanderia'];
  const proximityFeatures = ['Metrô', 'Shopping', 'Supermercado', 'Escola', 'Hospital'];

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Editar Imóvel</h1>
        <button
          onClick={() => navigate('/admin/propriedades')}
          className="flex items-center px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Informações Básicas */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center">
            <Home className="w-5 h-5 mr-2" />
            Informações Básicas
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Título do Anúncio
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Categoria
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="apartment">Apartamento</option>
                <option value="house">Casa</option>
                <option value="commercial">Comercial</option>
                <option value="land">Terreno</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Disponibilidade
              </label>
              <select
                name="availability"
                value={formData.availability}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="sale">Venda</option>
                <option value="rent">Aluguel</option>
                <option value="both">Venda e Aluguel</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                name="isActive"
                value={formData.isActive ? 'active' : 'inactive'}
                onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.value === 'active' }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="active">Ativo</option>
                <option value="inactive">Inativo</option>
              </select>
            </div>
          </div>
          
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Descrição
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>
          
          <div className="mt-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                name="isFeatured"
                checked={formData.isFeatured}
                onChange={handleInputChange}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <span className="ml-2 text-sm text-gray-700">Imóvel em destaque</span>
            </label>
          </div>
        </div>

        {/* Valores */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center">
            <DollarSign className="w-5 h-5 mr-2" />
            Valores
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Preço de Venda
              </label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Preço de Aluguel
              </label>
              <input
                type="number"
                name="rentPrice"
                value={formData.rentPrice}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Condomínio
              </label>
              <input
                type="number"
                name="condominiumFee"
                value={formData.condominiumFee}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                IPTU
              </label>
              <input
                type="number"
                name="iptu"
                value={formData.iptu}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Características */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center">
            <Info className="w-5 h-5 mr-2" />
            Características
          </h2>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Quartos
              </label>
              <input
                type="number"
                name="bedrooms"
                value={formData.bedrooms}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Banheiros
              </label>
              <input
                type="number"
                name="bathrooms"
                value={formData.bathrooms}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Vagas
              </label>
              <input
                type="number"
                name="parkingSpaces"
                value={formData.parkingSpaces}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Suítes
              </label>
              <input
                type="number"
                name="suites"
                value={formData.suites}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Área Total (m²)
              </label>
              <input
                type="number"
                name="totalArea"
                value={formData.totalArea}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Área Útil (m²)
              </label>
              <input
                type="number"
                name="usableArea"
                value={formData.usableArea}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Salas
              </label>
              <input
                type="number"
                name="livingRooms"
                value={formData.livingRooms}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
          </div>
        </div>

        {/* Endereço */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center">
            <MapPin className="w-5 h-5 mr-2" />
            Endereço
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                CEP
              </label>
              <input
                type="text"
                name="address.zipCode"
                value={formData.address.zipCode}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Rua
              </label>
              <input
                type="text"
                name="address.street"
                value={formData.address.street}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Número
              </label>
              <input
                type="text"
                name="address.number"
                value={formData.address.number}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Bairro
              </label>
              <input
                type="text"
                name="address.neighborhood"
                value={formData.address.neighborhood}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Cidade
              </label>
              <input
                type="text"
                name="address.city"
                value={formData.address.city}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Estado
              </label>
              <input
                type="text"
                name="address.state"
                value={formData.address.state}
                onChange={handleInputChange}
                maxLength={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Comodidades */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold mb-4">Comodidades</h2>
          
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">Condomínio</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2">
                {condominiumFeatures.map(feature => (
                  <label key={feature} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.features.condominium.includes(feature)}
                      onChange={() => handleFeatureToggle('condominium', feature)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-700">{feature}</span>
                  </label>
                ))}
              </div>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">Geral</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2">
                {generalFeatures.map(feature => (
                  <label key={feature} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.features.general.includes(feature)}
                      onChange={() => handleFeatureToggle('general', feature)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-700">{feature}</span>
                  </label>
                ))}
              </div>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">Proximidade</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2">
                {proximityFeatures.map(feature => (
                  <label key={feature} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.features.proximity.includes(feature)}
                      onChange={() => handleFeatureToggle('proximity', feature)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-700">{feature}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Botões de Ação */}
        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => navigate('/admin/propriedades')}
            className="px-6 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center"
          >
            <Save className="w-4 h-4 mr-2" />
            {saving ? 'Salvando...' : 'Salvar Alterações'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default PropertyEditPage;