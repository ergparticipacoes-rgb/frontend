export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  city: string;
  userType: 'admin' | 'corretoria' | 'particular';
  isApproved: boolean;

  activePlan?: string;
  creci?: string;
  stockSize?: string;
  createdAt: Date;
}

export interface Property {
  id: string;
  _id?: string; // Campo adicional para compatibilidade com MongoDB
  title: string;
  description: string;
  availability: 'sale' | 'rent' | 'temporada' | 'both';
  category: 'apartment' | 'house' | 'chacara' | 'terrain' | 'salon' | 'sobrado';
  photos: string[];
  videoLink?: string;
  bedrooms: number;
  bathrooms: number;
  livingRooms: number;
  solarPosition?: 'morning' | 'afternoon' | 'both';
  totalArea: number;
  usefulArea: number;
  price: number;
  condominiumPrice?: number;
  address: {
    cep: string;
    street: string;
    number: string;
    complement?: string;
    neighborhood: string;
    city: string;
    state: string;
  };
  addressVisibility?: 'street_neighborhood' | 'full_address' | 'neighborhood_only' | 'no_address' | 'hidden';
  condominiumFeatures?: string[];
  generalFeatures?: string[];
  proximityFeatures?: string[];
  internalNotes?: string;
  tags?: string[];
  telefoneContato?: string; // Telefone de contato específico do imóvel
  ownerId: string | {
    _id: string;
    name: string;
    email: string;
    phone: string;
    userType: 'admin' | 'corretoria' | 'particular';
    creci?: string;
  }; // Pode ser string (ID) ou objeto User populado
  createdAt: string | Date; // Pode ser string ISO ou objeto Date
  updatedAt?: string | Date;
  isActive: boolean;
  isFeatured: boolean;
  reference?: string;
}

export interface SearchFilters {
  location?: string;
  minPrice?: number;
  maxPrice?: number;
  bedrooms?: number;
  availability?: 'sale' | 'rent' | 'temporada' | 'both';
  category?: string;
}

export interface News {
  id: string;
  _id?: string; // Campo adicional para compatibilidade com MongoDB
  title: string;
  content: string;
  imageUrl?: string;
  publishedAt: string | Date;
  authorId: string;
}