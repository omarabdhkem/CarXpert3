/**
 * ملف التكوين للذكاء الاصطناعي
 * يوفر تكوين وإعدادات لمختلف واجهات AI API
 */

export interface AIConfig {
  provider: 'openai' | 'gemini' | 'huggingface' | 'custom';
  apiKey: string;
  endpoint?: string;
  model?: string;
  maxTokens?: number;
  temperature?: number;
}

export const defaultAIConfig: AIConfig = {
  provider: 'openai',
  apiKey: process.env.AI_API_KEY || '',
  model: 'gpt-3.5-turbo',
  maxTokens: 1000,
  temperature: 0.7
};

let aiConfig: AIConfig = { ...defaultAIConfig };

/**
 * الحصول على التكوين الحالي للذكاء الاصطناعي
 */
export function getAIConfig(): AIConfig {
  // إذا لم يتم تعيين مفتاح API، استخدم المفتاح من المتغيرات البيئية
  if (!aiConfig.apiKey && process.env.AI_API_KEY) {
    aiConfig.apiKey = process.env.AI_API_KEY;
    console.log('تم استخدام مفتاح API من متغيرات البيئة.');
  }
  
  // التحقق من وجود مفتاح API صالح
  if (!aiConfig.apiKey || aiConfig.apiKey.trim() === '') {
    console.warn('تنبيه: مفتاح API للذكاء الاصطناعي غير موجود أو غير صالح!');
    // يمكن إضافة المزيد من المنطق هنا للتعامل مع حالة عدم وجود مفتاح API
  } else {
    // إخفاء جزء من المفتاح للأمان في السجلات
    const maskedKey = aiConfig.apiKey.substring(0, 3) + '...';
    console.log(`مفتاح API متوفر للمزود ${aiConfig.provider}:`, maskedKey);
  }
  
  return { ...aiConfig };
}

/**
 * تحديث تكوين الذكاء الاصطناعي
 * @param config الإعدادات الجديدة للتكوين
 */
export function updateAIConfig(config: Partial<AIConfig>): AIConfig {
  // دمج الإعدادات الجديدة مع الإعدادات الحالية
  aiConfig = {
    ...aiConfig,
    ...config
  };
  
  return { ...aiConfig };
}