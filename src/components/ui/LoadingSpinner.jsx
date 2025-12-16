import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

const LoadingSpinner = ({ 
  size = 'md',
  variant = 'primary',
  className = '',
  text,
  ...props
}) => {
  const sizes = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8',
    xl: 'h-12 w-12',
  };

  const variants = {
    primary: 'text-primary',
    secondary: 'text-secondary',
    accent: 'text-accent-foreground',
    muted: 'text-muted-foreground',
  };

  const Spinner = () => (
    <motion.div 
      className={cn('inline-block', className)}
      animate={{ rotate: 360 }}
      transition={{
        duration: 1,
        repeat: Infinity,
        ease: 'linear'
      }}
      {...props}
    >
      <svg
        className={cn(sizes[size], variants[variant])}
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        />
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        />
      </svg>
      <span className="sr-only">Loading...</span>
    </motion.div>
  );

  if (text) {
    return (
      <div className="flex flex-col items-center space-y-3">
        <Spinner />
        <motion.p 
          className="text-sm text-muted-foreground"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          {text}
        </motion.p>
      </div>
    );
  }

  return <Spinner />;
};

// Pulse variant for different loading states
export const PulseLoader = ({ size = 'md', className = '' }) => {
  const sizes = {
    sm: 'w-2 h-2',
    md: 'w-3 h-3',
    lg: 'w-4 h-4',
  };

  return (
    <div className={cn('flex space-x-1', className)}>
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className={cn(
            'bg-primary rounded-full',
            sizes[size]
          )}
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.7, 1, 0.7],
          }}
          transition={{
            duration: 0.6,
            repeat: Infinity,
            delay: i * 0.1,
          }}
        />
      ))}
    </div>
  );
};

export default LoadingSpinner;
