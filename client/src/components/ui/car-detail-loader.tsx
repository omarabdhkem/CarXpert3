import React from 'react';
import { motion } from 'framer-motion';
import { t } from '@/i18n';

export interface CarDetailLoaderProps {
  message?: string;
}

export function CarDetailLoader({ message = t('loading_car_details') }: CarDetailLoaderProps) {
  return (
    <div className="flex h-full min-h-[400px] w-full flex-col items-center justify-center gap-6 p-8">
      <CarAnimation />
      <div className="text-center">
        <p className="text-lg font-medium">{message}</p>
        <LoadingProgress />
      </div>
    </div>
  );
}

function CarAnimation() {
  return (
    <div className="relative h-40 w-80">
      {/* قاعدة السيارة / الهيكل */}
      <motion.div
        className="absolute bottom-10 left-1/2 h-16 w-64 -translate-x-1/2 rounded-t-3xl bg-primary/70"
        initial={{ scaleX: 0.8, opacity: 0 }}
        animate={{ scaleX: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
      />

      {/* سقف السيارة */}
      <motion.div
        className="absolute bottom-26 left-1/2 h-10 w-40 -translate-x-1/2 rounded-t-2xl bg-primary"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      />

      {/* نوافذ السيارة */}
      <motion.div
        className="absolute bottom-22 left-1/2 h-6 w-36 -translate-x-1/2 rounded-t-lg bg-gray-700"
        initial={{ scaleY: 0, opacity: 0 }}
        animate={{ scaleY: 1, opacity: 0.7 }}
        transition={{ duration: 0.4, delay: 0.3 }}
      />

      {/* العجلات المتحركة */}
      <motion.div
        className="absolute bottom-6 left-10 h-8 w-8 rounded-full border-4 border-gray-600 bg-gray-300"
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
      />
      <motion.div
        className="absolute bottom-6 right-10 h-8 w-8 rounded-full border-4 border-gray-600 bg-gray-300"
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
      />

      {/* العوادم والدخان */}
      <motion.div
        className="absolute -left-2 bottom-8"
        animate={{ x: -40, opacity: [0, 1, 0] }}
        transition={{ repeat: Infinity, duration: 2, ease: "easeOut" }}
      >
        <motion.div
          className="h-3 w-3 rounded-full bg-gray-400/60"
          animate={{ scale: [1, 2] }}
          transition={{ repeat: Infinity, duration: 2, ease: "easeOut" }}
        />
      </motion.div>
      <motion.div
        className="absolute -left-4 bottom-9"
        animate={{ x: -30, opacity: [0, 1, 0] }}
        transition={{ repeat: Infinity, duration: 2, ease: "easeOut", delay: 0.5 }}
      >
        <motion.div
          className="h-2 w-2 rounded-full bg-gray-400/60"
          animate={{ scale: [1, 1.5] }}
          transition={{ repeat: Infinity, duration: 2, ease: "easeOut" }}
        />
      </motion.div>

      {/* المصابيح الأمامية */}
      <motion.div
        className="absolute bottom-12 right-5 h-4 w-4 rounded-full bg-yellow-300"
        animate={{ opacity: [1, 0.4, 1] }}
        transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute bottom-16 right-6 h-3 w-3 rounded-full bg-yellow-300"
        animate={{ opacity: [1, 0.6, 1] }}
        transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut", delay: 0.2 }}
      />

      {/* الطريق المتحرك */}
      <motion.div
        className="absolute bottom-0 h-2 w-full bg-gray-700"
      />
      {[...Array(5)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute bottom-0 h-2 w-10 bg-gray-100"
          initial={{ x: -50 + i * 70 }}
          animate={{ x: [-50 + i * 70, 400 - 50 + i * 70] }}
          transition={{ 
            repeat: Infinity, 
            duration: 2, 
            ease: "linear",
            repeatType: "loop",
          }}
        />
      ))}
    </div>
  );
}

function LoadingProgress() {
  return (
    <div className="mt-4 h-2 w-60 overflow-hidden rounded-full bg-gray-200">
      <motion.div
        className="h-full bg-primary"
        initial={{ width: "0%" }}
        animate={{ width: "100%" }}
        transition={{ duration: 3, ease: "easeInOut" }}
      />
    </div>
  );
}