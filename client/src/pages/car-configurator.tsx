import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import MainLayout from '@/components/layouts/main-layout';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { useLocation } from 'wouter';
import { CarModel, CarCategory, ConfigOption } from '@shared/schema';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { ChevronRight, Save, Share, ShoppingCart, ArrowRight, Check } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { translations } from '@/i18n';

// استرجاع الترجمات المطلوبة من ملف اللغة
const t = translations.ar;

const CarConfigurator = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [, setLocation] = useLocation();

  // حالة الاختيارات المحددة
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [selectedModel, setSelectedModel] = useState<number | null>(null);
  const [selectedOptions, setSelectedOptions] = useState<number[]>([]);
  const [currentTab, setCurrentTab] = useState('models');
  const [configurationName, setConfigurationName] = useState('');
  const [isPublic, setIsPublic] = useState(false);

  // حالة الأسعار
  const [basePrice, setBasePrice] = useState(0);
  const [optionsPrice, setOptionsPrice] = useState(0);
  const [totalPrice, setTotalPrice] = useState(0);

  // استعلام لجلب فئات السيارات
  const {
    data: categories,
    isLoading: categoriesLoading,
    error: categoriesError
  } = useQuery({
    queryKey: ['/api/car-configurator/categories'],
    enabled: true
  });

  // استعلام لجلب موديلات السيارات حسب الفئة
  const {
    data: models,
    isLoading: modelsLoading,
    error: modelsError
  } = useQuery({
    queryKey: ['/api/car-configurator/models', selectedCategory],
    enabled: selectedCategory !== null,
    queryFn: async () => {
      const endpoint = selectedCategory
        ? `/api/car-configurator/models?categoryId=${selectedCategory}`
        : '/api/car-configurator/models';
      const res = await fetch(endpoint);
      return res.json();
    }
  });

  // استعلام لجلب خيارات التكوين المتاحة للموديل المحدد
  const {
    data: options,
    isLoading: optionsLoading,
    error: optionsError
  } = useQuery({
    queryKey: ['/api/car-configurator/options', selectedModel],
    enabled: selectedModel !== null,
    queryFn: async () => {
      const endpoint = `/api/car-configurator/options/${selectedModel}`;
      const res = await fetch(endpoint);
      return res.json();
    }
  });

  // استعلام لحساب السعر الإجمالي بناءً على الخيارات المحددة
  const calculatePriceMutation = useMutation({
    mutationFn: async () => {
      if (!selectedModel) return null;
      
      const res = await apiRequest('POST', '/api/car-configurator/calculate-price', {
        modelId: selectedModel,
        selectedOptions: selectedOptions
      });
      
      return res.json();
    },
    onSuccess: (data) => {
      if (data) {
        setBasePrice(data.basePrice);
        setOptionsPrice(data.optionsPrice);
        setTotalPrice(data.totalPrice);
      }
    },
    onError: (error: any) => {
      toast({
        title: 'خطأ في حساب السعر',
        description: error.message || 'حدث خطأ أثناء حساب السعر',
        variant: 'destructive'
      });
    }
  });

  // استعلام لحفظ التكوين
  const saveConfigurationMutation = useMutation({
    mutationFn: async () => {
      if (!selectedModel) return null;
      
      const res = await apiRequest('POST', '/api/car-configurator/save-configuration', {
        carModelId: selectedModel,
        name: configurationName || 'تكوين بدون اسم',
        options: selectedOptions,
        totalPrice: totalPrice,
        isPublic: isPublic
      });
      
      return res.json();
    },
    onSuccess: (data) => {
      toast({
        title: 'تم حفظ التكوين',
        description: 'تم حفظ تكوين السيارة بنجاح',
        variant: 'default'
      });
      
      queryClient.invalidateQueries({
        queryKey: ['/api/car-configurator/my-configurations'],
      });
    },
    onError: (error: any) => {
      toast({
        title: 'خطأ في حفظ التكوين',
        description: error.message || 'حدث خطأ أثناء حفظ التكوين',
        variant: 'destructive'
      });
    }
  });

  // إعادة حساب السعر عند تغيير الخيارات
  useEffect(() => {
    if (selectedModel && selectedOptions.length > 0) {
      calculatePriceMutation.mutate();
    } else if (selectedModel && models) {
      // إذا لم تكن هناك خيارات محددة، نعرض السعر الأساسي للموديل فقط
      const model = models.find((m: CarModel) => m.id === selectedModel);
      if (model) {
        setBasePrice(model.basePrice);
        setOptionsPrice(0);
        setTotalPrice(model.basePrice);
      }
    }
  }, [selectedModel, selectedOptions]);

  // التعامل مع تحديد فئة
  const handleCategorySelect = (categoryId: number) => {
    setSelectedCategory(categoryId);
    setSelectedModel(null);
    setSelectedOptions([]);
    setCurrentTab('models');
  };

  // التعامل مع تحديد موديل
  const handleModelSelect = (modelId: number) => {
    setSelectedModel(modelId);
    setSelectedOptions([]);
    setCurrentTab('options');

    // تحديث السعر الأساسي
    if (models) {
      const model = models.find((m: CarModel) => m.id === modelId);
      if (model) {
        setBasePrice(model.basePrice);
        setTotalPrice(model.basePrice);
      }
    }
  };

  // التعامل مع تحديد خيار
  const handleOptionSelect = (optionId: number) => {
    setSelectedOptions((prevOptions) => {
      // إذا كان الخيار محدد بالفعل، نقوم بإزالته
      if (prevOptions.includes(optionId)) {
        return prevOptions.filter(id => id !== optionId);
      }
      // وإلا نقوم بإضافته
      return [...prevOptions, optionId];
    });
  };

  // حفظ التكوين
  const handleSaveConfiguration = () => {
    if (!user) {
      toast({
        title: 'تسجيل الدخول مطلوب',
        description: 'يرجى تسجيل الدخول لحفظ تكوين السيارة',
        variant: 'destructive'
      });
      setLocation('/auth');
      return;
    }

    if (!selectedModel) {
      toast({
        title: 'خطأ',
        description: 'يرجى تحديد موديل السيارة أولاً',
        variant: 'destructive'
      });
      return;
    }

    saveConfigurationMutation.mutate();
  };

  // عرض خطأ تحميل الفئات
  if (categoriesError) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-red-600">خطأ في تحميل بيانات الفئات</h2>
            <p className="mt-2 text-gray-600">يرجى المحاولة مرة أخرى لاحقاً</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6 text-center">مُكوِّن السيارات التفاعلي</h1>
        <p className="text-lg text-center mb-8 text-gray-600">
          قم بتخصيص سيارتك المثالية واحصل على تقدير للسعر في الوقت الفعلي
        </p>

        <div className="flex flex-col md:flex-row gap-8">
          {/* القائمة الجانبية للخطوات */}
          <div className="w-full md:w-1/4">
            <div className="bg-white shadow-md rounded-lg p-6">
              <h3 className="text-xl font-bold mb-4">خطوات التكوين</h3>

              <ul className="space-y-4">
                <li 
                  className={`flex items-center p-3 rounded-md cursor-pointer ${currentTab === 'categories' ? 'bg-primary/10 text-primary' : 'hover:bg-gray-100'}`}
                  onClick={() => setCurrentTab('categories')}
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentTab === 'categories' ? 'bg-primary text-white' : 'bg-gray-200'}`}>1</div>
                  <span className="mr-3">اختر الفئة</span>
                  {selectedCategory !== null && <Check className="mr-auto w-4 h-4 text-green-500" />}
                </li>
                
                <li 
                  className={`flex items-center p-3 rounded-md cursor-pointer ${currentTab === 'models' ? 'bg-primary/10 text-primary' : 'hover:bg-gray-100'} ${selectedCategory === null ? 'opacity-50 pointer-events-none' : ''}`}
                  onClick={() => selectedCategory !== null && setCurrentTab('models')}
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentTab === 'models' ? 'bg-primary text-white' : 'bg-gray-200'}`}>2</div>
                  <span className="mr-3">اختر الموديل</span>
                  {selectedModel !== null && <Check className="mr-auto w-4 h-4 text-green-500" />}
                </li>
                
                <li 
                  className={`flex items-center p-3 rounded-md cursor-pointer ${currentTab === 'options' ? 'bg-primary/10 text-primary' : 'hover:bg-gray-100'} ${selectedModel === null ? 'opacity-50 pointer-events-none' : ''}`}
                  onClick={() => selectedModel !== null && setCurrentTab('options')}
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentTab === 'options' ? 'bg-primary text-white' : 'bg-gray-200'}`}>3</div>
                  <span className="mr-3">اختر الخيارات</span>
                </li>
                
                <li 
                  className={`flex items-center p-3 rounded-md cursor-pointer ${currentTab === 'summary' ? 'bg-primary/10 text-primary' : 'hover:bg-gray-100'} ${selectedModel === null ? 'opacity-50 pointer-events-none' : ''}`}
                  onClick={() => selectedModel !== null && setCurrentTab('summary')}
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentTab === 'summary' ? 'bg-primary text-white' : 'bg-gray-200'}`}>4</div>
                  <span className="mr-3">ملخص التكوين</span>
                </li>
              </ul>
              
              {selectedModel && (
                <div className="mt-8 p-4 border rounded-md bg-gray-50">
                  <h4 className="font-bold text-lg mb-2">تفاصيل السعر</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">السعر الأساسي</span>
                      <span>{basePrice.toLocaleString()} ر.س</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">سعر الخيارات</span>
                      <span>{optionsPrice.toLocaleString()} ر.س</span>
                    </div>
                    <Separator className="my-2" />
                    <div className="flex justify-between font-bold">
                      <span>السعر الإجمالي</span>
                      <span>{totalPrice.toLocaleString()} ر.س</span>
                    </div>
                  </div>
                </div>
              )}

              {selectedModel && (
                <div className="mt-6 space-y-3">
                  <Button 
                    className="w-full"
                    variant="outline"
                    onClick={handleSaveConfiguration}
                    disabled={saveConfigurationMutation.isPending}
                  >
                    <Save className="ml-2 h-4 w-4" />
                    حفظ التكوين
                  </Button>
                  
                  <Button 
                    className="w-full"
                    onClick={() => setLocation('/purchase')}
                  >
                    <ShoppingCart className="ml-2 h-4 w-4" />
                    شراء الآن
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* المحتوى الرئيسي */}
          <div className="w-full md:w-3/4">
            <Card className="p-6">
              <TabsContent value="categories" className={currentTab === 'categories' ? 'block' : 'hidden'}>
                <h2 className="text-2xl font-bold mb-6">اختر فئة السيارة</h2>
                
                {categoriesLoading ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                      <div key={i} className="bg-gray-200 h-48 rounded-lg"></div>
                    ))}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {categories?.map((category: CarCategory) => (
                      <div
                        key={category.id}
                        className={`border rounded-lg overflow-hidden cursor-pointer transition-all hover:shadow-md ${selectedCategory === category.id ? 'ring-2 ring-primary' : ''}`}
                        onClick={() => handleCategorySelect(category.id)}
                      >
                        <div className="h-40 bg-gray-200 relative">
                          {category.imageUrl ? (
                            <img 
                              src={category.imageUrl} 
                              alt={category.name} 
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="flex items-center justify-center h-full bg-gray-100 text-gray-400">
                              <span>لا توجد صورة</span>
                            </div>
                          )}
                          {selectedCategory === category.id && (
                            <div className="absolute top-2 right-2 bg-primary text-white rounded-full p-1">
                              <Check className="h-4 w-4" />
                            </div>
                          )}
                        </div>
                        <div className="p-4">
                          <h3 className="font-bold text-lg">{category.name}</h3>
                          {category.description && (
                            <p className="text-gray-600 text-sm mt-1 line-clamp-2">{category.description}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <div className="mt-8 flex justify-end">
                  <Button 
                    onClick={() => setCurrentTab('models')}
                    disabled={selectedCategory === null}
                  >
                    التالي
                    <ChevronRight className="mr-2 h-4 w-4" />
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="models" className={currentTab === 'models' ? 'block' : 'hidden'}>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold">اختر موديل السيارة</h2>
                  {categories && selectedCategory && (
                    <div className="text-gray-600">
                      الفئة: {categories.find((c: CarCategory) => c.id === selectedCategory)?.name}
                    </div>
                  )}
                </div>
                
                {modelsLoading ? (
                  <div className="space-y-4 animate-pulse">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="bg-gray-200 h-24 rounded-lg"></div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {models?.length > 0 ? (
                      models.map((model: CarModel) => (
                        <div
                          key={model.id}
                          className={`border rounded-lg overflow-hidden cursor-pointer transition-all hover:shadow-md ${selectedModel === model.id ? 'ring-2 ring-primary' : ''}`}
                          onClick={() => handleModelSelect(model.id)}
                        >
                          <div className="flex flex-col md:flex-row">
                            <div className="w-full md:w-1/3 h-48 md:h-auto bg-gray-200">
                              {model.imageUrl ? (
                                <img 
                                  src={model.imageUrl} 
                                  alt={`${model.make} ${model.model}`}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="flex items-center justify-center h-full bg-gray-100 text-gray-400">
                                  <span>لا توجد صورة</span>
                                </div>
                              )}
                            </div>
                            <div className="p-4 flex-1 flex flex-col">
                              <div className="flex justify-between items-start">
                                <div>
                                  <h3 className="font-bold text-xl">{model.make} {model.model}</h3>
                                  <p className="text-gray-600 mt-1">موديل {model.year}</p>
                                </div>
                                <div className="text-lg font-bold text-primary">
                                  {model.basePrice.toLocaleString()} ر.س
                                </div>
                              </div>
                              {model.description && (
                                <p className="text-gray-600 mt-3 line-clamp-2">{model.description}</p>
                              )}
                              <div className="mt-auto pt-3 flex justify-between items-center">
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    // TODO: عرض المواصفات الكاملة
                                  }}
                                >
                                  المواصفات الكاملة
                                </Button>
                                {selectedModel === model.id && (
                                  <div className="flex items-center text-primary">
                                    <Check className="h-4 w-4 ml-1" />
                                    <span>تم الاختيار</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8">
                        <p className="text-gray-500">لا توجد موديلات متاحة في هذه الفئة</p>
                      </div>
                    )}
                  </div>
                )}

                <div className="mt-8 flex justify-between">
                  <Button 
                    variant="outline"
                    onClick={() => setCurrentTab('categories')}
                  >
                    السابق
                  </Button>
                  <Button 
                    onClick={() => setCurrentTab('options')}
                    disabled={selectedModel === null}
                  >
                    التالي
                    <ChevronRight className="mr-2 h-4 w-4" />
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="options" className={currentTab === 'options' ? 'block' : 'hidden'}>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold">اختر خيارات التكوين</h2>
                  {models && selectedModel && (
                    <div className="text-gray-600">
                      الموديل: {models.find((m: CarModel) => m.id === selectedModel)?.make} {models.find((m: CarModel) => m.id === selectedModel)?.model}
                    </div>
                  )}
                </div>
                
                {optionsLoading ? (
                  <div className="space-y-6 animate-pulse">
                    <div className="bg-gray-200 h-8 w-1/3 rounded-md"></div>
                    <div className="space-y-4">
                      {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="bg-gray-200 h-24 rounded-lg"></div>
                      ))}
                    </div>
                  </div>
                ) : options ? (
                  <div className="space-y-8">
                    {Object.keys(options).length > 0 ? (
                      Object.entries(options).map(([category, categoryOptions]) => (
                        <div key={category} className="space-y-4">
                          <h3 className="text-xl font-semibold border-b pb-2">{category}</h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {(categoryOptions as ConfigOption[]).map((option: ConfigOption) => (
                              <div
                                key={option.id}
                                className={`border rounded-lg p-4 cursor-pointer transition-all ${selectedOptions.includes(option.id) ? 'bg-primary/5 border-primary' : 'hover:bg-gray-50'}`}
                                onClick={() => handleOptionSelect(option.id)}
                              >
                                <div className="flex justify-between">
                                  <div>
                                    <h4 className="font-bold">{option.name}</h4>
                                    {option.description && (
                                      <p className="text-gray-600 text-sm mt-1">{option.description}</p>
                                    )}
                                  </div>
                                  <div className="text-primary font-semibold">
                                    {option.price > 0 ? `+${option.price.toLocaleString()} ر.س` : 'مجاناً'}
                                  </div>
                                </div>
                                {selectedOptions.includes(option.id) && (
                                  <div className="mt-2 flex items-center text-primary text-sm">
                                    <Check className="h-4 w-4 ml-1" />
                                    <span>تم الاختيار</span>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8">
                        <p className="text-gray-500">لا توجد خيارات متاحة لهذا الموديل</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-500">يرجى تحديد موديل للحصول على الخيارات المتاحة</p>
                  </div>
                )}

                <div className="mt-8 flex justify-between">
                  <Button 
                    variant="outline"
                    onClick={() => setCurrentTab('models')}
                  >
                    السابق
                  </Button>
                  <Button 
                    onClick={() => setCurrentTab('summary')}
                  >
                    ملخص التكوين
                    <ChevronRight className="mr-2 h-4 w-4" />
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="summary" className={currentTab === 'summary' ? 'block' : 'hidden'}>
                <h2 className="text-2xl font-bold mb-6">ملخص التكوين</h2>
                
                {selectedModel && models ? (
                  <div className="space-y-6">
                    <div className="bg-gray-50 p-6 rounded-lg">
                      <h3 className="text-xl font-bold mb-4">تفاصيل السيارة</h3>
                      {(() => {
                        const model = models.find((m: CarModel) => m.id === selectedModel);
                        if (!model) return null;
                        
                        return (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <p className="text-gray-600">الشركة المصنعة</p>
                              <p className="font-semibold">{model.make}</p>
                            </div>
                            <div>
                              <p className="text-gray-600">الموديل</p>
                              <p className="font-semibold">{model.model}</p>
                            </div>
                            <div>
                              <p className="text-gray-600">سنة الصنع</p>
                              <p className="font-semibold">{model.year}</p>
                            </div>
                            <div>
                              <p className="text-gray-600">السعر الأساسي</p>
                              <p className="font-semibold">{model.basePrice.toLocaleString()} ر.س</p>
                            </div>
                          </div>
                        );
                      })()}
                    </div>

                    {selectedOptions.length > 0 && options && (
                      <div className="bg-gray-50 p-6 rounded-lg">
                        <h3 className="text-xl font-bold mb-4">الخيارات المختارة</h3>
                        <div className="space-y-4">
                          {Object.entries(options).map(([category, categoryOptions]) => {
                            const selectedCategoryOptions = (categoryOptions as ConfigOption[]).filter(
                              option => selectedOptions.includes(option.id)
                            );
                            
                            if (selectedCategoryOptions.length === 0) return null;
                            
                            return (
                              <div key={category} className="space-y-2">
                                <h4 className="font-semibold">{category}</h4>
                                <div className="divide-y">
                                  {selectedCategoryOptions.map(option => (
                                    <div key={option.id} className="py-2 flex justify-between">
                                      <span>{option.name}</span>
                                      <span className="font-semibold">{option.price.toLocaleString()} ر.س</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    <div className="bg-gray-50 p-6 rounded-lg">
                      <h3 className="text-xl font-bold mb-4">إجمالي السعر</h3>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span>السعر الأساسي</span>
                          <span>{basePrice.toLocaleString()} ر.س</span>
                        </div>
                        <div className="flex justify-between">
                          <span>سعر الخيارات</span>
                          <span>{optionsPrice.toLocaleString()} ر.س</span>
                        </div>
                        <Separator className="my-2" />
                        <div className="flex justify-between text-lg font-bold">
                          <span>السعر الإجمالي</span>
                          <span>{totalPrice.toLocaleString()} ر.س</span>
                        </div>
                      </div>
                    </div>

                    {user && (
                      <div className="bg-gray-50 p-6 rounded-lg">
                        <h3 className="text-xl font-bold mb-4">حفظ التكوين</h3>
                        <div className="space-y-4">
                          <div>
                            <label htmlFor="configName" className="block text-sm font-medium text-gray-700">
                              اسم التكوين
                            </label>
                            <input
                              type="text"
                              id="configName"
                              className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                              placeholder="مثال: سيارتي المخصصة"
                              value={configurationName}
                              onChange={(e) => setConfigurationName(e.target.value)}
                            />
                          </div>
                          <div className="flex items-center">
                            <input
                              type="checkbox"
                              id="isPublic"
                              className="ml-2 h-4 w-4"
                              checked={isPublic}
                              onChange={(e) => setIsPublic(e.target.checked)}
                            />
                            <label htmlFor="isPublic" className="text-sm text-gray-700">
                              مشاركة هذا التكوين مع المستخدمين الآخرين
                            </label>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="flex flex-col md:flex-row gap-4 justify-center mt-8">
                      <Button 
                        className="md:w-1/3"
                        variant="outline"
                        onClick={handleSaveConfiguration}
                        disabled={saveConfigurationMutation.isPending}
                      >
                        <Save className="ml-2 h-4 w-4" />
                        حفظ التكوين
                      </Button>
                      
                      <Button 
                        className="md:w-1/3"
                      >
                        <Share className="ml-2 h-4 w-4" />
                        مشاركة التكوين
                      </Button>
                      
                      <Button 
                        className="md:w-1/3"
                        onClick={() => setLocation('/purchase')}
                      >
                        <ShoppingCart className="ml-2 h-4 w-4" />
                        شراء الآن
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-500">يرجى اختيار موديل وتكوين السيارة أولاً</p>
                  </div>
                )}

                <div className="mt-8 flex justify-start">
                  <Button 
                    variant="outline"
                    onClick={() => setCurrentTab('options')}
                  >
                    العودة إلى الخيارات
                  </Button>
                </div>
              </TabsContent>
            </Card>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default CarConfigurator;