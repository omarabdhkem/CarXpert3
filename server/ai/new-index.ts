import { storage } from '../storage';
import { callExternalAI, AIRequest, AIResponse } from './external-api';
import { LearningSystem, learningSystem } from './learning-system';

export class AIServices {
  learningSystem: LearningSystem;

  constructor() {
    // ربط نظام التعلم بمثيل خدمات الذكاء الاصطناعي
    this.learningSystem = learningSystem;
  }
  
  // تحليل صورة السيارة باستخدام الذكاء الاصطناعي الخارجي
  async analyzeCarImage(imageUrl: string): Promise<any> {
    try {
      // استعلام الذكاء الاصطناعي الخارجي
      const request: AIRequest = {
        prompt: `تحليل صورة السيارة التالية: ${imageUrl}`,
        systemPrompt: 'أنت خبير في تحليل صور السيارات. قم بتحديد ماركة وطراز السيارة، السنة، اللون، والحالة العامة والميزات المرئية.'
      };
      
      const response = await callExternalAI(request);
      
      // معالجة النتائج
      // في التطبيق الحقيقي، سنقوم بتحليل نص الاستجابة لاستخراج البيانات المنظمة
      
      const result = {
        make: 'Toyota', // سيتم استبدال هذا بتحليل حقيقي للاستجابة
        model: 'Camry',
        year: 2021,
        color: 'أبيض',
        condition: 'ممتازة',
        confidence: 0.92,
        features: ['سقف متحرك', 'مقاعد جلد', 'كاميرا خلفية'],
        detectableIssues: [],
        aiResponse: response.text
      };
      
      // تعلم من التحليل الحالي
      await this.learningSystem.learnFromInteraction(
        { type: 'image_analysis', imageUrl },
        result,
        1, // معرف المستخدم
        'car-identification'
      );
      
      return result;
    } catch (error) {
      console.error('Error analyzing car image:', error);
      throw error;
    }
  }
  
  // اقتراح سعر تنافسي
  async suggestCompetitivePrice(carData: any): Promise<any> {
    try {
      // استعلام الذكاء الاصطناعي الخارجي
      const request: AIRequest = {
        prompt: `اقترح سعرًا تنافسيًا لهذه السيارة: ${JSON.stringify(carData)}`,
        systemPrompt: 'أنت خبير في تقييم أسعار السيارات. استخدم البيانات المقدمة لاقتراح سعر تنافسي مناسب للسوق الحالية.'
      };
      
      const response = await callExternalAI(request);
      
      // معالجة النتائج (في التطبيق الحقيقي سنقوم بتحليل النص لاستخراج المعلومات)
      const averagePrice = Math.floor(Math.random() * 15000) + 25000; // سعر تجريبي
      const lowestPrice = averagePrice - Math.floor(Math.random() * 3000);
      const highestPrice = averagePrice + Math.floor(Math.random() * 5000);
      
      const result = {
        suggestedPrice: averagePrice,
        priceRange: {
          low: lowestPrice,
          high: highestPrice
        },
        marketAnalysis: {
          demandLevel: 'متوسط',
          competitorCount: Math.floor(Math.random() * 15) + 5,
          averageDaysOnMarket: Math.floor(Math.random() * 20) + 10,
          priceCompetitiveness: 'معتدل'
        },
        tips: [
          'يمكنك زيادة السعر إذا كانت السيارة في حالة ممتازة',
          'المناطق الحضرية تشهد طلبًا أعلى على السيارات الاقتصادية',
          'إضافة صور احترافية يمكن أن تسمح لك بزيادة السعر بنسبة 5-10%'
        ],
        aiResponse: response.text
      };
      
      // تعلم من التحليل الحالي
      await this.learningSystem.learnFromInteraction(
        { type: 'price_suggestion', carData },
        result,
        1, // معرف المستخدم
        'price-prediction'
      );
      
      return result;
    } catch (error) {
      console.error('Error suggesting competitive price:', error);
      throw error;
    }
  }
  
  // البحث الذكي
  async intelligentSearch(query: string, userId?: number): Promise<any> {
    try {
      // استعلام الذكاء الاصطناعي لفهم استعلام البحث
      const aiRequest: AIRequest = {
        prompt: `استعلام بحث: ${query}`,
        systemPrompt: 'أنت مساعد يحلل استعلامات البحث عن السيارات. حول استعلام المستخدم إلى معلمات بحث منظمة تتضمن الماركة، الموديل، السنة، السعر، اللون، والميزات.'
      };
      
      const aiResponse = await callExternalAI(aiRequest);
      
      // تفسير استعلام البحث الطبيعي وتحويله إلى استعلام منظم
      const parsedQuery = this.parseSearchQuery(query, aiResponse.text);
      
      let searchResults = await storage.getCars(parsedQuery);
      
      // تخصيص النتائج بناءً على سلوك المستخدم السابق إذا كان متاحًا
      if (userId) {
        const userBehavior = await storage.getUserBehavior(userId);
        
        if (userBehavior) {
          // إعادة ترتيب النتائج بناءً على تفضيلات المستخدم
          searchResults = this.rankResultsByUserPreferences(searchResults, userBehavior);
          
          // تسجيل بيانات البحث لتعزيز التوصيات المستقبلية
          await storage.updateUserBehavior(userId, {
            lastSearch: {
              query,
              timestamp: new Date()
            }
          });
          
          // تعلم من عملية البحث الحالية
          await this.learningSystem.learnFromInteraction(
            { type: 'search', query, parsedQuery },
            { resultsCount: searchResults.length },
            userId,
            'search'
          );
        }
      }
      
      return {
        results: searchResults,
        parsedQuery: parsedQuery,
        totalResults: searchResults.length,
        suggestedFilters: this.generateSuggestedFilters(searchResults),
        aiInterpretation: aiResponse.text
      };
    } catch (error) {
      console.error('Error during intelligent search:', error);
      throw error;
    }
  }
  
  // تحليل استعلام البحث الطبيعي
  private parseSearchQuery(query: string, aiInterpretation?: string): any {
    // في الإصدار المتقدم، سنستخدم نتائج تحليل الذكاء الاصطناعي
    // هنا للتبسيط نستخدم نفس الكود السابق مع إضافة تفسير الذكاء الاصطناعي
    
    const parsedQuery: any = {};
    
    // تحليل أساسي للشروط الشائعة
    if (query.includes('جديد')) {
      parsedQuery.condition = 'new';
    } else if (query.includes('مستعمل')) {
      parsedQuery.condition = 'used';
    }
    
    // تحليل الماركات
    const brands = ['تويوتا', 'هوندا', 'نيسان', 'مرسيدس', 'بي ام دبليو', 'لكزس', 'فورد'];
    for (const brand of brands) {
      if (query.includes(brand)) {
        parsedQuery.make = brand;
        break;
      }
    }
    
    // تحليل الألوان
    const colors = ['أبيض', 'أسود', 'فضي', 'رمادي', 'أحمر', 'أزرق'];
    for (const color of colors) {
      if (query.includes(color)) {
        parsedQuery.color = color;
        break;
      }
    }
    
    return parsedQuery;
  }
  
  // الحصول على توصيات مخصصة للمستخدم
  async getPersonalizedRecommendations(userId: number, limit: number = 10): Promise<any> {
    try {
      // الحصول على سلوك المستخدم السابق
      const userBehavior = await storage.getUserBehavior(userId);
      
      if (!userBehavior || !Object.keys(userBehavior.preferences || {}).length) {
        // إذا لم يكن هناك بيانات سلوك، استخدم التوصيات الافتراضية
        return this.getDefaultRecommendations(limit);
      }
      
      // استخدام الذكاء الاصطناعي لتحليل سلوك المستخدم وتوليد توصيات
      const request: AIRequest = {
        prompt: `أوصِ بسيارات للمستخدم ذو السلوك التالي: ${JSON.stringify(userBehavior)}`,
        systemPrompt: 'أنت نظام توصية للسيارات. استنادًا إلى سلوك المستخدم السابق، قدم توصيات مخصصة تتوافق مع تفضيلاته.'
      };
      
      const aiResponse = await callExternalAI(request);
      
      // استخراج التفضيلات من سلوك المستخدم
      const preferences = this.extractUserPreferences(userBehavior);
      
      // إنشاء استعلام بناءً على تفضيلات المستخدم
      const query: any = {};
      
      // إضافة تفضيلات الماركة إذا كانت قوية بما يكفي
      if (preferences.makes && Object.keys(preferences.makes).length > 0) {
        const topMakes = Object.entries(preferences.makes)
          .sort((a, b) => (b[1] as number) - (a[1] as number))
          .slice(0, 3)
          .map(entry => entry[0]);
        
        if (topMakes.length > 0) {
          // في الواقع سنحتاج إلى استخدام عملية "OR" لقاعدة البيانات
          // للتبسيط، سنستخدم الماركة الأعلى فقط
          query.make = topMakes[0];
        }
      }
      
      // إضافة نطاق السنة إذا كان هناك تفضيل واضح
      if (preferences.years && Object.keys(preferences.years).length > 0) {
        const yearRange = this.calculateYearRange(preferences.years);
        query.yearMin = yearRange.min;
        query.yearMax = yearRange.max;
      }
      
      // إضافة نطاق السعر إذا كان هناك تفضيل واضح
      if (preferences.priceRanges && Object.keys(preferences.priceRanges).length > 0) {
        const priceRange = this.calculatePriceRange(preferences.priceRanges);
        query.priceMin = priceRange.min;
        query.priceMax = priceRange.max;
      }
      
      // الحصول على السيارات المطابقة للتفضيلات
      let recommendations = await storage.getCars(query);
      
      // إعادة ترتيب النتائج بناءً على تفضيلات المستخدم
      recommendations = this.rankResultsByUserPreferences(recommendations, userBehavior);
      
      // الحد من عدد النتائج
      recommendations = recommendations.slice(0, limit);
      
      // تعلم من عملية التوصية الحالية
      await this.learningSystem.learnFromInteraction(
        { type: 'recommendation', userId, preferences },
        { recommendationsCount: recommendations.length },
        userId,
        'recommendation'
      );
      
      return {
        recommendations,
        basedOn: {
          recentViews: userBehavior.recentViews || [],
          searchHistory: userBehavior.searchHistory || [],
          preferences: preferences
        },
        aiInsights: aiResponse.text
      };
    } catch (error) {
      console.error('Error getting personalized recommendations:', error);
      // في حالة الفشل، ارجع إلى التوصيات الافتراضية
      return this.getDefaultRecommendations(limit);
    }
  }
  
  // استخراج تفضيلات المستخدم من سلوك المستخدم
  private extractUserPreferences(userBehavior: any): any {
    const preferences: any = {
      makes: {},
      models: {},
      years: {},
      priceRanges: {},
      bodyTypes: {},
      colors: {}
    };
    
    // تحليل المشاهدات الأخيرة
    if (userBehavior.recentViews && userBehavior.recentViews.length > 0) {
      userBehavior.recentViews.forEach((view: any) => {
        const car = view.car;
        if (!car) return;
        
        // زيادة عداد الماركة
        if (car.make) {
          preferences.makes[car.make] = (preferences.makes[car.make] || 0) + 2; // الوزن أعلى للمشاهدات
        }
        
        // زيادة عداد الموديل
        if (car.model) {
          preferences.models[car.model] = (preferences.models[car.model] || 0) + 2;
        }
        
        // زيادة عداد السنة
        if (car.year) {
          preferences.years[car.year] = (preferences.years[car.year] || 0) + 1;
        }
        
        // زيادة عداد نطاق السعر
        if (car.price) {
          const priceRange = Math.floor(car.price / 10000) * 10000; // تقريب لأقرب 10,000
          preferences.priceRanges[priceRange] = (preferences.priceRanges[priceRange] || 0) + 1;
        }
        
        // زيادة عداد نوع الهيكل
        if (car.bodyType) {
          preferences.bodyTypes[car.bodyType] = (preferences.bodyTypes[car.bodyType] || 0) + 1;
        }
        
        // زيادة عداد اللون
        if (car.color) {
          preferences.colors[car.color] = (preferences.colors[car.color] || 0) + 1;
        }
      });
    }
    
    // تحليل محفوظات البحث
    if (userBehavior.searchHistory && userBehavior.searchHistory.length > 0) {
      userBehavior.searchHistory.forEach((search: any) => {
        if (!search.filters) return;
        
        // زيادة عداد الماركة
        if (search.filters.make) {
          preferences.makes[search.filters.make] = (preferences.makes[search.filters.make] || 0) + 1;
        }
        
        // زيادة عداد الموديل
        if (search.filters.model) {
          preferences.models[search.filters.model] = (preferences.models[search.filters.model] || 0) + 1;
        }
        
        // زيادة عداد نطاق السنة
        if (search.filters.yearMin && search.filters.yearMax) {
          const midYear = Math.floor((search.filters.yearMin + search.filters.yearMax) / 2);
          preferences.years[midYear] = (preferences.years[midYear] || 0) + 1;
        }
        
        // زيادة عداد نطاق السعر
        if (search.filters.priceMin && search.filters.priceMax) {
          const midPrice = Math.floor(((search.filters.priceMin + search.filters.priceMax) / 2) / 10000) * 10000;
          preferences.priceRanges[midPrice] = (preferences.priceRanges[midPrice] || 0) + 1;
        }
        
        // زيادة عداد نوع الهيكل
        if (search.filters.bodyType) {
          preferences.bodyTypes[search.filters.bodyType] = (preferences.bodyTypes[search.filters.bodyType] || 0) + 1;
        }
        
        // زيادة عداد اللون
        if (search.filters.color) {
          preferences.colors[search.filters.color] = (preferences.colors[search.filters.color] || 0) + 1;
        }
      });
    }
    
    return preferences;
  }
  
  // ترتيب النتائج حسب تفضيلات المستخدم
  private rankResultsByUserPreferences(results: any[], userBehavior: any): any[] {
    if (!userBehavior || !userBehavior.preferences) {
      return results;
    }
    
    const preferences = this.extractUserPreferences(userBehavior);
    
    return results.sort((a, b) => {
      let scoreA = 0;
      let scoreB = 0;
      
      // حساب النقاط بناءً على الماركة
      if (a.make && preferences.makes[a.make]) {
        scoreA += preferences.makes[a.make];
      }
      if (b.make && preferences.makes[b.make]) {
        scoreB += preferences.makes[b.make];
      }
      
      // حساب النقاط بناءً على الموديل
      if (a.model && preferences.models[a.model]) {
        scoreA += preferences.models[a.model];
      }
      if (b.model && preferences.models[b.model]) {
        scoreB += preferences.models[b.model];
      }
      
      // حساب النقاط بناءً على السنة (قرب السنة للسنوات المفضلة)
      if (a.year && Object.keys(preferences.years).length > 0) {
        const closestYearA = this.findClosestValue(a.year, Object.keys(preferences.years).map(Number));
        if (closestYearA && preferences.years[closestYearA]) {
          const distanceA = Math.abs(a.year - closestYearA);
          scoreA += preferences.years[closestYearA] / (distanceA + 1); // الأقرب يحصل على نقاط أكثر
        }
      }
      if (b.year && Object.keys(preferences.years).length > 0) {
        const closestYearB = this.findClosestValue(b.year, Object.keys(preferences.years).map(Number));
        if (closestYearB && preferences.years[closestYearB]) {
          const distanceB = Math.abs(b.year - closestYearB);
          scoreB += preferences.years[closestYearB] / (distanceB + 1);
        }
      }
      
      // حساب النقاط بناءً على السعر (قرب السعر للأسعار المفضلة)
      if (a.price && Object.keys(preferences.priceRanges).length > 0) {
        const closestPriceA = this.findClosestValue(a.price, Object.keys(preferences.priceRanges).map(Number));
        if (closestPriceA && preferences.priceRanges[closestPriceA]) {
          const distanceA = Math.abs(a.price - closestPriceA);
          scoreA += preferences.priceRanges[closestPriceA] / (distanceA / 5000 + 1); // تطبيع المسافة
        }
      }
      if (b.price && Object.keys(preferences.priceRanges).length > 0) {
        const closestPriceB = this.findClosestValue(b.price, Object.keys(preferences.priceRanges).map(Number));
        if (closestPriceB && preferences.priceRanges[closestPriceB]) {
          const distanceB = Math.abs(b.price - closestPriceB);
          scoreB += preferences.priceRanges[closestPriceB] / (distanceB / 5000 + 1);
        }
      }
      
      // مقارنة النتيجة النهائية
      return scoreB - scoreA;
    });
  }
  
  // العثور على أقرب قيمة في المصفوفة
  private findClosestValue(value: number, array: number[]): number | null {
    if (array.length === 0) return null;
    return array.reduce((prev, curr) => 
      Math.abs(curr - value) < Math.abs(prev - value) ? curr : prev
    );
  }
  
  // حساب نطاق السنة من كائن التفضيلات
  private calculateYearRange(yearsObj: any): any {
    const years = Object.keys(yearsObj).map(Number);
    if (years.length === 0) return { min: null, max: null };
    
    // حساب المتوسط المرجح
    let weightedSum = 0;
    let totalWeight = 0;
    
    for (const year in yearsObj) {
      const weight = yearsObj[year];
      weightedSum += parseInt(year) * weight;
      totalWeight += weight;
    }
    
    const averageYear = Math.round(weightedSum / totalWeight);
    
    // تحديد النطاق كـ ± 3 سنوات حول المتوسط
    return {
      min: averageYear - 3,
      max: averageYear + 3
    };
  }
  
  // حساب نطاق السعر من كائن التفضيلات
  private calculatePriceRange(priceRangesObj: any): any {
    const prices = Object.keys(priceRangesObj).map(Number);
    if (prices.length === 0) return { min: null, max: null };
    
    // حساب المتوسط المرجح
    let weightedSum = 0;
    let totalWeight = 0;
    
    for (const price in priceRangesObj) {
      const weight = priceRangesObj[price];
      weightedSum += parseInt(price) * weight;
      totalWeight += weight;
    }
    
    const averagePrice = Math.round(weightedSum / totalWeight);
    
    // تحديد النطاق كـ ± 25% حول المتوسط
    return {
      min: Math.round(averagePrice * 0.75),
      max: Math.round(averagePrice * 1.25)
    };
  }
  
  // توليد المرشحات المقترحة بناءً على نتائج البحث
  private generateSuggestedFilters(results: any[]): any {
    if (!results || results.length === 0) {
      return {};
    }
    
    const makes: Record<string, number> = {};
    const years: Record<number, number> = {};
    const priceRanges: Record<string, number> = {};
    const bodyTypes: Record<string, number> = {};
    
    // جمع الإحصائيات من النتائج
    results.forEach(car => {
      // الماركات
      if (car.make) {
        makes[car.make] = (makes[car.make] || 0) + 1;
      }
      
      // السنوات
      if (car.year) {
        years[car.year] = (years[car.year] || 0) + 1;
      }
      
      // نطاقات الأسعار
      if (car.price) {
        const range = `${Math.floor(car.price / 10000) * 10000}-${Math.floor(car.price / 10000) * 10000 + 10000}`;
        priceRanges[range] = (priceRanges[range] || 0) + 1;
      }
      
      // أنواع الهياكل
      if (car.bodyType) {
        bodyTypes[car.bodyType] = (bodyTypes[car.bodyType] || 0) + 1;
      }
    });
    
    // ترتيب الفلاتر حسب الشيوع
    return {
      makes: Object.entries(makes)
        .sort((a, b) => (b[1] as number) - (a[1] as number))
        .slice(0, 5)
        .map(([make, count]) => ({ make, count })),
      
      years: Object.entries(years)
        .sort((a, b) => (b[1] as number) - (a[1] as number))
        .slice(0, 5)
        .map(([year, count]) => ({ year: parseInt(year), count })),
      
      priceRanges: Object.entries(priceRanges)
        .sort((a, b) => (b[1] as number) - (a[1] as number))
        .slice(0, 5)
        .map(([range, count]) => {
          const [min, max] = range.split('-').map(Number);
          return { min, max, count };
        }),
      
      bodyTypes: Object.entries(bodyTypes)
        .sort((a, b) => (b[1] as number) - (a[1] as number))
        .slice(0, 5)
        .map(([bodyType, count]) => ({ bodyType, count }))
    };
  }
  
  // الحصول على التوصيات الافتراضية عندما لا تتوفر بيانات المستخدم
  private async getDefaultRecommendations(limit: number): Promise<any> {
    // الحصول على السيارات الأحدث أو الأكثر شعبية
    const cars = await storage.getCars();
    
    // ترتيب السيارات حسب السنة بترتيب تنازلي (الأحدث أولاً)
    const sortedCars = [...cars].sort((a, b) => {
      // ترتيب حسب السنة (تنازلي)
      if (b.year && a.year) {
        return b.year - a.year;
      }
      // إذا لم تكن السنة متوفرة، استخدم السعر (تنازلي للسيارات الأغلى)
      if (b.price && a.price) {
        return b.price - a.price;
      }
      return 0;
    });
    
    // تحديد عدد النتائج
    return {
      recommendations: sortedCars.slice(0, limit),
      basedOn: {
        criteria: "الطرازات الأحدث والأكثر شعبية"
      }
    };
  }
  
  // تحليل اتجاهات السوق باستخدام الذكاء الاصطناعي
  async analyzeMarketTrends(): Promise<any> {
    try {
      // استخدام الذكاء الاصطناعي للتحليل
      const request: AIRequest = {
        prompt: "تحليل اتجاهات سوق السيارات الحالية",
        systemPrompt: "أنت خبير في تحليل سوق السيارات. قدم تحليلًا شاملاً لاتجاهات السوق الحالية بما في ذلك الماركات الأكثر مبيعًا، ومؤشرات الأسعار، والميزات الشائعة، ومقاييس العرض والطلب، والتنبؤات المستقبلية."
      };
      
      const aiResponse = await callExternalAI(request);
      
      // في التطبيق الفعلي، سنستخدم بيانات حقيقية من قاعدة البيانات وتحليل AI
      const trendData = {
        topSellingMakes: [
          { make: 'تويوتا', percentage: 24.5, change: 2.1 },
          { make: 'هوندا', percentage: 18.2, change: -0.5 },
          { make: 'نيسان', percentage: 14.7, change: 1.3 },
          { make: 'هيونداي', percentage: 11.2, change: 3.7 },
          { make: 'فورد', percentage: 8.5, change: -1.2 }
        ],
        priceIndexes: [
          { segment: 'سيارات اقتصادية', currentIndex: 112.5, previousIndex: 109.2, change: 3.3 },
          { segment: 'سيارات متوسطة', currentIndex: 108.7, previousIndex: 107.3, change: 1.4 },
          { segment: 'سيارات فاخرة', currentIndex: 105.2, previousIndex: 106.8, change: -1.6 },
          { segment: 'سيارات رياضية', currentIndex: 110.5, previousIndex: 108.9, change: 1.6 },
          { segment: 'سيارات دفع رباعي', currentIndex: 115.2, previousIndex: 110.1, change: 5.1 }
        ],
        popularFeatures: [
          { feature: 'نظام المساعدة على القيادة', popularity: 87.3, change: 12.5 },
          { feature: 'شاشة لمس كبيرة', popularity: 82.1, change: 8.2 },
          { feature: 'اتصال بلوتوث', popularity: 95.5, change: 2.1 },
          { feature: 'كاميرا خلفية', popularity: 91.8, change: 5.3 },
          { feature: 'مقاعد مدفأة', popularity: 68.4, change: 15.7 }
        ],
        supplyDemandMetrics: {
          overall: { supply: 78.5, demand: 82.3, ratio: 0.95 },
          bySegment: [
            { segment: 'سيارات اقتصادية', supply: 72.1, demand: 88.5, ratio: 0.81 },
            { segment: 'سيارات متوسطة', supply: 80.2, demand: 76.4, ratio: 1.05 },
            { segment: 'سيارات فاخرة', supply: 85.7, demand: 75.2, ratio: 1.14 },
            { segment: 'سيارات رياضية', supply: 65.3, demand: 77.8, ratio: 0.84 },
            { segment: 'سيارات دفع رباعي', supply: 71.5, demand: 92.1, ratio: 0.78 }
          ]
        },
        marketPredictions: [
          'من المتوقع زيادة الطلب على السيارات الكهربائية بنسبة 25% خلال العام القادم',
          'من المتوقع انخفاض أسعار السيارات الفاخرة بنسبة 3-5% في الربع القادم',
          'ارتفاع متوقع في أسعار السيارات الاقتصادية بسبب زيادة الطلب',
          'زيادة الاهتمام بأنظمة القيادة الذاتية والمساعدة على القيادة'
        ],
        aiInsights: aiResponse.text
      };
      
      return trendData;
    } catch (error) {
      console.error('Error analyzing market trends:', error);
      throw error;
    }
  }
  
  // طرق إضافية للتعلم المستمر والتحسين الذاتي
  
  // بدء دورة التعلم المستمر
  async startContinuousLearning(): Promise<void> {
    try {
      await this.learningSystem.continuousLearningCycle();
    } catch (error) {
      console.error('Error in continuous learning cycle:', error);
      throw error;
    }
  }
  
  // توليد محتوى للموقع باستخدام الذكاء الاصطناعي
  async generateContent(topic: string, type: 'blog' | 'tip' | 'description'): Promise<string> {
    try {
      const contentResponse = await this.learningSystem.generateContent(
        `اكتب محتوى عن ${topic} لاستخدامه كـ ${type}`,
        'content-generation'
      );
      
      return contentResponse.text;
    } catch (error) {
      console.error('Error generating content:', error);
      return 'تعذر توليد المحتوى. يرجى المحاولة مرة أخرى لاحقًا.';
    }
  }
  
  // تحليل تعليقات وتقييمات المستخدمين
  async analyzeUserFeedback(feedback: string[]): Promise<any> {
    try {
      const request: AIRequest = {
        prompt: `تحليل التعليقات التالية من المستخدمين: ${JSON.stringify(feedback)}`,
        systemPrompt: 'أنت محلل بيانات يتخصص في تحليل آراء المستخدمين. قم بتحديد المشاعر الإيجابية والسلبية، واستخراج الموضوعات المتكررة، وتلخيص النقاط الرئيسية.'
      };
      
      const response = await callExternalAI(request);
      
      return {
        analysis: response.text,
        summary: response.text.split('.')[0] + '.' // أول جملة كملخص
      };
    } catch (error) {
      console.error('Error analyzing user feedback:', error);
      throw error;
    }
  }
  
  // ولِّد سؤالًا شائعًا والإجابة عليه باستخدام الذكاء الاصطناعي
  async generateFAQ(topic: string): Promise<{ question: string, answer: string }> {
    try {
      const request: AIRequest = {
        prompt: `اكتب سؤالاً شائعًا وإجابته حول ${topic}`,
        systemPrompt: 'أنت خبير في كتابة الأسئلة الشائعة حول السيارات. اكتب سؤالاً وجوابًا مفصلاً ومفيدًا.'
      };
      
      const response = await callExternalAI(request);
      const text = response.text;
      
      // استخراج السؤال والإجابة
      const parts = text.split('\n');
      let question = '';
      let answer = '';
      
      if (parts.length >= 2) {
        question = parts[0].replace('س: ', '').replace('سؤال: ', '');
        answer = parts.slice(1).join('\n').replace('ج: ', '').replace('جواب: ', '');
      } else {
        // في حالة عدم التمكن من فصل النص بشكل صحيح
        question = `ما هي أهم النصائح عند شراء ${topic}؟`;
        answer = text;
      }
      
      return { question, answer };
    } catch (error) {
      console.error('Error generating FAQ:', error);
      return {
        question: `ما هي أهم النصائح عند شراء ${topic}؟`,
        answer: 'تعذر توليد الإجابة. يرجى المحاولة مرة أخرى لاحقًا.'
      };
    }
  }
}

export const aiServices = new AIServices();