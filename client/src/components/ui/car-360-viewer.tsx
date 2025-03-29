import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { t } from '@/i18n';
import { RotateCw, RefreshCw, Maximize, MinusCircle, PlusCircle } from 'lucide-react';

interface Car360ViewerProps {
  carId: number;
  carName: string;
  imagesCount?: number; // عدد الصور المتاحة للعرض 360 درجة
  autoRotate?: boolean; // تدوير تلقائي
  startIndex?: number; // الصورة البداية
  fullScreen?: boolean; // تفعيل وضع ملء الشاشة
  className?: string;
}

export function Car360Viewer({
  carId,
  carName,
  imagesCount = 36,
  autoRotate = false,
  startIndex = 1,
  fullScreen = true,
  className = ''
}: Car360ViewerProps) {
  const [currentIndex, setCurrentIndex] = useState(startIndex);
  const [isAutoRotating, setIsAutoRotating] = useState(autoRotate);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1); // مستوى التكبير
  const containerRef = useRef<HTMLDivElement>(null);
  const viewerRef = useRef<HTMLDivElement>(null);
  const autoRotateIntervalRef = useRef<number | null>(null);
  
  // إنشاء مسار للصورة بناءً على معرف السيارة والفهرس
  const getImagePath = (index: number) => {
    // يمكن استبدال هذا ببيانات حقيقية من API
    return `/assets/cars/${carId}/360/${index.toString().padStart(2, '0')}.jpg`;
  };

  // التعامل مع الدوران التلقائي
  useEffect(() => {
    if (isAutoRotating) {
      autoRotateIntervalRef.current = window.setInterval(() => {
        setCurrentIndex(prev => (prev % imagesCount) + 1);
      }, 100);
    } else if (autoRotateIntervalRef.current) {
      clearInterval(autoRotateIntervalRef.current);
      autoRotateIntervalRef.current = null;
    }
    
    return () => {
      if (autoRotateIntervalRef.current) {
        clearInterval(autoRotateIntervalRef.current);
      }
    };
  }, [isAutoRotating, imagesCount]);

  // التعامل مع وضع ملء الشاشة
  useEffect(() => {
    const handleFullScreenChange = () => {
      setIsFullScreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullScreenChange);
    
    return () => {
      document.removeEventListener('fullscreenchange', handleFullScreenChange);
    };
  }, []);

  // بدء السحب
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setStartX(e.clientX);
    setIsAutoRotating(false);
  };

  // بدء السحب (للأجهزة اللمسية)
  const handleTouchStart = (e: React.TouchEvent) => {
    setIsDragging(true);
    setStartX(e.touches[0].clientX);
    setIsAutoRotating(false);
  };

  // أثناء السحب
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    const deltaX = e.clientX - startX;
    
    // تحديد حركة الدوران بناءً على المسافة التي تم سحبها
    if (Math.abs(deltaX) > 5) {
      const step = Math.floor(Math.abs(deltaX) / 5);
      const direction = deltaX > 0 ? 1 : -1;
      
      setCurrentIndex(prev => {
        let newIndex = prev + (step * direction);
        
        // التأكد من أن المؤشر ضمن النطاق
        while (newIndex > imagesCount) newIndex -= imagesCount;
        while (newIndex < 1) newIndex += imagesCount;
        
        return newIndex;
      });
      
      setStartX(e.clientX);
    }
  };

  // أثناء السحب (للأجهزة اللمسية)
  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    const deltaX = e.touches[0].clientX - startX;
    
    if (Math.abs(deltaX) > 5) {
      const step = Math.floor(Math.abs(deltaX) / 5);
      const direction = deltaX > 0 ? 1 : -1;
      
      setCurrentIndex(prev => {
        let newIndex = prev + (step * direction);
        
        while (newIndex > imagesCount) newIndex -= imagesCount;
        while (newIndex < 1) newIndex += imagesCount;
        
        return newIndex;
      });
      
      setStartX(e.touches[0].clientX);
    }
  };

  // إنهاء السحب
  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // إنهاء السحب (للأجهزة اللمسية)
  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  // تبديل وضع الدوران التلقائي
  const toggleAutoRotate = () => {
    setIsAutoRotating(prev => !prev);
  };

  // تفعيل وضع ملء الشاشة
  const toggleFullScreen = () => {
    if (!viewerRef.current) return;
    
    if (!document.fullscreenElement) {
      viewerRef.current.requestFullscreen().catch(err => {
        console.error(`خطأ في تفعيل وضع ملء الشاشة: ${err.message}`);
      });
    } else {
      document.exitFullscreen();
    }
  };

  // زيادة مستوى التكبير
  const zoomIn = () => {
    setZoomLevel(prev => Math.min(prev + 0.2, 2.5));
  };

  // تقليل مستوى التكبير
  const zoomOut = () => {
    setZoomLevel(prev => Math.max(prev - 0.2, 1));
  };

  // مؤشر السحب
  const cursorStyle = isDragging ? 'cursor-grabbing' : 'cursor-grab';

  return (
    <div
      ref={viewerRef}
      className={`relative overflow-hidden rounded-lg border bg-background ${className} ${isFullScreen ? 'w-screen h-screen flex items-center justify-center' : 'w-full aspect-video'}`}
    >
      <div
        ref={containerRef}
        className={`relative w-full h-full flex items-center justify-center overflow-hidden ${cursorStyle}`}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div 
          style={{
            transform: `scale(${zoomLevel})`,
            transition: 'transform 0.2s ease'
          }}
        >
          <img
            src={getImagePath(currentIndex)}
            alt={`${carName} - ${t('car360Viewer.viewFromAngle')} ${currentIndex * 10}`}
            className="w-full max-h-full object-contain"
          />
        </div>
        
        {/* واجهة التحكم */}
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex items-center gap-2 p-2 bg-black/50 rounded-full">
          <Button
            variant="ghost"
            size="icon"
            className="w-8 h-8 text-white hover:bg-white/20"
            onClick={toggleAutoRotate}
            title={isAutoRotating ? t('car360Viewer.stopRotation') : t('car360Viewer.startRotation')}
          >
            <RefreshCw 
              className={`h-4 w-4 ${isAutoRotating ? 'animate-spin' : ''}`} 
            />
          </Button>
          
          <Button
            variant="ghost"
            size="icon"
            className="w-8 h-8 text-white hover:bg-white/20"
            onClick={zoomOut}
            disabled={zoomLevel <= 1}
            title={t('car360Viewer.zoomOut')}
          >
            <MinusCircle className="h-4 w-4" />
          </Button>
          
          <Button
            variant="ghost"
            size="icon"
            className="w-8 h-8 text-white hover:bg-white/20"
            onClick={zoomIn}
            disabled={zoomLevel >= 2.5}
            title={t('car360Viewer.zoomIn')}
          >
            <PlusCircle className="h-4 w-4" />
          </Button>
          
          {fullScreen && (
            <Button
              variant="ghost"
              size="icon"
              className="w-8 h-8 text-white hover:bg-white/20"
              onClick={toggleFullScreen}
              title={isFullScreen ? t('car360Viewer.exitFullScreen') : t('car360Viewer.enterFullScreen')}
            >
              <Maximize className="h-4 w-4" />
            </Button>
          )}
        </div>
        
        {/* مؤشر التقدم */}
        <div className="absolute bottom-0 left-0 w-full h-1 bg-gray-800">
          <div 
            className="h-full bg-primary"
            style={{ width: `${(currentIndex / imagesCount) * 100}%` }}
          />
        </div>
        
        {/* إرشادات استخدام المعرض 360 */}
        <div className="absolute top-4 left-4 bg-black/50 text-white text-xs px-3 py-1 rounded-full">
          {t('car360Viewer.dragToRotate')}
        </div>
      </div>
    </div>
  );
}