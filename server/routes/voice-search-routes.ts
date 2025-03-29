import { Router, Request, Response } from 'express';
import { voiceSearchService } from '../ai/voice-search';
import { storage } from '../storage';

export const voiceSearchRouter = Router();

// مسار API لتحليل استعلام البحث الصوتي
voiceSearchRouter.post('/analyze-search', async (req: Request, res: Response) => {
  try {
    const { query } = req.body;
    
    if (!query || typeof query !== 'string') {
      return res.status(400).json({ error: 'استعلام البحث مطلوب ويجب أن يكون نصًا' });
    }

    const analysis = await voiceSearchService.analyzeSearchQuery(query);

    // حفظ استعلام البحث إذا كان المستخدم مسجل الدخول
    if (req.isAuthenticated() && req.user) {
      // @ts-ignore - تجاهل خطأ TypeScript هنا، سيتم معالجته عند ضبط أنواع المستخدم
      const userId = req.user.id;
      await voiceSearchService.saveSearchQuery(userId, query, analysis);
    }

    res.json(analysis);
  } catch (error) {
    console.error('خطأ في مسار تحليل البحث:', error);
    res.status(500).json({ error: 'حدث خطأ أثناء تحليل استعلام البحث' });
  }
});

// مسار API للحصول على سجل بحث المستخدم
voiceSearchRouter.get('/search-history', async (req: Request, res: Response) => {
  try {
    if (!req.isAuthenticated() || !req.user) {
      return res.status(401).json({ error: 'غير مصرح' });
    }

    // @ts-ignore - تجاهل خطأ TypeScript هنا، سيتم معالجته عند ضبط أنواع المستخدم
    const userId = req.user.id;
    const searchHistory = await voiceSearchService.getUserSearchHistory(userId);

    res.json(searchHistory);
  } catch (error) {
    console.error('خطأ في مسار سجل البحث:', error);
    res.status(500).json({ error: 'حدث خطأ أثناء الحصول على سجل البحث' });
  }
});