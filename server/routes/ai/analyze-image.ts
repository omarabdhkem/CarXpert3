import { Router } from 'express';
import { Request, Response } from 'express';
import { callExternalAI, AIResponse } from '../../ai/external-api';
import { getAIConfig } from '../../ai/config';
import { storage } from '../../storage';

const router = Router();

/**
 * معالج تحليل صور السيارات باستخدام الذكاء الاصطناعي
 * هذا المعالج يستقبل صورة ويحللها باستخدام نماذج الذكاء الاصطناعي
 * للتعرف على السيارة ومعلوماتها وتقييم حالتها
 */
export async function analyzeCarImage(req: Request, res: Response) {
  try {
    const { imageBase64, userId } = req.body;

    if (!imageBase64) {
      return res.status(400).json({ error: 'Image data is required' });
    }

    // بناء نص الطلب للذكاء الاصطناعي
    const systemPrompt = `
      أنت معالج صور متخصص في تحليل صور السيارات.
      قم بتحليل صورة السيارة المرفقة وقدم المعلومات التالية:
      1. التعرف على ماركة وموديل السيارة وسنة الصنع
      2. لون السيارة ونوع الهيكل وحالة السيارة الظاهرة
      3. تحديد وتقييم حالة القطع المرئية في الصورة (مثل المصابيح، الصدام، الأبواب، إلخ)
      4. تقييم أي أضرار مرئية في السيارة وأماكنها ومستوى شدتها
      
      قدم المعلومات بتنسيق JSON وفي وصف نصي منفصل. ضع المعلومات التفصيلية في الوصف النصي.
      
      مثال لتنسيق الاستجابة:
      {
        "car": {
          "make": "تويوتا",
          "model": "كامري",
          "year": "2020",
          "color": "أبيض",
          "bodyType": "سيدان",
          "condition": "جيدة"
        },
        "detectedParts": [
          { "name": "المصابيح الأمامية", "condition": "ممتازة", "confidence": 0.95, "boundingBox": {"x": 0.2, "y": 0.3, "width": 0.1, "height": 0.1} },
          { "name": "الصدام الأمامي", "condition": "متوسطة، خدوش طفيفة", "confidence": 0.85, "boundingBox": {"x": 0.3, "y": 0.4, "width": 0.2, "height": 0.1} }
        ],
        "damageAssessment": {
          "hasDamage": true,
          "damageLocations": ["الباب الأيمن الأمامي", "الجناح الأيمن"],
          "severityScore": 3,
          "estimatedRepairCost": 1500
        },
        "confidence": 0.92
      }
      
      ملاحظة: إذا لم تتمكن من رؤية أجزاء معينة من السيارة، لا تذكرها في النتائج.
      إذا كانت الصورة ليست لسيارة، فأشر إلى ذلك في الاستجابة.
    `;

    // استدعاء الذكاء الاصطناعي
    const aiRequest = {
      prompt: 'قم بتحليل هذه الصورة للسيارة وتقديم المعلومات المطلوبة.',
      systemPrompt,
      imageBase64,
      model: getAIConfig().model || 'gpt-4-vision-preview'
    };

    const aiResponse: AIResponse = await callExternalAI(aiRequest);

    // تحليل استجابة الذكاء الاصطناعي
    let result: any = {};
    try {
      // محاولة استخراج JSON من النص
      const jsonMatch = aiResponse.text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        result = JSON.parse(jsonMatch[0]);
      } else {
        // إذا لم يتم العثور على JSON، قم بإنشاء استجابة أساسية
        result = {
          car: {},
          confidence: 0.5,
          fullText: aiResponse.text
        };
      }
    } catch (error) {
      console.error('Error parsing AI response:', error);
      result = {
        car: {},
        confidence: 0.3,
        fullText: aiResponse.text
      };
    }

    // إضافة النص الكامل للتحليل
    result.fullText = aiResponse.text;

    // حفظ التحليل في قاعدة البيانات للتحليلات وتحسين النظام
    try {
      if (userId) {
        await storage.logAIAnalytics({
          userId,
          type: 'image_analysis',
          timestamp: new Date(),
          result: {
            confidence: result.confidence,
            car: result.car,
            hasDamage: result.damageAssessment?.hasDamage
          }
        });
      }
    } catch (logError) {
      console.error('Error logging analytics:', logError);
      // لا نريد أن يفشل الطلب بسبب خطأ في التسجيل
    }

    return res.json(result);
  } catch (error) {
    console.error('Error analyzing car image:', error);
    return res.status(500).json({ error: 'Failed to analyze image' });
  }
}

/**
 * مسار واجهة برمجة التطبيقات لتحليل صور السيارات
 * POST /api/ai/analyze-image
 */
router.post('/', analyzeCarImage);

export default router;