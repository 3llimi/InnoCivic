import React, { forwardRef } from 'react';
import { SelectProps } from '../../types';

interface EnhancedSelectProps extends SelectProps {
  wrapperClassName?: string;
}

export const Select = forwardRef<HTMLSelectElement, EnhancedSelectProps>(({
  options,
  value,
  onChange,
  placeholder,
  error,
  label,
  required = false,
  disabled = false,
  className = '',
  wrapperClassName = '',
  ...props
}, ref) => {
  const getSelectClasses = () => {
    const baseClasses = 'block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400 sm:text-sm';
    const errorClasses = error ? 'border-red-300 dark:border-red-600 focus:ring-red-500 focus:border-red-500 dark:focus:ring-red-400 dark:focus:border-red-400' : 'border-gray-300 dark:border-gray-600';
    const disabledClasses = disabled ? 'bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400 cursor-not-allowed' : 'bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100';

    return `${baseClasses} ${errorClasses} ${disabledClasses}`;
  };

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onChange?.(e.target.value);
  };

  return (
    <div className={`${wrapperClassName} ${className}`.trim()}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      <select
        ref={ref}
        value={value}
        onChange={handleChange}
        disabled={disabled}
        required={required}
        className={getSelectClasses()}
        {...props}
      >
        {placeholder && (
          <option value="" disabled className="bg-gray-50 dark:bg-gray-900 text-gray-700 dark:text-gray-300">
            {placeholder}
          </option>
        )}
        {options.map((option) => (
          <option
            key={option.value}
            value={option.value}
            className="bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
          >
            {option.label}
          </option>
        ))}
      </select>

      {error && (
        <p className="mt-1 text-sm text-red-600 dark:text-red-400">
          {error}
        </p>
      )}
    </div>
  );
});
