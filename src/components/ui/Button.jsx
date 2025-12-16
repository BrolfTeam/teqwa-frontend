import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

const Button = React.forwardRef(
  (
    {
      children,
      variant = 'primary',
      size = 'md',
      className = '',
      isLoading = false,
      leftIcon: LeftIcon,
      rightIcon: RightIcon,
      asChild = false,
      ...props
    },
    ref
  ) => {
    const baseStyles = 'inline-flex items-center justify-center transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none relative overflow-hidden select-none font-semibold tracking-wide [&_a]:text-inherit [&_a]:hover:text-inherit';

    const variants = {
      primary: 'bg-primary text-primary-foreground shadow-md hover:brightness-110 hover:shadow-lg hover:shadow-primary/30 hover:ring-2 hover:ring-primary/50 active:scale-95 border border-primary/20',
      secondary: 'bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80 hover:shadow-md hover:shadow-secondary/20 active:scale-95 border border-secondary/30',
      outline: 'border-2 border-primary text-foreground bg-transparent shadow-sm hover:bg-primary hover:text-primary-foreground hover:shadow-md hover:shadow-primary/20',
      ghost: 'hover:bg-accent/10 hover:text-foreground',
      link: 'text-primary underline-offset-4 hover:underline',
      destructive: 'bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90 active:scale-95',
    };

    const sizes = {
      sm: 'h-9 px-4 text-xs rounded-lg', // 36px
      md: 'h-11 px-6 py-2 rounded-xl',   // 44px (Touch target compliant)
      lg: 'h-12 px-8 rounded-xl text-lg',
      xl: 'h-14 px-10 text-xl rounded-2xl',
      icon: 'h-11 w-11 rounded-xl',
    };

    const Component = asChild ? 'span' : motion.button;
    const motionProps = asChild ? {} : {
      whileHover: { scale: 1.02 },
      whileTap: { scale: 0.98 },
      transition: { type: 'spring', stiffness: 400, damping: 17 }
    };

    return (
      <Component
        className={cn(
          baseStyles,
          'font-semibold',
          variants[variant],
          sizes[size],
          isLoading && 'cursor-not-allowed',
          className
        )}
        ref={ref}
        disabled={isLoading}
        {...motionProps}
        {...props}
      >
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-inherit">
            <svg
              className="animate-spin h-4 w-4 text-current"
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
          </div>
        )}
        <div className={cn('flex items-center gap-2', isLoading && 'invisible')}>
          {LeftIcon && <LeftIcon className="h-4 w-4 flex-shrink-0" />}
          <span className="truncate">{children}</span>
          {RightIcon && <RightIcon className="h-4 w-4 flex-shrink-0" />}
        </div>
      </Component>
    );
  }
);

Button.displayName = 'Button';

export { Button };
export default Button;