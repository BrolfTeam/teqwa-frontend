import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

const Badge = React.forwardRef(
  (
    {
      children,
      variant = 'primary',
      size = 'md',
      className = '',
      animate = false,
      ...props
    },
    ref
  ) => {
    const baseStyles = 'inline-flex items-center font-medium rounded-full transition-all duration-200 border';

    const variants = {
      primary: 'bg-primary/10 text-primary border-primary/20 hover:bg-primary/20 shadow-sm',
      secondary: 'bg-secondary/10 text-secondary-foreground border-secondary/20 hover:bg-secondary/20 shadow-sm',
      accent: 'bg-accent/10 text-accent-foreground border-accent/20 hover:bg-accent/20',
      success: 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100 dark:bg-green-900/20 dark:text-green-300 dark:border-green-800',
      warning: 'bg-yellow-50 text-yellow-700 border-yellow-200 hover:bg-yellow-100 dark:bg-yellow-900/20 dark:text-yellow-300 dark:border-yellow-800',
      error: 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-300 dark:border-red-800',
      outline: 'bg-transparent border-border hover:bg-accent/5 hover:text-accent-foreground',
      ghost: 'bg-transparent border-transparent hover:bg-accent/5 hover:text-accent-foreground',
    };

    const sizes = {
      sm: 'px-2 py-0.5 text-xs',
      md: 'px-2.5 py-0.5 text-sm',
      lg: 'px-3 py-1 text-base',
    };

    const Component = animate ? motion.span : 'span';
    const motionProps = animate ? {
      whileHover: { scale: 1.05 },
      whileTap: { scale: 0.95 },
      transition: { type: 'spring', stiffness: 400, damping: 17 }
    } : {};

    return (
      <Component
        className={cn(
          baseStyles,
          variants[variant],
          sizes[size],
          className
        )}
        ref={ref}
        {...motionProps}
        {...props}
      >
        {children}
      </Component>
    );
  }
);

Badge.displayName = 'Badge';

export { Badge };
export default Badge;