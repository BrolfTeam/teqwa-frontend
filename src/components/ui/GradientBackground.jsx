import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

const GradientBackground = ({ 
  children, 
  variant = 'primary',
  className = '',
  animated = false,
  ...props 
}) => {
  const variants = {
    primary: 'bg-gradient-to-br from-primary/5 via-background to-accent/5',
    secondary: 'bg-gradient-to-br from-secondary/5 via-background to-primary/5',
    accent: 'bg-gradient-to-br from-accent/5 via-background to-secondary/5',
    hero: 'bg-gradient-to-br from-primary/10 via-background to-accent/10',
    subtle: 'bg-gradient-to-br from-muted/20 via-background to-muted/10',
  };

  const Component = animated ? motion.div : 'div';
  const motionProps = animated ? {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    transition: { duration: 1 }
  } : {};

  return (
    <Component
      className={cn(
        'relative overflow-hidden',
        variants[variant],
        className
      )}
      {...motionProps}
      {...props}
    >
      {animated && (
        <div className="absolute inset-0">
          {[...Array(3)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute inset-0 opacity-30"
              animate={{
                background: [
                  'radial-gradient(circle at 20% 50%, rgba(11, 107, 81, 0.1) 0%, transparent 50%)',
                  'radial-gradient(circle at 80% 20%, rgba(201, 164, 74, 0.1) 0%, transparent 50%)',
                  'radial-gradient(circle at 40% 80%, rgba(9, 42, 58, 0.1) 0%, transparent 50%)',
                  'radial-gradient(circle at 20% 50%, rgba(11, 107, 81, 0.1) 0%, transparent 50%)',
                ],
              }}
              transition={{
                duration: 10,
                repeat: Infinity,
                delay: i * 2,
              }}
            />
          ))}
        </div>
      )}
      <div className="relative z-10">
        {children}
      </div>
    </Component>
  );
};

export { GradientBackground };
export default GradientBackground;