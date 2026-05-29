import * as React from 'react';
import { cn } from '@/lib/utils';

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, type, ...props }, ref) => (
    <input
      type={type}
      className={cn(
        'flex h-11 w-full rounded-md border border-sand-200 bg-white px-4 py-2 text-sm text-sand-900 placeholder:text-sand-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ocean-500/30 focus-visible:border-ocean-500',
        className,
      )}
      ref={ref}
      {...props}
    />
  ),
);
Input.displayName = 'Input';
