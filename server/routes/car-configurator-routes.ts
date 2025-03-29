import { Router, Request, Response } from 'express';
import { db } from '../db';
import { carCategories, carModels, configOptions, carConfigurations } from '@shared/schema';
import { eq, and, inArray } from 'drizzle-orm';

export const carConfiguratorRouter = Router();

// الحصول على جميع فئات السيارات
carConfiguratorRouter.get('/categories', async (req: Request, res: Response) => {
  try {
    const categories = await db.select().from(carCategories);
    res.json(categories);
  } catch (error: any) {
    console.error('خطأ في الحصول على فئات السيارات:', error);
    res.status(500).json({ error: error.message || 'فشل في الحصول على فئات السيارات' });
  }
});

// الحصول على موديلات السيارات حسب الفئة
carConfiguratorRouter.get('/models', async (req: Request, res: Response) => {
  try {
    const { categoryId } = req.query;
    
    let models;
    if (categoryId && !isNaN(Number(categoryId))) {
      models = await db.select().from(carModels).where(eq(carModels.categoryId, Number(categoryId)));
    } else {
      models = await db.select().from(carModels);
    }
    
    res.json(models);
  } catch (error: any) {
    console.error('خطأ في الحصول على موديلات السيارات:', error);
    res.status(500).json({ error: error.message || 'فشل في الحصول على موديلات السيارات' });
  }
});

// الحصول على موديل سيارة محدد
carConfiguratorRouter.get('/models/:id', async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    
    if (isNaN(id)) {
      return res.status(400).json({ error: 'معرف الموديل غير صالح' });
    }
    
    const [model] = await db.select().from(carModels).where(eq(carModels.id, id));
    
    if (!model) {
      return res.status(404).json({ error: 'الموديل غير موجود' });
    }
    
    res.json(model);
  } catch (error: any) {
    console.error('خطأ في الحصول على موديل السيارة:', error);
    res.status(500).json({ error: error.message || 'فشل في الحصول على موديل السيارة' });
  }
});

// الحصول على خيارات التكوين المتاحة لموديل محدد
carConfiguratorRouter.get('/options/:modelId', async (req: Request, res: Response) => {
  try {
    const modelId = parseInt(req.params.modelId);
    
    if (isNaN(modelId)) {
      return res.status(400).json({ error: 'معرف الموديل غير صالح' });
    }
    
    // نحصل على الخيارات المتاحة للموديل المحدد
    const options = await db.select().from(configOptions).where(
      inArray(modelId, configOptions.availableForModels)
    );
    
    // تجميع الخيارات حسب الفئة
    const groupedOptions = options.reduce((acc: Record<string, any[]>, option) => {
      if (!acc[option.category]) {
        acc[option.category] = [];
      }
      acc[option.category].push(option);
      return acc;
    }, {});
    
    res.json(groupedOptions);
  } catch (error: any) {
    console.error('خطأ في الحصول على خيارات التكوين:', error);
    res.status(500).json({ error: error.message || 'فشل في الحصول على خيارات التكوين' });
  }
});

// حساب سعر تكوين السيارة
carConfiguratorRouter.post('/calculate-price', async (req: Request, res: Response) => {
  try {
    const { modelId, selectedOptions } = req.body;
    
    if (!modelId || !Array.isArray(selectedOptions)) {
      return res.status(400).json({ error: 'بيانات غير صالحة' });
    }
    
    // الحصول على الموديل الأساسي
    const [model] = await db.select().from(carModels).where(eq(carModels.id, modelId));
    
    if (!model) {
      return res.status(404).json({ error: 'الموديل غير موجود' });
    }
    
    // الحصول على الخيارات المحددة
    const options = await db.select()
      .from(configOptions)
      .where(inArray(configOptions.id, selectedOptions));
    
    // حساب السعر الإجمالي
    const optionsTotal = options.reduce((sum, option) => sum + option.price, 0);
    const totalPrice = model.basePrice + optionsTotal;
    
    res.json({
      basePrice: model.basePrice,
      optionsPrice: optionsTotal,
      totalPrice,
      options: options
    });
  } catch (error: any) {
    console.error('خطأ في حساب السعر:', error);
    res.status(500).json({ error: error.message || 'فشل في حساب السعر' });
  }
});

// حفظ تكوين السيارة
carConfiguratorRouter.post('/save-configuration', async (req: Request, res: Response) => {
  try {
    const { carModelId, name, options, totalPrice, isPublic } = req.body;
    const userId = req.user ? (req.user as any).id : null;
    
    if (!carModelId || !Array.isArray(options) || !totalPrice) {
      return res.status(400).json({ error: 'بيانات غير صالحة' });
    }
    
    // إنشاء تكوين جديد
    const [configuration] = await db.insert(carConfigurations)
      .values({
        carModelId,
        userId,
        name: name || 'تكوين بدون اسم',
        options: options,
        totalPrice,
        isPublic: isPublic || false,
        isPurchased: false
      })
      .returning();
    
    res.status(201).json(configuration);
  } catch (error: any) {
    console.error('خطأ في حفظ التكوين:', error);
    res.status(500).json({ error: error.message || 'فشل في حفظ التكوين' });
  }
});

// الحصول على تكوينات المستخدم
carConfiguratorRouter.get('/my-configurations', async (req: Request, res: Response) => {
  try {
    const userId = req.user ? (req.user as any).id : null;
    
    if (!userId) {
      return res.status(401).json({ error: 'يجب تسجيل الدخول للوصول إلى التكوينات الخاصة بك' });
    }
    
    const configurations = await db.select({
      configuration: carConfigurations,
      model: carModels
    })
    .from(carConfigurations)
    .innerJoin(carModels, eq(carConfigurations.carModelId, carModels.id))
    .where(eq(carConfigurations.userId, userId));
    
    res.json(configurations);
  } catch (error: any) {
    console.error('خطأ في الحصول على التكوينات:', error);
    res.status(500).json({ error: error.message || 'فشل في الحصول على التكوينات' });
  }
});

// الحصول على تكوين محدد
carConfiguratorRouter.get('/configurations/:id', async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const userId = req.user ? (req.user as any).id : null;
    
    if (isNaN(id)) {
      return res.status(400).json({ error: 'معرف التكوين غير صالح' });
    }
    
    const [config] = await db.select({
      configuration: carConfigurations,
      model: carModels
    })
    .from(carConfigurations)
    .innerJoin(carModels, eq(carConfigurations.carModelId, carModels.id))
    .where(eq(carConfigurations.id, id));
    
    if (!config) {
      return res.status(404).json({ error: 'التكوين غير موجود' });
    }
    
    // التحقق من الوصول - يمكن للمستخدم الوصول إلى تكويناته الخاصة أو التكوينات العامة
    if (!config.configuration.isPublic && config.configuration.userId !== userId) {
      return res.status(403).json({ error: 'ليس لديك إذن للوصول إلى هذا التكوين' });
    }
    
    // الحصول على الخيارات المضمنة في التكوين
    const optionIds = config.configuration.options as number[];
    const options = await db.select()
      .from(configOptions)
      .where(inArray(configOptions.id, optionIds));
    
    res.json({
      ...config,
      options
    });
  } catch (error: any) {
    console.error('خطأ في الحصول على التكوين:', error);
    res.status(500).json({ error: error.message || 'فشل في الحصول على التكوين' });
  }
});

// الحصول على التكوينات العامة
carConfiguratorRouter.get('/public-configurations', async (req: Request, res: Response) => {
  try {
    const configurations = await db.select({
      configuration: carConfigurations,
      model: carModels
    })
    .from(carConfigurations)
    .innerJoin(carModels, eq(carConfigurations.carModelId, carModels.id))
    .where(eq(carConfigurations.isPublic, true));
    
    res.json(configurations);
  } catch (error: any) {
    console.error('خطأ في الحصول على التكوينات العامة:', error);
    res.status(500).json({ error: error.message || 'فشل في الحصول على التكوينات العامة' });
  }
});