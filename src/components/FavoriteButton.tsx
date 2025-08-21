import { useState, useEffect } from 'react';
import { Heart } from 'lucide-react';

interface FavoriteButtonProps {
  propertyId?: string;
  property?: {
    id?: string;
    _id?: string;
  };
  className?: string;
}

const FAVORITES_KEY = 'favoriteProperties';

const FavoriteButton: React.FC<FavoriteButtonProps> = ({ propertyId, property, className = '' }) => {
  const [isFavorite, setIsFavorite] = useState(false);

  // Get the actual ID to use (prefer propertyId, then property._id, then property.id)
  const actualId = propertyId || property?._id || property?.id;

  // Check if property is in favorites on component mount
  useEffect(() => {
    if (!actualId) return;
    
    const favorites = JSON.parse(localStorage.getItem(FAVORITES_KEY) || '[]');
    setIsFavorite(favorites.includes(actualId));
  }, [actualId]);

  const toggleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation(); // Prevent triggering parent click events
    
    if (!actualId) {
      console.error('No property ID available for favorite toggle');
      return;
    }
    
    try {
      const favorites = JSON.parse(localStorage.getItem(FAVORITES_KEY) || '[]');
      let newFavorites;
      
      if (isFavorite) {
        newFavorites = favorites.filter((id: string) => id !== actualId);
      } else {
        newFavorites = [...favorites, actualId];
      }
      
      localStorage.setItem(FAVORITES_KEY, JSON.stringify(newFavorites));
      setIsFavorite(!isFavorite);
      
      console.log('Favorite toggled:', { propertyId: actualId, isFavorite: !isFavorite });
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  };

  return (
    <button
      onClick={toggleFavorite}
      onMouseDown={e => e.stopPropagation()}
      onTouchStart={e => e.stopPropagation()}
      className={`absolute top-3 right-3 bg-white bg-opacity-90 rounded-full p-2 hover:bg-opacity-100 transition-all z-10 ${className}`}
      aria-label={isFavorite ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
    >
      <Heart 
        className={`h-4 w-4 ${isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-600 hover:text-red-500'}`} 
        strokeWidth="2"
      />
    </button>
  );
};

export default FavoriteButton;
