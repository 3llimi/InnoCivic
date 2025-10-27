import React from 'react';
import { BaseComponentProps } from '../../types';

interface SimpleTableProps extends BaseComponentProps {
  data: Record<string, any>[];
  headers?: string[];
  striped?: boolean;
  bordered?: boolean;
  hoverable?: boolean;
  compact?: boolean;
}

export const SimpleTable: React.FC<SimpleTableProps> = ({
  data,
  headers,
  striped = false,
  bordered = false,
  hoverable = false,
  compact = false,
  className = '',
}) => {
  if (!data || data.length === 0) {
    return (
      <div className={`text-center py-8 text-gray-500 ${className}`}>
        No data available
      </div>
    );
  }

  const tableHeaders = headers || Object.keys(data[0] || {});

  const getTableClasses = () => {
    const baseClasses = 'min-w-full divide-y divide-gray-200';
    const stripedClasses = striped ? 'divide-y divide-gray-200' : '';
    const borderedClasses = bordered ? 'border border-gray-200' : '';
    const compactClasses = compact ? 'text-sm' : '';

    return `${baseClasses} ${stripedClasses} ${borderedClasses} ${compactClasses}`;
  };

  const getRowClasses = (index: number) => {
    const baseClasses = 'hover:bg-gray-50';
    const stripedClasses = striped && index % 2 === 0 ? 'bg-gray-50' : 'bg-white';
    const hoverClasses = hoverable ? 'hover:bg-gray-100' : '';

    return `${baseClasses} ${stripedClasses} ${hoverClasses}`;
  };

  return (
    <div className={`overflow-x-auto ${className}`}>
      <table className={getTableClasses()}>
        <thead className="bg-gray-50">
          <tr>
            {tableHeaders.map((header, index) => (
              <th
                key={index}
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {data.map((row, rowIndex) => (
            <tr key={rowIndex} className={getRowClasses(rowIndex)}>
              {tableHeaders.map((header, colIndex) => (
                <td
                  key={colIndex}
                  className="px-6 py-4 whitespace-nowrap text-sm text-gray-900"
                >
                  {row[header] || '-'}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
