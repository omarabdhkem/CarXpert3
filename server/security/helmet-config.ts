/**
 * تكوين Helmet لأمان التطبيق
 * Helmet يساعد على تأمين التطبيق من خلال ضبط HTTP headers المختلفة
 */
import helmet from 'helmet';
import { Express } from 'express';

/**
 * تكوين وتطبيق إعدادات Helmet لتعزيز أمان التطبيق
 */
export function configureHelmet(app: Express): void {
  // إعدادات Helmet الأساسية
  app.use(
    helmet({
      // تمكين حماية Cross-Site Scripting
      xssFilter: true,
      
      // منع الكشف عن إطار العمل المستخدم
      hidePoweredBy: true,
      
      // منع التطبيق من عرضه داخل iframe لمنع هجمات clickjacking
      frameguard: {
        action: 'deny'
      },
      
      // ضبط Content Security Policy لمنع تحميل موارد من مصادر غير موثوقة
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", 'https://cdn.jsdelivr.net', 'https://unpkg.com'],
          connectSrc: ["'self'", 'https://api.example.com'],
          imgSrc: ["'self'", 'data:', 'https:'],
          styleSrc: ["'self'", "'unsafe-inline'", 'https://cdn.jsdelivr.net', 'https://fonts.googleapis.com'],
          fontSrc: ["'self'", 'https://fonts.gstatic.com'],
          objectSrc: ["'none'"],
          upgradeInsecureRequests: [],
        },
      },
      
      // تنشيط HTTP Strict Transport Security
      hsts: {
        maxAge: 15552000, // 180 يوم
        includeSubDomains: true,
        preload: true
      },
      
      // منع استخدام النص التلقائي في الأنواع MIME
      noSniff: true,
      
      // تنشيط referrer-policy
      referrerPolicy: {
        policy: 'no-referrer-when-downgrade'
      }
    })
  );
  
  // إضافة Cross-Origin Resource Sharing
  app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    next();
  });
  
  console.log('تم تكوين Helmet وإعدادات الأمان بنجاح');
}