import React from 'react';
import { cn } from '@/lib/utils';

// Enhanced animation components

/**
 * Fade in animation
 */
export function FadeIn({
  children,
  delay = 0,
  duration = 300,
  className
}: {
  children: React.ReactNode;
  delay?: number;
  duration?: number;
  className?: string;
}) {
  const [isVisible, setIsVisible] = React.useState(false);

  React.useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  return (
    <div
      className={cn(
        'transition-opacity ease-in-out',
        isVisible ? 'opacity-100' : 'opacity-0',
        className
      )}
      style={{ transitionDuration: `${duration}ms` }}
    >
      {children}
    </div>
  );
}

/**
 * Slide in animation
 */
export function SlideIn({
  children,
  direction = 'up',
  delay = 0,
  duration = 300,
  className
}: {
  children: React.ReactNode;
  direction?: 'up' | 'down' | 'left' | 'right';
  delay?: number;
  duration?: number;
  className?: string;
}) {
  const [isVisible, setIsVisible] = React.useState(false);

  React.useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  const directionClasses = {
    up: isVisible ? 'translate-y-0' : 'translate-y-4',
    down: isVisible ? 'translate-y-0' : '-translate-y-4',
    left: isVisible ? 'translate-x-0' : 'translate-x-4',
    right: isVisible ? 'translate-x-0' : '-translate-x-4'
  };

  return (
    <div
      className={cn(
        'transition-transform ease-out',
        directionClasses[direction],
        className
      )}
      style={{ transitionDuration: `${duration}ms` }}
    >
      {children}
    </div>
  );
}

/**
 * Scale in animation
 */
export function ScaleIn({
  children,
  delay = 0,
  duration = 300,
  className
}: {
  children: React.ReactNode;
  delay?: number;
  duration?: number;
  className?: string;
}) {
  const [isVisible, setIsVisible] = React.useState(false);

  React.useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  return (
    <div
      className={cn(
        'transition-transform ease-out',
        isVisible ? 'scale-100' : 'scale-95',
        className
      )}
      style={{ transitionDuration: `${duration}ms` }}
    >
      {children}
    </div>
  );
}

/**
 * Bounce animation
 */
export function Bounce({
  children,
  delay = 0,
  duration = 600,
  className
}: {
  children: React.ReactNode;
  delay?: number;
  duration?: number;
  className?: string;
}) {
  const [isVisible, setIsVisible] = React.useState(false);

  React.useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  return (
    <div
      className={cn(
        'transition-transform ease-out',
        isVisible ? 'animate-bounce' : 'scale-0',
        className
      )}
      style={{ transitionDuration: `${duration}ms` }}
    >
      {children}
    </div>
  );
}

/**
 * Pulse animation
 */
export function Pulse({
  children,
  delay = 0,
  duration = 1000,
  className
}: {
  children: React.ReactNode;
  delay?: number;
  duration?: number;
  className?: string;
}) {
  const [isVisible, setIsVisible] = React.useState(false);

  React.useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  return (
    <div
      className={cn(
        'transition-all ease-in-out',
        isVisible ? 'animate-pulse' : 'opacity-0',
        className
      )}
      style={{ transitionDuration: `${duration}ms` }}
    >
      {children}
    </div>
  );
}

/**
 * Rotate animation
 */
export function Rotate({
  children,
  delay = 0,
  duration = 1000,
  className
}: {
  children: React.ReactNode;
  delay?: number;
  duration?: number;
  className?: string;
}) {
  const [isVisible, setIsVisible] = React.useState(false);

  React.useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  return (
    <div
      className={cn(
        'transition-transform ease-in-out',
        isVisible ? 'animate-spin' : 'rotate-0',
        className
      )}
      style={{ transitionDuration: `${duration}ms` }}
    >
      {children}
    </div>
  );
}

/**
 * Stagger animation for lists
 */
export function Stagger({
  children,
  delay = 100,
  className
}: {
  children: React.ReactNode[];
  delay?: number;
  className?: string;
}) {
  return (
    <div className={className}>
      {children.map((child, index) => (
        <FadeIn key={index} delay={index * delay}>
          {child}
        </FadeIn>
      ))}
    </div>
  );
}

/**
 * Hover animation
 */
export function Hover({
  children,
  scale = 1.05,
  className
}: {
  children: React.ReactNode;
  scale?: number;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'transition-transform duration-200 ease-in-out hover:scale-105',
        className
      )}
      style={{ '--hover-scale': scale } as React.CSSProperties}
    >
      {children}
    </div>
  );
}

/**
 * Loading animation
 */
export function LoadingAnimation({
  size = 'md',
  className
}: {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8'
  };

  return (
    <div
      className={cn(
        'animate-spin rounded-full border-2 border-gray-300 border-t-primary-600',
        sizeClasses[size],
        className
      )}
    />
  );
}

/**
 * Progress animation
 */
export function ProgressAnimation({
  progress,
  duration = 1000,
  className
}: {
  progress: number;
  duration?: number;
  className?: string;
}) {
  const [animatedProgress, setAnimatedProgress] = React.useState(0);

  React.useEffect(() => {
    const startTime = Date.now();
    const startProgress = animatedProgress;
    const progressDiff = progress - startProgress;

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progressRatio = Math.min(elapsed / duration, 1);
      const easeOut = 1 - Math.pow(1 - progressRatio, 3);
      
      setAnimatedProgress(startProgress + progressDiff * easeOut);

      if (progressRatio < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [progress, duration, animatedProgress]);

  return (
    <div className={cn('w-full bg-gray-200 rounded-full h-2', className)}>
      <div
        className="bg-primary-600 h-2 rounded-full transition-all duration-300 ease-out"
        style={{ width: `${animatedProgress}%` }}
      />
    </div>
  );
}