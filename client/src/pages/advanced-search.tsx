import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import MainLayout from '@/components/layouts/main-layout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { Separator } from '@/components/ui/separator';
import { t } from '@/i18n';
import { Loader2, Search, Sliders, BrainCircuit, Heart, Filter } from 'lucide-react';
import CarRecommendationQuiz from '@/components/ai/car-recommendation-quiz';

// واجهة لنتائج البحث
interface SearchResults {
  results: any[];
  count: number;
  searchMetadata?: {
    aiEnhanced: boolean;
    timestamp: string;
  };
}

const AdvancedSearch = () => {
  const [activeTab, setActiveTab] = useState('traditional');
  const [searchResults, setSearchResults] = useState<SearchResults | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [favorites, setFavorites] = useState<number[]>([]);

  // الاستعلام عن بيانات الفلترة
  const { data: filterData, isLoading: isLoadingFilters } = useQuery({
    queryKey: ['/api/filter-options'],
    queryFn: async () => {
      // في بيئة الإنتاج، هذا سيكون استدعاء API حقيقي لجلب الخيارات
      // لأغراض العرض، سنستخدم بيانات تجريبية
      return {
        brands: ['تويوتا', 'هوندا', 'نيسان', 'مرسيدس', 'بي ام دبليو', 'اودي', 'هيونداي', 'كيا'],
        categories: ['سيدان', 'دفع رباعي', 'رياضية', 'عائلية', 'هاتشباك', 'بيك أب'],
        years: Array.from({ length: 10 }, (_, i) => 2024 - i),
        features: ['نظام ملاحة', 'كاميرا خلفية', 'تحكم مناخي', 'فتحة سقف', 'مقاعد جلدية', 'بلوتوث', 'شاشة لمس', 'مثبت سرعة', 'نظام صوتي فاخر']
      };
    },
  });

  // حالة البحث التقليدي
  const [traditionalSearchState, setTraditionalSearchState] = useState({
    keywords: '',
    priceRange: [0, 1000000] as [number, number],
    brands: [] as string[],
    categories: [] as string[],
    years: [] as number[],
    features: [] as string[],
  });

  // تحديث حالة البحث التقليدي
  const updateTraditionalSearch = (field: string, value: any) => {
    setTraditionalSearchState(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // إرسال البحث التقليدي
  const handleTraditionalSearch = async () => {
    setIsSearching(true);
    try {
      // في بيئة الإنتاج، هذا سيكون استدعاء لـ API حقيقي
      const response = await fetch('/api/ai/advanced-search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(traditionalSearchState),
      });
      
      if (!response.ok) {
        throw new Error('فشل في الحصول على نتائج البحث');
      }
      
      const data = await response.json();
      setSearchResults(data);
    } catch (error) {
      console.error('خطأ في البحث:', error);
    } finally {
      setIsSearching(false);
    }
  };

  // معالجة نتائج اختبار التوصية
  const handleQuizComplete = (results: SearchResults) => {
    setSearchResults(results);
    // التبديل إلى علامة التبويب "نتائج البحث"
    setActiveTab('results');
  };

  // إضافة/إزالة من المفضلة
  const toggleFavorite = async (carId: number) => {
    try {
      if (favorites.includes(carId)) {
        // إزالة من المفضلة
        await fetch(`/api/favorites/${carId}`, {
          method: 'DELETE',
        });
        setFavorites(prev => prev.filter(id => id !== carId));
      } else {
        // إضافة إلى المفضلة
        await fetch('/api/favorites', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ carId }),
        });
        setFavorites(prev => [...prev, carId]);
      }
    } catch (error) {
      console.error('خطأ في تحديث المفضلة:', error);
    }
  };

  return (
    <MainLayout>
      <div className="container mx-auto py-8 px-4">
        <h1 className="text-3xl font-bold mb-6">{t('advanced_search.title')}</h1>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-2 md:grid-cols-4 md:w-[800px] mb-8">
            <TabsTrigger value="traditional" className="flex items-center">
              <Sliders className="h-4 w-4 mr-2" />
              {t('advanced_search.traditional_search')}
            </TabsTrigger>
            <TabsTrigger value="personality" className="flex items-center">
              <BrainCircuit className="h-4 w-4 mr-2" />
              {t('advanced_search.personality_quiz')}
            </TabsTrigger>
            <TabsTrigger 
              value="results" 
              className="flex items-center"
              disabled={!searchResults}
            >
              <Filter className="h-4 w-4 mr-2" />
              {t('advanced_search.search_results')}
            </TabsTrigger>
          </TabsList>
          
          {/* البحث التقليدي */}
          <TabsContent value="traditional">
            <Card className="mb-8">
              <CardHeader>
                <CardTitle>{t('advanced_search.filter_options')}</CardTitle>
                <CardDescription>
                  {t('advanced_search.filter_description')}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoadingFilters ? (
                  <div className="flex justify-center p-8">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* كلمات البحث */}
                    <div>
                      <label className="text-sm font-medium mb-2 block">
                        {t('advanced_search.keywords')}
                      </label>
                      <Input 
                        placeholder={t('advanced_search.keywords_placeholder')}
                        value={traditionalSearchState.keywords}
                        onChange={(e) => updateTraditionalSearch('keywords', e.target.value)}
                      />
                    </div>
                    
                    {/* نطاق السعر */}
                    <div>
                      <label className="text-sm font-medium mb-2 block">
                        {t('advanced_search.price_range')}: 
                        <span className="font-bold mx-2">
                          {traditionalSearchState.priceRange[0].toLocaleString()} - {traditionalSearchState.priceRange[1].toLocaleString()}
                        </span>
                        ريال
                      </label>
                      <Slider
                        defaultValue={[0, 1000000]}
                        min={0}
                        max={1000000}
                        step={10000}
                        value={traditionalSearchState.priceRange}
                        onValueChange={(value) => updateTraditionalSearch('priceRange', value)}
                        className="my-4"
                      />
                    </div>
                    
                    <Separator />
                    
                    {/* الماركات */}
                    <div>
                      <label className="text-sm font-medium mb-2 block">
                        {t('advanced_search.brands')}
                      </label>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        {filterData?.brands.map((brand) => (
                          <div key={brand} className="flex items-center space-x-2 mb-2 rtl:space-x-reverse">
                            <Checkbox 
                              id={`brand-${brand}`}
                              checked={traditionalSearchState.brands.includes(brand)}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  updateTraditionalSearch('brands', [...traditionalSearchState.brands, brand]);
                                } else {
                                  updateTraditionalSearch(
                                    'brands', 
                                    traditionalSearchState.brands.filter(b => b !== brand)
                                  );
                                }
                              }}
                            />
                            <label
                              htmlFor={`brand-${brand}`}
                              className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                            >
                              {brand}
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <Separator />
                    
                    {/* الفئات */}
                    <div>
                      <label className="text-sm font-medium mb-2 block">
                        {t('advanced_search.categories')}
                      </label>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {filterData?.categories.map((category) => (
                          <div key={category} className="flex items-center space-x-2 mb-2 rtl:space-x-reverse">
                            <Checkbox 
                              id={`category-${category}`}
                              checked={traditionalSearchState.categories.includes(category)}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  updateTraditionalSearch('categories', [...traditionalSearchState.categories, category]);
                                } else {
                                  updateTraditionalSearch(
                                    'categories', 
                                    traditionalSearchState.categories.filter(c => c !== category)
                                  );
                                }
                              }}
                            />
                            <label
                              htmlFor={`category-${category}`}
                              className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                            >
                              {category}
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <Separator />
                    
                    {/* السنوات */}
                    <div>
                      <label className="text-sm font-medium mb-2 block">
                        {t('advanced_search.years')}
                      </label>
                      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                        {filterData?.years.map((year) => (
                          <div key={year} className="flex items-center space-x-2 mb-2 rtl:space-x-reverse">
                            <Checkbox 
                              id={`year-${year}`}
                              checked={traditionalSearchState.years.includes(year)}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  updateTraditionalSearch('years', [...traditionalSearchState.years, year]);
                                } else {
                                  updateTraditionalSearch(
                                    'years', 
                                    traditionalSearchState.years.filter(y => y !== year)
                                  );
                                }
                              }}
                            />
                            <label
                              htmlFor={`year-${year}`}
                              className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                            >
                              {year}
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <Separator />
                    
                    {/* المميزات */}
                    <div>
                      <label className="text-sm font-medium mb-2 block">
                        {t('advanced_search.features')}
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        {filterData?.features.map((feature) => (
                          <div key={feature} className="flex items-center space-x-2 mb-2 rtl:space-x-reverse">
                            <Checkbox 
                              id={`feature-${feature}`}
                              checked={traditionalSearchState.features.includes(feature)}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  updateTraditionalSearch('features', [...traditionalSearchState.features, feature]);
                                } else {
                                  updateTraditionalSearch(
                                    'features', 
                                    traditionalSearchState.features.filter(f => f !== feature)
                                  );
                                }
                              }}
                            />
                            <label
                              htmlFor={`feature-${feature}`}
                              className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                            >
                              {feature}
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div className="pt-4 flex justify-end">
                      <Button
                        onClick={handleTraditionalSearch}
                        disabled={isSearching}
                        className="min-w-32"
                      >
                        {isSearching ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            {t('advanced_search.searching')}
                          </>
                        ) : (
                          <>
                            <Search className="mr-2 h-4 w-4" />
                            {t('advanced_search.search')}
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* اختبار الشخصية */}
          <TabsContent value="personality">
            <div className="mb-8">
              <h2 className="text-2xl font-bold mb-4">{t('advanced_search.personality_quiz_title')}</h2>
              <p className="text-muted-foreground mb-6">
                {t('advanced_search.personality_quiz_description')}
              </p>
              
              <CarRecommendationQuiz onComplete={handleQuizComplete} />
            </div>
          </TabsContent>
          
          {/* نتائج البحث */}
          <TabsContent value="results">
            {searchResults ? (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold">
                    {t('advanced_search.results')} ({searchResults.count})
                  </h2>
                  {searchResults.searchMetadata?.aiEnhanced && (
                    <div className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm flex items-center">
                      <BrainCircuit className="h-4 w-4 mr-1" />
                      {t('advanced_search.ai_enhanced')}
                    </div>
                  )}
                </div>
                
                {searchResults.count > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {searchResults.results.map((car) => (
                      <Card key={car.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                        <div className="relative">
                          <img 
                            src={car.imageUrl || `https://via.placeholder.com/300x200?text=${car.brand}+${car.model}`} 
                            alt={`${car.brand} ${car.model}`}
                            className="w-full h-48 object-cover"
                          />
                          <button
                            className="absolute top-2 right-2 p-2 bg-white/80 dark:bg-black/50 rounded-full"
                            onClick={() => toggleFavorite(car.id)}
                          >
                            <Heart 
                              className={`h-5 w-5 ${
                                favorites.includes(car.id) 
                                  ? 'fill-red-500 text-red-500' 
                                  : 'text-muted-foreground'
                              }`} 
                            />
                          </button>
                        </div>
                        
                        <CardContent className="p-4">
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
                              <h4 className="text-sm font-semibold mb-1">{t('advanced_search.key_features')}</h4>
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
                          
                          <div className="mt-4 flex justify-between gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              asChild
                              className="flex-1"
                            >
                              <a href={`/car-evaluation/${car.id}`}>
                                {t('advanced_search.evaluate')}
                              </a>
                            </Button>
                            <Button
                              size="sm"
                              asChild
                              className="flex-1"
                            >
                              <a href={`/car/${car.id}`}>
                                {t('advanced_search.view_details')}
                              </a>
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center p-10 bg-muted rounded-lg">
                    <p className="text-xl mb-2">{t('advanced_search.no_results')}</p>
                    <p className="text-muted-foreground">
                      {t('advanced_search.try_different_criteria')}
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center p-10">
                <p className="text-xl">{t('advanced_search.no_search_performed')}</p>
                <p className="text-muted-foreground mt-2">
                  {t('advanced_search.use_filters_or_quiz')}
                </p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
};

export default AdvancedSearch;