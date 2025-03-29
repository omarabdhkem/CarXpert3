import { ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * دمج أسماء الفئات من clsx وتحسينها باستخدام tailwind-merge
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * تأخير التنفيذ لفترة محددة
 */
export const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * تنسيق رقم كعملة
 */
export function formatCurrency(amount: number, currency: string = "ريال", locale: string = "ar-SA") {
  return `${amount.toLocaleString(locale)} ${currency}`;
}

/**
 * الحصول على قيمة من قائمة بشكل عشوائي
 */
export function getRandomFromArray<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

/**
 * تنسيق التاريخ باللغة العربية
 */
export function formatDate(date: Date | string, locale: string = "ar-SA"): string {
  const dateObj = typeof date === "string" ? new Date(date) : date;
  return dateObj.toLocaleDateString(locale, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

/**
 * اختصار النص إذا تجاوز الطول المحدد
 */
export function truncateText(text: string, maxLength: number = 100): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + "...";
}

/**
 * تحويل النص إلى شكل slug
 */
export function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .replace(/\s+/g, "-") // استبدال المسافات بـ -
    .replace(/[^\w\-]+/g, "") // إزالة الأحرف غير الكلمة
    .replace(/\-\-+/g, "-") // استبدال -- متعددة بـ -
    .replace(/^-+/, "") // قص - من البداية
    .replace(/-+$/, ""); // قص - من النهاية
}

/**
 * تنسيق تنسيق رقم الهاتف للعرض
 */
export function formatPhoneNumber(phoneNumber: string): string {
  // تنسيق الأرقام السعودية مثلاً: 966-5X-XXX-XXXX
  if (phoneNumber.startsWith("+966") || phoneNumber.startsWith("966")) {
    return phoneNumber.replace(/^(\+?966|0)(\d{2})(\d{3})(\d{4})$/, "$1-$2-$3-$4");
  }
  
  // تنسيق افتراضي
  return phoneNumber;
}

/**
 * التحقق من صحة البريد الإلكتروني
 */
export function isValidEmail(email: string): boolean {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
}

/**
 * تحويل عدد الثواني إلى تنسيق hh:mm:ss
 */
export function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  
  const parts = [];
  
  if (hours > 0) {
    parts.push(`${hours} ${hours === 1 ? "ساعة" : "ساعات"}`);
  }
  
  if (minutes > 0) {
    parts.push(`${minutes} ${minutes === 1 ? "دقيقة" : "دقائق"}`);
  }
  
  if (remainingSeconds > 0 || parts.length === 0) {
    parts.push(`${remainingSeconds} ${remainingSeconds === 1 ? "ثانية" : "ثواني"}`);
  }
  
  return parts.join(" و ");
}

/**
 * الحصول على لون متباين لخلفية معينة
 */
export function getContrastColor(bgColor: string): "black" | "white" {
  // إزالة الـ # إذا كان موجوداً
  const color = bgColor.charAt(0) === "#" ? bgColor.substring(1, 7) : bgColor;
  
  // تحويل إلى RGB
  const r = parseInt(color.substring(0, 2), 16);
  const g = parseInt(color.substring(2, 4), 16);
  const b = parseInt(color.substring(4, 6), 16);
  
  // حساب القيمة للتباين
  const yiq = (r * 299 + g * 587 + b * 114) / 1000;
  
  // العودة باللون المتباين، أسود للخلفيات الفاتحة وأبيض للخلفيات الداكنة
  return yiq >= 128 ? "black" : "white";
}