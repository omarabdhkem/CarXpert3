import React, { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { useLocation } from 'wouter';

/**
 * مكون لانتقالات الصفحة المتحركة
 */
export function PageTransition({ 
  children, 
  type = 'fade',
  duration = 0.5
}: {
  children: ReactNode;
  type?: 'fade' | 'slide' | 'car' | 'engine' | 'zoom' | 'none';
  duration?: number;
}) {
  const [location] = useLocation();

  // لا يتم تطبيق أي تأثيرات انتقالية
  if (type === 'none') {
    return <>{children}</>;
  }

  // التأثيرات المتاحة
  const variants = {
    // ظهور وإخفاء تدريجي
    fade: {
      initial: { opacity: 0 },
      animate: { opacity: 1, transition: { duration } },
      exit: { opacity: 0, transition: { duration: duration * 0.8 } }
    },
    // انزلاق من الأسفل
    slide: {
      initial: { opacity: 0, y: 30 },
      animate: { opacity: 1, y: 0, transition: { duration, ease: 'easeOut' } },
      exit: { opacity: 0, y: -20, transition: { duration: duration * 0.8, ease: 'easeIn' } }
    },
    // تأثير السيارة
    car: {
      initial: { x: '-100%', opacity: 0 },
      animate: { x: 0, opacity: 1, transition: { duration: duration * 1.2, ease: 'easeOut' } },
      exit: { x: '100%', opacity: 0, transition: { duration: duration, ease: 'easeIn' } }
    },
    // تأثير المحرك
    engine: {
      initial: { opacity: 0, scale: 0.9, rotate: -5 },
      animate: { 
        opacity: 1, 
        scale: 1, 
        rotate: 0, 
        transition: { duration, ease: [0.34, 1.56, 0.64, 1] } 
      },
      exit: { 
        opacity: 0, 
        scale: 0.9, 
        rotate: 5, 
        transition: { duration: duration * 0.8, ease: 'easeIn' } 
      }
    },
    // تأثير التكبير
    zoom: {
      initial: { opacity: 0, scale: 0.8 },
      animate: { opacity: 1, scale: 1, transition: { duration } },
      exit: { opacity: 0, scale: 1.1, transition: { duration: duration * 0.8 } }
    }
  };

  // اختيار التأثير المناسب حسب نوع الانتقال
  const currentVariant = variants[type] || variants.fade;

  return (
    <motion.div
      key={location} // هذا يضمن إعادة رسم المكون عند تغيير المسار
      initial="initial"
      animate="animate"
      exit="exit"
      variants={currentVariant}
      className="h-full w-full"
    >
      {children}
    </motion.div>
  );
}

/**
 * مكون انتقال مخصص للصفحة الرئيسية
 */
export function HomePageTransition({ children }: { children: ReactNode }) {
  return (
    <PageTransition type="fade" duration={0.7}>
      {children}
    </PageTransition>
  );
}

/**
 * مكون انتقال مخصص لصفحات السيارات
 */
export function CarPageTransition({ children }: { children: ReactNode }) {
  return (
    <PageTransition type="car" duration={0.6}>
      {children}
    </PageTransition>
  );
}

/**
 * مكون انتقال مخصص لصفحات الذكاء الاصطناعي
 */
export function AIPageTransition({ children }: { children: ReactNode }) {
  return (
    <PageTransition type="engine" duration={0.5}>
      {children}
    </PageTransition>
  );
}