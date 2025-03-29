import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, AlertTriangle, PlusCircle, CheckCircle2, XCircle, HelpCircle } from 'lucide-react';
import { translations } from '@/i18n';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'wouter';

const t = translations.ar.ai;

interface Car {
  id: number;
  title: string;
  make: string;
  model: string;
  year: number;
  mileage: number;
  price: number;
  imageUrl: string;
  transmission: string;
  fuelType: string;
  color: string;
  bodyType: string;
  engineSize: number;
  horsepower: number;
  features: string[];
}

interface ComparisonItem {
  car: Car;
  advantages: string[];
  disadvantages: string[];
  score: number;
  valueScore: number;
}

interface ComparisonResult {
  items: ComparisonItem[];
  recommendation: string;
  comparison: {
    [key: string]: {
      label: string;
      values: { [carId: number]: any };
      winner: number | null;
    };
  };
}

const AICarComparisonPage: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedCars, setSelectedCars] = useState<number[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showCarsDropdown, setShowCarsDropdown] = useState(false);
  const [userPreference, setUserPreference] = useState('');

  // استعلام للحصول على قائمة السيارات
  const { data: availableCars, isLoading: isLoadingCars } = useQuery({
    queryKey: ['/api/cars', searchTerm],
    queryFn: async () => {
      const response = await fetch(`/api/cars?search=${searchTerm}`);
      if (!response.ok) {
        throw new Error('فشل في جلب قائمة السيارات');
      }
      return response.json();
    },
    enabled: searchTerm.length > 2 || showCarsDropdown,
  });

  // استعلام للحصول على نتائج المقارنة
  const {
    data: comparisonResults,
    isLoading: isComparing,
    isError,
    refetch: fetchComparison,
  } = useQuery({
    queryKey: ['/api/ai/car-comparison', selectedCars, userPreference],
    queryFn: async () => {
      const response = await fetch('/api/ai/car-comparison', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          carIds: selectedCars,
          userPreference: userPreference || undefined,
          userId: user?.id
        }),
      });
      
      if (!response.ok) {
        throw new Error('فشل في جلب نتائج المقارنة');
      }
      
      return response.json();
    },
    enabled: selectedCars.length >= 2,
    refetchOnWindowFocus: false,
  });

  // إضافة سيارة للمقارنة
  const addCarToComparison = (carId: number) => {
    if (selectedCars.includes(carId)) {
      toast({
        title: 'السيارة موجودة بالفعل',
        description: 'هذه السيارة مضافة بالفعل إلى المقارنة',
        variant: 'destructive',
      });
      return;
    }

    if (selectedCars.length >= 4) {
      toast({
        title: 'الحد الأقصى للمقارنة',
        description: 'يمكنك مقارنة 4 سيارات كحد أقصى',
        variant: 'destructive',
      });
      return;
    }

    setSelectedCars([...selectedCars, carId]);
    setSearchTerm('');
    setShowCarsDropdown(false);
  };

  // إزالة سيارة من المقارنة
  const removeCarFromComparison = (carId: number) => {
    setSelectedCars(selectedCars.filter(id => id !== carId));
  };

  // الحصول على تفاصيل السيارة من النتائج
  const getCarDetails = (carId: number): Car | undefined => {
    if (!comparisonResults) return undefined;
    
    const item = comparisonResults.items.find(item => item.car.id === carId);
    return item?.car;
  };

  // تحديد نتيجة المقارنة بين السيارات للخاصية المحددة
  const getComparisonResult = (property: string, carId: number) => {
    if (!comparisonResults || !comparisonResults.comparison[property]) return null;
    
    const propertyComparison = comparisonResults.comparison[property];
    if (propertyComparison.winner === carId) {
      return 'winner';
    } else if (propertyComparison.winner === null) {
      return 'tie';
    }
    
    return 'normal';
  };

  // تنسيق القيمة حسب نوع الخاصية
  const formatValue = (key: string, value: any) => {
    if (key === 'price') {
      return new Intl.NumberFormat('ar-SA', {
        style: 'currency',
        currency: 'SAR',
        maximumFractionDigits: 0,
      }).format(value);
    }
    
    if (key === 'mileage') {
      return `${new Intl.NumberFormat('ar-SA').format(value)} كم`;
    }

    if (key === 'engineSize') {
      return `${value} لتر`;
    }

    if (key === 'horsepower') {
      return `${value} حصان`;
    }

    return value;
  };

  // تنسيق العنوان
  const formatLabel = (key: string) => {
    const labels: {[key: string]: string} = {
      price: 'السعر',
      year: 'السنة',
      mileage: 'المسافة',
      transmission: 'ناقل الحركة',
      fuelType: 'نوع الوقود',
      engineSize: 'حجم المحرك',
      horsepower: 'القوة',
      bodyType: 'نوع الهيكل',
      color: 'اللون',
    };
    
    return labels[key] || key;
  };

  // تلوين النتيجة حسب المقارنة
  const getResultClass = (result: string | null) => {
    if (result === 'winner') return 'bg-green-50 text-green-700 font-medium';
    if (result === 'tie') return 'bg-gray-50';
    return '';
  };

  return (
    <div className="container mx-auto py-12 px-4">
      {/* العنوان الرئيسي */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center mb-12"
      >
        <h1 className="text-4xl font-bold mb-4">مقارنة السيارات الذكية</h1>
        <p className="text-lg text-gray-600 max-w-3xl mx-auto">
          قارن بين السيارات التي تهمك واحصل على تحليل ذكي للمزايا والعيوب وأفضل اختيار لاحتياجاتك
        </p>
      </motion.div>

      {/* قسم اختيار السيارات */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>اختر السيارات للمقارنة</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-6">
            <label className="block text-sm font-medium mb-2">ما هو أهم شيء تبحث عنه في السيارة؟</label>
            <select
              className="w-full md:w-2/3 p-2 border rounded-md"
              value={userPreference}
              onChange={(e) => setUserPreference(e.target.value)}
            >
              <option value="">اختر أولويتك (اختياري)</option>
              <option value="price">أفضل سعر</option>
              <option value="performance">أداء عالي</option>
              <option value="fuel">اقتصاد في استهلاك الوقود</option>
              <option value="reliability">موثوقية وجودة</option>
              <option value="luxury">فخامة ومميزات</option>
              <option value="family">مناسبة للعائلة</option>
              <option value="value">أفضل قيمة مقابل السعر</option>
            </select>
          </div>

          {/* البحث عن السيارات */}
          <div className="relative">
            <div className="flex gap-2 mb-4">
              <div className="relative flex-grow">
                <input
                  type="text"
                  placeholder="ابحث عن سيارة لإضافتها"
                  className="w-full p-2 border rounded-md"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onFocus={() => setShowCarsDropdown(true)}
                />
                {searchTerm && isLoadingCars && (
                  <div className="absolute top-1/2 left-3 transform -translate-y-1/2">
                    <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
                  </div>
                )}
              </div>
              <Button
                onClick={() => setShowCarsDropdown(!showCarsDropdown)}
                variant="outline"
              >
                {showCarsDropdown ? 'إخفاء' : 'عرض السيارات'}
              </Button>
            </div>

            {/* قائمة السيارات */}
            {showCarsDropdown && (
              <div className="absolute z-10 mt-1 w-full bg-white border rounded-md shadow-lg max-h-80 overflow-y-auto">
                {isLoadingCars ? (
                  <div className="p-4 text-center">
                    <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2 text-gray-400" />
                    <p>جاري البحث...</p>
                  </div>
                ) : availableCars && availableCars.length > 0 ? (
                  <div className="divide-y">
                    {availableCars.map((car: Car) => (
                      <div
                        key={car.id}
                        className="p-3 hover:bg-gray-50 cursor-pointer flex justify-between items-center"
                        onClick={() => addCarToComparison(car.id)}
                      >
                        <div>
                          <div className="font-medium">{car.make} {car.model} {car.year}</div>
                          <div className="text-sm text-gray-500">
                            {formatValue('price', car.price)} · {car.mileage.toLocaleString()} كم
                          </div>
                        </div>
                        <PlusCircle className="h-5 w-5 text-primary" />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 text-center text-gray-500">
                    {searchTerm.length > 0 ? 'لا توجد نتائج' : 'ابدأ البحث عن سيارة'}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* السيارات المختارة للمقارنة */}
          <div className="mt-6">
            <h3 className="text-lg font-medium mb-4">السيارات المختارة للمقارنة</h3>
            
            {selectedCars.length === 0 ? (
              <div className="text-center p-6 bg-gray-50 rounded-lg">
                <p className="text-gray-500">لم تقم باختيار أي سيارات للمقارنة بعد</p>
                <p className="text-sm text-gray-400 mt-1">ابحث عن سيارات في الأعلى لإضافتها للمقارنة</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {selectedCars.map((carId) => {
                  const car = comparisonResults?.items.find(item => item.car.id === carId)?.car || 
                              availableCars?.find((c: Car) => c.id === carId);
                  
                  return (
                    <Card key={carId} className="overflow-hidden">
                      {car ? (
                        <>
                          <div className="aspect-video bg-gray-100">
                            {car.imageUrl ? (
                              <img src={car.imageUrl} alt={car.title} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <AlertTriangle className="h-10 w-10 text-gray-400" />
                              </div>
                            )}
                          </div>
                          <CardContent className="p-4">
                            <h4 className="font-medium mb-1">{car.make} {car.model}</h4>
                            <p className="text-sm text-gray-500">{car.year} · {formatValue('price', car.price)}</p>
                          </CardContent>
                        </>
                      ) : (
                        <CardContent className="p-4 flex items-center justify-center h-32">
                          <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                        </CardContent>
                      )}
                      <CardFooter className="p-2 bg-gray-50 border-t">
                        <Button
                          onClick={() => removeCarFromComparison(carId)}
                          variant="ghost"
                          size="sm"
                          className="w-full text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          إزالة
                        </Button>
                      </CardFooter>
                    </Card>
                  );
                })}
                
                {/* إضافة سيارة جديدة */}
                {selectedCars.length < 4 && (
                  <Card className="border-dashed border-2 border-gray-300 bg-gray-50">
                    <div 
                      className="flex flex-col items-center justify-center p-8 h-full cursor-pointer"
                      onClick={() => setShowCarsDropdown(true)}
                    >
                      <PlusCircle className="h-10 w-10 text-gray-400 mb-2" />
                      <p className="text-gray-600 font-medium">إضافة سيارة</p>
                      <p className="text-xs text-gray-400 mt-1">
                        {4 - selectedCars.length} سيارات متبقية
                      </p>
                    </div>
                  </Card>
                )}
              </div>
            )}
          </div>
        </CardContent>
        <CardFooter className="bg-gray-50 border-t justify-between">
          <div>
            {selectedCars.length > 0 && (
              <Button variant="outline" onClick={() => setSelectedCars([])}>
                إعادة ضبط المقارنة
              </Button>
            )}
          </div>
          <div>
            <Button 
              onClick={() => fetchComparison()} 
              disabled={selectedCars.length < 2 || isComparing}
              className="flex items-center gap-2"
            >
              {isComparing ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  جاري المقارنة...
                </>
              ) : (
                'مقارنة السيارات'
              )}
            </Button>
          </div>
        </CardFooter>
      </Card>

      {/* نتائج المقارنة */}
      {comparisonResults && !isComparing && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <h2 className="text-2xl font-bold mb-6">نتائج المقارنة</h2>
          
          {/* توصية الذكاء الاصطناعي */}
          <Card className="mb-8 bg-primary/5 border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="lucide lucide-lightbulb"
                >
                  <path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5"/>
                  <path d="M9 18h6"/>
                  <path d="M10 22h4"/>
                </svg>
                توصية الذكاء الاصطناعي
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-lg">{comparisonResults.recommendation}</p>
            </CardContent>
          </Card>
          
          {/* جدول المقارنة المفصل */}
          <Card className="overflow-hidden mb-8">
            <CardHeader>
              <CardTitle>مقارنة تفصيلية</CardTitle>
            </CardHeader>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="p-4 border-b text-right font-medium">المواصفات</th>
                    {selectedCars.map((carId) => {
                      const car = getCarDetails(carId);
                      return (
                        <th key={carId} className="p-4 border-b text-right font-medium">
                          {car ? `${car.make} ${car.model} ${car.year}` : `سيارة ${carId}`}
                        </th>
                      );
                    })}
                  </tr>
                </thead>
                <tbody>
                  {Object.keys(comparisonResults.comparison).map((key) => {
                    const item = comparisonResults.comparison[key];
                    return (
                      <tr key={key} className="border-b">
                        <td className="p-4 font-medium">{formatLabel(key)}</td>
                        {selectedCars.map((carId) => {
                          const value = item.values[carId];
                          const result = getComparisonResult(key, carId);
                          return (
                            <td key={carId} className={`p-4 ${getResultClass(result)}`}>
                              {formatValue(key, value)}
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                  
                  {/* النتيجة الإجمالية */}
                  <tr className="bg-gray-50 font-semibold">
                    <td className="p-4">التقييم العام</td>
                    {selectedCars.map((carId) => {
                      const item = comparisonResults.items.find(i => i.car.id === carId);
                      return (
                        <td key={carId} className="p-4">
                          {item ? `${Math.round(item.score * 100)}%` : '-'}
                        </td>
                      );
                    })}
                  </tr>
                  <tr className="bg-gray-50 font-semibold">
                    <td className="p-4">أفضل قيمة مقابل السعر</td>
                    {selectedCars.map((carId) => {
                      const item = comparisonResults.items.find(i => i.car.id === carId);
                      return (
                        <td key={carId} className="p-4">
                          {item ? `${Math.round(item.valueScore * 100)}%` : '-'}
                        </td>
                      );
                    })}
                  </tr>
                </tbody>
              </table>
            </div>
          </Card>

          {/* المزايا والعيوب */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {comparisonResults.items.map((item) => (
              <Card key={item.car.id}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">{item.car.make} {item.car.model}</CardTitle>
                </CardHeader>
                <CardContent>
                  {/* المزايا */}
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-green-700 mb-2 flex items-center">
                      <CheckCircle2 className="h-4 w-4 mr-1" /> المزايا
                    </h4>
                    <ul className="space-y-2">
                      {item.advantages.map((advantage, index) => (
                        <li key={index} className="text-sm flex items-start">
                          <div className="h-5 w-5 flex-shrink-0 text-green-500 mr-2">✓</div>
                          <span>{advantage}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  {/* العيوب */}
                  <div>
                    <h4 className="text-sm font-medium text-red-700 mb-2 flex items-center">
                      <XCircle className="h-4 w-4 mr-1" /> العيوب
                    </h4>
                    <ul className="space-y-2">
                      {item.disadvantages.map((disadvantage, index) => (
                        <li key={index} className="text-sm flex items-start">
                          <div className="h-5 w-5 flex-shrink-0 text-red-500 mr-2">✗</div>
                          <span>{disadvantage}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
                <CardFooter className="pt-0 flex justify-between">
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/cars/${item.car.id}`}>عرض التفاصيل</Link>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>

          {/* مفتاح رموز المقارنة */}
          <div className="bg-gray-50 p-4 rounded-lg text-sm">
            <h3 className="font-medium mb-2">مفتاح المقارنة:</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center">
                <div className="h-4 w-4 rounded-full bg-green-100 border border-green-300 mr-2"></div>
                <span>أفضل قيمة في هذه الفئة</span>
              </div>
              <div className="flex items-center">
                <div className="h-4 w-4 rounded-full bg-gray-100 border border-gray-300 mr-2"></div>
                <span>متساوي مع غيره</span>
              </div>
              <div className="flex items-center">
                <HelpCircle className="h-4 w-4 text-gray-400 mr-2" />
                <span>التقييم يعتمد على مقارنة مجمعة للمواصفات</span>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* حالة الخطأ */}
      {isError && !isComparing && (
        <div className="text-center py-8">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-xl font-medium mb-2">حدث خطأ أثناء المقارنة</h3>
          <p className="text-gray-600 mb-4">لم نتمكن من إجراء المقارنة في الوقت الحالي. يرجى المحاولة مرة أخرى لاحقاً.</p>
          <Button onClick={() => fetchComparison()}>
            إعادة المحاولة
          </Button>
        </div>
      )}
    </div>
  );
};

export default AICarComparisonPage;