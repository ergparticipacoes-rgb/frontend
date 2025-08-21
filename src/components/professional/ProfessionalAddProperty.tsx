import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera, MapPin, Building, Home, Trash2, Plus, AlertTriangle, Video } from 'lucide-react';
import { useProfessionalProperties } from '../../hooks/useProfessionalProperties';
import { usePlanStatus } from '../../hooks/usePlanStatus';
import PlanStatus from '../PlanStatus';
import { useToast } from '../../hooks/useToast';
import ToastContainer from '../ToastContainer';
import { formatYouTubeEmbed, validateVideoUrl } from '../../utils/youtubeUtils';

const ProfessionalAddProperty: React.FC = () => {
  const navigate = useNavigate();
  const { createProperty, loading, error } = useProfessionalProperties();
  const { canPublishProperty, hasActivePlan, getCriticalWarnings } = usePlanStatus();
  const { toasts, success: showSuccess, error: showError, removeToast } = useToast();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'apartment',
    availability: 'sale',
    price: '',
    condominiumPrice: '',
    bedrooms: '',
    bathrooms: '',
    livingRooms: '',
    solarPosition: '',
    totalArea: '',
    usefulArea: '',
    videoLink: '',
    address: {
      cep: '',
      street: '',
      number: '',
      neighborhood: '',
      city: '',
      state: 'SC'
    },
    addressVisibility: 'full_address',
    isFeatured: false,
    isActive: true,
    proximityFeatures: [''],
    condominiumFeatures: [''],
    generalFeatures: ['']
  });
  
  const [images, setImages] = useState<{ preview: string, file?: File }[]>([]);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent as keyof typeof prev],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };
  
  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: checked
    }));
  };
  
  const handleFeatureChange = (index: number, value: string, featureType: 'proximityFeatures' | 'condominiumFeatures' | 'generalFeatures') => {
    const updatedFeatures = [...formData[featureType]];
    updatedFeatures[index] = value;
    
    setFormData(prev => ({
      ...prev,
      [featureType]: updatedFeatures
    }));
  };
  
  const handleAddFeature = (featureType: 'proximityFeatures' | 'condominiumFeatures' | 'generalFeatures') => {
    setFormData(prev => ({
      ...prev,
      [featureType]: [...prev[featureType], '']
    }));
  };
  
  const handleRemoveFeature = (index: number, featureType: 'proximityFeatures' | 'condominiumFeatures' | 'generalFeatures') => {
    const updatedFeatures = [...formData[featureType]];
    updatedFeatures.splice(index, 1);
    
    setFormData(prev => ({
      ...prev,
      [featureType]: updatedFeatures
    }));
  };
  
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      
      const newImages = filesArray.map(file => ({
        preview: URL.createObjectURL(file),
        file
      }));
      
      setImages(prev => [...prev, ...newImages]);
    }
  };
  
  const handleRemoveImage = (index: number) => {
    const updatedImages = [...images];
    
    // Revoke object URL to prevent memory leaks
    if (updatedImages[index].preview) {
      URL.revokeObjectURL(updatedImages[index].preview);
    }
    
    updatedImages.splice(index, 1);
    setImages(updatedImages);
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Verificar se o usuário pode publicar propriedades
    const publishCheck = canPublishProperty();
    if (!publishCheck.allowed) {
      showError(`Não é possível publicar: ${publishCheck.reason}`);
      return;
    }
    
    try {
      // Preparar dados para envio
      const propertyData = {
        ...formData,
        price: parseFloat(formData.price) || 0,
        condominiumPrice: parseFloat(formData.condominiumPrice) || 0,
        bedrooms: parseInt(formData.bedrooms) || 0,
        bathrooms: parseInt(formData.bathrooms) || 0,
        livingRooms: parseInt(formData.livingRooms) || 0,
        totalArea: parseFloat(formData.totalArea) || 0,
        usefulArea: parseFloat(formData.usefulArea) || 0,
        proximityFeatures: formData.proximityFeatures.filter(f => f.trim() !== ''),
        condominiumFeatures: formData.condominiumFeatures.filter(f => f.trim() !== ''),
        generalFeatures: formData.generalFeatures.filter(f => f.trim() !== ''),
        videoLink: formData.videoLink && validateVideoUrl(formData.videoLink) ? formatYouTubeEmbed(formData.videoLink) : '',
        photos: images.map(img => img.preview) // Por enquanto, usar as URLs de preview
      };
      
      const success = await createProperty(propertyData);
      
      if (success) {
        showSuccess('Imóvel cadastrado com sucesso!');
        setTimeout(() => {
          navigate('/corretor/imoveis');
        }, 2000);
      }
    } catch (err) {
      console.error('Erro ao cadastrar imóvel:', err);
    }
  };
  
  const inputStyle = "w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent";
  const labelStyle = "block text-sm font-medium text-gray-700 mb-1";
  const sectionTitle = "text-lg font-medium text-gray-900 mb-4";

  const publishCheck = canPublishProperty();
  const criticalWarnings = getCriticalWarnings();

  return (
    <div>
      <h1 className="text-2xl font-semibold text-gray-800 mb-6">Cadastrar Novo Imóvel</h1>
      
      {/* Plan Status Warning */}
      {!hasActivePlan && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <div className="flex items-start space-x-3">
            <AlertTriangle className="h-5 w-5 text-red-500 mt-0.5" />
            <div>
              <h3 className="text-sm font-medium text-red-800">Plano Necessário</h3>
              <p className="text-sm text-red-700 mt-1">
                Você precisa de um plano ativo para publicar imóveis. Entre em contato com o administrador.
              </p>
            </div>
          </div>
        </div>
      )}
      
      {/* Critical Warnings */}
      {criticalWarnings.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <div className="flex items-start space-x-3">
            <AlertTriangle className="h-5 w-5 text-red-500 mt-0.5" />
            <div>
              <h3 className="text-sm font-medium text-red-800">Atenção Necessária</h3>
              <ul className="text-sm text-red-700 mt-1 space-y-1">
                {criticalWarnings.map((warning, index) => (
                  <li key={index}>• {warning.message}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
      
      {/* Publication Status */}
      {!publishCheck.allowed && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <div className="flex items-start space-x-3">
            <AlertTriangle className="h-5 w-5 text-yellow-500 mt-0.5" />
            <div>
              <h3 className="text-sm font-medium text-yellow-800">Publicação Bloqueada</h3>
              <p className="text-sm text-yellow-700 mt-1">
                {publishCheck.reason}
              </p>
            </div>
          </div>
        </div>
      )}
      
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Informações Básicas */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className={sectionTitle}>Informações Básicas</h2>
          
          <div className="grid grid-cols-1 gap-6">
            <div>
              <label htmlFor="title" className={labelStyle}>Título do Anúncio*</label>
              <input 
                type="text" 
                id="title" 
                name="title" 
                value={formData.title} 
                onChange={handleChange} 
                className={inputStyle} 
                placeholder="Ex: Apartamento com 3 quartos em Balneário Camboriú"
                required
              />
            </div>
            
            <div>
              <label htmlFor="description" className={labelStyle}>Descrição Completa*</label>
              <textarea 
                id="description" 
                name="description" 
                value={formData.description} 
                onChange={handleChange} 
                className={`${inputStyle} min-h-[150px]`} 
                placeholder="Descreva o imóvel detalhadamente, incluindo diferenciais e aspectos relevantes..."
                required
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="category" className={labelStyle}>Tipo de Imóvel*</label>
                <select 
                  id="category" 
                  name="category" 
                  value={formData.category} 
                  onChange={handleChange} 
                  className={inputStyle}
                  required
                >
                  <option value="apartment">Apartamento</option>
                  <option value="house">Casa</option>
                  <option value="commercial">Comercial</option>
                  <option value="land">Terreno</option>
                </select>
              </div>
              
              <div>
                <label htmlFor="availability" className={labelStyle}>Disponibilidade*</label>
                <select 
                  id="availability" 
                  name="availability" 
                  value={formData.availability} 
                  onChange={handleChange} 
                  className={inputStyle}
                  required
                >
                  <option value="sale">Venda</option>
                  <option value="rent">Aluguel</option>
                  <option value="temporada">Temporada</option>
                  <option value="both">Venda e Aluguel</option>
                </select>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label htmlFor="price" className={labelStyle}>
                  {formData.availability === 'rent' ? 'Valor do Aluguel (R$)*' : 'Valor de Venda (R$)*'}
                </label>
                <input 
                  type="text" 
                  id="price" 
                  name="price" 
                  value={formData.price} 
                  onChange={handleChange} 
                  className={inputStyle} 
                  placeholder="Ex: 450000"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="condominiumPrice" className={labelStyle}>Valor do Condomínio (R$)</label>
                <input 
                  type="text" 
                  id="condominiumPrice" 
                  name="condominiumPrice" 
                  value={formData.condominiumPrice} 
                  onChange={handleChange} 
                  className={inputStyle} 
                  placeholder="Ex: 500"
                />
              </div>
              
              <div>
                <label htmlFor="solarPosition" className={labelStyle}>Posição Solar</label>
                <select 
                  id="solarPosition" 
                  name="solarPosition" 
                  value={formData.solarPosition} 
                  onChange={handleChange} 
                  className={inputStyle}
                >
                  <option value="">Selecione</option>
                  <option value="morning">Nascente</option>
                  <option value="afternoon">Poente</option>
                  <option value="both">Ambos</option>
                </select>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
              <div>
                <label htmlFor="bedrooms" className={labelStyle}>Quartos*</label>
                <input 
                  type="number" 
                  id="bedrooms" 
                  name="bedrooms" 
                  min="0"
                  value={formData.bedrooms} 
                  onChange={handleChange} 
                  className={inputStyle}
                  required
                />
              </div>
              
              <div>
                <label htmlFor="bathrooms" className={labelStyle}>Banheiros*</label>
                <input 
                  type="number" 
                  id="bathrooms" 
                  name="bathrooms" 
                  min="0"
                  value={formData.bathrooms} 
                  onChange={handleChange} 
                  className={inputStyle}
                  required
                />
              </div>
              
              <div>
                <label htmlFor="livingRooms" className={labelStyle}>Salas</label>
                <input 
                  type="number" 
                  id="livingRooms" 
                  name="livingRooms" 
                  min="0"
                  value={formData.livingRooms} 
                  onChange={handleChange} 
                  className={inputStyle}
                />
              </div>
              
              <div>
                <label htmlFor="totalArea" className={labelStyle}>Área Total (m²)*</label>
                <input 
                  type="number" 
                  id="totalArea" 
                  name="totalArea" 
                  min="0"
                  value={formData.totalArea} 
                  onChange={handleChange} 
                  className={inputStyle}
                  required
                />
              </div>
              
              <div>
                <label htmlFor="usefulArea" className={labelStyle}>Área Útil (m²)*</label>
                <input 
                  type="number" 
                  id="usefulArea" 
                  name="usefulArea" 
                  min="0"
                  value={formData.usefulArea} 
                  onChange={handleChange} 
                  className={inputStyle}
                  required
                />
              </div>
            </div>
          </div>
        </div>
        
        {/* Endereço */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className={sectionTitle}>
            <div className="flex items-center">
              <MapPin className="mr-2" size={20} /> Endereço
            </div>
          </h2>
          
          <div className="grid grid-cols-1 gap-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="address.cep" className={labelStyle}>CEP*</label>
                <input 
                  type="text" 
                  id="address.cep" 
                  name="address.cep" 
                  value={formData.address.cep} 
                  onChange={handleChange} 
                  className={inputStyle} 
                  placeholder="Ex: 88330-000"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="addressVisibility" className={labelStyle}>Exibição do Endereço*</label>
                <select 
                  id="addressVisibility" 
                  name="addressVisibility" 
                  value={formData.addressVisibility} 
                  onChange={handleChange} 
                  className={inputStyle}
                  required
                >
                  <option value="full_address">Endereço completo</option>
                  <option value="street_neighborhood">Apenas rua e bairro</option>
                  <option value="neighborhood_only">Apenas bairro</option>
                </select>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="address.street" className={labelStyle}>Rua/Avenida*</label>
                <input 
                  type="text" 
                  id="address.street" 
                  name="address.street" 
                  value={formData.address.street} 
                  onChange={handleChange} 
                  className={inputStyle} 
                  placeholder="Ex: Avenida Atlântica"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="address.number" className={labelStyle}>Número*</label>
                <input 
                  type="text" 
                  id="address.number" 
                  name="address.number" 
                  value={formData.address.number} 
                  onChange={handleChange} 
                  className={inputStyle} 
                  placeholder="Ex: 1234"
                  required
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label htmlFor="address.neighborhood" className={labelStyle}>Bairro*</label>
                <input 
                  type="text" 
                  id="address.neighborhood" 
                  name="address.neighborhood" 
                  value={formData.address.neighborhood} 
                  onChange={handleChange} 
                  className={inputStyle} 
                  placeholder="Ex: Centro"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="address.city" className={labelStyle}>Cidade*</label>
                <input 
                  type="text" 
                  id="address.city" 
                  name="address.city" 
                  value={formData.address.city} 
                  onChange={handleChange} 
                  className={inputStyle} 
                  placeholder="Ex: Balneário Camboriú"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="address.state" className={labelStyle}>Estado*</label>
                <select
                  id="address.state"
                  name="address.state"
                  value={formData.address.state}
                  onChange={handleChange}
                  className={inputStyle}
                  required
                >
                  <option value="SC">Santa Catarina</option>
                  <option value="PR">Paraná</option>
                  <option value="RS">Rio Grande do Sul</option>
                  <option value="SP">São Paulo</option>
                  <option value="RJ">Rio de Janeiro</option>
                </select>
              </div>
            </div>
          </div>
        </div>
        
        {/* Características */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className={sectionTitle}>
            <div className="flex items-center">
              <Building className="mr-2" size={20} /> Características
            </div>
          </h2>
          
          <div className="grid grid-cols-1 gap-8">
            {/* Características do Condomínio */}
            <div>
              <h3 className="text-md font-medium text-gray-800 mb-3">Características do Condomínio</h3>
              
              {formData.condominiumFeatures.map((feature, index) => (
                <div key={`condo-${index}`} className="flex items-center mb-2">
                  <input 
                    type="text" 
                    value={feature} 
                    onChange={(e) => handleFeatureChange(index, e.target.value, 'condominiumFeatures')} 
                    className={`${inputStyle} flex-grow`} 
                    placeholder="Ex: Academia"
                  />
                  <button 
                    type="button" 
                    onClick={() => handleRemoveFeature(index, 'condominiumFeatures')} 
                    className="ml-2 p-2 text-red-500 hover:text-red-700"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              ))}
              
              <button 
                type="button" 
                onClick={() => handleAddFeature('condominiumFeatures')} 
                className="inline-flex items-center px-3 py-1.5 text-sm text-green-600 border border-green-500 rounded-md hover:bg-green-50 mt-2"
              >
                <Plus size={16} className="mr-1" /> Adicionar Característica
              </button>
            </div>
            
            {/* Características Gerais */}
            <div>
              <h3 className="text-md font-medium text-gray-800 mb-3">Características Gerais do Imóvel</h3>
              
              {formData.generalFeatures.map((feature, index) => (
                <div key={`general-${index}`} className="flex items-center mb-2">
                  <input 
                    type="text" 
                    value={feature} 
                    onChange={(e) => handleFeatureChange(index, e.target.value, 'generalFeatures')} 
                    className={`${inputStyle} flex-grow`} 
                    placeholder="Ex: Ar condicionado"
                  />
                  <button 
                    type="button" 
                    onClick={() => handleRemoveFeature(index, 'generalFeatures')} 
                    className="ml-2 p-2 text-red-500 hover:text-red-700"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              ))}
              
              <button 
                type="button" 
                onClick={() => handleAddFeature('generalFeatures')} 
                className="inline-flex items-center px-3 py-1.5 text-sm text-green-600 border border-green-500 rounded-md hover:bg-green-50 mt-2"
              >
                <Plus size={16} className="mr-1" /> Adicionar Característica
              </button>
            </div>
            
            {/* Proximidades */}
            <div>
              <h3 className="text-md font-medium text-gray-800 mb-3">Proximidades</h3>
              
              {formData.proximityFeatures.map((feature, index) => (
                <div key={`prox-${index}`} className="flex items-center mb-2">
                  <input 
                    type="text" 
                    value={feature} 
                    onChange={(e) => handleFeatureChange(index, e.target.value, 'proximityFeatures')} 
                    className={`${inputStyle} flex-grow`} 
                    placeholder="Ex: Praia"
                  />
                  <button 
                    type="button" 
                    onClick={() => handleRemoveFeature(index, 'proximityFeatures')} 
                    className="ml-2 p-2 text-red-500 hover:text-red-700"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              ))}
              
              <button 
                type="button" 
                onClick={() => handleAddFeature('proximityFeatures')} 
                className="inline-flex items-center px-3 py-1.5 text-sm text-green-600 border border-green-500 rounded-md hover:bg-green-50 mt-2"
              >
                <Plus size={16} className="mr-1" /> Adicionar Proximidade
              </button>
            </div>
          </div>
        </div>
        
        {/* Fotos */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className={sectionTitle}>
            <div className="flex items-center">
              <Camera className="mr-2" size={20} /> Fotos
            </div>
          </h2>
          
          <div className="grid grid-cols-1 gap-6">
            <div className="border-2 border-dashed border-gray-300 rounded-md p-6 text-center">
              <input 
                type="file"
                id="property-images"
                multiple
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
              <label 
                htmlFor="property-images" 
                className="cursor-pointer flex flex-col items-center justify-center"
              >
                <Camera size={48} className="text-gray-400 mb-2" />
                <p className="text-gray-500">Clique para adicionar fotos ou arraste as imagens para cá</p>
                <p className="text-gray-400 text-sm mt-1">JPG, PNG ou WEBP (máx. 5MB por imagem)</p>
              </label>
            </div>
            
            {/* Preview de imagens */}
            {images.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                {images.map((image, index) => (
                  <div key={index} className="relative">
                    <img
                      src={image.preview}
                      alt={`Preview ${index}`}
                      className="w-full h-32 object-cover rounded-md"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(index)}
                      className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full hover:bg-red-600"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Vídeo do Imóvel */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className={sectionTitle}>
            <div className="flex items-center">
              <Video className="mr-2" size={20} /> Vídeo do Imóvel
            </div>
          </h2>
          
          <div className="space-y-4">
            <div>
              <label htmlFor="videoLink" className={labelStyle}>
                Link do Vídeo (YouTube, Vimeo, etc.)
              </label>
              <input 
                type="url" 
                id="videoLink" 
                name="videoLink" 
                value={formData.videoLink} 
                onChange={handleChange} 
                className={inputStyle} 
                placeholder="https://www.youtube.com/watch?v=..."
              />
              <p className="text-xs text-gray-500 mt-1">
                Cole o link do YouTube, Vimeo ou outro serviço de vídeo. Recomendamos vídeos de até 3 minutos.
              </p>
              
              {/* Preview do vídeo */}
              {formData.videoLink && validateVideoUrl(formData.videoLink) && (
                <div className="mt-4">
                  <p className="text-sm font-medium text-gray-700 mb-2">Preview do Vídeo:</p>
                  <div className="relative rounded-lg overflow-hidden bg-gray-100" style={{ paddingBottom: '56.25%' }}>
                    <iframe 
                      src={formatYouTubeEmbed(formData.videoLink)}
                      className="absolute top-0 left-0 w-full h-full"
                      allowFullScreen
                      title="Preview do vídeo"
                    />
                  </div>
                </div>
              )}
              
              {formData.videoLink && !validateVideoUrl(formData.videoLink) && (
                <p className="text-sm text-red-600 mt-2">
                  URL de vídeo inválida. Por favor, insira um link válido do YouTube ou Vimeo.
                </p>
              )}
            </div>
          </div>
        </div>
        
        {/* Status */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className={sectionTitle}>Status do Anúncio</h2>
          
          <div className="space-y-4">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="isActive"
                name="isActive"
                checked={formData.isActive}
                onChange={handleCheckboxChange}
                className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
              />
              <label htmlFor="isActive" className="ml-2 block text-sm text-gray-700">
                Publicar imediatamente
              </label>
            </div>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                id="isFeatured"
                name="isFeatured"
                checked={formData.isFeatured}
                onChange={handleCheckboxChange}
                className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
              />
              <label htmlFor="isFeatured" className="ml-2 block text-sm text-gray-700">
                Solicitar destaque (sujeito à aprovação do administrador)
              </label>
            </div>
          </div>
        </div>
        
        {/* Botões de ação */}
        <div className="flex justify-end space-x-4">
          <button
            type="button"
            className="px-6 py-3 border border-gray-300 shadow-sm text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={loading || !publishCheck.allowed}
            className="px-6 py-3 border border-transparent shadow-sm text-base font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
            title={!publishCheck.allowed ? publishCheck.reason : ''}
          >
            {loading ? 'Cadastrando...' : 'Cadastrar Imóvel'}
          </button>
        </div>
      </form>
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  );
};

export default ProfessionalAddProperty;