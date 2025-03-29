import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { X } from "lucide-react";

import { cn } from "@/lib/utils";

const ToastProvider = React.createContext<{
  toasts: Toast[];
  addToast: (toast: Toast) => string;
  dismissToast: (id: string) => void;
  updateToast: (id: string, toast: Partial<Toast>) => void;
}>({
  toasts: [],
  addToast: () => "",
  dismissToast: () => {},
  updateToast: () => {},
});

export interface ToastProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "destructive" | "success" | "warning" | "info";
  onDismiss?: () => void;
}

export const toastVariants = cva(
  "group pointer-events-auto relative flex w-full items-center justify-between space-x-4 overflow-hidden rounded-md border p-5 shadow-lg transition-all data-[swipe=cancel]:translate-x-0 data-[swipe=end]:translate-x-[var(--radix-toast-swipe-end-x)] data-[swipe=move]:translate-x-[var(--radix-toast-swipe-move-x)] data-[swipe=move]:transition-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[swipe=end]:animate-out data-[state=closed]:fade-out-80 data-[state=open]:slide-in-from-top-full data-[state=open]:sm:slide-in-from-bottom-full data-[state=closed]:slide-out-to-right-full",
  {
    variants: {
      variant: {
        default: "border-border bg-card text-card-foreground",
        destructive:
          "destructive border-destructive bg-destructive text-destructive-foreground",
        success: "border-green-200 bg-green-50 text-green-800",
        warning: "border-yellow-200 bg-yellow-50 text-yellow-800",
        info: "border-blue-200 bg-blue-50 text-blue-800",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface Toast extends VariantProps<typeof toastVariants> {
  id: string;
  title?: React.ReactNode;
  description?: React.ReactNode;
  action?: React.ReactNode;
  duration?: number;
}

export type ToasterToast = Omit<Toast, "id">;

const Toast = React.forwardRef<
  HTMLDivElement,
  ToastProps
>(({ className, variant = "default", onDismiss, children, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn(toastVariants({ variant }), className)}
      {...props}
    >
      <div className="flex-1 rtl:space-x-reverse rtl:space-x-4">{children}</div>
      {onDismiss && (
        <button
          className="rounded-md p-1 opacity-0 transition-opacity hover:bg-secondary focus:opacity-100 focus:outline-none focus:ring-2 group-hover:opacity-100"
          onClick={onDismiss}
        >
          <X className="h-4 w-4" />
          <span className="sr-only">إغلاق</span>
        </button>
      )}
    </div>
  );
});
Toast.displayName = "Toast";

export const ToastTitle = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("text-sm font-medium", className)}
    {...props}
  />
));
ToastTitle.displayName = "ToastTitle";

export const ToastDescription = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("text-sm opacity-90", className)}
    {...props}
  />
));
ToastDescription.displayName = "ToastDescription";

export const ToastAction = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center", className)}
    {...props}
  />
));
ToastAction.displayName = "ToastAction";

export function useToast() {
  const { toasts, addToast, dismissToast, updateToast } = React.useContext(ToastProvider);

  const toast = React.useCallback(
    (props: ToasterToast) => {
      const id = addToast({
        ...props,
        id: Math.random().toString(36).slice(2, 11),
      });

      if (props.duration !== Infinity) {
        setTimeout(() => {
          dismissToast(id);
        }, props.duration || 5000);
      }

      return {
        id,
        dismiss: () => dismissToast(id),
        update: (props: Partial<ToasterToast>) =>
          updateToast(id, props),
      };
    },
    [addToast, dismissToast, updateToast]
  );

  return {
    toast,
    dismiss: dismissToast,
    update: updateToast,
    toasts,
  };
}

export interface ToasterProps {
  position?: "top-right" | "top-left" | "bottom-right" | "bottom-left" | "top-center" | "bottom-center";
}

export function Toaster({ position = "bottom-center" }: ToasterProps) {
  const [toasts, setToasts] = React.useState<Toast[]>([]);

  const addToast = React.useCallback((toast: Toast) => {
    setToasts((prev) => [...prev, toast]);
    return toast.id;
  }, []);

  const dismissToast = React.useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const updateToast = React.useCallback(
    (id: string, toast: Partial<Toast>) => {
      setToasts((prev) =>
        prev.map((t) => (t.id === id ? { ...t, ...toast } : t))
      );
    },
    []
  );

  const positionClasses = {
    "top-right": "top-0 right-0",
    "top-left": "top-0 left-0",
    "bottom-right": "bottom-0 right-0",
    "bottom-left": "bottom-0 left-0",
    "top-center": "top-0 left-1/2 -translate-x-1/2",
    "bottom-center": "bottom-0 left-1/2 -translate-x-1/2",
  };

  return (
    <ToastProvider.Provider
      value={{ toasts, addToast, dismissToast, updateToast }}
    >
      <div
        className={`fixed z-50 m-4 flex flex-col items-center gap-2 ${positionClasses[position]}`}
      >
        {toasts.map((toast) => (
          <Toast
            key={toast.id}
            variant={toast.variant}
            onDismiss={() => dismissToast(toast.id)}
          >
            <div className="grid gap-1">
              {toast.title && <ToastTitle>{toast.title}</ToastTitle>}
              {toast.description && (
                <ToastDescription>{toast.description}</ToastDescription>
              )}
            </div>
            {toast.action && <ToastAction>{toast.action}</ToastAction>}
          </Toast>
        ))}
      </div>
    </ToastProvider.Provider>
  );
}