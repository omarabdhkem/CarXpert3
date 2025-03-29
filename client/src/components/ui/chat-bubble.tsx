import React, { ReactNode } from 'react';
import { motion } from 'framer-motion';

interface ChatBubbleProps {
  message: string;
  timestamp: Date | string;
  isCurrentUser: boolean;
  status?: 'sent' | 'delivered' | 'read' | 'error';
  type?: 'text' | 'image' | 'system';
  avatar?: string;
  username?: string;
  className?: string;
  onRetry?: () => void;
}

export default function ChatBubble({
  message,
  timestamp,
  isCurrentUser,
  status = 'delivered',
  type = 'text',
  avatar,
  username,
  className = '',
  onRetry,
}: ChatBubbleProps) {
  const formattedTime = formatTime(timestamp);
  
  // تصميم الفقاعة للمستخدم الحالي مقابل المستخدم الآخر
  const bubbleStyle = isCurrentUser
    ? 'bg-[var(--primary)] text-white ml-auto rounded-tl-xl rounded-tr-sm rounded-bl-xl'
    : 'bg-gray-100 text-gray-800 mr-auto rounded-tl-sm rounded-tr-xl rounded-br-xl';
  
  // الحد الأقصى للعرض للفقاعة
  const maxWidthStyle = 'max-w-[85%] sm:max-w-[70%]';
  
  // رمز حالة الرسالة
  const statusIcon = {
    sent: (
      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400">
        <polyline points="9 10 4 15 9 20"></polyline>
        <path d="M20 4v7a4 4 0 0 1-4 4H4"></path>
      </svg>
    ),
    delivered: (
      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400">
        <path d="M20 6 9 17l-5-5"></path>
      </svg>
    ),
    read: (
      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-500">
        <path d="m1 9 4 4 4-4"></path>
        <path d="M3.51 12.01 1 9l4 4 4-4"></path>
        <path d="M9 5l4 4 4-4"></path>
      </svg>
    ),
    error: (
      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-red-500">
        <circle cx="12" cy="12" r="10"></circle>
        <line x1="12" y1="8" x2="12" y2="12"></line>
        <line x1="12" y1="16" x2="12.01" y2="16"></line>
      </svg>
    ),
  };
  
  // تأثيرات الحركة
  const messageVariants = {
    initial: {
      opacity: 0,
      y: 20,
      scale: 0.9,
    },
    animate: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.3,
      },
    },
  };
  
  // عرض رسائل الصور
  const renderContent = () => {
    if (type === 'image') {
      return (
        <div className="mb-1">
          <div className="overflow-hidden rounded-md">
            <img 
              src={message} 
              alt="صورة" 
              className="w-full max-w-[250px] h-auto object-cover"
              loading="lazy"
              onClick={() => window.open(message, '_blank')}
            />
          </div>
        </div>
      );
    } else if (type === 'system') {
      return (
        <div className="text-center py-2 px-4 text-sm text-gray-500 bg-gray-100 rounded-full mx-auto my-2">
          {message}
        </div>
      );
    }
    
    return <p>{message}</p>;
  };
  
  if (type === 'system') {
    return (
      <motion.div
        initial="initial"
        animate="animate"
        variants={messageVariants}
        className={`w-full flex justify-center ${className}`}
      >
        <div className="text-center py-2 px-4 text-sm text-gray-500 bg-gray-100 rounded-full mx-auto my-2">
          {message}
        </div>
      </motion.div>
    );
  }
  
  return (
    <motion.div
      initial="initial"
      animate="animate"
      variants={messageVariants}
      className={`mb-4 ${isCurrentUser ? 'text-right' : 'text-left'} ${className}`}
    >
      <div className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}>
        {!isCurrentUser && avatar && (
          <div className="ml-2 flex-shrink-0">
            {avatar ? (
              <img src={avatar} alt={username} className="w-8 h-8 rounded-full" />
            ) : (
              <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center text-gray-600 font-semibold text-sm">
                {username ? username.charAt(0).toUpperCase() : '?'}
              </div>
            )}
          </div>
        )}
        
        <div className={`${maxWidthStyle}`}>
          {!isCurrentUser && username && <div className="text-xs text-gray-500 mb-1">{username}</div>}
          
          <div className={`px-4 py-2 rounded-lg ${bubbleStyle}`}>
            {renderContent()}
          </div>
          
          <div className={`flex text-xs text-gray-500 mt-1 ${isCurrentUser ? 'justify-end' : 'justify-start'}`}>
            <span>{formattedTime}</span>
            {isCurrentUser && (
              <span className="flex items-center mr-2">
                {status === 'error' ? (
                  <button 
                    onClick={onRetry} 
                    className="flex items-center text-red-500 hover:text-red-700"
                  >
                    <span className="ml-1">فشل الإرسال، أعد المحاولة</span>
                    {statusIcon.error}
                  </button>
                ) : (
                  statusIcon[status]
                )}
              </span>
            )}
          </div>
        </div>
        
        {isCurrentUser && avatar && (
          <div className="mr-2 flex-shrink-0">
            {avatar ? (
              <img src={avatar} alt="أنت" className="w-8 h-8 rounded-full" />
            ) : (
              <div className="w-8 h-8 bg-[var(--primary)] rounded-full flex items-center justify-center text-white font-semibold text-sm">
                {'أنت'.charAt(0)}
              </div>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
}

// دالة لتنسيق الوقت
function formatTime(timestamp: Date | string): string {
  const date = typeof timestamp === 'string' ? new Date(timestamp) : timestamp;
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  
  const isToday = date.getDate() === today.getDate() &&
                 date.getMonth() === today.getMonth() &&
                 date.getFullYear() === today.getFullYear();
  
  const isYesterday = date.getDate() === yesterday.getDate() &&
                     date.getMonth() === yesterday.getMonth() &&
                     date.getFullYear() === yesterday.getFullYear();
  
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  
  if (isToday) {
    return `${hours}:${minutes}`;
  } else if (isYesterday) {
    return `الأمس ${hours}:${minutes}`;
  } else {
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    return `${day}/${month} ${hours}:${minutes}`;
  }
}