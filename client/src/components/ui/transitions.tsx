import React, { ReactNode } from 'react';
import { useLocation } from 'wouter';
import { AnimatePresence, motion, Variants } from 'framer-motion';

export interface RouteTransitionProps {
  children: ReactNode;
}

// تعريف تأثير الانتقال الافتراضي
const defaultVariants: Variants = {
  initial: { opacity: 0, y: 20 },
  enter: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeInOut' } },
  exit: { opacity: 0, y: -20, transition: { duration: 0.3, ease: 'easeInOut' } }
};

// تأثير ظهور متتالي من اليمين لليسار
const slideRightVariants: Variants = {
  initial: { opacity: 0, x: 50 },
  enter: { opacity: 1, x: 0, transition: { duration: 0.4, ease: 'easeInOut' } },
  exit: { opacity: 0, x: -50, transition: { duration: 0.3, ease: 'easeInOut' } }
};

// تأثير ظهور من أسفل لأعلى
const slideUpVariants: Variants = {
  initial: { opacity: 0, y: 70 },
  enter: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
  exit: { opacity: 0, y: -50, transition: { duration: 0.3, ease: 'easeIn' } }
};

// تأثير سيارة تتحرك من اليسار إلى اليمين
const carDriveVariants: Variants = {
  initial: { x: '-100%', opacity: 0 },
  enter: { x: 0, opacity: 1, transition: { duration: 0.6, ease: 'easeOut' } },
  exit: { x: '100%', opacity: 0, transition: { duration: 0.4, ease: 'easeIn' } }
};

// تأثير دوران لمحرك السيارة
const engineVariants: Variants = {
  initial: { opacity: 0, scale: 0.8, rotate: -20 },
  enter: { 
    opacity: 1, 
    scale: 1, 
    rotate: 0,
    transition: { duration: 0.5, ease: [0.34, 1.56, 0.64, 1] }
  },
  exit: { 
    opacity: 0, 
    scale: 0.9, 
    rotate: 10,
    transition: { duration: 0.3, ease: 'easeIn' }
  }
};

/**
 * مكون انتقال مخصص للتنقل بين الصفحات
 * يستخدم AnimatePresence من framer-motion لإدارة خروج العناصر من DOM
 */
export function RouteTransition({ children }: RouteTransitionProps) {
  const [location] = useLocation();

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location}
        initial="initial"
        animate="enter"
        exit="exit"
        variants={defaultVariants}
        className="min-h-screen"
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}

/**
 * انتقال سيارة متحركة بين الصفحات
 */
export function CarRouteTransition({ children }: RouteTransitionProps) {
  const [location] = useLocation();

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location}
        initial="initial"
        animate="enter"
        exit="exit"
        variants={carDriveVariants}
        className="min-h-screen"
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}

/**
 * انتقال محرك سيارة يعمل بين الصفحات
 */
export function EngineRouteTransition({ children }: RouteTransitionProps) {
  const [location] = useLocation();

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location}
        initial="initial"
        animate="enter"
        exit="exit"
        variants={engineVariants}
        className="min-h-screen"
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}

/**
 * انتقال مخصص للصفحة الرئيسية مع نمط مميز للسيارات
 */
export function HomePageTransition({ children }: RouteTransitionProps) {
  const [location] = useLocation();

  // تحديد نوع الانتقال بناءً على المسار
  let variants = defaultVariants;
  if (location.startsWith('/cars/')) {
    variants = carDriveVariants;
  } else if (location.startsWith('/ai/')) {
    variants = engineVariants;
  } else if (location.startsWith('/dealerships')) {
    variants = slideRightVariants;
  } else if (location === '/car-configurator') {
    variants = slideUpVariants;
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location}
        initial="initial"
        animate="enter"
        exit="exit"
        variants={variants}
        className="min-h-screen"
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}