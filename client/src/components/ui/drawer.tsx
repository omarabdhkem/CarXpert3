import React, { ReactNode, useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

export interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  title?: string;
  position?: 'right' | 'left' | 'top' | 'bottom';
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  className?: string;
  showCloseButton?: boolean;
  closeOnClickOutside?: boolean;
  closeOnEsc?: boolean;
  onCloseComplete?: () => void;
  overlay?: boolean;
  overlayClassName?: string;
  headerClassName?: string;
  bodyClassName?: string;
}

export function Drawer({
  isOpen,
  onClose,
  children,
  title,
  position = 'right',
  size = 'md',
  className = '',
  showCloseButton = true,
  closeOnClickOutside = true,
  closeOnEsc = true,
  onCloseComplete,
  overlay = true,
  overlayClassName = '',
  headerClassName = '',
  bodyClassName = '',
}: DrawerProps) {
  const [isClosing, setIsClosing] = useState(false);

  // Handle ESC key press
  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (closeOnEsc && event.key === 'Escape') {
        handleClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEsc);
      // Prevent scrolling when drawer is open
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = '';
    };
  }, [isOpen, closeOnEsc]);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      onClose();
      setIsClosing(false);
      onCloseComplete && onCloseComplete();
    }, 300); // Match this with animation duration
  };

  // Determine size class based on position and size prop
  const getSizeClass = () => {
    if (size === 'full') {
      return position === 'left' || position === 'right'
        ? 'w-screen'
        : 'h-screen';
    }

    const sizeMap = {
      sm: {
        left: 'w-64',
        right: 'w-64',
        top: 'h-1/4',
        bottom: 'h-1/4',
      },
      md: {
        left: 'w-80',
        right: 'w-80',
        top: 'h-1/3',
        bottom: 'h-1/3',
      },
      lg: {
        left: 'w-96',
        right: 'w-96',
        top: 'h-1/2',
        bottom: 'h-1/2',
      },
      xl: {
        left: 'w-1/2',
        right: 'w-1/2',
        top: 'h-2/3',
        bottom: 'h-2/3',
      },
    };

    return sizeMap[size][position];
  };

  // Animation variants for different positions
  const drawerVariants = {
    right: {
      open: { x: 0, transition: { type: 'tween', duration: 0.3 } },
      closed: { x: '100%', transition: { type: 'tween', duration: 0.3 } },
    },
    left: {
      open: { x: 0, transition: { type: 'tween', duration: 0.3 } },
      closed: { x: '-100%', transition: { type: 'tween', duration: 0.3 } },
    },
    top: {
      open: { y: 0, transition: { type: 'tween', duration: 0.3 } },
      closed: { y: '-100%', transition: { type: 'tween', duration: 0.3 } },
    },
    bottom: {
      open: { y: 0, transition: { type: 'tween', duration: 0.3 } },
      closed: { y: '100%', transition: { type: 'tween', duration: 0.3 } },
    },
  };

  // Position classes
  const positionClasses = {
    right: 'fixed top-0 right-0 h-full',
    left: 'fixed top-0 left-0 h-full',
    top: 'fixed top-0 left-0 w-full',
    bottom: 'fixed bottom-0 left-0 w-full',
  };

  // Get the current animation state
  const animationState = isOpen && !isClosing ? 'open' : 'closed';

  if (!isOpen && !isClosing) return null;

  return (
    <AnimatePresence>
      {(isOpen || isClosing) && (
        <>
          {/* Overlay */}
          {overlay && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className={`fixed inset-0 bg-black ${overlayClassName}`}
              onClick={closeOnClickOutside ? handleClose : undefined}
              dir="rtl"
            />
          )}

          {/* Drawer */}
          <motion.div
            initial={drawerVariants[position].closed}
            animate={drawerVariants[position][animationState]}
            exit={drawerVariants[position].closed}
            className={`${positionClasses[position]} ${getSizeClass()} bg-white shadow-xl z-50 flex flex-col ${className}`}
            dir="rtl"
          >
            {/* Header */}
            {(title || showCloseButton) && (
              <div className={`px-4 py-3 border-b flex items-center justify-between ${headerClassName}`}>
                {title && <h2 className="text-lg font-medium">{title}</h2>}
                {showCloseButton && (
                  <button
                    onClick={handleClose}
                    className="text-gray-500 hover:text-gray-700 focus:outline-none"
                    aria-label="إغلاق"
                  >
                    <X className="w-5 h-5" />
                  </button>
                )}
              </div>
            )}

            {/* Body */}
            <div className={`flex-1 overflow-y-auto px-4 py-3 ${bodyClassName}`}>
              {children}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

export interface DrawerTriggerProps {
  children: ReactNode;
  onClick: () => void;
  className?: string;
}

export function DrawerTrigger({ children, onClick, className = '' }: DrawerTriggerProps) {
  return (
    <div className={`cursor-pointer ${className}`} onClick={onClick}>
      {children}
    </div>
  );
}

export function DrawerHeader({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`px-4 py-3 border-b ${className}`}>{children}</div>;
}

export function DrawerFooter({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`px-4 py-3 border-t mt-auto ${className}`}>{children}</div>;
}

export function DrawerTitle({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <h2 className={`text-lg font-medium ${className}`}>{children}</h2>;
}

export function DrawerBody({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`flex-1 overflow-y-auto px-4 py-3 ${className}`}>{children}</div>;
}

export function DrawerCloseButton({ onClose, className = '' }: { onClose: () => void; className?: string }) {
  return (
    <button
      onClick={onClose}
      className={`text-gray-500 hover:text-gray-700 focus:outline-none ${className}`}
      aria-label="إغلاق"
    >
      <X className="w-5 h-5" />
    </button>
  );
}