/**
 * Copyright (c) 2025 Eshan Vijay Shettennavar
 * 
 * This file is licensed under the MIT License.
 * See LICENSE for full license terms.
 */

import React from 'react';
import { motion } from 'framer-motion';

interface LoadingSpinnerProps {
  size?: 'xs' | 'sm' | 'md' | 'lg';
  color?: string;
  label?: string;
}

// Brutalist loading spinner - uses sharp blocks instead of circular spinner
export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = 'md', 
  color = 'bg-white',
  label 
}) => {
  const sizeConfig = {
    xs: { block: 'w-1 h-1', gap: 'gap-0.5' },
    sm: { block: 'w-1.5 h-1.5', gap: 'gap-0.5' },
    md: { block: 'w-2 h-2', gap: 'gap-1' },
    lg: { block: 'w-3 h-3', gap: 'gap-1' }
  };

  return (
    <div className="flex items-center gap-3">
      {/* Sharp block spinner */}
      <div className={`flex ${sizeConfig[size].gap}`}>
        {[...Array(3)].map((_, i) => (
          <motion.div
            key={i}
            className={`${sizeConfig[size].block} ${color}`}
            animate={{
              opacity: [0.3, 1, 0.3],
              scale: [0.8, 1, 0.8],
            }}
            transition={{
              duration: 0.6,
              repeat: Infinity,
              delay: i * 0.1,
              ease: "easeInOut"
            }}
          />
        ))}
      </div>
      
      {/* Optional label */}
      {label && (
        <span className="font-mono text-[10px] uppercase tracking-widest text-white/50">
          {label}
        </span>
      )}
    </div>
  );
};

// Alternative: Border-based spinner for inline use
export const BorderSpinner: React.FC<{ size?: number; className?: string }> = ({ 
  size = 4, 
  className = '' 
}) => {
  return (
    <div 
      className={`animate-spin border border-white/40 border-t-white ${className}`}
      style={{ 
        width: `${size * 4}px`, 
        height: `${size * 4}px` 
      }}
    />
  );
};
