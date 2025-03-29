import React, { useState, useRef, useEffect, ReactNode, ChangeEvent, KeyboardEvent } from 'react';
import { Search, X, ChevronDown, Filter, Sliders, Mic, Camera, Clock } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { Drawer } from './drawer';

export interface SearchOption {
  id: string;
  label: string;
  value: string;
  icon?: ReactNode;
  group?: string;
}

export interface SearchBoxProps {
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
  onSearch?: (value: string) => void;
  onClear?: () => void;
  onOptionSelect?: (option: SearchOption) => void;
  className?: string;
  inputClassName?: string;
  iconClassName?: string;
  options?: SearchOption[];
  loading?: boolean;
  clearOnSelect?: boolean;
  autoFocus?: boolean;
  showSearchButton?: boolean;
  showClearButton?: boolean;
  searchButtonText?: string;
  searchButtonClassName?: string;
  recentSearches?: string[];
  onRecentSearchSelect?: (search: string) => void;
  maxRecentSearches?: number;
  filters?: SearchFilter[];
  onFilterChange?: (filters: Record<string, string | string[]>) => void;
  showVoiceSearch?: boolean;
  onVoiceSearchClick?: () => void;
  showImageSearch?: boolean;
  onImageSearchClick?: () => void;
  disabled?: boolean;
  disableDropdown?: boolean;
  renderOption?: (option: SearchOption) => ReactNode;
  filterComponent?: ReactNode;
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  variant?: 'default' | 'filled' | 'outlined';
  shape?: 'default' | 'rounded' | 'pill';
}

export interface SearchFilter {
  id: string;
  label: string;
  type: 'select' | 'radio' | 'checkbox' | 'range' | 'text';
  options?: { label: string; value: string }[];
  defaultValue?: string | string[];
  placeholder?: string;
  min?: number;
  max?: number;
  step?: number;
}

export function SearchBox({
  placeholder = 'بحث...',
  value: controlledValue,
  onChange,
  onSearch,
  onClear,
  onOptionSelect,
  className = '',
  inputClassName = '',
  iconClassName = '',
  options = [],
  loading = false,
  clearOnSelect = true,
  autoFocus = false,
  showSearchButton = false,
  showClearButton = true,
  searchButtonText = 'بحث',
  searchButtonClassName = '',
  recentSearches = [],
  onRecentSearchSelect,
  maxRecentSearches = 5,
  filters = [],
  onFilterChange,
  showVoiceSearch = false,
  onVoiceSearchClick,
  showImageSearch = false,
  onImageSearchClick,
  disabled = false,
  disableDropdown = false,
  renderOption,
  filterComponent,
  size = 'md',
  fullWidth = false,
  variant = 'default',
  shape = 'default',
}: SearchBoxProps) {
  const [inputValue, setInputValue] = useState(controlledValue || '');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [activeOptionIndex, setActiveOptionIndex] = useState(-1);
  const [showFilters, setShowFilters] = useState(false);
  const [appliedFilters, setAppliedFilters] = useState<Record<string, string | string[]>>({});
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const isControlled = controlledValue !== undefined;
  const effectiveValue = isControlled ? controlledValue : inputValue;

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Auto focus
  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus();
    }
  }, [autoFocus]);

  // Handle input change
  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    if (!isControlled) {
      setInputValue(newValue);
    }
    
    onChange && onChange(newValue);
    
    if (newValue) {
      setIsDropdownOpen(true);
    } else {
      setIsDropdownOpen(false);
    }
    
    setActiveOptionIndex(-1);
  };

  // Handle search submit
  const handleSearchSubmit = () => {
    if (effectiveValue || Object.keys(appliedFilters).length > 0) {
      onSearch && onSearch(effectiveValue);
      setIsDropdownOpen(false);
    }
  };

  // Handle enter key
  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      if (activeOptionIndex >= 0 && activeOptionIndex < filteredOptions.length) {
        handleOptionSelect(filteredOptions[activeOptionIndex]);
      } else {
        handleSearchSubmit();
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveOptionIndex(prev => 
        prev < filteredOptions.length - 1 ? prev + 1 : prev
      );
      setIsDropdownOpen(true);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveOptionIndex(prev => (prev > 0 ? prev - 1 : prev));
    } else if (e.key === 'Escape') {
      setIsDropdownOpen(false);
    }
  };

  // Handle option select
  const handleOptionSelect = (option: SearchOption) => {
    onOptionSelect && onOptionSelect(option);
    
    if (clearOnSelect) {
      if (!isControlled) {
        setInputValue(option.label);
      }
      onChange && onChange(option.label);
    }
    
    setIsDropdownOpen(false);
  };

  // Handle search clear
  const handleClear = () => {
    if (!isControlled) {
      setInputValue('');
    }
    
    onChange && onChange('');
    onClear && onClear();
    
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  // Handle filter change
  const handleFilterChange = (id: string, value: string | string[]) => {
    const newFilters = { ...appliedFilters, [id]: value };
    
    // Remove empty filters
    if (Array.isArray(value) && value.length === 0 || value === '') {
      delete newFilters[id];
    }
    
    setAppliedFilters(newFilters);
    onFilterChange && onFilterChange(newFilters);
  };

  // Handle recent search select
  const handleRecentSearchSelect = (search: string) => {
    if (!isControlled) {
      setInputValue(search);
    }
    
    onChange && onChange(search);
    onRecentSearchSelect && onRecentSearchSelect(search);
    
    setIsDropdownOpen(false);
  };

  // Filter options based on input value
  const filteredOptions = options.filter(option => 
    option.label.toLowerCase().includes(effectiveValue.toLowerCase()) ||
    option.value.toLowerCase().includes(effectiveValue.toLowerCase())
  );

  // Group options
  const groupedOptions = filteredOptions.reduce((acc, option) => {
    const group = option.group || '';
    if (!acc[group]) {
      acc[group] = [];
    }
    acc[group].push(option);
    return acc;
  }, {} as Record<string, SearchOption[]>);

  // Show dropdown if we have options, recent searches, or filters
  const shouldShowDropdown = 
    !disableDropdown && 
    isDropdownOpen && 
    (filteredOptions.length > 0 || 
     (recentSearches.length > 0 && !effectiveValue) ||
     filters.length > 0);

  // Determine component sizing classes
  const sizeClasses = {
    sm: {
      container: 'h-8',
      input: 'text-sm',
      icon: 'h-4 w-4',
      button: 'text-xs px-2 py-1',
    },
    md: {
      container: 'h-10',
      input: 'text-base',
      icon: 'h-5 w-5',
      button: 'text-sm px-3 py-2',
    },
    lg: {
      container: 'h-12',
      input: 'text-lg',
      icon: 'h-6 w-6',
      button: 'text-base px-4 py-2',
    },
  };

  // Determine variant classes
  const variantClasses = {
    default: 'bg-white border border-gray-300 focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500',
    filled: 'bg-gray-100 border border-transparent focus-within:bg-white focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500',
    outlined: 'bg-transparent border border-gray-300 focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500',
  };

  // Determine shape classes
  const shapeClasses = {
    default: 'rounded-md',
    rounded: 'rounded-lg',
    pill: 'rounded-full',
  };

  // Combine classes
  const containerClasses = `
    relative flex items-center
    ${sizeClasses[size].container}
    ${variantClasses[variant]}
    ${shapeClasses[shape]}
    ${disabled ? 'opacity-60 cursor-not-allowed' : ''}
    ${fullWidth ? 'w-full' : ''}
    ${className}
  `;

  return (
    <div className={containerClasses}>
      {/* Search icon */}
      <div className="flex items-center justify-center absolute right-0 top-0 bottom-0 w-10 pointer-events-none">
        <Search className={`text-gray-400 ${sizeClasses[size].icon} ${iconClassName}`} />
      </div>

      {/* Input */}
      <input
        ref={inputRef}
        type="text"
        placeholder={placeholder}
        value={effectiveValue}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        onFocus={() => effectiveValue && setIsDropdownOpen(true)}
        className={`
          w-full h-full pr-10 
          ${filters.length > 0 || showVoiceSearch || showImageSearch ? 'pl-10' : 'pl-3'} 
          bg-transparent border-none outline-none focus:ring-0
          disabled:cursor-not-allowed
          ${sizeClasses[size].input}
          ${inputClassName}
        `}
        disabled={disabled}
      />

      {/* Action buttons on the left */}
      <div className="flex items-center absolute left-0 top-0 bottom-0 px-2 space-x-1 space-x-reverse">
        {/* Filter button */}
        {filters.length > 0 && (
          <button
            type="button"
            onClick={() => setShowFilters(true)}
            className={`text-gray-400 hover:text-gray-600 ${
              Object.keys(appliedFilters).length > 0 ? 'text-blue-500' : ''
            }`}
            aria-label="فلاتر البحث"
          >
            <Filter className={sizeClasses[size].icon} />
            {Object.keys(appliedFilters).length > 0 && (
              <span className="absolute -top-1 -right-1 bg-blue-500 text-white rounded-full w-4 h-4 text-xs flex items-center justify-center">
                {Object.keys(appliedFilters).length}
              </span>
            )}
          </button>
        )}

        {/* Voice search button */}
        {showVoiceSearch && (
          <button
            type="button"
            onClick={onVoiceSearchClick}
            className="text-gray-400 hover:text-gray-600"
            aria-label="بحث صوتي"
          >
            <Mic className={sizeClasses[size].icon} />
          </button>
        )}

        {/* Image search button */}
        {showImageSearch && (
          <button
            type="button"
            onClick={onImageSearchClick}
            className="text-gray-400 hover:text-gray-600"
            aria-label="بحث بالصورة"
          >
            <Camera className={sizeClasses[size].icon} />
          </button>
        )}

        {/* Clear button */}
        {showClearButton && effectiveValue && (
          <button
            type="button"
            onClick={handleClear}
            className="text-gray-400 hover:text-gray-600"
            aria-label="مسح البحث"
          >
            <X className={sizeClasses[size].icon} />
          </button>
        )}
      </div>

      {/* Search button */}
      {showSearchButton && (
        <button
          type="button"
          onClick={handleSearchSubmit}
          className={`
            ml-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md
            ${sizeClasses[size].button}
            ${searchButtonClassName}
          `}
          disabled={disabled}
        >
          {searchButtonText}
        </button>
      )}

      {/* Dropdown */}
      <AnimatePresence>
        {shouldShowDropdown && (
          <motion.div
            ref={dropdownRef}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.15 }}
            className={`
              absolute z-10 top-full mt-1 w-full bg-white border border-gray-200 rounded-md shadow-lg overflow-hidden
              ${fullWidth ? 'left-0 right-0' : 'min-w-[250px]'}
            `}
          >
            {/* Recent searches */}
            {recentSearches.length > 0 && !effectiveValue && (
              <div className="p-2">
                <h3 className="text-xs font-medium text-gray-500 mb-1 px-2">البحوث الأخيرة</h3>
                <ul>
                  {recentSearches.slice(0, maxRecentSearches).map((search, index) => (
                    <li key={index}>
                      <button
                        type="button"
                        onClick={() => handleRecentSearchSelect(search)}
                        className="flex items-center w-full text-right px-2 py-1.5 text-sm hover:bg-gray-100 rounded-md"
                      >
                        <Clock className="ml-2 h-4 w-4 text-gray-400" />
                        <span className="flex-1 truncate">{search}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Options */}
            {filteredOptions.length > 0 && (
              <div className="max-h-60 overflow-y-auto">
                {/* Grouped options */}
                {Object.entries(groupedOptions).map(([group, options]) => (
                  <div key={group || 'default'} className="p-2">
                    {group && (
                      <h3 className="text-xs font-medium text-gray-500 mb-1 px-2">{group}</h3>
                    )}
                    <ul>
                      {options.map((option, index) => {
                        const isActive = filteredOptions.indexOf(option) === activeOptionIndex;
                        return (
                          <li key={option.id}>
                            <button
                              type="button"
                              onClick={() => handleOptionSelect(option)}
                              className={`
                                flex items-center w-full text-right px-2 py-1.5 text-sm rounded-md
                                ${isActive ? 'bg-blue-50 text-blue-700' : 'hover:bg-gray-100'}
                              `}
                            >
                              {option.icon && <span className="ml-2">{option.icon}</span>}
                              {renderOption ? (
                                renderOption(option)
                              ) : (
                                <span className="flex-1 truncate">{option.label}</span>
                              )}
                            </button>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                ))}
              </div>
            )}

            {/* No results */}
            {effectiveValue && filteredOptions.length === 0 && (
              <div className="p-4 text-center text-sm text-gray-500">
                لا توجد نتائج مطابقة لـ "{effectiveValue}"
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Filters drawer */}
      <Drawer
        isOpen={showFilters}
        onClose={() => setShowFilters(false)}
        title="فلاتر البحث"
        position="right"
      >
        {filterComponent || (
          <div className="space-y-6">
            {filters.map((filter) => (
              <div key={filter.id} className="space-y-2">
                <h3 className="font-medium text-sm">{filter.label}</h3>
                {renderFilterControl(filter, appliedFilters, handleFilterChange)}
              </div>
            ))}

            <div className="flex justify-between pt-4 border-t">
              <button
                type="button"
                onClick={() => {
                  setAppliedFilters({});
                  onFilterChange && onFilterChange({});
                }}
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                إعادة ضبط
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowFilters(false);
                  handleSearchSubmit();
                }}
                className="px-4 py-2 bg-[var(--primary)] text-white rounded-md text-sm"
              >
                تطبيق الفلاتر
              </button>
            </div>
          </div>
        )}
      </Drawer>
    </div>
  );
}

// Helper function to render filter controls
function renderFilterControl(
  filter: SearchFilter,
  appliedFilters: Record<string, string | string[]>,
  onChange: (id: string, value: string | string[]) => void
) {
  const currentValue = appliedFilters[filter.id] || filter.defaultValue || '';

  switch (filter.type) {
    case 'select':
      return (
        <div className="relative">
          <select
            id={filter.id}
            value={currentValue as string}
            onChange={(e) => onChange(filter.id, e.target.value)}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          >
            <option value="">{filter.placeholder || 'اختر...'}</option>
            {filter.options?.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <div className="absolute inset-y-0 left-0 flex items-center pl-2 pointer-events-none">
            <ChevronDown className="h-4 w-4 text-gray-400" />
          </div>
        </div>
      );

    case 'radio':
      return (
        <div className="space-y-2">
          {filter.options?.map((option) => (
            <label key={option.value} className="flex items-center space-x-2 space-x-reverse">
              <input
                type="radio"
                name={filter.id}
                value={option.value}
                checked={(currentValue as string) === option.value}
                onChange={() => onChange(filter.id, option.value)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
              />
              <span className="text-sm">{option.label}</span>
            </label>
          ))}
        </div>
      );

    case 'checkbox':
      const checkboxValues = Array.isArray(currentValue) ? currentValue : [];
      return (
        <div className="space-y-2">
          {filter.options?.map((option) => (
            <label key={option.value} className="flex items-center space-x-2 space-x-reverse">
              <input
                type="checkbox"
                value={option.value}
                checked={checkboxValues.includes(option.value)}
                onChange={(e) => {
                  const isChecked = e.target.checked;
                  const newValues = isChecked
                    ? [...checkboxValues, option.value]
                    : checkboxValues.filter((v) => v !== option.value);
                  onChange(filter.id, newValues);
                }}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <span className="text-sm">{option.label}</span>
            </label>
          ))}
        </div>
      );

    case 'range':
      const rangeValue = (currentValue as string) || '0';
      return (
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-xs">{filter.min || 0}</span>
            <span className="text-xs">{filter.max || 100}</span>
          </div>
          <input
            type="range"
            min={filter.min || 0}
            max={filter.max || 100}
            step={filter.step || 1}
            value={rangeValue}
            onChange={(e) => onChange(filter.id, e.target.value)}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
          />
          <div className="text-center text-sm">
            {rangeValue}
          </div>
        </div>
      );

    case 'text':
      return (
        <input
          type="text"
          id={filter.id}
          value={currentValue as string}
          onChange={(e) => onChange(filter.id, e.target.value)}
          placeholder={filter.placeholder}
          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
        />
      );

    default:
      return null;
  }
}

export interface SearchTagsProps {
  tags: string[];
  onRemove: (tag: string) => void;
  className?: string;
  tagClassName?: string;
  disabled?: boolean;
}

export function SearchTags({
  tags,
  onRemove,
  className = '',
  tagClassName = '',
  disabled = false,
}: SearchTagsProps) {
  if (tags.length === 0) return null;

  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      {tags.map((tag, index) => (
        <div
          key={index}
          className={`
            inline-flex items-center bg-gray-100 text-gray-800 text-sm rounded-full px-3 py-1
            ${disabled ? 'opacity-60' : ''}
            ${tagClassName}
          `}
        >
          <span className="max-w-[200px] truncate">{tag}</span>
          {!disabled && (
            <button
              type="button"
              onClick={() => onRemove(tag)}
              className="ml-1.5 text-gray-500 hover:text-gray-700 focus:outline-none"
              aria-label={`إزالة ${tag}`}
            >
              <X className="h-3 w-3" />
            </button>
          )}
        </div>
      ))}
    </div>
  );
}

export interface SearchFilterTagsProps {
  filters: Record<string, string | string[]>;
  filterLabels: Record<string, string>;
  onRemove: (filterId: string) => void;
  className?: string;
  tagClassName?: string;
  disabled?: boolean;
}

export function SearchFilterTags({
  filters,
  filterLabels,
  onRemove,
  className = '',
  tagClassName = '',
  disabled = false,
}: SearchFilterTagsProps) {
  if (Object.keys(filters).length === 0) return null;

  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      {Object.entries(filters).map(([filterId, filterValue]) => (
        <div
          key={filterId}
          className={`
            inline-flex items-center bg-blue-100 text-blue-800 text-sm rounded-full px-3 py-1
            ${disabled ? 'opacity-60' : ''}
            ${tagClassName}
          `}
        >
          <span className="font-medium ml-1">{filterLabels[filterId] || filterId}:</span>
          <span className="max-w-[150px] truncate">
            {Array.isArray(filterValue) ? filterValue.join(', ') : filterValue}
          </span>
          {!disabled && (
            <button
              type="button"
              onClick={() => onRemove(filterId)}
              className="ml-1.5 text-blue-500 hover:text-blue-700 focus:outline-none"
              aria-label={`إزالة فلتر ${filterLabels[filterId] || filterId}`}
            >
              <X className="h-3 w-3" />
            </button>
          )}
        </div>
      ))}
    </div>
  );
}