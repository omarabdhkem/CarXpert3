/**
 * نظام Fail2Ban لحماية الموقع من هجمات القوة الغاشمة
 */
import { Request, Response, NextFunction } from 'express';
import { storage } from '../storage';

interface BanRecord {
  ip: string;
  attempts: number;
  lastAttempt: Date;
  bannedUntil: Date | null;
}

class Fail2Ban {
  private records: Map<string, BanRecord> = new Map();
  private maxAttempts: number = 5;
  private banDuration: number = 30 * 60 * 1000; // 30 دقيقة بالمللي ثانية
  private windowDuration: number = 10 * 60 * 1000; // 10 دقائق بالمللي ثانية
  private cleanupInterval: NodeJS.Timeout | null = null;

  constructor() {
    // بدء عملية تنظيف دورية للسجلات القديمة
    this.cleanupInterval = setInterval(() => this.cleanup(), 15 * 60 * 1000); // كل 15 دقيقة
  }

  /**
   * تنظيف السجلات القديمة التي انتهت مدة الحظر عليها
   */
  private cleanup() {
    console.log('تنظيف سجلات Fail2Ban...');
    const now = new Date();
    for (const [ip, record] of this.records.entries()) {
      if (record.bannedUntil && record.bannedUntil < now) {
        console.log(`إزالة حظر IP: ${ip}`);
        this.records.delete(ip);
      }
    }
  }

  /**
   * إيقاف النظام وتنظيف الموارد
   */
  public stop() {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
  }

  /**
   * التحقق مما إذا كان عنوان IP محظورًا
   */
  public isBanned(ip: string): boolean {
    const record = this.records.get(ip);
    if (!record) return false;

    const now = new Date();
    if (record.bannedUntil && record.bannedUntil > now) {
      return true;
    }

    // إذا انتهت مدة الحظر، قم بإزالة السجل
    if (record.bannedUntil && record.bannedUntil <= now) {
      this.records.delete(ip);
      return false;
    }

    return false;
  }

  /**
   * تسجيل محاولة فاشلة لعنوان IP
   */
  public recordFailedAttempt(ip: string): boolean {
    const now = new Date();
    const record = this.records.get(ip);

    if (!record) {
      // إنشاء سجل جديد
      this.records.set(ip, {
        ip,
        attempts: 1,
        lastAttempt: now,
        bannedUntil: null
      });
      
      return false;
    }

    // إذا كان هناك سجل سابق، تحقق من المدة الزمنية
    if (now.getTime() - record.lastAttempt.getTime() > this.windowDuration) {
      // إعادة تعيين العداد إذا مر وقت كافٍ
      record.attempts = 1;
      record.lastAttempt = now;
      return false;
    }

    // زيادة عدد المحاولات
    record.attempts += 1;
    record.lastAttempt = now;

    // تحقق مما إذا كان يجب حظر العنوان
    if (record.attempts >= this.maxAttempts) {
      record.bannedUntil = new Date(now.getTime() + this.banDuration);
      
      // تسجيل محاولة الاختراق في قاعدة البيانات
      this.logBannedIP(ip, record.attempts);
      
      return true;
    }

    return false;
  }

  /**
   * تسجيل عنوان IP المحظور في قاعدة البيانات
   */
  private async logBannedIP(ip: string, attempts: number) {
    try {
      await storage.logError({
        type: 'security',
        message: `IP محظور بعد ${attempts} محاولات فاشلة: ${ip}`,
        details: {
          ip,
          attempts,
          timestamp: new Date()
        }
      });
    } catch (error) {
      console.error('فشل تسجيل عنوان IP المحظور:', error);
    }
  }

  /**
   * middleware لحماية مسارات API
   */
  public middleware() {
    return (req: Request, res: Response, next: NextFunction) => {
      const ip = req.ip || req.socket.remoteAddress || 'unknown';
      
      if (this.isBanned(ip)) {
        return res.status(403).json({
          error: 'تم حظر وصولك مؤقتًا بسبب عدد كبير من المحاولات الفاشلة. يرجى المحاولة مرة أخرى لاحقًا.'
        });
      }
      
      next();
    };
  }

  /**
   * middleware خاص لحماية مسارات تسجيل الدخول
   */
  public loginProtection() {
    return (req: Request, res: Response, next: NextFunction) => {
      const ip = req.ip || req.socket.remoteAddress || 'unknown';
      
      if (this.isBanned(ip)) {
        return res.status(403).json({
          error: 'تم حظر وصولك مؤقتًا بسبب عدد كبير من محاولات تسجيل الدخول الفاشلة. يرجى المحاولة مرة أخرى لاحقًا.'
        });
      }
      
      next();
    };
  }

  /**
   * تسجيل فشل تسجيل دخول
   */
  public recordFailedLogin(req: Request) {
    const ip = req.ip || req.socket.remoteAddress || 'unknown';
    return this.recordFailedAttempt(ip);
  }

  /**
   * تسجيل محاولات الاتصال المتكررة بمسار API
   */
  public rateLimit(maxRequests: number, windowMs: number) {
    const requests: Map<string, { count: number, resetTime: number }> = new Map();
    
    return (req: Request, res: Response, next: NextFunction) => {
      const ip = req.ip || req.socket.remoteAddress || 'unknown';
      const now = Date.now();
      
      // إذا كان العنوان محظورًا بالفعل، ارفض الطلب
      if (this.isBanned(ip)) {
        return res.status(403).json({
          error: 'تم حظر وصولك مؤقتًا. يرجى المحاولة مرة أخرى لاحقًا.'
        });
      }
      
      let requestInfo = requests.get(ip);
      
      if (!requestInfo || now > requestInfo.resetTime) {
        // إنشاء سجل جديد أو إعادة تعيين العداد
        requestInfo = { count: 1, resetTime: now + windowMs };
        requests.set(ip, requestInfo);
      } else {
        // زيادة العداد
        requestInfo.count++;
        
        // تحقق من تجاوز الحد
        if (requestInfo.count > maxRequests) {
          // تسجيل محاولة فاشلة في Fail2Ban
          const isBanned = this.recordFailedAttempt(ip);
          
          if (isBanned) {
            return res.status(403).json({
              error: 'تم حظر وصولك مؤقتًا بسبب عدد كبير من الطلبات. يرجى المحاولة مرة أخرى لاحقًا.'
            });
          } else {
            return res.status(429).json({
              error: 'تم تجاوز عدد الطلبات المسموح به. يرجى المحاولة مرة أخرى لاحقًا.'
            });
          }
        }
      }
      
      next();
    };
  }
}

// إنشاء نسخة وحيدة من النظام
export const fail2ban = new Fail2Ban();