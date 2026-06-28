import * as React from 'react';
import { motion } from 'framer-motion';
import type { HTMLMotionProps } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import MagneticButton from './MagneticButton';

interface ButtonProps extends HTMLMotionProps<'button'> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', isLoading, children, ...props }, ref) => {
    const baseStyles = 'inline-flex items-center justify-center rounded-lg font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-slate-900';
    
    const variants = {
      primary: 'bg-[var(--cta-bg)] text-[var(--cta-fg)] hover:opacity-90 focus-visible:ring-[var(--cta-bg)] shadow-[var(--shadow-cta)]',
      secondary: 'bg-[var(--card)] text-[var(--foreground)] border border-[var(--border)] hover:bg-[var(--border)] focus-visible:ring-[var(--border)] shadow-sm hover:shadow-md',
      ghost: 'hover:bg-[var(--border)] text-[var(--muted-foreground)] hover:text-[var(--foreground)]',
      danger: 'bg-[var(--danger)] text-white hover:opacity-90',
    };
    
    const sizes = {
      sm: 'h-9 px-3 text-sm',
      md: 'h-11 px-4 py-2',
      lg: 'h-14 px-8 text-lg',
    };

    return (
      <MagneticButton>
        <motion.button
          ref={ref}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className={cn(baseStyles, variants[variant], sizes[size], className)}
          disabled={isLoading || props.disabled}
          {...props}
        >
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {children as React.ReactNode}
        </motion.button>
      </MagneticButton>
    );
  }
);
Button.displayName = 'Button';
