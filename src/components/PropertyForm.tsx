import React, { useState, useRef, useCallback } from 'react';
import { Save, Upload, X, Camera, Trash2, Image as ImageIcon } from 'lucide-react';
import { Property } from '../types';

interface PropertyFormProps {
  property?: Property;
  onSave: (property: Omit<Property, 'id' | 'createdAt'>) => void;
  onCancel: () => void;
}

const PropertyForm: React.FC<PropertyFormProps> = ({ property, onSave, onCancel }) => {
  const [images, setImages] = useState<{ preview: string, file?: File, url?: string }[]>(
    property?.photos?.map(url => ({ preview: url, url })) || []
  );
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState({
    title: property?.title || '',
    description: property?.description || '',
    availability: property?.availability || 'sale',
    category: property?.category || 'apartment',
    photos: property?.photos || [],
    videoLink: property?.videoLink || '',
    bedrooms: property?.bedrooms || 1,
    bathrooms: property?.bathrooms || 1,
    livingRooms: property?.livingRooms || 1,
    solarPosition: property?.solarPosition || 'morning',
    totalArea: property?.totalArea || 0,
    usefulArea: property?.usefulArea || 0,
    price: property?.price || 0,
    condominiumPrice: property?.condominiumPrice || 0,
    address: property?.address || {
      cep: '',
      street: '',
      number: '',
      complement: '',
      neighborhood: '',
      city: '',
      state: '',
    },
    addressVisibility: property?.addressVisibility || 'street_neighborhood',
    condominiumFeatures: property?.condominiumFeatures || [],
    generalFeatures: property?.generalFeatures || [],
    proximityFeatures: property?.proximityFeatures || [],
    internalNotes: property?.internalNotes || '',
    tags: property?.tags || [],
    ownerId: property?.ownerId || '1',
    isActive: property?.isActive ?? true,
    isFeatured: property?.isFeatured ?? false,
  });

  const condominiumFeatureOptions = [
    'Academia externa', 'Acessibilidade', 'Condomínio fechado', 'Coworking',
    'Espaço beauty', 'Espaço zen', 'Infraestrutura para automação', 'Ofurô',
    'Pet care', 'Ponto para carro elétrico', 'Porteiro eletrônico', 'Quadra tênis',
    'Terraço', 'Terraço coletivo', 'Tomada carro elétrico'
  ];

  const generalFeatureOptions = [
    'Academia', 'Alarme', 'Ar-condicionado (central ou não)', 'Auditório', 'Bar', 'Bicicletário',
    'Brinquedoteca', 'Business place', 'Churrasqueira (comum e condominial)', 'Cinema', 'Copa',
    'Deck molhado', 'Elevador de serviço', 'Elevador social', 'Espaço gourmet',
    'Fire place', 'Fitness (interno ou ao ar livre)', 'Gerador',
    'Hall de entrada com pé direito duplo', 'Horta coletiva', 'Jardim', 'Lareira',
    'Lavanderia', 'Lounge', 'Mobiliado', 'Pet place', 'Piscinas (diversos tipos)',
    'Piso elevado', 'Playground', 'Portaria (normal e 24h)', 'Porte cochère',
    'Salas diversas (jogos, reuniões, segurança)', 'Salão de festas', 'Sauna', 'Solarium', 'Spa',
    'Varanda', 'Vestiários'
  ];

  const proximityFeatureOptions = [
    'Creche', 'Escola', 'Farmácia', 'Hospital', 'Mercado', 'Posto de gasolina', 'Praça'
  ];

  const tagOptions = ['Permuta', 'Financiamento', 'Proposta', 'Exclusividade'];

  // Image handling functions
  const handleImageUpload = useCallback((files: FileList) => {
    const validFiles = Array.from(files).filter(file => {
      const isValidType = file.type.startsWith('image/');
      const isValidSize = file.size <= 5 * 1024 * 1024; // 5MB
      return isValidType && isValidSize;
    });

    const newImages = validFiles.map(file => ({
      preview: URL.createObjectURL(file),
      file
    }));

    setImages(prev => [...prev, ...newImages]);
  }, []);

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleImageUpload(e.target.files);
    }
  };

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    if (e.dataTransfer.files) {
      handleImageUpload(e.dataTransfer.files);
    }
  }, [handleImageUpload]);

  const removeImage = (index: number) => {
    setImages(prev => {
      const newImages = [...prev];
      if (newImages[index].preview && !newImages[index].url) {
        URL.revokeObjectURL(newImages[index].preview);
      }
      newImages.splice(index, 1);
      return newImages;
    });
  };

  const moveImage = (fromIndex: number, toIndex: number) => {
    setImages(prev => {
      const newImages = [...prev];
      const [movedImage] = newImages.splice(fromIndex, 1);
      newImages.splice(toIndex, 0, movedImage);
      return newImages;
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const updatedFormData = {
      ...formData,
      photos: images.map(img => img.url || img.preview)
    };
    onSave(updatedFormData);
  };

  const handleFeatureToggle = (feature: string, type: 'condominium' | 'general' | 'proximity' | 'tags') => {
    const key = type === 'condominium' ? 'condominiumFeatures' : 
                type === 'general' ? 'generalFeatures' :
                type === 'proximity' ? 'proximityFeatures' : 'tags';
    
    setFormData(prev => ({
      ...prev,
      [key]: prev[key].includes(feature)
        ? prev[key].filter(f => f !== feature)
        : [...prev[key], feature]
    }));
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">
          {property ? 'Editar Imóvel' : 'Cadastrar Novo Imóvel'}
        </h2>
        <button
          onClick={onCancel}
          className="text-gray-500 hover:text-gray-700"
        >
          <X className="h-6 w-6" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Título *
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Descrição *
            </label>
            <textarea
              required
              rows={4}
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Disponibilidade *
            </label>
            <select
              required
              value={formData.availability}
              onChange={(e) => setFormData(prev => ({ ...prev, availability: e.target.value as any }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="sale">Venda</option>
              <option value="rent">Locação</option>
              <option value="temporada">Temporada</option>
              <option value="both">Ambos</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Categoria *
            </label>
            <select
              required
              value={formData.category}
              onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value as any }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="apartment">Apartamento</option>
              <option value="house">Casa</option>
              <option value="chacara">Chácara</option>
              <option value="terrain">Terreno</option>
              <option value="salon">Salão</option>
              <option value="sobrado">Sobrado</option>
            </select>
          </div>
        </div>

        {/* Property Details */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Dormitórios</label>
            <input
              type="number"
              min="0"
              value={formData.bedrooms}
              onChange={(e) => setFormData(prev => ({ ...prev, bedrooms: parseInt(e.target.value) }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Banheiros</label>
            <input
              type="number"
              min="0"
              value={formData.bathrooms}
              onChange={(e) => setFormData(prev => ({ ...prev, bathrooms: parseInt(e.target.value) }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Salas</label>
            <input
              type="number"
              min="0"
              value={formData.livingRooms}
              onChange={(e) => setFormData(prev => ({ ...prev, livingRooms: parseInt(e.target.value) }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Posição Solar</label>
            <select
              value={formData.solarPosition}
              onChange={(e) => setFormData(prev => ({ ...prev, solarPosition: e.target.value as any }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="morning">Sol da manhã</option>
              <option value="afternoon">Sol da tarde</option>
            </select>
          </div>
        </div>

        {/* Areas and Price */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Área Total (m²)</label>
            <input
              type="number"
              min="0"
              value={formData.totalArea}
              onChange={(e) => setFormData(prev => ({ ...prev, totalArea: parseFloat(e.target.value) }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Área Útil (m²)</label>
            <input
              type="number"
              min="0"
              value={formData.usefulArea}
              onChange={(e) => setFormData(prev => ({ ...prev, usefulArea: parseFloat(e.target.value) }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Valor (R$) *</label>
            <input
              type="number"
              required
              min="0"
              value={formData.price}
              onChange={(e) => setFormData(prev => ({ ...prev, price: parseFloat(e.target.value) }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Valor do Condomínio (R$)</label>
            <input
              type="number"
              min="0"
              value={formData.condominiumPrice}
              onChange={(e) => setFormData(prev => ({ ...prev, condominiumPrice: parseFloat(e.target.value) }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Address */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">Endereço</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">CEP</label>
              <input
                type="text"
                value={formData.address.cep}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  address: { ...prev.address, cep: e.target.value }
                }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Rua</label>
              <input
                type="text"
                value={formData.address.street}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  address: { ...prev.address, street: e.target.value }
                }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Número</label>
              <input
                type="text"
                value={formData.address.number}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  address: { ...prev.address, number: e.target.value }
                }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Complemento</label>
              <input
                type="text"
                value={formData.address.complement}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  address: { ...prev.address, complement: e.target.value }
                }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Bairro</label>
              <input
                type="text"
                value={formData.address.neighborhood}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  address: { ...prev.address, neighborhood: e.target.value }
                }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Cidade</label>
              <input
                type="text"
                value={formData.address.city}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  address: { ...prev.address, city: e.target.value }
                }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
              <input
                type="text"
                value={formData.address.state}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  address: { ...prev.address, state: e.target.value }
                }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Visibilidade do Endereço</label>
              <select
                value={formData.addressVisibility}
                onChange={(e) => setFormData(prev => ({ ...prev, addressVisibility: e.target.value as any }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="street_neighborhood">Mostrar: Rua e Bairro</option>
                <option value="full_address">Mostrar: Rua e Número (completo)</option>
                <option value="hidden">Não mostrar endereço</option>
              </select>
            </div>
          </div>
        </div>

        {/* Photos Upload Section */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <Camera className="h-5 w-5 mr-2 text-blue-600" />
            Fotos do Imóvel
          </h3>
          
          {/* Upload Area */}
          <div
            className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300 cursor-pointer group ${
              isDragOver 
                ? 'border-blue-500 bg-gradient-to-br from-blue-50 to-indigo-50 shadow-lg scale-[1.02]' 
                : 'border-gray-300 hover:border-blue-400 hover:bg-gradient-to-br hover:from-gray-50 hover:to-blue-50 hover:shadow-md'
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*"
              onChange={handleFileInputChange}
              className="hidden"
            />
            
            <div className="flex flex-col items-center space-y-4">
              <div className={`p-4 rounded-full transition-all duration-300 ${
                isDragOver 
                  ? 'bg-gradient-to-br from-blue-100 to-indigo-100 shadow-lg scale-110' 
                  : 'bg-gradient-to-br from-gray-100 to-gray-200 group-hover:from-blue-100 group-hover:to-indigo-100 group-hover:shadow-md group-hover:scale-105'
              }`}>
                <Upload className={`h-10 w-10 transition-all duration-300 ${
                  isDragOver 
                    ? 'text-blue-600 animate-bounce' 
                    : 'text-gray-400 group-hover:text-blue-500'
                }`} />
              </div>
              
              <div className="space-y-2">
                <p className={`text-xl font-semibold transition-colors duration-300 ${
                  isDragOver ? 'text-blue-700' : 'text-gray-900 group-hover:text-blue-600'
                }`}>
                  {isDragOver ? '✨ Solte as imagens aqui!' : '📸 Adicione suas fotos'}
                </p>
                <p className="text-sm text-gray-500">
                  Arraste e solte ou clique para selecionar
                </p>
                <p className="text-xs text-gray-400">
                  Suporte: JPG, PNG, WEBP • Máx: 5MB por imagem
                </p>
              </div>
              
              <button
                type="button"
                className={`inline-flex items-center px-6 py-3 border border-transparent text-sm font-semibold rounded-lg transition-all duration-300 transform ${
                  isDragOver
                    ? 'text-white bg-gradient-to-r from-blue-600 to-indigo-600 shadow-lg scale-105'
                    : 'text-white bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 hover:shadow-lg hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
                }`}
                onClick={(e) => {
                  e.stopPropagation();
                  fileInputRef.current?.click();
                }}
              >
                <ImageIcon className="h-5 w-5 mr-2" />
                <span>Escolher Arquivos</span>
                <svg className="h-4 w-4 ml-2 transition-transform duration-300 group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </button>
              
              {/* Decorative elements */}
              <div className="absolute top-4 right-4 opacity-20 group-hover:opacity-40 transition-opacity duration-300">
                <svg className="h-6 w-6 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                </svg>
              </div>
              
              <div className="absolute bottom-4 left-4 opacity-20 group-hover:opacity-40 transition-opacity duration-300">
                <svg className="h-5 w-5 text-indigo-400" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M5.5 13a3.5 3.5 0 01-.369-6.98 4 4 0 117.753-1.977A4.5 4.5 0 1113.5 13H11V9.413l1.293 1.293a1 1 0 001.414-1.414l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.413V13H5.5z" />
                </svg>
              </div>
            </div>
          </div>
          
          {/* Image Preview Grid */}
          {images.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-gray-700">
                  {images.length} imagem{images.length !== 1 ? 's' : ''} selecionada{images.length !== 1 ? 's' : ''}
                </p>
                <p className="text-xs text-gray-500">
                  A primeira imagem será a foto de capa
                </p>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {images.map((image, index) => (
                  <div key={index} className="relative group">
                    <div className="aspect-square rounded-lg overflow-hidden bg-gray-100">
                      <img
                        src={image.preview}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    
                    {/* Image Controls */}
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all duration-200 rounded-lg flex items-center justify-center">
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex space-x-2">
                        {index > 0 && (
                          <button
                            type="button"
                            onClick={() => moveImage(index, index - 1)}
                            className="p-1.5 bg-white rounded-full shadow-md hover:bg-gray-50 transition-colors"
                            title="Mover para esquerda"
                          >
                            <svg className="h-4 w-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                          </button>
                        )}
                        
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="p-1.5 bg-red-500 text-white rounded-full shadow-md hover:bg-red-600 transition-colors"
                          title="Remover imagem"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                        
                        {index < images.length - 1 && (
                          <button
                            type="button"
                            onClick={() => moveImage(index, index + 1)}
                            className="p-1.5 bg-white rounded-full shadow-md hover:bg-gray-50 transition-colors"
                            title="Mover para direita"
                          >
                            <svg className="h-4 w-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                          </button>
                        )}
                      </div>
                    </div>
                    
                    {/* Cover Badge */}
                    {index === 0 && (
                      <div className="absolute top-2 left-2 bg-blue-600 text-white text-xs px-2 py-1 rounded-full font-medium">
                        Capa
                      </div>
                    )}
                    
                    {/* Image Number */}
                    <div className="absolute bottom-2 right-2 bg-black bg-opacity-60 text-white text-xs px-2 py-1 rounded-full">
                      {index + 1}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Features */}
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Características do Condomínio</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
              {condominiumFeatureOptions.map(feature => (
                <label key={feature} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={formData.condominiumFeatures.includes(feature)}
                    onChange={() => handleFeatureToggle(feature, 'condominium')}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">{feature}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Características Gerais</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
              {generalFeatureOptions.map(feature => (
                <label key={feature} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={formData.generalFeatures.includes(feature)}
                    onChange={() => handleFeatureToggle(feature, 'general')}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">{feature}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Proximidade</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
              {proximityFeatureOptions.map(feature => (
                <label key={feature} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={formData.proximityFeatures.includes(feature)}
                    onChange={() => handleFeatureToggle(feature, 'proximity')}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">{feature}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Tags</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {tagOptions.map(tag => (
                <label key={tag} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={formData.tags.includes(tag)}
                    onChange={() => handleFeatureToggle(tag, 'tags')}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">{tag}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Internal Notes */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Outras Informações (uso interno)
          </label>
          <textarea
            rows={3}
            value={formData.internalNotes}
            onChange={(e) => setFormData(prev => ({ ...prev, internalNotes: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Informações para uso interno (não exibido no site)"
          />
        </div>

        {/* Actions */}
        <div className="flex justify-end space-x-4 pt-6 border-t">
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="flex items-center space-x-2 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
          >
            <Save className="h-4 w-4" />
            <span>{property ? 'Atualizar' : 'Salvar'} Imóvel</span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default PropertyForm;