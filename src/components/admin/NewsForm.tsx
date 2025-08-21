import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Save, X, Upload, Eye, Image } from 'lucide-react';
import { useAdminNews } from '../../hooks/useAdminNews';

interface NewsFormProps {
  onClose?: () => void;
  newsId?: string;
}

const NewsForm: React.FC<NewsFormProps> = ({ onClose, newsId }) => {
  const navigate = useNavigate();
  const { id } = useParams();
  const currentNewsId = newsId || id;
  
  const { news, createNews, updateNews, loading } = useAdminNews();
  
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    imageUrl: '',
    isActive: true
  });
  
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);

  // Carregar dados da notícia se estiver editando
  useEffect(() => {
    if (currentNewsId && news.length > 0) {
      const newsItem = news.find(n => n._id === currentNewsId);
      if (newsItem) {
        setFormData({
          title: newsItem.title,
          content: newsItem.content,
          imageUrl: newsItem.imageUrl || '',
          isActive: newsItem.isActive
        });
        if (newsItem.imageUrl) {
          setImagePreview(newsItem.imageUrl);
        }
      }
    }
  }, [currentNewsId, news]);

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};
    
    if (!formData.title.trim()) {
      newErrors.title = 'Título é obrigatório';
    }
    
    if (!formData.content.trim()) {
      newErrors.content = 'Conteúdo é obrigatório';
    }
    
    // Validação de imagem removida pois agora é upload de arquivo
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      
      // Criar preview da imagem
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };
  
  const removeImage = () => {
    setSelectedImage(null);
    setImagePreview('');
    setFormData(prev => ({ ...prev, imageUrl: '' }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      let success;
      if (currentNewsId) {
        success = await updateNews(currentNewsId, formData, selectedImage || undefined);
      } else {
        success = await createNews(formData, selectedImage || undefined);
      }
      
      if (success) {
        if (onClose) {
          onClose();
        } else {
          navigate('/admin/noticias');
        }
      }
    } catch (error) {
      console.error('Erro ao salvar notícia:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    if (onClose) {
      onClose();
    } else {
      navigate('/admin/noticias');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
    
    // Limpar erro do campo quando o usuário começar a digitar
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white shadow-lg rounded-lg overflow-hidden">
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-800">
              {currentNewsId ? 'Editar Notícia' : 'Nova Notícia'}
            </h2>
            <div className="flex space-x-2">
              <button
                type="button"
                onClick={() => setPreviewMode(!previewMode)}
                className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                <Eye className="w-4 h-4 mr-2" />
                {previewMode ? 'Editar' : 'Visualizar'}
              </button>
            </div>
          </div>
        </div>

        <div className="p-6">
          {previewMode ? (
            // Modo de visualização
            <div className="prose max-w-none">
              <div className="mb-6">
                {imagePreview && (
                  <img 
                    src={imagePreview} 
                    alt={formData.title}
                    className="w-full h-64 object-cover rounded-lg mb-4"
                  />
                )}
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{formData.title || 'Título da notícia'}</h1>
                <div className="flex items-center text-sm text-gray-500 mb-4">
                  <span>Publicado em {new Date().toLocaleDateString('pt-BR')}</span>
                  <span className={`ml-4 px-2 py-1 rounded-full text-xs ${
                    formData.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {formData.isActive ? 'Ativo' : 'Inativo'}
                  </span>
                </div>
              </div>
              <div className="whitespace-pre-wrap text-gray-700">
                {formData.content || 'Conteúdo da notícia aparecerá aqui...'}
              </div>
            </div>
          ) : (
            // Modo de edição
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                  Título *
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.title ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="Digite o título da notícia"
                />
                {errors.title && (
                  <p className="mt-1 text-sm text-red-600">{errors.title}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Imagem da Notícia
                </label>
                
                {!imagePreview ? (
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                    <input
                      type="file"
                      id="image"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                    <label htmlFor="image" className="cursor-pointer">
                      <div className="flex flex-col items-center">
                        <Image className="w-12 h-12 text-gray-400 mb-2" />
                        <span className="text-sm text-gray-600">Clique para selecionar uma imagem</span>
                        <span className="text-xs text-gray-400 mt-1">PNG, JPG, GIF até 10MB</span>
                      </div>
                    </label>
                  </div>
                ) : (
                  <div className="relative">
                    <img 
                      src={imagePreview} 
                      alt="Preview" 
                      className="w-full h-48 object-cover rounded-lg border"
                    />
                    <div className="absolute top-2 right-2 flex space-x-2">
                      <label htmlFor="image" className="bg-blue-600 text-white p-2 rounded-full cursor-pointer hover:bg-blue-700 transition-colors">
                        <Upload className="w-4 h-4" />
                      </label>
                      <button
                        type="button"
                        onClick={removeImage}
                        className="bg-red-600 text-white p-2 rounded-full hover:bg-red-700 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                    <input
                      type="file"
                      id="image"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                  </div>
                )}
              </div>

              <div>
                <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2">
                  Conteúdo *
                </label>
                <textarea
                  id="content"
                  name="content"
                  rows={12}
                  value={formData.content}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.content ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="Digite o conteúdo da notícia"
                />
                {errors.content && (
                  <p className="mt-1 text-sm text-red-600">{errors.content}</p>
                )}
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isActive"
                  name="isActive"
                  checked={formData.isActive}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="isActive" className="ml-2 block text-sm text-gray-700">
                  Publicar notícia (ativa)
                </label>
              </div>
            </form>
          )}
        </div>

        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end space-x-3">
          <button
            type="button"
            onClick={handleCancel}
            className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
          >
            <X className="w-4 h-4 mr-2" />
            Cancelar
          </button>
          {!previewMode && (
            <button
              type="submit"
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
            >
              <Save className="w-4 h-4 mr-2" />
              {isSubmitting ? 'Salvando...' : (currentNewsId ? 'Atualizar' : 'Criar')}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default NewsForm;