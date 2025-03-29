import { useState, useEffect, useCallback } from 'react';
import { useLocation } from 'wouter';

export type LoadingScreenType = 'default' | 'car-drive' | 'engine-start' | 'wheel-spin';

export interface UsePageLoadingOptions {
  /** نوع شاشة التحميل الافتراضية */
  defaultType?: LoadingScreenType;
  /** الحد الأدنى للوقت الذي يجب أن تظهر فيه شاشة التحميل (بالميللي ثانية) */
  minDuration?: number;
  /** ما إذا كان سيتم عرض التحميل تلقائيًا عند تغيير المسار */
  showOnRouteChange?: boolean;
}

/**
 * خطاف مخصص لإدارة حالة التحميل في التطبيق
 */
export function usePageLoading({
  defaultType = 'default',
  minDuration = 600,
  showOnRouteChange = true,
}: UsePageLoadingOptions = {}) {
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('جاري التحميل...');
  const [loadingType, setLoadingType] = useState<LoadingScreenType>(defaultType);
  const [loadingStart, setLoadingStart] = useState<number | null>(null);
  const [location] = useLocation();

  // إظهار شاشة التحميل
  const showLoading = useCallback((message?: string, type?: LoadingScreenType) => {
    setIsLoading(true);
    if (message) setLoadingMessage(message);
    if (type) setLoadingType(type);
    setLoadingStart(Date.now());
  }, []);

  // إخفاء شاشة التحميل مع مراعاة الحد الأدنى للمدة
  const hideLoading = useCallback(() => {
    if (!loadingStart) {
      setIsLoading(false);
      return;
    }

    const elapsed = Date.now() - loadingStart;
    const remaining = Math.max(0, minDuration - elapsed);

    if (remaining <= 0) {
      setIsLoading(false);
      setLoadingStart(null);
    } else {
      setTimeout(() => {
        setIsLoading(false);
        setLoadingStart(null);
      }, remaining);
    }
  }, [loadingStart, minDuration]);

  // تحديث نوع شاشة التحميل
  const updateLoadingType = useCallback((type: LoadingScreenType) => {
    setLoadingType(type);
  }, []);

  // تحديث رسالة التحميل
  const updateLoadingMessage = useCallback((message: string) => {
    setLoadingMessage(message);
  }, []);

  // تعقب تغييرات المسار
  useEffect(() => {
    if (showOnRouteChange) {
      showLoading(
        'جاري الانتقال...',
        location.startsWith('/cars/') 
          ? 'car-drive' 
          : location.startsWith('/ai/')
          ? 'engine-start'
          : 'default'
      );
    }
  }, [location, showOnRouteChange, showLoading]);

  return {
    isLoading,
    loadingMessage,
    loadingType,
    showLoading,
    hideLoading,
    updateLoadingType,
    updateLoadingMessage,
  };
}