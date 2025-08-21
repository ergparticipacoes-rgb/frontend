import { useState, useEffect } from 'react';

const FAVORITES_KEY = 'realEstateFavorites';

export const useFavorites = () => {
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [isLoaded, setIsLoaded] = useState(false);

  // Load favorites from localStorage on component mount
  useEffect(() => {
    try {
      const storedFavorites = localStorage.getItem(FAVORITES_KEY);
      if (storedFavorites) {
        setFavorites(new Set(JSON.parse(storedFavorites)));
      }
    } catch (error) {
      console.error('Error loading favorites from localStorage:', error);
      // Clear invalid data
      localStorage.removeItem(FAVORITES_KEY);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // Save favorites to localStorage whenever they change
  useEffect(() => {
    if (isLoaded) {
      try {
        localStorage.setItem(FAVORITES_KEY, JSON.stringify(Array.from(favorites)));
      } catch (error) {
        console.error('Error saving favorites to localStorage:', error);
      }
    }
  }, [favorites, isLoaded]);

  const toggleFavorite = (propertyId: string) => {
    setFavorites(prevFavorites => {
      const newFavorites = new Set(prevFavorites);
      if (newFavorites.has(propertyId)) {
        newFavorites.delete(propertyId);
      } else {
        newFavorites.add(propertyId);
      }
      return newFavorites;
    });
  };

  const isFavorite = (propertyId: string) => {
    return favorites.has(propertyId);
  };

  const getFavoriteCount = () => {
    return favorites.size;
  };

  const clearFavorites = () => {
    setFavorites(new Set());
    localStorage.removeItem(FAVORITES_KEY);
  };

  return {
    favorites: Array.from(favorites),
    isFavorite,
    toggleFavorite,
    getFavoriteCount,
    clearFavorites,
    isLoaded
  };
};
