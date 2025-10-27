import React, { useState, useMemo } from 'react';
import { BaseComponentProps, TableColumn, PaginationProps } from '../../types';
import { Pagination } from '../navigation/Pagination';

interface DataGridProps<T = any> extends BaseComponentProps {
  data: T[];
  columns: TableColumn<T>[];
  loading?: boolean;
  pagination?: PaginationProps;
  sortable?: boolean;
  filterable?: boolean;
  selectable?: boolean;
  selectedRows?: string[];
  onSelectionChange?: (selectedIds: string[]) => void;
  onSort?: (column: string, direction: 'asc' | 'desc') => void;
  onFilter?: (column: string, value: any) => void;
  emptyMessage?: string;
  rowKey?: keyof T | ((record: T) => string);
}

export function DataGrid<T = any>({
  data,
  columns,
  loading = false,
  pagination,
  sortable = true,
  filterable = false,
  selectable = false,
  selectedRows = [],
  onSelectionChange,
  onSort,
  onFilter,
  emptyMessage = 'No data available',
  rowKey = 'id' as keyof T,
  className = '',
}: DataGridProps<T>) {
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [filters, setFilters] = useState<Record<string, any>>({});

  const getRowId = (record: T): string => {
    if (typeof rowKey === 'function') {
      return rowKey(record);
    }
    return String(record[rowKey]);
  };

  const sortedData = useMemo(() => {
    if (!sortColumn) return data;

    return [...data].sort((a, b) => {
      const aValue = a[sortColumn as keyof T];
      const bValue = b[sortColumn as keyof T];

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }, [data, sortColumn, sortDirection]);

  const filteredData = useMemo(() => {
    if (Object.keys(filters).length === 0) return sortedData;

    return sortedData.filter((record) => {
      return Object.entries(filters).every(([column, value]) => {
        if (!value) return true;
        const recordValue = record[column as keyof T];
        return String(recordValue).toLowerCase().includes(String(value).toLowerCase());
      });
    });
  }, [sortedData, filters]);

  const handleSort = (column: string) => {
    if (!sortable) return;

    const newDirection = sortColumn === column && sortDirection === 'asc' ? 'desc' : 'asc';
    setSortColumn(column);
    setSortDirection(newDirection);
    onSort?.(column, newDirection);
  };

  const handleFilter = (column: string, value: any) => {
    setFilters(prev => ({ ...prev, [column]: value }));
    onFilter?.(column, value);
  };

  const handleSelectAll = (checked: boolean) => {
    if (!selectable || !onSelectionChange) return;

    if (checked) {
      const allIds = filteredData.map(getRowId);
      onSelectionChange(allIds);
    } else {
      onSelectionChange([]);
    }
  };

  const handleSelectRow = (record: T, checked: boolean) => {
    if (!selectable || !onSelectionChange) return;

    const recordId = getRowId(record);
    if (checked) {
      onSelectionChange([...selectedRows, recordId]);
    } else {
      onSelectionChange(selectedRows.filter(id => id !== recordId));
    }
  };

  const isAllSelected = selectable && filteredData.length > 0 &&
    filteredData.every(record => selectedRows.includes(getRowId(record)));

  const isIndeterminate = selectable && selectedRows.length > 0 && !isAllSelected;

  if (loading) {
    return (
      <div className={`bg-white dark:bg-gray-800 rounded-lg shadow ${className}`}>
        <div className="p-6">
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-4"></div>
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (filteredData.length === 0) {
    return (
      <div className={`bg-white dark:bg-gray-800 rounded-lg shadow ${className}`}>
        <div className="p-12 text-center">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100">No data</h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{emptyMessage}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg shadow ${className}`}>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-900">
            <tr>
              {selectable && (
                <th className="px-6 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={isAllSelected}
                    ref={(input) => {
                      if (input) input.indeterminate = isIndeterminate;
                    }}
                    onChange={(e) => handleSelectAll(e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 dark:border-gray-600 dark:bg-gray-700 rounded"
                  />
                </th>
              )}
              {columns.map((column) => (
                <th
                  key={column.key}
                  className={`px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider ${
                    column.sortable !== false && sortable ? 'cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800' : ''
                  }`}
                  onClick={() => column.sortable !== false && handleSort(column.key)}
                >
                  <div className="flex items-center space-x-1">
                    <span>{column.title}</span>
                    {column.sortable !== false && sortable && (
                      <div className="flex flex-col">
                        <svg
                          className={`h-3 w-3 ${
                            sortColumn === column.key && sortDirection === 'asc' ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400 dark:text-gray-500'
                          }`}
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                        </svg>
                        <svg
                          className={`h-3 w-3 -mt-1 ${
                            sortColumn === column.key && sortDirection === 'desc' ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400 dark:text-gray-500'
                          }`}
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" />
                        </svg>
                      </div>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {filteredData.map((record, index) => (
              <tr key={getRowId(record)} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                {selectable && (
                  <td className="px-6 py-4 whitespace-nowrap">
                    <input
                      type="checkbox"
                      checked={selectedRows.includes(getRowId(record))}
                      onChange={(e) => handleSelectRow(record, e.target.checked)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 dark:border-gray-600 dark:bg-gray-700 rounded"
                    />
                  </td>
                )}
                {columns.map((column) => (
                  <td
                    key={column.key}
                    className={`px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100 ${
                      column.width ? `w-${column.width}` : ''
                    }`}
                  >
                    {column.render
                      ? column.render(record[column.dataIndex as keyof T], record)
                      : String(record[column.dataIndex as keyof T] || '-')
                    }
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {pagination && (
        <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700">
          <Pagination {...pagination} />
        </div>
      )}
    </div>
  );
}
