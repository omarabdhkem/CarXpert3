import React, { useEffect, useState } from 'react';
import { useRoute } from 'wouter';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { translations } from '@/i18n';
import { CarImageGallery } from '@/components/ui/car-image-gallery';
import { Car360Viewer } from '@/components/ui/car-360-viewer';

// ترجمات باللغة العربية
const t = translations.ar;

// بيانات افتراضية للسيارة
const carDetails = {
  id: 1,
  title: 'مرسيدس بنز GLA 250',
  year: 2023,
  price: 219000,
  mileage: 0,
  condition: 'جديدة',
  engine: '2.0 لتر توربو',
  power: '221 حصان',
  transmission: 'أوتوماتيكي',
  color: 'أبيض',
  fuelType: 'بنزين',
  bodyType: 'دفع رباعي مدمج',
  doors: 5,
  seats: 5,
  features: [
    'نظام ملاحة متطور',
    'شاشة لمس 10.25 بوصة',
    'كاميرا خلفية',
    'حساسات ركن أمامية وخلفية',
    'مثبت سرعة تكيفي',
    'مصابيح LED',
    'فتحة سقف بانورامية',
    'نظام دخول بدون مفتاح',
    'مقاعد جلد',
    'مقاعد مدفأة',
    'نظام صوتي فاخر',
    'بلوتوث',
    'التحكم في المناخ ثنائي المناطق',
  ],
  dealership: {
    id: 1,
    name: 'وكالة المجدوعي للسيارات',
    location: 'الرياض، المملكة العربية السعودية',
    rating: 4.8,
    reviews: 56,
    phone: '+966 11 123 4567',
  },
  images: [
    'https://images.unsplash.com/photo-1563720223809-b7c087e8e902?ixlib=rb-1.2.1&auto=format&fit=crop&w=1050&q=80',
    'https://images.unsplash.com/photo-1583267746897-2cf415887172?ixlib=rb-1.2.1&auto=format&fit=crop&w=1050&q=80',
    'https://images.unsplash.com/photo-1553440569-bcc63803a83d?ixlib=rb-1.2.1&auto=format&fit=crop&w=1050&q=80',
    'https://images.unsplash.com/photo-1558211336-b0f68b18a487?ixlib=rb-1.2.1&auto=format&fit=crop&w=1100&q=80',
  ],
  description:
    'سيارة مرسيدس بنز GLA 250 موديل 2023 جديدة بالكامل، تأتي مع محرك توربو بسعة 2.0 لتر يولد قوة 221 حصان وعزم دوران 350 نيوتن متر، متصل بناقل حركة أوتوماتيكي من 8 سرعات. تتميز السيارة بتصميم خارجي جذاب وداخلية فاخرة مع أحدث التقنيات ووسائل الراحة. السيارة متوفرة الآن في معرضنا.',
};

// سيارات مشابهة
const similarCars = [
  {
    id: 2,
    title: 'أودي Q3',
    year: 2023,
    price: 209000,
    image: 'https://images.unsplash.com/photo-1606664557129-1c61fac03695?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80',
  },
  {
    id: 3,
    title: 'بي إم دبليو X1',
    year: 2023,
    price: 229000,
    image: 'https://images.unsplash.com/photo-1556800572-1b8aedf82db8?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80',
  },
  {
    id: 4,
    title: 'فولكس فاجن تيجوان',
    year: 2023,
    price: 179000,
    image: 'https://images.unsplash.com/photo-1617469767053-39b9a7a6f623?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80',
  },
];

const CarDetailsPage = () => {
  const [match, params] = useRoute('/cars/:id');
  const carId = params?.id;
  const [viewTab, setViewTab] = useState<'gallery' | '360'>('gallery');
  
  // تحميل بيانات العرض 360 درجة عند الحاجة
  const [is360Available, setIs360Available] = useState<boolean>(true);

  useEffect(() => {
    window.scrollTo(0, 0);
    
    // يمكن هنا التحقق من توفر العرض 360 درجة لهذه السيارة من خلال API
    // للتبسيط، نفترض أنه متاح لهذه السيارة
    setIs360Available(true);
  }, []);

  if (!match) {
    return <div>Car not found</div>;
  }

  return (
    <div className="py-10 px-4">
      <div className="container mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* صور ومعلومات أساسية */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="mb-8">
                <Tabs 
                  defaultValue="gallery" 
                  className="w-full"
                  onValueChange={(value) => setViewTab(value as 'gallery' | '360')}
                >
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold">{t.car.viewOptions}</h2>
                    <TabsList className="grid grid-cols-2 w-64">
                      <TabsTrigger value="gallery">{t.car.photoGallery}</TabsTrigger>
                      <TabsTrigger 
                        value="360" 
                        disabled={!is360Available}
                        title={!is360Available ? t.car.no360Available : ''}
                      >
                        {t.car.view360}
                      </TabsTrigger>
                    </TabsList>
                  </div>
                  
                  <TabsContent value="gallery" className="pt-2">
                    <CarImageGallery 
                      images={carDetails.images} 
                      title={carDetails.title} 
                    />
                  </TabsContent>
                  
                  <TabsContent value="360" className="pt-2">
                    <Car360Viewer 
                      carId={Number(carId)} 
                      carName={carDetails.title} 
                      imagesCount={36}
                      autoRotate={true}
                    />
                    <div className="mt-4 p-3 bg-blue-50 text-blue-700 rounded-md text-sm">
                      {t.car.dragToRotateInfo}
                    </div>
                  </TabsContent>
                </Tabs>
              </div>

              <div className="bg-white rounded-lg shadow-md p-6 mb-8">
                <h1 className="text-3xl font-bold mb-2">{carDetails.title}</h1>
                <div className="flex flex-wrap gap-4 mb-6">
                  <span className="bg-[var(--primary)] text-white px-3 py-1 rounded-full text-sm">
                    {carDetails.year}
                  </span>
                  <span className="bg-gray-100 px-3 py-1 rounded-full text-sm">
                    {carDetails.mileage === 0 ? 'جديدة' : `${carDetails.mileage.toLocaleString()} كم`}
                  </span>
                  <span className="bg-gray-100 px-3 py-1 rounded-full text-sm">{carDetails.engine}</span>
                  <span className="bg-gray-100 px-3 py-1 rounded-full text-sm">{carDetails.transmission}</span>
                </div>

                <div className="border-t border-b py-5 mb-6">
                  <div className="flex justify-between items-center">
                    <span className="text-2xl font-bold text-[var(--primary)]">
                      {carDetails.price.toLocaleString()} ريال
                    </span>
                    <div className="flex gap-2">
                      <button className="btn-primary">
                        {t.car.contactSeller}
                      </button>
                      <button className="btn-secondary p-2">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>

                <h2 className="text-xl font-bold mb-4">{t.car.details}</h2>
                <p className="text-gray-700 leading-relaxed mb-6">{carDetails.description}</p>
              </div>

              <div className="bg-white rounded-lg shadow-md p-6 mb-8">
                <h2 className="text-xl font-bold mb-4">{t.car.specifications}</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div className="flex items-center">
                    <svg className="w-6 h-6 text-gray-400 ml-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 10V3L4 14h7v7l9-11h-7z"
                      />
                    </svg>
                    <div>
                      <div className="text-sm text-gray-500">المحرك</div>
                      <div className="font-medium">{carDetails.engine}</div>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <svg className="w-6 h-6 text-gray-400 ml-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <div>
                      <div className="text-sm text-gray-500">القوة</div>
                      <div className="font-medium">{carDetails.power}</div>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <svg className="w-6 h-6 text-gray-400 ml-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                      />
                    </svg>
                    <div>
                      <div className="text-sm text-gray-500">الحالة</div>
                      <div className="font-medium">{carDetails.condition}</div>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <svg className="w-6 h-6 text-gray-400 ml-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01"
                      />
                    </svg>
                    <div>
                      <div className="text-sm text-gray-500">اللون</div>
                      <div className="font-medium">{carDetails.color}</div>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <svg className="w-6 h-6 text-gray-400 ml-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
                      />
                    </svg>
                    <div>
                      <div className="text-sm text-gray-500">نوع الوقود</div>
                      <div className="font-medium">{carDetails.fuelType}</div>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <svg className="w-6 h-6 text-gray-400 ml-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    <div>
                      <div className="text-sm text-gray-500">ناقل الحركة</div>
                      <div className="font-medium">{carDetails.transmission}</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-md p-6 mb-8">
                <h2 className="text-xl font-bold mb-4">{t.car.features}</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {carDetails.features.map((feature, index) => (
                    <div key={index} className="flex items-center py-1">
                      <svg className="w-5 h-5 ml-2 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>

          {/* معلومات الوكيل والأقسام الجانبية */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <Card className="mb-6">
                <CardContent className="p-6">
                  <h3 className="text-lg font-bold mb-4">معلومات الوكيل</h3>
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center ml-3">
                      <span className="font-bold">{carDetails.dealership.name.charAt(0)}</span>
                    </div>
                    <div>
                      <h4 className="font-medium">{carDetails.dealership.name}</h4>
                      <div className="flex items-center text-sm text-gray-500">
                        <svg className="w-4 h-4 text-yellow-400 ml-1" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                        <span>
                          {carDetails.dealership.rating} ({carDetails.dealership.reviews} تقييم)
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="mb-4 text-sm">
                    <div className="flex items-start mb-2">
                      <svg className="w-5 h-5 ml-2 text-gray-500 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                      </svg>
                      <span>{carDetails.dealership.location}</span>
                    </div>
                    <div className="flex items-center">
                      <svg className="w-5 h-5 ml-2 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                        />
                      </svg>
                      <span dir="ltr">{carDetails.dealership.phone}</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <button className="btn-primary text-sm">اتصال</button>
                    <button className="btn-secondary text-sm">رسالة</button>
                  </div>
                </CardContent>
              </Card>

              <Card className="mb-6">
                <CardContent className="p-6">
                  <h3 className="text-lg font-bold mb-4">خدمات إضافية</h3>
                  <div className="space-y-4">
                    <button className="w-full btn-secondary text-sm flex items-center justify-center">
                      <svg className="w-5 h-5 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      {t.car.financingOptions}
                    </button>
                    <button className="w-full btn-secondary text-sm flex items-center justify-center">
                      <svg className="w-5 h-5 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                        />
                      </svg>
                      {t.car.insuranceQuote}
                    </button>
                    <button className="w-full btn-secondary text-sm flex items-center justify-center">
                      <svg className="w-5 h-5 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                      {t.car.scheduleTest}
                    </button>
                  </div>
                </CardContent>
              </Card>

              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-bold mb-4">{t.car.similarCars}</h3>
                <div className="space-y-4">
                  {similarCars.map((car) => (
                    <div key={car.id} className="flex p-2 hover:bg-gray-50 rounded-lg transition-colors">
                      <div className="w-20 h-16 rounded-md ml-3 flex-shrink-0 overflow-hidden">
                        <img 
                          src={car.image} 
                          alt={car.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-grow">
                        <h4 className="font-medium text-sm">{car.title}</h4>
                        <div className="flex justify-between items-center mt-1">
                          <span className="text-sm text-gray-500">{car.year}</span>
                          <span className="font-bold text-sm text-[var(--primary)]">
                            {car.price.toLocaleString()} ريال
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CarDetailsPage;