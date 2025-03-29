import React, { useState, useEffect } from 'react';
import { useParams, useLocation } from 'wouter';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { t } from '@/i18n';
import { apiRequest, queryClient } from '@/lib/queryClient';
import MainLayout from '@/components/layouts/main-layout';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Loader2, StarIcon, ThumbsUp, ThumbsDown, Zap, ArrowLeft } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { useAuth } from '@/hooks/use-auth';

const CarEvaluation = () => {
  const { id } = useParams();
  const carId = parseInt(id as string);
  const [_, navigate] = useLocation();
  const { toast } = useToast();
  const { user } = useAuth();
  const [userComments, setUserComments] = useState('');
  const [evaluation, setEvaluation] = useState<any>(null);
  const [animateProgress, setAnimateProgress] = useState(false);

  // استعلام لجلب بيانات السيارة
  const { data: car, isLoading: isLoadingCar, error: carError } = useQuery({
    queryKey: ['/api/cars', carId],
    queryFn: async () => {
      const response = await fetch(`/api/cars/${carId}`);
      if (!response.ok) {
        throw new Error('فشل في جلب بيانات السيارة');
      }
      return response.json();
    },
    enabled: !isNaN(carId),
  });

  // متحكم لإرسال طلب التقييم
  const evaluationMutation = useMutation({
    mutationFn: async (data: { carId: number; userComments: string }) => {
      const response = await apiRequest('POST', '/api/ai/evaluate-car', data);
      return response.json();
    },
    onSuccess: (data) => {
      setEvaluation(data.evaluation);
      setAnimateProgress(true);
      // إضافة التقييم إلى ذاكرة التخزين المؤقت
      queryClient.setQueryData(['/api/evaluations', carId], data.evaluation);
    },
    onError: (error) => {
      toast({
        title: t('error'),
        description: t('car_evaluation.evaluation_error'),
        variant: 'destructive',
      });
      console.error('خطأ في تقييم السيارة:', error);
    },
  });

  // التحقق من وجود تقييم سابق في ذاكرة التخزين المؤقت
  useEffect(() => {
    const cachedEvaluation = queryClient.getQueryData(['/api/evaluations', carId]);
    if (cachedEvaluation) {
      setEvaluation(cachedEvaluation);
      setAnimateProgress(true);
    }
  }, [carId]);

  // تقديم طلب التقييم
  const handleSubmitForEvaluation = () => {
    if (!user) {
      toast({
        title: t('warning'),
        description: t('car_evaluation.login_required'),
        variant: 'warning',
      });
      navigate('/auth');
      return;
    }

    if (!userComments.trim()) {
      toast({
        title: t('warning'),
        description: t('car_evaluation.comments_required'),
        variant: 'warning',
      });
      return;
    }

    evaluationMutation.mutate({ carId, userComments });
  };

  // التعامل مع تغيير التعليقات
  const handleCommentsChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setUserComments(e.target.value);
  };

  // العودة إلى صفحة السيارة
  const handleBackToCarDetails = () => {
    navigate(`/car/${carId}`);
  };

  if (isLoadingCar) {
    return (
      <MainLayout>
        <div className="container mx-auto py-10 flex justify-center items-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
      </MainLayout>
    );
  }

  if (carError || !car) {
    return (
      <MainLayout>
        <div className="container mx-auto py-10">
          <Card>
            <CardHeader>
              <CardTitle>{t('error')}</CardTitle>
              <CardDescription>{t('car_evaluation.car_not_found')}</CardDescription>
            </CardHeader>
            <CardFooter>
              <Button onClick={() => navigate('/')}>{t('back_to_home')}</Button>
            </CardFooter>
          </Card>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="container mx-auto py-8 px-4">
        <Button
          variant="ghost"
          className="mb-4 flex items-center"
          onClick={handleBackToCarDetails}
        >
          <ArrowLeft className="ml-2 h-4 w-4 rtl:rotate-180" />
          {t('car_evaluation.back_to_car')}
        </Button>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* معلومات السيارة */}
          <Card className="overflow-hidden">
            <CardHeader className="bg-primary text-primary-foreground">
              <CardTitle>{t('car_evaluation.car_details')}</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {car.imageUrl && (
                <img
                  src={car.imageUrl}
                  alt={`${car.brand} ${car.model}`}
                  className="w-full h-64 object-cover"
                />
              )}
              <div className="p-6">
                <h2 className="text-2xl font-bold mb-4">
                  {car.brand} {car.model} {car.year}
                </h2>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">{t('car_evaluation.price')}</p>
                    <p className="font-semibold">{car.price?.toLocaleString()} ريال</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">{t('car_evaluation.category')}</p>
                    <p className="font-semibold">{car.category}</p>
                  </div>
                  {car.color && (
                    <div>
                      <p className="text-sm text-muted-foreground">{t('car_evaluation.color')}</p>
                      <p className="font-semibold">{car.color}</p>
                    </div>
                  )}
                  {car.engine && (
                    <div>
                      <p className="text-sm text-muted-foreground">{t('car_evaluation.engine')}</p>
                      <p className="font-semibold">{car.engine}</p>
                    </div>
                  )}
                </div>

                {car.features && car.features.length > 0 && (
                  <div className="mt-6">
                    <p className="text-sm text-muted-foreground mb-2">{t('car_evaluation.features')}</p>
                    <div className="flex flex-wrap gap-2">
                      {car.features.map((feature: string, index: number) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-muted rounded-full text-sm"
                        >
                          {feature}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* نموذج التقييم / نتائج التقييم */}
          <div>
            {!evaluation ? (
              <Card>
                <CardHeader>
                  <CardTitle>{t('car_evaluation.get_ai_evaluation')}</CardTitle>
                  <CardDescription>
                    {t('car_evaluation.enter_comments_description')}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Textarea
                    placeholder={t('car_evaluation.comments_placeholder')}
                    className="min-h-32"
                    value={userComments}
                    onChange={handleCommentsChange}
                  />
                </CardContent>
                <CardFooter className="flex justify-end">
                  <Button
                    onClick={handleSubmitForEvaluation}
                    disabled={evaluationMutation.isPending}
                  >
                    {evaluationMutation.isPending ? (
                      <>
                        <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                        {t('car_evaluation.evaluating')}
                      </>
                    ) : (
                      t('car_evaluation.evaluate_now')
                    )}
                  </Button>
                </CardFooter>
              </Card>
            ) : (
              <Card>
                <CardHeader className="bg-gradient-to-br from-primary to-primary-dark text-primary-foreground">
                  <div className="flex items-center justify-between">
                    <CardTitle>{t('car_evaluation.ai_evaluation')}</CardTitle>
                    <span className="text-4xl">{evaluation.emoji}</span>
                  </div>
                </CardHeader>
                <CardContent className="pt-6">
                  {/* التقييم العام */}
                  <div className="mb-6">
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="font-semibold text-lg">{t('car_evaluation.overall_rating')}</h3>
                      <div className="flex items-center">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <StarIcon
                            key={star}
                            className={`h-5 w-5 ${
                              star <= Math.round(evaluation.rating / 2)
                                ? 'text-yellow-500 fill-yellow-500'
                                : 'text-gray-300'
                            }`}
                          />
                        ))}
                        <span className="ml-2 font-bold">{evaluation.rating}/10</span>
                      </div>
                    </div>
                    <Progress
                      value={animateProgress ? (evaluation.rating * 10) : 0}
                      className="h-2"
                    />
                  </div>

                  {/* نقاط القوة والضعف */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div className="bg-green-50 dark:bg-green-950/20 p-4 rounded-lg">
                      <h3 className="font-semibold text-green-700 dark:text-green-400 flex items-center mb-3">
                        <ThumbsUp className="mr-2 h-5 w-5" />
                        {t('car_evaluation.strengths')}
                      </h3>
                      <ul className="space-y-2">
                        {evaluation.strengths.map((strength: string, index: number) => (
                          <li key={index} className="flex items-start">
                            <span className="text-green-500 mr-2">✓</span>
                            <span>{strength}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="bg-red-50 dark:bg-red-950/20 p-4 rounded-lg">
                      <h3 className="font-semibold text-red-700 dark:text-red-400 flex items-center mb-3">
                        <ThumbsDown className="mr-2 h-5 w-5" />
                        {t('car_evaluation.weaknesses')}
                      </h3>
                      <ul className="space-y-2">
                        {evaluation.weaknesses.map((weakness: string, index: number) => (
                          <li key={index} className="flex items-start">
                            <span className="text-red-500 mr-2">✗</span>
                            <span>{weakness}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* تفاصيل التقييم الإضافية */}
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-semibold">{t('car_evaluation.daily_usability')}</h3>
                      <p className="text-muted-foreground">{evaluation.dailyUsability}</p>
                    </div>
                    <div>
                      <h3 className="font-semibold">{t('car_evaluation.value_for_money')}</h3>
                      <p className="text-muted-foreground">{evaluation.valueForMoney}</p>
                    </div>
                  </div>

                  {/* التوصية العامة */}
                  <div className="mt-6 p-4 bg-primary/10 rounded-lg border border-primary/20">
                    <h3 className="font-semibold flex items-center">
                      <Zap className="mr-2 h-5 w-5 text-primary" />
                      {t('car_evaluation.recommendation')}
                    </h3>
                    <p className="mt-1">{evaluation.recommendation}</p>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button variant="outline" onClick={() => setEvaluation(null)}>
                    {t('car_evaluation.new_evaluation')}
                  </Button>
                  <Button onClick={handleBackToCarDetails}>
                    {t('car_evaluation.back_to_details')}
                  </Button>
                </CardFooter>
              </Card>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default CarEvaluation;