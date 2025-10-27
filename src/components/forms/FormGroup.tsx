import React from 'react';
import { BaseComponentProps } from '../../types';

interface FormGroupProps extends BaseComponentProps {
  label?: string;
  error?: string;
  help?: string;
  required?: boolean;
  disabled?: boolean;
  inline?: boolean;
}

export const FormGroup: React.FC<FormGroupProps> = ({
  children,
  label,
  error,
  help,
  required = false,
  disabled = false,
  inline = false,
  className = '',
}) => {
  const getContainerClasses = () => {
    const baseClasses = 'form-group';
    const inlineClasses = inline ? 'flex items-center space-x-3' : 'space-y-1';
    const disabledClasses = disabled ? 'opacity-50' : '';

    return `${baseClasses} ${inlineClasses} ${disabledClasses} ${className}`;
  };

  const getLabelClasses = () => {
    const baseClasses = 'block text-sm font-medium text-gray-700';
    const inlineClasses = inline ? 'flex-shrink-0' : '';

    return `${baseClasses} ${inlineClasses}`;
  };

  const getContentClasses = () => {
    return inline ? 'flex-1' : '';
  };

  return (
    <div className={getContainerClasses()}>
      {label && (
        <label className={getLabelClasses()}>
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      <div className={getContentClasses()}>
        {children}
      </div>

      {help && !error && (
        <p className="text-sm text-gray-500">
          {help}
        </p>
      )}

      {error && (
        <p className="text-sm text-red-600">
          {error}
        </p>
      )}
    </div>
  );
};
