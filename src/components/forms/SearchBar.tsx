import React, { useState, useRef, useEffect } from 'react';
import { BaseComponentProps } from '../../types';

interface SearchSuggestion {
  text: string;
  type: 'dataset' | 'category' | 'tag' | 'user';
  count?: number;
}

interface SearchBarProps extends BaseComponentProps {
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
  onSearch?: (query: string) => void;
  suggestions?: SearchSuggestion[];
  onSuggestionSelect?: (suggestion: SearchSuggestion) => void;
  loading?: boolean;
  disabled?: boolean;
  showSuggestions?: boolean;
  maxSuggestions?: number;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  placeholder = 'Search...',
  value,
  onChange,
  onSearch,
  suggestions = [],
  onSuggestionSelect,
  loading = false,
  disabled = false,
  showSuggestions = true,
  maxSuggestions = 10,
  className = '',
}) => {
  const [internalValue, setInternalValue] = useState(value ?? '');
  const [isOpen, setIsOpen] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  const controlledValue = value !== undefined;
  const inputValue = controlledValue ? value! : internalValue;

  const filteredSuggestions = suggestions.slice(0, maxSuggestions);

  useEffect(() => {
    if (controlledValue) {
      setInternalValue(value ?? '');
    }
  }, [controlledValue, value]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInternalValue(newValue);
    onChange?.(newValue);
    setIsOpen(newValue.length > 0 && showSuggestions);
    setFocusedIndex(-1);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen || filteredSuggestions.length === 0) {
      if (e.key === 'Enter') {
        onSearch?.(inputValue);
        setIsOpen(false);
      }
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setFocusedIndex(prev =>
          prev < filteredSuggestions.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setFocusedIndex(prev => prev > 0 ? prev - 1 : -1);
        break;
      case 'Enter':
        e.preventDefault();
        if (focusedIndex >= 0) {
          handleSuggestionSelect(filteredSuggestions[focusedIndex]);
        } else {
          onSearch?.(inputValue);
          setIsOpen(false);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        setFocusedIndex(-1);
        break;
    }
  };

  const handleSuggestionSelect = (suggestion: SearchSuggestion) => {
    onChange?.(suggestion.text);
    onSuggestionSelect?.(suggestion);
    setIsOpen(false);
    setFocusedIndex(-1);
    inputRef.current?.focus();
  };

  const handleInputFocus = () => {
    if (inputValue.length > 0 && showSuggestions) {
      setIsOpen(true);
    }
  };

  const getSuggestionIcon = (type: string) => {
    const icons = {
      dataset: '📊',
      category: '🏷️',
      tag: '#',
      user: '👤',
    };
    return icons[type as keyof typeof icons] || '🔍';
  };

  return (
    <div className={`relative ${className}`}>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          {loading ? (
            <svg className="animate-spin h-5 w-5 text-gray-400 dark:text-gray-500" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          ) : (
            <svg className="h-5 w-5 text-gray-400 dark:text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          )}
        </div>

        <input
          ref={inputRef}
          type="text"
          placeholder={placeholder}
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={handleInputFocus}
          disabled={disabled}
          className="block w-full pl-10 pr-3 py-2 border rounded-md leading-5 focus:outline-none focus:ring-1 sm:text-sm border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:placeholder-gray-400 dark:focus:placeholder-gray-300 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400"
        />
      </div>

      {isOpen && filteredSuggestions.length > 0 && (
        <div
          ref={suggestionsRef}
          className="absolute z-10 mt-1 w-full bg-white dark:bg-gray-800 shadow-lg max-h-60 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 dark:ring-gray-700 overflow-auto focus:outline-none sm:text-sm"
        >
          {filteredSuggestions.map((suggestion, index) => (
            <div
              key={`${suggestion.type}-${suggestion.text}`}
              className={`cursor-pointer select-none relative py-2 pl-3 pr-9 ${
                index === focusedIndex ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-900 dark:text-blue-300' : 'text-gray-900 dark:text-gray-100'
              }`}
              onClick={() => handleSuggestionSelect(suggestion)}
            >
              <div className="flex items-center">
                <span className="mr-2 text-sm">
                  {getSuggestionIcon(suggestion.type)}
                </span>
                <span className="block truncate font-normal">
                  {suggestion.text}
                </span>
                {suggestion.count && (
                  <span className="ml-auto text-xs text-gray-500 dark:text-gray-400">
                    {suggestion.count}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
