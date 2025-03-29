import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { motion, AnimatePresence } from 'framer-motion';
import CarCard from '@/components/ui/car-card';
import SearchBar from '@/components/ui/search-bar';
import AnimatedButton from '@/components/ui/animated-button';
import { translations } from '@/i18n';

const t = translations.ar;

// بيانات افتراضية للسيارات
const carsData = [
  {
    id: 1,
    title: 'مرسيدس بنز GLA 250',
    year: 2023,
    price: 219000,
    mileage: 0,
    features: ['تيربو', 'كاميرا خلفية', 'مثبت سرعة'],
    image: '/mercedes-gla.jpg',
  },
  {
    id: 2,
    title: 'تويوتا كامري',
    year: 2023,
    price: 145000,
    mileage: 0,
    features: ['شاشة لمس', 'بلوتوث', 'نظام صوتي JBL'],
    image: '/toyota-camry.jpg',
  },
  {
    id: 3,
    title: 'هوندا أكورد',
    year: 2023,
    price: 139000,
    mileage: 12000,
    features: ['تحكم تكييف اوتوماتيكي', 'مثبت سرعة', 'نظام ملاحة'],
    image: '/honda-accord.jpg',
  },
  {
    id: 4,
    title: 'نيسان باترول',
    year: 2023,
    price: 329000,
    mileage: 0,
    features: ['دفع رباعي', 'مقاعد جلد', 'شاشات خلفية'],
    image: '/nissan-patrol.jpg',
  },
  {
    id: 5,
    title: 'تويوتا لاند كروزر',
    year: 2023,
    price: 350000,
    mileage: 5000,
    features: ['دفع رباعي', 'نظام تعليق متكيف', 'رادار'],
    image: '/toyota-landcruiser.jpg',
  },
  {
    id: 6,
    title: 'هيونداي سوناتا',
    year: 2023,
    price: 115000,
    mileage: 0,
    features: ['شاشة لمس', 'كاميرا خلفية', 'تشغيل عن بعد'],
    image: '/hyundai-sonata.jpg',
  },
];

// خيارات التصفية
const filterOptions = {
  brands: ['تويوتا', 'مرسيدس', 'نيسان', 'هوندا', 'هيونداي', 'كيا', 'لكزس', 'بي إم دبليو', 'أودي'],
  years: [2023, 2022, 2021, 2020, 2019, 2018],
  priceRanges: [
    { min: 0, max: 100000, label: 'أقل من 100,000' },
    { min: 100000, max: 200000, label: '100,000 - 200,000' },
    { min: 200000, max: 300000, label: '200,000 - 300,000' },
    { min: 300000, max: 1000000, label: 'أكثر من 300,000' },
  ],
  bodyTypes: ['سيدان', 'دفع رباعي', 'هاتشباك', 'كوبيه', 'بيك أب'],
  fuelTypes: ['بنزين', 'ديزل', 'هجين', 'كهربائي'],
  transmission: ['أوتوماتيكي', 'يدوي'],
};

export default function CarsPage() {
  const [location, setLocation] = useLocation();
  const [allCars, setAllCars] = useState(carsData);
  const [displayedCars, setDisplayedCars] = useState(carsData);
  const [activeFilters, setActiveFilters] = useState<Record<string, any>>({});
  const [sortBy, setSortBy] = useState('newest');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [currentPage, setCurrentPage] = useState(1);
  const carsPerPage = 6;
  
  // تصفية السيارات
  useEffect(() => {
    let filteredCars = [...allCars];
    
    // تطبيق التصفية
    Object.entries(activeFilters).forEach(([key, value]) => {
      if (value) {
        switch (key) {
          case 'brand':
            filteredCars = filteredCars.filter(car => car.title.includes(value));
            break;
          case 'year':
            filteredCars = filteredCars.filter(car => car.year === value);
            break;
          case 'priceRange':
            filteredCars = filteredCars.filter(
              car => car.price >= value.min && car.price <= value.max
            );
            break;
          case 'query':
            if (value.trim() !== '') {
              const query = value.toLowerCase();
              filteredCars = filteredCars.filter(
                car =>
                  car.title.toLowerCase().includes(query) ||
                  car.features.some((f: string) => f.toLowerCase().includes(query))
              );
            }
            break;
          default:
            break;
        }
      }
    });
    
    // تطبيق الترتيب
    switch (sortBy) {
      case 'newest':
        filteredCars.sort((a, b) => b.year - a.year);
        break;
      case 'oldest':
        filteredCars.sort((a, b) => a.year - b.year);
        break;
      case 'priceAsc':
        filteredCars.sort((a, b) => a.price - b.price);
        break;
      case 'priceDesc':
        filteredCars.sort((a, b) => b.price - a.price);
        break;
      default:
        break;
    }
    
    setDisplayedCars(filteredCars);
    setCurrentPage(1); // إعادة ضبط الصفحة الحالية عند تغيير التصفية
  }, [allCars, activeFilters, sortBy]);
  
  // التعامل مع البحث
  const handleSearch = (query: string, filters: any) => {
    setActiveFilters({
      ...activeFilters,
      query,
      ...filters,
    });
  };
  
  // التعامل مع تغيير الترتيب
  const handleSortChange = (newSortBy: string) => {
    setSortBy(newSortBy);
  };
  
  // التعامل مع تغيير طريقة العرض
  const toggleViewMode = () => {
    setViewMode(prev => (prev === 'grid' ? 'list' : 'grid'));
  };
  
  // حساب النطاق الحالي للسيارات المعروضة
  const indexOfLastCar = currentPage * carsPerPage;
  const indexOfFirstCar = indexOfLastCar - carsPerPage;
  const currentCars = displayedCars.slice(indexOfFirstCar, indexOfLastCar);
  const totalPages = Math.ceil(displayedCars.length / carsPerPage);
  
  // التنقل بين الصفحات
  const paginate = (pageNumber: number) => {
    if (pageNumber > 0 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
      
      // التمرير لأعلى الصفحة
      window.scrollTo({
        top: 0,
        behavior: 'smooth',
      });
    }
  };
  
  // تأثيرات الحركة للقائمة
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        when: 'beforeChildren',
        staggerChildren: 0.1,
      },
    },
  };
  
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 },
  };
  
  return (
    <div className="py-10 px-4">
      <div className="container mx-auto">
        <div className="flex flex-wrap items-center justify-between mb-8">
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full lg:w-auto mb-4 lg:mb-0"
          >
            <h1 className="text-3xl font-bold mb-2">تصفح السيارات</h1>
            <p className="text-gray-600">اكتشف أحدث السيارات المتاحة للشراء</p>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="w-full lg:w-auto"
          >
            <SearchBar 
              variant="advanced" 
              placeholder="ابحث عن سيارة..."
              onSearch={handleSearch}
              className="w-full lg:w-auto"
            />
          </motion.div>
        </div>
        
        <div className="flex flex-wrap -mx-4">
          {/* شريط التصفية والترتيب */}
          <motion.div 
            className="w-full px-4 mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div className="bg-white rounded-lg shadow-sm p-4 flex flex-wrap items-center justify-between">
              <div className="flex items-center mb-2 md:mb-0">
                <span className="text-gray-700 ml-2">الترتيب حسب:</span>
                <select 
                  value={sortBy}
                  onChange={(e) => handleSortChange(e.target.value)}
                  className="border-gray-300 rounded-md shadow-sm focus:border-[var(--primary)] focus:ring focus:ring-[var(--primary-light)] focus:ring-opacity-50"
                >
                  <option value="newest">الأحدث</option>
                  <option value="oldest">الأقدم</option>
                  <option value="priceAsc">السعر: من الأقل إلى الأعلى</option>
                  <option value="priceDesc">السعر: من الأعلى إلى الأقل</option>
                </select>
              </div>
              
              <div className="flex items-center">
                <span className="text-gray-700 ml-2">عرض:</span>
                <button 
                  onClick={toggleViewMode}
                  className={`p-2 rounded-md ${viewMode === 'grid' ? 'bg-gray-200' : 'bg-white'}`}
                  title="عرض شبكي"
                >
                  <svg className="w-5 h-5 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                  </svg>
                </button>
                <button 
                  onClick={toggleViewMode}
                  className={`p-2 rounded-md ${viewMode === 'list' ? 'bg-gray-200' : 'bg-white'}`}
                  title="عرض قائمة"
                >
                  <svg className="w-5 h-5 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>
              </div>
            </div>
          </motion.div>
          
          {/* نتائج البحث */}
          <div className="w-full px-4">
            {currentCars.length > 0 ? (
              <>
                <motion.div 
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                  className={viewMode === 'grid' 
                    ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                    : "space-y-4"
                  }
                >
                  {currentCars.map((car) => (
                    <motion.div 
                      key={car.id}
                      variants={itemVariants}
                      className={viewMode === 'list' ? "bg-white rounded-lg shadow-sm overflow-hidden" : ""}
                    >
                      {viewMode === 'grid' ? (
                        <CarCard car={car} />
                      ) : (
                        <div className="flex flex-col md:flex-row">
                          <div className="md:w-1/3 h-48 md:h-full">
                            {car.image ? (
                              <img src={car.image} alt={car.title} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                                <span className="text-gray-500">{car.title}</span>
                              </div>
                            )}
                          </div>
                          <div className="p-4 md:w-2/3">
                            <h3 className="text-lg font-bold mb-2">{car.title}</h3>
                            <div className="flex items-center text-sm text-gray-600 mb-3">
                              <span className="ml-4">{car.year}</span>
                              <span className="ml-4">{car.mileage} كم</span>
                              <span>{car.price.toLocaleString()} ريال</span>
                            </div>
                            <div className="mb-4">
                              <div className="flex flex-wrap gap-2">
                                {car.features.map((feature, idx) => (
                                  <span key={idx} className="inline-block px-2 py-1 bg-gray-100 text-xs rounded-full">
                                    {feature}
                                  </span>
                                ))}
                              </div>
                            </div>
                            <div className="flex space-x-2 space-x-reverse">
                              <AnimatedButton 
                                variant="primary" 
                                size="sm"
                                icon={<svg className="ml-1 w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                </svg>}
                              >
                                عرض التفاصيل
                              </AnimatedButton>
                              <AnimatedButton 
                                variant="outline" 
                                size="sm"
                                icon={<svg className="ml-1 w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                </svg>}
                              >
                                المفضلة
                              </AnimatedButton>
                            </div>
                          </div>
                        </div>
                      )}
                    </motion.div>
                  ))}
                </motion.div>
                
                {/* ترقيم الصفحات */}
                {totalPages > 1 && (
                  <div className="mt-10 flex justify-center">
                    <div className="flex items-center space-x-2 space-x-reverse">
                      <button
                        onClick={() => paginate(currentPage - 1)}
                        disabled={currentPage === 1}
                        className={`p-2 rounded-md ${
                          currentPage === 1 ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                      
                      {[...Array(totalPages)].map((_, index) => (
                        <button
                          key={index}
                          onClick={() => paginate(index + 1)}
                          className={`w-10 h-10 rounded-md ${
                            currentPage === index + 1
                              ? 'bg-[var(--primary)] text-white'
                              : 'bg-white text-gray-700 hover:bg-gray-50'
                          }`}
                        >
                          {index + 1}
                        </button>
                      ))}
                      
                      <button
                        onClick={() => paginate(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className={`p-2 rounded-md ${
                          currentPage === totalPages ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                      </button>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-white rounded-lg shadow-md p-8 text-center"
              >
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
                <h2 className="text-xl font-bold mb-2">لم يتم العثور على سيارات</h2>
                <p className="text-gray-600 mb-6">
                  لا توجد سيارات متطابقة مع معايير البحث المحددة. يرجى تعديل معايير البحث وحاول مرة أخرى.
                </p>
                <AnimatedButton 
                  variant="primary" 
                  onClick={() => setActiveFilters({})}
                >
                  عرض جميع السيارات
                </AnimatedButton>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}