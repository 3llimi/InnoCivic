import React, { forwardRef } from 'react';
import { BaseComponentProps } from '../../types';

interface CheckboxProps extends BaseComponentProps {
  label?: string;
  checked?: boolean;
  onChange?: (checked: boolean) => void;
  disabled?: boolean;
  required?: boolean;
  error?: string;
  indeterminate?: boolean;
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(({
  label,
  checked = false,
  onChange,
  disabled = false,
  required = false,
  error,
  indeterminate = false,
  className = '',
  ...props
}, ref) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange?.(e.target.checked);
  };

  const getCheckboxClasses = () => {
    const baseClasses = 'h-4 w-4 text-green-600 dark:text-green-500 focus:ring-green-500 dark:focus:ring-green-400 border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 accent-green-600';
    const errorClasses = error ? 'border-red-300 dark:border-red-600 focus:ring-red-500' : '';
    const disabledClasses = disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer';

    return `${baseClasses} ${errorClasses} ${disabledClasses}`;
  };

  return (
    <div className={className}>
      <div className="flex items-start">
        <div className="flex items-center h-5">
          <input
            ref={(input) => {
              if (ref) {
                if (typeof ref === 'function') {
                  ref(input);
                } else {
                  ref.current = input;
                }
              }
              if (input) input.indeterminate = indeterminate;
            }}
            type="checkbox"
            checked={checked}
            onChange={handleChange}
            disabled={disabled}
            required={required}
            className={getCheckboxClasses()}
            style={{ accentColor: '#16a34a' }}
            {...props}
          />
        </div>

        {label && (
          <div className="ml-3 text-sm">
            <label className="font-medium text-gray-700 dark:text-gray-300 cursor-pointer">
              {label}
              {required && <span className="text-red-500 ml-1">*</span>}
            </label>
          </div>
        )}
      </div>

      {error && (
        <p className="mt-1 text-sm text-red-600 dark:text-red-400">
          {error}
        </p>
      )}
    </div>
  );
});
