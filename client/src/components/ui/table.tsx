import React, { ReactNode, useState, useEffect, useMemo } from 'react';
import { ChevronUp, ChevronDown, ChevronsUpDown, Search, X, Filter, MoreHorizontal, ArrowLeft, ArrowRight } from 'lucide-react';

export type SortDirection = 'asc' | 'desc' | null;

export interface TableColumn<T = any> {
  id: string;
  header: string | ReactNode;
  accessor?: keyof T | ((row: T) => any);
  cell?: (value: any, row: T, index: number) => ReactNode;
  sortable?: boolean;
  filterable?: boolean;
  width?: string;
  minWidth?: string;
  maxWidth?: string;
  align?: 'left' | 'center' | 'right';
  className?: string;
  headerClassName?: string;
  hidden?: boolean;
}

export interface TableProps<T = any> {
  data: T[];
  columns: TableColumn<T>[];
  caption?: string;
  className?: string;
  tableClassName?: string;
  headerClassName?: string;
  bodyClassName?: string;
  rowClassName?: (row: T, index: number) => string;
  cellClassName?: (value: any, row: T, column: TableColumn<T>, index: number) => string;
  onRowClick?: (row: T, index: number) => void;
  sortable?: boolean;
  defaultSortColumn?: string;
  defaultSortDirection?: SortDirection;
  pagination?: boolean;
  pageSize?: number;
  pageSizeOptions?: number[];
  filterable?: boolean;
  searchable?: boolean;
  loading?: boolean;
  noDataText?: string;
  loadingText?: string;
  zebra?: boolean;
  bordered?: boolean;
  hoverable?: boolean;
  compact?: boolean;
  sticky?: boolean;
}

export function Table<T extends Record<string, any>>({
  data,
  columns,
  caption,
  className = '',
  tableClassName = '',
  headerClassName = '',
  bodyClassName = '',
  rowClassName = () => '',
  cellClassName = () => '',
  onRowClick,
  sortable = true,
  defaultSortColumn,
  defaultSortDirection = null,
  pagination = false,
  pageSize = 10,
  pageSizeOptions = [5, 10, 25, 50, 100],
  filterable = false,
  searchable = false,
  loading = false,
  noDataText = 'لا توجد بيانات',
  loadingText = 'جاري التحميل...',
  zebra = true,
  bordered = false,
  hoverable = true,
  compact = false,
  sticky = false,
}: TableProps<T>) {
  // State for sorting
  const [sortColumn, setSortColumn] = useState<string | null>(defaultSortColumn || null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(defaultSortDirection);

  // State for pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(pageSize);

  // State for filtering and searching
  const [filters, setFilters] = useState<Record<string, any>>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Reset to first page when data changes, search term changes, or filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [data, searchTerm, filters]);

  // Get filtered data
  const filteredData = useMemo(() => {
    let result = [...data];

    // Apply search
    if (searchTerm && searchable) {
      const lowercasedSearch = searchTerm.toLowerCase();
      result = result.filter(row => {
        return columns.some(column => {
          if (column.hidden) return false;
          
          let value: any;
          if (typeof column.accessor === 'function') {
            value = column.accessor(row);
          } else if (column.accessor) {
            value = row[column.accessor as keyof T];
          }
          
          if (value == null) return false;
          
          return String(value).toLowerCase().includes(lowercasedSearch);
        });
      });
    }

    // Apply filters
    if (Object.keys(filters).length > 0 && filterable) {
      result = result.filter(row => {
        return Object.entries(filters).every(([columnId, filterValue]) => {
          if (!filterValue) return true;
          
          const column = columns.find(col => col.id === columnId);
          if (!column) return true;
          
          let value: any;
          if (typeof column.accessor === 'function') {
            value = column.accessor(row);
          } else if (column.accessor) {
            value = row[column.accessor as keyof T];
          }
          
          if (value == null) return false;
          
          return String(value).toLowerCase().includes(String(filterValue).toLowerCase());
        });
      });
    }

    // Apply sorting
    if (sortColumn && sortDirection && sortable) {
      const column = columns.find(col => col.id === sortColumn);
      if (column) {
        result.sort((a, b) => {
          let aValue: any;
          let bValue: any;
          
          if (typeof column.accessor === 'function') {
            aValue = column.accessor(a);
            bValue = column.accessor(b);
          } else if (column.accessor) {
            aValue = a[column.accessor as keyof T];
            bValue = b[column.accessor as keyof T];
          } else {
            return 0;
          }
          
          // Handle different data types for sorting
          if (aValue == null) return sortDirection === 'asc' ? -1 : 1;
          if (bValue == null) return sortDirection === 'asc' ? 1 : -1;
          
          if (typeof aValue === 'string' && typeof bValue === 'string') {
            return sortDirection === 'asc'
              ? aValue.localeCompare(bValue)
              : bValue.localeCompare(aValue);
          }
          
          return sortDirection === 'asc'
            ? aValue > bValue ? 1 : -1
            : aValue < bValue ? 1 : -1;
        });
      }
    }

    return result;
  }, [data, searchTerm, filters, sortColumn, sortDirection, columns, filterable, searchable, sortable]);

  // Get paginated data
  const paginatedData = useMemo(() => {
    if (!pagination) return filteredData;
    
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    
    return filteredData.slice(startIndex, endIndex);
  }, [filteredData, pagination, currentPage, itemsPerPage]);

  // Handle sorting
  const handleSort = (columnId: string) => {
    const column = columns.find(col => col.id === columnId);
    if (!column?.sortable && sortable !== true) return;
    
    if (sortColumn === columnId) {
      if (sortDirection === 'asc') {
        setSortDirection('desc');
      } else if (sortDirection === 'desc') {
        setSortDirection(null);
        setSortColumn(null);
      } else {
        setSortDirection('asc');
      }
    } else {
      setSortColumn(columnId);
      setSortDirection('asc');
    }
  };

  // Handle pagination
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  
  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  // Reset filters
  const resetFilters = () => {
    setFilters({});
    setSearchTerm('');
  };

  // Get column value
  const getCellValue = (row: T, column: TableColumn<T>, index: number) => {
    let value: any;
    
    if (typeof column.accessor === 'function') {
      value = column.accessor(row);
    } else if (column.accessor) {
      value = row[column.accessor as keyof T];
    }
    
    if (column.cell) {
      return column.cell(value, row, index);
    }
    
    return value != null ? value : '';
  };

  // Table classes
  const tableClasses = `
    min-w-full divide-y divide-gray-200
    ${bordered ? 'border border-gray-200' : ''}
    ${tableClassName}
  `;

  const headerClasses = `
    bg-gray-50
    ${sticky ? 'sticky top-0 z-10' : ''}
    ${headerClassName}
  `;

  const thClasses = (column: TableColumn<T>) => `
    px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider
    ${column.sortable || sortable ? 'cursor-pointer hover:bg-gray-100' : ''}
    ${column.align === 'center' ? 'text-center' : ''}
    ${column.align === 'right' ? 'text-right' : ''}
    ${column.headerClassName || ''}
  `;

  const tdClasses = (value: any, row: T, column: TableColumn<T>, index: number) => `
    px-4 py-3 whitespace-nowrap
    ${compact ? 'py-2' : ''}
    ${column.align === 'center' ? 'text-center' : ''}
    ${column.align === 'right' ? 'text-right' : ''}
    ${column.className || ''}
    ${cellClassName(value, row, column, index)}
  `;

  const trClasses = (row: T, index: number) => `
    ${zebra && index % 2 ? 'bg-gray-50' : 'bg-white'}
    ${hoverable ? 'hover:bg-gray-100' : ''}
    ${onRowClick ? 'cursor-pointer' : ''}
    ${rowClassName(row, index)}
  `;

  return (
    <div className={`overflow-hidden shadow-sm rounded-lg ${className}`}>
      {/* Table controls */}
      {(searchable || filterable || pagination) && (
        <div className="bg-white px-4 py-3 border-b border-gray-200 flex flex-wrap justify-between items-center">
          <div className="flex items-center space-x-4 space-x-reverse mb-2 sm:mb-0">
            {searchable && (
              <div className="relative">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="بحث..."
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <Search className="h-4 w-4 text-gray-400" />
                </div>
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className="absolute inset-y-0 left-0 flex items-center pl-3"
                  >
                    <X className="h-4 w-4 text-gray-400" />
                  </button>
                )}
              </div>
            )}
            
            {filterable && (
              <div className="relative">
                <button
                  onClick={() => setIsFilterOpen(!isFilterOpen)}
                  className={`flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium ${
                    Object.keys(filters).length > 0 || isFilterOpen
                      ? 'bg-blue-50 text-blue-600 border-blue-300'
                      : 'bg-white text-gray-700'
                  }`}
                >
                  <Filter className="h-4 w-4 ml-1" />
                  تصفية
                  {Object.keys(filters).length > 0 && (
                    <span className="inline-flex items-center justify-center h-5 w-5 ml-2 text-xs bg-blue-100 text-blue-800 rounded-full">
                      {Object.keys(filters).length}
                    </span>
                  )}
                </button>
                
                {isFilterOpen && (
                  <div className="absolute z-10 mt-2 px-4 py-3 bg-white rounded-md shadow-lg w-64 right-0 border border-gray-200">
                    <div className="flex justify-between items-center mb-3">
                      <h3 className="text-sm font-medium text-gray-700">تصفية البيانات</h3>
                      {Object.keys(filters).length > 0 && (
                        <button
                          onClick={resetFilters}
                          className="text-xs text-blue-600 hover:text-blue-800"
                        >
                          إعادة ضبط
                        </button>
                      )}
                    </div>
                    <div className="space-y-3">
                      {columns
                        .filter(column => column.filterable !== false && !column.hidden)
                        .map(column => (
                          <div key={column.id} className="space-y-1">
                            <label htmlFor={`filter-${column.id}`} className="block text-xs font-medium text-gray-700">
                              {typeof column.header === 'string' ? column.header : column.id}
                            </label>
                            <input
                              id={`filter-${column.id}`}
                              type="text"
                              value={filters[column.id] || ''}
                              onChange={(e) =>
                                setFilters({
                                  ...filters,
                                  [column.id]: e.target.value,
                                })
                              }
                              className="block w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                            />
                          </div>
                        ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
          
          {pagination && (
            <div className="flex items-center text-sm text-gray-700">
              <span className="mx-2">
                {(currentPage - 1) * itemsPerPage + 1} - {Math.min(currentPage * itemsPerPage, filteredData.length)} من أصل {filteredData.length}
              </span>
              <select
                value={itemsPerPage}
                onChange={(e) => setItemsPerPage(Number(e.target.value))}
                className="mx-2 border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              >
                {pageSizeOptions.map(option => (
                  <option key={option} value={option}>
                    {option} لكل صفحة
                  </option>
                ))}
              </select>
              <div className="flex items-center">
                <button
                  onClick={() => goToPage(currentPage - 1)}
                  disabled={currentPage === 1}
                  className={`p-1 rounded-md ${
                    currentPage === 1 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-500 hover:bg-gray-100'
                  }`}
                >
                  <ArrowRight className="h-5 w-5" />
                </button>
                <span className="mx-2">
                  {currentPage} من {totalPages}
                </span>
                <button
                  onClick={() => goToPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className={`p-1 rounded-md ${
                    currentPage === totalPages ? 'text-gray-300 cursor-not-allowed' : 'text-gray-500 hover:bg-gray-100'
                  }`}
                >
                  <ArrowLeft className="h-5 w-5" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}
      
      <div className="overflow-x-auto">
        <table className={tableClasses}>
          {caption && <caption className="sr-only">{caption}</caption>}
          <thead className={headerClasses}>
            <tr>
              {columns
                .filter(column => !column.hidden)
                .map(column => (
                  <th
                    key={column.id}
                    onClick={() => sortable && handleSort(column.id)}
                    className={thClasses(column)}
                    style={{
                      width: column.width,
                      minWidth: column.minWidth,
                      maxWidth: column.maxWidth,
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <span>{column.header}</span>
                      {(column.sortable || sortable) && (
                        <span className="mr-1">
                          {sortColumn === column.id ? (
                            sortDirection === 'asc' ? (
                              <ChevronUp className="h-4 w-4" />
                            ) : sortDirection === 'desc' ? (
                              <ChevronDown className="h-4 w-4" />
                            ) : (
                              <ChevronsUpDown className="h-4 w-4 text-gray-300" />
                            )
                          ) : (
                            <ChevronsUpDown className="h-4 w-4 text-gray-300" />
                          )}
                        </span>
                      )}
                    </div>
                  </th>
                ))}
            </tr>
          </thead>
          <tbody className={`divide-y divide-gray-200 ${bodyClassName}`}>
            {loading ? (
              <tr>
                <td
                  colSpan={columns.filter(column => !column.hidden).length}
                  className="px-4 py-8 text-center text-gray-500"
                >
                  {loadingText}
                </td>
              </tr>
            ) : paginatedData.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.filter(column => !column.hidden).length}
                  className="px-4 py-8 text-center text-gray-500"
                >
                  {noDataText}
                </td>
              </tr>
            ) : (
              paginatedData.map((row, rowIndex) => (
                <tr
                  key={rowIndex}
                  className={trClasses(row, rowIndex)}
                  onClick={() => onRowClick && onRowClick(row, rowIndex)}
                >
                  {columns
                    .filter(column => !column.hidden)
                    .map(column => (
                      <td
                        key={column.id}
                        className={tdClasses(getCellValue(row, column, rowIndex), row, column, rowIndex)}
                      >
                        {getCellValue(row, column, rowIndex)}
                      </td>
                    ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      
      {/* Simplified mobile pagination if needed */}
      {pagination && paginatedData.length > 0 && (
        <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:hidden">
          <button
            onClick={() => goToPage(currentPage - 1)}
            disabled={currentPage === 1}
            className={`${
              currentPage === 1 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-700 hover:bg-gray-100'
            } relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md bg-white`}
          >
            السابق
          </button>
          <span className="text-sm text-gray-700">
            صفحة <span className="font-medium">{currentPage}</span> من <span className="font-medium">{totalPages}</span>
          </span>
          <button
            onClick={() => goToPage(currentPage + 1)}
            disabled={currentPage === totalPages}
            className={`${
              currentPage === totalPages ? 'text-gray-300 cursor-not-allowed' : 'text-gray-700 hover:bg-gray-100'
            } relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md bg-white`}
          >
            التالي
          </button>
        </div>
      )}
    </div>
  );
}