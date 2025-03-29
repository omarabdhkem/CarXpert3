import React, { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import { t } from '@/i18n';
import { useMutation } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Loader2, ChevronRight, ChevronLeft } from 'lucide-react';

// الأنماط المشتركة
interface Question {
  id: string;
  question: string;
  options: Array<{
    id: string;
    text: string;
    value: string;
    icon?: string; // ايموجي أو أيقونة
    personalityTrait?: string;
  }>;
  allowMultiple?: boolean;
  category: 'personality' | 'preference' | 'practical';
}

// مجموعة الأسئلة
const questions: Question[] = [
  {
    id: 'usage',
    question: 'كيف تخطط لاستخدام سيارتك في معظم الأوقات؟',
    options: [
      { id: 'daily', text: 'للتنقل اليومي في المدينة', value: 'city', icon: '🏙️', personalityTrait: 'practical' },
      { id: 'family', text: 'للرحلات العائلية والمساحة', value: 'family', icon: '👪', personalityTrait: 'family-oriented' },
      { id: 'adventure', text: 'للمغامرات والطرق الوعرة', value: 'adventure', icon: '🏔️', personalityTrait: 'adventurous' },
      { id: 'luxury', text: 'للرفاهية والتميز', value: 'luxury', icon: '✨', personalityTrait: 'prestigious' }
    ],
    category: 'practical'
  },
  {
    id: 'budget',
    question: 'ما هي ميزانيتك التقريبية؟',
    options: [
      { id: 'economic', text: 'اقتصادية (أقل من 100,000)', value: 'low', icon: '💰', personalityTrait: 'budget-conscious' },
      { id: 'mid', text: 'متوسطة (100,000 - 250,000)', value: 'medium', icon: '💰💰', personalityTrait: 'balanced' },
      { id: 'high', text: 'عالية (250,000 - 500,000)', value: 'high', icon: '💰💰💰', personalityTrait: 'quality-focused' },
      { id: 'premium', text: 'فاخرة (أكثر من 500,000)', value: 'premium', icon: '💰💰💰💰', personalityTrait: 'luxury-oriented' }
    ],
    category: 'practical'
  },
  {
    id: 'driving_style',
    question: 'كيف تصف أسلوبك في القيادة؟',
    options: [
      { id: 'calm', text: 'هادئ ومتأني', value: 'relaxed', icon: '😌', personalityTrait: 'relaxed' },
      { id: 'balanced', text: 'متوازن', value: 'balanced', icon: '😊', personalityTrait: 'balanced' },
      { id: 'dynamic', text: 'ديناميكي ونشط', value: 'dynamic', icon: '😃', personalityTrait: 'energetic' },
      { id: 'sporty', text: 'رياضي وسريع', value: 'sporty', icon: '🏎️', personalityTrait: 'thrill-seeking' }
    ],
    category: 'personality'
  },
  {
    id: 'features',
    question: 'ما هي الميزات الأكثر أهمية بالنسبة لك؟',
    options: [
      { id: 'safety', text: 'أنظمة الأمان والسلامة', value: 'safety', icon: '🛡️', personalityTrait: 'safety-conscious' },
      { id: 'comfort', text: 'الراحة والرفاهية', value: 'comfort', icon: '🛋️', personalityTrait: 'comfort-oriented' },
      { id: 'technology', text: 'التكنولوجيا والاتصال', value: 'tech', icon: '📱', personalityTrait: 'tech-savvy' },
      { id: 'performance', text: 'الأداء والقوة', value: 'performance', icon: '⚡', personalityTrait: 'performance-focused' },
      { id: 'efficiency', text: 'كفاءة استهلاك الوقود', value: 'efficiency', icon: '🍃', personalityTrait: 'eco-conscious' }
    ],
    allowMultiple: true,
    category: 'preference'
  },
  {
    id: 'personality',
    question: 'أي من هذه العبارات تصفك بشكل أفضل؟',
    options: [
      { id: 'trendy', text: 'أحب مواكبة أحدث الصيحات', value: 'trendy', icon: '🤩', personalityTrait: 'trend-follower' },
      { id: 'practical', text: 'أفضل العملية والموثوقية', value: 'practical', icon: '🧠', personalityTrait: 'practical' },
      { id: 'unique', text: 'أبحث عن التميز والتفرد', value: 'unique', icon: '🦄', personalityTrait: 'individualistic' },
      { id: 'environmental', text: 'أهتم بالبيئة والاستدامة', value: 'eco', icon: '🌱', personalityTrait: 'environmentally-conscious' }
    ],
    category: 'personality'
  },
  {
    id: 'social_image',
    question: 'كيف تريد أن تظهر سيارتك انطباعًا عنك؟',
    options: [
      { id: 'successful', text: 'ناجح ومهني', value: 'professional', icon: '💼', personalityTrait: 'achievement-oriented' },
      { id: 'adventurous', text: 'مغامر ومنفتح', value: 'adventurous', icon: '🧗', personalityTrait: 'adventurous' },
      { id: 'family', text: 'عائلي ومسؤول', value: 'family', icon: '👨‍👩‍👧‍👦', personalityTrait: 'family-oriented' },
      { id: 'stylish', text: 'عصري وأنيق', value: 'stylish', icon: '💫', personalityTrait: 'style-conscious' }
    ],
    category: 'personality'
  },
  {
    id: 'free_time',
    question: 'ما الذي تفضل القيام به في وقت فراغك؟',
    options: [
      { id: 'outdoor', text: 'أنشطة خارجية ومغامرات', value: 'outdoor', icon: '🏕️', personalityTrait: 'outdoorsy' },
      { id: 'social', text: 'التواصل الاجتماعي مع الأصدقاء والعائلة', value: 'social', icon: '🎉', personalityTrait: 'social' },
      { id: 'relax', text: 'الاسترخاء والراحة', value: 'relax', icon: '🧘', personalityTrait: 'comfort-seeking' },
      { id: 'cultural', text: 'الأنشطة الثقافية والفنية', value: 'cultural', icon: '🎭', personalityTrait: 'cultured' }
    ],
    category: 'personality'
  },
  {
    id: 'additional_needs',
    question: 'هل لديك أي احتياجات إضافية؟',
    options: [
      { id: 'cargo', text: 'مساحة تخزين كبيرة', value: 'cargo', icon: '📦', personalityTrait: 'practical' },
      { id: 'kids', text: 'ملائمة للأطفال', value: 'kids', icon: '👶', personalityTrait: 'family-oriented' },
      { id: 'pets', text: 'ملائمة للحيوانات الأليفة', value: 'pets', icon: '🐕', personalityTrait: 'pet-friendly' },
      { id: 'accessibility', text: 'سهولة الوصول والاستخدام', value: 'accessibility', icon: '♿', personalityTrait: 'accessibility-focused' },
      { id: 'none', text: 'لا يوجد', value: 'none', icon: '✅', personalityTrait: 'straightforward' }
    ],
    allowMultiple: true,
    category: 'practical'
  },
  {
    id: 'natural_query',
    question: 'أخبرنا بالمزيد عن احتياجاتك بكلماتك الخاصة',
    options: [], // هذا سؤال مفتوح يستخدم حقل نص
    category: 'preference'
  }
];

interface CarRecommendationQuizProps {
  onComplete?: (results: any) => void;
}

const CarRecommendationQuiz: React.FC<CarRecommendationQuizProps> = ({ onComplete }) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [textAnswer, setTextAnswer] = useState('');
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [personalityProfile, setPersonalityProfile] = useState<string[]>([]);
  
  // استخدام TanStack Query للتعامل مع API
  const recommendationMutation = useMutation({
    mutationFn: async (quizData: any) => {
      const response = await apiRequest('POST', '/api/ai/advanced-search', quizData);
      return await response.json();
    },
    onSuccess: (data) => {
      setRecommendations(data.results || []);
      generatePersonalityProfile();
      setQuizCompleted(true);
      if (onComplete) {
        onComplete(data);
      }
    },
    onError: (error) => {
      toast({
        title: t('error'),
        description: t('car_recommendation_quiz.error_getting_recommendations'),
        variant: 'destructive',
      });
      console.error('خطأ في الحصول على التوصيات:', error);
    },
  });

  const currentQuestion = questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === questions.length - 1;
  const isTextQuestion = currentQuestion?.options.length === 0;

  // التنقل بين الأسئلة
  const handleNext = () => {
    if (isTextQuestion && !textAnswer.trim()) {
      toast({
        title: t('warning'),
        description: t('car_recommendation_quiz.please_answer_question'),
        variant: 'warning',
      });
      return;
    }
    
    if (isLastQuestion) {
      if (isTextQuestion) {
        setAnswers(prev => ({
          ...prev,
          [currentQuestion.id]: textAnswer
        }));
      }
      submitQuiz();
    } else {
      if (isTextQuestion) {
        setAnswers(prev => ({
          ...prev,
          [currentQuestion.id]: textAnswer
        }));
        setTextAnswer('');
      }
      setCurrentQuestionIndex(prevIndex => prevIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prevIndex => prevIndex - 1);
      
      // استعادة الإجابة النصية إذا كان السؤال السابق نصيًا
      const prevQuestion = questions[currentQuestionIndex - 1];
      if (prevQuestion.options.length === 0) {
        setTextAnswer(answers[prevQuestion.id] || '');
      }
    }
  };

  // معالجة اختيار الإجابة
  const handleOptionSelect = (questionId: string, optionId: string) => {
    const question = questions.find(q => q.id === questionId);
    
    if (question?.allowMultiple) {
      // للأسئلة متعددة الاختيارات
      setAnswers(prev => {
        const currentSelections = prev[questionId] || [];
        if (currentSelections.includes(optionId)) {
          // إزالة الخيار إذا كان محددًا بالفعل
          return {
            ...prev,
            [questionId]: currentSelections.filter(id => id !== optionId)
          };
        } else {
          // إضافة الخيار
          return {
            ...prev,
            [questionId]: [...currentSelections, optionId]
          };
        }
      });
    } else {
      // للأسئلة ذات الاختيار الواحد
      setAnswers(prev => ({
        ...prev,
        [questionId]: [optionId]
      }));
      
      // التقدم تلقائيًا إلى السؤال التالي بعد الاختيار
      if (currentQuestionIndex < questions.length - 1) {
        setTimeout(() => {
          setCurrentQuestionIndex(prevIndex => prevIndex + 1);
        }, 500);
      }
    }
  };

  // معالجة تغيير الإجابة النصية
  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setTextAnswer(e.target.value);
  };

  // تقديم الاختبار واستلام التوصيات
  const submitQuiz = () => {
    // استخراج السمات الشخصية من الإجابات
    const personalityTraits = extractPersonalityTraits();
    
    // إعداد بيانات البحث المتقدم
    const searchData = {
      naturalLanguageQuery: answers.natural_query || '',
      personalityTraits,
      // يمكن إضافة معايير بحث أخرى من الإجابات
      priceRange: getPriceRange(),
      features: getSelectedFeatures(),
      // إضافة بيانات إضافية هنا
    };

    // تخزين السمات الشخصية للعرض
    setPersonalityProfile(personalityTraits);
    
    // إرسال البيانات للحصول على التوصيات
    recommendationMutation.mutate(searchData);
  };

  // استخراج السمات الشخصية من الإجابات
  const extractPersonalityTraits = (): string[] => {
    const traits = new Set<string>();
    
    // المرور على جميع الأسئلة والإجابات لاستخراج السمات الشخصية
    Object.entries(answers).forEach(([questionId, selectedOptionIds]) => {
      if (Array.isArray(selectedOptionIds)) {
        selectedOptionIds.forEach(optionId => {
          // البحث عن السؤال
          const question = questions.find(q => q.id === questionId);
          if (question) {
            // البحث عن الخيار
            const option = question.options.find(o => o.id === optionId);
            if (option?.personalityTrait) {
              traits.add(option.personalityTrait);
            }
          }
        });
      }
    });
    
    return Array.from(traits);
  };

  // استخراج نطاق السعر من الإجابات
  const getPriceRange = (): [number, number] => {
    const budgetSelection = answers.budget?.[0];
    
    switch (budgetSelection) {
      case 'low':
        return [0, 100000];
      case 'medium':
        return [100000, 250000];
      case 'high':
        return [250000, 500000];
      case 'premium':
        return [500000, 10000000];
      default:
        return [0, 10000000]; // نطاق افتراضي
    }
  };

  // استخراج الميزات المختارة
  const getSelectedFeatures = (): string[] => {
    const featuresSelection = answers.features || [];
    return featuresSelection;
  };

  // توليد ملف الشخصية للعرض
  const generatePersonalityProfile = () => {
    // بالفعل تم وضع السمات الشخصية في متغير personalityProfile
  };

  // عرض النتائج والتوصيات
  const renderResults = () => {
    if (recommendationMutation.isPending) {
      return (
        <div className="flex flex-col items-center justify-center p-10">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <p className="mt-4 text-lg">{t('car_recommendation_quiz.analyzing_preferences')}</p>
        </div>
      );
    }

    return (
      <div className="p-6">
        <h2 className="text-2xl font-bold mb-6">{t('car_recommendation_quiz.your_car_recommendations')}</h2>
        
        {personalityProfile.length > 0 && (
          <div className="mb-8 p-4 bg-muted rounded-lg">
            <h3 className="text-xl font-semibold mb-2">{t('car_recommendation_quiz.personality_profile')}</h3>
            <div className="flex flex-wrap gap-2">
              {personalityProfile.map(trait => (
                <span key={trait} className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm">
                  {trait}
                </span>
              ))}
            </div>
          </div>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {recommendations.map((car, index) => (
            <div 
              key={car.id} 
              className={`bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden transition-all duration-300 hover:shadow-lg ${index < 3 ? 'border-2 border-primary' : ''}`}
            >
              {index < 3 && (
                <div className="bg-primary text-white py-1 px-3 text-center">
                  {index === 0 ? '🏆 ' + t('car_recommendation_quiz.top_match') : 
                   index === 1 ? '🥈 ' + t('car_recommendation_quiz.excellent_match') : 
                   '🥉 ' + t('car_recommendation_quiz.great_match')}
                </div>
              )}
              
              <div className="p-4">
                <img 
                  src={car.imageUrl || `https://via.placeholder.com/300x200?text=${car.brand}+${car.model}`} 
                  alt={`${car.brand} ${car.model}`}
                  className="w-full h-48 object-cover rounded-md mb-4"
                />
                
                <h3 className="text-xl font-bold">{car.brand} {car.model}</h3>
                <p className="text-muted-foreground">{car.year}</p>
                
                <div className="flex justify-between items-center mt-2">
                  <span className="text-lg font-semibold">{car.price?.toLocaleString()} ريال</span>
                  {car.category && (
                    <span className="px-2 py-1 bg-muted text-sm rounded-full">{car.category}</span>
                  )}
                </div>
                
                {car.features && (
                  <div className="mt-4">
                    <h4 className="text-sm font-semibold mb-1">{t('car_recommendation_quiz.key_features')}</h4>
                    <div className="flex flex-wrap gap-1">
                      {car.features.slice(0, 3).map((feature: string, i: number) => (
                        <span key={i} className="px-2 py-1 bg-secondary/10 text-xs rounded-full">{feature}</span>
                      ))}
                      {car.features.length > 3 && (
                        <span className="px-2 py-1 bg-secondary/10 text-xs rounded-full">+{car.features.length - 3}</span>
                      )}
                    </div>
                  </div>
                )}
                
                <div className="mt-4 flex justify-end">
                  <a 
                    href={`/car/${car.id}`} 
                    className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors"
                  >
                    {t('car_recommendation_quiz.view_details')}
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {recommendations.length === 0 && (
          <div className="text-center p-10">
            <p className="text-xl">{t('car_recommendation_quiz.no_matches')}</p>
            <p className="mt-2">{t('car_recommendation_quiz.try_different_criteria')}</p>
          </div>
        )}
        
        <div className="mt-8 text-center">
          <button 
            onClick={() => {
              setQuizCompleted(false);
              setCurrentQuestionIndex(0);
              setAnswers({});
              setTextAnswer('');
            }}
            className="px-6 py-2 bg-secondary text-white rounded-md hover:bg-secondary/90 transition-colors"
          >
            {t('car_recommendation_quiz.retake_quiz')}
          </button>
        </div>
      </div>
    );
  };

  // عرض سؤال معين
  const renderQuestion = () => {
    const question = questions[currentQuestionIndex];
    
    return (
      <div className="p-6">
        <div className="mb-4 text-sm font-medium text-muted-foreground">
          {t('car_recommendation_quiz.question')} {currentQuestionIndex + 1} / {questions.length}
        </div>
        
        <h2 className="text-2xl font-bold mb-6">{question.question}</h2>
        
        {question.options.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {question.options.map(option => {
              const isSelected = answers[question.id]?.includes(option.id);
              
              return (
                <button
                  key={option.id}
                  onClick={() => handleOptionSelect(question.id, option.id)}
                  className={`p-4 rounded-lg border-2 text-start transition-all ${
                    isSelected 
                      ? 'border-primary bg-primary/10' 
                      : 'border-muted hover:border-primary/50'
                  }`}
                >
                  <div className="flex items-center">
                    {option.icon && (
                      <span className="text-2xl ml-3 rtl:ml-0 rtl:mr-3">{option.icon}</span>
                    )}
                    <div>
                      <div className="font-medium">{option.text}</div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        ) : (
          <textarea
            value={textAnswer}
            onChange={handleTextChange}
            placeholder={t('car_recommendation_quiz.describe_needs')}
            className="w-full p-4 h-32 rounded-lg border-2 border-muted focus:border-primary outline-none resize-none"
          />
        )}
        
        <div className="mt-8 flex justify-between">
          <button
            onClick={handlePrevious}
            disabled={currentQuestionIndex === 0}
            className={`px-4 py-2 rounded-md flex items-center ${
              currentQuestionIndex === 0
                ? 'opacity-50 cursor-not-allowed'
                : 'bg-secondary text-white hover:bg-secondary/90'
            }`}
          >
            <ChevronRight className="h-5 w-5 ml-1 rtl:rotate-180" />
            {t('car_recommendation_quiz.previous')}
          </button>
          
          <button
            onClick={handleNext}
            className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 flex items-center"
          >
            {isLastQuestion 
              ? t('car_recommendation_quiz.finish') 
              : t('car_recommendation_quiz.next')}
            <ChevronLeft className="h-5 w-5 mr-1 rtl:rotate-180" />
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-background rounded-xl shadow-md max-w-4xl mx-auto overflow-hidden">
      {quizCompleted ? renderResults() : renderQuestion()}
    </div>
  );
};

export default CarRecommendationQuiz;