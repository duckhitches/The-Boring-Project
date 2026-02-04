/**
 * Copyright (c) 2025 Eshan Vijay Shettennavar
 * 
 * This file is licensed under the MIT License.
 * See LICENSE for full license terms.
 */

'use client';

import { motion } from 'framer-motion';
import { cn } from '../../lib/utils';

interface LoadingProps {
  message?: string;
  size?: 'sm' | 'md' | 'lg';
  fullPage?: boolean;
}

// Loader component - Brutalist style
// Set fullPage=true for page-level loading with black background
export default function Loading({ message = "Loading", size = 'md', fullPage = false }: LoadingProps) {
  const sizeConfig = {
    sm: { block: 'w-2 h-2', gap: 'gap-1', text: 'text-xs' },
    md: { block: 'w-3 h-3', gap: 'gap-1.5', text: 'text-sm' },
    lg: { block: 'w-4 h-4', gap: 'gap-2', text: 'text-base' }
  };

  const content = (
    <motion.div
      className="flex flex-col items-center relative z-10"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      {/* Brutalist block grid */}
      <div className={`grid grid-cols-3 ${sizeConfig[size].gap} mb-6`}>
        {[...Array(9)].map((_, i) => (
          <motion.div
            key={i}
            className={`${sizeConfig[size].block} bg-white`}
            animate={{
              opacity: [0.2, 1, 0.2],
            }}
            transition={{
              duration: 1.2,
              repeat: Infinity,
              delay: i * 0.1,
              ease: "easeInOut"
            }}
          />
        ))}
      </div>

      {/* Loading Text */}
      {message && (
        <div className="text-center">
          <p className={`${sizeConfig[size].text} font-mono uppercase tracking-[0.3em] text-white/60`}>
            {message}
          </p>
          {/* Progress bar */}
          <motion.div
            className="mt-3 h-px bg-white/40 origin-left"
            animate={{
              scaleX: [0, 1, 0],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            style={{ width: '100px' }}
          />
        </div>
      )}
    </motion.div>
  );

  // Full-page version with black background
  if (fullPage) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center relative">
        {/* Grid background */}
        <div className="absolute inset-0 bg-[url('/grid.svg')] bg-[length:30px_30px] opacity-10 pointer-events-none" />
        {content}
      </div>
    );
  }

  // Inline version (no background, fits in container)
  return (
    <div className="flex items-center justify-center py-8">
      {content}
    </div>
  );
}

// Component-level loader - Brutalist style
export const LoaderOne = ({ className }: { className?: string }) => {
  return (
    <div className={cn("flex items-center justify-center p-4", className)}>
      <div className="flex flex-col items-center">
        {/* Brutalist block grid */}
        <div className="grid grid-cols-3 gap-1">
          {[...Array(9)].map((_, i) => (
            <motion.div
              key={i}
              className="w-2 h-2 bg-white"
              animate={{
                opacity: [0.2, 1, 0.2],
              }}
              transition={{
                duration: 1.2,
                repeat: Infinity,
                delay: i * 0.1,
                ease: "easeInOut"
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

// Minimal inline loader - for buttons and small spaces
export const LoaderMinimal = ({ className, size = 'sm' }: { className?: string; size?: 'xs' | 'sm' | 'md' }) => {
  const sizeConfig = {
    xs: 'w-3 h-3',
    sm: 'w-4 h-4',
    md: 'w-5 h-5'
  };

  return (
    <div className={cn("flex items-center gap-1", className)}>
      {[...Array(3)].map((_, i) => (
        <motion.div
          key={i}
          className={`${sizeConfig[size]} border border-white/40`}
          animate={{
            opacity: [0.3, 1, 0.3],
            scale: [0.8, 1, 0.8],
          }}
          transition={{
            duration: 0.8,
            repeat: Infinity,
            delay: i * 0.15,
            ease: "easeInOut"
          }}
        />
      ))}
    </div>
  );
};

// Text-based loader for terminal/console aesthetic
export const LoaderText = ({ text = "Processing" }: { text?: string }) => {
  return (
    <div className="flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-white/60">
      <span>{text}</span>
      <motion.span
        animate={{ opacity: [0, 1, 0] }}
        transition={{ duration: 1.5, repeat: Infinity }}
      >
        _
      </motion.span>
    </div>
  );
};