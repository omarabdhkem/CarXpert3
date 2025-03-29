import React, { useState, useRef, useEffect, ReactNode } from 'react';
import { ChevronDown } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

export interface CollapsibleProps {
  trigger: ReactNode;
  children: ReactNode;
  defaultOpen?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  disabled?: boolean;
  className?: string;
  triggerClassName?: string;
  contentClassName?: string;
  icon?: ReactNode;
  hideIcon?: boolean;
  triggerTag?: 'div' | 'button' | 'h2' | 'h3' | 'h4';
  persisted?: boolean;
  storageKey?: string;
  transitionDuration?: number;
}

export function Collapsible({
  trigger,
  children,
  defaultOpen = false,
  open: controlledOpen,
  onOpenChange,
  disabled = false,
  className = '',
  triggerClassName = '',
  contentClassName = '',
  icon,
  hideIcon = false,
  triggerTag: TriggerTag = 'div',
  persisted = false,
  storageKey = 'collapsible-state',
  transitionDuration = 0.3,
}: CollapsibleProps) {
  // Get initial open state from localStorage if persisted
  const getInitialState = () => {
    if (persisted) {
      try {
        const stored = localStorage.getItem(storageKey);
        if (stored !== null) {
          return JSON.parse(stored);
        }
      } catch (error) {
        console.error('Error parsing persisted collapsible state:', error);
      }
    }
    return defaultOpen;
  };

  const [isOpenState, setIsOpenState] = useState(getInitialState());
  const isControlled = controlledOpen !== undefined;
  const isOpen = isControlled ? controlledOpen : isOpenState;

  const contentRef = useRef<HTMLDivElement>(null);
  const [contentHeight, setContentHeight] = useState<number | 'auto'>(0);

  // Measure content height when open or when content changes
  useEffect(() => {
    if (contentRef.current && isOpen) {
      setContentHeight(contentRef.current.scrollHeight);
      
      // Reset to auto height after transition to handle content changes
      const timer = setTimeout(() => {
        setContentHeight('auto');
      }, transitionDuration * 1000);
      
      return () => clearTimeout(timer);
    } else {
      setContentHeight(0);
    }
  }, [isOpen, children, transitionDuration]);

  // Handle controlled state changes
  useEffect(() => {
    if (isControlled && onOpenChange) {
      onOpenChange(isOpen);
    }
  }, [isControlled, isOpen, onOpenChange]);

  // Persist state to localStorage if enabled
  useEffect(() => {
    if (persisted && !isControlled) {
      localStorage.setItem(storageKey, JSON.stringify(isOpenState));
    }
  }, [persisted, storageKey, isOpenState, isControlled]);

  const handleToggle = () => {
    if (disabled) return;
    
    const newOpenState = !isOpen;
    
    if (!isControlled) {
      setIsOpenState(newOpenState);
    }
    
    if (onOpenChange) {
      onOpenChange(newOpenState);
    }
  };

  const contentStyles = {
    height: contentHeight === 'auto' ? 'auto' : `${contentHeight}px`,
    overflow: 'hidden',
    transition: `height ${transitionDuration}s ease-in-out`,
  };

  const triggerProps = {
    onClick: handleToggle,
    className: `
      flex items-center justify-between w-full cursor-pointer select-none
      ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
      ${triggerClassName}
    `,
    'aria-expanded': isOpen,
    'aria-disabled': disabled,
  };

  const containerClasses = `
    ${className}
  `;

  const contentClasses = `
    ${contentClassName}
  `;

  return (
    <div className={containerClasses}>
      <TriggerTag {...triggerProps}>
        {trigger}
        {!hideIcon && (
          icon || (
            <ChevronDown
              className={`w-5 h-5 transition-transform ${isOpen ? 'rotate-180' : ''}`}
            />
          )
        )}
      </TriggerTag>
      <div style={contentStyles}>
        <div ref={contentRef} className={contentClasses}>
          {children}
        </div>
      </div>
    </div>
  );
}

export interface CollapsibleGroupProps {
  children: ReactNode[];
  allowMultiple?: boolean;
  defaultOpenIndexes?: number[];
  onChange?: (openIndexes: number[]) => void;
  className?: string;
}

export function CollapsibleGroup({
  children,
  allowMultiple = false,
  defaultOpenIndexes = [],
  onChange,
  className = '',
}: CollapsibleGroupProps) {
  const [openIndexes, setOpenIndexes] = useState<number[]>(defaultOpenIndexes);

  const handleOpenChange = (index: number, isOpen: boolean) => {
    let newOpenIndexes: number[];

    if (isOpen) {
      newOpenIndexes = allowMultiple
        ? [...openIndexes, index]
        : [index];
    } else {
      newOpenIndexes = openIndexes.filter(i => i !== index);
    }

    setOpenIndexes(newOpenIndexes);
    
    if (onChange) {
      onChange(newOpenIndexes);
    }
  };

  return (
    <div className={className}>
      {React.Children.map(children, (child, index) => {
        if (!React.isValidElement(child)) return child;
        
        return React.cloneElement(child, {
          open: openIndexes.includes(index),
          onOpenChange: (isOpen: boolean) => handleOpenChange(index, isOpen),
        });
      })}
    </div>
  );
}

export function CollapsibleTrigger({
  children,
  className = '',
  onClick,
}: {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
}) {
  return (
    <div
      className={`flex items-center justify-between w-full cursor-pointer ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  );
}

export function CollapsibleContent({
  children,
  className = '',
}: {
  children: ReactNode;
  className?: string;
}) {
  return <div className={className}>{children}</div>;
}

export function CollapsibleFAQ({
  question,
  answer,
  defaultOpen = false,
  className = '',
}: {
  question: string;
  answer: string | ReactNode;
  defaultOpen?: boolean;
  className?: string;
}) {
  return (
    <Collapsible
      trigger={<h3 className="text-lg font-medium">{question}</h3>}
      defaultOpen={defaultOpen}
      className={`border-b border-gray-200 py-4 ${className}`}
      contentClassName="pt-2 pb-1 text-gray-600"
    >
      {typeof answer === 'string' ? <p>{answer}</p> : answer}
    </Collapsible>
  );
}