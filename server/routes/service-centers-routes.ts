import { Router } from 'express';
import { storage } from '../storage';
import { InsertServiceCenter } from '@shared/schema';

const router = Router();

// الحصول على جميع مراكز الصيانة
router.get('/', async (req, res) => {
  try {
    const serviceCenters = await storage.getServiceCenters();
    res.json(serviceCenters);
  } catch (error: any) {
    console.error('Error fetching service centers:', error);
    res.status(500).json({ error: error.message || 'فشل في جلب مراكز الصيانة' });
  }
});

// الحصول على مركز صيانة محدد
router.get('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    
    if (isNaN(id)) {
      return res.status(400).json({ error: 'معرف مركز الصيانة غير صالح' });
    }
    
    const serviceCenter = await storage.getServiceCenter(id);
    
    if (!serviceCenter) {
      return res.status(404).json({ error: 'مركز الصيانة غير موجود' });
    }
    
    res.json(serviceCenter);
  } catch (error: any) {
    console.error('Error fetching service center:', error);
    res.status(500).json({ error: error.message || 'فشل في جلب مركز الصيانة' });
  }
});

// إنشاء مركز صيانة جديد
router.post('/', async (req, res) => {
  try {
    const serviceCenterData = req.body as InsertServiceCenter;
    
    if (!serviceCenterData.name || !serviceCenterData.address) {
      return res.status(400).json({ error: 'يجب توفير اسم وعنوان مركز الصيانة على الأقل' });
    }
    
    const newServiceCenter = await storage.createServiceCenter(serviceCenterData);
    res.status(201).json(newServiceCenter);
  } catch (error: any) {
    console.error('Error creating service center:', error);
    res.status(500).json({ error: error.message || 'فشل في إنشاء مركز الصيانة' });
  }
});

// تحديث مركز صيانة
router.put('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    
    if (isNaN(id)) {
      return res.status(400).json({ error: 'معرف مركز الصيانة غير صالح' });
    }
    
    const serviceCenterData = req.body;
    const updatedServiceCenter = await storage.updateServiceCenter(id, serviceCenterData);
    
    if (!updatedServiceCenter) {
      return res.status(404).json({ error: 'مركز الصيانة غير موجود' });
    }
    
    res.json(updatedServiceCenter);
  } catch (error: any) {
    console.error('Error updating service center:', error);
    res.status(500).json({ error: error.message || 'فشل في تحديث مركز الصيانة' });
  }
});

// حذف مركز صيانة
router.delete('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    
    if (isNaN(id)) {
      return res.status(400).json({ error: 'معرف مركز الصيانة غير صالح' });
    }
    
    await storage.deleteServiceCenter(id);
    res.status(204).send();
  } catch (error: any) {
    console.error('Error deleting service center:', error);
    res.status(500).json({ error: error.message || 'فشل في حذف مركز الصيانة' });
  }
});

// البحث عن مراكز صيانة حسب التخصص
router.get('/by-specialization/:specialization', async (req, res) => {
  try {
    const { specialization } = req.params;
    
    if (!specialization) {
      return res.status(400).json({ error: 'يجب توفير التخصص' });
    }
    
    // في الواقع، سنحتاج إلى استعلام مخصص للبحث عن التخصصات
    // هنا نعيد جميع مراكز الصيانة للتبسيط
    const serviceCenters = await storage.getServiceCenters();
    
    // فلترة مراكز الصيانة حسب التخصص
    const filteredCenters = serviceCenters.filter(center => {
      if (!center.specializations) return false;
      
      // تحقق من وجود التخصص (على افتراض أن specializations هو مصفوفة)
      const specializations = center.specializations as string[];
      return specializations.some(s => 
        s.toLowerCase().includes(specialization.toLowerCase())
      );
    });
    
    res.json(filteredCenters);
  } catch (error: any) {
    console.error('Error searching service centers by specialization:', error);
    res.status(500).json({ error: error.message || 'فشل في البحث عن مراكز الصيانة' });
  }
});

// البحث عن مراكز صيانة قريبة
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
    // هنا نعيد جميع مراكز الصيانة للتبسيط
    const serviceCenters = await storage.getServiceCenters();
    
    // تحديد المسافة لكل مركز (يمكن تنفيذ حساب المسافة الجغرافية هنا)
    const nearbyServiceCenters = serviceCenters.filter(center => {
      if (!center.location) return false;
      
      // تنفيذ فحص مبسط للتقريب
      const centerLocation = center.location as any;
      return centerLocation && centerLocation.lat && centerLocation.lng;
    });
    
    res.json(nearbyServiceCenters);
  } catch (error: any) {
    console.error('Error finding nearby service centers:', error);
    res.status(500).json({ error: error.message || 'فشل في البحث عن مراكز صيانة قريبة' });
  }
});

export default router;