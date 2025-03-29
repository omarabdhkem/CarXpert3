import { Router } from 'express';
import { storage } from '../storage';
import { InsertDealership } from '@shared/schema';

const router = Router();

// الحصول على جميع المعارض
router.get('/', async (req, res) => {
  try {
    const dealerships = await storage.getDealerships();
    res.json(dealerships);
  } catch (error: any) {
    console.error('Error fetching dealerships:', error);
    res.status(500).json({ error: error.message || 'فشل في جلب المعارض' });
  }
});

// الحصول على معرض محدد
router.get('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    
    if (isNaN(id)) {
      return res.status(400).json({ error: 'معرف المعرض غير صالح' });
    }
    
    const dealership = await storage.getDealership(id);
    
    if (!dealership) {
      return res.status(404).json({ error: 'المعرض غير موجود' });
    }
    
    res.json(dealership);
  } catch (error: any) {
    console.error('Error fetching dealership:', error);
    res.status(500).json({ error: error.message || 'فشل في جلب المعرض' });
  }
});

// إنشاء معرض جديد
router.post('/', async (req, res) => {
  try {
    const dealershipData = req.body as InsertDealership;
    
    if (!dealershipData.name || !dealershipData.address) {
      return res.status(400).json({ error: 'يجب توفير اسم وعنوان المعرض على الأقل' });
    }
    
    const newDealership = await storage.createDealership(dealershipData);
    res.status(201).json(newDealership);
  } catch (error: any) {
    console.error('Error creating dealership:', error);
    res.status(500).json({ error: error.message || 'فشل في إنشاء المعرض' });
  }
});

// تحديث معرض
router.put('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    
    if (isNaN(id)) {
      return res.status(400).json({ error: 'معرف المعرض غير صالح' });
    }
    
    const dealershipData = req.body;
    const updatedDealership = await storage.updateDealership(id, dealershipData);
    
    if (!updatedDealership) {
      return res.status(404).json({ error: 'المعرض غير موجود' });
    }
    
    res.json(updatedDealership);
  } catch (error: any) {
    console.error('Error updating dealership:', error);
    res.status(500).json({ error: error.message || 'فشل في تحديث المعرض' });
  }
});

// حذف معرض
router.delete('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    
    if (isNaN(id)) {
      return res.status(400).json({ error: 'معرف المعرض غير صالح' });
    }
    
    await storage.deleteDealership(id);
    res.status(204).send();
  } catch (error: any) {
    console.error('Error deleting dealership:', error);
    res.status(500).json({ error: error.message || 'فشل في حذف المعرض' });
  }
});

// البحث عن معارض قريبة
router.get('/nearby', async (req, res) => {
  try {
    const { lat, lng, radius } = req.query;
    
    if (!lat || !lng) {
      return res.status(400).json({ error: 'يجب توفير خطوط الطول والعرض' });
    }
    
    const latitude = parseFloat(lat as string);
    const longitude = parseFloat(lng as string);
    const searchRadius = radius ? parseFloat(radius as string) : 10; // كيلومتر
    
    if (isNaN(latitude) || isNaN(longitude) || isNaN(searchRadius)) {
      return res.status(400).json({ error: 'إحداثيات أو نصف قطر غير صالح' });
    }
    
    // في الواقع، سنحتاج إلى استخدام استعلام جغرافي لقاعدة البيانات
    // هنا نعيد جميع المعارض للتبسيط
    const dealerships = await storage.getDealerships();
    
    // تحديد المسافة لكل معرض (يمكن تنفيذ حساب المسافة الجغرافية هنا)
    const nearbyDealerships = dealerships.filter(dealership => {
      if (!dealership.location) return false;
      
      // تنفيذ فحص مبسط للتقريب
      const dealershipLocation = dealership.location as any;
      return dealershipLocation && dealershipLocation.lat && dealershipLocation.lng;
    });
    
    res.json(nearbyDealerships);
  } catch (error: any) {
    console.error('Error finding nearby dealerships:', error);
    res.status(500).json({ error: error.message || 'فشل في البحث عن معارض قريبة' });
  }
});

// الحصول على سيارات معرض محدد
router.get('/:id/cars', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    
    if (isNaN(id)) {
      return res.status(400).json({ error: 'معرف المعرض غير صالح' });
    }
    
    // في الواقع، سنحتاج إلى استعلام مخصص للحصول على سيارات معرض محدد
    // هنا نستخدم وظيفة جلب جميع السيارات ثم نقوم بالفلترة
    const allCars = await storage.getCars();
    const dealershipCars = allCars.filter(car => car.dealershipId === id);
    
    res.json(dealershipCars);
  } catch (error: any) {
    console.error('Error fetching dealership cars:', error);
    res.status(500).json({ error: error.message || 'فشل في جلب سيارات المعرض' });
  }
});

// الحصول على معارض حسب الماركة
router.get('/by-brand/:brand', async (req, res) => {
  try {
    const { brand } = req.params;
    
    if (!brand) {
      return res.status(400).json({ error: 'يجب توفير اسم الماركة' });
    }
    
    // في الواقع، سنحتاج إلى استعلام مخصص للحصول على المعارض التي لديها سيارات من ماركة محددة
    // هنا نعيد جميع المعارض للتبسيط
    const dealerships = await storage.getDealerships();
    
    res.json(dealerships);
  } catch (error: any) {
    console.error('Error fetching dealerships by brand:', error);
    res.status(500).json({ error: error.message || 'فشل في جلب المعارض حسب الماركة' });
  }
});

export default router;