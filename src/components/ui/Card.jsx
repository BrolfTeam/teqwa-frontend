import React, { memo } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

const Card = memo(React.forwardRef(
  (
    {
      children,
      className = '',
      variant = 'default',
      hoverable = false,
      gradient = false,
      ...props
    },
    ref
  ) => {
    const baseStyles = 'rounded-xl border bg-card text-card-foreground shadow-card overflow-hidden transition-all duration-300';

    const variants = {
      default: 'border-border/50 bg-card text-card-foreground shadow-sm hover:shadow-md',
      primary: 'border-primary/10 bg-primary/5 text-card-foreground',
      secondary: 'border-secondary/10 bg-secondary/5 text-card-foreground',
      accent: 'border-accent/10 bg-accent/5 text-card-foreground',
      outline: 'border-border bg-transparent text-card-foreground hover:bg-accent/5',
      ghost: 'border-transparent shadow-none bg-transparent text-card-foreground hover:bg-accent/5',
      glass: 'border-white/20 bg-white/10 backdrop-blur-md text-white shadow-lg',
    };

    const hoverStyles = hoverable
      ? 'transition-all duration-300 hover:shadow-card-hover hover:-translate-y-1 hover:border-border cursor-pointer'
      : 'transition-all duration-200';

    const gradientOverlay = gradient && (
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 pointer-events-none" />
    );

    return (
      <motion.div
        className={cn(
          baseStyles,
          variants[variant],
          hoverStyles,
          gradient && 'relative',
          className
        )}
        ref={ref}
        whileHover={hoverable ? {
          scale: 1.02,
          transition: { type: 'spring', stiffness: 400, damping: 17 }
        } : {}}
        whileTap={hoverable ? { scale: 0.98 } : {}}
        {...props}
      >
        {gradientOverlay}
        <div className="relative z-10">
          {children}
        </div>
      </motion.div>
    );
  }
));

const CardHeader = memo(({ className, ...props }) => (
  <div
    className={cn('flex flex-col space-y-1.5 p-6 pb-4', className)}
    {...props}
  />
));

const CardTitle = memo(({ className, gradient = false, ...props }) => (
  <h3
    className={cn(
      'text-2xl font-semibold leading-none tracking-tight',
      gradient && 'gradient-text',
      className
    )}
    {...props}
  />
));

const CardDescription = memo(({ className, ...props }) => (
  <p
    className={cn('text-sm text-muted-foreground leading-relaxed', className)}
    {...props}
  />
));

const CardContent = memo(({ className, ...props }) => (
  <div className={cn('p-6 pt-0', className)} {...props} />
));

const CardFooter = memo(({ className, ...props }) => (
  <div
    className={cn('flex items-center p-6 pt-4 border-t border-border/50', className)}
    {...props}
  />
));

const CardImage = memo(({ className, alt, ...props }) => (
  <div className={cn('relative overflow-hidden', className)}>
    <img
      className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
      alt={alt}
      {...props}
    />
  </div>
));

Card.displayName = 'Card';
CardHeader.displayName = 'CardHeader';
CardTitle.displayName = 'CardTitle';
CardDescription.displayName = 'CardDescription';
CardContent.displayName = 'CardContent';
CardFooter.displayName = 'CardFooter';
CardImage.displayName = 'CardImage';

export {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  CardImage,
};

export default Card;
