import React, { forwardRef } from 'react';
import { BaseComponentProps } from '../../types';

interface TextAreaProps extends BaseComponentProps {
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
  error?: string;
  label?: string;
  required?: boolean;
  disabled?: boolean;
  rows?: number;
  resize?: 'none' | 'both' | 'horizontal' | 'vertical';
}

export const TextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>(({
  placeholder,
  value,
  onChange,
  error,
  label,
  required = false,
  disabled = false,
  rows = 3,
  resize = 'vertical',
  className = '',
  ...props
}, ref) => {
  const getTextAreaClasses = () => {
    const baseClasses = 'block w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400 sm:text-sm';
    const errorClasses = error ? 'border-red-300 dark:border-red-600 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 dark:border-gray-600';
    const disabledClasses = disabled ? 'bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400 cursor-not-allowed' : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100';
    const resizeClasses = `resize-${resize}`;

    return `${baseClasses} ${errorClasses} ${disabledClasses} ${resizeClasses}`;
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange?.(e.target.value);
  };

  return (
    <div className={className}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      <textarea
        ref={ref}
        placeholder={placeholder}
        value={value}
        onChange={handleChange}
        disabled={disabled}
        required={required}
        rows={rows}
        className={getTextAreaClasses()}
        {...props}
      />

      {error && (
        <p className="mt-1 text-sm text-red-600 dark:text-red-400">
          {error}
        </p>
      )}
    </div>
  );
});
