import express, { type Request, Response, NextFunction } from "express";
import { setupAuth } from "./auth";
import { setupVite, serveStatic, log } from "./vite";
import { connectMongoDB } from "./mongodb";
import { checkDatabaseConnection } from "./db";
import { registerRoutes } from "./routes";
import { chatService } from "./chat-service";
import { configureSecurityFeatures } from "./security";
import compression from "compression";
import aiRoutes from "./routes/ai-routes";
import dealershipsRoutes from "./routes/dealerships-routes";
import serviceCentersRoutes from "./routes/service-centers-routes";

const app = express();
// استخدام إعدادات لكشف المحتوى والعمل على تنسيق JSON URLEncoded
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// استخدام ضغط Gzip لتحسين أداء التطبيق وسرعة التحميل
app.use(compression({
  level: 6, // مستوى ضغط متوسط (من 0 إلى 9)
  threshold: 1024, // ضغط الملفات > 1 كيلوبايت
  filter: (req, res) => {
    // لا تضغط إذا كان العميل لا يقبل ضغط الملفات
    if (req.headers['x-no-compression']) {
      return false;
    }
    // استخدم التصفية الافتراضية للضغط
    return compression.filter(req, res);
  }
}));

// Request logging middleware
app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      log(`${req.method} ${path} ${res.statusCode} in ${duration}ms`);
    }
  });

  next();
});

(async () => {
  try {
    // وضع آمن للتشغيل (للتطوير فقط)
    const safeMode = process.env.SAFE_MODE === 'true';
    if (safeMode) {
      log('تشغيل الخادم في الوضع الآمن - بعض الميزات معطلة');
    }
    
    // تهيئة قواعد البيانات
    const pgConnected = await checkDatabaseConnection();
    if (!pgConnected) {
      throw new Error('فشل الاتصال بقاعدة البيانات PostgreSQL');
    }
    log('تم الاتصال بنجاح بقاعدة البيانات PostgreSQL');

    // MongoDB اختياري للتحليلات
    try {
      const mongoConnected = await connectMongoDB();
      if (mongoConnected) {
        log('تم الاتصال بنجاح بقاعدة البيانات MongoDB');
      } else {
        log('تعذر الاتصال بـ MongoDB - بعض ميزات التحليلات ستكون غير متاحة');
      }
    } catch (mongoError) {
      log('حدث خطأ أثناء الاتصال بـ MongoDB - المتابعة بدون ميزات التحليلات');
      console.error(mongoError);
    }

    // تطبيق ميزات الأمان
    configureSecurityFeatures(app);
    
    // إعداد المصادقة
    setupAuth(app);

    // تسجيل جميع المسارات من خلال الوظيفة registerRoutes
    const httpServer = registerRoutes(app);
    
    // تهيئة خدمة الدردشة
    chatService.initialize(httpServer);
    log('تم تهيئة خدمة الدردشة بنجاح');

    // معالجة الأخطاء middleware
    app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
      const status = err.status || err.statusCode || 500;
      const message = err.message || "خطأ في الخادم";
      // تسجيل رسالة الخطأ تظهر في console
log(`خطأ: ${message}`);
      res.status(status).json({ message });
    });

    // تقديم الملفات الثابتة أو إعداد Vite حسب بيئة التشغيل
    if (process.env.NODE_ENV === "development") {
      try {
        await setupVite(app);
      } catch (e) {
        log('فشل في إعداد Vite، سيتم استخدام الملفات الثابتة');
        serveStatic(app);
      }
    } else {
      serveStatic(app);
    }

    // استخدام المنفذ من المتغيرات البيئية أو استخدام 5000 كقيمة افتراضية
    const port = Number(process.env.PORT) || 5000;
    httpServer.listen(port, "0.0.0.0", () => {
      log(`Server running on port ${port}`);
    });
  } catch (error) {
    console.error('فشل بدء تشغيل الخادم:', error);
    process.exit(1);
  }
})();