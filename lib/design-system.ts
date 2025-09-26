// Design System Configuration
export const designSystem = {
  // Color Palette
  colors: {
    primary: {
      50: '#f0f9ff',
      100: '#e0f2fe',
      200: '#bae6fd',
      300: '#7dd3fc',
      400: '#38bdf8',
      500: '#0ea5e9',
      600: '#0284c7',
      700: '#0369a1',
      800: '#075985',
      900: '#0c4a6e',
    },
    secondary: {
      50: '#f8fafc',
      100: '#f1f5f9',
      200: '#e2e8f0',
      300: '#cbd5e1',
      400: '#94a3b8',
      500: '#64748b',
      600: '#475569',
      700: '#334155',
      800: '#1e293b',
      900: '#0f172a',
    },
    success: {
      50: '#f0fdf4',
      100: '#dcfce7',
      200: '#bbf7d0',
      300: '#86efac',
      400: '#4ade80',
      500: '#22c55e',
      600: '#16a34a',
      700: '#15803d',
      800: '#166534',
      900: '#14532d',
    },
    warning: {
      50: '#fffbeb',
      100: '#fef3c7',
      200: '#fde68a',
      300: '#fcd34d',
      400: '#fbbf24',
      500: '#f59e0b',
      600: '#d97706',
      700: '#b45309',
      800: '#92400e',
      900: '#78350f',
    },
    error: {
      50: '#fef2f2',
      100: '#fee2e2',
      200: '#fecaca',
      300: '#fca5a5',
      400: '#f87171',
      500: '#ef4444',
      600: '#dc2626',
      700: '#b91c1c',
      800: '#991b1b',
      900: '#7f1d1d',
    },
    info: {
      50: '#eff6ff',
      100: '#dbeafe',
      200: '#bfdbfe',
      300: '#93c5fd',
      400: '#60a5fa',
      500: '#3b82f6',
      600: '#2563eb',
      700: '#1d4ed8',
      800: '#1e40af',
      900: '#1e3a8a',
    },
  },

  // Typography
  typography: {
    fontFamily: {
      sans: ['Inter', 'system-ui', 'sans-serif'],
      mono: ['JetBrains Mono', 'monospace'],
    },
    fontSize: {
      xs: '0.75rem',    // 12px
      sm: '0.875rem',   // 14px
      base: '1rem',     // 16px
      lg: '1.125rem',   // 18px
      xl: '1.25rem',    // 20px
      '2xl': '1.5rem',  // 24px
      '3xl': '1.875rem', // 30px
      '4xl': '2.25rem', // 36px
      '5xl': '3rem',    // 48px
    },
    fontWeight: {
      light: '300',
      normal: '400',
      medium: '500',
      semibold: '600',
      bold: '700',
      extrabold: '800',
    },
    lineHeight: {
      tight: '1.25',
      snug: '1.375',
      normal: '1.5',
      relaxed: '1.625',
      loose: '2',
    },
  },

  // Spacing
  spacing: {
    0: '0',
    1: '0.25rem',   // 4px
    2: '0.5rem',    // 8px
    3: '0.75rem',   // 12px
    4: '1rem',      // 16px
    5: '1.25rem',   // 20px
    6: '1.5rem',    // 24px
    8: '2rem',      // 32px
    10: '2.5rem',   // 40px
    12: '3rem',     // 48px
    16: '4rem',     // 64px
    20: '5rem',     // 80px
    24: '6rem',     // 96px
    32: '8rem',     // 128px
  },

  // Border Radius
  borderRadius: {
    none: '0',
    sm: '0.125rem',   // 2px
    base: '0.25rem',  // 4px
    md: '0.375rem',   // 6px
    lg: '0.5rem',     // 8px
    xl: '0.75rem',    // 12px
    '2xl': '1rem',    // 16px
    '3xl': '1.5rem',  // 24px
    full: '9999px',
  },

  // Shadows
  shadows: {
    sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    base: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
    md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
    lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
    xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
    '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.25)',
    inner: 'inset 0 2px 4px 0 rgb(0 0 0 / 0.05)',
  },

  // Breakpoints
  breakpoints: {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px',
  },

  // Animation
  animation: {
    duration: {
      fast: '150ms',
      normal: '200ms',
      slow: '300ms',
    },
    easing: {
      linear: 'linear',
      ease: 'ease',
      easeIn: 'ease-in',
      easeOut: 'ease-out',
      easeInOut: 'ease-in-out',
    },
  },
};

// Component Variants
export const componentVariants = {
  button: {
    primary: {
      base: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500',
      disabled: 'bg-gray-300 text-gray-500 cursor-not-allowed',
    },
    secondary: {
      base: 'bg-gray-100 text-gray-900 hover:bg-gray-200 focus:ring-gray-500',
      disabled: 'bg-gray-100 text-gray-400 cursor-not-allowed',
    },
    outline: {
      base: 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 focus:ring-blue-500',
      disabled: 'border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed',
    },
    ghost: {
      base: 'text-gray-700 hover:bg-gray-100 focus:ring-gray-500',
      disabled: 'text-gray-400 cursor-not-allowed',
    },
  },
  card: {
    base: 'bg-white border border-gray-200 rounded-lg shadow-sm',
    hover: 'hover:shadow-md transition-shadow duration-200',
    interactive: 'hover:shadow-md hover:-translate-y-1 transition-all duration-200 cursor-pointer',
  },
  input: {
    base: 'w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500',
    error: 'border-red-300 focus:ring-red-500 focus:border-red-500',
    disabled: 'bg-gray-50 text-gray-500 cursor-not-allowed',
  },
  badge: {
    success: 'bg-green-100 text-green-800 border-green-200',
    warning: 'bg-orange-100 text-orange-800 border-orange-200',
    error: 'bg-red-100 text-red-800 border-red-200',
    info: 'bg-blue-100 text-blue-800 border-blue-200',
    neutral: 'bg-gray-100 text-gray-800 border-gray-200',
  },
};

// Layout Constants
export const layoutConstants = {
  header: {
    height: '4rem', // 64px
    padding: '1rem', // 16px
  },
  sidebar: {
    width: '16rem', // 256px
    collapsedWidth: '4rem', // 64px
  },
  content: {
    maxWidth: '7xl', // 1280px
    padding: '1.5rem', // 24px
  },
  card: {
    padding: '1.5rem', // 24px
    gap: '1.5rem', // 24px
  },
  section: {
    gap: '2rem', // 32px
    marginBottom: '2rem', // 32px
  },
};

// Utility Functions
export const getVariantClasses = (variant: string, component: string) => {
  const variants = componentVariants[component as keyof typeof componentVariants];
  if (!variants) return '';
  const variantObj = variants[variant as keyof typeof variants];
  return (variantObj as any)?.base || '';
};

export const getSpacing = (size: keyof typeof designSystem.spacing) => {
  return designSystem.spacing[size];
};

export const getColor = (color: string, shade: number = 500) => {
  const colorPath = color.split('.');
  let colorObj = designSystem.colors as any;
  
  for (const path of colorPath) {
    colorObj = colorObj[path];
  }
  
  return colorObj?.[shade] || colorObj?.[500] || '#000000';
};
