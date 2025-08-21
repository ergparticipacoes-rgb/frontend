import React, { useState } from 'react';
import { Save, X, Upload, MapPin, Home, Flag, Info, Map } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface PropertyFormData {
  // Flags
  exclusividade: boolean;
  aceitaPermuta: boolean;
  aceitaFinanciamento: boolean;
  aceitaProposta: boolean;
  
  // Informações Primárias
  disponibilidade: string;
  categoria: string;
  finalidade: string;
  situacao: string;
  dormitorios: number;
  banheiros: number;
  vagas: number;
  salas: number;
  posicaoSolar: string;
  areaTotal: number;
  areaUtil: number;
  andar: number;
  
  // Sobre o Imóvel
  titulo: string;
  descricao: string;
  
  // Endereço
  cep: string;
  rua: string;
  numero: string;
  complemento: string;
  bairro: string;
  cidade: string;
  estado: string;
  
  // Características
  condominio: string[];
  geral: string[];
  proximidade: string[];
  
  // Preços
  precoVenda?: number;
  precoLocacao?: number;
  taxaCondominio?: number;
  iptu?: number;
  
  // Contato
  telefoneContato: string;
  
  // Fotos
  fotos: File[];
}

const PropertyForm: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<PropertyFormData>({
    // Flags
    exclusividade: false,
    aceitaPermuta: false,
    aceitaFinanciamento: false,
    aceitaProposta: false,
    
    // Informações Primárias
    disponibilidade: '',
    categoria: '',
    finalidade: '',
    situacao: '',
    dormitorios: 0,
    banheiros: 0,
    vagas: 0,
    salas: 0,
    posicaoSolar: '',
    areaTotal: 0,
    areaUtil: 0,
    andar: 0,
    
    // Sobre o Imóvel
    titulo: '',
    descricao: '',
    
    // Endereço
    cep: '',
    rua: '',
    numero: '',
    complemento: '',
    bairro: '',
    cidade: '',
    estado: '',
    
    // Características
    condominio: [],
    geral: [],
    proximidade: [],
    
    // Contato
    telefoneContato: '',
    
    // Fotos
    fotos: []
  });

  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('informacoes');

  const disponibilidadeOptions = ['Venda', 'Locação', 'Temporada', 'Venda e Locação'];
  
  const categoriaOptions = [
    'Apartamento', 'Casa', 'Chácara', 'Escritório', 'Kitnet', 'Loja',
    'Lote', 'Lote em condomínio', 'Ponto comercial', 'Prédio comercial',
    'Sala comercial', 'Salão', 'Sítio', 'Sobrado', 'Terreno'
  ];
  
  const finalidadeOptions = [
    'Comercial', 'Residencial', 'Residencial e/ou Comercial',
    'Industrial', 'Rural', 'Temporada'
  ];
  
  const situacaoOptions = [
    'Alugado', 'Breve lançamento', 'Disponível', 'Indisponível',
    'Lançamento', 'Na planta', 'Novo', 'Pronto para morar',
    'Reformado', 'Reservado', 'Usado', 'Vendido'
  ];
  
  const posicaoSolarOptions = ['Sol manhã', 'Sol tarde'];
  
  const condominioOptions = [
    'Piscina', 'Academia', 'Salão de festas', 'Playground', 'Quadra esportiva',
    'Churrasqueira', 'Sauna', 'Jardim', 'Portaria 24h', 'Elevador',
    'Garagem coberta', 'Área de lazer'
  ];
  
  const geralOptions = [
    'Ar condicionado', 'Armários embutidos', 'Cozinha planejada',
    'Lareira', 'Varanda', 'Quintal', 'Área de serviço', 'Despensa',
    'Closet', 'Hidromassagem', 'Aquecimento solar', 'Alarme'
  ];
  
  const proximidadeOptions = [
    'Shopping', 'Escola', 'Hospital', 'Farmácia', 'Supermercado',
    'Banco', 'Transporte público', 'Parque', 'Praia', 'Centro da cidade',
    'Universidade', 'Aeroporto'
  ];

  const handleInputChange = (field: keyof PropertyFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleCheckboxArrayChange = (field: 'condominio' | 'geral' | 'proximidade', value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].includes(value)
        ? prev[field].filter(item => item !== value)
        : [...prev[field], value]
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFormData(prev => ({
        ...prev,
        fotos: [...prev.fotos, ...Array.from(e.target.files!)]
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // Aqui você implementaria a lógica de envio para a API
      console.log('Dados do formulário:', formData);
      
      // Simular envio
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      alert('Propriedade cadastrada com sucesso!');
      navigate('/admin/propriedades');
    } catch (error) {
      console.error('Erro ao cadastrar propriedade:', error);
      alert('Erro ao cadastrar propriedade. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const renderFlags = () => (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <h3 className="text-lg font-semibold mb-4 flex items-center">
        <Flag className="w-5 h-5 mr-2 text-blue-600" />
        Flags do Anúncio
      </h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { key: 'exclusividade', label: 'Exclusividade' },
          { key: 'aceitaPermuta', label: 'Aceita Permuta' },
          { key: 'aceitaFinanciamento', label: 'Aceita Financiamento' },
          { key: 'aceitaProposta', label: 'Aceita Proposta' }
        ].map(flag => (
          <label key={flag.key} className="flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              checked={formData[flag.key as keyof PropertyFormData] as boolean}
              onChange={(e) => handleInputChange(flag.key as keyof PropertyFormData, e.target.checked)}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700">{flag.label}</span>
          </label>
        ))}
      </div>
    </div>
  );

  const renderInformacoesPrimarias = () => (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <h3 className="text-lg font-semibold mb-4 flex items-center">
        <Info className="w-5 h-5 mr-2 text-blue-600" />
        Informações Primárias
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Disponibilidade */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Disponibilidade *</label>
          <select
            value={formData.disponibilidade}
            onChange={(e) => handleInputChange('disponibilidade', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          >
            <option value="">Selecione...</option>
            {disponibilidadeOptions.map(option => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        </div>

        {/* Categoria */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Categoria *</label>
          <select
            value={formData.categoria}
            onChange={(e) => handleInputChange('categoria', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          >
            <option value="">Selecione...</option>
            {categoriaOptions.map(option => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        </div>

        {/* Finalidade */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Finalidade *</label>
          <select
            value={formData.finalidade}
            onChange={(e) => handleInputChange('finalidade', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          >
            <option value="">Selecione...</option>
            {finalidadeOptions.map(option => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        </div>

        {/* Situação */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Situação do Imóvel *</label>
          <select
            value={formData.situacao}
            onChange={(e) => handleInputChange('situacao', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          >
            <option value="">Selecione...</option>
            {situacaoOptions.map(option => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        </div>

        {/* Dormitórios */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Dormitórios</label>
          <input
            type="number"
            min="0"
            value={formData.dormitorios}
            onChange={(e) => handleInputChange('dormitorios', parseInt(e.target.value) || 0)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Banheiros */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Banheiros</label>
          <input
            type="number"
            min="0"
            value={formData.banheiros}
            onChange={(e) => handleInputChange('banheiros', parseInt(e.target.value) || 0)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Vagas */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Vagas</label>
          <input
            type="number"
            min="0"
            value={formData.vagas}
            onChange={(e) => handleInputChange('vagas', parseInt(e.target.value) || 0)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Salas */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Salas</label>
          <input
            type="number"
            min="0"
            value={formData.salas}
            onChange={(e) => handleInputChange('salas', parseInt(e.target.value) || 0)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Posição Solar */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Posição Solar</label>
          <select
            value={formData.posicaoSolar}
            onChange={(e) => handleInputChange('posicaoSolar', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Selecione...</option>
            {posicaoSolarOptions.map(option => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        </div>

        {/* Área Total */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Área Total (m²)</label>
          <input
            type="number"
            min="0"
            step="0.01"
            value={formData.areaTotal}
            onChange={(e) => handleInputChange('areaTotal', parseFloat(e.target.value) || 0)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Área Útil */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Área Útil/Privativa (m²)</label>
          <input
            type="number"
            min="0"
            step="0.01"
            value={formData.areaUtil}
            onChange={(e) => handleInputChange('areaUtil', parseFloat(e.target.value) || 0)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Andar */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Andar do Imóvel</label>
          <input
            type="number"
            min="0"
            value={formData.andar}
            onChange={(e) => handleInputChange('andar', parseInt(e.target.value) || 0)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>
    </div>
  );

  const renderSobreImovel = () => (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <h3 className="text-lg font-semibold mb-4 flex items-center">
        <Home className="w-5 h-5 mr-2 text-blue-600" />
        Sobre o Imóvel
      </h3>
      <div className="space-y-4">
        {/* Título */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Título *</label>
          <input
            type="text"
            value={formData.titulo}
            onChange={(e) => handleInputChange('titulo', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Ex: Apartamento 3 quartos no centro"
            required
          />
        </div>

        {/* Descrição */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Descrição *</label>
          <textarea
            value={formData.descricao}
            onChange={(e) => handleInputChange('descricao', e.target.value)}
            rows={6}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Descreva detalhadamente o imóvel..."
            required
          />
        </div>

        {/* Telefone de Contato */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Telefone de Contato</label>
          <input
            type="tel"
            value={formData.telefoneContato}
            onChange={(e) => handleInputChange('telefoneContato', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="(47) 99999-9999"
          />
          <p className="text-xs text-gray-500 mt-1">
            Deixe em branco para usar o telefone do seu perfil
          </p>
        </div>

        {/* Preços */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {formData.disponibilidade.includes('Venda') && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Preço de Venda (R$)</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={formData.precoVenda || ''}
                onChange={(e) => handleInputChange('precoVenda', parseFloat(e.target.value) || undefined)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          )}
          
          {formData.disponibilidade.includes('Locação') && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Preço de Locação (R$)</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={formData.precoLocacao || ''}
                onChange={(e) => handleInputChange('precoLocacao', parseFloat(e.target.value) || undefined)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          )}
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Taxa de Condomínio (R$)</label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={formData.taxaCondominio || ''}
              onChange={(e) => handleInputChange('taxaCondominio', parseFloat(e.target.value) || undefined)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">IPTU (R$)</label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={formData.iptu || ''}
              onChange={(e) => handleInputChange('iptu', parseFloat(e.target.value) || undefined)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>
    </div>
  );

  const renderEndereco = () => (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <h3 className="text-lg font-semibold mb-4 flex items-center">
        <MapPin className="w-5 h-5 mr-2 text-blue-600" />
        Endereço
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">CEP *</label>
          <input
            type="text"
            value={formData.cep}
            onChange={(e) => handleInputChange('cep', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="00000-000"
            required
          />
        </div>
        
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">Rua *</label>
          <input
            type="text"
            value={formData.rua}
            onChange={(e) => handleInputChange('rua', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Nome da rua"
            required
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Número *</label>
          <input
            type="text"
            value={formData.numero}
            onChange={(e) => handleInputChange('numero', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="123"
            required
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Complemento</label>
          <input
            type="text"
            value={formData.complemento}
            onChange={(e) => handleInputChange('complemento', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Apto 101, Bloco A"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Bairro *</label>
          <input
            type="text"
            value={formData.bairro}
            onChange={(e) => handleInputChange('bairro', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Nome do bairro"
            required
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Cidade *</label>
          <input
            type="text"
            value={formData.cidade}
            onChange={(e) => handleInputChange('cidade', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Nome da cidade"
            required
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Estado *</label>
          <input
            type="text"
            value={formData.estado}
            onChange={(e) => handleInputChange('estado', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="SP"
            required
          />
        </div>
      </div>
    </div>
  );

  const renderCaracteristicas = () => (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <h3 className="text-lg font-semibold mb-4">Características</h3>
      
      {/* Condomínio */}
      <div className="mb-6">
        <h4 className="text-md font-medium text-gray-700 mb-3">Condomínio</h4>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
          {condominioOptions.map(option => (
            <label key={option} className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.condominio.includes(option)}
                onChange={() => handleCheckboxArrayChange('condominio', option)}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">{option}</span>
            </label>
          ))}
        </div>
      </div>
      
      {/* Geral */}
      <div className="mb-6">
        <h4 className="text-md font-medium text-gray-700 mb-3">Geral</h4>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
          {geralOptions.map(option => (
            <label key={option} className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.geral.includes(option)}
                onChange={() => handleCheckboxArrayChange('geral', option)}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">{option}</span>
            </label>
          ))}
        </div>
      </div>
      
      {/* Proximidade */}
      <div>
        <h4 className="text-md font-medium text-gray-700 mb-3">Proximidade</h4>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
          {proximidadeOptions.map(option => (
            <label key={option} className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.proximidade.includes(option)}
                onChange={() => handleCheckboxArrayChange('proximidade', option)}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">{option}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );

  const renderFotos = () => (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <h3 className="text-lg font-semibold mb-4 flex items-center">
        <Upload className="w-5 h-5 mr-2 text-blue-600" />
        Fotos do Imóvel
      </h3>
      
      <div className="mb-4">
        <input
          type="file"
          multiple
          accept="image/*"
          onChange={handleFileChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <p className="text-sm text-gray-500 mt-1">
          Selecione múltiplas imagens. A primeira será a foto de capa.
        </p>
      </div>
      
      {formData.fotos.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {formData.fotos.map((foto, index) => (
            <div key={index} className="relative">
              <img
                src={URL.createObjectURL(foto)}
                alt={`Foto ${index + 1}`}
                className="w-full h-24 object-cover rounded-md border"
              />
              <button
                type="button"
                onClick={() => {
                  setFormData(prev => ({
                    ...prev,
                    fotos: prev.fotos.filter((_, i) => i !== index)
                  }));
                }}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
              >
                <X className="w-3 h-3" />
              </button>
              {index === 0 && (
                <span className="absolute bottom-1 left-1 bg-blue-500 text-white text-xs px-1 rounded">
                  Capa
                </span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const tabs = [
    { id: 'informacoes', label: 'Informações', icon: Info },
    { id: 'endereco', label: 'Endereço', icon: MapPin },
    { id: 'caracteristicas', label: 'Características', icon: Home },
    { id: 'fotos', label: 'Fotos', icon: Upload }
  ];

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Inserir Imóvel</h1>
          <button
            onClick={() => navigate('/admin/propriedades')}
            className="flex items-center px-4 py-2 text-gray-600 hover:text-gray-800"
          >
            <X className="w-5 h-5 mr-2" />
            Cancelar
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Flags */}
        {renderFlags()}

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {tabs.map(tab => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center py-4 px-1 border-b-2 font-medium text-sm ${
                      activeTab === tab.id
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <Icon className="w-4 h-4 mr-2" />
                    {tab.label}
                  </button>
                );
              })}
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'informacoes' && (
              <div className="space-y-6">
                {renderInformacoesPrimarias()}
                {renderSobreImovel()}
              </div>
            )}
            {activeTab === 'endereco' && renderEndereco()}
            {activeTab === 'caracteristicas' && renderCaracteristicas()}
            {activeTab === 'fotos' && renderFotos()}
          </div>
        </div>

        {/* Botões de ação */}
        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => navigate('/admin/propriedades')}
            className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex items-center px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {loading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
            ) : (
              <Save className="w-4 h-4 mr-2" />
            )}
            {loading ? 'Salvando...' : 'Salvar Imóvel'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default PropertyForm;