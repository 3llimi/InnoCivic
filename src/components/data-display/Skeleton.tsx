import React from 'react';
import { BaseComponentProps } from '../../types';

interface SkeletonProps extends BaseComponentProps {
  variant?: 'text' | 'rectangular' | 'circular' | 'rounded';
  width?: string | number;
  height?: string | number;
  animation?: 'pulse' | 'wave' | 'none';
  lines?: number;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  variant = 'text',
  width,
  height,
  animation = 'pulse',
  lines = 1,
  className = '',
}) => {
  const getVariantClasses = () => {
    const variants = {
      text: 'h-4',
      rectangular: 'h-20',
      circular: 'rounded-full',
      rounded: 'rounded-lg',
    };
    return variants[variant];
  };

  const getAnimationClasses = () => {
    const animations = {
      pulse: 'animate-pulse',
      wave: 'animate-wave',
      none: '',
    };
    return animations[animation];
  };

  const getWidth = () => {
    if (width) {
      return typeof width === 'number' ? `${width}px` : width;
    }
    return variant === 'circular' ? '100%' : '100%';
  };

  const getHeight = () => {
    if (height) {
      return typeof height === 'number' ? `${height}px` : height;
    }
    return variant === 'circular' ? '100%' : undefined;
  };

  const baseClasses = 'bg-gray-200 dark:bg-gray-700';
  const variantClasses = getVariantClasses();
  const animationClasses = getAnimationClasses();

  const style = {
    width: getWidth(),
    height: getHeight(),
  };

  if (lines > 1) {
    return (
      <div className={className}>
        {Array.from({ length: lines }).map((_, index) => (
          <div
            key={index}
            className={`${baseClasses} ${variantClasses} ${animationClasses} ${
              index < lines - 1 ? 'mb-2' : ''
            }`}
            style={index === lines - 1 ? style : undefined}
          />
        ))}
      </div>
    );
  }

  return (
    <div
      className={`${baseClasses} ${variantClasses} ${animationClasses} ${className}`}
      style={style}
    />
  );
};
