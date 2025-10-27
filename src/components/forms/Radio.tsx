import React, { forwardRef } from 'react';
import { BaseComponentProps } from '../../types';

interface RadioOption {
  value: string;
  label: string;
  disabled?: boolean;
}

interface RadioProps extends BaseComponentProps {
  name: string;
  options: RadioOption[];
  value?: string;
  onChange?: (value: string) => void;
  disabled?: boolean;
  required?: boolean;
  error?: string;
  label?: string;
  orientation?: 'horizontal' | 'vertical';
}

export const Radio = forwardRef<HTMLInputElement, RadioProps>(({
  name,
  options,
  value,
  onChange,
  disabled = false,
  required = false,
  error,
  label,
  orientation = 'vertical',
  className = '',
  ...props
}, ref) => {
  const handleChange = (optionValue: string) => {
    if (!disabled) {
      onChange?.(optionValue);
    }
  };

  const getRadioClasses = () => {
    const baseClasses = 'h-4 w-4 text-blue-600 dark:text-blue-500 focus:ring-blue-500 dark:focus:ring-blue-400 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800';
    const errorClasses = error ? 'border-red-300 dark:border-red-600 focus:ring-red-500' : '';
    const disabledClasses = disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer';

    return `${baseClasses} ${errorClasses} ${disabledClasses}`;
  };

  const getContainerClasses = () => {
    return orientation === 'horizontal'
      ? 'flex flex-wrap gap-4'
      : 'space-y-2';
  };

  return (
    <div className={className}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      <div className={getContainerClasses()}>
        {options.map((option) => (
          <div key={option.value} className="flex items-center">
            <input
              ref={ref}
              type="radio"
              name={name}
              value={option.value}
              checked={value === option.value}
              onChange={() => handleChange(option.value)}
              disabled={disabled || option.disabled}
              required={required}
              className={getRadioClasses()}
              {...props}
            />
            <label className="ml-2 text-sm text-gray-700 dark:text-gray-300 cursor-pointer">
              {option.label}
            </label>
          </div>
        ))}
      </div>

      {error && (
        <p className="mt-1 text-sm text-red-600 dark:text-red-400">
          {error}
        </p>
      )}
    </div>
  );
});
