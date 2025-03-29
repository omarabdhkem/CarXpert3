import { Router } from 'express';
import { carChatHandler } from './chat';

const router = Router();

/**
 * مسار واجهة برمجة التطبيقات للدردشة الذكية المتخصصة بالسيارات
 * POST /api/ai/chat
 */
router.post('/', carChatHandler);

export default router;