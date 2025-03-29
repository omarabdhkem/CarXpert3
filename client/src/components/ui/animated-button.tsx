import React, { ReactNode } from 'react';
import { motion } from 'framer-motion';

interface AnimatedButtonProps {
  children: ReactNode;
  onClick?: () => void;
  className?: string;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  icon?: ReactNode;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
  disabled?: boolean;
  isLoading?: boolean;
  type?: 'button' | 'submit' | 'reset';
}

export default function AnimatedButton({
  children,
  onClick,
  className = '',
  variant = 'primary',
  size = 'md',
  icon,
  iconPosition = 'right',
  fullWidth = false,
  disabled = false,
  isLoading = false,
  type = 'button',
}: AnimatedButtonProps) {
  // تحديد أنماط الزر بناءً على المتغيرات
  const getVariantClasses = () => {
    switch (variant) {
      case 'primary':
        return 'bg-[var(--primary)] text-white hover:bg-[var(--primary-dark)] focus:ring-[var(--primary-light)]';
      case 'secondary':
        return 'bg-gray-100 text-gray-800 hover:bg-gray-200 focus:ring-gray-200';
      case 'outline':
        return 'bg-transparent text-gray-800 border border-gray-300 hover:bg-gray-50 focus:ring-gray-200';
      case 'ghost':
        return 'bg-transparent text-gray-800 hover:bg-gray-100 focus:ring-gray-200';
      default:
        return 'bg-[var(--primary)] text-white hover:bg-[var(--primary-dark)] focus:ring-[var(--primary-light)]';
    }
  };

  // تحديد أحجام الزر
  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'text-xs py-1.5 px-3';
      case 'md':
        return 'text-sm py-2 px-4';
      case 'lg':
        return 'text-base py-2.5 px-5';
      default:
        return 'text-sm py-2 px-4';
    }
  };

  // تأثيرات الحركة
  const buttonVariants = {
    rest: { scale: 1 },
    hover: { scale: 1.03 },
    tap: { scale: 0.97 },
    disabled: { scale: 1, opacity: 0.7 },
  };

  // تأثيرات حركة الأيقونة
  const iconVariants = {
    rest: { x: 0 },
    hover: { x: iconPosition === 'right' ? 3 : -3 },
  };

  // تأثيرات التحميل
  const loadingVariants = {
    animate: {
      rotate: 360,
      transition: {
        repeat: Infinity,
        duration: 1,
        ease: 'linear',
      },
    },
  };

  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled || isLoading}
      className={`
        relative rounded-md font-medium transition-colors duration-200
        focus:outline-none focus:ring-2 focus:ring-offset-1
        ${getVariantClasses()}
        ${getSizeClasses()}
        ${fullWidth ? 'w-full' : ''}
        ${disabled ? 'cursor-not-allowed opacity-70' : ''}
        ${className}
      `}
      variants={buttonVariants}
      initial="rest"
      whileHover={!disabled && !isLoading ? "hover" : undefined}
      whileTap={!disabled && !isLoading ? "tap" : undefined}
      animate={disabled ? "disabled" : "rest"}
    >
      <span className="flex items-center justify-center">
        {isLoading && (
          <motion.svg
            className={`animate-spin -mr-1 ${
              size === 'sm' ? 'w-3 h-3' : size === 'lg' ? 'w-5 h-5' : 'w-4 h-4'
            } ${iconPosition === 'left' ? 'ml-2' : 'mr-2'}`}
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            variants={loadingVariants}
            animate="animate"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </motion.svg>
        )}

        {!isLoading && icon && iconPosition === 'left' && (
          <motion.span
            className="ml-2 inline-flex"
            variants={iconVariants}
          >
            {icon}
          </motion.span>
        )}

        {children}

        {!isLoading && icon && iconPosition === 'right' && (
          <motion.span
            className="mr-2 inline-flex"
            variants={iconVariants}
          >
            {icon}
          </motion.span>
        )}
      </span>

      {/* تأثير التموج عند النقر */}
      {!disabled && !isLoading && (
        <motion.span
          className="absolute inset-0 rounded-md pointer-events-none"
          style={{ backgroundColor: 'currentColor', opacity: 0.2 }}
          initial={{ scale: 0, opacity: 0 }}
          whileTap={{ scale: 1.5, opacity: 0 }}
          transition={{ duration: 0.4 }}
        />
      )}
    </motion.button>
  );
}