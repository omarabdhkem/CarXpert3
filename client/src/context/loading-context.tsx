import React, { createContext, useContext, useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { LoadingScreen } from '@/components/ui/loading-screen';

interface LoadingContextProps {
  isLoading: boolean;
  startLoading: (variant?: string) => void;
  stopLoading: () => void;
}

interface LoadingProviderProps {
  children: React.ReactNode;
  minDuration?: number;
  showOnRouteChange?: boolean;
}

const LoadingContext = createContext<LoadingContextProps | null>(null);

export const LoadingProvider: React.FC<LoadingProviderProps> = ({
  children,
  minDuration = 500,
  showOnRouteChange = true,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [loadingTimer, setLoadingTimer] = useState<NodeJS.Timeout | null>(null);
  const [loadingStartTime, setLoadingStartTime] = useState<number | null>(null);
  const [loadingVariant, setLoadingVariant] = useState<string>('default');
  const [location] = useLocation();

  useEffect(() => {
    if (showOnRouteChange) {
      startLoading();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location, showOnRouteChange]);

  const startLoading = (variant: string = 'default') => {
    setLoadingVariant(variant);
    setLoadingStartTime(Date.now());
    setIsLoading(true);
  };

  const stopLoading = () => {
    if (loadingStartTime) {
      const elapsedTime = Date.now() - loadingStartTime;
      const remainingTime = Math.max(0, minDuration - elapsedTime);

      if (remainingTime > 0) {
        if (loadingTimer) clearTimeout(loadingTimer);
        
        const timer = setTimeout(() => {
          setIsLoading(false);
          setLoadingTimer(null);
          setLoadingStartTime(null);
        }, remainingTime);
        
        setLoadingTimer(timer);
      } else {
        setIsLoading(false);
        setLoadingStartTime(null);
      }
    } else {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isLoading && loadingStartTime) {
      const timer = setTimeout(() => {
        stopLoading();
      }, 10000); // 10 second max loading time as a failsafe
      
      return () => clearTimeout(timer);
    }
  }, [isLoading, loadingStartTime]);

  return (
    <LoadingContext.Provider value={{ isLoading, startLoading, stopLoading }}>
      {isLoading ? <LoadingScreen variant={loadingVariant} /> : children}
    </LoadingContext.Provider>
  );
};

export const useLoading = () => {
  const context = useContext(LoadingContext);
  if (!context) {
    throw new Error('useLoading must be used within a LoadingProvider');
  }
  return context;
};