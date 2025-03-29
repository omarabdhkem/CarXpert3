import { Express } from 'express';
import { createServer, type Server } from 'http';
import aiRoutes from './routes/ai-routes';
import { setupChatRoutes } from './routes/chat-routes';
import dealershipsRoutes from './routes/dealerships-routes';
import serviceCentersRoutes from './routes/service-centers-routes';
import selfImprovementRoutes from './routes/self-improvement-routes';
import { voiceSearchRouter } from './routes/voice-search-routes';
import { carConfiguratorRouter } from './routes/car-configurator-routes';
import { storage } from './storage';
import { eq } from 'drizzle-orm';
import { cars, users, favorites } from '@shared/schema';

export function registerRoutes(app: Express): Server {
  // تم إعداد المصادقة بالفعل في ملف index.ts

  // مسارات الذكاء الاصطناعي
  app.use('/api/ai', aiRoutes);
  
  // مسارات الشات
  setupChatRoutes(app);

  // مسارات المعارض
  app.use('/api/dealerships', dealershipsRoutes);

  // مسارات مراكز الصيانة
  app.use('/api/service-centers', serviceCentersRoutes);
  
  // مسارات نظام التحسين الذاتي
  app.use('/api/self-improvement', selfImprovementRoutes);
  
  // مسارات البحث الصوتي
  app.use('/api/voice-search', voiceSearchRouter);
  
  // مسارات مُكوِّن السيارات التفاعلي
  app.use('/api/car-configurator', carConfiguratorRouter);

  // مسارات السيارات
  // الحصول على جميع السيارات
  app.get('/api/cars', async (req, res) => {
    try {
      const allCars = await storage.getCars();
      res.json(allCars);
    } catch (error: any) {
      console.error('Error fetching cars:', error);
      res.status(500).json({ error: error.message || 'فشل في جلب السيارات' });
    }
  });

  // الحصول على سيارة محددة
  app.get('/api/cars/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        return res.status(400).json({ error: 'معرف السيارة غير صالح' });
      }
      
      const car = await storage.getCar(id);
      
      if (!car) {
        return res.status(404).json({ error: 'السيارة غير موجودة' });
      }
      
      res.json(car);
    } catch (error: any) {
      console.error('Error fetching car:', error);
      res.status(500).json({ error: error.message || 'فشل في جلب السيارة' });
    }
  });

  // إنشاء سيارة جديدة
  app.post('/api/cars', async (req, res) => {
    try {
      const carData = req.body;
      const userId = (req.user as any)?.id;
      
      if (userId) {
        carData.userId = userId;
      }
      
      const newCar = await storage.createCar(carData);
      res.status(201).json(newCar);
    } catch (error: any) {
      console.error('Error creating car:', error);
      res.status(500).json({ error: error.message || 'فشل في إنشاء السيارة' });
    }
  });

  // تحديث سيارة
  app.put('/api/cars/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        return res.status(400).json({ error: 'معرف السيارة غير صالح' });
      }
      
      const carData = req.body;
      const userId = (req.user as any)?.id;
      
      // تحقق من ملكية السيارة (اختياري)
      if (userId) {
        const car = await storage.getCar(id);
        if (car && car.userId !== userId) {
          return res.status(403).json({ error: 'ليس لديك إذن لتحديث هذه السيارة' });
        }
      }
      
      const updatedCar = await storage.updateCar(id, carData);
      
      if (!updatedCar) {
        return res.status(404).json({ error: 'السيارة غير موجودة' });
      }
      
      res.json(updatedCar);
    } catch (error: any) {
      console.error('Error updating car:', error);
      res.status(500).json({ error: error.message || 'فشل في تحديث السيارة' });
    }
  });

  // حذف سيارة
  app.delete('/api/cars/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        return res.status(400).json({ error: 'معرف السيارة غير صالح' });
      }
      
      const userId = (req.user as any)?.id;
      
      // تحقق من ملكية السيارة (اختياري)
      if (userId) {
        const car = await storage.getCar(id);
        if (car && car.userId !== userId) {
          return res.status(403).json({ error: 'ليس لديك إذن لحذف هذه السيارة' });
        }
      }
      
      await storage.deleteCar(id);
      res.status(204).send();
    } catch (error: any) {
      console.error('Error deleting car:', error);
      res.status(500).json({ error: error.message || 'فشل في حذف السيارة' });
    }
  });

  // مسارات المفضلة
  // الحصول على مفضلات المستخدم
  app.get('/api/favorites', async (req, res) => {
    try {
      const userId = (req.user as any)?.id;
      
      if (!userId) {
        return res.status(401).json({ error: 'يجب تسجيل الدخول للوصول إلى المفضلات' });
      }
      
      const favorites = await storage.getFavorites(userId);
      res.json(favorites);
    } catch (error: any) {
      console.error('Error fetching favorites:', error);
      res.status(500).json({ error: error.message || 'فشل في جلب المفضلات' });
    }
  });

  // إضافة سيارة إلى المفضلة
  app.post('/api/favorites', async (req, res) => {
    try {
      const { carId } = req.body;
      const userId = (req.user as any)?.id;
      
      if (!userId) {
        return res.status(401).json({ error: 'يجب تسجيل الدخول لإضافة سيارة إلى المفضلة' });
      }
      
      if (!carId) {
        return res.status(400).json({ error: 'يجب توفير معرف السيارة' });
      }
      
      const favorite = await storage.addFavorite({ userId, carId });
      res.status(201).json(favorite);
    } catch (error: any) {
      console.error('Error adding favorite:', error);
      res.status(500).json({ error: error.message || 'فشل في إضافة السيارة إلى المفضلة' });
    }
  });

  // إزالة سيارة من المفضلة
  app.delete('/api/favorites/:carId', async (req, res) => {
    try {
      const carId = parseInt(req.params.carId);
      const userId = (req.user as any)?.id;
      
      if (!userId) {
        return res.status(401).json({ error: 'يجب تسجيل الدخول لإزالة سيارة من المفضلة' });
      }
      
      if (isNaN(carId)) {
        return res.status(400).json({ error: 'معرف السيارة غير صالح' });
      }
      
      await storage.removeFavorite(userId, carId);
      res.status(204).send();
    } catch (error: any) {
      console.error('Error removing favorite:', error);
      res.status(500).json({ error: error.message || 'فشل في إزالة السيارة من المفضلة' });
    }
  });

  // إنشاء خادم HTTP
  const httpServer = createServer(app);

  return httpServer;
}