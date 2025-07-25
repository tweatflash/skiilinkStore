import React from 'react';
import { cn } from '../../utils/cn';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

const Card: React.FC<CardProps> = ({ 
  children, 
  className, 
  hover = false, 
  padding = 'md' 
}) => {
  const paddingStyles = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8'
  };

  return (
    <div
      className={cn(
        ' sm:bg-white dark:bg-gray-900 sm:border sm:border-gray-200 sm:dark:border-gray-800 sm:rounded-2xl sm:shadow-sm',
        hover && 'sm:hover:shadow-xl sm:hover:shadow-gray-200/50 sm:dark:hover:shadow-gray-900/50 transition-all duration-300 hover:-translate-y-1',
        paddingStyles[padding],
        className
      )}
    >
      {children}
    </div>
  );
};

export default Card;