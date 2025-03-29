import React, { useState, useRef, useEffect, ReactNode } from 'react';
import { Link, useLocation } from 'wouter';
import { ChevronDown } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

export interface MenuItem {
  label: string;
  href?: string;
  items?: MenuItem[];
  onClick?: () => void;
  icon?: ReactNode;
  disabled?: boolean;
  highlight?: boolean;
}

export interface MenubarProps {
  items: MenuItem[];
  className?: string;
  variant?: 'default' | 'subtle' | 'ghost' | 'underline';
  size?: 'sm' | 'md' | 'lg';
  activeClassName?: string;
  dropdownClassName?: string;
  itemClassName?: string;
  dropdownItemClassName?: string;
  orientation?: 'horizontal' | 'vertical';
}

export function Menubar({
  items,
  className = '',
  variant = 'default',
  size = 'md',
  activeClassName = '',
  dropdownClassName = '',
  itemClassName = '',
  dropdownItemClassName = '',
  orientation = 'horizontal',
}: MenubarProps) {
  const [location] = useLocation();
  const [openMenus, setOpenMenus] = useState<{ [key: number]: boolean }>({});
  const menuRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Reset open menus when clicking outside
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (
        menuRefs.current.every((ref) => ref && !ref.contains(e.target as Node))
      ) {
        setOpenMenus({});
      }
    };

    document.addEventListener('click', handleOutsideClick);
    return () => {
      document.removeEventListener('click', handleOutsideClick);
    };
  }, []);

  // Handle menu toggle
  const toggleMenu = (index: number) => {
    setOpenMenus((prev) => ({
      ...Object.keys(prev).reduce((acc, key) => ({ ...acc, [key]: false }), {}),
      [index]: !prev[index],
    }));
  };

  // Close all menus
  const closeAllMenus = () => {
    setOpenMenus({});
  };

  // Generate classes based on variant and size
  const getVariantClass = () => {
    const variants = {
      default: 'border border-gray-200 bg-white shadow-sm',
      subtle: 'bg-transparent',
      ghost: 'bg-transparent',
      underline: 'border-b border-gray-200',
    };

    return variants[variant];
  };

  const getSizeClass = () => {
    const sizes = {
      sm: 'text-sm',
      md: 'text-base',
      lg: 'text-lg',
    };

    return sizes[size];
  };

  const getOrientationClass = () => {
    return orientation === 'horizontal'
      ? 'flex-row items-center'
      : 'flex-col items-start';
  };

  const menubarClasses = `
    flex ${getOrientationClass()} ${getVariantClass()} ${getSizeClass()} rounded-md
    ${className}
  `;

  const menuItemClasses = `
    relative px-4 py-2 
    ${orientation === 'horizontal' ? 'inline-flex items-center' : 'flex items-center w-full'}
    transition-colors
    ${variant === 'ghost' ? 'hover:bg-gray-100' : 'hover:bg-gray-50'}
    rounded-md
    ${itemClassName}
  `;

  const activeItemClasses = `
    ${menuItemClasses}
    text-[var(--primary)] font-medium
    ${activeClassName}
  `;

  const dropdownMenuClasses = `
    absolute top-full mt-1 z-10
    ${orientation === 'horizontal' ? 'right-0' : 'left-full top-0 mr-1 mt-0'}
    min-w-[200px] py-1 bg-white rounded-md shadow-lg border border-gray-200
    ${dropdownClassName}
  `;

  const dropdownItemClasses = `
    block w-full text-right px-4 py-2 text-sm text-gray-700
    hover:bg-gray-50 transition-colors
    ${dropdownItemClassName}
  `;

  // Animation variants for dropdown
  const dropdownVariants = {
    hidden: { opacity: 0, y: -5, scale: 0.95 },
    visible: { opacity: 1, y: 0, scale: 1 },
  };

  return (
    <nav className={menubarClasses}>
      {items.map((item, index) => (
        <div
          key={index}
          ref={(el) => (menuRefs.current[index] = el)}
          className="relative"
        >
          {item.href ? (
            <Link href={item.href}>
              <a
                className={
                  location === item.href ? activeItemClasses : menuItemClasses
                }
                onClick={closeAllMenus}
              >
                {item.icon && <span className="ml-2">{item.icon}</span>}
                <span>{item.label}</span>
              </a>
            </Link>
          ) : item.items ? (
            <div
              className={`${menuItemClasses} cursor-pointer ${
                openMenus[index] ? 'bg-gray-50' : ''
              } ${item.disabled ? 'opacity-50 pointer-events-none' : ''} ${
                item.highlight ? 'text-[var(--primary)] font-medium' : ''
              }`}
              onClick={() => !item.disabled && toggleMenu(index)}
            >
              {item.icon && <span className="ml-2">{item.icon}</span>}
              <span>{item.label}</span>
              <ChevronDown
                className={`h-4 w-4 mr-1 transition-transform ${
                  openMenus[index] ? 'rotate-180' : ''
                }`}
              />

              <AnimatePresence>
                {openMenus[index] && (
                  <motion.div
                    initial="hidden"
                    animate="visible"
                    exit="hidden"
                    variants={dropdownVariants}
                    transition={{ duration: 0.2 }}
                    className={dropdownMenuClasses}
                  >
                    {item.items.map((subItem, subIndex) => (
                      <div key={subIndex}>
                        {subItem.href ? (
                          <Link href={subItem.href}>
                            <a
                              className={`${dropdownItemClasses} ${
                                subItem.disabled
                                  ? 'opacity-50 pointer-events-none'
                                  : ''
                              } ${
                                subItem.highlight
                                  ? 'text-[var(--primary)] font-medium'
                                  : ''
                              }`}
                              onClick={closeAllMenus}
                            >
                              <div className="flex items-center">
                                {subItem.icon && (
                                  <span className="ml-2">{subItem.icon}</span>
                                )}
                                <span>{subItem.label}</span>
                              </div>
                            </a>
                          </Link>
                        ) : (
                          <button
                            className={`${dropdownItemClasses} text-right ${
                              subItem.disabled
                                ? 'opacity-50 pointer-events-none'
                                : ''
                            } ${
                              subItem.highlight
                                ? 'text-[var(--primary)] font-medium'
                                : ''
                            }`}
                            onClick={() => {
                              closeAllMenus();
                              subItem.onClick && subItem.onClick();
                            }}
                            disabled={subItem.disabled}
                          >
                            <div className="flex items-center">
                              {subItem.icon && (
                                <span className="ml-2">{subItem.icon}</span>
                              )}
                              <span>{subItem.label}</span>
                            </div>
                          </button>
                        )}
                      </div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <button
              className={`${menuItemClasses} ${
                item.disabled ? 'opacity-50 pointer-events-none' : ''
              } ${
                item.highlight ? 'text-[var(--primary)] font-medium' : ''
              }`}
              onClick={() => {
                closeAllMenus();
                item.onClick && item.onClick();
              }}
              disabled={item.disabled}
            >
              {item.icon && <span className="ml-2">{item.icon}</span>}
              <span>{item.label}</span>
            </button>
          )}
        </div>
      ))}
    </nav>
  );
}

export function MenubarItem({
  children,
  className = '',
  active = false,
  disabled = false,
  highlight = false,
  onClick,
}: {
  children: ReactNode;
  className?: string;
  active?: boolean;
  disabled?: boolean;
  highlight?: boolean;
  onClick?: () => void;
}) {
  const baseClasses = 'px-4 py-2 inline-flex items-center transition-colors rounded-md';
  const activeClasses = 'text-[var(--primary)] font-medium';
  const disabledClasses = 'opacity-50 pointer-events-none';
  const highlightClasses = 'text-[var(--primary)] font-medium';

  const classes = `
    ${baseClasses}
    ${active ? activeClasses : 'hover:bg-gray-50'}
    ${disabled ? disabledClasses : ''}
    ${highlight ? highlightClasses : ''}
    ${className}
  `;

  return (
    <button className={classes} onClick={onClick} disabled={disabled}>
      {children}
    </button>
  );
}

export function MenubarSeparator({ className = '' }: { className?: string }) {
  return <div className={`border-r border-gray-200 h-5 mx-1 ${className}`} />;
}

export function MenubarGroup({
  children,
  className = '',
}: {
  children: ReactNode;
  className?: string;
}) {
  return <div className={`flex items-center ${className}`}>{children}</div>;
}

export function MenubarLabel({
  children,
  className = '',
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <span className={`text-sm text-gray-500 mx-3 ${className}`}>{children}</span>
  );
}