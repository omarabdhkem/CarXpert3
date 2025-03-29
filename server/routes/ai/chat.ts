import { Request, Response } from 'express';
import { AIRequest, AIResponse, callExternalAI } from '../../ai/external-api';
import { getAIConfig } from '../../ai/config';
import { storage } from '../../storage';

/**
 * معالج المحادثة الذكية المختص بالسيارات
 * يسمح للمستخدمين بالتفاعل مع نماذج الذكاء الاصطناعي للحصول على معلومات ونصائح حول السيارات
 */
export async function carChatHandler(req: Request, res: Response) {
  try {
    const { message, context = [], userId } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'يجب توفير نص الرسالة' });
    }

    // بناء سياق المحادثة
    const conversationContext = buildConversationContext(context);

    // إعداد نظام التوجيه للنموذج
    const systemPrompt = `أنت خبير سيارات محترف باللغة العربية يدعى "خبير السيارات".
    مهمتك تقديم معلومات دقيقة وموثوقة عن السيارات وصيانتها وشرائها.
    استجب باللغة العربية دائماً وبأسلوب ودي ومفيد.
    قدم معلومات تفصيلية واشرح المصطلحات التقنية بطريقة مبسطة.
    اذكر مصدر معلوماتك عندما يكون ذلك ممكناً. 
    عند عدم معرفة الإجابة، أعترف بذلك بوضوح وقدم اقتراحات بديلة أو نصائح عامة.

    معلومات إضافية:
    - يمكنك تقديم نصائح حول صيانة السيارات، وشراء سيارات جديدة أو مستعملة.
    - يمكنك تقديم معلومات عن أسعار السيارات في الشرق الأوسط على وجه الخصوص.
    - يمكنك مقارنة الموديلات والإصدارات المختلفة من السيارات.
    - يمكنك تقديم نصائح حول قطع الغيار وبدائلها.
    - يجب أن تكون استجاباتك مركزة ومفيدة وغير طويلة بشكل مفرط.`;

    // إعداد طلب واجهة برمجة التطبيقات
    const aiRequest: AIRequest = {
      prompt: message,
      systemPrompt,
      maxTokens: 1000,
      temperature: 0.7,
    };

    // الحصول على الإجابة من واجهة برمجة التطبيقات الخارجية
    const aiResponse: AIResponse = await callExternalAI(aiRequest);

    // تخزين معلومات التفاعل في قاعدة البيانات للتحليلات والتحسين المستمر إذا كان هناك معرف مستخدم
    if (userId) {
      await logUserInteraction(userId, message, 'chat');
    }

    // إرسال الرد
    res.json({
      text: aiResponse.text,
      metadata: aiResponse.metadata
    });
  } catch (error) {
    console.error('خطأ في معالجة المحادثة:', error);
    res.status(500).json({
      error: 'حدث خطأ أثناء معالجة طلب المحادثة'
    });
  }
}

/**
 * بناء سياق المحادثة من تاريخ المحادثة
 */
function buildConversationContext(context: string[]): string {
  if (!context || context.length === 0) {
    return '';
  }

  // تنسيق المحادثة بتنسيق يفهمه النموذج (المستخدم: ... / الخبير: ...)
  let formattedContext = 'سياق المحادثة السابق:\n';
  for (let i = 0; i < context.length; i += 2) {
    const userMessage = context[i];
    const aiResponse = context[i + 1];

    if (userMessage) {
      formattedContext += `المستخدم: ${userMessage}\n`;
    }
    
    if (aiResponse) {
      formattedContext += `الخبير: ${aiResponse}\n`;
    }
  }

  return formattedContext;
}

/**
 * تسجيل تفاعل المستخدم للتحليلات وتحسين النظام
 */
async function logUserInteraction(userId: number, message: string, type: string): Promise<void> {
  try {
    await storage.logAIAnalytics({
      userId,
      type,
      input: message,
      timestamp: new Date()
    });
  } catch (error) {
    console.error('خطأ في تسجيل تفاعل المستخدم:', error);
  }
}