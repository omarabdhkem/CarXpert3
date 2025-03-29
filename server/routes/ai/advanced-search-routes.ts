import { Router } from 'express';
import { storage } from '../../storage';
import { callExternalAI, AIRequest, AIResponse } from '../../ai/external-api';
import { isAuthenticated } from '../../middleware/auth';

const router = Router();

// استرجاع السيارات بناءً على معايير البحث المتقدمة
router.post('/advanced-search', async (req, res) => {
  try {
    const { 
      keywords, 
      priceRange, 
      brands, 
      categories, 
      years, 
      features,
      naturalLanguageQuery,
      personalityTraits = [] 
    } = req.body;

    // 1. البحث الأساسي عن السيارات بناءً على المعايير
    let cars = await storage.getCars();

    // 2. تطبيق الفلترة الأساسية
    if (priceRange) {
      const [min, max] = priceRange;
      cars = cars.filter(car => car.price >= min && car.price <= max);
    }

    if (brands && brands.length) {
      cars = cars.filter(car => brands.includes(car.brand));
    }

    if (categories && categories.length) {
      cars = cars.filter(car => categories.includes(car.category));
    }

    if (years && years.length) {
      cars = cars.filter(car => years.includes(car.year));
    }

    // 3. إذا كان هناك استعلام بلغة طبيعية أو سمات شخصية، استخدم الذكاء الاصطناعي للترتيب
    if (naturalLanguageQuery || personalityTraits.length > 0) {
      const prompt = constructAIPrompt(naturalLanguageQuery, personalityTraits, cars);
      
      const aiRequest: AIRequest = {
        prompt,
        systemPrompt: 'أنت محلل متخصص في السيارات ومساعد في اختيار السيارات المناسبة. مهمتك هي تقييم السيارات بناءً على معايير البحث والخصائص الشخصية والاحتياجات المحددة. قم بترتيب السيارات من الأفضل إلى الأقل ملاءمة بناءً على المعلومات المقدمة.',
        maxTokens: 1000,
      };

      try {
        const aiResponse = await callExternalAI(aiRequest);
        // تحليل رد الذكاء الاصطناعي لترتيب السيارات
        const rankedCarIds = parseAIResponse(aiResponse.text);
        
        // إعادة ترتيب السيارات بناءً على الترتيب من الذكاء الاصطناعي
        const aiRankedCars: any[] = [];
        rankedCarIds.forEach(id => {
          const car = cars.find(c => c.id === id);
          if (car) aiRankedCars.push(car);
        });
        
        // إضافة السيارات المتبقية التي لم يرتبها الذكاء الاصطناعي
        const remainingCars = cars.filter(car => !rankedCarIds.includes(car.id));
        cars = [...aiRankedCars, ...remainingCars];
      } catch (error) {
        console.error('فشل في استخدام الذكاء الاصطناعي للترتيب:', error);
        // استمر مع النتائج العادية إذا فشل الذكاء الاصطناعي
      }
    }

    // 4. حفظ البحث في تاريخ المستخدم إذا كان مسجل الدخول
    if (req.isAuthenticated() && req.user) {
      await storage.saveSearchHistory(req.user.id, 
        JSON.stringify({
          keywords,
          priceRange,
          brands,
          categories,
          years,
          features,
          naturalLanguageQuery,
          personalityTraits
        })
      );
    }

    // 5. إرجاع النتائج
    res.json({
      results: cars,
      count: cars.length,
      searchMetadata: {
        aiEnhanced: !!(naturalLanguageQuery || personalityTraits.length > 0),
        timestamp: new Date()
      }
    });
  } catch (error) {
    console.error('خطأ في البحث المتقدم:', error);
    res.status(500).json({ error: 'حدث خطأ أثناء معالجة طلب البحث المتقدم' });
  }
});

// تقييم السيارة في الوقت الحقيقي
router.post('/evaluate-car', isAuthenticated, async (req, res) => {
  try {
    const { carId, userComments } = req.body;
    
    // الحصول على بيانات السيارة
    const car = await storage.getCar(carId);
    if (!car) {
      return res.status(404).json({ error: 'السيارة غير موجودة' });
    }
    
    // بناء الطلب للذكاء الاصطناعي
    const prompt = `
قم بتقييم السيارة التالية بناءً على مواصفاتها وتعليقات المستخدم:

معلومات السيارة:
- الماركة: ${car.brand}
- الموديل: ${car.model}
- السنة: ${car.year}
- السعر: ${car.price}
- الفئة: ${car.category}
- المواصفات: ${car.features?.join(', ') || 'غير محدد'}

تعليقات المستخدم: "${userComments}"

الرجاء تقديم:
1. تقييم عام من 10 نقاط
2. نقاط القوة (3 نقاط)
3. نقاط الضعف (3 نقاط)
4. ملاءمتها للاستخدام اليومي
5. القيمة مقابل السعر
6. رمز إيموجي مناسب يعبر عن التقييم العام
7. توصية عامة (في جملة واحدة)

قدم الإجابة بتنسيق JSON بالشكل التالي:
{
  "rating": 8.5,
  "strengths": ["نقطة1", "نقطة2", "نقطة3"],
  "weaknesses": ["نقطة1", "نقطة2", "نقطة3"],
  "dailyUsability": "نص وصفي",
  "valueForMoney": "نص وصفي",
  "emoji": "🚗",
  "recommendation": "نص توصية"
}
`;

    const aiRequest: AIRequest = {
      prompt,
      systemPrompt: 'أنت خبير في تقييم السيارات. مهمتك تقديم تقييم موضوعي ودقيق للسيارات بناءً على المواصفات وتعليقات المستخدم.',
    };

    const aiResponse = await callExternalAI(aiRequest);
    
    // تحليل استجابة الذكاء الاصطناعي
    try {
      const evaluationData = JSON.parse(aiResponse.text);
      
      // حفظ التقييم في قاعدة البيانات
      await storage.logAIAnalytics({
        type: 'car-evaluation',
        userId: req.user.id,
        carId: car.id,
        evaluation: evaluationData,
        userComments,
        timestamp: new Date()
      });
      
      res.json({
        car,
        evaluation: evaluationData
      });
    } catch (error) {
      console.error('خطأ في تحليل استجابة الذكاء الاصطناعي:', error);
      res.status(500).json({ 
        error: 'حدث خطأ أثناء تحليل استجابة الذكاء الاصطناعي',
        rawResponse: aiResponse.text 
      });
    }
  } catch (error) {
    console.error('خطأ في تقييم السيارة:', error);
    res.status(500).json({ error: 'حدث خطأ أثناء معالجة طلب تقييم السيارة' });
  }
});

// دالة لبناء استعلام الذكاء الاصطناعي
function constructAIPrompt(naturalLanguageQuery: string, personalityTraits: string[], cars: any[]): string {
  // إعداد وصف السيارات
  const carsDescription = cars.map(car => {
    return `
السيارة رقم ${car.id}:
- الماركة: ${car.brand}
- الموديل: ${car.model}
- السنة: ${car.year}
- السعر: ${car.price}
- الفئة: ${car.category}
- المواصفات: ${car.features?.join(', ') || 'غير محدد'}
`;
  }).join('\n');

  // وصف الشخصية والمتطلبات
  let personalityDescription = '';
  if (personalityTraits.length > 0) {
    personalityDescription = `
سمات الشخصية للمستخدم:
${personalityTraits.map(trait => `- ${trait}`).join('\n')}
`;
  }

  // استعلام اللغة الطبيعية
  let queryDescription = '';
  if (naturalLanguageQuery) {
    queryDescription = `
استعلام المستخدم: "${naturalLanguageQuery}"
`;
  }

  // بناء الاستعلام الكامل
  return `
بناءً على قائمة السيارات التالية، وسمات شخصية المستخدم، واستعلامه، قم بترتيب السيارات من الأكثر ملاءمة إلى الأقل ملاءمة.

${personalityDescription}
${queryDescription}

قائمة السيارات:
${carsDescription}

الرجاء ترتيب السيارات بإعطاء قائمة من معرفات السيارات فقط مفصولة بفواصل، مثلاً: "5,2,7,1,3,6,4"
حيث الرقم الأول هو الأفضل والأخير هو الأقل ملاءمة.
`;
}

// دالة لتحليل استجابة الذكاء الاصطناعي
function parseAIResponse(response: string): number[] {
  try {
    // تنظيف الاستجابة
    const cleanedResponse = response.trim();
    
    // محاولة استخراج قائمة الأرقام
    let idsMatch = cleanedResponse.match(/(\d+,\s*)*\d+/);
    
    if (idsMatch) {
      // تحويل السلسلة إلى مصفوفة أرقام
      return idsMatch[0].split(',').map(id => parseInt(id.trim()));
    } else {
      // إذا لم يتم العثور على تنسيق مناسب، حاول العثور على أي أرقام في النص
      const allNumbers = cleanedResponse.match(/\d+/g);
      if (allNumbers) {
        return allNumbers.map(num => parseInt(num));
      }
    }
    
    return [];
  } catch (error) {
    console.error('خطأ في تحليل استجابة الذكاء الاصطناعي:', error);
    return [];
  }
}

export default router;