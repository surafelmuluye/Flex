import React from 'react';
import { cn } from '@/lib/utils';

// Accessibility utilities and components

/**
 * Screen reader only text component
 */
export function ScreenReaderOnly({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <span className={cn('sr-only', className)}>
      {children}
    </span>
  );
}

/**
 * Focus trap component for modals and dropdowns
 */
export function FocusTrap({ children, className }: { children: React.ReactNode; className?: string }) {
  const containerRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const firstElement = focusableElements[0] as HTMLElement;
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          lastElement?.focus();
          e.preventDefault();
        }
      } else {
        if (document.activeElement === lastElement) {
          firstElement?.focus();
          e.preventDefault();
        }
      }
    };

    container.addEventListener('keydown', handleTabKey);
    firstElement?.focus();

    return () => {
      container.removeEventListener('keydown', handleTabKey);
    };
  }, []);

  return (
    <div ref={containerRef} className={className}>
      {children}
    </div>
  );
}

/**
 * Skip link component for keyboard navigation
 */
export function SkipLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a
      href={href}
      className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary-600 focus:text-white focus:rounded-md focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
    >
      {children}
    </a>
  );
}

/**
 * ARIA live region for announcements
 */
export function LiveRegion({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-atomic="true"
      className={cn('sr-only', className)}
    >
      {children}
    </div>
  );
}

/**
 * Loading spinner with accessibility features
 */
export function AccessibleSpinner({ 
  size = 'md', 
  label = 'Loading...',
  className 
}: { 
  size?: 'sm' | 'md' | 'lg'; 
  label?: string;
  className?: string;
}) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8'
  };

  return (
    <div className={cn('flex items-center justify-center', className)}>
      <div
        className={cn(
          'animate-spin rounded-full border-2 border-gray-300 border-t-primary-600',
          sizeClasses[size]
        )}
        role="status"
        aria-label={label}
      >
        <ScreenReaderOnly>{label}</ScreenReaderOnly>
      </div>
    </div>
  );
}

/**
 * Enhanced button with accessibility features
 */
export function AccessibleButton({
  children,
  onClick,
  disabled = false,
  loading = false,
  variant = 'primary',
  size = 'md',
  className,
  'aria-label': ariaLabel,
  'aria-describedby': ariaDescribedBy,
  ...props
}: {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  loading?: boolean;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  'aria-label'?: string;
  'aria-describedby'?: string;
} & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const baseClasses = 'inline-flex items-center justify-center rounded-md font-medium transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';
  
  const variantClasses = {
    primary: 'bg-primary-600 text-white hover:bg-primary-700 focus:ring-primary-500',
    secondary: 'bg-gray-200 text-gray-900 hover:bg-gray-300 focus:ring-gray-500',
    outline: 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 focus:ring-primary-500',
    ghost: 'text-gray-700 hover:bg-gray-100 focus:ring-gray-500',
    destructive: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500'
  };

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base'
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      className={cn(
        baseClasses,
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
      aria-label={ariaLabel}
      aria-describedby={ariaDescribedBy}
      aria-disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <AccessibleSpinner size="sm" className="mr-2" />
      )}
      {children}
    </button>
  );
}

/**
 * Enhanced input with accessibility features
 */
export function AccessibleInput({
  label,
  error,
  helperText,
  required = false,
  className,
  ...props
}: {
  label: string;
  error?: string;
  helperText?: string;
  required?: boolean;
  className?: string;
} & React.InputHTMLAttributes<HTMLInputElement>) {
  const id = React.useId();
  const errorId = error ? `${id}-error` : undefined;
  const helperId = helperText ? `${id}-helper` : undefined;

  return (
    <div className="space-y-1">
      <label
        htmlFor={id}
        className="block text-sm font-medium text-gray-700"
      >
        {label}
        {required && (
          <span className="text-red-500 ml-1" aria-label="required">
            *
          </span>
        )}
      </label>
      <input
        id={id}
        className={cn(
          'block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm',
          error && 'border-red-300 focus:border-red-500 focus:ring-red-500',
          className
        )}
        aria-invalid={error ? 'true' : 'false'}
        aria-describedby={cn(errorId, helperId)}
        required={required}
        {...props}
      />
      {error && (
        <p id={errorId} className="text-sm text-red-600" role="alert">
          {error}
        </p>
      )}
      {helperText && !error && (
        <p id={helperId} className="text-sm text-gray-500">
          {helperText}
        </p>
      )}
    </div>
  );
}

/**
 * Enhanced card with accessibility features
 */
export function AccessibleCard({
  children,
  title,
  description,
  className,
  ...props
}: {
  children: React.ReactNode;
  title?: string;
  description?: string;
  className?: string;
} & React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'rounded-lg border border-gray-200 bg-white shadow-sm',
        className
      )}
      role="region"
      aria-labelledby={title ? 'card-title' : undefined}
      aria-describedby={description ? 'card-description' : undefined}
      {...props}
    >
      {(title || description) && (
        <div className="p-6 pb-0">
          {title && (
            <h3 id="card-title" className="text-lg font-semibold text-gray-900">
              {title}
            </h3>
          )}
          {description && (
            <p id="card-description" className="mt-1 text-sm text-gray-600">
              {description}
            </p>
          )}
        </div>
      )}
      <div className="p-6">
        {children}
      </div>
    </div>
  );
}

/**
 * Enhanced table with accessibility features
 */
export function AccessibleTable({
  children,
  caption,
  className,
  ...props
}: {
  children: React.ReactNode;
  caption?: string;
  className?: string;
} & React.TableHTMLAttributes<HTMLTableElement>) {
  return (
    <div className="overflow-x-auto">
      <table
        className={cn('min-w-full divide-y divide-gray-200', className)}
        role="table"
        {...props}
      >
        {caption && (
          <caption className="sr-only">
            {caption}
          </caption>
        )}
        {children}
      </table>
    </div>
  );
}

/**
 * Enhanced modal with accessibility features
 */
export function AccessibleModal({
  isOpen,
  onClose,
  title,
  children,
  className
}: {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  className?: string;
}) {
  const modalRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div className="flex min-h-screen items-center justify-center p-4">
        <div
          className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
          onClick={onClose}
          aria-hidden="true"
        />
        <FocusTrap className="relative w-full max-w-md">
          <div
            ref={modalRef}
            className={cn(
              'relative rounded-lg bg-white shadow-xl',
              className
            )}
          >
            <div className="p-6">
              <h2 id="modal-title" className="text-lg font-semibold text-gray-900">
                {title}
              </h2>
              <div className="mt-4">
                {children}
              </div>
            </div>
          </div>
        </FocusTrap>
      </div>
    </div>
  );
}


