import React, { useEffect } from 'react';
import MainLayout from '@/components/layouts/main-layout';
import { CarChat } from '@/components/ui/car-chat';
import { t } from '@/i18n';
import { motion } from 'framer-motion';
import { Car, Sparkles, Bot, ArrowRight, MessageSquare, Zap } from 'lucide-react';
import { useLoading } from '@/context/loading-context';

export default function CarAIPage() {
  const { startLoading, stopLoading } = useLoading();

  useEffect(() => {
    startLoading('ai');
    const timer = setTimeout(() => {
      stopLoading();
    }, 1000);
    
    return () => clearTimeout(timer);
  }, [startLoading, stopLoading]);

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-8"
        >
          <div className="relative inline-block mb-4">
            <Bot className="h-12 w-12 text-indigo-600" />
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="absolute -top-1 -right-1 bg-yellow-500 rounded-full p-1"
            >
              <Sparkles className="h-4 w-4 text-white" />
            </motion.div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {t('ai.chat.title')}
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            {t('ai.chat.description') || 'مستشارك الذكي المتخصص في عالم السيارات، يقدم لك إجابات مخصصة وتفاعلية لكل استفساراتك'}
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="md:col-span-2">
            <CarChat className="w-full shadow-lg" />
          </div>
          
          <div className="space-y-6">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="bg-white p-5 rounded-xl shadow-md"
            >
              <h3 className="font-semibold text-lg mb-3 flex items-center text-gray-800">
                <MessageSquare className="mr-2 h-5 w-5 text-indigo-600" />
                {t('ai.chat.whatCanIAsk')}
              </h3>
              <ul className="space-y-3">
                <li className="flex items-start">
                  <ArrowRight className="h-5 w-5 text-indigo-600 mt-0.5 ml-2 shrink-0" />
                  <span>{t('ai.chat.examples.buying') || 'ما هي أفضل سيارة عائلية لعام 2023؟'}</span>
                </li>
                <li className="flex items-start">
                  <ArrowRight className="h-5 w-5 text-indigo-600 mt-0.5 ml-2 shrink-0" />
                  <span>{t('ai.chat.examples.maintenance') || 'متى يجب تغيير زيت المحرك؟'}</span>
                </li>
                <li className="flex items-start">
                  <ArrowRight className="h-5 w-5 text-indigo-600 mt-0.5 ml-2 shrink-0" />
                  <span>{t('ai.chat.examples.comparison') || 'قارن بين تويوتا كامري وهوندا أكورد'}</span>
                </li>
                <li className="flex items-start">
                  <ArrowRight className="h-5 w-5 text-indigo-600 mt-0.5 ml-2 shrink-0" />
                  <span>{t('ai.chat.examples.price') || 'ما هو متوسط سعر مرسيدس E-Class موديل 2020؟'}</span>
                </li>
              </ul>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="bg-indigo-50 p-5 rounded-xl border border-indigo-100"
            >
              <h3 className="font-semibold text-lg mb-3 flex items-center text-indigo-800">
                <Zap className="mr-2 h-5 w-5 text-indigo-600" />
                {t('ai.chat.features')}
              </h3>
              <ul className="space-y-3 text-indigo-900">
                <li className="flex items-start">
                  <div className="shrink-0 w-5 h-5 rounded-full bg-indigo-200 flex items-center justify-center mr-2 mt-0.5">
                    <Car className="h-3 w-3 text-indigo-700" />
                  </div>
                  <span>{t('ai.chat.featureList.expert') || 'خبرة متخصصة في مجال السيارات'}</span>
                </li>
                <li className="flex items-start">
                  <div className="shrink-0 w-5 h-5 rounded-full bg-indigo-200 flex items-center justify-center mr-2 mt-0.5">
                    <Car className="h-3 w-3 text-indigo-700" />
                  </div>
                  <span>{t('ai.chat.featureList.knowledge') || 'معلومات شاملة عن الموديلات والميزات'}</span>
                </li>
                <li className="flex items-start">
                  <div className="shrink-0 w-5 h-5 rounded-full bg-indigo-200 flex items-center justify-center mr-2 mt-0.5">
                    <Car className="h-3 w-3 text-indigo-700" />
                  </div>
                  <span>{t('ai.chat.featureList.issues') || 'تشخيص المشكلات وتقديم الحلول'}</span>
                </li>
                <li className="flex items-start">
                  <div className="shrink-0 w-5 h-5 rounded-full bg-indigo-200 flex items-center justify-center mr-2 mt-0.5">
                    <Car className="h-3 w-3 text-indigo-700" />
                  </div>
                  <span>{t('ai.chat.featureList.voice') || 'دعم الإدخال الصوتي للمحادثة'}</span>
                </li>
              </ul>
            </motion.div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}