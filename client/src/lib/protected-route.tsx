import React from 'react';
import { useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";
import { Redirect, Route } from "wouter";
import { t } from '@/i18n';

export function ProtectedRoute({
  path,
  component: Component,
  admin = false,
}: {
  path: string;
  component: React.ComponentType<any>;
  admin?: boolean;
}) {
  const { user, isLoading } = useAuth();

  // عرض حالة التحميل
  if (isLoading) {
    return (
      <Route path={path}>
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-[var(--primary)]" />
          <span className="mr-2 text-gray-700">{t('common.loading')}</span>
        </div>
      </Route>
    );
  }

  // التحقق من وجود المستخدم
  if (!user) {
    return (
      <Route path={path}>
        <Redirect to="/auth" />
      </Route>
    );
  }

  // إذا كانت الصفحة تتطلب صلاحيات المشرف
  if (admin && user.role !== 'admin' && user.role !== 'moderator') {
    return (
      <Route path={path}>
        <div className="flex flex-col items-center justify-center min-h-screen">
          <h1 className="text-3xl font-bold text-red-600 mb-4">{t('admin.accessDenied')}</h1>
          <p>{t('admin.adminOnly')}</p>
        </div>
      </Route>
    );
  }

  // إذا كان المستخدم مسجل الدخول وله الصلاحيات المطلوبة
  return (
    <Route path={path}>
      <Component />
    </Route>
  );
}