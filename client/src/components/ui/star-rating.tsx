import React, { useState } from 'react';
import { motion } from 'framer-motion';

interface StarRatingProps {
  rating?: number;
  maxRating?: number;
  size?: 'sm' | 'md' | 'lg';
  readOnly?: boolean;
  onChange?: (rating: number) => void;
  className?: string;
  showValue?: boolean;
  precision?: 'half' | 'full';
  color?: string;
  emptyColor?: string;
  reviewsCount?: number;
}

export default function StarRating({
  rating = 0,
  maxRating = 5,
  size = 'md',
  readOnly = false,
  onChange,
  className = '',
  showValue = false,
  precision = 'half',
  color = 'text-yellow-400',
  emptyColor = 'text-gray-300',
  reviewsCount,
}: StarRatingProps) {
  const [hoverRating, setHoverRating] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  
  // تحديد حجم النجوم
  const getSizeClass = () => {
    switch (size) {
      case 'sm':
        return 'w-4 h-4';
      case 'md':
        return 'w-5 h-5';
      case 'lg':
        return 'w-6 h-6';
      default:
        return 'w-5 h-5';
    }
  };
  
  // التعامل مع تحريك المؤشر فوق التقييم
  const handleMouseEnter = (index: number) => {
    if (!readOnly) {
      setHoverRating(index);
    }
  };
  
  // التعامل مع مغادرة المؤشر للتقييم
  const handleMouseLeave = () => {
    if (!readOnly) {
      setHoverRating(0);
    }
  };
  
  // التعامل مع النقر على نجمة
  const handleClick = (index: number) => {
    if (!readOnly && onChange) {
      setIsAnimating(true);
      onChange(index);
      
      // إيقاف التأثير الحركي بعد مدة قصيرة
      setTimeout(() => {
        setIsAnimating(false);
      }, 300);
    }
  };
  
  // تقريب القيمة للنصف أو الكامل حسب الدقة المطلوبة
  const roundRating = (value: number) => {
    if (precision === 'half') {
      return Math.round(value * 2) / 2;
    }
    return Math.round(value);
  };
  
  // إنشاء مصفوفة النجوم
  const stars = Array.from({ length: maxRating }, (_, i) => i + 1);
  
  // تحديد التقييم الظاهر (إما التقييم الفعلي أو تقييم المرور بالمؤشر)
  const displayRating = hoverRating || rating;
  
  // تأثيرات الحركة
  const starVariants = {
    selected: { scale: isAnimating ? [1, 1.3, 1] : 1, y: isAnimating ? [0, -5, 0] : 0 },
    hover: { scale: 1.2 },
    idle: { scale: 1 },
  };
  
  // تحديد حالة النجمة
  const getStarState = (starPosition: number) => {
    if ((hoverRating && starPosition <= hoverRating) || 
        (!hoverRating && starPosition <= displayRating)) {
      return 'selected';
    }
    return 'idle';
  };
  
  // تقديم نجمة ممتلئة جزئيًا
  const PartialStar = ({ filled }: { filled: number }) => {
    return (
      <div className="relative">
        {/* النجمة الفارغة في الخلفية */}
        <svg className={`${getSizeClass()} ${emptyColor}`} fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118l-2.8-2.034c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
        
        {/* النجمة الملونة في الأمام مع تحديد العرض بناءً على النسبة المئوية */}
        <div className="absolute top-0 left-0 overflow-hidden" style={{ width: `${filled * 100}%` }}>
          <svg className={`${getSizeClass()} ${color}`} fill="currentColor" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118l-2.8-2.034c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        </div>
      </div>
    );
  };
  
  return (
    <div className={`flex items-center ${className}`}>
      {/* عرض النجوم */}
      <div className="flex">
        {stars.map((star) => {
          // حساب نسبة امتلاء النجمة
          const diff = displayRating - star + 1;
          
          // إذا كانت النجمة ممتلئة بالكامل
          if (diff >= 1) {
            return (
              <motion.div
                key={star}
                variants={starVariants}
                animate={getStarState(star)}
                whileHover={!readOnly ? 'hover' : undefined}
                transition={{ duration: 0.3 }}
                onMouseEnter={() => handleMouseEnter(star)}
                onMouseLeave={handleMouseLeave}
                onClick={() => handleClick(star)}
                className={`cursor-${readOnly ? 'default' : 'pointer'} mr-0.5`}
              >
                <svg className={`${getSizeClass()} ${color}`} fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118l-2.8-2.034c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              </motion.div>
            );
          }
          // إذا كانت النجمة ممتلئة جزئيًا
          else if (diff > 0 && diff < 1 && precision === 'half') {
            return (
              <motion.div
                key={star}
                variants={starVariants}
                animate={getStarState(star - 1 + diff)}
                whileHover={!readOnly ? 'hover' : undefined}
                transition={{ duration: 0.3 }}
                onMouseEnter={() => handleMouseEnter(star)}
                onMouseLeave={handleMouseLeave}
                onClick={() => handleClick(star)}
                className={`cursor-${readOnly ? 'default' : 'pointer'} mr-0.5`}
              >
                <PartialStar filled={diff} />
              </motion.div>
            );
          }
          // إذا كانت النجمة فارغة
          else {
            return (
              <motion.div
                key={star}
                variants={starVariants}
                animate={getStarState(star)}
                whileHover={!readOnly ? 'hover' : undefined}
                transition={{ duration: 0.3 }}
                onMouseEnter={() => handleMouseEnter(star)}
                onMouseLeave={handleMouseLeave}
                onClick={() => handleClick(star)}
                className={`cursor-${readOnly ? 'default' : 'pointer'} mr-0.5`}
              >
                <svg className={`${getSizeClass()} ${emptyColor}`} fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118l-2.8-2.034c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              </motion.div>
            );
          }
        })}
      </div>
      
      {/* عرض القيمة الرقمية للتقييم */}
      {showValue && (
        <div className="mr-2 text-sm text-gray-600 flex items-center">
          <span className="font-medium">{displayRating.toFixed(precision === 'half' ? 1 : 0)}</span>
          {reviewsCount !== undefined && (
            <span className="mr-1 text-gray-500">
              ({reviewsCount})
            </span>
          )}
        </div>
      )}
    </div>
  );
}