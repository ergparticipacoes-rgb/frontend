import React, { useState, useEffect, useRef } from 'react';
import { MapPin, ChevronDown } from 'lucide-react';

interface LocationSuggestion {
  id: string;
  label: string;
  type: 'city' | 'neighborhood';
  city?: string;
}

interface LocationAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

// Cidades principais do litoral de Santa Catarina
const baseCities = [
  'Balneário Camboriú',
  'Florianópolis', 
  'Itajaí',
  'Camboriú',
  'Bombinhas',
  'Porto Belo',
  'Tijucas',
  'Governador Celso Ramos',
  'Biguaçu',
  'São José'
];

// Função para gerar sugestões dinamicamente
const generateLocationSuggestions = (query: string): LocationSuggestion[] => {
  const suggestions: LocationSuggestion[] = [];
  let id = 1;
  
  // Adicionar cidades que correspondem à busca
  baseCities.forEach(city => {
    if (city.toLowerCase().includes(query.toLowerCase())) {
      suggestions.push({
        id: id.toString(),
        label: city,
        type: 'city'
      });
      id++;
    }
  });
  
  return suggestions;
};

const LocationAutocomplete: React.FC<LocationAutocompleteProps> = ({
  value,
  onChange,
  placeholder = "Localização (cidade, bairro)",
  className = ""
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [filteredSuggestions, setFilteredSuggestions] = useState<LocationSuggestion[]>([]);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Filtrar sugestões baseadas no input
  useEffect(() => {
    if (value.length >= 2) {
      const filtered = generateLocationSuggestions(value);
      setFilteredSuggestions(filtered.slice(0, 8)); // Limitar a 8 sugestões
      setIsOpen(filtered.length > 0);
    } else {
      setFilteredSuggestions([]);
      setIsOpen(false);
    }
    setHighlightedIndex(-1);
  }, [value]);

  // Fechar dropdown quando clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  };

  const handleSuggestionClick = (suggestion: LocationSuggestion) => {
    const selectedValue = suggestion.type === 'city' 
      ? suggestion.label 
      : suggestion.label.split(' - ')[0]; // Remove a cidade do bairro
    
    onChange(selectedValue);
    setIsOpen(false);
    inputRef.current?.blur();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex(prev => 
          prev < filteredSuggestions.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex(prev => 
          prev > 0 ? prev - 1 : filteredSuggestions.length - 1
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (highlightedIndex >= 0 && filteredSuggestions[highlightedIndex]) {
          handleSuggestionClick(filteredSuggestions[highlightedIndex]);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        inputRef.current?.blur();
        break;
    }
  };

  const handleFocus = () => {
    if (value.length >= 2 && filteredSuggestions.length > 0) {
      setIsOpen(true);
    }
  };

  return (
    <div className={`relative ${className}`}>
      <div className="relative">
        <MapPin className="absolute left-3 top-3 h-5 w-5 text-gray-400 z-10" />
        <input
          ref={inputRef}
          type="text"
          placeholder={placeholder}
          value={value}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={handleFocus}
          className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          autoComplete="off"
        />
        <ChevronDown 
          className={`absolute right-3 top-3 h-5 w-5 text-gray-400 transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`} 
        />
      </div>

      {isOpen && filteredSuggestions.length > 0 && (
        <div
          ref={dropdownRef}
          className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-64 overflow-y-auto"
        >
          {filteredSuggestions.map((suggestion, index) => (
            <div
              key={suggestion.id}
              onClick={() => handleSuggestionClick(suggestion)}
              className={`px-4 py-3 cursor-pointer transition-colors duration-150 ${
                index === highlightedIndex
                  ? 'bg-blue-50 text-blue-700'
                  : 'hover:bg-gray-50'
              } ${index === 0 ? 'rounded-t-lg' : ''} ${
                index === filteredSuggestions.length - 1 ? 'rounded-b-lg' : ''
              }`}
            >
              <div className="flex items-center space-x-2">
                <MapPin className="h-4 w-4 text-gray-400" />
                <div>
                  <div className="font-medium text-gray-900">
                    {suggestion.type === 'city' ? suggestion.label : suggestion.label.split(' - ')[0]}
                  </div>
                  {suggestion.type === 'neighborhood' && suggestion.city && (
                    <div className="text-sm text-gray-500">
                      {suggestion.city}
                    </div>
                  )}
                </div>
                <div className="ml-auto">
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    suggestion.type === 'city'
                      ? 'bg-blue-100 text-blue-700'
                      : 'bg-green-100 text-green-700'
                  }`}>
                    {suggestion.type === 'city' ? 'Cidade' : 'Bairro'}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default LocationAutocomplete;