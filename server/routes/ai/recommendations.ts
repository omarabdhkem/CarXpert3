import { Router, Request, Response } from 'express';
import { aiServices } from '../../ai';
import { storage } from '../../storage';

const router = Router();

/**
 * مسار API للحصول على توصيات السيارات المخصصة
 * إذا كان المستخدم مسجل دخول، سيتم تقديم توصيات مخصصة بناءً على سلوكه وتفضيلاته
 * وإلا، ستعرض توصيات عامة بناءً على اتجاهات السوق
 */
router.get('/recommendations', async (req: Request, res: Response) => {
  try {
    const userId = req.query.userId ? parseInt(req.query.userId as string) : undefined;
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 12;

    // التحقق مما إذا كان هناك مستخدم معين
    if (userId) {
      // التحقق من وجود هذا المستخدم
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ error: 'المستخدم غير موجود' });
      }

      // الحصول على التوصيات المخصصة للمستخدم
      const recommendations = await aiServices.getPersonalizedRecommendations(userId, limit);
      return res.json(recommendations);
    }

    // إذا لم يكن هناك مستخدم، إرجاع توصيات عامة
    const defaultRecommendations = await aiServices.getDefaultRecommendations(limit);
    res.json(defaultRecommendations);
  } catch (error) {
    console.error('Error fetching recommendations:', error);
    res.status(500).json({ error: 'حدث خطأ أثناء جلب التوصيات' });
  }
});

/**
 * مسار لتسجيل تفاعل المستخدم مع التوصيات (إعجاب/عدم إعجاب)
 * يساعد في تحسين التوصيات المستقبلية
 */
router.post('/recommendations/feedback', async (req: Request, res: Response) => {
  try {
    const { userId, carId, isPositive } = req.body;

    if (!userId || !carId) {
      return res.status(400).json({ error: 'معرف المستخدم ومعرف السيارة مطلوبان' });
    }

    // تسجيل تفاعل المستخدم
    await storage.logUserEvent(userId, 'recommendation_feedback', {
      carId,
      isPositive,
      timestamp: new Date().toISOString(),
    });

    // تحديث سلوك المستخدم لتحسين التوصيات المستقبلية
    const userBehavior = await storage.getUserBehavior(userId);
    
    if (userBehavior) {
      // تحديث تفضيلات المستخدم بناءً على التفاعل
      if (!userBehavior.preferences) {
        userBehavior.preferences = {};
      }
      
      // الحصول على تفاصيل السيارة
      const car = await storage.getCar(carId);
      
      if (car) {
        // تحديث تفضيلات الماركة
        if (!userBehavior.preferences.makes) {
          userBehavior.preferences.makes = {};
        }
        if (!userBehavior.preferences.makes[car.make]) {
          userBehavior.preferences.makes[car.make] = 0;
        }
        userBehavior.preferences.makes[car.make] += isPositive ? 1 : -1;
        
        // تحديث تفضيلات نوع الهيكل
        if (car.bodyType) {
          if (!userBehavior.preferences.bodyTypes) {
            userBehavior.preferences.bodyTypes = {};
          }
          if (!userBehavior.preferences.bodyTypes[car.bodyType]) {
            userBehavior.preferences.bodyTypes[car.bodyType] = 0;
          }
          userBehavior.preferences.bodyTypes[car.bodyType] += isPositive ? 1 : -1;
        }
        
        // تحديث نطاق السعر المفضل
        if (!userBehavior.preferences.priceRanges) {
          userBehavior.preferences.priceRanges = {};
        }
        
        // تحديد نطاق السعر (كل 50,000)
        const priceRange = Math.floor(car.price / 50000) * 50000;
        const priceRangeKey = `${priceRange}-${priceRange + 50000}`;
        
        if (!userBehavior.preferences.priceRanges[priceRangeKey]) {
          userBehavior.preferences.priceRanges[priceRangeKey] = 0;
        }
        userBehavior.preferences.priceRanges[priceRangeKey] += isPositive ? 1 : -1;
        
        // تحديث تفضيلات السنة
        if (!userBehavior.preferences.years) {
          userBehavior.preferences.years = {};
        }
        
        // تحديد نطاق السنة (كل 5 سنوات)
        const yearRange = Math.floor(car.year / 5) * 5;
        const yearRangeKey = `${yearRange}-${yearRange + 5}`;
        
        if (!userBehavior.preferences.years[yearRangeKey]) {
          userBehavior.preferences.years[yearRangeKey] = 0;
        }
        userBehavior.preferences.years[yearRangeKey] += isPositive ? 1 : -1;
        
        // حفظ التحديثات
        await storage.updateUserBehavior(userId, userBehavior);
      }
    }

    res.json({ success: true, message: 'تم تسجيل تفاعلك بنجاح' });
  } catch (error) {
    console.error('Error saving recommendation feedback:', error);
    res.status(500).json({ error: 'حدث خطأ أثناء حفظ التفاعل' });
  }
});

export default router;