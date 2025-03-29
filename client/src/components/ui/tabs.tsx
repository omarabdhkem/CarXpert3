import React, { useState, useEffect, ReactNode, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export interface TabItem {
  id: string;
  label: string | ReactNode;
  content: ReactNode;
  disabled?: boolean;
  icon?: ReactNode;
  badge?: string | number;
  badgeColor?: 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info';
}

export interface TabsProps {
  items: TabItem[];
  defaultTab?: string;
  activeTab?: string;
  onChange?: (id: string) => void;
  className?: string;
  tabClassName?: string;
  tabListClassName?: string;
  tabPanelClassName?: string;
  activeTabClassName?: string;
  disabledTabClassName?: string;
  orientation?: 'horizontal' | 'vertical';
  variant?: 'default' | 'pills' | 'underline' | 'enclosed' | 'enclosed-colored';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  animated?: boolean;
  persist?: boolean;
  storageKey?: string;
  lazy?: boolean;
  iconPosition?: 'left' | 'right' | 'top';
}

export function Tabs({
  items,
  defaultTab,
  activeTab: controlledActiveTab,
  onChange,
  className = '',
  tabClassName = '',
  tabListClassName = '',
  tabPanelClassName = '',
  activeTabClassName = '',
  disabledTabClassName = '',
  orientation = 'horizontal',
  variant = 'default',
  size = 'md',
  fullWidth = false,
  animated = true,
  persist = false,
  storageKey = 'tabs-state',
  lazy = true,
  iconPosition = 'left',
}: TabsProps) {
  // Get initial tab state from localStorage if persist is true
  const getInitialTab = () => {
    if (persist) {
      try {
        const storedTab = localStorage.getItem(storageKey);
        if (storedTab && items.find(item => item.id === storedTab)) {
          return storedTab;
        }
      } catch (error) {
        console.error('Error reading tabs state from localStorage:', error);
      }
    }
    return defaultTab || items[0]?.id;
  };

  const [activeTabState, setActiveTabState] = useState<string>(getInitialTab());
  const isControlled = controlledActiveTab !== undefined;
  const activeTabId = isControlled ? controlledActiveTab : activeTabState;

  // Handle tab changes
  const handleTabChange = (id: string) => {
    const item = items.find(item => item.id === id);
    if (item?.disabled) return;

    if (!isControlled) {
      setActiveTabState(id);
    }

    if (persist) {
      try {
        localStorage.setItem(storageKey, id);
      } catch (error) {
        console.error('Error storing tabs state to localStorage:', error);
      }
    }

    if (onChange) {
      onChange(id);
    }
  };

  // Track rendered tabs for lazy loading
  const [renderedTabs, setRenderedTabs] = useState<string[]>([activeTabId]);

  // Add current tab to rendered tabs if not already there
  useEffect(() => {
    if (!renderedTabs.includes(activeTabId)) {
      setRenderedTabs(prev => [...prev, activeTabId]);
    }
  }, [activeTabId, renderedTabs]);

  // Variant classes
  const getVariantClasses = () => {
    const variants = {
      default: {
        container: '',
        tabList: 'border-b border-gray-200',
        tab: 'border-transparent hover:border-gray-300 border-b-2 -mb-px',
        activeTab: 'border-[var(--primary)] text-[var(--primary)] font-medium',
      },
      pills: {
        container: '',
        tabList: '',
        tab: 'rounded-md',
        activeTab: 'bg-[var(--primary)] text-white font-medium',
      },
      underline: {
        container: '',
        tabList: '',
        tab: 'border-b-2 border-transparent',
        activeTab: 'border-[var(--primary)] text-[var(--primary)] font-medium',
      },
      enclosed: {
        container: '',
        tabList: 'border-b border-gray-200',
        tab: 'border border-transparent border-b-0 rounded-t-md',
        activeTab: 'border-gray-200 border-b-white bg-white font-medium',
      },
      'enclosed-colored': {
        container: '',
        tabList: 'border-b border-gray-200',
        tab: 'border border-transparent border-b-0 rounded-t-md',
        activeTab: 'border-[var(--primary)] border-b-white bg-white text-[var(--primary)] font-medium',
      },
    };

    return variants[variant];
  };

  // Size classes
  const getSizeClasses = () => {
    const sizes = {
      sm: 'text-sm py-1 px-2',
      md: 'text-base py-2 px-3',
      lg: 'text-lg py-3 px-4',
    };

    return sizes[size];
  };

  // Orientation classes
  const getOrientationClasses = () => {
    return orientation === 'horizontal'
      ? 'flex-row'
      : 'flex-col';
  };

  // Apply classes
  const variantClasses = getVariantClasses();
  const sizeClasses = getSizeClasses();
  const orientationClasses = getOrientationClasses();

  const containerClasses = `
    ${className}
  `;

  const tabListClasses = `
    flex ${orientationClasses} ${variantClasses.tabList}
    ${fullWidth && orientation === 'horizontal' ? 'w-full' : ''}
    ${tabListClassName}
  `;

  const getTabClasses = (item: TabItem) => {
    const isActive = activeTabId === item.id;
    const isDisabled = item.disabled;

    const baseClasses = `
      ${sizeClasses}
      transition-colors
      outline-none
      focus:ring-2 focus:ring-[var(--primary)] focus:ring-opacity-50
      ${iconPosition === 'top' ? 'flex flex-col items-center' : 'flex items-center'}
      ${fullWidth && orientation === 'horizontal' ? 'flex-1 text-center justify-center' : ''}
      ${variantClasses.tab}
      ${tabClassName}
    `;

    if (isDisabled) {
      return `
        ${baseClasses}
        opacity-50 cursor-not-allowed
        ${disabledTabClassName}
      `;
    }

    if (isActive) {
      return `
        ${baseClasses}
        ${variantClasses.activeTab}
        ${activeTabClassName}
      `;
    }

    return `
      ${baseClasses}
      hover:text-gray-700
    `;
  };

  const tabPanelClasses = `
    ${tabPanelClassName}
    ${orientation === 'vertical' ? 'flex-1' : ''}
    py-4
  `;

  // Animation variants
  const contentVariants = {
    hidden: { opacity: 0, x: orientation === 'horizontal' ? 10 : 0, y: orientation === 'vertical' ? 10 : 0 },
    visible: { opacity: 1, x: 0, y: 0, transition: { duration: 0.3 } },
    exit: { opacity: 0, x: orientation === 'horizontal' ? -10 : 0, y: orientation === 'vertical' ? -10 : 0, transition: { duration: 0.2 } },
  };

  // Get active tab content
  const activeTab = items.find(item => item.id === activeTabId);

  // For vertical orientation, create a container div
  const containerStyle = orientation === 'vertical'
    ? { display: 'flex', flexDirection: 'row' as 'row', gap: '1rem' }
    : {};

  const badgeColors = {
    primary: 'bg-blue-100 text-blue-800',
    secondary: 'bg-gray-100 text-gray-800',
    success: 'bg-green-100 text-green-800',
    danger: 'bg-red-100 text-red-800',
    warning: 'bg-yellow-100 text-yellow-800',
    info: 'bg-cyan-100 text-cyan-800',
  };

  return (
    <div className={containerClasses} style={containerStyle}>
      <div className={tabListClasses} role="tablist" aria-orientation={orientation}>
        {items.map(item => (
          <button
            key={item.id}
            role="tab"
            aria-selected={activeTabId === item.id}
            aria-disabled={item.disabled}
            aria-controls={`panel-${item.id}`}
            id={`tab-${item.id}`}
            className={getTabClasses(item)}
            onClick={() => handleTabChange(item.id)}
            disabled={item.disabled}
            tabIndex={activeTabId === item.id ? 0 : -1}
          >
            {/* Icon at the top */}
            {item.icon && iconPosition === 'top' && (
              <span className="mb-1">{item.icon}</span>
            )}
            
            {/* Icon at the left */}
            {item.icon && iconPosition === 'left' && (
              <span className="ml-2">{item.icon}</span>
            )}
            
            {/* Label */}
            <span>{item.label}</span>
            
            {/* Badge */}
            {item.badge && (
              <span className={`ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                badgeColors[item.badgeColor || 'primary']
              }`}>
                {item.badge}
              </span>
            )}
            
            {/* Icon at the right */}
            {item.icon && iconPosition === 'right' && (
              <span className="mr-2">{item.icon}</span>
            )}
          </button>
        ))}
      </div>

      <div className={tabPanelClasses}>
        {animated ? (
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTabId}
              initial="hidden"
              animate="visible"
              exit="exit"
              variants={contentVariants}
              role="tabpanel"
              aria-labelledby={`tab-${activeTabId}`}
              id={`panel-${activeTabId}`}
            >
              {activeTab?.content}
            </motion.div>
          </AnimatePresence>
        ) : (
          <div
            role="tabpanel"
            aria-labelledby={`tab-${activeTabId}`}
            id={`panel-${activeTabId}`}
          >
            {lazy
              ? items
                  .filter(item => renderedTabs.includes(item.id))
                  .map(item => (
                    <div key={item.id} style={{ display: activeTabId === item.id ? 'block' : 'none' }}>
                      {item.content}
                    </div>
                  ))
              : items.map(item => (
                  <div key={item.id} style={{ display: activeTabId === item.id ? 'block' : 'none' }}>
                    {item.content}
                  </div>
                ))}
          </div>
        )}
      </div>
    </div>
  );
}

export interface TabProps {
  children: ReactNode;
  className?: string;
  active?: boolean;
  disabled?: boolean;
  icon?: ReactNode;
  badge?: string | number;
  badgeColor?: 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info';
  onClick?: () => void;
}

export function Tab({ 
  children, 
  className = '', 
  active = false, 
  disabled = false,
  icon,
  badge,
  badgeColor = 'primary',
  onClick
}: TabProps) {
  const badgeColors = {
    primary: 'bg-blue-100 text-blue-800',
    secondary: 'bg-gray-100 text-gray-800',
    success: 'bg-green-100 text-green-800',
    danger: 'bg-red-100 text-red-800',
    warning: 'bg-yellow-100 text-yellow-800',
    info: 'bg-cyan-100 text-cyan-800',
  };

  const classes = `
    inline-flex items-center px-3 py-2 border-b-2 text-sm font-medium
    ${active 
      ? 'border-[var(--primary)] text-[var(--primary)]' 
      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}
    ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
    ${className}
  `;

  return (
    <button 
      className={classes} 
      onClick={onClick}
      disabled={disabled}
      role="tab"
      aria-selected={active}
      aria-disabled={disabled}
    >
      {icon && <span className="ml-2">{icon}</span>}
      {children}
      {badge && (
        <span className={`ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
          badgeColors[badgeColor]
        }`}>
          {badge}
        </span>
      )}
    </button>
  );
}

export interface TabPanelProps {
  children: ReactNode;
  className?: string;
}

export function TabPanel({ children, className = '' }: TabPanelProps) {
  return (
    <div className={`py-4 ${className}`} role="tabpanel">
      {children}
    </div>
  );
}

export interface TabsContextProps {
  activeTab: string;
  setActiveTab: (id: string) => void;
}

export const TabsContext = React.createContext<TabsContextProps>({
  activeTab: '',
  setActiveTab: () => {},
});

export interface TabsProviderProps {
  children: ReactNode;
  defaultTab: string;
  onChange?: (id: string) => void;
}

export function TabsProvider({ children, defaultTab, onChange }: TabsProviderProps) {
  const [activeTab, setActiveTab] = useState(defaultTab);

  const handleTabChange = (id: string) => {
    setActiveTab(id);
    if (onChange) {
      onChange(id);
    }
  };

  return (
    <TabsContext.Provider value={{ activeTab, setActiveTab: handleTabChange }}>
      {children}
    </TabsContext.Provider>
  );
}

export function useTabsContext() {
  const context = React.useContext(TabsContext);
  if (context === undefined) {
    throw new Error('useTabsContext must be used within a TabsProvider');
  }
  return context;
}