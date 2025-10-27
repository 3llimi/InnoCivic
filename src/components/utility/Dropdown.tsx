import React, { useState, useRef, useEffect } from 'react';
import { BaseComponentProps } from '../../types';

interface DropdownItem {
  label: string;
  href?: string;
  onClick?: () => void;
  disabled?: boolean;
  divider?: boolean;
  icon?: React.ReactNode;
}

interface DropdownProps extends BaseComponentProps {
  trigger: React.ReactNode;
  items: DropdownItem[];
  position?: 'bottom-left' | 'bottom-right' | 'top-left' | 'top-right';
  align?: 'left' | 'right';
  disabled?: boolean;
  onOpen?: () => void;
  onClose?: () => void;
}

export const Dropdown: React.FC<DropdownProps> = ({
  trigger,
  items,
  position = 'bottom-left',
  align = 'left',
  disabled = false,
  onOpen,
  onClose,
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        triggerRef.current &&
        !triggerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen]);

  const handleToggle = () => {
    if (disabled) return;

    const newIsOpen = !isOpen;
    setIsOpen(newIsOpen);

    if (newIsOpen) {
      onOpen?.();
    } else {
      onClose?.();
    }
  };

  const handleItemClick = (item: DropdownItem) => {
    if (item.disabled) return;

    if (item.onClick) {
      item.onClick();
    }

    setIsOpen(false);
    onClose?.();
  };

  const getPositionClasses = () => {
    const positions = {
      'bottom-left': 'top-full left-0 mt-1',
      'bottom-right': 'top-full right-0 mt-1',
      'top-left': 'bottom-full left-0 mb-1',
      'top-right': 'bottom-full right-0 mb-1',
    };
    return positions[position];
  };

  const getAlignClasses = () => {
    return align === 'right' ? 'text-right' : 'text-left';
  };

  return (
    <div className={`relative ${className}`}>
      <div
        ref={triggerRef}
        onClick={handleToggle}
        className={`${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
      >
        {trigger}
      </div>

      {isOpen && (
        <div
          ref={dropdownRef}
          className={`absolute z-50 w-56 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none ${getPositionClasses()}`}
        >
          <div className="py-1" role="menu">
            {items.map((item, index) => (
              <div key={index}>
                {item.divider ? (
                  <div className="border-t border-gray-100 my-1" />
                ) : item.href ? (
                  <a
                    href={item.href}
                    className={`flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 ${getAlignClasses()} ${
                      item.disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
                    }`}
                    onClick={(e) => {
                      e.preventDefault();
                      handleItemClick(item);
                    }}
                  >
                    {item.icon && (
                      <span className="mr-3 flex-shrink-0">
                        {item.icon}
                      </span>
                    )}
                    <span className="flex-1">{item.label}</span>
                  </a>
                ) : (
                  <button
                    type="button"
                    className={`w-full flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 ${getAlignClasses()} ${
                      item.disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
                    }`}
                    onClick={() => handleItemClick(item)}
                    disabled={item.disabled}
                  >
                    {item.icon && (
                      <span className="mr-3 flex-shrink-0">
                        {item.icon}
                      </span>
                    )}
                    <span className="flex-1">{item.label}</span>
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
