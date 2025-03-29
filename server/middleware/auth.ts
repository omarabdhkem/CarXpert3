import { Request, Response, NextFunction } from 'express';

// التحقق من تسجيل الدخول للمستخدم
export const isAuthenticated = (req: Request, res: Response, next: NextFunction) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ error: 'غير مسموح. يرجى تسجيل الدخول أولاً.' });
};

// التحقق من أن المستخدم هو مدير
export const isAdmin = (req: Request, res: Response, next: NextFunction) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ error: 'غير مسموح. يرجى تسجيل الدخول أولاً.' });
  }
  
  // التحقق من أن المستخدم هو مدير
  if (req.user?.role === 'admin') {
    return next();
  }
  
  // للتسهيل في البيئة التطويرية، يمكن اعتبار المستخدم الأول مديرًا
  if (req.user?.id === 1) {
    return next();
  }
  
  res.status(403).json({ error: 'غير مسموح. يجب أن تكون مديرًا.' });
};

// التحقق من أن المعرف المطلوب هو للمستخدم الحالي أو المستخدم هو مدير
export const isOwnerOrAdmin = (req: Request, res: Response, next: NextFunction) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ error: 'غير مسموح. يرجى تسجيل الدخول أولاً.' });
  }
  
  const userId = parseInt(req.params.userId);
  
  // التحقق من أن المستخدم هو مدير أو صاحب البيانات
  if (req.user?.role === 'admin' || req.user?.id === userId) {
    return next();
  }
  
  res.status(403).json({ error: 'غير مسموح. يجب أن تكون مالك هذه البيانات أو مديرًا.' });
};