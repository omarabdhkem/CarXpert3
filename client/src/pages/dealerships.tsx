import React, { useState } from 'react';
import { Link } from 'wouter';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { translations } from '@/i18n';

// ترجمات باللغة العربية
const t = translations.ar;

// بيانات افتراضية للوكلاء
const dealershipData = [
  {
    id: 1,
    name: 'وكالة المجدوعي للسيارات',
    brands: ['مرسيدس بنز', 'تويوتا'],
    location: 'الرياض، المملكة العربية السعودية',
    address: 'طريق الملك فهد، حي العليا، الرياض',
    phone: '+966 11 123 4567',
    email: 'info@almajoudi.com',
    website: 'www.almajoudi.com',
    workingHours: 'السبت - الخميس: 9:00 ص - 9:00 م',
    services: ['بيع', 'صيانة', 'قطع غيار', 'تمويل'],
    rating: 4.8,
    reviews: 56,
    image: '/dealership1.jpg',
  },
  {
    id: 2,
    name: 'الوكالة العربية للسيارات',
    brands: ['شيفروليه', 'جي إم سي'],
    location: 'الدمام، المملكة العربية السعودية',
    address: 'طريق الملك عبدالله، حي الفيصلية، الدمام',
    phone: '+966 13 456 7890',
    email: 'info@arabianmotors.com',
    website: 'www.arabianmotors.com',
    workingHours: 'السبت - الخميس: 8:30 ص - 8:30 م',
    services: ['بيع', 'صيانة', 'قطع غيار', 'تأمين'],
    rating: 4.5,
    reviews: 43,
    image: '/dealership2.jpg',
  },
  {
    id: 3,
    name: 'وكالة التوكيلات العالمية للسيارات',
    brands: ['بي إم دبليو', 'ميني'],
    location: 'جدة، المملكة العربية السعودية',
    address: 'طريق المدينة، حي الروضة، جدة',
    phone: '+966 12 789 0123',
    email: 'info@universalagencies.com',
    website: 'www.universalagencies.com',
    workingHours: 'السبت - الخميس: 9:00 ص - 10:00 م',
    services: ['بيع', 'صيانة', 'قطع غيار', 'خدمة المساعدة على الطريق'],
    rating: 4.7,
    reviews: 68,
    image: '/dealership3.jpg',
  },
  {
    id: 4,
    name: 'شركة الجميح للسيارات',
    brands: ['كاديلاك', 'شيفروليه'],
    location: 'الرياض، المملكة العربية السعودية',
    address: 'طريق خريص، حي النسيم، الرياض',
    phone: '+966 11 234 5678',
    email: 'info@aljomiah.com',
    website: 'www.aljomiah.com',
    workingHours: 'السبت - الخميس: 8:00 ص - 9:00 م',
    services: ['بيع', 'صيانة', 'قطع غيار', 'خدمات ما بعد البيع'],
    rating: 4.6,
    reviews: 51,
    image: '/dealership4.jpg',
  },
  {
    id: 5,
    name: 'شركة عبداللطيف جميل للسيارات',
    brands: ['تويوتا', 'لكزس'],
    location: 'جدة، المملكة العربية السعودية',
    address: 'طريق الأمير ماجد، حي العزيزية، جدة',
    phone: '+966 12 345 6789',
    email: 'info@altj.com',
    website: 'www.altj.com',
    workingHours: 'السبت - الخميس: 9:00 ص - 9:00 م',
    services: ['بيع', 'صيانة', 'قطع غيار', 'تمويل'],
    rating: 4.9,
    reviews: 87,
    image: '/dealership5.jpg',
  },
  {
    id: 6,
    name: 'الناغي للسيارات',
    brands: ['بي إم دبليو', 'هيونداي', 'كيا'],
    location: 'الرياض، المملكة العربية السعودية',
    address: 'طريق الملك عبدالعزيز، حي الملز، الرياض',
    phone: '+966 11 567 8901',
    email: 'info@naghi.com',
    website: 'www.naghi.com',
    workingHours: 'السبت - الخميس: 8:30 ص - 9:30 م',
    services: ['بيع', 'صيانة', 'قطع غيار', 'تأمين'],
    rating: 4.4,
    reviews: 62,
    image: '/dealership6.jpg',
  },
];

// مصفوفة الماركات للتصفية
const brands = [
  'الكل',
  'تويوتا',
  'مرسيدس بنز',
  'بي إم دبليو',
  'هيونداي',
  'كيا',
  'لكزس',
  'شيفروليه',
  'جي إم سي',
  'كاديلاك',
  'ميني',
];

// مصفوفة المدن للتصفية
const cities = ['الكل', 'الرياض', 'جدة', 'الدمام', 'الخبر', 'مكة المكرمة', 'المدينة المنورة'];

const DealershipsPage = () => {
  const [selectedBrand, setSelectedBrand] = useState('الكل');
  const [selectedCity, setSelectedCity] = useState('الكل');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredDealerships = dealershipData.filter((dealership) => {
    // تصفية حسب الماركة
    const matchesBrand =
      selectedBrand === 'الكل' || dealership.brands.some((brand) => brand === selectedBrand);

    // تصفية حسب المدينة
    const matchesCity =
      selectedCity === 'الكل' || dealership.location.includes(selectedCity);

    // تصفية حسب البحث
    const matchesSearch =
      searchQuery === '' ||
      dealership.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      dealership.brands.some((brand) => brand.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesBrand && matchesCity && matchesSearch;
  });

  const fadeInUpVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  const staggerContainerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  return (
    <div className="py-10 px-4">
      <div className="container mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-10"
        >
          <h1 className="text-3xl md:text-4xl font-bold mb-4">{t.dealerships.allDealerships}</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            استكشف شبكة واسعة من وكلاء السيارات المعتمدين في المملكة العربية السعودية. تصفح حسب الماركة أو
            الموقع للعثور على أقرب وكيل إليك.
          </p>
        </motion.div>

        {/* قسم البحث والتصفية */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-2">
                البحث
              </label>
              <input
                type="text"
                id="search"
                placeholder="ابحث عن وكيل أو ماركة..."
                className="w-full px-4 py-2 border rounded-lg focus:ring-[var(--primary)] focus:border-[var(--primary)] outline-none"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="brand" className="block text-sm font-medium text-gray-700 mb-2">
                {t.dealerships.filterByBrand}
              </label>
              <select
                id="brand"
                className="w-full px-4 py-2 border rounded-lg focus:ring-[var(--primary)] focus:border-[var(--primary)] outline-none"
                value={selectedBrand}
                onChange={(e) => setSelectedBrand(e.target.value)}
              >
                {brands.map((brand) => (
                  <option key={brand} value={brand}>
                    {brand}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-2">
                {t.dealerships.filterByLocation}
              </label>
              <select
                id="city"
                className="w-full px-4 py-2 border rounded-lg focus:ring-[var(--primary)] focus:border-[var(--primary)] outline-none"
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
              >
                {cities.map((city) => (
                  <option key={city} value={city}>
                    {city}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* قائمة الوكلاء */}
        <motion.div
          variants={staggerContainerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {filteredDealerships.length > 0 ? (
            filteredDealerships.map((dealership) => (
              <motion.div key={dealership.id} variants={fadeInUpVariants}>
                <Card className="h-full hover:shadow-lg transition-shadow">
                  <div className="relative h-48 bg-gray-200 rounded-t-lg overflow-hidden">
                    <div className="absolute inset-0 flex items-center justify-center">
                      {/* يمكن استبدالها بصورة فعلية للوكيل */}
                      <span className="text-xl font-bold text-gray-700">{dealership.name}</span>
                    </div>
                  </div>
                  <CardContent className="p-6">
                    <h2 className="text-lg font-bold mb-2">{dealership.name}</h2>
                    <div className="flex items-center mb-3 text-sm text-gray-600">
                      <svg className="w-5 h-5 ml-2 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                        />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <span>{dealership.location}</span>
                    </div>
                    <div className="mb-3">
                      <div className="flex items-center mb-1">
                        <svg className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                        <svg className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                        <svg className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                        <svg className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                        <svg className={"w-4 h-4 " + (dealership.rating >= 4.5 ? "text-yellow-400" : "text-gray-300")} fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                        <span className="mr-1 text-sm text-gray-600">
                          ({dealership.reviews} تقييم)
                        </span>
                      </div>
                    </div>
                    <div className="mb-4">
                      <h3 className="text-sm font-medium mb-2">الماركات:</h3>
                      <div className="flex flex-wrap gap-2">
                        {dealership.brands.map((brand) => (
                          <span
                            key={brand}
                            className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded-full"
                          >
                            {brand}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="mb-4">
                      <h3 className="text-sm font-medium mb-2">الخدمات:</h3>
                      <div className="flex flex-wrap gap-2">
                        {dealership.services.map((service) => (
                          <span
                            key={service}
                            className="bg-blue-50 text-blue-700 text-xs px-2 py-1 rounded-full"
                          >
                            {service}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="flex justify-between mt-4">
                      <Link href={`/dealerships/${dealership.id}`}>
                        <a className="btn-primary text-sm py-2 px-4">عرض التفاصيل</a>
                      </Link>
                      <button className="btn-secondary text-sm py-2 px-4">
                        {t.dealerships.contactDealership}
                      </button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))
          ) : (
            <div className="col-span-full text-center py-10">
              <svg
                className="w-16 h-16 mx-auto text-gray-400 mb-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <h3 className="text-lg font-medium text-gray-900 mb-1">لم يتم العثور على نتائج</h3>
              <p className="text-gray-500">
                لم نتمكن من العثور على أي وكلاء مطابقين لمعايير البحث الخاصة بك. يرجى تعديل المعايير والمحاولة مرة
                أخرى.
              </p>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default DealershipsPage;