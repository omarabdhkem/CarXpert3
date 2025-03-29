import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'wouter';
import { useInView } from 'react-intersection-observer';
import gsap from 'gsap';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MessageCircle } from 'lucide-react';
import { CarChat } from '@/components/ui/car-chat';
import { translations } from '@/i18n';

// ترجمات باللغة العربية
const t = translations.ar;

// بيانات السيارات
const featuredCars = [
  {
    id: 1,
    title: 'مرسيدس بنز GLA 250',
    year: 2023,
    price: 219000,
    mileage: 0,
    image: '/mercedes-gla.jpg',
    features: ['محرك 2.0 لتر', 'قوة 221 حصان'],
  },
  {
    id: 2,
    title: 'تويوتا كامري',
    year: 2023,
    price: 145000,
    mileage: 0,
    image: '/toyota-camry.jpg',
    features: ['محرك 2.5 لتر', 'قوة 203 حصان'],
  },
  {
    id: 3,
    title: 'هوندا أكورد',
    year: 2023,
    price: 139000,
    mileage: 12000,
    image: '/honda-accord.jpg',
    features: ['محرك 1.5 لتر تيربو', 'قوة 192 حصان'],
  },
];

const HomePage = () => {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [heroRef, heroInView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });
  
  const [carsRef, carsInView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });
  
  const searchBarRef = useRef(null);
  const heroTextRef = useRef(null);
  
  const openChat = () => setIsChatOpen(true);
  const closeChat = () => setIsChatOpen(false);
  
  useEffect(() => {
    if (heroInView) {
      gsap.fromTo(
        heroTextRef.current,
        { opacity: 0, y: 50 },
        { opacity: 1, y: 0, duration: 1, ease: 'power3.out' }
      );
      
      gsap.fromTo(
        searchBarRef.current,
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 1, delay: 0.3, ease: 'power3.out' }
      );
    }
  }, [heroInView]);
  
  const fadeInUpVariants = {
    hidden: { opacity: 0, y: 30 },
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
    <div className="flex flex-col min-h-screen">
      {/* قسم البنر الرئيسي */}
      <section 
        ref={heroRef}
        className="relative bg-gradient-to-br from-[var(--primary)] to-[var(--primary-dark)] text-white py-20 px-4 overflow-hidden">
        <div className="container mx-auto relative z-10">
          <div className="max-w-2xl mx-auto text-center" ref={heroTextRef}>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">{t.home.heroTitle}</h1>
            <p className="text-xl mb-8 opacity-90">{t.home.heroSubtitle}</p>
          </div>
          
          <div 
            ref={searchBarRef}
            className="max-w-2xl mx-auto bg-white rounded-lg shadow-xl overflow-hidden p-1">
            <div className="flex flex-col md:flex-row">
              <input
                type="text"
                placeholder={t.home.searchPlaceholder}
                className="flex-grow p-3 focus:outline-none text-gray-700"
              />
              <button className="bg-[var(--accent)] hover:bg-[var(--accent-light)] text-white p-3 rounded-md transition-colors md:rounded-r-md md:rounded-l-none">
                {t.common.search}
              </button>
            </div>
          </div>
        </div>
        
        {/* خلفية زخرفية */}
        <div className="absolute inset-0 overflow-hidden opacity-10">
          <svg className="absolute left-0 top-0 h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            <circle cx="0" cy="0" r="80" fill="white" />
          </svg>
          <svg className="absolute right-0 bottom-0 h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            <circle cx="100" cy="100" r="80" fill="white" />
          </svg>
        </div>
      </section>
      
      {/* قسم السيارات المميزة */}
      <section ref={carsRef} className="py-16 px-4 bg-gray-50">
        <div className="container mx-auto">
          <h2 className="section-title">{t.home.featuredCars}</h2>
          
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12"
            variants={staggerContainerVariants}
            initial="hidden"
            animate={carsInView ? "visible" : "hidden"}
          >
            {featuredCars.map((car, index) => (
              <motion.div key={car.id} variants={fadeInUpVariants}>
                <Card className="h-full flex flex-col">
                  <div className="relative h-48 bg-gray-200 rounded-t-lg overflow-hidden">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-xl font-bold text-gray-700">{car.title}</span>
                    </div>
                    <div className="absolute top-2 left-2 bg-[var(--accent)] text-white px-2 py-1 rounded-md text-sm">
                      {car.year}
                    </div>
                  </div>
                  
                  <CardContent className="flex-grow flex flex-col">
                    <div className="mb-2 flex justify-between items-start">
                      <h3 className="font-bold text-lg">{car.title}</h3>
                      <span className="font-bold text-[var(--primary)]">{car.price.toLocaleString()} ريال</span>
                    </div>
                    
                    <div className="flex space-x-4 space-x-reverse text-sm text-gray-500 mb-3">
                      <div className="flex items-center">
                        <svg className="w-4 h-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>{car.mileage === 0 ? 'جديدة' : `${car.mileage.toLocaleString()} كم`}</span>
                      </div>
                    </div>
                    
                    <ul className="mb-4 text-sm space-y-1 flex-grow">
                      {car.features.slice(0, 2).map((feature, i) => (
                        <li key={i} className="flex items-center">
                          <svg className="w-4 h-4 ml-1 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          {feature}
                        </li>
                      ))}
                    </ul>
                    
                    <div className="flex gap-2">
                      <Link href={`/cars/${car.id}`}>
                        <a className="btn-primary flex-grow text-center text-sm">التفاصيل</a>
                      </Link>
                      <button className="btn-secondary text-sm p-2">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                        </svg>
                      </button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
          
          <div className="text-center mt-12">
            <Link href="/cars">
              <a className="btn-primary inline-flex items-center">
                عرض جميع السيارات
                <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </a>
            </Link>
          </div>
        </div>
      </section>

      {/* زر فتح الشات */}
      <Button
        onClick={openChat}
        className="fixed z-40 left-6 bottom-6 w-14 h-14 rounded-full shadow-lg"
        size="icon"
      >
        <MessageCircle className="w-6 h-6" />
      </Button>
      
      {/* مكون الشات */}
      <CarChat isOpen={isChatOpen} onClose={closeChat} />
    </div>
  );
};

export default HomePage;