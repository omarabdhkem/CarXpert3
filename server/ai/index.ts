import { carChatService } from './chat-service';
import { voiceSearchService } from './voice-search';
import { AIRequest, callExternalAI } from './external-api';
import { getAIConfig } from './config';
import { storage } from '../storage';
import { learningSystem } from './learning-system';
import fs from 'fs';

export class AIServices {
  chat = carChatService;
  voiceSearch = voiceSearchService;
  learningSystem = learningSystem;

  constructor() {
    // تهيئة نظام التعلم عند بدء تشغيل التطبيق
    this.startContinuousLearning().catch(err => {
      console.error('فشل في بدء دورة التعلم المستمر:', err);
    });
  }

  /**
   * تحليل صورة سيارة وتحديد الماركة والموديل والسنة والمزيد
   */
  async analyzeCarImage(imageBase64: string): Promise<any> {
    try {
      console.log('بدء تحليل صورة السيارة باستخدام الذكاء الاصطناعي');
      
      // تحليل الصورة باستخدام الذكاء الاصطناعي
      const request: AIRequest = {
        prompt: `قم بتحليل هذه الصورة وتحديد: ماركة السيارة، الموديل، السنة، الحالة، اللون، نوع الهيكل، والميزات البارزة. قدم أيضاً تقديراً لدرجة الثقة في التحليل (من 0 إلى 1)، وإذا أمكن تقدير القيمة التقريبية.
        
        أعد النتائج كـ JSON بالتنسيق التالي:
        {
          "make": "ماركة السيارة",
          "model": "موديل السيارة",
          "year": السنة،
          "condition": "حالة السيارة",
          "color": "لون السيارة",
          "bodyType": "نوع الهيكل",
          "features": ["ميزة 1", "ميزة 2"],
          "confidence": درجة الثقة (رقم من 0 إلى 1),
          "estimatedPrice": {
            "min": السعر_الأدنى,
            "max": السعر_الأعلى,
            "currency": "SAR"
          }
        }`,
        temperature: 0.2,
        imageBase64: imageBase64, // إضافة الصورة للطلب
      };
      
      // فحص اتصال الذكاء الاصطناعي وتوفر المفتاح
      const aiConfig = getAIConfig();
      
      if (!aiConfig.apiKey) {
        console.warn('مفتاح API للذكاء الاصطناعي غير موجود، استخدام البيانات التجريبية بدلاً من ذلك');
        return this.getFallbackCarAnalysis();
      }
      
      try {
        console.log('إرسال الصورة إلى خدمة الذكاء الاصطناعي مع استخدام مزود:', aiConfig.provider);
        
        // محاولة استدعاء واجهة الذكاء الاصطناعي مع الصورة
        const aiResponse = await callExternalAI(request);
        console.log('تم استلام رد من الذكاء الاصطناعي بخصوص الصورة');
        
        // نطبع جزء من الرد للمراقبة
        if (aiResponse.text) {
          const previewText = aiResponse.text.substring(0, 100) + (aiResponse.text.length > 100 ? '...' : '');
          console.log('معاينة الرد:', previewText);
        }
        
        // تحليل الرد لاستخراج البيانات المطلوبة
        try {
          // نبحث عن JSON في الرد - قد يكون محاطًا بنص إضافي
          const jsonMatch = aiResponse.text.match(/\{[\s\S]*\}/);
          let parsedResult: any = {};
          
          if (jsonMatch) {
            try {
              parsedResult = JSON.parse(jsonMatch[0]);
              console.log('تم تحليل البيانات بنجاح');
            } catch (innerError) {
              console.error('خطأ في تحليل الـ JSON المستخرج:', innerError);
              // محاولة أخرى: تحليل النص الكامل
              parsedResult = JSON.parse(aiResponse.text);
            }
          } else {
            console.error('لم يتم العثور على JSON في الرد');
            const responseText = aiResponse.text.trim();
            
            // في حالة عدم القدرة على تحليل الرد بشكل صحيح
            if (responseText.toLowerCase().includes('لا أستطيع تحديد') || 
                responseText.toLowerCase().includes('غير واضحة') ||
                responseText.toLowerCase().includes('cannot identify')) {
              console.log('ذكر الذكاء الاصطناعي أنه لا يمكن تحديد السيارة');
              return {
                make: 'غير معروف',
                model: 'غير معروف',
                year: null,
                condition: 'غير معروف',
                color: 'غير معروف',
                bodyType: 'غير معروف',
                features: [],
                confidence: 0.1,
                aiMessage: responseText.substring(0, 200)
              };
            }
            
            // محاولة استخلاص معلومات من النص
            parsedResult = this.extractCarInfoFromText(responseText);
          }
          
          // تنظيف النتائج وضمان توافقها مع الصيغة المطلوبة
          const result = {
            make: parsedResult.make || 'غير معروف',
            model: parsedResult.model || 'غير معروف',
            year: parsedResult.year || null,
            condition: parsedResult.condition || 'غير معروف',
            color: parsedResult.color || 'غير معروف',
            bodyType: parsedResult.bodyType || 'غير معروف',
            features: Array.isArray(parsedResult.features) ? parsedResult.features : [],
            confidence: typeof parsedResult.confidence === 'number' ? 
              Math.min(1, Math.max(0, parsedResult.confidence)) : 0.5,
            estimatedPrice: parsedResult.estimatedPrice || null
          };
          
          // تسجيل عملية التحليل
          await storage.logAIAnalytics({
            type: 'image_analysis',
            result,
            timestamp: new Date()
          });
          
          return result;
        } catch (parseError) {
          console.error('خطأ في تحليل رد الذكاء الاصطناعي:', parseError);
          return this.getFallbackCarAnalysis();
        }
      } catch (aiError) {
        console.error('خطأ في استدعاء واجهة الذكاء الاصطناعي:', aiError);
        return this.getFallbackCarAnalysis();
      }
    } catch (error) {
      console.error('خطأ في تحليل صورة السيارة:', error);
      
      // في حالة أي خطأ، استخدام البيانات التجريبية
      return this.getFallbackCarAnalysis();
    }
  }
  
  /**
   * استخلاص معلومات السيارة من نص غير منسق
   */
  private extractCarInfoFromText(text: string): any {
    const result: any = {
      make: 'غير معروف',
      model: 'غير معروف',
      year: null,
      condition: 'غير معروف',
      color: 'غير معروف',
      bodyType: 'غير معروف',
      features: [],
      confidence: 0.4
    };
    
    // البحث عن ماركات السيارات الشائعة
    const commonMakes = [
      'تويوتا', 'هوندا', 'نيسان', 'مرسيدس', 'بي إم دبليو', 'أودي', 'فورد', 'شيفروليه',
      'هيونداي', 'كيا', 'مازدا', 'لكزس', 'جيب', 'سوبارو', 'فولكس فاجن', 'بورش'
    ];
    
    for (const make of commonMakes) {
      if (text.includes(make)) {
        result.make = make;
        result.confidence += 0.1;
        break;
      }
    }
    
    // البحث عن السنة (رقم من 4 أرقام بين 1900 و 2099)
    const yearMatch = text.match(/\b(19\d{2}|20\d{2})\b/);
    if (yearMatch) {
      result.year = parseInt(yearMatch[0]);
      result.confidence += 0.1;
    }
    
    // البحث عن اللون
    const colors = ['أبيض', 'أسود', 'رمادي', 'فضي', 'أحمر', 'أزرق', 'أخضر', 'أصفر', 'برتقالي', 'بني', 'ذهبي'];
    for (const color of colors) {
      if (text.includes(color)) {
        result.color = color;
        result.confidence += 0.05;
        break;
      }
    }
    
    // البحث عن نوع الهيكل
    const bodyTypes = ['سيدان', 'هاتشباك', 'كوبيه', 'دفع رباعي', 'SUV', 'بيك أب', 'فان', 'مكشوفة', 'كروس أوفر'];
    for (const type of bodyTypes) {
      if (text.includes(type)) {
        result.bodyType = type;
        result.confidence += 0.05;
        break;
      }
    }
    
    // البحث عن الحالة
    const conditions = ['ممتازة', 'جيدة', 'جيدة جداً', 'متوسطة', 'مستعملة', 'جديدة'];
    for (const condition of conditions) {
      if (text.includes(condition)) {
        result.condition = condition;
        result.confidence += 0.05;
        break;
      }
    }
    
    // البحث عن الميزات
    const features = [
      'نظام ملاحة', 'كاميرا خلفية', 'مقاعد جلدية', 'فتحة سقف', 'نظام صوتي', 'تكييف',
      'بلوتوث', 'مستشعرات', 'مصابيح LED', 'مساعد ركن', 'عجلات ألومنيوم', 'تحكم مناخي',
      'شاشة لمس', 'نظام مراقبة العمياء', 'أبواب كهربائية'
    ];
    
    for (const feature of features) {
      if (text.includes(feature)) {
        result.features.push(feature);
        result.confidence += 0.02;
      }
    }
    
    // تنظيف النتيجة الإجمالية
    result.confidence = Math.min(0.9, result.confidence); // لا تتجاوز 0.9
    
    return result;
  }
  
  /**
   * الحصول على بيانات تحليل تجريبية في حالة عدم توفر الذكاء الاصطناعي
   * لأغراض العرض فقط
   */
  private getFallbackCarAnalysis(): any {
    // إنشاء بيانات تجريبية مع ملاحظة أنها بيانات تجريبية
    const result = {
      make: 'تويوتا',
      model: 'كامري',
      year: 2022,
      condition: 'ممتازة',
      color: 'أبيض',
      bodyType: 'سيدان',
      features: ['نظام ملاحة', 'كاميرا خلفية', 'مقاعد جلدية', 'فتحة سقف'],
      confidence: 0.92,
      estimatedPrice: {
        min: 90000,
        max: 100000,
        currency: 'SAR'
      },
      _isFallback: true // علامة داخلية لتحديد أن هذه بيانات تجريبية
    };
    
    return result;
  }

  /**
   * اقتراح سعر تنافسي لسيارة بناءً على بيانات السوق
   */
  async suggestCompetitivePrice(carData: any): Promise<any> {
    try {
      const request: AIRequest = {
        prompt: `قم باقتراح سعر تنافسي لهذه السيارة بناءً على بيانات السوق:\n${JSON.stringify(carData, null, 2)}`,
        systemPrompt: `أنت خبير في تسعير السيارات. مهمتك هي اقتراح سعر تنافسي وعادل للسيارات بناءً على بياناتها والسوق الحالي.`,
        temperature: 0.3,
      };
      
      const aiResponse = await callExternalAI(request);
      
      // تحليل الرد للحصول على السعر المقترح
      try {
        const priceSuggestion = JSON.parse(aiResponse.text);
        return priceSuggestion;
      } catch {
        // في حالة فشل تحليل الرد، نرجع النص الأصلي
        return { 
          suggestedPrice: null,
          priceRange: null,
          explanation: aiResponse.text
        };
      }
    } catch (error) {
      console.error('خطأ في اقتراح سعر تنافسي:', error);
      throw new Error('فشل في اقتراح سعر تنافسي');
    }
  }

  /**
   * بحث ذكي باستخدام معالجة اللغة الطبيعية
   */
  async intelligentSearch(query: string, userId?: number): Promise<any> {
    try {
      const aiRequest: AIRequest = {
        prompt: `استعلام البحث: "${query}"`,
        systemPrompt: `أنت مساعد بحث ذكي متخصص في السيارات. قم بتحليل استعلام البحث وتحويله إلى استعلام منظم وفلاتر بحث.
        
        أعد النتائج كـ JSON بالتنسيق التالي:
        {
          "processedQuery": "الاستعلام المعالج",
          "filters": {
            "make": "الماركة أو مصفوفة ماركات",
            "model": "الموديل أو مصفوفة موديلات",
            "year": { "min": السنة_الأدنى, "max": السنة_الأعلى },
            "price": { "min": السعر_الأدنى, "max": السعر_الأعلى },
            "color": "اللون",
            "bodyType": "نوع الهيكل",
            "transmission": "نوع ناقل الحركة",
            "fuelType": "نوع الوقود",
            "features": ["ميزة 1", "ميزة 2"]
          },
          "suggestedFilters": {
            "category": ["فئة 1", "فئة 2"],
            "popularity": ["الأكثر مبيعاً", "الأعلى تقييماً"],
            "other": ["فلتر آخر"]
          }
        }
        
        املأ فقط الحقول التي يمكن استنتاجها من استعلام البحث. تجنب التخمين أو إضافة معلومات غير موجودة في الاستعلام الأصلي.`,
        temperature: 0.3,
      };
      
      const aiResponse = await callExternalAI(aiRequest);
      
      try {
        const searchInterpretation = JSON.parse(aiResponse.text);
        
        // تحسين نتائج البحث باستخدام بيانات سلوك المستخدم إن وجدت
        if (userId) {
          const userBehavior = await storage.getUserBehavior(userId);
          if (userBehavior) {
            searchInterpretation.enhancedWithUserBehavior = true;
            // هنا يمكن إضافة منطق لتحسين نتائج البحث بناءً على سلوك المستخدم
          }
        }
        
        // تحليل الاستعلام وإرجاع نتائج منظمة
        const parsedQuery = this.parseSearchQuery(query, aiResponse.text);
        
        return {
          processedQuery: searchInterpretation.processedQuery || query,
          filters: searchInterpretation.filters || {},
          suggestedFilters: searchInterpretation.suggestedFilters || {},
          parsedQuery
        };
      } catch (error) {
        console.error('خطأ في تحليل رد الذكاء الاصطناعي:', error);
        return {
          processedQuery: query,
          filters: {},
          suggestedFilters: {},
          error: 'فشل في تحليل نتائج البحث'
        };
      }
    } catch (error) {
      console.error('خطأ في البحث الذكي:', error);
      throw new Error('فشل في معالجة البحث الذكي');
    }
  }
  
  private parseSearchQuery(query: string, aiInterpretation?: string): any {
    // تحليل بسيط للاستعلام بناءً على كلمات مفتاحية
    const keywords = {
      brands: ['تويوتا', 'هوندا', 'نيسان', 'مرسيدس', 'بي إم دبليو', 'أودي'],
      colors: ['أحمر', 'أبيض', 'أسود', 'أزرق', 'فضي', 'ذهبي'],
      bodyTypes: ['سيدان', 'هاتشباك', 'دفع رباعي', 'كوبيه', 'مكشوفة'],
      transmissions: ['أوتوماتيك', 'مانيوال', 'يدوي', 'ناقل أوتوماتيكي'],
    };
    
    // بحث بسيط عن الكلمات المفتاحية
    const result: any = {};
    
    for (const [category, terms] of Object.entries(keywords)) {
      for (const term of terms) {
        if (query.includes(term)) {
          if (!result[category]) result[category] = [];
          result[category].push(term);
        }
      }
    }
    
    // البحث عن الأعداد (السنوات والأسعار)
    const yearMatch = query.match(/\b(20\d{2})\b/);
    if (yearMatch) {
      result.year = parseInt(yearMatch[0]);
    }
    
    const priceMatch = query.match(/(\d+)\s*(ألف|الف|مليون)/);
    if (priceMatch) {
      const number = parseInt(priceMatch[1]);
      const multiplier = priceMatch[2] === 'مليون' ? 1000000 : 1000;
      result.price = number * multiplier;
    }
    
    return result;
  }

  /**
   * الحصول على توصيات مخصصة للمستخدم
   */
  async getPersonalizedRecommendations(userId: number, limit: number = 10): Promise<any> {
    try {
      // الحصول على بيانات سلوك المستخدم
      const userBehavior = await storage.getUserBehavior(userId);
      
      if (!userBehavior || Object.keys(userBehavior).length === 0) {
        // إذا لم تكن هناك بيانات للمستخدم، نقدم توصيات افتراضية
        return this.getDefaultRecommendations(limit);
      }
      
      // استخراج تفضيلات المستخدم
      const preferences = this.extractUserPreferences(userBehavior);
      
      // الحصول على السيارات المتوافقة مع تفضيلات المستخدم
      const cars = await storage.getCars(preferences);
      
      // ترتيب النتائج بناءً على تفضيلات المستخدم
      const rankedResults = this.rankResultsByUserPreferences(cars, userBehavior);
      
      // إرجاع النتائج الأعلى ترتيباً
      const topResults = rankedResults.slice(0, limit).map(car => ({
        ...car,
        matchScore: car._score || 0.7, // درجة التطابق
        matchReason: `هذه السيارة تتوافق مع تفضيلاتك في ${car._matchReason || 'السيارات المماثلة'}`
      }));
      
      // توليد فلاتر مقترحة
      const suggestedFilters = this.generateSuggestedFilters(topResults);
      
      return {
        results: topResults,
        suggestedFilters,
        preferences
      };
    } catch (error) {
      console.error('خطأ في الحصول على التوصيات المخصصة:', error);
      
      // في حالة الخطأ، نرجع توصيات افتراضية
      return this.getDefaultRecommendations(limit);
    }
  }
  
  private extractUserPreferences(userBehavior: any): any {
    const preferences: any = {};
    
    // استخراج التفضيلات من سلوك المستخدم
    if (userBehavior.viewedCars && userBehavior.viewedCars.length > 0) {
      // استخراج الماركات الأكثر مشاهدة
      const makes = userBehavior.viewedCars.map((car: any) => car.make);
      const makeFrequency: any = {};
      makes.forEach((make: string) => {
        makeFrequency[make] = (makeFrequency[make] || 0) + 1;
      });
      const topMakes = Object.entries(makeFrequency)
        .sort((a: any, b: any) => b[1] - a[1])
        .slice(0, 3)
        .map((entry: any) => entry[0]);
      
      if (topMakes.length > 0) {
        preferences.make = topMakes;
      }
      
      // استخراج نطاق السنوات
      if (userBehavior.yearPreferences) {
        preferences.yearRange = this.calculateYearRange(userBehavior.yearPreferences);
      }
      
      // استخراج نطاق الأسعار
      if (userBehavior.priceRangePreferences) {
        preferences.priceRange = this.calculatePriceRange(userBehavior.priceRangePreferences);
      }
      
      // استخراج التفضيلات الأخرى
      if (userBehavior.bodyTypePreferences) {
        const bodyTypes = Object.entries(userBehavior.bodyTypePreferences)
          .sort((a: any, b: any) => b[1] - a[1])
          .slice(0, 2)
          .map((entry: any) => entry[0]);
        
        if (bodyTypes.length > 0) {
          preferences.bodyType = bodyTypes;
        }
      }
    }
    
    return preferences;
  }
  
  private rankResultsByUserPreferences(results: any[], userBehavior: any): any[] {
    return results.map(result => {
      let score = 0.5; // درجة افتراضية
      let matchReasons = [];
      
      // حساب الدرجة بناءً على تطابق الماركة
      if (userBehavior.makePreferences && userBehavior.makePreferences[result.make]) {
        score += 0.2 * (userBehavior.makePreferences[result.make] / 10);
        matchReasons.push('الماركة المفضلة');
      }
      
      // حساب الدرجة بناءً على نطاق السنة
      if (userBehavior.yearPreferences) {
        const yearDiff = Math.abs(result.year - this.findClosestValue(result.year, Object.keys(userBehavior.yearPreferences).map(Number))!);
        if (yearDiff < 3) {
          score += 0.15 * (1 - yearDiff / 5);
          matchReasons.push('السنة المناسبة');
        }
      }
      
      // حساب الدرجة بناءً على نطاق السعر
      if (userBehavior.priceRangePreferences && result.price) {
        const preferredPrices = Object.keys(userBehavior.priceRangePreferences)
          .map(price => parseInt(price.replace(/[^\d]/g, '')));
        const priceDiff = Math.abs(result.price - this.findClosestValue(result.price, preferredPrices)!);
        const maxPrice = Math.max(...preferredPrices);
        
        if (priceDiff < maxPrice * 0.2) {
          score += 0.15 * (1 - priceDiff / (maxPrice * 0.3));
          matchReasons.push('السعر المناسب');
        }
      }
      
      // حساب الدرجة بناءً على نوع الهيكل
      if (userBehavior.bodyTypePreferences && userBehavior.bodyTypePreferences[result.bodyType]) {
        score += 0.1 * (userBehavior.bodyTypePreferences[result.bodyType] / 5);
        matchReasons.push('نوع السيارة المفضل');
      }
      
      // إضافة درجة التطابق وسبب التطابق
      result._score = Math.min(0.95, score); // لا تتجاوز 0.95
      result._matchReason = matchReasons.length > 0 ? matchReasons.join(' و') : 'تفضيلاتك العامة';
      
      return result;
    }).sort((a, b) => b._score - a._score);
  }
  
  private findClosestValue(value: number, array: number[]): number | null {
    if (array.length === 0) return null;
    
    return array.reduce((prev, curr) => {
      return Math.abs(curr - value) < Math.abs(prev - value) ? curr : prev;
    });
  }
  
  private calculateYearRange(yearsObj: any): any {
    const years = Object.keys(yearsObj).map(Number).sort();
    if (years.length === 0) return null;
    
    return {
      min: years[0],
      max: years[years.length - 1]
    };
  }
  
  private calculatePriceRange(priceRangesObj: any): any {
    const prices = Object.keys(priceRangesObj)
      .map(price => parseInt(price.replace(/[^\d]/g, '')))
      .sort((a, b) => a - b);
    
    if (prices.length === 0) return null;
    
    return {
      min: prices[0],
      max: prices[prices.length - 1]
    };
  }
  
  private generateSuggestedFilters(results: any[]): any {
    const makes: Record<string, number> = {};
    const bodyTypes: Record<string, number> = {};
    const years: Record<number, number> = {};
    
    results.forEach(result => {
      if (result.make) makes[result.make] = (makes[result.make] || 0) + 1;
      if (result.bodyType) bodyTypes[result.bodyType] = (bodyTypes[result.bodyType] || 0) + 1;
      if (result.year) years[result.year] = (years[result.year] || 0) + 1;
    });
    
    const topMakes = Object.entries(makes)
      .sort((a: any, b: any) => b[1] - a[1])
      .slice(0, 3)
      .map((entry: any) => entry[0]);
      
    const topBodyTypes = Object.entries(bodyTypes)
      .sort((a: any, b: any) => b[1] - a[1])
      .slice(0, 3)
      .map((entry: any) => entry[0]);
    
    const yearsList = Object.keys(years).map(Number).sort();
    const yearRange = yearsList.length > 0 ? {
      min: yearsList[0],
      max: yearsList[yearsList.length - 1]
    } : null;
    
    return {
      makes: topMakes,
      bodyTypes: topBodyTypes,
      yearRange
    };
  }
  
  private async getDefaultRecommendations(limit: number): Promise<any> {
    try {
      // الحصول على السيارات الأكثر شعبية
      const popularCars = await storage.getCars({
        status: 'available',
      });
      
      // ترتيب النتائج بناءً على الشعبية
      const topResults = popularCars.slice(0, limit).map((car: any, index: number) => ({
        ...car,
        matchScore: 0.9 - (index * 0.05), // درجة تطابق تقل تدريجياً
        matchReason: 'سيارات شائعة ورائجة'
      }));
      
      return {
        results: topResults,
        suggestedFilters: this.generateSuggestedFilters(topResults),
        isDefaultRecommendation: true
      };
    } catch (error) {
      console.error('خطأ في الحصول على التوصيات الافتراضية:', error);
      return {
        results: [],
        error: 'فشل في الحصول على التوصيات',
        isDefaultRecommendation: true
      };
    }
  }

  /**
   * تحليل اتجاهات السوق
   */
  async analyzeMarketTrends(): Promise<any> {
    try {
      // الحصول على البيانات المخزنة سابقاً
      const cachedTrends = await storage.getMarketTrends();
      
      if (cachedTrends && cachedTrends.timestamp) {
        const cacheAge = Date.now() - new Date(cachedTrends.timestamp).getTime();
        
        // استخدام البيانات المخزنة إذا كانت حديثة (أقل من يوم)
        if (cacheAge < 24 * 60 * 60 * 1000) {
          return cachedTrends;
        }
      }
      
      // الحصول على بيانات السيارات
      const cars = await storage.getCars();
      
      // تحليل الاتجاهات باستخدام الذكاء الاصطناعي
      const request: AIRequest = {
        prompt: `قم بتحليل اتجاهات سوق السيارات بناءً على البيانات التالية:\n${JSON.stringify(cars.slice(0, 50), null, 2)}`,
        systemPrompt: `أنت محلل ذكي لسوق السيارات. مهمتك هي استخراج اتجاهات السوق وتقديم تحليل استراتيجي بناءً على البيانات.`,
        temperature: 0.4,
      };
      
      const aiResponse = await callExternalAI(request);
      
      // تحليل الرد وتنظيمه
      const trends = {
        analysis: aiResponse.text,
        timestamp: new Date(),
        topMakes: this.extractTopMakes(cars),
        priceRanges: this.extractPriceRanges(cars),
        mostViewedCars: this.extractMostViewed(cars),
        marketHealthScore: this.calculateMarketHealth(cars)
      };
      
      // حفظ التحليل في التخزين
      await storage.createOrUpdateMarketTrends(trends);
      
      return trends;
    } catch (error) {
      console.error('خطأ في تحليل اتجاهات السوق:', error);
      throw new Error('فشل في تحليل اتجاهات السوق');
    }
  }
  
  // استخراج أكثر الماركات شيوعاً
  private extractTopMakes(cars: any[]): { make: string, count: number }[] {
    const makes: Record<string, number> = {};
    
    cars.forEach(car => {
      if (car.make) {
        makes[car.make] = (makes[car.make] || 0) + 1;
      }
    });
    
    return Object.entries(makes)
      .map(([make, count]) => ({ make, count: count as number }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }
  
  // استخراج نطاقات الأسعار
  private extractPriceRanges(cars: any[]): { range: string, count: number }[] {
    const ranges: Record<string, number> = {
      'أقل من 50 ألف': 0,
      '50 - 100 ألف': 0,
      '100 - 150 ألف': 0,
      '150 - 200 ألف': 0,
      'أكثر من 200 ألف': 0
    };
    
    cars.forEach(car => {
      if (typeof car.price === 'number') {
        if (car.price < 50000) {
          ranges['أقل من 50 ألف']++;
        } else if (car.price < 100000) {
          ranges['50 - 100 ألف']++;
        } else if (car.price < 150000) {
          ranges['100 - 150 ألف']++;
        } else if (car.price < 200000) {
          ranges['150 - 200 ألف']++;
        } else {
          ranges['أكثر من 200 ألف']++;
        }
      }
    });
    
    return Object.entries(ranges)
      .map(([range, count]) => ({ range, count: count as number }));
  }
  
  // استخراج السيارات الأكثر مشاهدة
  private extractMostViewed(cars: any[]): any[] {
    return [...cars]
      .sort((a, b) => (b.viewCount || 0) - (a.viewCount || 0))
      .slice(0, 5)
      .map(car => ({
        id: car.id,
        make: car.make,
        model: car.model,
        year: car.year,
        viewCount: car.viewCount || 0
      }));
  }
  
  // حساب درجة صحة السوق
  private calculateMarketHealth(cars: any[]): number {
    if (cars.length === 0) return 0;
    
    // عوامل حساب صحة السوق
    const availableCarsRatio = cars.filter(car => car.status === 'available').length / cars.length;
    const recentListingsRatio = cars.filter(car => {
      const listedDate = car.createdAt ? new Date(car.createdAt) : null;
      if (!listedDate) return false;
      
      const daysSinceListed = (Date.now() - listedDate.getTime()) / (1000 * 60 * 60 * 24);
      return daysSinceListed <= 30;
    }).length / cars.length;
    
    // حساب المتوسط المرجح
    const health = (availableCarsRatio * 0.4) + (recentListingsRatio * 0.6);
    
    // تحويل الدرجة إلى مقياس من 0 إلى 100
    return Math.round(health * 100);
  }

  /**
   * بدء عملية التعلم المستمر
   */
  async startContinuousLearning(): Promise<void> {
    try {
      console.log('بدء دورة التعلم المستمر...');
      
      // جدولة دورية
      setInterval(() => {
        this.learningSystem.continuousLearningCycle()
          .catch(err => console.error('خطأ في دورة التعلم المستمر:', err));
      }, 24 * 60 * 60 * 1000); // مرة كل 24 ساعة
      
      // تشغيل دورة فورية
      await this.learningSystem.continuousLearningCycle();
      
      console.log('تم بدء التعلم المستمر بنجاح.');
    } catch (error) {
      console.error('فشل في بدء التعلم المستمر:', error);
      throw error;
    }
  }

  /**
   * توليد محتوى باستخدام الذكاء الاصطناعي
   */
  async generateContent(topic: string, type: 'blog' | 'tip' | 'description'): Promise<string> {
    try {
      let prompt = '';
      let systemPrompt = '';
      
      switch (type) {
        case 'blog':
          systemPrompt = 'أنت كاتب محتوى متخصص في مجال السيارات. اكتب مقالاً مفيداً وغنياً بالمعلومات عن الموضوع المحدد.';
          prompt = `اكتب مقالاً عن "${topic}" يتضمن مقدمة جذابة، نقاط رئيسية، وخاتمة. يجب أن يكون المقال غنياً بالمعلومات مع التركيز على الحقائق الدقيقة، والنصائح العملية، والمصطلحات التقنية المناسبة.`;
          break;
        case 'tip':
          systemPrompt = 'أنت خبير في السيارات ومتخصص في تقديم نصائح موجزة ومفيدة للمستخدمين.';
          prompt = `قدم 5 نصائح مفيدة وموجزة حول "${topic}". يجب أن تكون النصائح عملية ومباشرة، ولا تتجاوز 3 أسطر لكل نصيحة.`;
          break;
        case 'description':
          systemPrompt = 'أنت متخصص في كتابة أوصاف مقنعة وجذابة للسيارات.';
          prompt = `اكتب وصفاً جذاباً ومقنعاً لسيارة "${topic}". يجب أن يتضمن الوصف المميزات الرئيسية، والمواصفات المهمة، ونقاط القوة. الوصف يجب أن لا يتجاوز 150 كلمة.`;
          break;
      }
      
      const aiRequest: AIRequest = {
        prompt,
        systemPrompt,
        temperature: 0.7,
      };
      
      const aiResponse = await callExternalAI(aiRequest);
      return aiResponse.text;
    } catch (error) {
      console.error('خطأ في توليد المحتوى:', error);
      throw new Error('فشل في توليد المحتوى');
    }
  }

  /**
   * تحليل ملاحظات المستخدمين
   */
  async analyzeUserFeedback(feedback: string[]): Promise<any> {
    try {
      const request: AIRequest = {
        prompt: `قم بتحليل ملاحظات المستخدمين التالية وتلخيص النقاط الرئيسية، المشاكل، والاقتراحات:\n\n${feedback.join('\n\n')}`,
        systemPrompt: 'أنت محلل لتجربة المستخدم ومتخصص في استخراج الأفكار والمشاعر من ملاحظات المستخدمين. قم بتصنيف الملاحظات، وتحديد الاتجاهات، واقتراح تحسينات قابلة للتنفيذ.',
        temperature: 0.3,
      };
      
      const aiResponse = await callExternalAI(request);
      
      // هنا يمكن إضافة منطق إضافي لتحليل وتنظيم النتائج
      
      return {
        analysis: aiResponse.text,
        timestamp: new Date()
      };
    } catch (error) {
      console.error('خطأ في تحليل ملاحظات المستخدمين:', error);
      throw new Error('فشل في تحليل ملاحظات المستخدمين');
    }
  }

  /**
   * توليد أسئلة متكررة حول موضوع محدد
   */
  async generateFAQ(topic: string): Promise<{ question: string, answer: string }> {
    try {
      const request: AIRequest = {
        prompt: `قم بإنشاء سؤال وجواب شائع حول "${topic}" في مجال السيارات. السؤال يجب أن يكون سؤالاً شائعاً يطرحه المستخدمون، والإجابة يجب أن تكون شاملة ومفيدة وموجزة.`,
        systemPrompt: 'أنت متخصص في إنشاء محتوى الأسئلة المتكررة في مجال السيارات. مهمتك هي إنشاء أسئلة واقعية وإجابات مفيدة تلبي احتياجات المستخدمين وتوقعاتهم.',
        temperature: 0.7,
      };
      
      const aiResponse = await callExternalAI(request);
      
      // تحليل الرد واستخراج السؤال والإجابة
      const text = aiResponse.text;
      const questionMatch = text.match(/^سؤال:(.*)$/im);
      const answerMatch = text.match(/^إجابة:(.*)$/im);
      
      if (questionMatch && answerMatch) {
        return {
          question: questionMatch[1].trim(),
          answer: answerMatch[1].trim()
        };
      }
      
      // في حالة عدم العثور على تنسيق سؤال/إجابة، حاول تقسيم النص
      const lines = text.split('\n').filter(line => line.trim() !== '');
      if (lines.length >= 2) {
        return {
          question: lines[0].trim(),
          answer: lines.slice(1).join('\n').trim()
        };
      }
      
      // في حالة الفشل في التحليل، أرجع النص كاملاً كإجابة
      return {
        question: topic,
        answer: text
      };
    } catch (error) {
      console.error('خطأ في توليد الأسئلة المتكررة:', error);
      throw new Error('فشل في توليد الأسئلة المتكررة');
    }
  }
}

export const aiServices = new AIServices();