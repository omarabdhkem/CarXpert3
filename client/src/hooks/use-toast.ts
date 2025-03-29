// المكتبات
import { ReactNode } from "react";
import {
  useToast as useToastComponent,
  type Toast,
  type ToasterToast,
} from "@/components/ui/toast";

// واجهة خصائص الإشعار
export interface ToastProps {
  title?: string;
  description?: string | ReactNode;
  action?: ReactNode;
  type?: 'success' | 'error' | 'warning' | 'info' | 'default';
  duration?: number;
}

// استخدام مكون الإشعارات
export function useToast() {
  const { toast, dismiss, update } = useToastComponent();

  // إنشاء إشعار جديد
  const showToast = ({
    title,
    description,
    action,
    type = "default",
    duration = 5000,
  }: ToastProps): ToasterToast => {
    const variantMap = {
      success: "success",
      error: "destructive",
      warning: "warning",
      info: "info",
      default: "default",
    } as const;

    return toast({
      title,
      description,
      action,
      variant: variantMap[type],
      duration,
    });
  };

  return {
    toast: showToast,
    dismiss,
    update,
  };
}