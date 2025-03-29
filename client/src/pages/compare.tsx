import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { motion } from 'framer-motion';
import { Drawer, DrawerHeader, DrawerContent } from '@/components/ui/drawer';
import CarComparison from '@/components/ui/car-comparison';
import CarCard from '@/components/ui/car-card';
import AnimatedButton from '@/components/ui/animated-button';
import SearchBar from '@/components/ui/search-bar';
import { translations } from '@/i18n';

const t = translations.ar;

// بيانات افتراضية للسيارات المتاحة للمقارنة
const availableCars = [
  {
    id: 1,
    title: 'مرسيدس بنز GLA 250',
    year: 2023,
    price: 219000,
    engine: '2.0 لتر تيربو',
    power: '221 حصان',
    transmission: 'أوتوماتيكي 8 سرعات',
    acceleration: '6.7 ثانية',
    topSpeed: '240 كم/س',
    fuelConsumption: '7.5 لتر/100كم',
    fuelType: 'بنزين',
    bodyType: 'دفع رباعي مدمج',
    seatsCount: 5,
    trunkSpace: '435 لتر',
    length: 4410,
    width: 1834,
    height: 1611,
    wheelbase: 2729,
    safetyRating: 5,
    image: '/mercedes-gla.jpg',
    features: ['نظام ملاحة متطور', 'كاميرا خلفية', 'مثبت سرعة تكيفي', 'مصابيح LED', 'فتحة سقف بانورامية'],
    mileage: 0,
  },
  {
    id: 2,
    title: 'تويوتا كامري',
    year: 2023,
    price: 145000,
    engine: '2.5 لتر',
    power: '203 حصان',
    transmission: 'أوتوماتيكي CVT',
    acceleration: '8.3 ثانية',
    topSpeed: '210 كم/س',
    fuelConsumption: '6.8 لتر/100كم',
    fuelType: 'بنزين',
    bodyType: 'سيدان',
    seatsCount: 5,
    trunkSpace: '493 لتر',
    length: 4885,
    width: 1840,
    height: 1445,
    wheelbase: 2825,
    safetyRating: 5,
    image: '/toyota-camry.jpg',
    features: ['شاشة 9 بوصة', 'نظام صوتي JBL', 'اتصال Apple CarPlay و Android Auto', 'مساعد الحفاظ على المسار', 'نظام مراقبة النقاط العمياء'],
    mileage: 0,
  },
  {
    id: 3,
    title: 'هوندا أكورد',
    year: 2023,
    price: 139000,
    engine: '1.5 لتر تيربو',
    power: '192 حصان',
    transmission: 'أوتوماتيكي CVT',
    acceleration: '7.9 ثانية',
    topSpeed: '200 كم/س',
    fuelConsumption: '6.5 لتر/100كم',
    fuelType: 'بنزين',
    bodyType: 'سيدان',
    seatsCount: 5,
    trunkSpace: '473 لتر',
    length: 4890,
    width: 1860,
    height: 1450,
    wheelbase: 2830,
    safetyRating: 5,
    image: '/honda-accord.jpg',
    features: ['تحكم تكييف اوتوماتيكي', 'مثبت سرعة تكيفي', 'نظام ملاحة', 'فتحة سقف', 'كاميرا خلفية'],
    mileage: 12000,
  },
  {
    id: 4,
    title: 'نيسان باترول 2023',
    year: 2023,
    price: 329000,
    engine: '5.6 لتر',
    power: '400 حصان',
    transmission: 'أوتوماتيكي 7 سرعات',
    acceleration: '6.5 ثانية',
    topSpeed: '210 كم/س',
    fuelConsumption: '14.5 لتر/100كم',
    fuelType: 'بنزين',
    bodyType: 'دفع رباعي كبير',
    seatsCount: 7,
    trunkSpace: '550 لتر',
    length: 5175,
    width: 1995,
    height: 1940,
    wheelbase: 3075,
    safetyRating: 4,
    image: '/nissan-patrol.jpg',
    features: ['دفع رباعي', 'مقاعد جلد فاخرة', 'شاشات ترفيهية للمقاعد الخلفية', 'نظام صوتي محيطي', 'رادار مراقبة محيطي'],
    mileage: 0,
  },
];

const ComparePage = () => {
  const [location, setLocation] = useLocation();
  const [selectedCars, setSelectedCars] = useState<any[]>([]);
  const [isSelectDrawerOpen, setIsSelectDrawerOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  // استخلاص معرفات السيارات من رابط الصفحة
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const carIds = params.get('cars')?.split(',').map(Number) || [];
    
    if (carIds.length > 0) {
      const cars = carIds
        .map(id => availableCars.find(car => car.id === id))
        .filter(car => car !== undefined);
      
      setSelectedCars(cars as any[]);
    }
  }, []);
  
  // تحديث رابط الصفحة عند تغيير السيارات المحددة
  useEffect(() => {
    if (selectedCars.length > 0) {
      const carIds = selectedCars.map(car => car.id).join(',');
      const searchParams = new URLSearchParams();
      searchParams.set('cars', carIds);
      
      // تحديث الرابط بدون إعادة تحميل الصفحة
      window.history.replaceState(null, '', `${window.location.pathname}?${searchParams.toString()}`);
    }
  }, [selectedCars]);
  
  // إضافة سيارة للمقارنة
  const addCarToComparison = () => {
    if (selectedCars.length < 3) {
      setIsSelectDrawerOpen(true);
    }
  };
  
  // إزالة سيارة من المقارنة
  const removeCarFromComparison = (carId: number) => {
    setSelectedCars(prev => prev.filter(car => car.id !== carId));
  };
  
  // تحديد سيارة من الدرج
  const selectCar = (car: any) => {
    if (!selectedCars.some(c => c.id === car.id) && selectedCars.length < 3) {
      setSelectedCars(prev => [...prev, car]);
      setIsSelectDrawerOpen(false);
    }
  };
  
  // تصفية السيارات بناءً على البحث
  const filteredCars = availableCars.filter(
    car =>
      !selectedCars.some(c => c.id === car.id) &&
      (searchQuery === '' ||
        car.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        car.bodyType?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        car.engine?.toLowerCase().includes(searchQuery.toLowerCase()))
  );
  
  return (
    <div className="py-10 px-4">
      <div className="container mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold mb-2">مقارنة السيارات</h1>
          <p className="text-gray-600 mb-6">قارن بين ميزات ومواصفات السيارات المختلفة لاتخاذ القرار المناسب</p>
        </motion.div>
        
        {selectedCars.length > 0 ? (
          <CarComparison
            cars={selectedCars}
            onRemoveCar={removeCarFromComparison}
            onAddCar={addCarToComparison}
            maxCars={3}
            className="mb-8"
          />
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-white rounded-lg shadow-md p-8 text-center mb-8"
          >
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                />
              </svg>
            </div>
            <h2 className="text-xl font-bold mb-2">لم تقم بإضافة أي سيارات للمقارنة</h2>
            <p className="text-gray-600 mb-6">قم بإضافة سيارتين أو ثلاثة من قائمة السيارات للمقارنة بينها</p>
            <AnimatedButton variant="primary" onClick={addCarToComparison}>
              إضافة سيارة للمقارنة
            </AnimatedButton>
          </motion.div>
        )}
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold mb-4">سيارات مقترحة للمقارنة</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {availableCars.slice(0, 3).map((car) => (
              <div key={car.id}>
                <CarCard car={car} />
                <div className="mt-2 flex justify-center">
                  <AnimatedButton
                    variant={selectedCars.some(c => c.id === car.id) ? 'secondary' : 'primary'}
                    size="sm"
                    onClick={() => {
                      if (selectedCars.some(c => c.id === car.id)) {
                        removeCarFromComparison(car.id);
                      } else {
                        selectCar(car);
                      }
                    }}
                    disabled={selectedCars.some(c => c.id === car.id) || selectedCars.length >= 3}
                  >
                    {selectedCars.some(c => c.id === car.id)
                      ? 'تمت الإضافة'
                      : 'إضافة للمقارنة'}
                  </AnimatedButton>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* درج اختيار السيارات */}
        <Drawer
          isOpen={isSelectDrawerOpen}
          onClose={() => setIsSelectDrawerOpen(false)}
          position="right"
          className="w-full max-w-lg"
        >
          <DrawerHeader>
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold">اختر سيارة للمقارنة</h2>
              <button
                onClick={() => setIsSelectDrawerOpen(false)}
                className="p-2 rounded-full hover:bg-gray-100"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="mt-4">
              <input
                type="text"
                placeholder="ابحث عن سيارة..."
                className="w-full p-3 border rounded-lg focus:ring-[var(--primary)] focus:border-[var(--primary)] outline-none"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </DrawerHeader>
          
          <DrawerContent>
            {filteredCars.length > 0 ? (
              <div className="grid grid-cols-1 gap-4">
                {filteredCars.map((car) => (
                  <div
                    key={car.id}
                    className="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                    onClick={() => selectCar(car)}
                  >
                    <div className="flex items-start">
                      <div className="w-20 h-16 bg-gray-200 rounded overflow-hidden ml-3 flex-shrink-0">
                        {car.image && <img src={car.image} alt={car.title} className="w-full h-full object-cover" />}
                      </div>
                      <div className="flex-grow">
                        <h3 className="font-bold text-lg">{car.title}</h3>
                        <div className="text-sm text-gray-500">
                          <div className="flex items-center">
                            <span>{car.year}</span>
                            <span className="mx-2">•</span>
                            <span>{car.price.toLocaleString()} ريال</span>
                          </div>
                        </div>
                        <div className="mt-1 flex flex-wrap gap-1">
                          <span className="inline-block px-2 py-0.5 bg-gray-100 text-xs rounded-full">
                            {car.engine}
                          </span>
                          <span className="inline-block px-2 py-0.5 bg-gray-100 text-xs rounded-full">
                            {car.bodyType}
                          </span>
                        </div>
                      </div>
                      <div className="ml-2">
                        <button className="p-2 rounded-full bg-gray-100 hover:bg-[var(--primary-light)] text-gray-500 hover:text-[var(--primary)]">
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-1">لم يتم العثور على نتائج</h3>
                <p className="text-gray-500">
                  لا توجد سيارات متاحة للمقارنة تطابق بحثك. يرجى تعديل معايير البحث أو استخدام كلمات مختلفة.
                </p>
              </div>
            )}
          </DrawerContent>
        </Drawer>
      </div>
    </div>
  );
};

export default ComparePage;