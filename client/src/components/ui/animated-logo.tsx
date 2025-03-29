import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import gsap from 'gsap';

export interface AnimatedLogoProps {
  size?: 'small' | 'medium' | 'large';
  color?: string;
  onAnimationComplete?: () => void;
}

/**
 * شعار متحرك لسيارة يستخدم للتحميل وشاشة البداية
 */
export function AnimatedLogo({
  size = 'medium',
  color = '#0f52ba',
  onAnimationComplete
}: AnimatedLogoProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const carRef = useRef<SVGSVGElement>(null);
  const nameRef = useRef<HTMLDivElement>(null);
  const taglineRef = useRef<HTMLDivElement>(null);

  // حساب حجم الشعار
  const dimensions = {
    small: { width: 80, height: 40 },
    medium: { width: 120, height: 60 },
    large: { width: 160, height: 80 },
  };

  const { width, height } = dimensions[size];

  // تكوين GSAP لرسوم متحركة أكثر تعقيدًا
  useEffect(() => {
    if (!containerRef.current || !carRef.current || !nameRef.current) return;

    const tl = gsap.timeline({
      onComplete: () => onAnimationComplete && onAnimationComplete(),
    });

    // رسوم متحركة للسيارة
    tl.fromTo(
      carRef.current,
      { x: -100, opacity: 0 },
      { x: 0, opacity: 1, duration: 1, ease: 'power2.out' }
    );

    // العجلات تدور
    const wheels = carRef.current.querySelectorAll('.wheel');
    tl.to(wheels, { rotation: 360, duration: 1.5, repeat: 1, ease: 'none' }, '-=0.5');

    // العلامة التجارية تظهر
    tl.fromTo(
      nameRef.current,
      { y: 20, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.8, ease: 'back.out(1.7)' },
      '-=0.8'
    );

    // شعار العلامة التجارية
    if (taglineRef.current) {
      tl.fromTo(
        taglineRef.current,
        { y: 10, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.6, ease: 'power1.out' },
        '-=0.4'
      );
    }

    // نبضة خفيفة في النهاية
    tl.to(
      containerRef.current,
      { scale: 1.05, duration: 0.3, yoyo: true, repeat: 1, ease: 'power1.inOut' },
      '+=0.2'
    );

    return () => {
      tl.kill();
    };
  }, [onAnimationComplete]);

  return (
    <div 
      ref={containerRef} 
      className="flex flex-col items-center justify-center"
      style={{ width, height: height * 2 }}
    >
      {/* رسم السيارة */}
      <svg 
        ref={carRef}
        width={width} 
        height={height} 
        viewBox="0 0 100 50" 
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* جسم السيارة */}
        <rect x="20" y="25" width="60" height="15" rx="5" fill={color} />
        <rect x="10" y="32" width="80" height="8" rx="3" fill={color} />
        
        {/* المصابيح الأمامية */}
        <rect x="87" y="33" width="3" height="5" rx="1" fill="#ffcc00" />
        
        {/* النوافذ */}
        <rect x="25" y="15" width="50" height="12" rx="4" fill={color} />
        <rect x="28" y="17" width="44" height="8" rx="2" fill="#a0d2f8" />
        
        {/* العجلات */}
        <circle className="wheel" cx="25" cy="40" r="6" fill="#333" />
        <circle cx="25" cy="40" r="3" fill="#666" />
        <circle className="wheel" cx="75" cy="40" r="6" fill="#333" />
        <circle cx="75" cy="40" r="3" fill="#666" />
      </svg>
      
      {/* اسم الشعار */}
      <div 
        ref={nameRef} 
        className="mt-3 font-bold text-center"
        style={{ 
          fontSize: size === 'small' ? '1rem' : size === 'medium' ? '1.5rem' : '2rem', 
          color
        }}
      >
        Car<span style={{ color: '#ff6b00' }}>Xpert</span>
      </div>
      
      {/* سطر الوصف */}
      {size !== 'small' && (
        <div 
          ref={taglineRef} 
          className="mt-1 text-center text-gray-600"
          style={{ 
            fontSize: size === 'medium' ? '0.75rem' : '1rem'
          }}
        >
          منصة السيارات الذكية
        </div>
      )}
    </div>
  );
}

export function SplashScreen({ onComplete }: { onComplete: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white">
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
        >
          <AnimatedLogo 
            size="large" 
            onAnimationComplete={onComplete} 
          />
        </motion.div>
      </AnimatePresence>
    </div>
  );
}