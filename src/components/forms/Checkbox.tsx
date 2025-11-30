import React, { forwardRef } from 'react';
import { BaseComponentProps } from '../../types';

interface CheckboxProps extends BaseComponentProps {
  label?: string | React.ReactNode;
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
    const baseClasses = 'h-4 w-4 appearance-none border-2 rounded cursor-pointer transition-colors';
    const backgroundClasses = 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600';
    const errorClasses = error ? 'border-red-300 dark:border-red-600' : '';
    const disabledClasses = disabled ? 'opacity-50 cursor-not-allowed' : '';
    const focusClasses = 'focus:ring-2 focus:ring-green-500 dark:focus:ring-green-400 focus:ring-offset-1';

    return `${baseClasses} ${backgroundClasses} ${errorClasses} ${disabledClasses} ${focusClasses}`;
  };

  const getCheckboxStyle = () => {
    if (checked && !disabled) {
      return {
        backgroundColor: '#16a34a', // green-600
        borderColor: '#16a34a',
        backgroundImage: 'url("data:image/svg+xml,%3csvg viewBox=\'0 0 12 12\' xmlns=\'http://www.w3.org/2000/svg\'%3e%3cpath d=\'M10 3L4.5 8.5L2 6\' stroke=\'white\' stroke-width=\'2\' fill=\'none\' stroke-linecap=\'round\' stroke-linejoin=\'round\'/%3e%3c/svg%3e")',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundSize: '80% 80%'
      };
    }
    return {};
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
            style={getCheckboxStyle()}
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
