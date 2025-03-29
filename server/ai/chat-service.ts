import { AIRequest, callExternalAI } from './external-api';
import { storage } from '../storage';

/**
 * نموذج طلب المحادثة
 */
export interface ChatRequest {
  message: string;
  userId?: number;
  context?: string[];
}

/**
 * نموذج استجابة المحادثة
 */
export interface ChatResponse {
  text: string;
  metadata?: any;
}

/**
 * خدمة المحادثة الذكية المتخصصة في السيارات
 */
export class CarChatService {
  private readonly systemPrompt = `
أنت مساعد متخصص في السيارات باسم "خبير السيارات" تعمل على منصة CarXpert، وهي منصة عربية متخصصة في بيع وشراء السيارات.
مهمتك هي تقديم معلومات دقيقة وموثوقة عن السيارات، ومساعدة المستخدمين في اتخاذ قرارات شراء مستنيرة.

قواعد يجب اتباعها:
1. كن محترفًا ودقيقًا في المعلومات التي تقدمها عن السيارات.
2. قدم إجابات موجزة ومباشرة كلما أمكن ذلك.
3. اعترف بحدود معرفتك إذا لم تكن متأكدًا من معلومة ما.
4. لا تشارك آراءً متحيزة حول الماركات أو الطرازات.
5. قدم نصائح عملية بناءً على احتياجات المستخدم المحددة.
6. استخدم لغة بسيطة وواضحة مع تجنب المصطلحات التقنية المعقدة ما لم يطلب المستخدم تفاصيل تقنية.
7. رد على الاستفسارات باللغة العربية، مع الاستشهاد بالمصطلحات الإنجليزية عند الضرورة للتوضيح.

يمكنك مساعدة المستخدمين في:
- تقديم معلومات عن مواصفات السيارات وأدائها وميزاتها.
- المقارنة بين موديلات مختلفة من السيارات.
- تقديم نصائح للصيانة والعناية بالسيارات.
- شرح المصطلحات والتقنيات الخاصة بالسيارات.
- تقديم نصائح لشراء سيارة جديدة أو مستعملة.
- المساعدة في تحديد أسباب المشاكل الشائعة في السيارات.
- تقديم معلومات عن أحدث تقنيات السيارات وتطوراتها.
- المساعدة في فهم أنظمة السلامة والمساعدة في السيارات الحديثة.

لا تقم بـ:
- مساعدة المستخدمين في أي أنشطة غير قانونية.
- مشاركة معلومات مضللة عن السيارات.
- الترويج لمنتجات أو خدمات محددة خارج نطاق المنصة.
- تكوين سردية سلبية عن منافسي المنصة.

تذكر أن تكون دائمًا محترفًا ومفيدًا، وأن تركز على تقديم قيمة حقيقية للمستخدمين.
`;

  /**
   * معالجة طلب المحادثة
   */
  async processChat(chatRequest: ChatRequest): Promise<ChatResponse> {
    try {
      const { message, userId, context = [] } = chatRequest;
      
      // بناء سياق المحادثة من التاريخ
      const conversationContext = this.buildConversationContext(context);
      
      // إنشاء طلب للذكاء الاصطناعي
      const aiRequest: AIRequest = {
        prompt: `${conversationContext}\n\nالمستخدم: ${message}\n\nخبير السيارات:`,
        systemPrompt: this.systemPrompt,
        temperature: 0.7,
      };
      
      // استدعاء واجهة الذكاء الاصطناعي
      const aiResponse = await callExternalAI(aiRequest);
      
      // تسجيل التفاعل للتعلم المستقبلي
      if (userId) {
        await this.logUserInteraction(userId, message, 'user_message');
        await this.logUserInteraction(userId, aiResponse.text, 'assistant_message');
        
        // استخراج الكلمات المفتاحية للتعلم
        const { keywords, carNames } = this.extractKeywords(message);
        
        // حفظ التفاعل لنظام التعلم
        await this.saveInteractionForLearning(
          userId,
          message,
          aiResponse.text,
          { keywords, carNames }
        );
      }
      
      return {
        text: aiResponse.text,
        metadata: aiResponse.metadata,
      };
    } catch (error) {
      console.error('خطأ في معالجة المحادثة:', error);
      return {
        text: 'عذراً، حدث خطأ أثناء معالجة طلبك. يرجى المحاولة مرة أخرى لاحقاً.',
      };
    }
  }
  
  /**
   * بناء سياق المحادثة من تاريخ المحادثة
   */
  private buildConversationContext(context: string[]): string {
    // إذا كان السياق فارغًا، عد بخطوة أولى في المحادثة
    if (!context || context.length === 0) {
      return '';
    }
    
    // بناء سياق المحادثة بالتناوب بين المستخدم والمساعد
    let conversationContext = '';
    for (let i = 0; i < context.length; i++) {
      const prefix = i % 2 === 0 ? 'المستخدم: ' : 'خبير السيارات: ';
      conversationContext += `${prefix}${context[i]}\n\n`;
    }
    
    return conversationContext;
  }
  
  /**
   * تسجيل تفاعل المستخدم
   */
  private async logUserInteraction(userId: number, message: string, type: string): Promise<void> {
    try {
      // حفظ تفاعل المستخدم في قاعدة البيانات لتتبع السلوك
      await storage.updateUserBehavior(userId, {
        lastInteraction: new Date(),
        [`${type}Count`]: { $inc: 1 }
      });
      
      // إذا كانت الرسالة من المستخدم، نستخرج الكلمات المفتاحية للتعلم
      if (type === 'user_message') {
        const { keywords, carNames } = this.extractKeywords(message);
        
        // تحديث بيانات سلوك المستخدم مع الكلمات المفتاحية
        if (keywords.length > 0 || carNames.length > 0) {
          const updateData: any = {};
          
          keywords.forEach(keyword => {
            updateData[`keywordInterests.${keyword}`] = { $inc: 1 };
          });
          
          carNames.forEach(carName => {
            updateData[`carInterests.${carName}`] = { $inc: 1 };
          });
          
          await storage.updateUserBehavior(userId, updateData);
        }
      }
    } catch (error) {
      console.error('خطأ في تسجيل تفاعل المستخدم:', error);
    }
  }
  
  /**
   * حفظ التفاعل لنظام التعلم
   */
  private async saveInteractionForLearning(
    userId: number,
    input: string,
    output: string,
    metadata: any
  ): Promise<void> {
    try {
      // حفظ التفاعل في قاعدة البيانات للتعلم المستقبلي
      await storage.logAIAnalytics({
        type: 'chat_interaction',
        userId,
        input,
        output,
        metadata,
        timestamp: new Date()
      });
    } catch (error) {
      console.error('خطأ في حفظ التفاعل للتعلم:', error);
    }
  }
  
  /**
   * استخراج الكلمات المفتاحية من النص
   */
  private extractKeywords(text: string): { keywords: string[], carNames: string[] } {
    const keywords: string[] = [];
    const carNames: string[] = [];
    
    // قائمة بالماركات الشائعة
    const commonBrands = [
      'تويوتا', 'هوندا', 'نيسان', 'مرسيدس', 'بي إم دبليو', 'أودي', 'لكزس',
      'هيونداي', 'كيا', 'مازدا', 'فورد', 'شيفروليه', 'جيب', 'لاند روفر',
      'فولكس واجن', 'بورش', 'سوبارو', 'ميتسوبيشي', 'رينو', 'بيجو'
    ];
    
    // قائمة بالكلمات المفتاحية المتعلقة بالسيارات
    const carKeywords = [
      'سيارة', 'سيارات', 'موديل', 'محرك', 'إطارات', 'بنزين', 'ديزل', 'فرامل',
      'ناقل الحركة', 'أوتوماتيك', 'مانيوال', 'عداد', 'كيلومتر', 'استهلاك',
      'وقود', 'زيت', 'بطارية', 'صيانة', 'عطل', 'مشكلة', 'رخصة', 'تأمين',
      'ضمان', 'قطع غيار', 'سرعة', 'دفع رباعي', 'سيدان', 'هاتشباك', 'SUV'
    ];
    
    // التحقق من وجود أسماء ماركات
    for (const brand of commonBrands) {
      if (text.indexOf(brand) !== -1) {
        carNames.push(brand);
      }
    }
    
    // التحقق من وجود كلمات مفتاحية متعلقة بالسيارات
    for (const keyword of carKeywords) {
      if (text.indexOf(keyword) !== -1) {
        keywords.push(keyword);
      }
    }
    
    return { keywords, carNames };
  }
}

// إنشاء نسخة من خدمة المحادثة
export const carChatService = new CarChatService();