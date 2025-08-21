import React, { useState, useRef, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight, Maximize2, Minimize2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface PropertyGalleryProps {
  images: string[];
  title: string;
  onClose: () => void;
  initialIndex?: number;
}

const PropertyGallery: React.FC<PropertyGalleryProps> = ({
  images,
  title,
  onClose,
  initialIndex = 0,
}) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);  
  const [isFullscreen, setIsFullscreen] = useState(false);
  const galleryRef = useRef<HTMLDivElement>(null);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'Escape':
          onClose();
          break;
        case 'ArrowLeft':
          goToPrevious();
          break;
        case 'ArrowRight':
          goToNext();
          break;
        case 'f':
        case 'F':
          toggleFullscreen();
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex]);

  // Handle touch events
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (touchStart - touchEnd > 50) {
      // Swipe left
      goToNext();
    }

    if (touchStart - touchEnd < -50) {
      // Swipe right
      goToPrevious();
    }
  };

  const goToPrevious = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? images.length - 1 : prevIndex - 1
    );
  };

  const goToNext = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === images.length - 1 ? 0 : prevIndex + 1
    );
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      galleryRef.current?.requestFullscreen().catch(err => {
        console.error(`Error attempting to enable fullscreen: ${err.message}`);
      });
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
        setIsFullscreen(false);
      }
    }
  };

  // Handle fullscreen change
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  // Preload next and previous images
  useEffect(() => {
    const preloadImages = () => {
      const nextIndex = currentIndex === images.length - 1 ? 0 : currentIndex + 1;
      const prevIndex = currentIndex === 0 ? images.length - 1 : currentIndex - 1;
      
      [nextIndex, prevIndex].forEach(index => {
        const img = new Image();
        img.src = images[index];
      });
    };

    preloadImages();
  }, [currentIndex, images]);

  return (
    <div 
      ref={galleryRef}
      className="fixed inset-0 z-50 bg-black bg-opacity-90 flex flex-col"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      {/* Header */}
      <div className="flex justify-between items-center p-4 bg-black bg-opacity-70 text-white">
        <div className="flex items-center">
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-800 transition-colors"
            aria-label="Fechar galeria"
          >
            <X className="h-6 w-6" />
          </button>
          <h2 className="ml-4 text-lg font-medium truncate max-w-xs md:max-w-md">
            {title}
          </h2>
        </div>
        <div className="flex items-center">
          <span className="text-sm text-gray-300 mr-4">
            {currentIndex + 1} / {images.length}
          </span>
          <button
            onClick={toggleFullscreen}
            className="p-2 rounded-full hover:bg-gray-800 transition-colors"
            aria-label={isFullscreen ? 'Sair da tela cheia' : 'Tela cheia'}
          >
            {isFullscreen ? (
              <Minimize2 className="h-5 w-5" />
            ) : (
              <Maximize2 className="h-5 w-5" />
            )}
          </button>
        </div>
      </div>

      {/* Main Image */}
      <div className="flex-1 flex items-center justify-center relative p-4">
        <AnimatePresence initial={false} mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3 }}
            className="relative w-full h-full flex items-center justify-center"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            <img
              src={images[currentIndex]}
              alt={`${title} - Imagem ${currentIndex + 1}`}
              className="max-h-[80vh] max-w-full object-contain"
              draggable={false}
            />
          </motion.div>
        </AnimatePresence>

        {/* Navigation Arrows */}
        {images.length > 1 && (
          <>
            <button
              onClick={goToPrevious}
              className="absolute left-4 p-3 bg-black bg-opacity-50 text-white rounded-full hover:bg-opacity-75 transition-all focus:outline-none focus:ring-2 focus:ring-white"
              aria-label="Imagem anterior"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
            <button
              onClick={goToNext}
              className="absolute right-4 p-3 bg-black bg-opacity-50 text-white rounded-full hover:bg-opacity-75 transition-all focus:outline-none focus:ring-2 focus:ring-white"
              aria-label="Próxima imagem"
            >
              <ChevronRight className="h-6 w-6" />
            </button>
          </>
        )}
      </div>

      {/* Thumbnails */}
      <div className="h-24 bg-black bg-opacity-70 overflow-x-auto overflow-y-hidden flex items-center px-4 py-2">
        <div className="flex space-x-2 mx-auto">
          {images.map((image, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`flex-shrink-0 w-16 h-16 rounded overflow-hidden border-2 transition-all ${
                index === currentIndex
                  ? 'border-blue-500 scale-105'
                  : 'border-transparent hover:border-white hover:border-opacity-50'
              }`}
              aria-label={`Ir para imagem ${index + 1}`}
            >
              <img
                src={image}
                alt=""
                className={`w-full h-full object-cover transition-opacity ${
                  index === currentIndex ? 'opacity-100' : 'opacity-60 hover:opacity-80'
                }`}
                draggable={false}
              />
            </button>
          ))}
        </div>
      </div>

      {/* Caption (if needed) */}
      <div className="p-4 bg-black bg-opacity-70 text-white text-sm text-center">
        <p>Use as setas do teclado para navegar • Pressione ESC para sair • F para tela cheia</p>
      </div>
    </div>
  );
};

export default PropertyGallery;
