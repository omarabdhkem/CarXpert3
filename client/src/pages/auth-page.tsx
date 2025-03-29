import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { motion } from 'framer-motion';
import { t } from '@/i18n';
import { useAuth } from '@/hooks/use-auth';
import { z } from 'zod';
import { Loader2 } from 'lucide-react';

// مخططات التحقق من صحة النموذج
const loginSchema = z.object({
  username: z.string().min(1, { message: t('auth.requiredField') }),
  password: z.string().min(1, { message: t('auth.requiredField') }),
});

const registerSchema = z.object({
  username: z.string().min(3, { message: 'يجب أن يكون اسم المستخدم 3 أحرف على الأقل' }),
  email: z.string().email({ message: t('auth.invalidEmail') }),
  password: z.string().min(8, { message: t('auth.passwordLength') }),
  confirmPassword: z.string().min(1, { message: t('auth.requiredField') }),
  fullName: z.string().optional(),
  phone: z.string().optional(),
  agreeTerms: z.literal(true, {
    errorMap: () => ({ message: 'يجب الموافقة على الشروط وسياسة الخصوصية' }),
  }),
}).refine((data) => data.password === data.confirmPassword, {
  message: t('auth.passwordMismatch'),
  path: ['confirmPassword'],
});

type LoginFormData = z.infer<typeof loginSchema>;
type RegisterFormData = Omit<z.infer<typeof registerSchema>, 'confirmPassword' | 'agreeTerms'>;

const AuthPage: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [, setLocation] = useLocation();
  const { user, loginMutation, registerMutation, isLoading } = useAuth();
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    phone: '',
    agreeTerms: false,
    rememberMe: false,
  });

  // إعادة توجيه المستخدم إذا كان مسجل الدخول بالفعل
  useEffect(() => {
    if (user) {
      setLocation('/');
    }
  }, [user, setLocation]);

  const toggleForm = () => {
    setIsLogin(!isLogin);
    setFormErrors({});
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const validateForm = () => {
    try {
      if (isLogin) {
        loginSchema.parse(formData);
      } else {
        registerSchema.parse(formData);
      }
      setFormErrors({});
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: Record<string, string> = {};
        error.errors.forEach((err) => {
          if (err.path[0]) {
            newErrors[err.path[0] as string] = err.message;
          }
        });
        setFormErrors(newErrors);
      }
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    if (isLogin) {
      loginMutation.mutate({
        username: formData.username,
        password: formData.password,
      });
    } else {
      const registerData: RegisterFormData = {
        username: formData.username,
        email: formData.email,
        password: formData.password,
        fullName: formData.fullName || undefined,
        phone: formData.phone || undefined,
      };
      
      registerMutation.mutate(registerData);
    }
  };

  // اظهار حالة التحميل أثناء تسجيل الدخول أو التسجيل
  const isSubmitting = loginMutation.isPending || registerMutation.isPending;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl w-full grid grid-cols-1 md:grid-cols-2 gap-8 bg-white rounded-2xl shadow-xl overflow-hidden">
        {/* قسم النموذج */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="p-8 md:p-12"
        >
          <div className="text-center md:text-right mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              {isLogin ? t('auth.welcomeBack') : t('auth.createAccount')}
            </h2>
            <p className="text-gray-600">
              {isLogin
                ? 'قم بتسجيل الدخول للوصول إلى حسابك وإدارة إعلاناتك والمفضلة.'
                : 'أنشئ حسابًا جديدًا للوصول إلى جميع مميزات CarXpert.'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* اسم المستخدم */}
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
                {t('auth.username')}
              </label>
              <input
                id="username"
                name="username"
                type="text"
                value={formData.username}
                onChange={handleChange}
                required
                className={`w-full px-4 py-3 border ${
                  formErrors.username ? 'border-red-500' : 'border-gray-300'
                } rounded-lg focus:ring-[var(--primary)] focus:border-[var(--primary)] outline-none`}
                placeholder="أدخل اسم المستخدم"
              />
              {formErrors.username && (
                <p className="mt-1 text-sm text-red-600">{formErrors.username}</p>
              )}
            </div>

            {/* الاسم الكامل (للتسجيل فقط) */}
            {!isLogin && (
              <div>
                <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1">
                  {t('auth.fullName')}
                </label>
                <input
                  id="fullName"
                  name="fullName"
                  type="text"
                  value={formData.fullName}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 border ${
                    formErrors.fullName ? 'border-red-500' : 'border-gray-300'
                  } rounded-lg focus:ring-[var(--primary)] focus:border-[var(--primary)] outline-none`}
                  placeholder="أدخل اسمك الكامل"
                />
                {formErrors.fullName && (
                  <p className="mt-1 text-sm text-red-600">{formErrors.fullName}</p>
                )}
              </div>
            )}

            {/* البريد الإلكتروني (للتسجيل فقط) */}
            {!isLogin && (
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  {t('auth.emailAddress')}
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  required={!isLogin}
                  className={`w-full px-4 py-3 border ${
                    formErrors.email ? 'border-red-500' : 'border-gray-300'
                  } rounded-lg focus:ring-[var(--primary)] focus:border-[var(--primary)] outline-none`}
                  placeholder="أدخل بريدك الإلكتروني"
                />
                {formErrors.email && <p className="mt-1 text-sm text-red-600">{formErrors.email}</p>}
              </div>
            )}

            {/* رقم الهاتف (للتسجيل فقط) */}
            {!isLogin && (
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                  {t('auth.phoneNumber')}
                </label>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 border ${
                    formErrors.phone ? 'border-red-500' : 'border-gray-300'
                  } rounded-lg focus:ring-[var(--primary)] focus:border-[var(--primary)] outline-none`}
                  placeholder="+966 5x xxxx xxxx"
                />
                {formErrors.phone && <p className="mt-1 text-sm text-red-600">{formErrors.phone}</p>}
              </div>
            )}

            {/* كلمة المرور */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  {t('auth.password')}
                </label>
                {isLogin && (
                  <button type="button" className="text-sm text-[var(--primary)] hover:underline">
                    {t('auth.forgotPassword')}
                  </button>
                )}
              </div>
              <input
                id="password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                required
                className={`w-full px-4 py-3 border ${
                  formErrors.password ? 'border-red-500' : 'border-gray-300'
                } rounded-lg focus:ring-[var(--primary)] focus:border-[var(--primary)] outline-none`}
                placeholder="أدخل كلمة المرور"
              />
              {formErrors.password && (
                <p className="mt-1 text-sm text-red-600">{formErrors.password}</p>
              )}
            </div>

            {/* تأكيد كلمة المرور (للتسجيل فقط) */}
            {!isLogin && (
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                  {t('auth.confirmPassword')}
                </label>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required={!isLogin}
                  className={`w-full px-4 py-3 border ${
                    formErrors.confirmPassword ? 'border-red-500' : 'border-gray-300'
                  } rounded-lg focus:ring-[var(--primary)] focus:border-[var(--primary)] outline-none`}
                  placeholder="أعد إدخال كلمة المرور"
                />
                {formErrors.confirmPassword && (
                  <p className="mt-1 text-sm text-red-600">{formErrors.confirmPassword}</p>
                )}
              </div>
            )}

            {/* تذكرني أو الموافقة على الشروط */}
            {isLogin ? (
              <div className="flex items-center">
                <input
                  id="rememberMe"
                  name="rememberMe"
                  type="checkbox"
                  checked={formData.rememberMe}
                  onChange={handleChange}
                  className="h-4 w-4 text-[var(--primary)] border-gray-300 rounded cursor-pointer focus:ring-[var(--primary)]"
                />
                <label htmlFor="rememberMe" className="mr-2 block text-sm text-gray-700 cursor-pointer">
                  {t('auth.rememberMe')}
                </label>
              </div>
            ) : (
              <div className="flex items-center">
                <input
                  id="agreeTerms"
                  name="agreeTerms"
                  type="checkbox"
                  checked={formData.agreeTerms}
                  onChange={handleChange}
                  required
                  className={`h-4 w-4 text-[var(--primary)] border-gray-300 rounded cursor-pointer focus:ring-[var(--primary)] ${
                    formErrors.agreeTerms ? 'border-red-500' : ''
                  }`}
                />
                <label htmlFor="agreeTerms" className="mr-2 block text-sm text-gray-700 cursor-pointer">
                  {t('auth.agreeTerms')}
                </label>
              </div>
            )}
            {formErrors.agreeTerms && (
              <p className="text-sm text-red-600">{formErrors.agreeTerms}</p>
            )}

            {/* زر التقديم */}
            <div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 bg-[var(--primary)] text-white rounded-lg hover:bg-opacity-90 transition-colors font-medium flex items-center justify-center"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 ml-2 animate-spin" />
                    {isLogin ? 'جاري تسجيل الدخول...' : 'جاري إنشاء الحساب...'}
                  </>
                ) : (
                  isLogin ? t('auth.loginButton') : t('auth.registerButton')
                )}
              </button>
            </div>

            {/* تبديل النموذج */}
            <div className="text-center">
              <p className="text-gray-600 text-sm">
                {isLogin ? t('auth.noAccount') : t('auth.alreadyHaveAccount')}{' '}
                <button
                  type="button"
                  onClick={toggleForm}
                  className="text-[var(--primary)] font-medium hover:underline"
                >
                  {isLogin ? t('auth.signUpNow') : t('auth.loginNow')}
                </button>
              </p>
            </div>
          </form>
        </motion.div>

        {/* قسم الصورة الجانبية */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          className="hidden md:block bg-[var(--primary)] text-white p-12 flex flex-col justify-center relative overflow-hidden"
        >
          <div className="relative z-10">
            <h2 className="text-3xl font-bold mb-4">CarXpert</h2>
            <h3 className="text-2xl font-semibold mb-6">منصة متكاملة لبيع وشراء السيارات</h3>
            <ul className="space-y-4">
              <li className="flex items-center">
                <svg className="w-6 h-6 ml-3 text-white opacity-80" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <span>أكبر سوق للسيارات في المملكة</span>
              </li>
              <li className="flex items-center">
                <svg className="w-6 h-6 ml-3 text-white opacity-80" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <span>آلاف السيارات الجديدة والمستعملة</span>
              </li>
              <li className="flex items-center">
                <svg className="w-6 h-6 ml-3 text-white opacity-80" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <span>تواصل مباشر مع البائعين والوكلاء</span>
              </li>
              <li className="flex items-center">
                <svg className="w-6 h-6 ml-3 text-white opacity-80" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <span>خدمات تمويل وتأمين متكاملة</span>
              </li>
              <li className="flex items-center">
                <svg className="w-6 h-6 ml-3 text-white opacity-80" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <span>تقنيات ذكاء اصطناعي متطورة</span>
              </li>
            </ul>
          </div>

          {/* زخارف الخلفية */}
          <div className="absolute inset-0 opacity-10">
            <svg className="absolute -bottom-10 -left-10 w-64 h-64" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="40" fill="white" />
            </svg>
            <svg className="absolute -top-20 -right-20 w-80 h-80" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="40" fill="white" />
            </svg>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default AuthPage;