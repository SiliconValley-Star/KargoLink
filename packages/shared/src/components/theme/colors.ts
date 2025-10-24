// CargoLink Brand Colors - Cross Platform Theme System
export const colors = {
  // Primary CargoLink Brand
  primary: {
    50: '#eff6ff',
    100: '#dbeafe',
    200: '#bfdbfe',
    300: '#93c5fd',
    400: '#60a5fa',
    500: '#0066ff', // CargoLink Electric Blue
    600: '#0056d6',
    700: '#0048b7',
    800: '#003d96',
    900: '#003375',
  },
  
  // Success Green
  success: {
    50: '#ecfdf5',
    100: '#d1fae5',
    200: '#a7f3d0',
    300: '#6ee7b7',
    400: '#34d399',
    500: '#10b981', // CargoLink Emerald
    600: '#059669',
    700: '#047857',
    800: '#065f46',
    900: '#064e3b',
  },
  
  // Warning & Alert
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
  
  // Error Red
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
  
  // Neutral Grays
  neutral: {
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
  
  // Dark Theme Colors
  dark: {
    background: '#0f172a',
    surface: '#1e293b',
    card: '#334155',
    border: '#475569',
    text: '#f1f5f9',
    textSecondary: '#94a3b8',
  },
  
  // Light Theme Colors
  light: {
    background: '#ffffff',
    surface: '#f8fafc',
    card: '#ffffff',
    border: '#e2e8f0',
    text: '#0f172a',
    textSecondary: '#64748b',
  }
} as const;

export type ColorScale = typeof colors.primary;
export type Colors = typeof colors;