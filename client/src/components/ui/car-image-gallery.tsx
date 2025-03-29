import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Maximize2, X, ZoomIn, ZoomOut } from 'lucide-react';

interface CarImageGalleryProps {
  images: string[];
  title?: string;
}

export function CarImageGallery({ images, title }: CarImageGalleryProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [position, setPosition] = useState({ x: 0, y: 0 });

  // تأكد من وجود صور على الأقل
  const safeImages = images && images.length > 0 ? images : [
    'https://via.placeholder.com/600x400?text=لا+توجد+صورة',
  ];

  // إعادة تعيين الزوم والموضع عند تغيير الصورة
  useEffect(() => {
    setZoomLevel(1);
    setPosition({ x: 0, y: 0 });
  }, [currentIndex]);

  // التنقل بين الصور
  const goToPrevious = () => {
    setCurrentIndex(prev => (prev === 0 ? safeImages.length - 1 : prev - 1));
  };

  const goToNext = () => {
    setCurrentIndex(prev => (prev === safeImages.length - 1 ? 0 : prev + 1));
  };

  // التكبير والتصغير
  const zoomIn = () => {
    setZoomLevel(prev => Math.min(prev + 0.5, 3));
  };

  const zoomOut = () => {
    setZoomLevel(prev => Math.max(prev - 0.5, 1));
  };

  // التبديل بين العرض الكامل والعادي
  const toggleFullscreen = () => {
    setIsFullscreen(prev => !prev);
    setZoomLevel(1);
    setPosition({ x: 0, y: 0 });
  };

  // معالجة التمرير باللمس أو الماوس
  const handleMouseDown = (e: React.MouseEvent) => {
    if (zoomLevel > 1) {
      setIsDragging(true);
      setDragStart({ x: e.clientX, y: e.clientY });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging && zoomLevel > 1) {
      const deltaX = e.clientX - dragStart.x;
      const deltaY = e.clientY - dragStart.y;
      setPosition({
        x: position.x + deltaX,
        y: position.y + deltaY
      });
      setDragStart({ x: e.clientX, y: e.clientY });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // مؤثرات التحويل للصور المكبرة
  const getTransformStyle = () => {
    return {
      transform: `scale(${zoomLevel}) translate(${position.x / zoomLevel}px, ${position.y / zoomLevel}px)`,
      cursor: zoomLevel > 1 ? 'grab' : 'auto',
      transition: isDragging ? 'none' : 'transform 0.2s ease-out'
    };
  };

  // عنصر المعرض بالحجم العادي
  const regularGallery = (
    <div className="w-full rounded-xl overflow-hidden bg-gray-100">
      <div className="relative">
        {/* الصورة الرئيسية */}
        <div 
          className="w-full relative overflow-hidden bg-white aspect-video flex items-center justify-center"
          style={{ height: '400px' }}
        >
          <img
            src={safeImages[currentIndex]}
            alt={title ? `${title} - صورة ${currentIndex + 1}` : `صورة ${currentIndex + 1}`}
            className="max-w-full max-h-full object-contain"
          />
        </div>

        {/* أزرار التنقل */}
        <button
          onClick={goToPrevious}
          className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-gray-800 p-2 rounded-full shadow-md transition-all"
          aria-label="الصورة السابقة"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>

        <button
          onClick={goToNext}
          className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-gray-800 p-2 rounded-full shadow-md transition-all"
          aria-label="الصورة التالية"
        >
          <ChevronRight className="h-5 w-5" />
        </button>

        {/* زر العرض بملء الشاشة */}
        <button
          onClick={toggleFullscreen}
          className="absolute bottom-2 left-2 bg-white/80 hover:bg-white text-gray-800 p-2 rounded-full shadow-md transition-all"
          aria-label="عرض بملء الشاشة"
        >
          <Maximize2 className="h-5 w-5" />
        </button>
      </div>

      {/* الصور المصغرة */}
      {safeImages.length > 1 && (
        <div className="flex p-2 gap-2 overflow-x-auto">
          {safeImages.map((image, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`flex-shrink-0 w-20 h-20 rounded-md overflow-hidden transition-all ${
                index === currentIndex ? 'ring-2 ring-primary' : 'opacity-70 hover:opacity-100'
              }`}
            >
              <img
                src={image}
                alt={`صورة مصغرة ${index + 1}`}
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );

  // عنصر المعرض بالحجم الكامل
  const fullscreenGallery = (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-90 flex items-center justify-center">
      <div className="relative w-full h-full flex flex-col">
        {/* شريط العنوان */}
        <div className="p-4 flex justify-between items-center text-white">
          <h3 className="text-lg font-medium">
            {title ? `${title} - صورة ${currentIndex + 1} من ${safeImages.length}` : `صورة ${currentIndex + 1} من ${safeImages.length}`}
          </h3>
          <div className="flex items-center gap-2">
            <button
              onClick={zoomIn}
              className="p-2 rounded-full hover:bg-gray-800 transition-colors"
              aria-label="تكبير"
              disabled={zoomLevel >= 3}
            >
              <ZoomIn className="h-5 w-5" />
            </button>
            <button
              onClick={zoomOut}
              className="p-2 rounded-full hover:bg-gray-800 transition-colors"
              aria-label="تصغير"
              disabled={zoomLevel <= 1}
            >
              <ZoomOut className="h-5 w-5" />
            </button>
            <button
              onClick={toggleFullscreen}
              className="p-2 rounded-full hover:bg-gray-800 transition-colors"
              aria-label="إغلاق العرض الكامل"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* الصورة الرئيسية */}
        <div 
          className="flex-grow overflow-hidden bg-black flex items-center justify-center"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          <img
            src={safeImages[currentIndex]}
            alt={title ? `${title} - صورة ${currentIndex + 1}` : `صورة ${currentIndex + 1}`}
            className="max-w-full max-h-full object-contain"
            style={getTransformStyle()}
            draggable="false"
          />
        </div>

        {/* أزرار التنقل */}
        <button
          onClick={goToPrevious}
          className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-3 rounded-full transition-all"
          aria-label="الصورة السابقة"
        >
          <ChevronLeft className="h-6 w-6" />
        </button>

        <button
          onClick={goToNext}
          className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-3 rounded-full transition-all"
          aria-label="الصورة التالية"
        >
          <ChevronRight className="h-6 w-6" />
        </button>

        {/* شريط الصور المصغرة */}
        {safeImages.length > 1 && (
          <div className="p-4 bg-black bg-opacity-50">
            <div className="flex justify-center gap-2 overflow-x-auto py-2">
              {safeImages.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  className={`flex-shrink-0 w-16 h-16 rounded-md overflow-hidden transition-all ${
                    index === currentIndex ? 'ring-2 ring-white' : 'opacity-50 hover:opacity-100'
                  }`}
                >
                  <img
                    src={image}
                    alt={`صورة مصغرة ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <>
      {regularGallery}
      {isFullscreen && fullscreenGallery}
    </>
  );
}