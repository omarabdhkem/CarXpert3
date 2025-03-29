import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation } from 'wouter';
import AnimatedButton from '@/components/ui/animated-button';

interface SearchBarProps {
  className?: string;
  placeholder?: string;
  onSearch?: (query: string, filters: any) => void;
  defaultExpanded?: boolean;
  variant?: 'simple' | 'advanced';
}

export default function SearchBar({
  className = '',
  placeholder = 'ابحث...',
  onSearch,
  defaultExpanded = false,
  variant = 'simple',
}: SearchBarProps) {
  const [location, setLocation] = useLocation();
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<Record<string, any>>({});
  const [showFilters, setShowFilters] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const filtersRef = useRef<HTMLDivElement>(null);
  
  // تصفية/فلترة النتائج
  const priceRanges = [
    { min: 0, max: 100000, label: 'أقل من 100,000' },
    { min: 100000, max: 200000, label: '100,000 - 200,000' },
    { min: 200000, max: 300000, label: '200,000 - 300,000' },
    { min: 300000, max: null, label: 'أكثر من 300,000' },
  ];
  
  const years = [2023, 2022, 2021, 2020, 2019, 2018, 2017, 2016];
  const brands = ['تويوتا', 'نيسان', 'هوندا', 'مرسيدس', 'بي إم دبليو', 'أودي', 'هيونداي', 'كيا'];
  const carTypes = ['سيدان', 'دفع رباعي', 'هاتشباك', 'كوبيه', 'بيك أب'];
  
  // توسيع شريط البحث
  const expandSearchBar = () => {
    setIsExpanded(true);
    setTimeout(() => {
      searchInputRef.current?.focus();
    }, 200);
  };
  
  // إغلاق شريط البحث
  const collapseSearchBar = () => {
    if (searchQuery.trim() === '') {
      setIsExpanded(false);
    }
  };
  
  // نقر خارج منطقة البحث
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchInputRef.current &&
        !searchInputRef.current.contains(event.target as Node) &&
        filtersRef.current &&
        !filtersRef.current.contains(event.target as Node)
      ) {
        setShowFilters(false);
        if (searchQuery.trim() === '') {
          setIsExpanded(false);
        }
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [searchQuery]);
  
  // تحديث حقل في الفلتر
  const updateFilter = (key: string, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
    }));
  };
  
  // إعادة تعيين الفلاتر
  const resetFilters = () => {
    setFilters({});
  };
  
  // تقديم البحث
  const handleSearch = (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault();
    }
    
    if (onSearch) {
      onSearch(searchQuery, filters);
    } else {
      // التنقل إلى صفحة البحث مع المعلمات
      const searchParams = new URLSearchParams();
      searchParams.set('q', searchQuery);
      
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          if (typeof value === 'object') {
            if (value.min) searchParams.set(`${key}_min`, value.min.toString());
            if (value.max) searchParams.set(`${key}_max`, value.max.toString());
          } else {
            searchParams.set(key, value.toString());
          }
        }
      });
      
      setLocation(`/cars?${searchParams.toString()}`);
    }
    
    setShowFilters(false);
  };
  
  // نموذج بسيط مع زر بحث
  const simpleSearchBar = (
    <form onSubmit={handleSearch} className="relative flex items-center w-full">
      <input
        ref={searchInputRef}
        type="text"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        placeholder={placeholder}
        className="w-full py-2 px-4 pr-10 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent transition-all"
      />
      <button
        type="submit"
        className="absolute left-3 text-gray-500 hover:text-[var(--primary)] transition-colors"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </button>
    </form>
  );
  
  // نموذج متقدم مع فلاتر
  const advancedSearchBar = (
    <div className="w-full">
      <div className="relative flex items-center w-full">
        <input
          ref={searchInputRef}
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={placeholder}
          className="w-full py-2 px-4 pr-10 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent transition-all"
        />
        
        <button
          type="button"
          className="absolute right-3 text-gray-500 hover:text-[var(--primary)] transition-colors"
          onClick={() => setShowFilters(!showFilters)}
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
          </svg>
        </button>
        
        <button
          type="button"
          onClick={handleSearch}
          className="absolute left-3 text-gray-500 hover:text-[var(--primary)] transition-colors"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </button>
      </div>
      
      <AnimatePresence>
        {showFilters && (
          <motion.div
            ref={filtersRef}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute z-10 mt-2 w-full bg-white rounded-md shadow-lg border border-gray-200 p-4"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* السعر */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  السعر
                </label>
                <select
                  value={filters.priceRange ? JSON.stringify(filters.priceRange) : ''}
                  onChange={(e) => {
                    const value = e.target.value ? JSON.parse(e.target.value) : null;
                    updateFilter('priceRange', value);
                  }}
                  className="block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-[var(--primary)] focus:border-[var(--primary)]"
                >
                  <option value="">جميع الأسعار</option>
                  {priceRanges.map((range, idx) => (
                    <option key={idx} value={JSON.stringify(range)}>
                      {range.label}
                    </option>
                  ))}
                </select>
              </div>
              
              {/* الماركة */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  الماركة
                </label>
                <select
                  value={filters.brand || ''}
                  onChange={(e) => updateFilter('brand', e.target.value)}
                  className="block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-[var(--primary)] focus:border-[var(--primary)]"
                >
                  <option value="">جميع الماركات</option>
                  {brands.map((brand) => (
                    <option key={brand} value={brand}>
                      {brand}
                    </option>
                  ))}
                </select>
              </div>
              
              {/* السنة */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  سنة الصنع
                </label>
                <select
                  value={filters.year || ''}
                  onChange={(e) => updateFilter('year', e.target.value ? parseInt(e.target.value) : '')}
                  className="block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-[var(--primary)] focus:border-[var(--primary)]"
                >
                  <option value="">جميع السنوات</option>
                  {years.map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
              </div>
              
              {/* نوع السيارة */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  نوع السيارة
                </label>
                <select
                  value={filters.bodyType || ''}
                  onChange={(e) => updateFilter('bodyType', e.target.value)}
                  className="block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-[var(--primary)] focus:border-[var(--primary)]"
                >
                  <option value="">جميع الأنواع</option>
                  {carTypes.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            
            {/* أزرار البحث وإعادة التعيين */}
            <div className="flex justify-end mt-4 space-x-2 space-x-reverse">
              <AnimatedButton
                variant="outline"
                size="sm"
                onClick={resetFilters}
              >
                إعادة تعيين
              </AnimatedButton>
              <AnimatedButton
                variant="primary"
                size="sm"
                onClick={handleSearch}
              >
                بحث
              </AnimatedButton>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
  
  return (
    <div className={`${className}`}>
      {variant === 'simple' ? (
        <>
          {isExpanded ? (
            <motion.div
              initial={{ width: 40 }}
              animate={{ width: '100%' }}
              transition={{ duration: 0.3 }}
              className="relative"
            >
              {simpleSearchBar}
            </motion.div>
          ) : (
            <motion.button
              onClick={expandSearchBar}
              className="flex items-center justify-center w-10 h-10 bg-white rounded-full shadow-sm hover:shadow-md transition-shadow"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </motion.button>
          )}
        </>
      ) : (
        advancedSearchBar
      )}
    </div>
  );
}