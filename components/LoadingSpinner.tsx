import React from 'react';

interface LoadingSpinnerProps {
  size?: number;
  color?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ size = 6, color = 'border-white' }) => {
  const sizeClasses = `h-${size} w-${size}`;
  return (
    <div className={`animate-spin rounded-full ${sizeClasses} border-b-2 ${color}`}></div>
  );
};
