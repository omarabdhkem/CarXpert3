import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'wouter';
import AnimatedButton from '@/components/ui/animated-button';
import { Card, CardContent } from '@/components/ui/card';
import { translations } from '@/i18n';

// الترجمات
const t = translations.ar;

// نموذج بيانات السيارة للمقارنة
interface CarForComparison {
  id: number;
  title: string;
  year: number;
  price: number;
  image?: string;
  engine?: string;
  power?: string;
  transmission?: string;
  acceleration?: string;
  topSpeed?: string;
  fuelConsumption?: string;
  fuelType?: string;
  bodyType?: string;
  seatsCount?: number;
  trunkSpace?: string;
  length?: number;
  width?: number;
  height?: number;
  wheelbase?: number;
  safetyRating?: number;
  features?: string[];
}

interface CarComparisonProps {
  cars: CarForComparison[];
  onRemoveCar?: (carId: number) => void;
  onAddCar?: () => void;
  className?: string;
  maxCars?: number;
}

export default function CarComparison({
  cars = [],
  onRemoveCar,
  onAddCar,
  className = '',
  maxCars = 3,
}: CarComparisonProps) {
  const [expandedSection, setExpandedSection] = useState<string | null>('basic');
  
  // التحقق من خلية المقارنة فارغة
  const isEmptySlot = (index: number) => index >= cars.length;
  
  // توسيع/طي قسم معين
  const toggleSection = (section: string) => {
    if (expandedSection === section) {
      setExpandedSection(null);
    } else {
      setExpandedSection(section);
    }
  };
  
  // تحديد لون الخلية بناءً على القيمة
  const getCellBackground = (values: any[], index: number) => {
    if (isEmptySlot(index) || cars.length <= 1) return '';
    
    const allValues = values.filter(v => v !== undefined && v !== null);
    if (allValues.length <= 1) return '';
    
    if (typeof values[index] === 'number') {
      // للقيم الرقمية، تحديد إذا كانت أعلى (أخضر) أو أقل (أحمر)
      const isHigherBetter = ['power', 'topSpeed', 'trunkSpace', 'seatsCount', 'safetyRating'].some(
        prop => prop in cars[index]
      );
      const isLowerBetter = ['price', 'acceleration', 'fuelConsumption'].some(prop => prop in cars[index]);
      
      if (isHigherBetter) {
        const maxValue = Math.max(...allValues as number[]);
        return values[index] === maxValue ? 'bg-green-50' : '';
      }
      
      if (isLowerBetter) {
        const minValue = Math.min(...allValues as number[]);
        return values[index] === minValue ? 'bg-green-50' : '';
      }
    }
    
    return '';
  };
  
  // تحديد الأقسام والخصائص
  const sections = [
    {
      id: 'basic',
      title: 'المعلومات الأساسية',
      properties: [
        { key: 'year', label: 'سنة الصنع' },
        { key: 'price', label: 'السعر (ريال)', format: (v: number) => v.toLocaleString() },
      ],
    },
    {
      id: 'engine',
      title: 'المحرك والأداء',
      properties: [
        { key: 'engine', label: 'المحرك' },
        { key: 'power', label: 'القوة' },
        { key: 'transmission', label: 'ناقل الحركة' },
        { key: 'acceleration', label: 'التسارع (0-100 كم/س)' },
        { key: 'topSpeed', label: 'السرعة القصوى' },
        { key: 'fuelConsumption', label: 'استهلاك الوقود' },
        { key: 'fuelType', label: 'نوع الوقود' },
      ],
    },
    {
      id: 'dimensions',
      title: 'الأبعاد والمساحة',
      properties: [
        { key: 'bodyType', label: 'نوع الهيكل' },
        { key: 'seatsCount', label: 'عدد المقاعد' },
        { key: 'trunkSpace', label: 'مساحة الصندوق' },
        { key: 'length', label: 'الطول (مم)', format: (v: number) => v.toLocaleString() },
        { key: 'width', label: 'العرض (مم)', format: (v: number) => v.toLocaleString() },
        { key: 'height', label: 'الارتفاع (مم)', format: (v: number) => v.toLocaleString() },
        { key: 'wheelbase', label: 'قاعدة العجلات (مم)', format: (v: number) => v.toLocaleString() },
      ],
    },
    {
      id: 'safety',
      title: 'السلامة والميزات',
      properties: [
        { key: 'safetyRating', label: 'تقييم السلامة', format: (v: number) => `${v}/5` },
      ],
    },
  ];
  
  return (
    <div className={`${className}`}>
      <Card>
        <CardContent className="p-6">
          <h2 className="text-xl font-bold mb-6">مقارنة السيارات</h2>
          
          <div className="overflow-x-auto">
            <div className="min-w-max">
              {/* صور وعناوين السيارات */}
              <div className="grid grid-cols-4 gap-4 mb-6">
                <div className="col-span-1 pr-4">
                  {/* عنصر فارغ للمحاذاة مع العناوين */}
                </div>
                {Array.from({ length: maxCars }).map((_, index) => (
                  <div key={index} className="col-span-1 relative">
                    {isEmptySlot(index) ? (
                      <div 
                        className="h-36 bg-gray-100 rounded-lg flex flex-col items-center justify-center p-4 cursor-pointer hover:bg-gray-200 transition-colors"
                        onClick={onAddCar}
                      >
                        <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center mb-2">
                          <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                          </svg>
                        </div>
                        <span className="text-sm text-gray-500 text-center">إضافة سيارة للمقارنة</span>
                      </div>
                    ) : (
                      <div className="relative h-36 bg-gray-100 rounded-lg overflow-hidden">
                        {cars[index].image ? (
                          <img src={cars[index].image} alt={cars[index].title} className="w-full h-full object-cover" />
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center text-gray-500">
                            <span>{cars[index].title}</span>
                          </div>
                        )}
                        {onRemoveCar && (
                          <button 
                            onClick={() => onRemoveCar(cars[index].id)}
                            className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        )}
                        <div className="absolute bottom-0 inset-x-0 bg-black/50 py-2 px-3">
                          <Link href={`/cars/${cars[index].id}`}>
                            <a className="text-white text-sm font-medium hover:underline">
                              {cars[index].title}
                            </a>
                          </Link>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
              
              {/* أقسام المقارنة */}
              {sections.map((section) => (
                <div key={section.id} className="mb-4 border rounded-lg overflow-hidden">
                  <button
                    className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 transition-colors"
                    onClick={() => toggleSection(section.id)}
                  >
                    <span className="font-medium">{section.title}</span>
                    <svg
                      className={`w-5 h-5 transition-transform ${expandedSection === section.id ? 'rotate-180' : ''}`}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  
                  <AnimatePresence>
                    {expandedSection === section.id && (
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: 'auto' }}
                        exit={{ height: 0 }}
                        transition={{ duration: 0.3 }}
                        className="overflow-hidden"
                      >
                        <div className="p-4">
                          <table className="w-full border-collapse">
                            <tbody>
                              {section.properties.map((prop) => {
                                // استخراج قيم الخاصية من السيارات
                                const values = Array.from({ length: maxCars }).map((_, i) => 
                                  !isEmptySlot(i) ? (cars[i] as any)[prop.key] : undefined
                                );
                                
                                return (
                                  <tr key={prop.key} className="border-b last:border-b-0">
                                    <td className="p-3 text-sm font-medium text-gray-700">{prop.label}</td>
                                    {values.map((value, i) => (
                                      <td 
                                        key={i} 
                                        className={`p-3 text-center ${getCellBackground(values, i)}`}
                                      >
                                        {!isEmptySlot(i) && value !== undefined ? (
                                          prop.format ? prop.format(value) : value
                                        ) : (
                                          <span className="text-gray-400">-</span>
                                        )}
                                      </td>
                                    ))}
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
              
              {/* قسم الميزات */}
              {cars.some(car => car.features && car.features.length > 0) && (
                <div className="mb-4 border rounded-lg overflow-hidden">
                  <button
                    className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 transition-colors"
                    onClick={() => toggleSection('features')}
                  >
                    <span className="font-medium">التجهيزات والميزات</span>
                    <svg
                      className={`w-5 h-5 transition-transform ${expandedSection === 'features' ? 'rotate-180' : ''}`}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  
                  <AnimatePresence>
                    {expandedSection === 'features' && (
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: 'auto' }}
                        exit={{ height: 0 }}
                        transition={{ duration: 0.3 }}
                        className="overflow-hidden"
                      >
                        <div className="p-4">
                          <table className="w-full border-collapse">
                            <tbody>
                              {/* تجميع كل الميزات من جميع السيارات */}
                              {Array.from(new Set(cars.flatMap(car => car.features || []))).map((feature, index) => {
                                return (
                                  <tr key={index} className="border-b last:border-b-0">
                                    <td className="p-3 text-sm font-medium text-gray-700">{feature}</td>
                                    {Array.from({ length: maxCars }).map((_, i) => (
                                      <td key={i} className="p-3 text-center">
                                        {!isEmptySlot(i) && cars[i].features?.includes(feature) ? (
                                          <svg className="w-5 h-5 mx-auto text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                          </svg>
                                        ) : (
                                          <svg className="w-5 h-5 mx-auto text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                          </svg>
                                        )}
                                      </td>
                                    ))}
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}
            </div>
          </div>
          
          {/* أزرار الإجراءات */}
          <div className="flex justify-end mt-6 space-x-4 space-x-reverse">
            <AnimatedButton 
              variant="outline" 
              size="sm" 
              onClick={onAddCar}
              disabled={cars.length >= maxCars}
            >
              إضافة سيارة
            </AnimatedButton>
            <AnimatedButton 
              variant="primary" 
              size="sm"
              onClick={() => window.print()}
            >
              طباعة المقارنة
            </AnimatedButton>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}