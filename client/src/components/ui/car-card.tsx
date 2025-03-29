import React, { useState } from 'react';
import { Link } from 'wouter';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import AnimatedButton from '@/components/ui/animated-button';

interface CarCardProps {
  car: {
    id: number;
    title: string;
    year: number;
    price: number;
    mileage: number;
    features: string[];
    image?: string;
  };
  className?: string;
}

export default function CarCard({ car, className = '' }: CarCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isFavorited, setIsFavorited] = useState(false);

  const toggleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsFavorited(!isFavorited);
  };

  const featureAnimation = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <motion.div 
      className={`h-full ${className}`}
      whileHover={{ y: -5 }}
      transition={{ duration: 0.3 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
    >
      <Link href={`/cars/${car.id}`}>
        <a className="block h-full">
          <Card className="h-full flex flex-col overflow-hidden shadow-md hover:shadow-lg transition-shadow border border-gray-200">
            <div className="relative h-48 bg-gray-200 overflow-hidden">
              {car.image ? (
                <motion.img 
                  src={car.image}
                  alt={car.title}
                  className="object-cover h-full w-full"
                  initial={{ scale: 1 }}
                  animate={{ scale: isHovered ? 1.05 : 1 }}
                  transition={{ duration: 0.3 }}
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-xl font-bold text-gray-400">{car.title}</span>
                </div>
              )}
              <div className="absolute top-2 left-2 bg-[var(--accent)] text-white px-2 py-1 rounded-md text-sm">
                {car.year}
              </div>
              <motion.button 
                className={`absolute top-2 right-2 p-2 rounded-full backdrop-blur-sm ${isFavorited ? 'bg-red-500 text-white' : 'bg-white/70 text-gray-700'}`}
                onClick={toggleFavorite}
                whileTap={{ scale: 0.9 }}
              >
                <svg 
                  className="w-5 h-5" 
                  fill={isFavorited ? "currentColor" : "none"} 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" 
                  />
                </svg>
              </motion.button>
            </div>
            
            <CardContent className="flex-grow flex flex-col p-4">
              <div className="mb-2 flex justify-between items-start">
                <h3 className="font-bold text-lg text-gray-900">{car.title}</h3>
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
              
              <div className="mb-4 flex-grow">
                <motion.ul 
                  className="space-y-1 text-sm"
                  variants={{
                    hidden: {},
                    visible: {
                      transition: {
                        staggerChildren: 0.05,
                      },
                    },
                  }}
                  initial="hidden"
                  animate={isHovered ? "visible" : "hidden"}
                >
                  {car.features.slice(0, 2).map((feature, i) => (
                    <motion.li key={i} className="flex items-center" variants={featureAnimation}>
                      <svg className="w-4 h-4 ml-1 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      {feature}
                    </motion.li>
                  ))}
                </motion.ul>
              </div>
              
              <div className="flex gap-2 mt-auto">
                <AnimatedButton 
                  variant="primary" 
                  fullWidth 
                  size="sm"
                  icon={
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  }
                >
                  عرض التفاصيل
                </AnimatedButton>
              </div>
            </CardContent>
          </Card>
        </a>
      </Link>
    </motion.div>
  );
}