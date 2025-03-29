import { Router, Request, Response } from 'express';
import { aiServices } from '../../ai';
import { storage } from '../../storage';

const router = Router();

/**
 * مسار API للحصول على تحليلات سوق السيارات
 * يقدم تحليلات وإحصائيات حول سوق السيارات، مثل أكثر الماركات تداولًا
 * واتجاهات الأسعار وتوقعات مستقبلية
 */
router.get('/market-trends', async (req: Request, res: Response) => {
  try {
    const period = (req.query.period as string) || 'monthly';
    
    // التحقق من صحة المعايير
    if (!['weekly', 'monthly', 'quarterly'].includes(period)) {
      return res.status(400).json({ error: 'فترة غير صالحة. الفترات المدعومة: weekly, monthly, quarterly' });
    }

    // محاولة استرداد التحليلات المخزنة مسبقًا
    const cachedTrends = await storage.getMarketTrends(period);
    
    if (cachedTrends) {
      // إذا كانت البيانات المخزنة مسبقًا حديثة (أقل من 24 ساعة)، فاستخدمها
      const cachedTime = new Date(cachedTrends.timestamp).getTime();
      const currentTime = new Date().getTime();
      const hoursDiff = (currentTime - cachedTime) / (1000 * 60 * 60);
      
      if (hoursDiff < 24) {
        return res.json(cachedTrends.data);
      }
    }

    // تحليل اتجاهات السوق
    const marketTrends = await aiServices.analyzeMarketTrends();
    
    // تخزين النتائج للاستخدام المستقبلي
    await storage.createOrUpdateMarketTrends({
      period,
      data: marketTrends,
      timestamp: new Date().toISOString(),
    });

    // تسجيل النشاط
    if (req.user?.id) {
      await storage.logUserEvent(req.user.id, 'viewed_market_trends', {
        period,
        timestamp: new Date().toISOString(),
      });
    }

    res.json(marketTrends);
  } catch (error) {
    console.error('Error analyzing market trends:', error);
    res.status(500).json({ error: 'حدث خطأ أثناء تحليل اتجاهات السوق' });
  }
});

export default router;