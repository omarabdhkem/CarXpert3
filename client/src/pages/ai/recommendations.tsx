import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, RefreshCw, ThumbsUp, ThumbsDown, AlertTriangle, CarFront } from 'lucide-react';
import { translations } from '@/i18n';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'wouter';

const t = translations.ar.ai;

interface RecommendedCar {
  id: number;
  title: string;
  price: number;
  imageUrl: string;
  year: number;
  model: string;
  make: string;
  mileage: number;
  bodyType: string;
  color: string;
  transmission: string;
  fuelType: string;
  score: number;
  matchReason: string;
}

interface RecommendationFilter {
  make?: string;
  bodyType?: string;
  priceRange?: { min: number; max: number };
  yearRange?: { min: number; max: number };
}

const RecommendationsPage: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeFilters, setActiveFilters] = useState<RecommendationFilter>({});
  const [showAllRecommendations, setShowAllRecommendations] = useState(false);

  const {
    data: recommendedCars,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ['/api/ai/recommendations', user?.id],
    queryFn: async () => {
      const response = await fetch('/api/ai/recommendations' + (user ? `?userId=${user.id}` : ''));
      if (!response.ok) {
        throw new Error('فشل في جلب التوصيات');
      }
      return response.json();
    },
    enabled: true,
  });

  // تطبيق المرشحات على التوصيات
  const filteredRecommendations = React.useMemo(() => {
    if (!recommendedCars) return [];

    return recommendedCars.filter((car: RecommendedCar) => {
      let matches = true;

      if (activeFilters.make && car.make !== activeFilters.make) {
        matches = false;
      }

      if (activeFilters.bodyType && car.bodyType !== activeFilters.bodyType) {
        matches = false;
      }

      if (
        activeFilters.priceRange &&
        (car.price < activeFilters.priceRange.min || car.price > activeFilters.priceRange.max)
      ) {
        matches = false;
      }

      if (
        activeFilters.yearRange &&
        (car.year < activeFilters.yearRange.min || car.year > activeFilters.yearRange.max)
      ) {
        matches = false;
      }

      return matches;
    });
  }, [recommendedCars, activeFilters]);

  // استخراج المرشحات المتاحة
  const availableFilters = React.useMemo(() => {
    if (!recommendedCars) return { makes: [], bodyTypes: [], priceRanges: [], yearRanges: [] };

    const makes = Array.from(new Set(recommendedCars.map((car: RecommendedCar) => car.make)));
    const bodyTypes = Array.from(new Set(recommendedCars.map((car: RecommendedCar) => car.bodyType)));
    
    const prices = recommendedCars.map((car: RecommendedCar) => car.price);
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    
    const years = recommendedCars.map((car: RecommendedCar) => car.year);
    const minYear = Math.min(...years);
    const maxYear = Math.max(...years);

    // تقسيم نطاقات الأسعار
    const priceRange = maxPrice - minPrice;
    const priceStep = Math.ceil(priceRange / 3);
    
    const priceRanges = [
      { min: minPrice, max: minPrice + priceStep, label: `${minPrice} - ${minPrice + priceStep}` },
      { min: minPrice + priceStep + 1, max: minPrice + 2 * priceStep, label: `${minPrice + priceStep + 1} - ${minPrice + 2 * priceStep}` },
      { min: minPrice + 2 * priceStep + 1, max: maxPrice, label: `${minPrice + 2 * priceStep + 1} - ${maxPrice}` },
    ];

    // نطاقات السنوات
    const yearRanges = [
      { min: minYear, max: maxYear, label: 'جميع السنوات' },
      { min: minYear, max: minYear + 3, label: `${minYear} - ${minYear + 3}` },
      { min: minYear + 4, max: maxYear, label: `${minYear + 4} - ${maxYear}` },
    ];

    return { makes, bodyTypes, priceRanges, yearRanges };
  }, [recommendedCars]);

  const handleFilterChange = (filterType: string, value: any) => {
    setActiveFilters((prev) => ({
      ...prev,
      [filterType]: value,
    }));
  };

  const clearFilters = () => {
    setActiveFilters({});
  };

  const handleFeedback = (carId: number, isPositive: boolean) => {
    if (!user) {
      toast({
        title: 'يرجى تسجيل الدخول',
        description: 'يجب تسجيل الدخول لإرسال التقييم',
        variant: 'destructive',
      });
      return;
    }

    // هنا يمكن إرسال التقييم إلى الخادم
    toast({
      title: 'تم إرسال التقييم',
      description: `شكراً لك! سنستخدم تقييمك لتحسين توصياتنا المستقبلية.`,
    });
  };

  // تحميل المزيد من التوصيات
  const displayedRecommendations = showAllRecommendations 
    ? filteredRecommendations 
    : filteredRecommendations.slice(0, 8);

  return (
    <div className="container mx-auto py-12 px-4">
      {/* العنوان الرئيسي */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center mb-12"
      >
        <h1 className="text-4xl font-bold mb-4">{t.recommendations_title}</h1>
        <p className="text-lg text-gray-600 max-w-3xl mx-auto">
          {user ? t.recommendations_description : 'سيارات قد تهمك بناءً على اتجاهات السوق الحالية'}
        </p>
      </motion.div>

      {/* قسم المرشحات */}
      {!isLoading && !isError && recommendedCars && recommendedCars.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mb-8"
        >
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xl flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-filter"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>
                تصفية التوصيات
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* ماركة السيارة */}
              <div>
                <label className="block text-sm font-medium mb-2">الماركة</label>
                <select
                  className="w-full p-2 border rounded-md"
                  value={activeFilters.make || ''}
                  onChange={(e) => handleFilterChange('make', e.target.value || undefined)}
                >
                  <option value="">جميع الماركات</option>
                  {availableFilters.makes.map((make) => (
                    <option key={make} value={make}>
                      {make}
                    </option>
                  ))}
                </select>
              </div>

              {/* نوع الهيكل */}
              <div>
                <label className="block text-sm font-medium mb-2">نوع الهيكل</label>
                <select
                  className="w-full p-2 border rounded-md"
                  value={activeFilters.bodyType || ''}
                  onChange={(e) => handleFilterChange('bodyType', e.target.value || undefined)}
                >
                  <option value="">جميع الأنواع</option>
                  {availableFilters.bodyTypes.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>

              {/* نطاق السعر */}
              <div>
                <label className="block text-sm font-medium mb-2">نطاق السعر</label>
                <select
                  className="w-full p-2 border rounded-md"
                  value={activeFilters.priceRange ? 'custom' : ''}
                  onChange={(e) => {
                    const selectedRange = availableFilters.priceRanges.find(
                      (range) => range.label === e.target.value
                    );
                    handleFilterChange('priceRange', selectedRange || undefined);
                  }}
                >
                  <option value="">جميع الأسعار</option>
                  {availableFilters.priceRanges.map((range) => (
                    <option key={range.label} value={range.label}>
                      {new Intl.NumberFormat('ar-SA', {
                        style: 'currency',
                        currency: 'SAR',
                        maximumFractionDigits: 0,
                      }).format(range.min)} - {' '}
                      {new Intl.NumberFormat('ar-SA', {
                        style: 'currency',
                        currency: 'SAR',
                        maximumFractionDigits: 0,
                      }).format(range.max)}
                    </option>
                  ))}
                </select>
              </div>

              {/* سنة الصنع */}
              <div>
                <label className="block text-sm font-medium mb-2">سنة الصنع</label>
                <select
                  className="w-full p-2 border rounded-md"
                  value={activeFilters.yearRange ? 'custom' : ''}
                  onChange={(e) => {
                    const selectedRange = availableFilters.yearRanges.find(
                      (range) => range.label === e.target.value
                    );
                    handleFilterChange('yearRange', selectedRange || undefined);
                  }}
                >
                  <option value="">جميع السنوات</option>
                  {availableFilters.yearRanges.map((range) => (
                    <option key={range.label} value={range.label}>
                      {range.label}
                    </option>
                  ))}
                </select>
              </div>
            </CardContent>
            <CardFooter className="flex justify-end bg-gray-50 border-t py-3">
              <Button variant="outline" onClick={clearFilters} className="mr-2">
                إعادة ضبط المرشحات
              </Button>
            </CardFooter>
          </Card>
        </motion.div>
      )}

      {/* حالات التحميل والخطأ */}
      {isLoading && (
        <div className="flex flex-col items-center justify-center py-12">
          <Loader2 className="h-12 w-12 text-primary animate-spin mb-4" />
          <h3 className="text-xl font-medium text-gray-700">{t.loading_recommendations}</h3>
        </div>
      )}

      {isError && (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <AlertTriangle className="h-12 w-12 text-red-500 mb-4" />
          <h3 className="text-xl font-medium text-gray-800 mb-2">{t.error_recommendations_title}</h3>
          <p className="text-gray-600 mb-6 max-w-md">{t.error_recommendations_description}</p>
          <Button onClick={() => refetch()} className="flex items-center gap-2">
            <RefreshCw className="h-4 w-4" />
            {t.try_again}
          </Button>
        </div>
      )}

      {/* قائمة السيارات الموصى بها */}
      {!isLoading && !isError && (
        <>
          {filteredRecommendations.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <CarFront className="h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-xl font-medium text-gray-800 mb-2">لا توجد سيارات تطابق المرشحات</h3>
              <p className="text-gray-600 mb-6">جرب تعديل معايير التصفية لرؤية المزيد من السيارات</p>
              <Button onClick={clearFilters} variant="outline">
                عرض جميع التوصيات
              </Button>
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">
                  {user ? t.personalized_recommendations : 'توصيات السيارات'}
                  <span className="text-sm font-normal text-gray-500 mr-2">
                    ({filteredRecommendations.length} سيارة)
                  </span>
                </h2>
                <Button onClick={() => refetch()} variant="outline" size="icon" title="تحديث التوصيات">
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {displayedRecommendations.map((car: RecommendedCar) => (
                  <Card key={car.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                    <div className="aspect-video overflow-hidden relative">
                      <img
                        src={car.imageUrl}
                        alt={car.title}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute top-2 right-2 bg-primary text-white text-xs font-bold px-2 py-1 rounded-full">
                        مطابقة {Math.round(car.score * 100)}%
                      </div>
                    </div>
                    <CardContent className="p-4">
                      <h3 className="font-medium text-lg mb-1 line-clamp-1">{car.title}</h3>
                      <p className="text-gray-700 text-sm mb-2">
                        {car.make} {car.model} {car.year}
                      </p>
                      
                      <div className="mb-3">
                        <span className="font-bold text-lg text-primary">
                          {new Intl.NumberFormat('ar-SA', {
                            style: 'currency',
                            currency: 'SAR',
                            maximumFractionDigits: 0,
                          }).format(car.price)}
                        </span>
                      </div>
                      
                      <div className="mb-3 text-xs border-r-2 border-primary pr-2 text-gray-600 italic">
                        {car.matchReason}
                      </div>
                      
                      <div className="grid grid-cols-2 gap-2 text-xs text-gray-500 mb-4">
                        <div>
                          <span className="font-medium">المسافة:</span> {car.mileage.toLocaleString()} كم
                        </div>
                        <div>
                          <span className="font-medium">ناقل الحركة:</span> {car.transmission}
                        </div>
                        <div>
                          <span className="font-medium">الوقود:</span> {car.fuelType}
                        </div>
                        <div>
                          <span className="font-medium">اللون:</span> {car.color}
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="p-4 pt-0 flex flex-col gap-2">
                      <Link href={`/cars/${car.id}`}>
                        <Button variant="default" className="w-full">
                          عرض التفاصيل
                        </Button>
                      </Link>
                      <div className="flex justify-between w-full mt-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleFeedback(car.id, true)}
                          className="flex-1 mr-2"
                        >
                          <ThumbsUp className="h-4 w-4 mr-1" /> مناسبة
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleFeedback(car.id, false)}
                          className="flex-1"
                        >
                          <ThumbsDown className="h-4 w-4 mr-1" /> غير مناسبة
                        </Button>
                      </div>
                    </CardFooter>
                  </Card>
                ))}
              </div>

              {/* زر عرض المزيد */}
              {filteredRecommendations.length > 8 && !showAllRecommendations && (
                <div className="flex justify-center mt-8">
                  <Button 
                    onClick={() => setShowAllRecommendations(true)}
                    variant="outline"
                    className="px-8"
                  >
                    عرض المزيد من السيارات
                  </Button>
                </div>
              )}
            </motion.div>
          )}
        </>
      )}
    </div>
  );
};

export default RecommendationsPage;