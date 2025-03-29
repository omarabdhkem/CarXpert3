import React, { useEffect, useState } from 'react';
import { AlertCircle, WifiOff } from 'lucide-react';

/**
 * مكون لاكتشاف حالة الاتصال بالإنترنت
 * يعرض تنبيهًا للمستخدم عند فقدان الاتصال
 */
export default function OfflineDetector() {
  const [isOffline, setIsOffline] = useState(false);

  useEffect(() => {
    // التحقق من حالة الاتصال الأولية
    setIsOffline(!navigator.onLine);

    // إعداد المستمعين لتغييرات حالة الاتصال
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // إزالة المستمعين عند تفكيك المكون
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (!isOffline) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 z-50 animate-slide-in">
      <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg shadow-lg flex items-center">
        <div className="flex-shrink-0">
          <WifiOff className="h-5 w-5 text-red-500" />
        </div>
        <div className="mr-3">
          <p className="text-red-800 font-medium">أنت غير متصل بالإنترنت</p>
          <p className="text-red-700 text-sm mt-1">
            قد لا تعمل بعض الميزات بشكل صحيح حتى يتم استعادة الاتصال
          </p>
        </div>
      </div>
    </div>
  );
}

/**
 * مكون لعرض حالة الاتصال بالخادم
 */
export function ServerConnectionStatus({
  isConnected,
  onReconnect
}: {
  isConnected: boolean;
  onReconnect?: () => void;
}) {
  if (isConnected) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 z-50 animate-slide-in">
      <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-lg shadow-lg">
        <div className="flex">
          <div className="flex-shrink-0">
            <AlertCircle className="h-5 w-5 text-amber-500" />
          </div>
          <div className="mr-3">
            <p className="text-amber-800 font-medium">فقدت الاتصال بالخادم</p>
            <p className="text-amber-700 text-sm mt-1">
              يتم محاولة إعادة الاتصال تلقائيًا...
            </p>
          </div>
        </div>
        {onReconnect && (
          <div className="mt-3 flex justify-end">
            <button
              onClick={onReconnect}
              className="px-3 py-1 text-sm bg-amber-100 hover:bg-amber-200 text-amber-800 rounded-md transition-colors"
            >
              إعادة الاتصال
            </button>
          </div>
        )}
      </div>
    </div>
  );
}