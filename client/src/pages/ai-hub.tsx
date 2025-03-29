import React, { useEffect } from 'react';
import { Link } from 'wouter';
import MainLayout from '@/components/layouts/main-layout';
import { Card } from '@/components/ui/card';
import { t } from '@/i18n';
import { motion } from 'framer-motion';
import { Bot, Camera, Search, Sparkles, ExternalLink, BrainCog, Lightbulb, HelpCircle, Car, Gauge, Palette } from 'lucide-react';
import { useLoading } from '@/context/loading-context';

const FeatureCard = ({ icon, title, description, link, delay = 0 }: {
  icon: React.ReactNode;
  title: string;
  description: string;
  link: string;
  delay?: number;
}) => (
  <Link href={link}>
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      className="cursor-pointer group"
    >
      <Card className="bg-white h-full flex flex-col overflow-hidden border-2 border-gray-200 transition-all duration-300 group-hover:border-indigo-400 group-hover:shadow-lg">
        <div className="h-[120px] bg-gradient-to-r from-indigo-500 to-blue-600 flex items-center justify-center relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('/patterns/circuit-board.png')] opacity-20"></div>
          <div className="text-white text-4xl">
            {icon}
          </div>
          <motion.div
            className="absolute bottom-0 right-0 bg-white p-1 rounded-tl-lg text-indigo-600"
            whileHover={{ scale: 1.1 }}
            initial={{ opacity: 0.8 }}
            animate={{ opacity: 1 }}
          >
            <ExternalLink className="h-5 w-5" />
          </motion.div>
        </div>
        <div className="p-5 flex-1 flex flex-col">
          <h3 className="text-xl font-semibold mb-2 text-gray-900">{title}</h3>
          <p className="text-gray-600 mb-4 flex-1">{description}</p>
          <div className="text-indigo-600 font-medium group-hover:text-indigo-800 transition-colors duration-300 flex items-center">
            {t('ai.hub.explore')}
            <span className="ml-1 transition-transform duration-300 group-hover:translate-x-1">→</span>
          </div>
        </div>
      </Card>
    </motion.div>
  </Link>
);

export default function AIHubPage() {
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
      <div className="bg-gradient-to-b from-indigo-50 to-white">
        <div className="container mx-auto px-4 py-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12"
          >
            <div className="relative inline-block mb-4">
              <div className="p-4 bg-indigo-600 rounded-2xl inline-block">
                <BrainCog className="h-12 w-12 text-white" />
              </div>
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
                className="absolute -top-2 -right-2 bg-yellow-400 rounded-full p-1.5"
              >
                <Sparkles className="h-4 w-4 text-indigo-900" />
              </motion.div>
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              {t('ai.hub.title') || 'مركز الذكاء الاصطناعي'}
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              {t('ai.hub.description') || 'مجموعة من الأدوات الذكية المدعومة بالذكاء الاصطناعي لمساعدتك في كل ما يتعلق بعالم السيارات'}
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard
              icon={<Bot />}
              title={t('ai.hub.chat.title') || 'محادثة ذكية متخصصة'}
              description={t('ai.hub.chat.description') || 'تحدث مع خبير سيارات افتراضي واحصل على إجابات لكل أسئلتك حول السيارات والصيانة والشراء'}
              link="/car-ai"
              delay={0.1}
            />
            
            <FeatureCard
              icon={<Camera />}
              title={t('ai.hub.analyzer.title') || 'محلل صور السيارات'}
              description={t('ai.hub.analyzer.description') || 'قم بتحميل صورة لسيارة واحصل على معلومات تفصيلية عنها وحالتها بتقنية الذكاء الاصطناعي'}
              link="/ai/car-analyzer"
              delay={0.2}
            />
            
            <FeatureCard
              icon={<Lightbulb />}
              title={t('ai.hub.recommendations.title') || 'توصيات سيارات مخصصة'}
              description={t('ai.hub.recommendations.description') || 'احصل على توصيات مخصصة للسيارات بناءً على احتياجاتك وتفضيلاتك وميزانيتك'}
              link="/ai/recommendations"
              delay={0.3}
            />
            
            <FeatureCard
              icon={<Search />}
              title={t('ai.hub.voiceSearch.title') || 'بحث صوتي ذكي'}
              description={t('ai.hub.voiceSearch.description') || 'ابحث عن سيارات باستخدام صوتك وتحدث بلغة طبيعية للعثور على ما تبحث عنه بسرعة'}
              link="/advanced-search"
              delay={0.4}
            />

            <FeatureCard
              icon={<Gauge />}
              title={t('ai.hub.evaluation.title') || 'تقييم السيارات'}
              description={t('ai.hub.evaluation.description') || 'أدخل معلومات سيارتك واحصل على تقييم فوري لقيمتها السوقية وحالتها'}
              link="/car-evaluation"
              delay={0.5}
            />

            <FeatureCard
              icon={<Palette />}
              title={t('ai.hub.configurator.title') || 'مصمم السيارات التفاعلي'}
              description={t('ai.hub.configurator.description') || 'صمم سيارتك المثالية باختيار الألوان والميزات والمواصفات وشاهد التغييرات فورياً'}
              link="/car-configurator"
              delay={0.6}
            />
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.7 }}
            className="mt-16 bg-white p-6 rounded-xl shadow-md"
          >
            <div className="flex items-start gap-4">
              <div className="shrink-0 mt-1">
                <HelpCircle className="h-6 w-6 text-indigo-600" />
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2 text-gray-900">
                  {t('ai.hub.assistanceTitle') || 'كيف يمكن للذكاء الاصطناعي مساعدتك؟'}
                </h3>
                <p className="text-gray-600 mb-4">
                  {t('ai.hub.assistanceDescription') || 'نحن نستخدم تقنيات الذكاء الاصطناعي المتقدمة لتحسين تجربتك في عالم السيارات من خلال:'}
                </p>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2">
                    <Car className="h-5 w-5 mt-0.5 text-indigo-600 shrink-0" />
                    <span>{t('ai.hub.benefit1') || 'تقديم معلومات شاملة ودقيقة عن مختلف موديلات السيارات والمواصفات'}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Car className="h-5 w-5 mt-0.5 text-indigo-600 shrink-0" />
                    <span>{t('ai.hub.benefit2') || 'تحليل احتياجاتك وتفضيلاتك لاقتراح السيارات المناسبة لك'}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Car className="h-5 w-5 mt-0.5 text-indigo-600 shrink-0" />
                    <span>{t('ai.hub.benefit3') || 'توفير تجربة تفاعلية وشخصية تناسب اهتماماتك'}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Car className="h-5 w-5 mt-0.5 text-indigo-600 shrink-0" />
                    <span>{t('ai.hub.benefit4') || 'مساعدتك في اتخاذ قرارات مستنيرة عند شراء أو صيانة سيارتك'}</span>
                  </li>
                </ul>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </MainLayout>
  );
}