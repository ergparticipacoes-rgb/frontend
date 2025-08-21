import { useState, useEffect } from 'react';

interface UseImageLoaderProps {
  src: string;
  fallbackSrc?: string;
  onLoad?: () => void;
  onError?: () => void;
}

const useImageLoader = ({
  src,
  fallbackSrc = '/placeholder-property.jpg',
  onLoad,
  onError,
}: UseImageLoaderProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [imageSrc, setImageSrc] = useState<string>('');
  const [isInView, setIsInView] = useState(false);

  useEffect(() => {
    if (!src) {
      setImageSrc(fallbackSrc);
      setIsLoading(false);
      return;
    }

    // Create an IntersectionObserver to load images when they come into view
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      {
        root: null,
        rootMargin: '200px', // Start loading when within 200px of viewport
        threshold: 0.01,
      }
    );

    // Start observing the target node
    const target = document.createElement('div');
    observer.observe(target);

    return () => {
      observer.disconnect();
    };
  }, [src]);

  useEffect(() => {
    if (!isInView) return;

    let isMounted = true;
    const image = new Image();

    const handleLoad = () => {
      if (!isMounted) return;
      setIsLoading(false);
      setHasError(false);
      setImageSrc(src);
      onLoad?.();
    };

    const handleError = () => {
      if (!isMounted) return;
      setIsLoading(false);
      setHasError(true);
      setImageSrc(fallbackSrc);
      onError?.();
    };

    image.src = src;
    image.onload = handleLoad;
    image.onerror = handleError;

    // Set a timeout to handle cases where the image takes too long to load
    const timeoutId = setTimeout(() => {
      if (isLoading && isMounted) {
        handleError();
      }
    }, 10000); // 10 seconds timeout

    // Cleanup function
    return () => {
      isMounted = false;
      image.onload = null;
      image.onerror = null;
      clearTimeout(timeoutId);
    };
  }, [src, isInView]);

  // Return the current state
  return {
    src: imageSrc || fallbackSrc,
    isLoading,
    hasError,
  };
};

export default useImageLoader;
