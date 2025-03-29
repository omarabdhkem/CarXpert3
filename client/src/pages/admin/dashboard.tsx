import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { translations } from '@/i18n';

// ترجمات باللغة العربية
const t = translations.ar;

// بيانات إحصائية افتراضية
const statistics = {
  totalCars: 2458,
  activeCars: 1945,
  soldCars: 513,
  totalDealerships: 46,
  totalUsers: 12564,
  totalViews: 456789,
  revenue: 245800,
  pendingRequests: 18,
};

// بيانات الأنشطة الحديثة
const recentActivities = [
  {
    id: 1,
    action: 'إضافة سيارة جديدة',
    user: 'أحمد محمد',
    time: 'منذ 2 ساعة',
    item: 'تويوتا كامري 2023',
  },
  {
    id: 2,
    action: 'تحديث معلومات وكيل',
    user: 'سارة المطيري',
    time: 'منذ 3 ساعات',
    item: 'وكالة المجدوعي للسيارات',
  },
  {
    id: 3,
    action: 'تغيير حالة سيارة إلى "مباعة"',
    user: 'خالد العتيبي',
    time: 'منذ 5 ساعات',
    item: 'مرسيدس بنز GLA 250',
  },
  {
    id: 4,
    action: 'تسجيل مستخدم جديد',
    user: 'عبدالرحمن الشمري',
    time: 'منذ 8 ساعات',
    item: '',
  },
  {
    id: 5,
    action: 'إضافة إعلان ترويجي',
    user: 'ليلى السيد',
    time: 'منذ 10 ساعات',
    item: 'عروض تمويل خاصة لسيارات البي إم دبليو',
  },
];

// بيانات الطلبات المعلقة
const pendingRequests = [
  {
    id: 1,
    type: 'طلب مراجعة سيارة',
    user: 'فهد العنزي',
    time: '25 أبريل 2025',
    status: 'معلق',
  },
  {
    id: 2,
    type: 'طلب تعديل معلومات وكيل',
    user: 'شركة الجميح للسيارات',
    time: '25 أبريل 2025',
    status: 'معلق',
  },
  {
    id: 3,
    type: 'شكوى من مستخدم',
    user: 'نورة الصالح',
    time: '24 أبريل 2025',
    status: 'معلق',
  },
];

// بيانات أكثر السيارات مشاهدة
const topCars = [
  {
    id: 1,
    name: 'تويوتا كامري 2023',
    views: 3567,
    inquiries: 48,
    price: 145000,
  },
  {
    id: 2,
    name: 'مرسيدس بنز GLA 250',
    views: 3210,
    inquiries: 42,
    price: 219000,
  },
  {
    id: 3,
    name: 'هوندا أكورد 2023',
    views: 2853,
    inquiries: 35,
    price: 139000,
  },
  {
    id: 4,
    name: 'نيسان باترول 2023',
    views: 2735,
    inquiries: 31,
    price: 329000,
  },
];

const fadeInVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

const staggerContainerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const AdminDashboard = () => {
  return (
    <div>
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <h1 className="text-3xl font-bold mb-1">{t.admin.dashboardTitle}</h1>
        <p className="text-gray-500 mb-6">نظرة عامة على الإحصائيات والأنشطة الحديثة للمنصة.</p>
      </motion.div>

      {/* الإحصائيات */}
      <motion.div
        variants={staggerContainerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
      >
        <motion.div variants={fadeInVariants}>
          <Card className="bg-gradient-to-tr from-blue-500 to-blue-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium opacity-80">إجمالي السيارات</p>
                  <h3 className="text-3xl font-bold mt-1">{statistics.totalCars}</h3>
                </div>
                <div className="bg-white/20 rounded-full p-3">
                  <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0"
                    />
                  </svg>
                </div>
              </div>
              <div className="flex items-center mt-4 text-sm">
                <span className="px-2 py-1 bg-white/20 rounded-full ml-2">نشطة: {statistics.activeCars}</span>
                <span className="px-2 py-1 bg-white/20 rounded-full">مباعة: {statistics.soldCars}</span>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={fadeInVariants}>
          <Card className="bg-gradient-to-tr from-purple-500 to-purple-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium opacity-80">إجمالي المستخدمين</p>
                  <h3 className="text-3xl font-bold mt-1">{statistics.totalUsers}</h3>
                </div>
                <div className="bg-white/20 rounded-full p-3">
                  <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                    />
                  </svg>
                </div>
              </div>
              <div className="flex items-center mt-4">
                <div className="bg-white/20 text-sm px-2 py-1 rounded-full flex items-center">
                  <svg className="w-4 h-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 10l7-7m0 0l7 7m-7-7v18"
                    />
                  </svg>
                  <span>+287 هذا الشهر</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={fadeInVariants}>
          <Card className="bg-gradient-to-tr from-orange-500 to-orange-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium opacity-80">إجمالي المشاهدات</p>
                  <h3 className="text-3xl font-bold mt-1">{statistics.totalViews.toLocaleString()}</h3>
                </div>
                <div className="bg-white/20 rounded-full p-3">
                  <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                    />
                  </svg>
                </div>
              </div>
              <div className="flex items-center mt-4">
                <div className="bg-white/20 text-sm px-2 py-1 rounded-full flex items-center">
                  <svg className="w-4 h-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 10l7-7m0 0l7 7m-7-7v18"
                    />
                  </svg>
                  <span>+24% مقارنة بالشهر الماضي</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={fadeInVariants}>
          <Card className="bg-gradient-to-tr from-green-500 to-green-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium opacity-80">الإيرادات (ريال)</p>
                  <h3 className="text-3xl font-bold mt-1">{statistics.revenue.toLocaleString()}</h3>
                </div>
                <div className="bg-white/20 rounded-full p-3">
                  <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
              </div>
              <div className="flex items-center mt-4">
                <div className="bg-white/20 text-sm px-2 py-1 rounded-full flex items-center">
                  <svg className="w-4 h-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 10l7-7m0 0l7 7m-7-7v18"
                    />
                  </svg>
                  <span>+12% هذا الشهر</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>

      {/* الأنشطة الحديثة وأكثر السيارات مشاهدة */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>{t.admin.recentActivities}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivities.map((activity) => (
                  <div key={activity.id} className="flex items-start pb-4 border-b last:border-0 last:pb-0">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center ml-3 mt-1">
                      <svg className="w-4 h-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{activity.action}</p>
                      <div className="flex justify-between text-sm text-gray-500 mt-1">
                        <span>{activity.user}</span>
                        <span>{activity.time}</span>
                      </div>
                      {activity.item && <p className="text-sm mt-1 text-blue-600">{activity.item}</p>}
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 text-center">
                <button className="text-sm text-blue-600 hover:underline">عرض جميع الأنشطة</button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>أكثر السيارات مشاهدة</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {topCars.map((car) => (
                  <div key={car.id} className="flex items-center justify-between pb-4 border-b last:border-0 last:pb-0">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-gray-100 rounded flex items-center justify-center ml-3">
                        <span className="text-sm font-bold text-gray-600">{car.id}</span>
                      </div>
                      <div>
                        <p className="font-medium">{car.name}</p>
                        <p className="text-sm text-gray-500">
                          {car.price.toLocaleString()} ريال
                        </p>
                      </div>
                    </div>
                    <div className="text-left">
                      <div className="text-sm flex items-center">
                        <svg className="w-4 h-4 ml-1 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                          />
                        </svg>
                        <span>{car.views.toLocaleString()}</span>
                      </div>
                      <div className="text-sm flex items-center mt-1">
                        <svg className="w-4 h-4 ml-1 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                          />
                        </svg>
                        <span>{car.inquiries}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 text-center">
                <button className="text-sm text-blue-600 hover:underline">عرض التقرير الكامل</button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* الطلبات المعلقة */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.5 }}
        className="mb-8"
      >
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>الطلبات المعلقة</CardTitle>
            <div className="py-1 px-3 bg-orange-100 text-orange-800 text-sm rounded-full">
              {statistics.pendingRequests} طلب
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="text-right bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-sm font-medium text-gray-500">#</th>
                    <th className="px-4 py-3 text-sm font-medium text-gray-500">نوع الطلب</th>
                    <th className="px-4 py-3 text-sm font-medium text-gray-500">المستخدم</th>
                    <th className="px-4 py-3 text-sm font-medium text-gray-500">التاريخ</th>
                    <th className="px-4 py-3 text-sm font-medium text-gray-500">الحالة</th>
                    <th className="px-4 py-3 text-sm font-medium text-gray-500">الإجراء</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {pendingRequests.map((request) => (
                    <tr key={request.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm">{request.id}</td>
                      <td className="px-4 py-3">
                        <div className="font-medium">{request.type}</div>
                      </td>
                      <td className="px-4 py-3 text-sm">{request.user}</td>
                      <td className="px-4 py-3 text-sm">{request.time}</td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                          {request.status}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center space-x-2 space-x-reverse">
                          <button className="p-1 text-blue-600 hover:text-blue-800">
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                              />
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                              />
                            </svg>
                          </button>
                          <button className="p-1 text-green-600 hover:text-green-800">
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M5 13l4 4L19 7"
                              />
                            </svg>
                          </button>
                          <button className="p-1 text-red-600 hover:text-red-800">
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M6 18L18 6M6 6l12 12"
                              />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-4 text-center">
              <button className="text-sm text-blue-600 hover:underline">عرض جميع الطلبات</button>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* أزرار الإجراءات السريعة */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.6 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>إجراءات سريعة</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              <button className="flex flex-col items-center p-4 border rounded-lg hover:bg-blue-50 hover:border-blue-200 transition-colors">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-2">
                  <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                    />
                  </svg>
                </div>
                <span className="text-sm font-medium">{t.admin.addNewCar}</span>
              </button>
              <button className="flex flex-col items-center p-4 border rounded-lg hover:bg-blue-50 hover:border-blue-200 transition-colors">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-2">
                  <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                    />
                  </svg>
                </div>
                <span className="text-sm font-medium">{t.admin.addNewDealership}</span>
              </button>
              <button className="flex flex-col items-center p-4 border rounded-lg hover:bg-blue-50 hover:border-blue-200 transition-colors">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-2">
                  <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                    />
                  </svg>
                </div>
                <span className="text-sm font-medium">إنشاء تقرير</span>
              </button>
              <button className="flex flex-col items-center p-4 border rounded-lg hover:bg-blue-50 hover:border-blue-200 transition-colors">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-2">
                  <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                    />
                  </svg>
                </div>
                <span className="text-sm font-medium">إرسال إشعار</span>
              </button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default AdminDashboard;