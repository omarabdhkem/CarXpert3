import { Express, Request, Response } from 'express';
import { carChatService } from '../ai/chat-service';
import { User } from '@shared/schema';

declare global {
  namespace Express {
    interface Request {
      user?: User;
    }
  }
}

export function setupChatRoutes(app: Express) {
  // مسار للدردشة مع الذكاء الاصطناعي
  app.post('/api/ai/chat', async (req: Request, res: Response) => {
    try {
      const { message } = req.body;
      const userId = req.user?.id || req.body.userId;

      if (!message) {
        return res.status(400).json({ error: 'يرجى توفير رسالة' });
      }

      const response = await carChatService.processChat({
        message,
        userId,
        context: req.body.context,
      });

      return res.status(200).json(response);
    } catch (error: any) {
      console.error('Error in chat route:', error);
      return res.status(500).json({
        error: 'حدث خطأ أثناء معالجة طلب الدردشة',
        details: error.message,
      });
    }
  });

  // مسار للحصول على تاريخ الدردشة (للمستخدمين المسجلين)
  app.get('/api/ai/chat/history', async (req: Request, res: Response) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'يجب تسجيل الدخول للوصول إلى تاريخ الدردشة' });
      }

      // يمكن تنفيذ هذا لاحقًا عند إضافة وظيفة حفظ المحادثات
      return res.status(200).json({ history: [] });
    } catch (error: any) {
      console.error('Error fetching chat history:', error);
      return res.status(500).json({
        error: 'حدث خطأ أثناء جلب تاريخ الدردشة',
        details: error.message,
      });
    }
  });
}