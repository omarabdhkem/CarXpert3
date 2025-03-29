import { AIRequest, callExternalAI, AIResponse } from './external-api';
import { storage } from '../storage';
import { aiServices } from '.';

/**
 * خدمة البحث الصوتي
 */
export class VoiceSearchService {
  /**
   * معالجة استعلام صوتي
   * @param audioBase64 الملف الصوتي بتنسيق base64
   * @param userId معرف المستخدم
   */
  async processAudioSearch(audioBase64: string, userId?: number): Promise<any> {
    try {
      // في التطبيق الحقيقي، هنا سيتم إرسال الملف الصوتي إلى خدمة تحويل الصوت إلى نص
      // مثل Google Speech-to-Text أو أي خدمة أخرى
      
      // لأغراض العرض التوضيحي، سنفترض أن لدينا النص من الملف الصوتي
      const transcribedText = 'أبحث عن سيارات تويوتا كامري موديل 2022';
      
      // تسجيل البيانات للتحليل
      await this.logVoiceSearch(transcribedText, userId);
      
      // معالجة النص المستخرج كاستعلام بحث
      return this.processTextQuery(transcribedText, userId);
    } catch (error) {
      console.error('خطأ في معالجة البحث الصوتي:', error);
      return {
        error: 'فشل في معالجة الطلب الصوتي',
        details: error instanceof Error ? error.message : 'خطأ غير معروف'
      };
    }
  }
  
  /**
   * معالجة استعلام نصي
   * @param query نص الاستعلام
   * @param userId معرف المستخدم
   */
  async processTextQuery(query: string, userId?: number): Promise<any> {
    try {
      // تحليل الاستعلام باستخدام الذكاء الاصطناعي
      const searchResults = await aiServices.intelligentSearch(query, userId);
      
      // تنفيذ البحث بناءً على الاستعلام والفلاتر
      const cars = await this.searchCars(searchResults.filters);
      
      // تسجيل نتائج البحث
      if (userId) {
        await storage.saveSearchHistory(userId, query, searchResults.filters);
      }
      
      return {
        query,
        processedQuery: searchResults.processedQuery,
        filters: searchResults.filters,
        suggestedFilters: searchResults.suggestedFilters,
        results: cars
      };
    } catch (error) {
      console.error('خطأ في معالجة استعلام النص:', error);
      return {
        error: 'فشل في معالجة استعلام البحث',
        details: error instanceof Error ? error.message : 'خطأ غير معروف'
      };
    }
  }
  
  /**
   * تحليل استعلام البحث باستخدام الذكاء الاصطناعي
   * @param query نص الاستعلام
   */
  private async analyzeQuery(query: string): Promise<any> {
    try {
      const aiRequest: AIRequest = {
        prompt: `قم بتحليل استعلام البحث التالي عن السيارات وترجمته إلى فلاتر بحث منظمة:\n\n"${query}"`,
        systemPrompt: `أنت محلل لغة طبيعية متخصص في مجال السيارات. مهمتك هي تحليل استعلامات البحث وتحويلها إلى فلاتر بحث منظمة.
        
        قم بإرجاع النتائج بتنسيق JSON على النحو التالي:
        {
          "processedQuery": "الاستعلام المعالج",
          "filters": {
            "make": "الماركة أو مصفوفة ماركات",
            "model": "الموديل أو مصفوفة موديلات",
            "yearRange": { "min": السنة_الأدنى, "max": السنة_الأعلى },
            "priceRange": { "min": السعر_الأدنى, "max": السعر_الأعلى },
            "color": "اللون",
            "transmission": "نوع ناقل الحركة",
            "fuelType": "نوع الوقود",
            "bodyType": "نوع الهيكل",
            "keywords": ["كلمة1", "كلمة2"]
          }
        }`,
        temperature: 0.3,
      };
      
      const aiResponse: AIResponse = await callExternalAI(aiRequest);
      
      // محاولة تحليل الرد كـ JSON
      try {
        return JSON.parse(aiResponse.text);
      } catch (error) {
        console.error('فشل في تحليل رد الذكاء الاصطناعي كـ JSON:', error);
        // إرجاع تحليل بسيط إذا فشل التحليل
        return this.simpleParse(query);
      }
    } catch (error) {
      console.error('خطأ في تحليل الاستعلام:', error);
      return this.simpleParse(query);
    }
  }
  
  /**
   * تحليل بسيط للاستعلام
   * @param query نص الاستعلام
   */
  private simpleParse(query: string): any {
    const filters: any = {
      keywords: []
    };
    
    // البحث عن الماركات الشائعة
    const brands = ['تويوتا', 'هوندا', 'نيسان', 'مرسيدس', 'بي ام دبليو', 'لكزس', 'كيا', 'هيونداي'];
    for (const brand of brands) {
      if (query.includes(brand)) {
        filters.make = brand;
        break;
      }
    }
    
    // البحث عن الموديلات الشائعة
    const models = ['كامري', 'كورولا', 'اكورد', 'سوناتا', 'التيما', 'مازدا 3', 'سيفيك'];
    for (const model of models) {
      if (query.includes(model)) {
        filters.model = model;
        break;
      }
    }
    
    // البحث عن السنة
    const yearMatch = query.match(/\b(20\d{2})\b/);
    if (yearMatch) {
      const year = parseInt(yearMatch[1]);
      filters.yearRange = {
        min: year,
        max: year
      };
    }
    
    // البحث عن لون
    const colors = ['أبيض', 'أسود', 'أحمر', 'أزرق', 'فضي', 'رمادي'];
    for (const color of colors) {
      if (query.includes(color)) {
        filters.color = color;
        break;
      }
    }
    
    return {
      processedQuery: query,
      filters: filters
    };
  }
  
  /**
   * البحث عن السيارات باستخدام الفلاتر المحددة
   * @param filters فلاتر البحث
   */
  private async searchCars(filters: any): Promise<any[]> {
    // تحويل الفلاتر إلى تنسيق متوافق مع خدمة التخزين
    const searchParams: any = {};
    
    if (filters.make) {
      searchParams.make = filters.make;
    }
    
    if (filters.model) {
      searchParams.model = filters.model;
    }
    
    if (filters.color) {
      searchParams.color = filters.color;
    }
    
    if (filters.transmission) {
      searchParams.transmission = filters.transmission;
    }
    
    if (filters.fuelType) {
      searchParams.fuelType = filters.fuelType;
    }
    
    if (filters.bodyType) {
      searchParams.bodyType = filters.bodyType;
    }
    
    if (filters.yearRange) {
      if (filters.yearRange.min === filters.yearRange.max) {
        searchParams.year = filters.yearRange.min;
      }
      // في التطبيق الحقيقي، هنا ستكون هناك معالجة لنطاق السنوات
    }
    
    if (filters.priceRange) {
      // في التطبيق الحقيقي، هنا ستكون هناك معالجة لنطاق الأسعار
    }
    
    // البحث في قاعدة البيانات
    try {
      return await storage.getCars(searchParams);
    } catch (error) {
      console.error('خطأ في البحث عن السيارات:', error);
      return [];
    }
  }
  
  /**
   * تسجيل عملية البحث الصوتي
   * @param query نص الاستعلام
   * @param userId معرف المستخدم
   */
  private async logVoiceSearch(query: string, userId?: number): Promise<void> {
    try {
      await storage.logAIAnalytics({
        type: 'voice_search',
        query,
        userId,
        timestamp: new Date()
      });
      
      if (userId) {
        await storage.updateUserBehavior(userId, {
          voiceSearchCount: { $inc: 1 },
          lastVoiceSearch: new Date()
        });
      }
    } catch (error) {
      console.error('خطأ في تسجيل البحث الصوتي:', error);
    }
  }
}

// إنشاء نسخة من خدمة البحث الصوتي
export const voiceSearchService = new VoiceSearchService();