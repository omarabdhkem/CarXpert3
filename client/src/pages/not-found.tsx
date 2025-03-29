import React from 'react';
import { Link } from 'wouter';
import { translations } from '@/i18n';

const t = translations.ar;

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-xl overflow-hidden">
        <div className="p-6 sm:p-8">
          <div className="text-center">
            <h1 className="text-9xl font-bold text-[var(--primary)]">404</h1>
            <h2 className="mt-4 text-2xl font-bold text-gray-900">الصفحة غير موجودة</h2>
            <p className="mt-2 text-gray-600">
              عذراً، الصفحة التي تبحث عنها غير موجودة أو تم نقلها أو حذفها.
            </p>
            <div className="mt-6">
              <Link href="/">
                <a className="inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-[var(--primary)] hover:bg-[var(--primary-dark)] transition-colors">
                  العودة للصفحة الرئيسية
                  <svg
                    className="ml-2 -mr-1 w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                </a>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}