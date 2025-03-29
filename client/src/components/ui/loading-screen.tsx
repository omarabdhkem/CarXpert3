import React from 'react';
import { motion } from 'framer-motion';
import { Car, Bot, Zap, Loader2 } from 'lucide-react';
import { t } from '@/i18n';

interface LoadingScreenProps {
  variant?: string;
}

export const LoadingScreen: React.FC<LoadingScreenProps> = ({ variant = 'default' }) => {
  const renderContent = () => {
    switch (variant) {
      case 'ai':
        return (
          <div className="flex flex-col items-center justify-center">
            <div className="relative">
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="bg-indigo-600 w-20 h-20 rounded-2xl flex items-center justify-center"
              >
                <Bot className="text-white w-10 h-10" />
              </motion.div>
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                className="absolute -top-2 -right-2 bg-yellow-500 w-6 h-6 rounded-full flex items-center justify-center"
              >
                <Zap className="text-white w-4 h-4" />
              </motion.div>
            </div>
            <h3 className="mt-6 text-xl font-medium text-gray-800">
              {t('ai.loading')}
            </h3>
            <p className="mt-2 text-gray-600 max-w-md text-center">
              {t('ai.loadingDescription') || 'جاري تجهيز الذكاء الاصطناعي للمساعدة في استفساراتك عن السيارات...'}
            </p>
          </div>
        );
      
      case 'car':
        return (
          <div className="flex flex-col items-center justify-center">
            <div className="relative">
              <motion.div
                animate={{ x: [-20, 20, -20] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                className="bg-blue-600 w-20 h-20 rounded-2xl flex items-center justify-center"
              >
                <Car className="text-white w-10 h-10" />
              </motion.div>
              <motion.div
                animate={{ opacity: [0, 1, 0] }}
                transition={{ duration: 1, repeat: Infinity }}
                className="absolute -top-1 left-4 bg-blue-300 w-3 h-6 rounded-full"
              />
              <motion.div
                animate={{ opacity: [0, 1, 0] }}
                transition={{ duration: 1, repeat: Infinity, delay: 0.3 }}
                className="absolute -top-1 left-8 bg-blue-300 w-3 h-6 rounded-full"
              />
              <motion.div
                animate={{ opacity: [0, 1, 0] }}
                transition={{ duration: 1, repeat: Infinity, delay: 0.6 }}
                className="absolute -top-1 left-12 bg-blue-300 w-3 h-6 rounded-full"
              />
            </div>
            <h3 className="mt-6 text-xl font-medium text-gray-800">
              {t('car.loading')}
            </h3>
            <p className="mt-2 text-gray-600 max-w-md text-center">
              {t('car.loadingDescription') || 'جاري تحميل معلومات السيارات...'}
            </p>
          </div>
        );
      
      default:
        return (
          <div className="flex flex-col items-center justify-center">
            <div className="relative">
              <div className="w-20 h-20 rounded-2xl flex items-center justify-center bg-[var(--primary)]">
                <Loader2 className="text-white w-10 h-10 animate-spin" />
              </div>
            </div>
            <h3 className="mt-6 text-xl font-medium text-gray-800">
              {t('common.loading')}
            </h3>
          </div>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white bg-opacity-90 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3 }}
      >
        {renderContent()}
      </motion.div>
    </div>
  );
};