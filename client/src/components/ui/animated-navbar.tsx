import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'wouter';
import { motion, AnimatePresence } from 'framer-motion';
import AnimatedButton from '@/components/ui/animated-button';
import { translations } from '@/i18n';

// ترجمات باللغة العربية
const t = translations.ar;

interface NavItem {
  label: string;
  href: string;
  children?: NavItem[];
}

interface AnimatedNavbarProps {
  className?: string;
  logo?: React.ReactNode;
  items?: NavItem[];
  isAuthenticated?: boolean;
  userAvatar?: string;
  userName?: string;
  onLogout?: () => void;
}

export default function AnimatedNavbar({
  className = '',
  logo,
  items = [],
  isAuthenticated = false,
  userAvatar,
  userName = 'المستخدم',
  onLogout,
}: AnimatedNavbarProps) {
  const [location] = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [scrolled, setScrolled] = useState(false);
  
  // مراقبة التمرير لتغيير مظهر الشريط
  useEffect(() => {
    const handleScroll = () => {
      const offset = window.scrollY;
      if (offset > 50) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);
  
  // إغلاق القائمة المنسدلة عند النقر خارجها
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (openDropdown && !(event.target as HTMLElement).closest('.dropdown-container')) {
        setOpenDropdown(null);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [openDropdown]);
  
  const toggleDropdown = (label: string) => {
    if (openDropdown === label) {
      setOpenDropdown(null);
    } else {
      setOpenDropdown(label);
    }
  };
  
  const closeMenu = () => {
    setIsMenuOpen(false);
    setOpenDropdown(null);
  };
  
  // تأثيرات حركة القائمة المحمولة
  const mobileMenuVariants = {
    closed: {
      x: '100%',
      opacity: 0,
      transition: {
        type: 'spring',
        stiffness: 400,
        damping: 40,
      },
    },
    open: {
      x: 0,
      opacity: 1,
      transition: {
        type: 'spring',
        stiffness: 400,
        damping: 40,
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };
  
  const mobileItemVariants = {
    closed: { x: 50, opacity: 0 },
    open: { x: 0, opacity: 1 },
  };
  
  // تأثيرات حركة القائمة المنسدلة
  const dropdownVariants = {
    hidden: { opacity: 0, y: -10, scale: 0.95 },
    visible: { opacity: 1, y: 0, scale: 1 },
  };
  
  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${scrolled ? 'bg-white shadow-md py-2' : 'bg-white/80 backdrop-blur-md py-4'} ${className}`}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between">
          {/* الشعار */}
          <Link href="/">
            <a className="flex items-center">
              {logo || (
                <motion.span 
                  className="text-xl font-bold text-[var(--primary)]"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Car<span className="text-[var(--accent)]">Xpert</span>
                </motion.span>
              )}
            </a>
          </Link>
          
          {/* القائمة الرئيسية - للشاشات الكبيرة */}
          <nav className="hidden md:flex items-center space-x-6 space-x-reverse">
            {items.map((item) => (
              <div key={item.label} className="relative dropdown-container">
                {item.children ? (
                  <>
                    <button
                      onClick={() => toggleDropdown(item.label)}
                      className={`flex items-center px-1 py-2 text-sm font-medium ${
                        location === item.href || openDropdown === item.label
                          ? 'text-[var(--primary)]'
                          : 'text-gray-700 hover:text-[var(--primary)]'
                      } transition-colors`}
                    >
                      {item.label}
                      <svg
                        className={`ml-1 w-4 h-4 transition-transform ${
                          openDropdown === item.label ? 'rotate-180' : ''
                        }`}
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </button>
                    
                    <AnimatePresence>
                      {openDropdown === item.label && (
                        <motion.div
                          initial="hidden"
                          animate="visible"
                          exit="hidden"
                          variants={dropdownVariants}
                          transition={{ duration: 0.2 }}
                          className="absolute right-0 mt-1 w-48 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-10"
                        >
                          <div className="py-1">
                            {item.children.map((child) => (
                              <Link key={child.label} href={child.href}>
                                <a
                                  onClick={closeMenu}
                                  className={`block px-4 py-2 text-sm ${
                                    location === child.href
                                      ? 'bg-gray-100 text-[var(--primary)]'
                                      : 'text-gray-700 hover:bg-gray-50'
                                  }`}
                                >
                                  {child.label}
                                </a>
                              </Link>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </>
                ) : (
                  <Link href={item.href}>
                    <a
                      className={`px-1 py-2 text-sm font-medium ${
                        location === item.href
                          ? 'text-[var(--primary)]'
                          : 'text-gray-700 hover:text-[var(--primary)]'
                      } transition-colors`}
                    >
                      {item.label}
                    </a>
                  </Link>
                )}
              </div>
            ))}
          </nav>
          
          {/* زر تسجيل الدخول / معلومات المستخدم */}
          <div className="hidden md:flex items-center space-x-4 space-x-reverse">
            {isAuthenticated ? (
              <div className="relative dropdown-container">
                <button
                  onClick={() => toggleDropdown('user')}
                  className="flex items-center space-x-2 space-x-reverse"
                >
                  <div className="flex items-center">
                    {userAvatar ? (
                      <img
                        src={userAvatar}
                        alt="Profile"
                        className="w-8 h-8 rounded-full"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-[var(--primary)] text-white flex items-center justify-center text-sm font-medium">
                        {userName.charAt(0)}
                      </div>
                    )}
                    <span className="ml-2 text-sm font-medium text-gray-700">
                      {userName}
                    </span>
                  </div>
                  <svg
                    className={`w-4 h-4 transition-transform ${
                      openDropdown === 'user' ? 'rotate-180' : ''
                    }`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>
                
                <AnimatePresence>
                  {openDropdown === 'user' && (
                    <motion.div
                      initial="hidden"
                      animate="visible"
                      exit="hidden"
                      variants={dropdownVariants}
                      transition={{ duration: 0.2 }}
                      className="absolute left-0 mt-2 w-48 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-10"
                    >
                      <div className="py-1">
                        <Link href="/profile">
                          <a className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                            {t.common.profile}
                          </a>
                        </Link>
                        <Link href="/favorites">
                          <a className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                            {t.common.favorite}
                          </a>
                        </Link>
                        <Link href="/settings">
                          <a className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                            {t.common.settings}
                          </a>
                        </Link>
                        <button
                          onClick={() => {
                            closeMenu();
                            onLogout && onLogout();
                          }}
                          className="block w-full text-right px-4 py-2 text-sm text-red-600 hover:bg-gray-50"
                        >
                          {t.common.logout}
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <>
                <Link href="/auth">
                  <a className="text-sm font-medium text-gray-700 hover:text-[var(--primary)] transition-colors">
                    {t.common.login}
                  </a>
                </Link>
                <Link href="/auth">
                  <div>
                    <AnimatedButton variant="primary" size="sm">
                      {t.common.register}
                    </AnimatedButton>
                  </div>
                </Link>
              </>
            )}
          </div>
          
          {/* زر القائمة للجوال */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100 focus:outline-none"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d={isMenuOpen ? 'M6 18L18 6M6 6l12 12' : 'M4 6h16M4 12h16M4 18h16'}
              />
            </svg>
          </button>
        </div>
      </div>
      
      {/* قائمة الجوال */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial="closed"
            animate="open"
            exit="closed"
            variants={mobileMenuVariants}
            className="fixed inset-0 z-50 md:hidden"
          >
            <div className="absolute inset-0 bg-black/50" onClick={closeMenu} />
            
            <motion.div className="absolute left-0 top-0 h-full w-3/4 max-w-xs bg-white shadow-xl overflow-y-auto">
              <div className="p-6 border-b">
                <div className="flex items-center justify-between">
                  <Link href="/">
                    <a className="flex items-center" onClick={closeMenu}>
                      <span className="text-xl font-bold text-[var(--primary)]">
                        Car<span className="text-[var(--accent)]">Xpert</span>
                      </span>
                    </a>
                  </Link>
                  
                  <button
                    onClick={closeMenu}
                    className="p-2 rounded-full text-gray-500 hover:text-gray-700 hover:bg-gray-100 focus:outline-none"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>
              </div>
              
              <nav className="p-6 space-y-4">
                {isAuthenticated && (
                  <motion.div
                    variants={mobileItemVariants}
                    className="flex items-center p-3 bg-gray-50 rounded-lg mb-6"
                  >
                    {userAvatar ? (
                      <img
                        src={userAvatar}
                        alt="Profile"
                        className="w-10 h-10 rounded-full ml-3"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-[var(--primary)] text-white flex items-center justify-center font-medium ml-3">
                        {userName.charAt(0)}
                      </div>
                    )}
                    <div>
                      <div className="font-medium">{userName}</div>
                      <Link href="/profile">
                        <a className="text-sm text-[var(--primary)]" onClick={closeMenu}>
                          عرض الملف الشخصي
                        </a>
                      </Link>
                    </div>
                  </motion.div>
                )}
                
                {items.map((item) => (
                  <div key={item.label}>
                    {item.children ? (
                      <motion.div variants={mobileItemVariants} className="py-1">
                        <button
                          onClick={() => toggleDropdown(item.label)}
                          className="flex items-center justify-between w-full p-2 rounded-md hover:bg-gray-50"
                        >
                          <span className="font-medium">{item.label}</span>
                          <svg
                            className={`w-4 h-4 transition-transform ${
                              openDropdown === item.label ? 'rotate-180' : ''
                            }`}
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 9l-7 7-7-7"
                            />
                          </svg>
                        </button>
                        
                        <AnimatePresence>
                          {openDropdown === item.label && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.2 }}
                              className="overflow-hidden"
                            >
                              <div className="pr-4 pl-2 py-2 space-y-2 border-r-2 border-gray-100 mr-2">
                                {item.children.map((child) => (
                                  <Link key={child.label} href={child.href}>
                                    <a
                                      onClick={closeMenu}
                                      className="block p-2 rounded-md text-gray-600 hover:bg-gray-50"
                                    >
                                      {child.label}
                                    </a>
                                  </Link>
                                ))}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </motion.div>
                    ) : (
                      <motion.div variants={mobileItemVariants}>
                        <Link href={item.href}>
                          <a
                            onClick={closeMenu}
                            className={`block p-2 rounded-md ${
                              location === item.href
                                ? 'bg-[var(--primary-light)] text-[var(--primary)]'
                                : 'hover:bg-gray-50'
                            }`}
                          >
                            {item.label}
                          </a>
                        </Link>
                      </motion.div>
                    )}
                  </div>
                ))}
                
                {!isAuthenticated && (
                  <motion.div variants={mobileItemVariants} className="pt-4 border-t mt-6">
                    <Link href="/auth">
                      <div className="w-full">
                        <AnimatedButton variant="primary" fullWidth>
                          {t.common.login} / {t.common.register}
                        </AnimatedButton>
                      </div>
                    </Link>
                  </motion.div>
                )}
                
                {isAuthenticated && (
                  <motion.div variants={mobileItemVariants} className="pt-4 border-t mt-6">
                    <button
                      onClick={() => {
                        closeMenu();
                        onLogout && onLogout();
                      }}
                      className="w-full p-2 rounded-md text-red-600 hover:bg-red-50 flex items-center"
                    >
                      <svg className="w-5 h-5 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                        />
                      </svg>
                      {t.common.logout}
                    </button>
                  </motion.div>
                )}
              </nav>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}