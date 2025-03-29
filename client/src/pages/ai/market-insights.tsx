import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, BarChart2, TrendingUp, TrendingDown, DollarSign } from 'lucide-react';
import { translations } from '@/i18n';
import { useQuery } from '@tanstack/react-query';

const t = translations.ar.ai;

interface MarketTrend {
  period: string;
  date: string;
  topMakes: { make: string; count: number; trend: number }[];
  priceRanges: { range: string; count: number; trend: number }[];
  mostViewed: { id: number; title: string; views: number; price: number; imageUrl: string }[];
  marketHealth: number;
  priceIndex: { current: number; previous: number; change: number };
  volumeIndex: { current: number; previous: number; change: number };
  averagePrices: { make: string; avgPrice: number; trend: number }[];
  topModels: { model: string; make: string; count: number }[];
  predictions: { 
    make: string;
    model: string;
    currentPrice: number;
    prediction: { threeMonths: number; sixMonths: number; year: number };
  }[];
}

const MarketInsightsPage: React.FC = () => {
  const [selectedPeriod, setSelectedPeriod] = useState<string>('monthly');

  const {
    data: marketTrends,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ['/api/ai/market-trends', selectedPeriod],
    queryFn: async () => {
      const response = await fetch(`/api/ai/market-trends?period=${selectedPeriod}`);
      if (!response.ok) {
        throw new Error('فشل في جلب بيانات السوق');
      }
      return response.json();
    },
  });

  const handlePeriodChange = (period: string) => {
    setSelectedPeriod(period);
  };

  // تنسيق السعر للعرض
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ar-SA', {
      style: 'currency',
      currency: 'SAR',
      maximumFractionDigits: 0,
    }).format(price);
  };

  // تنسيق النسبة المئوية
  const formatPercentage = (percentage: number) => {
    const formattedValue = Math.abs(percentage).toFixed(1);
    return `${percentage >= 0 ? '+' : '-'}${formattedValue}%`;
  };

  // تحديد لون الاتجاه (أخضر للإيجابي، أحمر للسلبي)
  const getTrendColor = (trend: number) => {
    return trend >= 0 ? 'text-green-600' : 'text-red-600';
  };

  // تحديد أيقونة الاتجاه
  const TrendIcon = ({ trend }: { trend: number }) => {
    return trend >= 0 ? (
      <TrendingUp className="h-4 w-4 text-green-600" />
    ) : (
      <TrendingDown className="h-4 w-4 text-red-600" />
    );
  };

  // تحويل مؤشر صحة السوق إلى نص
  const getMarketHealthText = (health: number) => {
    if (health > 80) return 'ممتاز';
    if (health > 60) return 'جيد';
    if (health > 40) return 'متوسط';
    if (health > 20) return 'ضعيف';
    return 'ضعيف جداً';
  };

  return (
    <div className="container mx-auto py-12 px-4">
      {/* العنوان الرئيسي */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center mb-12"
      >
        <h1 className="text-4xl font-bold mb-4">{t.market_insights_title}</h1>
        <p className="text-lg text-gray-600 max-w-3xl mx-auto">
          {t.market_insights_description}
        </p>
      </motion.div>

      {/* أزرار اختيار الفترة */}
      <div className="flex justify-center mb-8">
        <div className="inline-flex rounded-md shadow-sm">
          <Button
            variant={selectedPeriod === 'weekly' ? 'default' : 'outline'}
            onClick={() => handlePeriodChange('weekly')}
            className="rounded-r-none"
          >
            أسبوعي
          </Button>
          <Button
            variant={selectedPeriod === 'monthly' ? 'default' : 'outline'}
            onClick={() => handlePeriodChange('monthly')}
            className="rounded-none border-x-0"
          >
            شهري
          </Button>
          <Button
            variant={selectedPeriod === 'quarterly' ? 'default' : 'outline'}
            onClick={() => handlePeriodChange('quarterly')}
            className="rounded-l-none"
          >
            ربع سنوي
          </Button>
        </div>
      </div>

      {/* حالة التحميل */}
      {isLoading && (
        <div className="flex flex-col items-center justify-center py-12">
          <Loader2 className="h-12 w-12 text-primary animate-spin mb-4" />
          <h3 className="text-xl font-medium text-gray-700">جاري تحميل تحليلات السوق...</h3>
        </div>
      )}

      {/* حالة الخطأ */}
      {isError && (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <BarChart2 className="h-12 w-12 text-red-500 mb-4" />
          <h3 className="text-xl font-medium text-gray-800 mb-2">تعذر تحميل تحليلات السوق</h3>
          <p className="text-gray-600 mb-6 max-w-md">
            حدث خطأ أثناء محاولة جلب بيانات تحليلات السوق. يرجى المحاولة مرة أخرى لاحقاً.
          </p>
          <Button onClick={() => refetch()} className="flex items-center gap-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="lucide lucide-refresh-cw"
            >
              <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
              <path d="M21 3v5h-5" />
              <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
              <path d="M3 21v-5h5" />
            </svg>
            حاول مرة أخرى
          </Button>
        </div>
      )}

      {/* عرض البيانات */}
      {!isLoading && !isError && marketTrends && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          {/* المؤشرات الرئيسية */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {/* مؤشر صحة السوق */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-col items-center text-center">
                  <div className="mb-2">
                    <BarChart2 className="h-10 w-10 text-primary" />
                  </div>
                  <h3 className="text-lg font-medium mb-1">صحة السوق</h3>
                  <div className="text-3xl font-bold">{marketTrends.marketHealth}%</div>
                  <p className="text-sm text-gray-500 mt-1">
                    {getMarketHealthText(marketTrends.marketHealth)}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* مؤشر الأسعار */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-col items-center text-center">
                  <div className="mb-2">
                    <DollarSign className="h-10 w-10 text-primary" />
                  </div>
                  <h3 className="text-lg font-medium mb-1">مؤشر الأسعار</h3>
                  <div className="text-3xl font-bold">{marketTrends.priceIndex.current}</div>
                  <p
                    className={`text-sm mt-1 flex items-center ${getTrendColor(
                      marketTrends.priceIndex.change
                    )}`}
                  >
                    <TrendIcon trend={marketTrends.priceIndex.change} />
                    <span className="mr-1">{formatPercentage(marketTrends.priceIndex.change)}</span>
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* حجم المبيعات */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-col items-center text-center">
                  <div className="mb-2">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="40"
                      height="40"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="text-primary"
                    >
                      <circle cx="8" cy="21" r="1" />
                      <circle cx="19" cy="21" r="1" />
                      <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium mb-1">حجم المبيعات</h3>
                  <div className="text-3xl font-bold">{marketTrends.volumeIndex.current}</div>
                  <p
                    className={`text-sm mt-1 flex items-center ${getTrendColor(
                      marketTrends.volumeIndex.change
                    )}`}
                  >
                    <TrendIcon trend={marketTrends.volumeIndex.change} />
                    <span className="mr-1">{formatPercentage(marketTrends.volumeIndex.change)}</span>
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* توقعات السوق */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-col items-center text-center">
                  <div className="mb-2">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="40"
                      height="40"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="text-primary"
                    >
                      <path d="M2 22h20" />
                      <path d="M10 3v19" />
                      <path d="M10 4 3 9l7 5-7 5" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium mb-1">اتجاه السوق</h3>
                  <div
                    className={`text-xl font-bold ${
                      marketTrends.priceIndex.change >= 0 
                        ? 'text-green-600' 
                        : 'text-red-600'
                    }`}
                  >
                    {marketTrends.priceIndex.change >= 0 ? 'تصاعدي' : 'هبوطي'}
                  </div>
                  <p className="text-sm text-gray-500 mt-1">
                    خلال {selectedPeriod === 'weekly' ? 'الأسبوع' : selectedPeriod === 'monthly' ? 'الشهر' : 'الربع'} الماضي
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* أكثر الماركات تداولاً */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            <Card>
              <CardHeader>
                <CardTitle>أكثر الماركات تداولاً</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {marketTrends.topMakes.map((item, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center">
                        <span className="bg-primary text-white w-6 h-6 rounded-full flex items-center justify-center text-xs mr-3">
                          {index + 1}
                        </span>
                        <span className="font-medium">{item.make}</span>
                      </div>
                      <div className="flex items-center">
                        <span className="text-gray-600 font-semibold mr-2">{item.count} سيارة</span>
                        <span className={`flex items-center ${getTrendColor(item.trend)}`}>
                          {formatPercentage(item.trend)}
                          <TrendIcon trend={item.trend} />
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>متوسط أسعار الماركات</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {marketTrends.averagePrices.map((item, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center">
                        <span className="bg-primary/10 text-primary w-6 h-6 rounded-full flex items-center justify-center text-xs mr-3">
                          {index + 1}
                        </span>
                        <span className="font-medium">{item.make}</span>
                      </div>
                      <div className="flex items-center">
                        <span className="text-gray-600 font-semibold mr-2">
                          {formatPrice(item.avgPrice)}
                        </span>
                        <span className={`flex items-center ${getTrendColor(item.trend)}`}>
                          {formatPercentage(item.trend)}
                          <TrendIcon trend={item.trend} />
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* نطاقات الأسعار والأكثر مشاهدة */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            <Card>
              <CardHeader>
                <CardTitle>تقسيم نطاقات الأسعار</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {marketTrends.priceRanges.map((item, index) => (
                    <div key={index}>
                      <div className="flex justify-between mb-1">
                        <span>{item.range}</span>
                        <span className="flex items-center">
                          {item.count} سيارة
                          <span className={`mr-2 flex items-center ${getTrendColor(item.trend)}`}>
                            {formatPercentage(item.trend)}
                            <TrendIcon trend={item.trend} />
                          </span>
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div
                          className="bg-primary h-2.5 rounded-full"
                          style={{
                            width: `${(item.count / Math.max(...marketTrends.priceRanges.map(r => r.count))) * 100}%`,
                          }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>السيارات الأكثر مشاهدة</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {marketTrends.mostViewed.map((car, index) => (
                    <div key={index} className="flex">
                      <div className="w-24 h-16 overflow-hidden rounded-md flex-shrink-0">
                        <img src={car.imageUrl} alt={car.title} className="w-full h-full object-cover" />
                      </div>
                      <div className="mr-4 flex-grow">
                        <h4 className="font-medium text-gray-800 line-clamp-1">{car.title}</h4>
                        <div className="flex justify-between items-center mt-1">
                          <span className="text-primary font-semibold">{formatPrice(car.price)}</span>
                          <span className="text-gray-500 text-sm">{car.views} مشاهدة</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* التوقعات المستقبلية */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>توقعات أسعار السيارات المستقبلية</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-right">
                  <thead>
                    <tr className="border-b">
                      <th className="pb-3 text-gray-500 font-medium">الماركة</th>
                      <th className="pb-3 text-gray-500 font-medium">الموديل</th>
                      <th className="pb-3 text-gray-500 font-medium">السعر الحالي</th>
                      <th className="pb-3 text-gray-500 font-medium">بعد 3 أشهر</th>
                      <th className="pb-3 text-gray-500 font-medium">بعد 6 أشهر</th>
                      <th className="pb-3 text-gray-500 font-medium">بعد سنة</th>
                    </tr>
                  </thead>
                  <tbody>
                    {marketTrends.predictions.map((item, index) => (
                      <tr key={index} className="border-b">
                        <td className="py-4 font-medium">{item.make}</td>
                        <td className="py-4">{item.model}</td>
                        <td className="py-4">{formatPrice(item.currentPrice)}</td>
                        <td className="py-4">
                          <div className="flex items-center">
                            {formatPrice(item.prediction.threeMonths)}
                            <span
                              className={`mr-2 text-xs ${
                                item.prediction.threeMonths >= item.currentPrice
                                  ? 'text-green-600'
                                  : 'text-red-600'
                              }`}
                            >
                              {formatPercentage(
                                ((item.prediction.threeMonths - item.currentPrice) / item.currentPrice) * 100
                              )}
                            </span>
                          </div>
                        </td>
                        <td className="py-4">
                          <div className="flex items-center">
                            {formatPrice(item.prediction.sixMonths)}
                            <span
                              className={`mr-2 text-xs ${
                                item.prediction.sixMonths >= item.currentPrice
                                  ? 'text-green-600'
                                  : 'text-red-600'
                              }`}
                            >
                              {formatPercentage(
                                ((item.prediction.sixMonths - item.currentPrice) / item.currentPrice) * 100
                              )}
                            </span>
                          </div>
                        </td>
                        <td className="py-4">
                          <div className="flex items-center">
                            {formatPrice(item.prediction.year)}
                            <span
                              className={`mr-2 text-xs ${
                                item.prediction.year >= item.currentPrice
                                  ? 'text-green-600'
                                  : 'text-red-600'
                              }`}
                            >
                              {formatPercentage(
                                ((item.prediction.year - item.currentPrice) / item.currentPrice) * 100
                              )}
                            </span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="mt-4 text-xs text-gray-500">
                * التوقعات المستقبلية مبنية على تحليل اتجاهات السوق والبيانات التاريخية وقد تختلف عن الأسعار الفعلية.
              </p>
            </CardContent>
          </Card>

          {/* تاريخ التحديث */}
          <div className="text-center text-gray-500 text-sm">
            آخر تحديث: {marketTrends.date}
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default MarketInsightsPage;