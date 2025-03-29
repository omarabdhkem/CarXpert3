import React, { ReactNode, useState } from 'react';
import { Link, useLocation } from 'wouter';
import { Menubar } from '@/components/ui/menubar';
import { CarChat } from '@/components/ui/car-chat';
import { VoiceSearch } from '@/components/ui/voice-search';
import { t } from '@/i18n';
import { useAuth } from '@/hooks/use-auth';
import { Loader2, UserCircle, LogOut, ChevronDown, Settings } from 'lucide-react';
import ThemeToggle from '@/components/ui/theme-toggle';

interface MainLayoutProps {
  children: ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
  const [location] = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const { user, logoutMutation, isLoading } = useAuth();

  // عناصر القائمة الرئيسية
  const menuItems = [
    {
      label: 'الرئيسية',
      href: '/',
    },
    {
      label: 'السيارات',
      items: [
        { label: 'جميع السيارات', href: '/cars' },
        { label: 'السيارات الجديدة', href: '/cars/new' },
        { label: 'السيارات المستعملة', href: '/cars/used' },
        { label: 'العروض الخاصة', href: '/cars/offers' },
        { label: 'البحث المتقدم', href: '/advanced-search', highlight: true },
      ],
    },
    {
      label: 'الوكلاء',
      href: '/dealerships',
    },
    {
      label: 'مراكز الصيانة',
      href: '/service-centers',
    },
    {
      label: 'أدوات ذكية',
      items: [
        { label: 'تصميم سيارتك', href: '/car-configurator' },
        { label: 'معمل الألوان', href: '/car-color-lab' },
        { label: 'تقييم السيارات', href: '/car-evaluation/new', highlight: true },
      ],
    },
    {
      label: 'الذكاء الاصطناعي',
      href: '/car-ai',
    },
    {
      label: 'حول المنصة',
      items: [
        { label: 'من نحن', href: '/about' },
        { label: 'اتصل بنا', href: '/contact' },
        { label: 'الأسئلة الشائعة', href: '/faq' },
        { label: 'الشروط والأحكام', href: '/terms' },
      ],
    },
  ];

  // عناصر قائمة المستخدم (غير مسجل الدخول)
  const guestMenuItems = [
    {
      label: t('common.login'),
      href: '/auth',
    },
    {
      label: t('common.register'),
      href: '/auth',
    },
  ];

  // عناصر قائمة المستخدم (مسجل الدخول)
  const userDropdownItems = [
    {
      label: t('common.profile'),
      href: '/profile',
      icon: <UserCircle className="ml-2 h-4 w-4" />,
    },
    {
      label: t('common.favorite'),
      href: '/favorites',
      icon: <svg className="ml-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
      </svg>,
    },
    {
      label: t('common.settings'),
      href: '/settings',
      icon: <Settings className="ml-2 h-4 w-4" />,
    },
    {
      label: t('common.logout'),
      onClick: () => logoutMutation.mutate(),
      icon: <LogOut className="ml-2 h-4 w-4" />,
    },
  ];

  // إذا كان المستخدم لديه دور مسؤول، أضف رابط لوحة التحكم
  if (user && (user.role === 'admin' || user.role === 'moderator')) {
    userDropdownItems.unshift({
      label: t('admin.dashboardTitle'),
      href: '/admin',
      icon: <svg className="ml-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
      </svg>,
    });
  }

  const handleLogout = () => {
    logoutMutation.mutate();
    setIsUserMenuOpen(false);
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* الهيدر */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* الشعار */}
            <Link href="/">
              <a className="flex items-center">
                <span className="text-xl font-bold text-[var(--primary)]">Car<span className="text-[var(--accent)]">Xpert</span></span>
              </a>
            </Link>

            {/* القائمة الرئيسية (للشاشات المتوسطة والكبيرة) */}
            <div className="hidden md:block">
              <Menubar items={menuItems} className="border-none shadow-none" />
            </div>

            {/* قائمة المستخدم واللغة والثيم */}
            <div className="flex items-center">
              {/* زر تبديل الثيم */}
              <div className="ml-4">
                <ThemeToggle />
              </div>
              {/* القائمة الخاصة بالمستخدم */}
              <div className="hidden md:flex items-center space-x-4 space-x-reverse">
                {isLoading ? (
                  <div className="flex items-center px-4 py-2">
                    <Loader2 className="h-5 w-5 animate-spin text-[var(--primary)]" />
                  </div>
                ) : user ? (
                  // المستخدم مسجل الدخول - عرض قائمة المستخدم
                  <div className="relative">
                    <button
                      onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                      className="flex items-center text-gray-700 hover:text-[var(--primary)] transition-colors py-2 px-3 rounded-md hover:bg-gray-100"
                    >
                      <span className="font-medium">{user.username}</span>
                      <ChevronDown className={`h-4 w-4 mr-1 transition-transform ${isUserMenuOpen ? 'rotate-180' : ''}`} />
                    </button>
                    
                    {/* قائمة منسدلة للمستخدم */}
                    {isUserMenuOpen && (
                      <div className="absolute left-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
                        {userDropdownItems.map((item, index) => (
                          item.onClick ? (
                            <button
                              key={index}
                              onClick={item.onClick}
                              className="flex items-center w-full text-right px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            >
                              {item.icon}
                              {item.label}
                            </button>
                          ) : (
                            <Link key={index} href={item.href || '/'}>
                              <a className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                                {item.icon}
                                {item.label}
                              </a>
                            </Link>
                          )
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  // المستخدم غير مسجل الدخول - عرض أزرار تسجيل الدخول/التسجيل
                  <>
                    <Link href="/auth">
                      <a className="text-gray-700 hover:text-[var(--primary)] transition-colors">
                        {t('common.login')}
                      </a>
                    </Link>
                    <Link href="/auth">
                      <a className="bg-[var(--primary)] text-white px-4 py-2 rounded-md hover:bg-opacity-90 transition-colors">
                        {t('common.register')}
                      </a>
                    </Link>
                  </>
                )}
              </div>

              {/* زر القائمة للهواتف */}
              <button
                className="md:hidden ml-4 p-2 rounded-md text-gray-700 hover:bg-gray-100"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d={isMenuOpen ? 'M6 18L18 6M6 6l12 12' : 'M4 6h16M4 12h16M4 18h16'}
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* القائمة المنسدلة للهواتف */}
        {isMenuOpen && (
          <div className="md:hidden bg-white border-t">
            <div className="container mx-auto px-4 py-3">
              <nav className="flex flex-col space-y-3">
                {menuItems.map((item, index) => (
                  <div key={index}>
                    {item.href ? (
                      <Link href={item.href}>
                        <a className="block px-3 py-2 rounded-md hover:bg-gray-100">{item.label}</a>
                      </Link>
                    ) : (
                      <div className="px-3 py-2 font-medium">{item.label}</div>
                    )}
                    {item.items && (
                      <div className="pr-6 mt-1 space-y-1">
                        {item.items.map((subItem, subIndex) => (
                          <Link key={subIndex} href={subItem.href}>
                            <a className="block px-3 py-1 text-sm rounded-md hover:bg-gray-100">
                              {subItem.label}
                            </a>
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
                <div className="border-t pt-3 mt-3 flex flex-col space-y-3">
                  {/* زر تبديل السمة للهواتف */}
                  <div className="px-3 py-2 border-b pb-3 mb-2">
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-sm">وضع العرض</span>
                      <ThemeToggle showCarThemeSelector={false} />
                    </div>
                    <div className="flex justify-between items-center mt-3">
                      <span className="font-medium text-sm">نمط السيارة</span>
                      <ThemeToggle showCarThemeSelector={true} />
                    </div>
                  </div>
                  {user ? (
                    // المستخدم مسجل الدخول - عرض قائمة العناصر للمستخدم
                    <>
                      <div className="px-3 py-2 font-medium border-b pb-2 mb-2 flex items-center">
                        <UserCircle className="ml-2 h-5 w-5" />
                        {user.username}
                      </div>
                      {userDropdownItems.map((item, index) => (
                        item.onClick ? (
                          <button
                            key={index}
                            onClick={item.onClick}
                            className="flex items-center text-right px-3 py-2 rounded-md hover:bg-gray-100"
                          >
                            {item.icon}
                            {item.label}
                          </button>
                        ) : (
                          <Link key={index} href={item.href || '/'}>
                            <a className="flex items-center px-3 py-2 rounded-md hover:bg-gray-100">
                              {item.icon}
                              {item.label}
                            </a>
                          </Link>
                        )
                      ))}
                    </>
                  ) : (
                    // المستخدم غير مسجل الدخول - عرض أزرار تسجيل الدخول/التسجيل
                    guestMenuItems.map((item, index) => (
                      <Link key={index} href={item.href}>
                        <a className="block px-3 py-2 rounded-md hover:bg-gray-100">{item.label}</a>
                      </Link>
                    ))
                  )}
                </div>
              </nav>
            </div>
          </div>
        )}
      </header>

      {/* المحتوى الرئيسي */}
      <main className="flex-grow">
        {/* البحث الصوتي */}
        <div className="fixed bottom-20 left-4 z-40">
          <VoiceSearch />
        </div>
        {children}
        <CarChat />
      </main>

      {/* الفوتر */}
      <footer className="bg-gray-900 text-white pt-12 pb-8">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* عن المنصة */}
            <div>
              <h3 className="text-lg font-bold mb-4">CarXpert</h3>
              <p className="text-gray-300 mb-4">
                منصة متكاملة لبيع وشراء السيارات في المملكة العربية السعودية. نقدم لك أفضل العروض والخدمات لإيجاد
                سيارتك المثالية.
              </p>
              <div className="flex space-x-4 space-x-reverse">
                <a
                  href="#"
                  className="text-gray-300 hover:text-white transition-colors"
                  aria-label="Facebook"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" />
                  </svg>
                </a>
                <a
                  href="#"
                  className="text-gray-300 hover:text-white transition-colors"
                  aria-label="Twitter"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M19.633 7.997c.013.175.013.349.013.523 0 5.325-4.053 11.461-11.46 11.461-2.282 0-4.402-.661-6.186-1.809.324.037.636.05.973.05a8.07 8.07 0 0 0 5.001-1.721 4.036 4.036 0 0 1-3.767-2.793c.249.037.499.062.761.062.361 0 .724-.05 1.061-.137a4.027 4.027 0 0 1-3.23-3.953v-.05c.537.299 1.16.486 1.82.511a4.022 4.022 0 0 1-1.796-3.354c0-.748.199-1.434.548-2.032a11.457 11.457 0 0 0 8.306 4.215c-.062-.3-.1-.599-.1-.899a4.026 4.026 0 0 1 4.028-4.028c1.16 0 2.207.486 2.943 1.272a7.957 7.957 0 0 0 2.556-.973 4.02 4.02 0 0 1-1.771 2.22 8.073 8.073 0 0 0 2.319-.624 8.645 8.645 0 0 1-2.019 2.083z" />
                  </svg>
                </a>
                <a
                  href="#"
                  className="text-gray-300 hover:text-white transition-colors"
                  aria-label="Instagram"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z" />
                  </svg>
                </a>
              </div>
            </div>

            {/* روابط سريعة */}
            <div>
              <h3 className="text-lg font-bold mb-4">روابط سريعة</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="/cars">
                    <a className="text-gray-300 hover:text-white transition-colors">تصفح السيارات</a>
                  </Link>
                </li>
                <li>
                  <Link href="/advanced-search">
                    <a className="text-gray-300 hover:text-white transition-colors">البحث المتقدم</a>
                  </Link>
                </li>
                <li>
                  <Link href="/dealerships">
                    <a className="text-gray-300 hover:text-white transition-colors">الوكلاء</a>
                  </Link>
                </li>
                <li>
                  <Link href="/service-centers">
                    <a className="text-gray-300 hover:text-white transition-colors">مراكز الصيانة</a>
                  </Link>
                </li>
                <li>
                  <Link href="/car-configurator">
                    <a className="text-gray-300 hover:text-white transition-colors">تصميم سيارتك</a>
                  </Link>
                </li>
                <li>
                  <Link href="/car-evaluation/new">
                    <a className="text-gray-300 hover:text-white transition-colors">تقييم السيارات</a>
                  </Link>
                </li>
                <li>
                  <Link href="/car-color-lab">
                    <a className="text-gray-300 hover:text-white transition-colors">معمل الألوان</a>
                  </Link>
                </li>
                <li>
                  <Link href="/blog">
                    <a className="text-gray-300 hover:text-white transition-colors">المدونة</a>
                  </Link>
                </li>
                <li>
                  <Link href="/pricing">
                    <a className="text-gray-300 hover:text-white transition-colors">الاسعار</a>
                  </Link>
                </li>
              </ul>
            </div>

            {/* الدعم */}
            <div>
              <h3 className="text-lg font-bold mb-4">الدعم</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="/contact">
                    <a className="text-gray-300 hover:text-white transition-colors">اتصل بنا</a>
                  </Link>
                </li>
                <li>
                  <Link href="/faq">
                    <a className="text-gray-300 hover:text-white transition-colors">الأسئلة الشائعة</a>
                  </Link>
                </li>
                <li>
                  <Link href="/help">
                    <a className="text-gray-300 hover:text-white transition-colors">مركز المساعدة</a>
                  </Link>
                </li>
                <li>
                  <Link href="/terms">
                    <a className="text-gray-300 hover:text-white transition-colors">الشروط والأحكام</a>
                  </Link>
                </li>
                <li>
                  <Link href="/privacy">
                    <a className="text-gray-300 hover:text-white transition-colors">سياسة الخصوصية</a>
                  </Link>
                </li>
              </ul>
            </div>

            {/* تواصل معنا */}
            <div>
              <h3 className="text-lg font-bold mb-4">تواصل معنا</h3>
              <ul className="space-y-2">
                <li className="flex items-start">
                  <svg className="w-5 h-5 ml-3 mt-0.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                  <span className="text-gray-300">
                    الرياض، المملكة العربية السعودية
                  </span>
                </li>
                <li className="flex items-center">
                  <svg className="w-5 h-5 ml-3 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                    />
                  </svg>
                  <span dir="ltr" className="text-gray-300">
                    +966 11 123 4567
                  </span>
                </li>
                <li className="flex items-center">
                  <svg className="w-5 h-5 ml-3 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                  <span className="text-gray-300">info@carxpert.com</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-12 pt-8 border-t border-gray-800 text-center text-gray-400 text-sm">
            <p>© {new Date().getFullYear()} CarXpert. جميع الحقوق محفوظة.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}