/**
 * ملف التصدير الرئيسي لوحدة الأمان
 */
import { Express } from 'express';
import { fail2ban } from './fail2ban';
import { configureHelmet } from './helmet-config';

/**
 * تكوين وتطبيق جميع ميزات الأمان على التطبيق
 */
export function configureSecurityFeatures(app: Express): void {
  // تطبيق Helmet لتأمين HTTP headers
  configureHelmet(app);
  
  // تطبيق Fail2Ban لحماية API والمسارات الحساسة
  app.use('/api', fail2ban.middleware());
  
  // حماية إضافية لمسارات تسجيل الدخول وإنشاء الحساب
  app.use(['/api/login', '/api/register'], fail2ban.loginProtection());
  
  // تطبيق Rate Limiting على جميع مسارات API
  // 100 طلب لكل IP في فترة 15 دقيقة
  app.use('/api', fail2ban.rateLimit(100, 15 * 60 * 1000));
  
  console.log('تم تكوين ميزات الأمان بنجاح');
}

// تصدير المكونات الفرعية أيضًا للاستخدام المباشر
export { fail2ban } from './fail2ban';
export { configureHelmet } from './helmet-config';