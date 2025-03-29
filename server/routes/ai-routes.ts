import { Router } from 'express';
import analyzeImageRouter from './ai/analyze-image';
import recommendationsRouter from './ai/recommendations';
import marketInsightsRouter from './ai/market-insights';
import carComparisonRouter from './ai/car-comparison';
import advancedSearchRouter from './ai/advanced-search-routes';
import chatRouter from './ai/chat-router';

const router = Router();

/**
 * تجميع كل مسارات واجهة برمجة التطبيقات المتعلقة بالذكاء الاصطناعي
 */

// مسار تحليل صور السيارات
router.use('/analyze-image', analyzeImageRouter);

// مسار الدردشة الذكية
router.use('/chat', chatRouter);

// مسار التوصيات المخصصة
router.use('/recommendations', recommendationsRouter);

// مسار تحليلات السوق
router.use('/market-insights', marketInsightsRouter);

// مسار مقارنة السيارات
router.use('/car-comparison', carComparisonRouter);

// مسار البحث المتقدم وتقييم السيارات
router.use('/', advancedSearchRouter);

export default router;