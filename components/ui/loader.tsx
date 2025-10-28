'use client';

import { motion } from 'framer-motion';

interface LoadingProps {
  message?: string;
  size?: 'sm' | 'md' | 'lg';
}

// Full-screen loader for page-level loading
export default function Loading({ message = " ", size = 'md' }: LoadingProps) {
  const sizeConfig = {
    sm: { cube: 'w-4 h-4', gap: 'gap-1', text: 'text-xs' },
    md: { cube: 'w-6 h-6', gap: 'gap-2', text: 'text-sm' },
    lg: { cube: 'w-8 h-8', gap: 'gap-3', text: 'text-base' }
  };

  const cubeVariants = {
    initial: { scale: 1 },
    animate: { 
      scale: [1, 0.8, 1],
      rotate: [0, 180, 360],
      borderRadius: ["10%", "50%", "10%"],
    }
  };

  return (
    <div className="min-h-screen dark:bg-black transition-colors duration-300 backdrop-blur-sm flex items-center justify-center">
      <motion.div
        className="flex flex-col items-center space-y-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        {/* Cube Grid */}
        <div className={`grid grid-cols-3 ${sizeConfig[size].gap}`}>
          {[...Array(9)].map((_, i) => (
            <motion.div
              key={i}
              className={`${sizeConfig[size].cube} bg-gradient-to-br from-pink-500 to-purple-500 dark:from-blue-500 dark:to-purple-500 shadow-lg`}
              variants={cubeVariants}
              animate="animate"
              transition={{
                duration: 2,
                repeat: Infinity,
                delay: i * 0.1,
                ease: "easeInOut"
              }}
            />
          ))}
        </div>

        {/* Loading Text */}
        {message && (
          <motion.div 
            className="relative"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <p className={`${sizeConfig[size].text} text-gray-700 dark:text-gray-300 font-medium tracking-wide`}>
              {message}
            </p>
            <motion.div
              className="absolute -bottom-1 left-0 right-0 h-[2px] bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300"
              animate={{
                scaleX: [0, 1, 0],
                opacity: [0, 1, 0],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}

// Big loader for components (same as Loading but without full screen)
export const LoaderOne = () => {
  const cubeVariants = {
    initial: { scale: 1 },
    animate: { 
      scale: [1, 0.8, 1],
      rotate: [0, 180, 360],
      borderRadius: ["10%", "50%", "10%"],
    }
  };

  return (
    <div className="flex items-center justify-center p-8">
      <motion.div
        className="flex flex-col items-center space-y-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        {/* Cube Grid */}
        <div className="grid grid-cols-3 gap-2">
          {[...Array(9)].map((_, i) => (
            <motion.div
              key={i}
              className="w-6 h-6 bg-gradient-to-br from-pink-500 to-purple-500 dark:from-blue-500 dark:to-purple-500 shadow-lg"
              variants={cubeVariants}
              animate="animate"
              transition={{
                duration: 2,
                repeat: Infinity,
                delay: i * 0.1,
                ease: "easeInOut"
              }}
            />
          ))}
        </div>

        {/* Loading Text */}
        <motion.div 
          className="relative"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          {/* <p className="text-sm text-gray-700 dark:text-gray-300 font-medium tracking-wide">
            Loading...
          </p> */}
          <motion.div
            className="absolute -bottom-1 left-0 right-0 h-[2px] bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300"
            animate={{
              scaleX: [0, 1, 0],
              opacity: [0, 1, 0],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        </motion.div>
      </motion.div>
    </div>
  );
};