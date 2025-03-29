import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Check, RotateCw, ZoomIn, ZoomOut, Maximize2, X, Info, Download } from 'lucide-react';

export interface CarColor {
  id: string;
  name: string;
  colorCode: string;
  price?: number;
  image?: string;
  thumbnail?: string;
  description?: string;
  images?: {
    exterior?: string[];
    interior?: string[];
  };
  // الألوان المتوافقة مع الداخلية
  compatibleInteriors?: string[];
}

export interface InteriorColor {
  id: string;
  name: string;
  colorCode: string;
  price?: number;
  image?: string;
  thumbnail?: string;
  description?: string;
}

export interface CarColorConfiguratorProps {
  carName: string;
  carModel: string;
  exteriorColors: CarColor[];
  interiorColors?: InteriorColor[];
  exteriorAngles?: number;
  initialColor?: string;
  initialInteriorColor?: string;
  onColorChange?: (color: CarColor) => void;
  onInteriorColorChange?: (color: InteriorColor) => void;
  className?: string;
  currency?: string;
  allow360View?: boolean;
  allowZoom?: boolean;
  allowFullscreen?: boolean;
  basePrice?: number;
  onPriceChange?: (totalPrice: number) => void;
  modelPath?: string; // مسار نموذج السيارة الثلاثي الأبعاد
}

export function CarColorConfigurator({
  carName,
  carModel,
  exteriorColors,
  interiorColors = [],
  exteriorAngles = 8,
  initialColor,
  initialInteriorColor,
  onColorChange,
  onInteriorColorChange,
  className = '',
  currency = 'ريال',
  allow360View = true,
  allowZoom = true,
  allowFullscreen = true,
  basePrice = 0,
  onPriceChange,
  modelPath,
}: CarColorConfiguratorProps) {
  // الحالة الخاصة بالألوان والزوايا والتكبير
  const [selectedExteriorColor, setSelectedExteriorColor] = useState<CarColor>(
    initialColor ? exteriorColors.find(c => c.id === initialColor) || exteriorColors[0] : exteriorColors[0]
  );
  
  const [selectedInteriorColor, setSelectedInteriorColor] = useState<InteriorColor | null>(
    initialInteriorColor && interiorColors.length > 0 
      ? interiorColors.find(c => c.id === initialInteriorColor) || interiorColors[0] 
      : interiorColors.length > 0 ? interiorColors[0] : null
  );
  
  const [currentAngle, setCurrentAngle] = useState(0);
  const [isRotating, setIsRotating] = useState(false);
  const [rotationInterval, setRotationInterval] = useState<NodeJS.Timeout | null>(null);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showInterior, setShowInterior] = useState(false);
  const [showColorInfo, setShowColorInfo] = useState<string | null>(null);
  const [isPanning, setIsPanning] = useState(false);
  const [panPosition, setPanPosition] = useState({ x: 0, y: 0 });
  const [startPanPosition, setStartPanPosition] = useState({ x: 0, y: 0 });
  const [colorTransitionActive, setColorTransitionActive] = useState(false);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const imageContainerRef = useRef<HTMLDivElement>(null);
  
  // تحديث الأسعار عند تغيير الألوان
  useEffect(() => {
    if (onPriceChange) {
      const exteriorPrice = selectedExteriorColor?.price || 0;
      const interiorPrice = selectedInteriorColor?.price || 0;
      onPriceChange(basePrice + exteriorPrice + interiorPrice);
    }
  }, [selectedExteriorColor, selectedInteriorColor, basePrice, onPriceChange]);
  
  // استدعاء الـ callback عند تغيير الألوان
  useEffect(() => {
    if (onColorChange) {
      onColorChange(selectedExteriorColor);
    }
  }, [selectedExteriorColor, onColorChange]);
  
  useEffect(() => {
    if (onInteriorColorChange && selectedInteriorColor) {
      onInteriorColorChange(selectedInteriorColor);
    }
  }, [selectedInteriorColor, onInteriorColorChange]);
  
  // معالجة دوران الصورة 360 درجة
  useEffect(() => {
    if (isRotating && allow360View) {
      const interval = setInterval(() => {
        setCurrentAngle(prevAngle => (prevAngle + 1) % exteriorAngles);
      }, 100);
      setRotationInterval(interval);
    } else if (rotationInterval) {
      clearInterval(rotationInterval);
      setRotationInterval(null);
    }
    
    return () => {
      if (rotationInterval) {
        clearInterval(rotationInterval);
      }
    };
  }, [isRotating, exteriorAngles, allow360View]);
  
  // معالجة التكبير/التصغير بعجلة الفأرة
  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      if (!allowZoom) return;
      
      e.preventDefault();
      const delta = e.deltaY > 0 ? -0.1 : 0.1;
      setZoomLevel(prevZoom => {
        const newZoom = prevZoom + delta;
        return Math.max(0.5, Math.min(newZoom, 3));
      });
    };
    
    const imageContainer = imageContainerRef.current;
    if (imageContainer) {
      imageContainer.addEventListener('wheel', handleWheel);
    }
    
    return () => {
      if (imageContainer) {
        imageContainer.removeEventListener('wheel', handleWheel);
      }
    };
  }, [allowZoom]);
  
  // التعامل مع وضع ملء الشاشة
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);
  
  // انتقال لرؤية لون جديد
  const handleColorChange = (color: CarColor) => {
    setColorTransitionActive(true);
    setTimeout(() => {
      setSelectedExteriorColor(color);
      setTimeout(() => {
        setColorTransitionActive(false);
      }, 300);
    }, 300);
  };
  
  // التبديل للداخلية
  const toggleInterior = () => {
    setShowInterior(!showInterior);
    setCurrentAngle(0); // إعادة تعيين الزاوية عند التبديل
  };
  
  // وضع ملء الشاشة
  const toggleFullscreen = () => {
    if (!allowFullscreen) return;
    
    if (!isFullscreen) {
      containerRef.current?.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  };
  
  // التعامل مع التحريك (panning)
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (zoomLevel <= 1) return;
    
    setIsPanning(true);
    setStartPanPosition({
      x: e.clientX - panPosition.x,
      y: e.clientY - panPosition.y
    });
  };
  
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isPanning || zoomLevel <= 1) return;
    
    const maxPanX = (zoomLevel - 1) * 100;
    const maxPanY = (zoomLevel - 1) * 100;
    
    setPanPosition({
      x: Math.max(-maxPanX, Math.min(e.clientX - startPanPosition.x, maxPanX)),
      y: Math.max(-maxPanY, Math.min(e.clientY - startPanPosition.y, maxPanY))
    });
  };
  
  const handleMouseUp = () => {
    setIsPanning(false);
  };
  
  const handleMouseLeave = () => {
    setIsPanning(false);
  };
  
  // تعيين زاوية محددة
  const setSpecificAngle = (angle: number) => {
    if (isRotating) {
      setIsRotating(false);
    }
    setCurrentAngle(angle % exteriorAngles);
  };
  
  // الحصول على الصورة الحالية بناءً على الزاوية واللون المختار
  const getCurrentImage = () => {
    if (showInterior) {
      return selectedExteriorColor.images?.interior?.[0] || '';
    }
    
    // استخدام الصورة المناسبة بناءً على الزاوية
    return selectedExteriorColor.images?.exterior?.[currentAngle] || '';
  };
  
  // تنسيق السعر
  const formatPrice = (price: number) => {
    return `${price.toLocaleString('ar-SA')} ${currency}`;
  };
  
  // حساب السعر الإجمالي
  const getTotalPrice = () => {
    const exteriorPrice = selectedExteriorColor?.price || 0;
    const interiorPrice = selectedInteriorColor?.price || 0;
    return basePrice + exteriorPrice + interiorPrice;
  };
  
  // تحقق من التوافق بين الألوان الخارجية والداخلية
  const isInteriorCompatible = (interiorColor: InteriorColor) => {
    if (!selectedExteriorColor.compatibleInteriors) return true;
    return selectedExteriorColor.compatibleInteriors.includes(interiorColor.id);
  };
  
  // الألوان المتوافقة فقط للعرض
  const compatibleInteriors = interiorColors.filter(isInteriorCompatible);
  
  return (
    <div 
      ref={containerRef} 
      className={`relative overflow-hidden rounded-lg bg-white shadow ${className}`}
    >
      {/* عرض الصورة مع التكبير والدوران */}
      <div
        ref={imageContainerRef}
        className="relative overflow-hidden h-[400px] md:h-[500px] lg:h-[600px] bg-gray-100"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
      >
        <motion.div
          initial={{ opacity: 1 }}
          animate={{ 
            opacity: colorTransitionActive ? 0 : 1,
            scale: zoomLevel,
            x: panPosition.x,
            y: panPosition.y
          }}
          transition={{ duration: 0.3 }}
          className="w-full h-full flex items-center justify-center"
          style={{ 
            cursor: isPanning ? 'grabbing' : zoomLevel > 1 ? 'grab' : 'default',
          }}
        >
          {/* صورة السيارة */}
          {getCurrentImage() && (
            <img
              src={getCurrentImage()}
              alt={`${carName} ${carModel} - ${selectedExteriorColor.name} ${showInterior ? 'داخلية' : ''}`}
              className="max-w-full max-h-full object-contain select-none"
              draggable={false}
            />
          )}
        </motion.div>
        
        {/* شريط التحكم بالصورة */}
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex items-center bg-white/80 backdrop-blur-sm rounded-full px-3 py-1.5 shadow-md">
          {/* زر الدوران */}
          {allow360View && (
            <button
              onClick={() => setIsRotating(!isRotating)}
              className={`p-2 rounded-full ${isRotating ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-100'}`}
              title={isRotating ? 'إيقاف الدوران' : 'تدوير 360 درجة'}
            >
              <RotateCw className="w-5 h-5" />
            </button>
          )}
          
          {/* زر التكبير */}
          {allowZoom && (
            <button
              onClick={() => setZoomLevel(prevZoom => Math.min(prevZoom + 0.2, 3))}
              className="p-2 rounded-full hover:bg-gray-100"
              disabled={zoomLevel >= 3}
              title="تكبير"
            >
              <ZoomIn className="w-5 h-5" />
            </button>
          )}
          
          {/* زر التصغير */}
          {allowZoom && (
            <button
              onClick={() => setZoomLevel(prevZoom => Math.max(prevZoom - 0.2, 0.5))}
              className="p-2 rounded-full hover:bg-gray-100"
              disabled={zoomLevel <= 0.5}
              title="تصغير"
            >
              <ZoomOut className="w-5 h-5" />
            </button>
          )}
          
          {/* زر ملء الشاشة */}
          {allowFullscreen && (
            <button
              onClick={toggleFullscreen}
              className="p-2 rounded-full hover:bg-gray-100"
              title={isFullscreen ? 'الخروج من وضع ملء الشاشة' : 'ملء الشاشة'}
            >
              <Maximize2 className="w-5 h-5" />
            </button>
          )}
          
          {/* زر التبديل للداخلية إذا كانت متاحة */}
          {selectedExteriorColor.images?.interior && selectedExteriorColor.images.interior.length > 0 && (
            <button
              onClick={toggleInterior}
              className={`p-2 rounded-full ${showInterior ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-100'}`}
              title={showInterior ? 'عرض الخارجية' : 'عرض الداخلية'}
            >
              {showInterior ? 'الخارجية' : 'الداخلية'}
            </button>
          )}
        </div>
        
        {/* مؤشر الزاوية الحالية */}
        {allow360View && !showInterior && (
          <div className="absolute bottom-16 left-1/2 transform -translate-x-1/2 bg-white/80 backdrop-blur-sm rounded-full px-4 py-1 shadow-md">
            <div className="flex items-center space-x-1 space-x-reverse">
              {Array.from({ length: exteriorAngles }).map((_, index) => (
                <button
                  key={index}
                  onClick={() => setSpecificAngle(index)}
                  className={`w-2 h-2 rounded-full transition-all ${
                    currentAngle === index ? 'bg-blue-600 w-4' : 'bg-gray-400 hover:bg-gray-600'
                  }`}
                  title={`زاوية ${index + 1}`}
                />
              ))}
            </div>
          </div>
        )}
      </div>
      
      {/* قسم اختيار اللون */}
      <div className="p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <div>
            <h3 className="text-xl font-bold text-gray-900">{carName} {carModel}</h3>
            <p className="text-gray-500">اختر لون السيارة المفضل لديك</p>
          </div>
          
          <div className="mt-2 md:mt-0 text-left">
            <span className="text-sm text-gray-500">السعر</span>
            <p className="text-2xl font-bold text-gray-900">{formatPrice(getTotalPrice())}</p>
          </div>
        </div>
        
        {/* اختيار اللون الخارجي */}
        <div className="mb-6">
          <h4 className="text-lg font-medium text-gray-900 mb-3">اللون الخارجي</h4>
          <div className="flex flex-wrap gap-3">
            {exteriorColors.map((color) => (
              <div key={color.id} className="relative">
                <button
                  onClick={() => handleColorChange(color)}
                  className={`w-12 h-12 rounded-full border-2 transition-all ${
                    selectedExteriorColor.id === color.id
                      ? 'border-blue-600 ring-2 ring-blue-300'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  style={{ backgroundColor: color.colorCode }}
                  title={color.name}
                >
                  {/* أيقونة الاختيار */}
                  {selectedExteriorColor.id === color.id && (
                    <Check className="absolute inset-0 m-auto text-white drop-shadow-md w-6 h-6" />
                  )}
                </button>
                
                {/* زر معلومات اللون */}
                <button
                  onClick={() => setShowColorInfo(showColorInfo === color.id ? null : color.id)}
                  className="absolute -top-1 -right-1 bg-white rounded-full border border-gray-200 w-5 h-5 flex items-center justify-center"
                >
                  <Info className="w-3 h-3 text-gray-500" />
                </button>
                
                {/* معلومات اللون */}
                {showColorInfo === color.id && (
                  <div className="absolute z-10 top-full mt-2 right-0 w-48 bg-white shadow-lg rounded-lg p-3 text-right">
                    <div className="flex justify-between items-center mb-2">
                      <button
                        onClick={() => setShowColorInfo(null)}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        <X className="w-4 h-4" />
                      </button>
                      <h5 className="font-medium">{color.name}</h5>
                    </div>
                    {color.description && (
                      <p className="text-sm text-gray-600 mb-2">{color.description}</p>
                    )}
                    {color.price ? (
                      <p className="text-sm font-medium">
                        + {formatPrice(color.price)}
                      </p>
                    ) : (
                      <p className="text-sm text-green-600 font-medium">مجاناً</p>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
          
          {/* اسم اللون المختار والسعر */}
          <div className="flex justify-between items-center mt-3">
            <p className="text-sm font-medium">{selectedExteriorColor.name}</p>
            {selectedExteriorColor.price ? (
              <p className="text-sm text-gray-600">+ {formatPrice(selectedExteriorColor.price)}</p>
            ) : (
              <p className="text-sm text-green-600">مجاناً</p>
            )}
          </div>
        </div>
        
        {/* اختيار لون الداخلية */}
        {interiorColors.length > 0 && (
          <div className="mb-6">
            <h4 className="text-lg font-medium text-gray-900 mb-3">اللون الداخلي</h4>
            <div className="flex flex-wrap gap-3">
              {interiorColors.map((color) => (
                <div key={color.id} className="relative">
                  <button
                    onClick={() => setSelectedInteriorColor(color)}
                    className={`w-12 h-12 rounded-full border-2 transition-all ${
                      selectedInteriorColor?.id === color.id
                        ? 'border-blue-600 ring-2 ring-blue-300'
                        : 'border-gray-200 hover:border-gray-300'
                    } ${!isInteriorCompatible(color) ? 'opacity-40' : ''}`}
                    style={{ backgroundColor: color.colorCode }}
                    title={color.name}
                    disabled={!isInteriorCompatible(color)}
                  >
                    {/* أيقونة الاختيار */}
                    {selectedInteriorColor?.id === color.id && (
                      <Check className="absolute inset-0 m-auto text-white drop-shadow-md w-6 h-6" />
                    )}
                  </button>
                  
                  {/* زر معلومات اللون */}
                  <button
                    onClick={() => setShowColorInfo(showColorInfo === color.id ? null : color.id)}
                    className="absolute -top-1 -right-1 bg-white rounded-full border border-gray-200 w-5 h-5 flex items-center justify-center"
                  >
                    <Info className="w-3 h-3 text-gray-500" />
                  </button>
                  
                  {/* معلومات اللون */}
                  {showColorInfo === color.id && (
                    <div className="absolute z-10 top-full mt-2 right-0 w-48 bg-white shadow-lg rounded-lg p-3 text-right">
                      <div className="flex justify-between items-center mb-2">
                        <button
                          onClick={() => setShowColorInfo(null)}
                          className="text-gray-400 hover:text-gray-600"
                        >
                          <X className="w-4 h-4" />
                        </button>
                        <h5 className="font-medium">{color.name}</h5>
                      </div>
                      {color.description && (
                        <p className="text-sm text-gray-600 mb-2">{color.description}</p>
                      )}
                      {!isInteriorCompatible(color) && (
                        <p className="text-xs text-amber-600 mb-2">
                          غير متوافق مع اللون الخارجي المختار
                        </p>
                      )}
                      {color.price ? (
                        <p className="text-sm font-medium">
                          + {formatPrice(color.price)}
                        </p>
                      ) : (
                        <p className="text-sm text-green-600 font-medium">مجاناً</p>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
            
            {/* اسم اللون الداخلي المختار والسعر */}
            {selectedInteriorColor && (
              <div className="flex justify-between items-center mt-3">
                <p className="text-sm font-medium">{selectedInteriorColor.name}</p>
                {selectedInteriorColor.price ? (
                  <p className="text-sm text-gray-600">+ {formatPrice(selectedInteriorColor.price)}</p>
                ) : (
                  <p className="text-sm text-green-600">مجاناً</p>
                )}
              </div>
            )}
          </div>
        )}
        
        {/* زر تحميل الصورة */}
        <div className="flex justify-end">
          <button
            onClick={() => {
              const link = document.createElement('a');
              link.href = getCurrentImage();
              link.download = `${carName}-${carModel}-${selectedExteriorColor.name}.jpg`;
              link.click();
            }}
            className="flex items-center text-blue-600 hover:text-blue-800"
          >
            <Download className="w-4 h-4 ml-1" />
            <span className="text-sm">تحميل الصورة</span>
          </button>
        </div>
      </div>
    </div>
  );
}

// مكون مصغر لاختيار اللون مع عرض حقيقي للسيارة
export function CompactCarColorSelector({
  colors,
  selectedColor,
  onChange,
  className = '',
}: {
  colors: CarColor[];
  selectedColor: string;
  onChange: (colorId: string) => void;
  className?: string;
}) {
  return (
    <div className={`p-4 bg-white rounded-lg shadow-sm ${className}`}>
      <h3 className="text-sm font-medium text-gray-900 mb-3">اختر اللون</h3>
      <div className="flex flex-wrap gap-2">
        {colors.map((color) => (
          <button
            key={color.id}
            onClick={() => onChange(color.id)}
            className={`w-8 h-8 rounded-full border-2 transition-all ${
              selectedColor === color.id
                ? 'border-blue-600 ring-2 ring-blue-300'
                : 'border-gray-200 hover:border-gray-300'
            }`}
            style={{ backgroundColor: color.colorCode }}
            title={color.name}
          >
            {/* أيقونة الاختيار */}
            {selectedColor === color.id && (
              <Check className="text-white drop-shadow-md w-4 h-4 m-auto" />
            )}
          </button>
        ))}
      </div>
    </div>
  );
}