import React from 'react';
import { cn } from '@/lib/utils';
import { Button } from './button';
import { Card, CardContent } from './card';
import { Sun, Moon, Monitor, Palette } from 'lucide-react';

// Enhanced theme system

/**
 * Theme provider context
 */
const ThemeContext = React.createContext<{
  theme: 'light' | 'dark' | 'system';
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
}>({
  theme: 'system',
  setTheme: () => {}
});

/**
 * Theme provider component
 */
export function ThemeProvider({
  children,
  defaultTheme = 'system'
}: {
  children: React.ReactNode;
  defaultTheme?: 'light' | 'dark' | 'system';
}) {
  const [theme, setTheme] = React.useState<'light' | 'dark' | 'system'>(defaultTheme);

  React.useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');
    
    if (theme === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      root.classList.add(systemTheme);
    } else {
      root.classList.add(theme);
    }
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

/**
 * Hook to use theme
 */
export function useTheme() {
  const context = React.useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

/**
 * Theme switcher component
 */
export function ThemeSwitcher({
  className
}: {
  className?: string;
}) {
  const { theme, setTheme } = useTheme();

  return (
    <div className={cn('flex items-center gap-1 p-1 bg-gray-100 rounded-lg', className)}>
      <Button
        variant={theme === 'light' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => setTheme('light')}
        className="flex items-center gap-2"
      >
        <Sun className="h-4 w-4" />
        <span className="hidden sm:inline">Light</span>
      </Button>
      <Button
        variant={theme === 'dark' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => setTheme('dark')}
        className="flex items-center gap-2"
      >
        <Moon className="h-4 w-4" />
        <span className="hidden sm:inline">Dark</span>
      </Button>
      <Button
        variant={theme === 'system' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => setTheme('system')}
        className="flex items-center gap-2"
      >
        <Monitor className="h-4 w-4" />
        <span className="hidden sm:inline">System</span>
      </Button>
    </div>
  );
}

/**
 * Color palette component
 */
export function ColorPalette({
  colors,
  selectedColor,
  onColorSelect,
  className
}: {
  colors: Array<{ name: string; value: string; css: string }>;
  selectedColor?: string;
  onColorSelect: (color: string) => void;
  className?: string;
}) {
  return (
    <div className={cn('grid grid-cols-4 gap-2', className)}>
      {colors.map((color) => (
        <button
          key={color.name}
          onClick={() => onColorSelect(color.value)}
          className={cn(
            'w-8 h-8 rounded-full border-2 transition-all',
            selectedColor === color.value
              ? 'border-gray-900 scale-110'
              : 'border-gray-300 hover:scale-105'
          )}
          style={{ backgroundColor: color.css }}
          title={color.name}
        />
      ))}
    </div>
  );
}

/**
 * Theme preview component
 */
export function ThemePreview({
  theme,
  className
}: {
  theme: 'light' | 'dark';
  className?: string;
}) {
  return (
    <div className={cn('p-4 rounded-lg border', className)}>
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-primary-600 rounded-full" />
          <div>
            <div className="h-3 bg-gray-900 rounded w-20" />
            <div className="h-2 bg-gray-600 rounded w-16 mt-1" />
          </div>
        </div>
        <div className="space-y-2">
          <div className="h-2 bg-gray-200 rounded w-full" />
          <div className="h-2 bg-gray-200 rounded w-3/4" />
          <div className="h-2 bg-gray-200 rounded w-1/2" />
        </div>
        <div className="flex gap-2">
          <div className="h-6 bg-primary-600 rounded w-16" />
          <div className="h-6 bg-gray-200 rounded w-16" />
        </div>
      </div>
    </div>
  );
}