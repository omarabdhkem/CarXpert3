import React, { ReactNode, useState } from 'react';
import { Link, useLocation } from 'wouter';
import { t } from '@/i18n';
import { AnimatePresence, motion } from 'framer-motion';
import { Loader2, UserCircle, LogOut, ChevronDown, Settings, Home, LayoutDashboard, Users, Car, Store, Wrench, Bell, BarChart2, Shield, Book, Edit } from 'lucide-react';
import ThemeToggle from '@/components/ui/theme-toggle';

interface AdminLayoutProps {
  children: ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const [location] = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);

  // عناصر القائمة الجانبية
  const sidebarItems = [
    {
      label: 'لوحة التحكم',
      href: '/admin',
      icon: <LayoutDashboard className="ml-2 h-5 w-5" />,
    },
    {
      label: 'المستخدمين',
      href: '/admin/users',
      icon: <Users className="ml-2 h-5 w-5" />,
    },
    {
      label: 'السيارات',
      href: '/admin/cars',
      icon: <Car className="ml-2 h-5 w-5" />,
    },
    {
      label: 'الوكلاء',
      href: '/admin/dealerships',
      icon: <Store className="ml-2 h-5 w-5" />,
    },
    {
      label: 'مراكز الصيانة',
      href: '/admin/service-centers',
      icon: <Wrench className="ml-2 h-5 w-5" />,
    },
    {
      label: 'الإشعارات',
      href: '/admin/notifications',
      icon: <Bell className="ml-2 h-5 w-5" />,
    },
    {
      label: 'التقارير والإحصائيات',
      href: '/admin/reports',
      icon: <BarChart2 className="ml-2 h-5 w-5" />,
    },
    {
      label: 'الأمان والصلاحيات',
      href: '/admin/security',
      icon: <Shield className="ml-2 h-5 w-5" />,
    },
    {
      label: 'المحتوى والمقالات',
      href: '/admin/content',
      icon: <Book className="ml-2 h-5 w-5" />,
    },
    {
      label: 'الإعدادات',
      href: '/admin/settings',
      icon: <Settings className="ml-2 h-5 w-5" />,
    },
    {
      label: 'تطوير النظام الذاتي',
      href: '/admin/self-improvement',
      icon: <Edit className="ml-2 h-5 w-5" />,
    },
  ];

  // الإشعارات الوهمية للعرض
  const notifications = [
    {
      id: 1,
      title: 'تم إضافة سيارة جديدة',
      message: 'قام المستخدم أحمد بإضافة سيارة جديدة للبيع',
      time: '13:45',
      date: 'اليوم',
      isRead: false,
    },
    {
      id: 2,
      title: 'طلب تسجيل وكيل جديد',
      message: 'هناك طلب جديد لتسجيل وكالة سيارات، يرجى مراجعته',
      time: '10:20',
      date: 'اليوم',
      isRead: false,
    },
    {
      id: 3,
      title: 'تقرير النظام اليومي',
      message: 'تم إنشاء تقرير جديد عن أداء النظام ومؤشرات التحسين',
      time: '08:30',
      date: 'اليوم',
      isRead: true,
    }
  ];

  // تنسيق التحول للشريط الجانبي
  const sidebarVariants = {
    open: { width: 256, transition: { duration: 0.3 } },
    closed: { width: 64, transition: { duration: 0.3 } },
  };

  // تنسيق التحول للعناصر داخل الشريط الجانبي
  const sidebarItemsVariants = {
    open: { opacity: 1, display: "block", transition: { duration: 0.3 } },
    closed: { opacity: 0, display: "none", transition: { duration: 0.1 } },
  };

  // تنسيق التحول للمحتوى الرئيسي
  const contentVariants = {
    open: { marginRight: 256, transition: { duration: 0.3 } },
    closed: { marginRight: 64, transition: { duration: 0.3 } },
  };

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* الشريط الجانبي */}
      <motion.aside
        className="bg-white shadow-md z-20 overflow-y-auto overflow-x-hidden fixed h-screen"
        animate={isSidebarOpen ? "open" : "closed"}
        variants={sidebarVariants}
        initial="open"
      >
        <div className="p-4 border-b flex items-center justify-between">
          <Link href="/">
            <a className="flex items-center">
              {isSidebarOpen ? (
                <span className="text-lg font-bold text-[var(--primary)]">Car<span className="text-[var(--accent)]">Xpert</span></span>
              ) : (
                <span className="text-lg font-bold text-[var(--primary)]">CX</span>
              )}
            </a>
          </Link>
          
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="text-gray-500 hover:text-gray-700 p-1 rounded-full hover:bg-gray-100 transition-colors"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d={isSidebarOpen ? 'M15 19l-7-7 7-7' : 'M9 5l7 7-7 7'}
              />
            </svg>
          </button>
        </div>
        
        <nav className="p-4">
          <ul className="space-y-2">
            {sidebarItems.map((item, index) => (
              <li key={index}>
                <Link href={item.href}>
                  <a
                    className={`flex items-center py-2 px-3 rounded-md transition-colors ${
                      location === item.href
                        ? 'bg-primary/10 text-[var(--primary)]'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <div className="w-5 h-5 mr-3">{item.icon}</div>
                    <motion.span
                      animate={isSidebarOpen ? "open" : "closed"}
                      variants={sidebarItemsVariants}
                      className="whitespace-nowrap"
                    >
                      {item.label}
                    </motion.span>
                  </a>
                </Link>
              </li>
            ))}
          </ul>
          
          <div className="mt-8 pt-4 border-t">
            <Link href="/">
              <a className="flex items-center py-2 px-3 rounded-md text-gray-700 hover:bg-gray-100 transition-colors">
                <div className="w-5 h-5 mr-3">
                  <Home className="h-5 w-5" />
                </div>
                <motion.span
                  animate={isSidebarOpen ? "open" : "closed"}
                  variants={sidebarItemsVariants}
                >
                  {t('admin.backToSite')}
                </motion.span>
              </a>
            </Link>
          </div>
        </nav>
      </motion.aside>

      {/* المحتوى الرئيسي */}
      <motion.main
        className="flex-1 overflow-x-hidden overflow-y-auto transition-all duration-300"
        animate={isSidebarOpen ? "open" : "closed"}
        variants={contentVariants}
        initial="open"
      >
        {/* رأس الصفحة */}
        <header className="bg-white shadow-sm px-6 py-4 sticky top-0 z-10">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-800 animate-fade-in-right">{t('admin.dashboardTitle')}</h1>
            
            <div className="flex items-center space-x-4 space-x-reverse">
              {/* زر تبديل السمة */}
              <ThemeToggle className="ml-2" />
              
              <div className="relative">
                <button
                  className="p-2 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
                  aria-label="الإشعارات"
                  onClick={() => setIsNotificationOpen(!isNotificationOpen)}
                >
                  <Bell className="h-5 w-5" />
                  <span className="absolute top-0 right-0 bg-red-500 text-white rounded-full w-4 h-4 text-xs flex items-center justify-center animate-pulse-slow">
                    {notifications.filter(n => !n.isRead).length}
                  </span>
                </button>
                
                {/* قائمة الإشعارات */}
                <AnimatePresence>
                  {isNotificationOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                      className="absolute left-0 mt-2 w-80 bg-white rounded-md shadow-lg py-1 z-50"
                    >
                      <div className="px-4 py-2 border-b">
                        <h3 className="font-medium">الإشعارات</h3>
                      </div>
                      <div className="max-h-64 overflow-y-auto">
                        {notifications.map((notification) => (
                          <div
                            key={notification.id}
                            className={`px-4 py-3 border-b last:border-0 ${
                              notification.isRead ? 'bg-white' : 'bg-blue-50'
                            } hover:bg-gray-100 transition-colors`}
                          >
                            <div className="flex justify-between items-start">
                              <h4 className="font-medium text-sm">{notification.title}</h4>
                              <span className="text-xs text-gray-500">{notification.time}</span>
                            </div>
                            <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                            <div className="flex justify-between items-center mt-2">
                              <span className="text-xs text-gray-500">{notification.date}</span>
                              {!notification.isRead && (
                                <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                                  جديد
                                </span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="px-4 py-2 border-t text-center">
                        <Link href="/admin/notifications">
                          <a className="text-sm text-[var(--primary)] hover:underline">
                            عرض جميع الإشعارات
                          </a>
                        </Link>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              
              <span className="text-gray-600">مرحبًا، المدير</span>
            </div>
          </div>
        </header>
        
        {/* محتوى الصفحة */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="p-6"
        >
          {children}
        </motion.div>
      </motion.main>
    </div>
  );
}